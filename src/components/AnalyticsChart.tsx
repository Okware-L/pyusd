import { useEffect, useState } from "react";

export default function AnalyticsChart() {
  const [data, setData] = useState<any[]>([]);

  // Fetch data from BigQuery API
  useEffect(() => {
    fetch("/api/bq")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">PYUSD Analytics</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Date</th>
            <th className="p-2">From</th>
            <th className="p-2">To</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{row.block_date}</td>
              <td className="p-2">{row.from_address}</td>
              <td className="p-2">{row.to_address}</td>
              <td className="p-2">{row.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}