import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPendingTransactions, getTransactionTrace, listenToNewTransactions } from "@/lib/rpc";
import { client } from "@/lib/client";

// Transaction type
type Transaction = {
  hash: `0x${string}`;
  status: "pending" | "confirmed";
  gasUsed?: number;
  from?: string;
  to?: string;
  timestamp?: number;
};

// Get color-coded tags for gas usage
const getColor = (gas: number) => {
  if (gas < 100000) return "bg-green-500 text-white";
  if (gas < 500000) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
};

// Convert gas used to Gwei
const toGwei = (gas: number) => (gas / 1e9).toFixed(3);

export default function TxVisualizer() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const latestBlockNumber = await client.getBlockNumber();
        const traces = await getPendingTransactions(latestBlockNumber);
        if (!Array.isArray(traces)) return;

        const newTxs = traces.map((trace: any) => ({
          hash: trace.transactionHash as `0x${string}`,
          status: "pending" as const,
          from: trace.from,
          to: trace.to,
          timestamp: Date.now(),
        }));

        setTxs((prevTxs) => [...newTxs, ...prevTxs].slice(0, 15));
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = listenToNewTransactions((newTx) => {
      setTxs((prevTxs) => [newTx, ...prevTxs].slice(0, 15));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function checkTransactionStatus() {
      const updatedTxs: Transaction[] = await Promise.all(
        txs.map(async (tx): Promise<Transaction> => {
          if (tx.status === "confirmed") return tx;
          const trace = await getTransactionTrace(tx.hash);
          return trace
            ? { ...tx, status: "confirmed" as const, gasUsed: trace.gasUsed }
            : tx;
        })
      );

      setTxs(() => [...updatedTxs].slice(0, 15));
    }

    if (txs.length > 0) {
      const interval = setInterval(checkTransactionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [txs]);

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Transaction Visualization</h2>
      {loading && <p className="text-gray-500">Loading transactions...</p>}
      <div className="flex space-x-6">
        {/* PENDING TRANSACTIONS */}
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2">Pending Transactions</h3>
          <div className="space-y-3 overflow-y-auto max-h-72">
            {txs.filter((tx) => tx.status === "pending").map((tx) => (
              <motion.div
                key={tx.hash}
                className="p-4 border rounded-lg shadow-lg bg-gray-50 hover:shadow-2xl transition"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-mono text-xs text-gray-700">{tx.hash}</p>
                <p className="text-sm text-gray-500">From: {tx.from}</p>
                <p className="text-sm text-gray-500">To: {tx.to}</p>
                <span className="text-sm text-gray-400">Pending...</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CONFIRMED TRANSACTIONS */}
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2">Confirmed Transactions</h3>
          <div className="space-y-3 overflow-y-auto max-h-72">
            {txs.filter((tx) => tx.status === "confirmed").map((tx) => (
              <motion.div
                key={tx.hash}
                className="p-4 border rounded-lg shadow-lg bg-white hover:shadow-2xl transition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-mono text-xs text-gray-700">{tx.hash}</p>
                <p className="text-sm text-gray-500">From: {tx.from}</p>
                <p className="text-sm text-gray-500">To: {tx.to}</p>
                <p className="text-sm text-gray-500">Gas: <span className={`px-2 py-1 rounded ${getColor(tx.gasUsed || 0)}`}>{toGwei(tx.gasUsed || 0)} Gwei</span></p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
