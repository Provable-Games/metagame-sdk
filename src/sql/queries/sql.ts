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
    mr.contract_address as minted_by_address,
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
    COALESCE(GROUP_CONCAT(DISTINCT od.data), '') as objectives_data,
    tr.renderer_address as renderer,
    tcu.client_url as client_url,
    -- GameMetadata fields
    gm.id as game_metadata_id,
    gm.contract_address as game_metadata_contract_address,
    gm.creator_token_id as game_metadata_creator_token_id,
    gm.name as game_metadata_name,
    gm.description as game_metadata_description,
    gm.developer as game_metadata_developer,
    gm.publisher as game_metadata_publisher,
    gm.genre as game_metadata_genre,
    gm.image as game_metadata_image,
    gm.color as game_metadata_color
  FROM '${namespace}-Owners' o
  LEFT JOIN '${namespace}-TokenMetadata' tm ON tm.id = o.token_id
  LEFT JOIN '${namespace}-GameRegistry' gr on gr.id = tm.game_id
  LEFT JOIN '${namespace}-ScoreUpdate' s on s.token_id = o.token_id
  LEFT JOIN '${namespace}-TokenPlayerName' pn on pn.id = o.token_id
  LEFT JOIN '${namespace}-TokenContextData' tc on tc.token_id = o.token_id
  LEFT JOIN '${namespace}-SettingsData' sd on sd.settings_id = tm.settings_id
  LEFT JOIN '${namespace}-TokenObjective' tobj ON tobj.id = o.token_id
  LEFT JOIN '${namespace}-ObjectiveData' od ON od.objective_id = tobj.objective_id AND od.game_id = tm.game_id
  LEFT JOIN '${namespace}-GameMetadata' gm on gm.id = tm.game_id
  LEFT JOIN '${namespace}-TokenRenderer' tr on tr.id = o.token_id
  LEFT JOIN '${namespace}-TokenClientUrl' tcu on tcu.id = o.token_id
  LEFT JOIN '${namespace}-MinterRegistryId' mr on mr.id = tm.minted_by
  LEFT JOIN tokens t ON SUBSTR(t.token_id, INSTR(t.token_id, ':') + 1) = o.token_id
  ${whereClause}
  GROUP BY 
    o.token_id
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
  FROM '${namespace}-SettingsData' sd
  LEFT JOIN '${namespace}-GameRegistry' gr on gr.id = sd.game_id
  LEFT JOIN '${namespace}-GameMetadata' gm on gm.id = gr.id
  `;

  const conditions = [];

  if (gameAddresses && gameAddresses.length > 0) {
    const addressList = gameAddresses.map((addr) => `'${addr}'`).join(', ');
    conditions.push(`gr.game_address IN (${addressList})`);
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
  FROM '${namespace}-ObjectiveData' od
  LEFT JOIN '${namespace}-GameRegistry' gr on gr.id = od.game_id
  LEFT JOIN '${namespace}-GameMetadata' gm on gm.id = gr.id
  `;

  const conditions = [];

  if (gameAddresses && gameAddresses.length > 0) {
    const addressList = gameAddresses.map((addr) => `'${addr}'`).join(', ');
    conditions.push(`gr.game_address IN (${addressList})`);
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
