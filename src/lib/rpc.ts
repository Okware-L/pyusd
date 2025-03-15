import { client } from "./client";

export const getPendingTransactions = async (blockNumber: bigint) => {
  return await client.transport.request({
    method: "trace_block",
    params: [`0x${blockNumber.toString(16)}`], // Convert to hex
  });
};


// Check transaction execution trace
export const getTransactionTrace = async (txHash: `0x${string}`) => {
    try {
      return await client.transport.request({
        method: "trace_transaction",
        params: [txHash]
      });
    } catch (error) {
      console.error("Error tracing transaction:", error);
      return null;
    }
  };
