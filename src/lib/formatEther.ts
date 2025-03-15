import { formatUnits, parseUnits } from "viem";

/**
 * Converts Wei to PYUSD (assuming PYUSD follows 18 decimal places like ETH).
 * @param value - The value in Wei (as string or bigint).
 * @returns The formatted value in PYUSD.
 */
export function formatEther(value: bigint | string): string {
  try {
    return formatUnits(BigInt(value), 18); // Convert from 18 decimal places
  } catch (error) {
    console.error("Error formatting Ether:", error);
    return "0";
  }
}

/**
 * Converts PYUSD to Wei.
 * @param value - The value in PYUSD.
 * @returns The value in Wei (as bigint).
 */
export function parseEther(value: string): bigint {
  try {
    return parseUnits(value, 18); // Convert back to Wei
  } catch (error) {
    console.error("Error parsing Ether:", error);
    return BigInt(0);
  }
}
