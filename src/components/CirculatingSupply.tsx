import { useEffect, useState } from 'react';

const CirculatingSupply = () => {
  const [circulatingSupply, setCirculatingSupply] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCirculatingSupply = async () => {
      try {
        const response = await fetch('/api/circulating-supply');
        const data = await response.json();
        if (response.ok) {
          setCirculatingSupply(data.circulatingSupply);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch circulating supply');
      } finally {
        setLoading(false);
      }
    };

    fetchCirculatingSupply();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>PYUSD Circulating Supply</h1>
      <p>{circulatingSupply} PYUSD</p>
    </div>
  );
};

export default CirculatingSupply;