import React from 'react';
import { useSubscribeObjectives } from 'metagame-sdk/subscriptions';
import { displayAddress } from '../lib/index';

const ObjectivesTable: React.FC = () => {
  const { objectives } = useSubscribeObjectives({});

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Objectives</h1>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Objective ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game Address
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Game ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Objective Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(objectives).map(([key, objective]: [string, any], index: number) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.gameMetadata?.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.gameMetadata?.contract_address
                    ? displayAddress(objective.gameMetadata.contract_address)
                    : 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {objective.game_id || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-md">{objective.data || 'N/A'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {Object.entries(objectives).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No objectives found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectivesTable;
