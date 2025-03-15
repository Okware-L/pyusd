export type HexString = `0x${string}`;
export type Address = HexString;

export type TransactionStatus = "pending" | "confirmed" | "failed";

export interface TransactionBase {
  hash: HexString;
  from?: Address;
  to?: Address;
  gasUsed?: number;
  timestamp?: number;
}

export interface PendingTransaction extends TransactionBase {
  status: "pending";
}

export interface ConfirmedTransaction extends TransactionBase {
  status: "confirmed";
  gasUsed: number;
}

export interface FailedTransaction extends TransactionBase {
  status: "failed";
  error: string;
}

export type Transaction = PendingTransaction | ConfirmedTransaction | FailedTransaction;

export interface TraceResponse {
  transactionHash?: string;
  action?: {
    from?: string;
    to?: string;
  };
}

export interface TransactionTrace {
  result?: {
    gasUsed?: number;
  };
}