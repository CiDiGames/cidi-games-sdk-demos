export interface CidiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
}

export interface VerifyTempTokenResponse {
  openId: string;
  gameToken: string;
}

export interface CreateOrderRequest {
  gameToken: string;
  gameOrderNo: string;
  amount: number;
  description?: string;
  metadata?: string;
  callback_url?: string;
}

export interface OrderResponse {
  orderNo: string;
  gameOrderNo: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | string;
  paymentUrl?: string;
  expireTime?: number;
  createTime?: number;
  paidTime?: number;
  openId?: string;
}

export interface OrderPaidCallback {
  event: 'order.paid';
  orderNo: string;
  gameOrderNo: string;
  amount: number;
  metadata?: string;
}

export interface TournamentScoreCallback {
  event: 'tournament.score.result';
  reportId: string;
  score: string;
  result: 'SUCCESS' | 'FAILED' | string;
  resultCode: string;
  resultMessage: string;
  processedAt: number;
}
