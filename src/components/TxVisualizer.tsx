// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { getPendingTransactions, getTransactionTrace, listenToNewTransactions } from "@/lib/rpc";
// import { client } from "@/lib/client";

// type Transaction = {
//   hash: `0x${string}`;
//   status: "pending" | "confirmed";
//   gasUsed?: number;
// };

// // Get dynamic color based on gas price
// const getColor = (gas: number) => {
//   if (gas < 100000) return "bg-green-400";
//   if (gas < 500000) return "bg-orange-400";
//   return "bg-red-500";
// };

// // Get dynamic size based on gas used
// const getSize = (gas: number) => {
//   return Math.min(40 + gas / 10000, 80); // Limits max size to 80px
// };

// export default function TxVisualizer() {
//   const [txs, setTxs] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch Pending Transactions
//   useEffect(() => {
//     async function fetchTransactions() {
//       setLoading(true);
//       try {
//         const latestBlockNumber = await client.getBlockNumber();
//         const traces = await getPendingTransactions(latestBlockNumber);
//         if (!Array.isArray(traces)) return;

//         const newTxs = traces
//           .filter((trace: any) => trace.transactionHash?.startsWith("0x"))
//           .map((trace: any) => ({
//             hash: trace.transactionHash as `0x${string}`,
//             status: "pending" as const,
//           }));

//         // Keep only the last 15 transactions
//         setTxs((prevTxs) => [...newTxs, ...prevTxs].slice(0, 15));
//       } catch (error) {
//         console.error("Failed to fetch transactions", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTransactions();
//     const interval = setInterval(fetchTransactions, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // Live WebSocket Updates
//   useEffect(() => {
//     const unsubscribe = listenToNewTransactions((newTx) => {
//       setTxs((prevTxs) => [newTx, ...prevTxs].slice(0, 15));
//     });

//     return unsubscribe;
//   }, []);

//   // Check if Transactions are Confirmed
//   useEffect(() => {
//     async function checkTransactionStatus() {
//       const updatedTxs: Transaction[] = await Promise.all(
//         txs.map(async (tx): Promise<Transaction> => {
//           if (tx.status === "confirmed") return tx;
//           const trace = await getTransactionTrace(tx.hash);

//           return trace
//             ? { ...tx, status: "confirmed" as const, gasUsed: trace.gasUsed }
//             : tx;
//         })
//       );

//       setTxs(() => [...updatedTxs].slice(0, 15)); // ✅ No more `prevTxs`
//     }

//     if (txs.length > 0) {
//       const interval = setInterval(checkTransactionStatus, 5000);
//       return () => clearInterval(interval);
//     }
//   }, [txs]);

//   return (
//     <div className="p-4 bg-white shadow-lg rounded-lg">
//       <h2 className="text-xl font-bold mb-2">Transaction Visualization</h2>

//       {loading && <p className="text-gray-500">Loading transactions...</p>}

//       <div className="flex space-x-4">
//         {/* PENDING TRANSACTIONS */}
//         <div className="w-1/2">
//           <h3 className="text-lg font-semibold">Pending Transactions</h3>
//           <div className="flex flex-wrap gap-2 relative h-64">
//             {txs
//               .filter((tx) => tx.status === "pending")
//               .map((tx) => (
//                 <motion.div
//                   key={tx.hash}
//                   className={`rounded-full absolute ${getColor(tx.gasUsed || 0)}`}
//                   style={{
//                     width: getSize(tx.gasUsed || 0),
//                     height: getSize(tx.gasUsed || 0),
//                   }}
//                   initial={{ x: Math.random() * 200, y: Math.random() * 200 }}
//                   animate={{ x: [Math.random() * 100, Math.random() * -100, Math.random() * 100], y: [Math.random() * 100, Math.random() * -100, Math.random() * 100] }}
//                   transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
//                   title={tx.hash}
//                 />
//               ))}
//           </div>
//         </div>

//         {/* CONFIRMED TRANSACTIONS */}
//         <div className="w-1/2">
//           <h3 className="text-lg font-semibold">Confirmed Transactions</h3>
//           <div className="flex flex-wrap gap-2 relative h-64">
//             {txs
//               .filter((tx) => tx.status === "confirmed")
//               .map((tx) => (
//                 <motion.div
//                   key={tx.hash}
//                   className={`rounded-full absolute ${getColor(tx.gasUsed || 0)}`}
//                   style={{
//                     width: getSize(tx.gasUsed || 0),
//                     height: getSize(tx.gasUsed || 0),
//                   }}
//                   initial={{ x: Math.random() * 200, y: Math.random() * 200 }}
//                   animate={{ x: [Math.random() * 100, Math.random() * -100, Math.random() * 100], y: [Math.random() * 100, Math.random() * -100, Math.random() * 100] }}
//                   transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
//                   title={`${tx.hash} - Gas Used: ${tx.gasUsed}`}
//                 />
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
