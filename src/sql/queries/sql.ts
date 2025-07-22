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
  FROM '${namespace}-GameMetadataUpdate'
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
    conditions.push(`o.owner_address = "${owner}"`);
  }

  if (gameAddresses && gameAddresses.length > 0) {
    conditions.push(
      `gr.contract_address IN (${gameAddresses.map((address) => `'${address}'`).join(',')})`
    );
  }

  if (tokenIds && tokenIds.length > 0) {
    conditions.push(`o.id IN (${tokenIds.map((id) => `'${id}'`).join(',')})`);
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
    tm.lifecycle_end,
    tm.lifecycle_start,
    minted_at,
    minted_by,
    mr.minter_address as minted_by_address,
    o.owner,
    tm.settings_id,
    soulbound,
    completed_all_objectives,
    o.token_id,
    pn.player_name,
    t.metadata,
    tc.context_data as context,
    sd.settings_data as settings_data,
    COALESCE(s.score, 0) as score,
    COALESCE(GROUP_CONCAT(DISTINCT tobj.objective_id), '') as objective_ids,
    COALESCE(GROUP_CONCAT(DISTINCT od.objective_data), '') as objectives_data,
    tr.renderer_address as renderer,
    tcu.client_url as client_url,
    -- GameMetadata fields
    gm.id as game_metadata_id,
    gm.contract_address as game_metadata_contract_address,
    gm.name as game_metadata_name,
    gm.description as game_metadata_description,
    gm.developer as game_metadata_developer,
    gm.publisher as game_metadata_publisher,
    gm.genre as game_metadata_genre,
    gm.image as game_metadata_image,
    gm.client_url as game_metadata_client_url,
    gm.renderer_address as game_metadata_renderer_address
  FROM '${namespace}-TokenMetadataUpdate' tm
  LEFT JOIN '${namespace}-OwnersUpdate' o ON o.token_id = tm.id
  LEFT JOIN '${namespace}-GameRegistryUpdate' gr on gr.id = tm.game_id
  LEFT JOIN '${namespace}-TokenScoreUpdate' s on s.id = tm.id
  LEFT JOIN '${namespace}-TokenPlayerNameUpdate' pn on pn.id = tm.id
  LEFT JOIN '${namespace}-TokenContextUpdate' tc on tc.id = tm.id
  LEFT JOIN '${namespace}-SettingsCreated' sd on sd.settings_id = tm.settings_id
  LEFT JOIN '${namespace}-ObjectiveUpdate' tobj ON tobj.token_id = tm.id
  LEFT JOIN '${namespace}-ObjectiveCreated' od ON od.objective_id = tobj.objective_id
  LEFT JOIN '${namespace}-GameMetadataUpdate' gm on gm.id = tm.game_id
  LEFT JOIN '${namespace}-TokenRendererUpdate' tr on tr.id = tm.id
  LEFT JOIN '${namespace}-TokenClientUrlUpdate' tcu on tcu.id = tm.id
  LEFT JOIN '${namespace}-MinterRegistryUpdate' mr on mr.id = tm.minted_by
  LEFT JOIN tokens t ON SUBSTR(t.token_id, INSTR(t.token_id, ':') + 1) = tm.id
  ${whereClause}
  GROUP BY 
    tm.id
  LIMIT ${limit}
  OFFSET ${offset}
  `;
};

interface GameSettingsQueryParams {
  namespace: string;
  gameAddresses?: string[];
  settingsIds?: number[];
  limit?: number;
  offset?: number;
}

export const gameSettingsQuery = ({
  namespace,
  gameAddresses,
  settingsIds,
  limit = 100,
  offset = 0,
}: GameSettingsQueryParams) => {
  let query = `
  SELECT *
  FROM '${namespace}-SettingsCreated' sd
  LEFT JOIN '${namespace}-GameRegistryUpdate' gr on gr.contract_address = sd.game_address
  LEFT JOIN '${namespace}-GameMetadataUpdate' gm on gm.id = gr.id
  `;

  const conditions = [];

  if (gameAddresses && gameAddresses.length > 0) {
    const addressList = gameAddresses.map((addr) => `'${addr}'`).join(', ');
    conditions.push(`gr.contract_address IN (${addressList})`);
  }

  if (settingsIds && settingsIds.length > 0) {
    const idList = settingsIds.map((id) => `'${id}'`).join(', ');
    conditions.push(`sd.settings_id IN (${idList})`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
};

interface ObjectivesQueryParams {
  namespace: string;
  gameAddresses?: string[];
  objectiveIds?: number[];
  limit?: number;
  offset?: number;
}

export const objectivesQuery = ({
  namespace,
  gameAddresses,
  objectiveIds,
  limit = 100,
  offset = 0,
}: ObjectivesQueryParams) => {
  let query = `
  SELECT *
  FROM '${namespace}-ObjectiveCreated' od
  LEFT JOIN '${namespace}-GameRegistryUpdate' gr on gr.contract_address = od.game_address
  LEFT JOIN '${namespace}-GameMetadataUpdate' gm on gm.id = gr.id
  `;

  const conditions = [];

  if (gameAddresses && gameAddresses.length > 0) {
    const addressList = gameAddresses.map((addr) => `'${addr}'`).join(', ');
    conditions.push(`gr.contract_address IN (${addressList})`);
  }

  if (objectiveIds && objectiveIds.length > 0) {
    const idList = objectiveIds.map((id) => `'${id}'`).join(', ');
    conditions.push(`od.objective_id IN (${idList})`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  return query;
};
