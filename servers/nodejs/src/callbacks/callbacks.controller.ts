import { Body, Controller, Headers, Post } from '@nestjs/common';
import { appConfig } from '../config';
import { verifySignature } from '../cidi/cidi-signature';
import { OrderPaidCallback, TournamentScoreCallback } from '../cidi/cidi.types';

@Controller('callbacks')
export class CallbacksController {
  private readonly paidGameOrderNos = new Set<string>();
  private readonly tournamentReportIds = new Set<string>();

  @Post('order-paid')
  receiveOrderPaid(
    @Body() body: OrderPaidCallback,
    @Headers('x-timestamp') timestamp?: string,
    @Headers('x-nonce') nonce?: string,
    @Headers('x-signature') signature?: string
  ) {
    if (!appConfig.cidi.callbackSecret) {
      return {
        code: 1002,
        message: 'callback secret is not configured'
      };
    }

    if (!timestamp || !nonce || !signature) {
      return {
        code: 1003,
        message: 'missing callback signature headers'
      };
    }

    const valid = verifySignature(body, timestamp, nonce, signature, appConfig.cidi.callbackSecret);

    if (!valid) {
      return {
        code: 1004,
        message: 'invalid callback signature'
      };
    }

    if (this.paidGameOrderNos.has(body.gameOrderNo)) {
      return {
        code: 0,
        message: 'duplicate callback ignored'
      };
    }

    this.paidGameOrderNos.add(body.gameOrderNo);

    return {
      code: 0,
      message: 'success'
    };
  }

  @Post('tournament-score')
  receiveTournamentScore(@Body() body: TournamentScoreCallback) {
    if (this.tournamentReportIds.has(body.reportId)) {
      return {
        code: 0,
        message: 'duplicate callback ignored'
      };
    }

    this.tournamentReportIds.add(body.reportId);

    return {
      code: 0,
      message: 'success'
    };
  }
}
