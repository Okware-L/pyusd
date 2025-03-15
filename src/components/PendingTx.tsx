import { useEffect, useState } from "react";
import { getPendingTransactions } from "@/lib/rpc";
import { client } from "@/lib/client";

export default function PendingTx() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTxs() {
      try {
        setLoading(true);
        
        // Get the latest block number from Viem
        const latestBlockNumber = await client.getBlockNumber();

        // Fetch pending transactions using trace_block
        const traces = (await getPendingTransactions(latestBlockNumber)) ?? [];
if (!Array.isArray(traces)) {
  setTxs([]);
  return;
}
setTxs(traces);
 // Ensure it's always an array
      } catch (err) {
        setError("Failed to fetch transactions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTxs();
  }, []);

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-2">Pending Transactions</h2>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <ul>
          {txs.length > 0 ? (
            txs.slice(0, 10).map((tx, index) => (
              <li key={index} className="text-sm">
                {tx.transactionHash ?? "Unknown TX"} - {tx.action?.callType ?? "N/A"}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No pending transactions found.</p>
          )}
        </ul>
      )}
    </div>
  );
}
