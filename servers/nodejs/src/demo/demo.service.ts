import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CidiOpenApiService } from '../cidi/cidi-openapi.service';

@Injectable()
export class DemoService {
  constructor(private readonly cidi: CidiOpenApiService) {}

  health() {
    return {
      ok: true,
      service: 'cidi-nodejs-demo',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  verifyTempToken(tempToken: string) {
    return this.cidi.verifyTempToken(tempToken);
  }

  queryBalance(gameToken: string) {
    return this.cidi.queryBalance(gameToken);
  }

  createOrder(body: Record<string, unknown>) {
    const gameOrderNo = readOptionalString(body.gameOrderNo) ?? this.createGameOrderNo();

    return this.cidi.createOrder({
      gameOrderNo,
      gameToken: readRequiredString(body.gameToken, 'gameToken'),
      amount: readRequiredNumber(body.amount, 'amount'),
      description: readOptionalString(body.description),
      metadata: readOptionalString(body.metadata),
      callback_url: readOptionalString(body.callback_url) ?? readOptionalString(body.callbackUrl)
    });
  }

  queryOrder(orderNo: string) {
    return this.cidi.queryOrder(orderNo);
  }

  queryOrderByGameOrderNo(gameOrderNo: string) {
    return this.cidi.queryOrderByGameOrderNo(gameOrderNo);
  }

  queryOrderRecords(query: Record<string, unknown>) {
    return this.cidi.queryOrderRecords(query);
  }

  reportMedal(body: Record<string, unknown>) {
    return this.cidi.reportMedal(body);
  }

  queryMedalOwnership(query: Record<string, unknown>) {
    return this.cidi.queryMedalOwnership(query);
  }

  reportTournamentScore(body: Record<string, unknown>) {
    return this.cidi.reportTournamentScore(body);
  }

  reportGameTask(body: Record<string, unknown>) {
    return this.cidi.reportGameTask(body);
  }

  queryGameTaskResult(query: Record<string, unknown>) {
    return this.cidi.queryGameTaskResult(query);
  }

  queryReport(reportId: string) {
    return this.cidi.queryReport(reportId);
  }

  private createGameOrderNo(): string {
    return `GAME${Date.now()}${randomUUID().replace(/-/g, '').slice(0, 8)}`;
  }
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`${field} is required`);
  }

  return value;
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  return value;
}

function readRequiredNumber(value: unknown, field: string): number {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new BadRequestException(`${field} must be a number`);
  }

  return numberValue;
}
