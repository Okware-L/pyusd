// import { useEffect, useState } from 'react';

// export interface PyUSDTransfer {
//   block_date: string;
//   from_address: string;
//   to_address: string;
//   transaction_hash: string;
//   pyusd_transferred: number;
// }

// export default function TokenData() {
//   const [transfers, setTransfers] = useState<PyUSDTransfer[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         const response = await fetch('/api/pyusd');
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         if (data.error) {
//           setError(data.error);
//         } else {
//           setTransfers(data);
//         }
//       } catch (error) {
//         console.error('Error fetching PYUSD transfers:', error);
//         setError('Failed to fetch PYUSD transfers');
//       }
//     }
//     loadData();
//   }, []);

//   return (
//     <div>
//       <h1>PYUSD Transfers (Last 30 Days)</h1>
//       {error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : transfers.length === 0 ? (
//         <p>No data found</p>
//       ) : (
//         <ul>
//           {transfers.map((transfer, index) => (
//             <li key={index}>
//               {transfer.block_date}: {transfer.pyusd_transferred} PYUSD transferred from {transfer.from_address} to {transfer.to_address}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }