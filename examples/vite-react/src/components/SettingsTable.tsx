import React from 'react';
import { useSubscribeSettings } from 'metagame-sdk/subscriptions';
import { displayAddress } from '../lib/index';

const SettingsTable: React.FC = () => {
  const { settings } = useSubscribeSettings({});

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings ID
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
                Settings Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Settings Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(settings).map(([key, setting]: [string, any], index: number) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {key}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.gameMetadata?.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.gameMetadata?.contract_address
                    ? displayAddress(setting.gameMetadata.contract_address)
                    : 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.name || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {setting.description || 'N/A'}
                </td>
                <td className="text-left px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="max-w-xs">
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(setting.data, null, 2)}
                    </pre>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {Object.entries(settings).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No settings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTable;
