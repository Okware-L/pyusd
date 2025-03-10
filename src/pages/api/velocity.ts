import { NextApiRequest, NextApiResponse } from "next";
import { BigQuery } from "@google-cloud/bigquery";
import { client } from "../../lib/client";

// PYUSD Token Contract Address
const PYUSD_ADDRESS = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";

// BigQuery Config
const bigquery = new BigQuery();
const DATASET_ID = "pyusd";
const TABLE_ID = "two";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Fetching latest block...");
    const latestBlock = await client.getBlockNumber();
    console.log("Latest Block:", latestBlock);

    // Fetch traces for the latest block (get all transaction-level details)
    console.log("Fetching transaction traces for block", latestBlock);
    const traces = await client.request({
      method: "trace_block",
      params: [latestBlock.toString()],
    }as any);

    // ✅ Ensure traces is not null or undefined
if (!traces) {
    console.warn(`No traces found for block ${latestBlock}`);
    return res.status(200).json({ velocity: 0, activeHolders: 0 });
  }

  // ✅ Ensure traces is an array before processing
if (!Array.isArray(traces)) {
    console.warn(`Unexpected trace_block response type:`, traces);
    return res.status(200).json({ velocity: 0, activeHolders: 0 });
  }

    console.log("Total Traces:", traces.length);

    let totalTransferred = BigInt(0);
    const uniqueHolders = new Set<string>();

    // Process Traces: Filter PYUSD Transfers
    traces.forEach((trace: any) => {
      if (
        trace.action?.to?.toLowerCase() === PYUSD_ADDRESS.toLowerCase() &&
        trace.action?.value
      ) {
        const value = BigInt(trace.action.value);
        totalTransferred += value;
    
        if (trace.action.from) uniqueHolders.add(trace.action.from);
        if (trace.action.to) uniqueHolders.add(trace.action.to);
      }
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
    })) as bigint;
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
