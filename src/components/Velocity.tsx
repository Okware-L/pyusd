import { useState, useEffect } from "react";

const Velocity = () => {
  const [velocity, setVelocity] = useState<number | null>(null);
  const [activeHolders, setActiveHolders] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVelocity = async () => {
      try {
        const response = await fetch("/api/velocity");
        if (!response.ok) {
          throw new Error("Failed to fetch velocity data");
        }
        const data = await response.json();
        setVelocity(data.velocity);
        setActiveHolders(data.activeHolders);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVelocity();
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">PYUSD Velocity & Holders</h2>

      {loading && <p className="text-gray-600 text-center mt-4">Loading data...</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 text-center">
          <p className="text-xl text-gray-700">
            🔄 <strong>Velocity:</strong> {velocity?.toFixed(6)}
          </p>
          <p className="text-xl text-gray-700 mt-2">
            👥 <strong>Active Holders:</strong> {activeHolders}
          </p>
        </div>
      )}
    </div>
  );
};

export default Velocity;
