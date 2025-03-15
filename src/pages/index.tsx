import CirculatingSupply from "../components/CirculatingSupply";
import AnalyticsChart from "@/components/Analytics";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import PendingTx from "@/components/PendingTx";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">PYUSD Analytics Dashboard</h1>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section: Supply & Charts */}
        <div className="space-y-6">
          <CirculatingSupply />
          <AnalyticsChart />
        </div>

        {/* Right Section: Pending Transactions */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transaction Status</h2>
          <PendingTx />
        </div>
      </div>
    </div>
  );
}
