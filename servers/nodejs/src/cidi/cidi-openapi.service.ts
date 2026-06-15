import { HttpException, Injectable } from '@nestjs/common';
import { appConfig } from '../config';
import { createNonce, generateSignature, nowInSeconds, SignableParams } from './cidi-signature';
import { CidiResponse, CreateOrderRequest, OrderResponse, VerifyTempTokenResponse } from './cidi.types';

type HttpMethod = 'GET' | 'POST';

interface OpenApiRequestOptions {
  query?: SignableParams;
  body?: SignableParams;
  signed?: boolean;
}

@Injectable()
export class CidiOpenApiService {
  async verifyTempToken(tempToken: string): Promise<CidiResponse<VerifyTempTokenResponse>> {
    return this.request('GET', '/openapi/user/verify', {
      query: { tempToken }
    });
  }

  async queryBalance(gameToken: string): Promise<CidiResponse> {
    return this.request('GET', '/openapi/coin/balance', {
      query: { gameToken }
    });
  }

  async createOrder(payload: CreateOrderRequest): Promise<CidiResponse<OrderResponse>> {
    return this.request('POST', '/openapi/order/create', {
      body: payload
    });
  }

  async queryOrder(orderNo: string): Promise<CidiResponse<OrderResponse>> {
    return this.request('GET', `/openapi/order/${encodeURIComponent(orderNo)}`, {
      query: {}
    });
  }

  async queryOrderByGameOrderNo(gameOrderNo: string): Promise<CidiResponse<OrderResponse>> {
    return this.request('GET', '/openapi/order/by-game-order', {
      query: { gameOrderNo }
    });
  }

  async queryOrderRecords(query: SignableParams): Promise<CidiResponse> {
    return this.request('GET', '/openapi/order/records', {
      query
    });
  }

  async reportMedal(payload: SignableParams): Promise<CidiResponse> {
    return this.request('POST', '/openapi/game/medal/report', {
      body: payload
    });
  }

  async queryMedalOwnership(query: SignableParams): Promise<CidiResponse> {
    return this.request('GET', '/openapi/game/medal/ownership', {
      query
    });
  }

  async reportTournamentScore(payload: SignableParams): Promise<CidiResponse> {
    return this.request('POST', '/openapi/tournament/score', {
      body: payload
    });
  }

  async reportGameTask(payload: SignableParams): Promise<CidiResponse> {
    return this.request('POST', '/openapi/game/task/report', {
      body: payload
    });
  }

  async queryGameTaskResult(query: SignableParams): Promise<CidiResponse> {
    return this.request('GET', '/openapi/game/task/result', {
      query
    });
  }

  async queryReport(reportId: string): Promise<CidiResponse> {
    return this.request('GET', '/openapi/report/query', {
      query: { reportId }
    });
  }

  private async request<T = unknown>(
    method: HttpMethod,
    path: string,
    options: OpenApiRequestOptions = {}
  ): Promise<CidiResponse<T>> {
    const query = removeEmptyValues(options.query ?? {});
    const body = removeEmptyValues(options.body ?? {});
    const signed = options.signed ?? true;
    const url = new URL(`${appConfig.cidi.baseUrl}${path}`);

    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (signed) {
      const timestamp = nowInSeconds();
      const nonce = createNonce();
      const signParams = method === 'GET' ? query : body;

      headers['X-Api-Key'] = appConfig.cidi.apiKey;
      headers['X-Timestamp'] = String(timestamp);
      headers['X-Nonce'] = nonce;
      headers['X-Signature'] = generateSignature(signParams, timestamp, nonce, appConfig.cidi.apiSecret);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    const parsed = parseJson(text);

    if (!response.ok) {
      throw new HttpException(
        {
          message: 'CiDi OpenAPI request failed',
          statusCode: response.status,
          response: parsed ?? text
        },
        response.status
      );
    }

    return parsed as CidiResponse<T>;
  }
}

function removeEmptyValues(params: SignableParams): SignableParams {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
  );
}

function parseJson(text: string): unknown {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
