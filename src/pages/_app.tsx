import "@/styles/globals.css";
import { WagmiProvider } from "wagmi"
import type { AppProps } from "next/app";
import { config } from '../../config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';




const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
    <Component {...pageProps} />
    </RainbowKitProvider>
    </QueryClientProvider>
    </WagmiProvider>
  ) ;
}
