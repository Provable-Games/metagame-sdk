export const miniGamesQuery = ({
  namespace,
  gameAddresses,
  limit = 10,
  offset = 0,
}: {
  namespace: string;
  gameAddresses?: string[];
  limit?: number;
  offset?: number;
}) => {
  return `
  SELECT *
  FROM '${namespace}-GameMetadata'
  ${gameAddresses ? `WHERE contract_address IN (${gameAddresses.map((address) => `'${address}'`).join(',')})` : ''}
  LIMIT ${limit}
  OFFSET ${offset}
  `;
};

export const metaGamesQuery = (limit: number, offset: number) => `
  SELECT namespace 
  FROM models 
  WHERE name = 'MetaGameMetadata'
  LIMIT ${limit}
  OFFSET ${offset}
`;

interface GamesQueryParams {
  namespace: string;
  owner?: string;
  gameAddresses?: string[];
  tokenIds?: string[];
  hasContext?: boolean;
  limit?: number;
  offset?: number;
}

export const gamesQuery = ({
  namespace,
  owner,
  gameAddresses,
  tokenIds,
  hasContext,
  limit = 100,
  offset = 0,
}: GamesQueryParams) => {
  // Build WHERE conditions dynamically
  const conditions = [];

  if (owner) {
    conditions.push(`o.owner = "${owner}"`);
  }

  if (gameAddresses && gameAddresses.length > 0) {
    conditions.push(
      `gr.contract_address IN (${gameAddresses.map((address) => `'${address}'`).join(',')})`
    );
  }

  if (tokenIds && tokenIds.length > 0) {
    conditions.push(`o.token_id IN (${tokenIds.map((id) => `'${id}'`).join(',')})`);
  }

  if (hasContext) {
    conditions.push(`tm.has_context = 1`);
  }

  // Create WHERE clause only if there are conditions
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return `
  SELECT
    gr.contract_address, 
    tm.game_id, 
    game_over,
    tm.'lifecycle.end',
    tm.'lifecycle.start',
    minted_at,
    minted_by,
    owner,
    tm.settings_id,
    soulbound,
    completed_all_objectives,
    o.token_id,
    pn.player_name,
    t.metadata,
    tc.data as context,
    sd.data as settings_data,
    COALESCE(s.score, 0) as score,
    COALESCE(GROUP_CONCAT(DISTINCT tobj.objective_id), '') as objective_ids,
    COALESCE(GROUP_CONCAT(DISTINCT od.data), '') as objectives_data
  FROM '${namespace}-Owners' o
  LEFT JOIN '${namespace}-TokenMetadata' tm ON tm.id = o.token_id
  LEFT JOIN '${namespace}-GameRegistry' gr on gr.id = tm.game_id
  LEFT JOIN '${namespace}-ScoreUpdate' s on s.token_id = o.token_id
  LEFT JOIN '${namespace}-TokenPlayerName' pn on pn.id = o.token_id
  LEFT JOIN '${namespace}-TokenContextData' tc on tc.token_id = o.token_id
  LEFT JOIN '${namespace}-SettingsData' sd on sd.settings_id = tm.settings_id
  LEFT JOIN '${namespace}-TokenObjective' tobj ON tobj.id = o.token_id
  LEFT JOIN '${namespace}-ObjectiveData' od ON od.objective_id = tobj.objective_id AND od.game_id = tm.game_id
  LEFT JOIN tokens t ON SUBSTR(t.token_id, INSTR(t.token_id, ':') + 1) = o.token_id
  ${whereClause}
  GROUP BY 
    o.token_id
  LIMIT ${limit}
  OFFSET ${offset}
  `;
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
  WHERE (o.owner = "${address}" AND tb.contract_address IN (${formattedAddresses}))`;

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
  healthAttribute?: string;
  limit?: number;
  offset?: number;
}

export const ownedGamesWithScoresQuery = ({
  address,
  gameAddress,
  gameScoreInfo,
  metagame,
  healthAttribute,
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

  if (healthAttribute) {
    query += `,
    COALESCE(s.${healthAttribute}, 0) as health`;
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

export const gameSettingsQuery = (
  gameNamespace: string,
  gameSettingsModel: string,
  settingsIds?: number[],
  limit?: number,
  offset?: number
) => {
  return `
      SELECT *
      FROM '${gameNamespace}-${gameSettingsModel}'
      ${settingsIds ? `WHERE settings_id IN (${settingsIds.join(',')})` : ''}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
};

export const gameSettingsMetadataQuery = (
  gameNamespaces: string[],
  gameSettingsIds?: Record<string, number[]>,
  limit?: number,
  offset?: number
) => {
  // Create a UNION ALL query for each namespace
  const namespaceQueries = gameNamespaces.map((namespace) => {
    const settingsIds = gameSettingsIds?.[namespace];
    const whereClause = settingsIds ? `WHERE settings_id IN (${settingsIds.join(',')})` : '';

    return `
      SELECT 
        name, 
        description, 
        created_at, 
        created_by, 
        settings_id,
        '${namespace}' as namespace
      FROM '${namespace}-GameSettingsMetadata'
      ${whereClause}
    `;
  });

  // Combine all namespace queries with UNION ALL
  const combinedQuery = namespaceQueries.join('\nUNION ALL\n');

  // Add limit and offset to the final result
  return `
    WITH combined_results AS (
      ${combinedQuery}
    )
    SELECT * FROM combined_results
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};
