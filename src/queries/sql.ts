export const miniGamesQuery = (limit: number, offset: number) => `
  SELECT namespace 
  FROM models 
  WHERE name = 'GameMetadata' AND namespace != 'ds_v1_1_4'
  LIMIT ${limit}
  OFFSET ${offset}
`;

export const metaGamesQuery = (limit: number, offset: number) => `
  SELECT namespace 
  FROM models 
  WHERE name = 'MetaGameMetadata'
  LIMIT ${limit}
  OFFSET ${offset}
`;

export const gameDataQuery = (gameNamespaces: string[], gameAddresses?: string[]) => {
  // If no game addresses are provided, return all results
  if (!gameAddresses || gameAddresses.length === 0) {
    return gameNamespaces
      .map((gameNamespace) => `SELECT * FROM "${gameNamespace}-GameMetadata"`)
      .join('\nUNION ALL\n');
  }

  // Format the addresses for SQL IN clause
  const formattedAddresses = gameAddresses.map((address) => `'${address}'`).join(', ');

  // Return only results where contract_address is in the provided list
  return gameNamespaces
    .map(
      (gameNamespace) =>
        `SELECT * FROM "${gameNamespace}-GameMetadata" WHERE contract_address IN (${formattedAddresses})`
    )
    .join('\nUNION ALL\n');
};

export const ownedGamesQuery = (
  address: string,
  gameAddresses: string[],
  metagame?: {
    namespace: string;
    model: string;
    attribute: string;
    key: string;
  },
  limit: number = 100,
  offset: number = 0
) => {
  // Check if metagame object exists and has all required properties
  const includeMetagameJoin = !!(
    metagame &&
    metagame.namespace &&
    metagame.model &&
    metagame.attribute &&
    metagame.key
  );

  // Format game addresses for SQL
  const formattedAddresses = gameAddresses.map((address) => `"${address}"`).join(',');

  // Base query with token balances and tokens join
  let query = `
  SELECT    
    tb.contract_address,
    tb.account_address,
    SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) AS token_id,
    t.metadata`;

  // Add metagame attribute to select if needed
  if (includeMetagameJoin) {
    query += `,
    mg.${metagame.attribute} AS metagame_data`;
  }

  query += `
  FROM token_balances tb
  LEFT JOIN tokens t ON tb.token_id = t.id`;

  // Add metagame join if needed
  if (includeMetagameJoin) {
    const metagameTable = `"${metagame.namespace}-${metagame.model}"`;
    const joinCondition = `mg.${metagame.key} = token_id`;

    query += `
  LEFT JOIN ${metagameTable} mg ON ${joinCondition}`;
  }

  // Add where clause
  query += `
  WHERE (tb.account_address = "${address}" AND tb.contract_address IN (${formattedAddresses}))`;

  // Add order by, limit and offset
  query += `
  ORDER BY token_id DESC
  LIMIT ${limit || 100}
  OFFSET ${offset || 0}`;

  return query;
};

interface GameScoresQueryParams {
  gameAddress: string;
  gameNamespace: string;
  gameScoreModel: string;
  gameScoreAttribute: string;
  gameScoreKey?: string;
  gameIds?: string[];
  limit?: number;
  offset?: number;
}

