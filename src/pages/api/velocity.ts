import { NextApiRequest, NextApiResponse } from "next";
import { parseAbiItem } from "viem";
import { BigQuery } from "@google-cloud/bigquery";
import { client } from "../../lib/client";

// PYUSD Token Contract Address
const PYUSD_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";

// ERC-20 Transfer Event
const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

// BigQuery Config
const bigquery = new BigQuery();
const DATASET_ID = "pyusd";
const TABLE_ID = "two";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Fetching latest block number...");
    const latestBlock = await client.getBlockNumber();
    console.log("Latest Block:", latestBlock);

    console.log(`Fetching logs from block ${latestBlock - 10000n} to ${latestBlock}...`);
    const logs = await client.getLogs({
      address: PYUSD_ADDRESS,
      event: TRANSFER_EVENT,
      fromBlock: latestBlock - 5n,
      toBlock: latestBlock,
    });
    console.log("Fetched Logs:", logs.length, "transactions");

    // Process Transactions
    let totalTransferred = BigInt(0);
    const uniqueHolders = new Set<string>();

    logs.forEach((log) => {
      const value = log.args?.value ?? BigInt(0);
      totalTransferred += value;

      if (log.args?.from) uniqueHolders.add(log.args.from);
      if (log.args?.to) uniqueHolders.add(log.args.to);
    });

    console.log("Total PYUSD Transferred:", totalTransferred.toString());
    console.log("Unique Holders:", uniqueHolders.size);

    // Fetch Total Supply
    console.log("Fetching PYUSD total supply...");
    const totalSupply = (await client.readContract({
      address: PYUSD_ADDRESS,
      abi: [{
        type: "function",
        stateMutability: "view",
        outputs: [{ type: "uint256" }],
        name: "totalSupply",
        inputs: [],
      }],
      functionName: "totalSupply",
    })) as BigInt;
    console.log("Total Supply:", totalSupply.toString());

    // Convert Values to Float
    const totalTransferredFloat = Number(totalTransferred) / 1e18;
    const totalSupplyFloat = Number(totalSupply) / 1e18;
    const velocity = totalTransferredFloat / totalSupplyFloat;
    const activeHolders = uniqueHolders.size;

    console.log("Final Calculated Velocity:", velocity);
    console.log("Final Active Holders:", activeHolders);

    // Insert Data into BigQuery
    const rows = [
      {
        timestamp: new Date().toISOString(),
        total_transferred: totalTransferredFloat,
        total_supply: totalSupplyFloat,
        velocity,
        active_holders: activeHolders,
      },
    ];

    console.log("Inserting data into BigQuery...");
    await bigquery.dataset(DATASET_ID).table(TABLE_ID).insert(rows);
    console.log("Data inserted successfully!");

    res.status(200).json({ velocity, activeHolders });
  } catch (error: any) {
    console.error("Error fetching velocity data:", error?.message || error);
    res.status(500).json({ error: "Failed to fetch velocity data", details: error?.message || error });
  }
}
