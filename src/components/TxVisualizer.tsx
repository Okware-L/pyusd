import { useEffect, useState } from "react";
import { getPendingTransactions, getTransactionTrace } from "@/lib/rpc";
import { client } from "@/lib/client";

type Transaction = {
  hash: `0x${string}`;
  status: "pending" | "confirmed";
};

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

        const newTxs = traces
          .filter((trace: any) => trace.transactionHash?.startsWith("0x"))
          .map((trace: any) => ({
            hash: trace.transactionHash as `0x${string}`,
            status: "pending" as const,
          }));

        // Keep only the last 15 transactions
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
    async function checkTransactionStatus() {
      const updatedTxs = await Promise.all(
        txs.map(async (tx) => {
          if (tx.status === "confirmed") return tx;
          const trace = await getTransactionTrace(tx.hash);
          return trace ? { ...tx, status: "confirmed" as const } : tx;
        })
      );

      setTxs((prevTxs) => [...updatedTxs].slice(0, 15));
    }

    if (txs.length > 0) {
      const interval = setInterval(checkTransactionStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [txs]);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Transaction Visualization</h2>

      {loading && <p className="text-gray-500">Loading transactions...</p>}

      <div className="flex space-x-4">
        <div className="w-1/2">
          <h3 className="text-lg font-semibold">Pending Transactions</h3>
          <div className="flex flex-wrap gap-2">
            {txs
              .filter((tx) => tx.status === "pending")
              .map((tx) => (
                <div
                  key={tx.hash}
                  className="w-10 h-10 bg-yellow-400 rounded-full animate-bounce"
                  title={tx.hash}
                />
              ))}
          </div>
        </div>

        <div className="w-1/2">
          <h3 className="text-lg font-semibold">Confirmed Transactions</h3>
          <div className="flex flex-wrap gap-2">
            {txs
              .filter((tx) => tx.status === "confirmed")
              .map((tx) => (
                <div
                  key={tx.hash}
                  className="w-10 h-10 bg-green-500 rounded-full animate-pulse"
                  title={tx.hash}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
