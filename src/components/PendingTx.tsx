import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPendingTransactions, getTransactionTrace } from "@/lib/rpc";
import { client } from "@/lib/client";
import {formatEther} from "../lib/formatEther"

// Transaction Type
interface Transaction {
  hash: `0x${string}`;
  status: "pending" | "confirmed";
  from?: string;
  to?: string;
  gasUsed?: number;
  value?: number;
  timestamp?: number;
}

// Gas Heatmap Color
const getGasColor = (gas: number) => {
  if (gas < 100000) return "bg-green-500";
  if (gas < 500000) return "bg-orange-500";
  return "bg-red-500";
};

export default function PendingTx() {
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const latestBlockNumber = await client.getBlockNumber();
        const traces = await getPendingTransactions(latestBlockNumber);
        if (!Array.isArray(traces) || traces.length === 0) return;

        const pendingTxs = traces
          .filter((trace: any) => trace.transactionHash?.startsWith("0x"))
          .map((trace: any) => ({
            hash: trace.transactionHash as `0x${string}`,
            status: "pending" as const,
            from: trace.action?.from,
            to: trace.action?.to,
            value: parseFloat(formatEther(trace.action?.value || "0")), // Convert from Wei to PYUSD
            timestamp: Date.now(),
          }));

        if (pendingTxs.length > 0) {
          setCurrentTx(pendingTxs[0]); // Show one transaction at a time
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    }

    fetchTransaction();
    const interval = setInterval(fetchTransaction, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentTx) return;

    const checkStatus = async () => {
      const trace = await getTransactionTrace(currentTx.hash);
      if (trace) {
        setCurrentTx((prevTx) =>
          prevTx
            ? { ...prevTx, status: "confirmed", gasUsed: trace.gasUsed }
            : null
        );
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [currentTx]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Transaction Status</h2>
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg">
        {currentTx ? (
          <motion.div
            key={currentTx.hash}
            className={`p-4 rounded-xl text-white text-center ${
              currentTx.status === "confirmed"
                ? getGasColor(currentTx.gasUsed || 0)
                : "bg-blue-500"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm">{currentTx.hash}</p>
            <p className="text-xs">From: {currentTx.from ?? "N/A"}</p>
            <p className="text-xs">To: {currentTx.to ?? "N/A"}</p>
            <p className="text-xs font-bold">
              Value: {currentTx.value?.toFixed(2)} PYUSD
            </p>
            {currentTx.status === "confirmed" && (
              <p className="text-xs font-bold">Gas: {(currentTx.gasUsed ?? 0) / 1e9} Gwei</p>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-400">No transactions available</p>
        )}
      </div>
    </div>
  );
}
