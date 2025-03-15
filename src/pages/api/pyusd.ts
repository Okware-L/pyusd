import { BigQuery } from '@google-cloud/bigquery';
import { NextApiRequest, NextApiResponse } from 'next';

const bigquery = new BigQuery();

export interface DailyPyUSDTransfers {
  block_date: string;
  inflows: number;
  outflows: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `
      WITH
        pyusd_transfers AS (
          SELECT
            SAFE_CAST(tt.quantity AS NUMERIC) AS amount,
            tt.from_address,
            tt.to_address,
            tt.transaction_hash,
            DATE(tt.block_timestamp) AS block_date
          FROM
            \`bigquery-public-data.goog_blockchain_ethereum_mainnet_us.token_transfers\` tt
          WHERE
            tt.token_address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8')
            AND DATE(tt.block_timestamp) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            AND CURRENT_DATE()
        ),
        daily_transfers AS (
          SELECT
            block_date,
            SUM(CASE WHEN to_address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8') THEN amount ELSE 0 END) / POWER(10, 6) AS inflows,
            SUM(CASE WHEN from_address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8') THEN amount ELSE 0 END) / POWER(10, 6) AS outflows
          FROM
            pyusd_transfers
          GROUP BY
            block_date
          ORDER BY
            block_date DESC
        )
      SELECT
        block_date,
        inflows,
        outflows
      FROM
        daily_transfers;
    `;

    const [rows] = await bigquery.query(query);

    if (!rows || rows.length === 0) {
      console.warn('No data returned from BigQuery');
      return res.status(404).json({ error: 'No data found' });
    }

    res.status(200).json(rows as DailyPyUSDTransfers[]);
  } catch (error: any) {
    console.error('Error fetching PYUSD transfers:', error?.message || error);
    res.status(500).json({ error: 'Failed to fetch PYUSD transfers', details: error?.message || error });
  }
}