// import { BigQuery } from '@google-cloud/bigquery';
// import { NextApiRequest, NextApiResponse } from 'next';

// const bigquery = new BigQuery(
// );

// export interface PyUSDTransfer {
//   block_date: string;
//   from_address: string;
//   to_address: string;
//   transaction_hash: string;
//   pyusd_transferred: number;
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const query = `
//       WITH
//         pyusd_transfers AS (
//           SELECT
//             SAFE_CAST(tt.quantity AS NUMERIC) AS amount,
//             tt.from_address,
//             tt.to_address,
//             tt.transaction_hash,
//             DATE(tt.block_timestamp) AS block_date
//           FROM
//             \`bigquery-public-data.goog_blockchain_ethereum_mainnet_us.token_transfers\` tt
//           WHERE
//             tt.address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8')
//             AND DATE(tt.block_timestamp) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
//             AND CURRENT_DATE()
//         )
//       SELECT
//         block_date,
//         from_address,
//         to_address,
//         transaction_hash,
//         SUM(amount) / POWER(10, 6) AS pyusd_transferred
//       FROM
//         pyusd_transfers
//       GROUP BY
//         block_date, from_address, to_address, transaction_hash
//       ORDER BY
//         block_date DESC;
//     `;

//   //  console.log('Executing BigQuery query:', query); // Log the query

//     const [rows] = await bigquery.query(query);

//    // console.log('BigQuery response:', rows); // Log the response

//     if (!rows || rows.length === 0) {
//       console.warn('No data returned from BigQuery');
//       return res.status(404).json({ error: 'No data found' });
//     }

//         // Convert block_date from BigQueryDate object to string
//      const formattedRows = rows.map((row: any) => ({
//           ...row,
//           block_date: row.block_date.value, // Extract the string value
//         }));

//     res.status(200).json(formattedRows as PyUSDTransfer[]);
//   } 
//  catch (error: any) {
//   console.error('Error fetching PYUSD transfers:', error?.message || error);
//   res.status(500).json({ error: 'Failed to fetch PYUSD transfers', details: error?.message || error });
// }

// }