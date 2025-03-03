import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'


export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_GCP_RPC_URL),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
    interface Register {
      config: typeof config
    }
  }