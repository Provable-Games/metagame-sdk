export const formatScores = (scores: any, scoreAttribute: string) => {
  const processedScores = [];
  for (const entity of scores) {
    for (const entityId in entity) {
      // Skip non-entity ID properties
      if (!entityId.startsWith('0x')) continue;

      const questData = entity[entityId];
      if (!questData || !questData['s1_eternum-Quest']) continue;

      const quest = questData['s1_eternum-Quest'];

      processedScores.push({
        entityId,
        completed: quest.completed?.value === true,
        explorer_id: Number(quest.explorer_id?.value),
        game_address: quest.game_address?.value,
        game_token_id: quest.game_token_id?.value, // Keep hex string or convert as needed
        quest_tile_id: Number(quest.quest_tile_id?.value),
        // Add any other fields you need
      });
    }
  }
};
