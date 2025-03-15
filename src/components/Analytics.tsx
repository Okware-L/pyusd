import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DailyPyUSDTransfers {
  block_date: string;
  inflows: number;
  outflows: number;
}

export default function AnalyticsChart() {
  const [data, setData] = useState<DailyPyUSDTransfers[]>([]);

  // Fetch data from BigQuery API
  useEffect(() => {
    fetch("/api/bq")
      .then((res) => res.json())
      .then((data: DailyPyUSDTransfers[]) => {
        // Format block_date for better readability
        const transformedData = data.map((row) => ({
          ...row,
          block_date: new Date(row.block_date).toLocaleDateString(),
        }));
        setData(transformedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PYUSD Daily Inflows and Outflows (Last 30 Days)</h1>

      {/* Bar Chart */}
      <div className="mb-8" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="block_date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inflows" fill="#8884d8" name="Inflows" />
            <Bar dataKey="outflows" fill="#82ca9d" name="Outflows" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}