export const miniGamesQuery = (limit: number, offset: number) => `
  SELECT namespace 
  FROM models 
  WHERE name = 'GameMetadata'
  LIMIT ${limit}
  OFFSET ${offset}
`;

export const gameDataQuery = (gameNamespaces: string[]) => {
  return gameNamespaces
    .map((gameNamespace) => `SELECT * FROM "${gameNamespace}-GameMetadata"`)
    .join('\nUNION ALL\n');
};

export const ownedGamesQuery = (
  address: string,
  gameAddresses: string[],
  limit: number,
  offset: number
) => {
  return `
  SELECT    
    tb.contract_address,
    tb.account_address,
    SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) AS token_id,
    t.metadata
  FROM token_balances tb
  LEFT JOIN tokens t ON tb.token_id = t.id
  WHERE (tb.account_address = "${address}" AND tb.contract_address IN (${gameAddresses
    .map((address) => `"${address}"`)
    .join(',')}));
`;
};

interface GameScoresQueryParams {
  gameAddress: string;
  gameNamespace: string;
  gameScoreModel: string;
  gameScoreAttribute: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}

export const gameScoresQuery = ({
  gameAddress,
  gameNamespace,
  gameScoreModel,
  gameScoreAttribute,
  gameIds,
  limit = 100,
  offset = 0,
}: GameScoresQueryParams) => {
  return `
    SELECT 
    COALESCE(s.${gameScoreAttribute}, 0) as score,
    m.player_name,
    m."lifecycle.mint",
    t2.metadata,
    '${gameAddress}' || ':' || s.game_id as token_balance_id,
    t.account_address
    FROM'${gameNamespace}-${gameScoreModel}' s 
    LEFT JOIN '${gameNamespace}-TokenMetadata' m 
      ON s.game_id = m.token_id
    LEFT JOIN token_balances t 
      ON token_balance_id = t.token_id
    LEFT JOIN tokens t2 ON t.token_id = t2.id
    ${gameIds ? `WHERE s.game_id IN (${gameIds.map((id) => `"${id}"`).join(',')})` : ''}
    ORDER BY s.${gameScoreAttribute} DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};
