import { BigQuery } from '@google-cloud/bigquery';
import { NextApiRequest, NextApiResponse } from 'next';

const bigquery = new BigQuery();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = `
    WITH
      pyusd_balances AS (
        SELECT
          to_address AS address,
          SAFE_CAST(quantity AS NUMERIC) AS amount
        FROM
          bigquery-public-data.goog_blockchain_ethereum_mainnet_us.token_transfers
        WHERE
          address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8') -- PYUSD contract address
          AND to_address != LOWER('0x0000000000000000000000000000000000000000') -- Exclude burn address
        UNION ALL
        SELECT
          from_address AS address,
          -SAFE_CAST(quantity AS NUMERIC) AS amount
        FROM
          bigquery-public-data.goog_blockchain_ethereum_mainnet_us.token_transfers
        WHERE
          address = LOWER('0x6c3ea9036406852006290770BEdFcAbA0e23A0e8') -- PYUSD contract address
          AND from_address != LOWER('0x0000000000000000000000000000000000000000') -- Exclude burn address
      )
    SELECT
      SUM(amount) / POWER(10, 6) AS circulating_supply
    FROM
      pyusd_balances;
  `;


  const [rows] = await bigquery.query(query);

  console.log('BigQuery response:', rows);

  
  try {
    const [rows] = await bigquery.query(query);
    res.status(200).json({ circulatingSupply: rows[0].circulating_supply });
  } catch (error: any) {
    console.error('Error fetching circulating supply:', error?.message || error);
    res.status(500).json({ error: 'Failed to fetch circulating supply', details: error?.message || error  });
  }
}