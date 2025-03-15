import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPendingTransactions, getTransactionTrace, listenToNewTransactions } from "@/lib/rpc";
import { client } from "@/lib/client";

// Transaction Type
interface Transaction {
  hash: `0x${string}`;
  status: "pending" | "confirmed";
  from?: string;
  to?: string;
  gasUsed?: number;
  timestamp?: number;
}

// Get color for gas used
const getColor = (gas: number) => {
  if (gas < 100000) return "text-green-500 bg-green-100";
  if (gas < 500000) return "text-orange-500 bg-orange-100";
  return "text-red-500 bg-red-100";
};

export default function TxVisualizer() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Pending Transactions
  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const latestBlockNumber = await client.getBlockNumber();
        const traces = await getPendingTransactions(latestBlockNumber);
        if (!Array.isArray(traces)) return;

        const newTxs = traces
          .filter((trace: any) => trace.transactionHash?.startsWith("0x"))
          .map((trace: any) => ({
            hash: trace.transactionHash as `0x${string}`,
            status: "pending" as const,
            from: trace.action?.from,
            to: trace.action?.to,
            timestamp: Date.now(),
          }));

        // Insert new transactions at the top
        setTxs((prevTxs) => [...newTxs, ...prevTxs].slice(0, 15));
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Updates
  useEffect(() => {
    const unsubscribe = listenToNewTransactions((newTx) => {
      setTxs((prevTxs) => [newTx, ...prevTxs].slice(0, 15));
    });
    return unsubscribe;
  }, []);

  // Confirm Transactions Gradually
  useEffect(() => {
    async function checkTransactionStatus() {
      const updatedTxs: Transaction[] = await Promise.all(
        txs.map(async (tx): Promise<Transaction> => {
          if (tx.status === "confirmed") return tx;
          const trace = await getTransactionTrace(tx.hash);
          return trace
            ? {
                ...tx,
                status: "confirmed" as const,
                gasUsed: trace.gasUsed,
              }
            : tx;
        })
      );
      setTxs(() => updatedTxs.slice(0, 15));
    }

    if (txs.length > 0) {
      const interval = setInterval(checkTransactionStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [txs]);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Transaction Visualization</h2>
      {loading && <p className="text-gray-500">Loading transactions...</p>}

      <div className="flex space-x-8">
        {/* Pending Transactions */}
        <div className="w-1/2">
          <h3 className="text-lg font-semibold">Pending Transactions</h3>
          <div className="relative h-64 overflow-y-auto border p-2 rounded">
            {txs.filter((tx) => tx.status === "pending").map((tx, index) => (
              <motion.div
                key={tx.hash}
                className={`p-2 border-b shadow-md rounded-lg ${getColor(tx.gasUsed || 0)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="font-mono text-sm">{tx.hash}</div>
                <div className="text-xs">From: {tx.from ?? "N/A"} → To: {tx.to ?? "N/A"}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Confirmed Transactions */}
        <div className="w-1/2">
          <h3 className="text-lg font-semibold">Confirmed Transactions</h3>
          <div className="relative h-64 overflow-y-auto border p-2 rounded">
            {txs.filter((tx) => tx.status === "confirmed").map((tx, index) => (
              <motion.div
                key={tx.hash}
                className={`p-2 border-b shadow-md rounded-lg ${getColor(tx.gasUsed || 0)}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="font-mono text-sm">{tx.hash}</div>
                <div className="text-xs">From: {tx.from ?? "N/A"} → To: {tx.to ?? "N/A"}</div>
                <div className="text-xs font-bold">Gas: {(tx.gasUsed ?? 0) / 1e9} Gwei</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
