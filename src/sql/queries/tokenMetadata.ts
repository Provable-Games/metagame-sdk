import { getMetagameClientSafe } from '../../shared/singleton';
import { indexAddress } from '../../shared';

/**
 * Creates a SQL query to fetch token metadata for multiple token IDs
 * @param tokenIds Array of token IDs (as numbers)
 * @returns SQL query string
 */
export const tokenMetadataQuery = (tokenIds: number[]): string => {
  if (!tokenIds || tokenIds.length === 0) {
    return `SELECT token_id, metadata FROM tokens WHERE 1=0`; // Return empty result
  }

  const client = getMetagameClientSafe();

  const tokenAddress = indexAddress(client?.getTokenAddress() ?? '0x0');

  // Convert token IDs to proper U256 format (64 hex chars)
  const paddedIds = tokenIds
    .map((id) => {
      const hexId = id.toString(16).padStart(64, '0');
      return `"0x${hexId}"`;
    })
    .join(', ');

  return `
    SELECT token_id, metadata 
    FROM tokens
    WHERE contract_address = "${tokenAddress}" AND token_id IN (${paddedIds})
  `;
};

/**
 * Creates a Map for fast token metadata lookup
 * @param tokenMetadataResults Results from tokenMetadataQuery
 * @returns Map with U64 token ID as key and metadata as value
 */
export const createTokenMetadataMap = (tokenMetadataResults: any[]): Map<string, any> => {
  const map = new Map<string, any>();

  if (!tokenMetadataResults || !Array.isArray(tokenMetadataResults)) {
    return map;
  }

  tokenMetadataResults.forEach((result, index) => {
    if (result.token_id && result.metadata) {
      // Extract the numeric value from the U256 token_id
      // Remove quotes and 0x prefix, then parse as BigInt
      const cleanId = result.token_id.replace(/["']/g, '').replace(/^0x/, '');
      const numericId = parseInt(cleanId, 16);

      // Store with the numeric ID as the key for easy lookup
      map.set(numericId.toString(), result.metadata);
    }
  });
  return map;
};
