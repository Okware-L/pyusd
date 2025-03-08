import { useState, useEffect } from 'react';

interface TokenData {
  status: string;
  message: string;
  result: {
    contractAddress: string;
    tokenName: string;
    symbol: string;
    divisor: string;
    tokenType: string;
    totalSupply: string;
    blueCheckmark: string;
    description: string;
    website: string;
    email: string;
    blog: string;
    reddit: string;
    slack: string;
    facebook: string;
    twitter: string;
    github: string;
    telegram: string;
    wechat: string;
    linkedin: string;
    discord: string;
    whitepaper: string;
    tokenPriceUSD: string;
  };
}

interface TokenBalanceData {
  status: string;
  message: string;
  result: string;
}

export default function PyUSDTokenData() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const address = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
  
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        
        // You need to replace 'YOUR_API_KEY' with your actual Etherscan API key
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
        
        if (!apiKey) {
          throw new Error("Etherscan API key is missing");
        }
        
        // Get token info
        const tokenInfoResponse = await fetch(
          `https://api.etherscan.io/api?module=token&action=tokeninfo&contractaddress=${address}&apikey=${apiKey}`
        );
        
        if (!tokenInfoResponse.ok) {
          throw new Error("Failed to fetch token data");
        }
        
        const tokenInfo = await tokenInfoResponse.json();
        setTokenData(tokenInfo);
        
        // Get token balance/supply
        const balanceResponse = await fetch(
          `https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${address}&apikey=${apiKey}`
        );
        
        if (!balanceResponse.ok) {
          throw new Error("Failed to fetch token balance");
        }
        
        const balanceData = await balanceResponse.json();
        setTokenBalance(balanceData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching token data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-xl font-medium">Loading PyUSD token data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-700 text-lg font-medium">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const formatNumber = (value: string) => {
    if (!value) return "N/A";
    
    // Convert from wei to token units if divisor is available
    if (tokenData?.result?.divisor) {
      const divisor = parseInt(tokenData.result.divisor);
      const valueInTokens = parseFloat(value) / Math.pow(10, divisor);
      
      // Format with commas and limited decimal places
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
      }).format(valueInTokens);
    }
    
    return value;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">PyUSD Token Data</h1>
      
      {tokenData && tokenData.result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-3">Basic Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Token Name:</span> {tokenData.result.tokenName}
                </div>
                <div>
                  <span className="font-medium">Symbol:</span> {tokenData.result.symbol}
                </div>
                <div>
                  <span className="font-medium">Contract Address:</span>
                  <div className="text-sm break-all">{address}</div>
                </div>
                <div>
                  <span className="font-medium">Token Type:</span> {tokenData.result.tokenType}
                </div>
                <div>
                  <span className="font-medium">Decimals:</span> {tokenData.result.divisor}
                </div>
                <div>
                  <span className="font-medium">Price (USD):</span> ${tokenData.result.tokenPriceUSD || "N/A"}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-3">Supply Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Total Supply:</span> {formatNumber(tokenData.result.totalSupply || (tokenBalance?.result || ""))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-medium mb-3">Social Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tokenData.result.website && (
                <div>
                  <span className="font-medium">Website:</span> <a href={tokenData.result.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tokenData.result.website}</a>
                </div>
              )}
              {tokenData.result.twitter && (
                <div>
                  <span className="font-medium">Twitter:</span> <a href={tokenData.result.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tokenData.result.twitter}</a>
                </div>
              )}
              {tokenData.result.github && (
                <div>
                  <span className="font-medium">GitHub:</span> <a href={tokenData.result.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tokenData.result.github}</a>
                </div>
              )}
              {tokenData.result.telegram && (
                <div>
                  <span className="font-medium">Telegram:</span> <a href={tokenData.result.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tokenData.result.telegram}</a>
                </div>
              )}
              {tokenData.result.discord && (
                <div>
                  <span className="font-medium">Discord:</span> <a href={tokenData.result.discord} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{tokenData.result.discord}</a>
                </div>
              )}
            </div>
          </div>
          
          {tokenData.result.description && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p>{tokenData.result.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}