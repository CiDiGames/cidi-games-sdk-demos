import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DemoService } from './demo.service';

@Controller()
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Get('health')
  health() {
    return this.demo.health();
  }

  @Post('demo/verify')
  verifyTempToken(@Body('tempToken') tempToken: string) {
    return this.demo.verifyTempToken(tempToken);
  }

  @Get('demo/balance')
  queryBalance(@Query('gameToken') gameToken: string) {
    return this.demo.queryBalance(gameToken);
  }

  @Post('demo/orders')
  createOrder(@Body() body: Record<string, unknown>) {
    return this.demo.createOrder(body);
  }

  @Get('demo/orders/by-game-order/:gameOrderNo')
  queryOrderByGameOrderNo(@Param('gameOrderNo') gameOrderNo: string) {
    return this.demo.queryOrderByGameOrderNo(gameOrderNo);
  }

  @Get('demo/orders/:orderNo')
  queryOrder(@Param('orderNo') orderNo: string) {
    return this.demo.queryOrder(orderNo);
  }

  @Get('demo/order-records')
  queryOrderRecords(@Query() query: Record<string, unknown>) {
    return this.demo.queryOrderRecords(query);
  }

  @Post('demo/test/coin/add')
  addTestCoin(@Body('gameToken') gameToken: string, @Body('amount') amount: number) {
    return this.demo.addTestCoin(gameToken, Number(amount));
  }

  @Post('demo/medal/report')
  reportMedal(@Body() body: Record<string, unknown>) {
    return this.demo.reportMedal(body);
  }

  @Get('demo/medal/ownership')
  queryMedalOwnership(@Query() query: Record<string, unknown>) {
    return this.demo.queryMedalOwnership(query);
  }

  @Post('demo/tournament/score')
  reportTournamentScore(@Body() body: Record<string, unknown>) {
    return this.demo.reportTournamentScore(body);
  }

  @Post('demo/task/report')
  reportGameTask(@Body() body: Record<string, unknown>) {
    return this.demo.reportGameTask(body);
  }

  @Get('demo/task/result')
  queryGameTaskResult(@Query() query: Record<string, unknown>) {
    return this.demo.queryGameTaskResult(query);
  }

  @Get('demo/report/:reportId')
  queryReport(@Param('reportId') reportId: string) {
    return this.demo.queryReport(reportId);
  }
}
