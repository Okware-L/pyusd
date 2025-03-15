import { client } from "./client";

export const getPendingTransactions = async (blockNumber: bigint) => {
  return await client.transport.request({
    method: "trace_block",
    params: [`0x${blockNumber.toString(16)}`], // Convert to hex
  });
};

// Define an expected structure for trace transaction response
type TraceResult = {
    result?: {
      gasUsed?: number;
    };
  };

// Check transaction execution trace
export const getTransactionTrace = async (txHash: `0x${string}`) => {
    try {
      const trace: TraceResult[] = await client.transport.request({
        method: "trace_transaction",
        params: [txHash],
      });
  
      return {
        hash: txHash,
        gasUsed: trace?.[0]?.result?.gasUsed ?? 0, // Safe access
      };
    } catch (error) {
      console.error("Error tracing transaction:", error);
      return null;
    }
  };

// WebSocket to listen for new transactions
// const alchemyWsUrl = "wss://blockchain.googleapis.com/v1/projects/shaped-buttress-452117-k5/locations/asia-east1/endpoints/ethereum-mainnet/rpc?key=AIzaSyC5wn1S-QD2FRepSyrkvxxKoGvH657nrG4";

// export const listenToNewTransactions = (callback: (tx: any) => void) => {
//   const ws = new WebSocket(alchemyWsUrl);

//   ws.onopen = () => {
//     console.log("Connected to Ethereum WebSocket");
//     ws.send(
//       JSON.stringify({
//         jsonrpc: "2.0",
//         id: 1,
//         method: "eth_subscribe",
//         params: ["newPendingTransactions"],
//       })
//     );
//   };

//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     if (data.params) {
//       callback({ hash: data.params.result, status: "pending" });
//     }
//   };

//   return () => ws.close(); // Cleanup WebSocket on unmount
// };