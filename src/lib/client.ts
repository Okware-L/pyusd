import { createPublicClient, http } from 'viem';
import { sepolia, mainnet } from 'viem/chains';

export const client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_GCP_RPC_URL),
});