import { BigQuery } from "@google-cloud/bigquery";
import { parseAbi } from "viem";
import * as dotenv from "dotenv";
import { client } from "./client"

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Initialize BigQuery client
const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
});


// PYUSD token contract address and ABI
const PYUSD_CONTRACT_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"; // Replace with actual PYUSD contract address
const PYUSD_ABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

// Function to stream Ethereum data to BigQuery
async function streamEthereumData() {
  // Fetch latest block number
  const latestBlock = await client.getBlockNumber();

  // Fetch Transfer events for PYUSD token
  const logs = await client.getLogs({
    address: PYUSD_CONTRACT_ADDRESS,
    event: PYUSD_ABI[0],
    fromBlock: latestBlock - 100n, // Fetch last 1000 blocks
    toBlock: latestBlock,
  });

  console.log("Fetched logs:", logs);

  if (logs.length === 0) {
    console.log("No Transfer events found in the specified block range.");
    return;
  }

  // Prepare data for BigQuery
  const rows = await Promise.all(
    logs.map(async (log) => {
      // Fetch block details to get the timestamp
      const block = await client.getBlock({ blockNumber: log.blockNumber });

      return {
        block_date: new Date(Number(block.timestamp) * 1000).toISOString(),
        from_address: log.args.from,
        to_address: log.args.to,
        transaction_hash: log.transactionHash,
        amount: Number(log.args.value) / 1e18, // Convert from wei to PYUSD
      };
    })
  );

  console.log("Prepared rows:", rows);

  // Insert data into BigQuery
  await bigquery
    .dataset(process.env.DATASET_ID!)
    .table(process.env.TABLE_ID!)
    .insert(rows);

  console.log(`Inserted ${rows.length} rows into BigQuery`);
}

// Run the script
streamEthereumData().catch(console.error);