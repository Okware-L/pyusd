import { NextApiRequest, NextApiResponse } from 'next';

import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
});

// GET endpoint to fetch data from BigQuery
export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const query = `
    SELECT *
    FROM \`${process.env.GCP_PROJECT_ID}.${process.env.DATASET_ID}.${process.env.TABLE_ID}\`
    ORDER BY block_date DESC
    LIMIT 100
  `;

  const [rows] = await bigquery.query(query); 
  
  console.log('BigQuery response:', rows);


  try {
    const [rows] = await bigquery.query(query);
    res.status(200).json(rows);
  } catch (error: any) {
    console.error('Error fetching data:', error?.message || error);
    res.status(500).json({ error: 'Failed to fetch data', details: error?.message || error  });
  }

}