export const gameScoresQuery = ({
  gameAddress,
  gameNamespace,
  gameScoreModel,
  gameScoreAttribute,
  gameScoreKey = 'game_id',
  gameIds,
  limit = 100,
  offset = 0,
}: GameScoresQueryParams) => {
  return `
    SELECT 
    COALESCE(s.${gameScoreAttribute}, 0) as score,
    m.player_name,
    m."lifecycle.mint",
    m."lifecycle.start.some",
    m."lifecycle.end.some",
    t2.metadata,
    '${gameAddress}' || ':' || s.game_id as token_balance_id,
    m.token_id,
    t.account_address
    FROM'${gameNamespace}-${gameScoreModel}' s 
    LEFT JOIN '${gameNamespace}-TokenMetadata' m 
      ON s.${gameScoreKey} = m.token_id
    LEFT JOIN token_balances t 
      ON token_balance_id = t.token_id
    LEFT JOIN tokens t2 ON t.token_id = t2.id
    ${gameIds ? `WHERE s.${gameScoreKey} IN (${gameIds.map((id) => `"${id}"`).join(',')})` : ''}
    ORDER BY s.${gameScoreAttribute} DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

export const gameScoresKeyQuery = (gameNamespace: string, gameScoreModel: string) => {
  return `
    SELECT name 
    FROM pragma_table_info('${gameNamespace}-${gameScoreModel}') 
    WHERE name NOT LIKE 'internal%' 
    ORDER BY cid 
    LIMIT 1;
  `;
};

export const metagameInfoQuery = (
  metagameNamespace: string,
  metagameModel: string,
  metagameAttribute: string,
  gameIdKey: string,
  gameIds?: string[],
  limit?: number,
  offset?: number
) => {
  return `
    SELECT 
      ${gameIdKey} as game_id,
      ${metagameAttribute} as metagame_attribute,
    FROM '${metagameNamespace}-${metagameModel}'
    ${gameIds ? `WHERE s.${gameIdKey} IN (${gameIds.map((id) => `"${id}"`).join(',')})` : ''}
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

export const eternumQuestQuery = (
  eternumNamespace: string,
  questTileIds: string[],
  limit?: number,
  offset?: number
) => {
  return `
    SELECT *
    FROM '${eternumNamespace}-QuestTile' q
    ${questTileIds ? `WHERE q.id IN (${questTileIds.map((id) => `"${id}"`).join(',')})` : ''}
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

interface OwnedGamesWithScoresParams {
  address: string; // User wallet address
  gameAddress: string; // Game contract address
  gameScoreInfo: {
    gameNamespace: string;
    gameScoreModel: string;
    gameScoreAttribute: string;
    gameScoreKey: string;
  };
  metagame?: {
    // Optional metagame info
    namespace: string;
    model: string;
    attribute: string;
    key: string;
    attributeFilters?: number[];
  };
  limit?: number;
  offset?: number;
}

export const ownedGamesWithScoresQuery = ({
  address,
  gameAddress,
  gameScoreInfo,
  metagame,
  limit = 100,
  offset = 0,
}: OwnedGamesWithScoresParams) => {
  // Check if metagame object exists and has all required properties
  const includeMetagameJoin = !!(
    metagame &&
    metagame.namespace &&
    metagame.model &&
    metagame.attribute &&
    metagame.key
  );

  // Format game addresses for SQL
  const formattedAddresses = `"${gameAddress}"`;

  // Extract game score info
  const { gameNamespace, gameScoreModel, gameScoreAttribute, gameScoreKey } = gameScoreInfo;

  // Build the query
  let query = `
  SELECT
    tb.contract_address,
    tb.account_address,
    SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) AS token_id,
    t.metadata,
    COALESCE(s.${gameScoreAttribute}, 0) as score,
    m.player_name,
    m."lifecycle.mint",
    m."lifecycle.start.some",
    m."lifecycle.end.some"`;

  // Add metagame attribute to select if needed
  if (includeMetagameJoin) {
    query += `,
    mg.${metagame.attribute} AS metagame_data`;
  }

  query += `
  FROM token_balances tb
  LEFT JOIN tokens t ON tb.token_id = t.id
  LEFT JOIN '${gameNamespace}-${gameScoreModel}' s 
    ON SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) = s.${gameScoreKey}
  LEFT JOIN '${gameNamespace}-TokenMetadata' m 
    ON SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1) = m.token_id`;

  // Add metagame join if needed
  if (includeMetagameJoin) {
    const metagameTable = `"${metagame.namespace}-${metagame.model}"`;
    const joinCondition = `mg.${metagame.key} = SUBSTR(tb.token_id, INSTR(tb.token_id, ':') + 1)`;

    query += `
  LEFT JOIN ${metagameTable} mg ON ${joinCondition}`;
  }

  // Add where clause
  query += `
  WHERE (tb.account_address = "${address}" AND tb.contract_address IN (${formattedAddresses}))`;

  if (metagame?.attributeFilters) {
    query += ` AND mg.${metagame.attribute} IN (${metagame.attributeFilters.map((id) => `"${id}"`).join(',')})`;
  }

  // Add order by, limit and offset
  query += `
  ORDER BY score DESC, token_id DESC
  LIMIT ${limit || 100}
  OFFSET ${offset || 0}`;

  return query;
};
