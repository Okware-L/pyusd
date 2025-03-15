// import { useEffect, useState } from 'react';
// import { client } from '../lib/client';

// const PYUSD_CONTRACT_ADDRESS = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8'; 

// export default function TransactionFeed() {
//   const [transactions, setTransactions] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       const blockNumber = await client.getBlockNumber();
//       const block = await client.getBlock({
//         blockNumber,
//         includeTransactions: true,
//       });

//       // Filter PYUSD transactions
//       const pyusdTransactions = block.transactions.filter(
//         (tx: any) => tx.to?.toLowerCase() === PYUSD_CONTRACT_ADDRESS.toLowerCase()
//       );

//       setTransactions(pyusdTransactions);
//     };

//     fetchTransactions();
//     const interval = setInterval(fetchTransactions, 1000); 

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="p-4 bg-white shadow rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Real-Time PYUSD Transactions</h2>
//       <div className="space-y-2">
//         {transactions.map((tx, index) => (
//           <div key={index} className="p-2 border-b">
//             <p><strong>Hash:</strong> {tx.hash}</p>
//             <p><strong>From:</strong> {tx.from}</p>
//             <p><strong>Value:</strong> {tx.value.toString()} pyusd</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }