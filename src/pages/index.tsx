import TransactionFeed from '../components/TransactionFeed';
//import TokenData from '../components/TokenData';
import CirculatingSupply from '../components/CirculatingSupply';
import AnalyticsChart from "@/components/AnalyticsChart";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Velocity from "@/components/Velocity";
import PyUSDTokenData from '@/components/PyUSDTokenData';



export default function Home() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">PYUSD Analytics Dashboard</h1>
      <div>
        <ConnectButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TransactionFeed />
        <CirculatingSupply /><Velocity /><PyUSDTokenData />
      </div>
      <AnalyticsChart/>
      
    </div>
  );
}
