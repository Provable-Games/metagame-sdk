import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useSwitchChain } from '@starknet-react/core';
import { stringToFelt } from 'metagame-sdk';
import { displayAddress } from '../lib/index';
import { useNetwork } from '@starknet-react/core';

// Chain ID enum
enum ChainId {
  KATANA_LOCAL = 'KATANA_LOCAL',
  WP_GAME_COMPONENTS = 'WP_GAME_COMPONENTS',
  SN_MAIN = 'SN_MAIN',
  SN_SEPOLIA = 'SN_SEPOLIA',
}

const Navigation: React.FC = () => {
  const { address, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId: ChainId.SN_MAIN,
    },
  });
  const location = useLocation();
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const { chain } = useNetwork();

  console.log('Current chain:', chain);

  // Network configurations
  const networks = [
    {
      id: ChainId.SN_SEPOLIA,
      name: 'Sepolia',
      chainId: stringToFelt(ChainId.SN_SEPOLIA).toString(),
    },
    {
      id: ChainId.SN_MAIN,
      name: 'Mainnet',
      chainId: stringToFelt(ChainId.SN_MAIN).toString(),
    },
    {
      id: ChainId.WP_GAME_COMPONENTS,
      name: 'Slot',
      chainId: stringToFelt(ChainId.WP_GAME_COMPONENTS).toString(),
    },
  ];

  const currentNetwork =
    networks.find((network) => network.chainId === chainId?.toString()) || networks[2]; // Default to Slot

  // Set default network to Slot on component mount
  useEffect(() => {
    const slotChainId = stringToFelt(ChainId.WP_GAME_COMPONENTS).toString();
    if (!chainId || chainId.toString() !== slotChainId) {
      switchChainAsync({
        chainId: slotChainId,
      });
    }
  }, []); // Remove dependencies to avoid errors

  const handleNetworkChange = async (network: (typeof networks)[0]) => {
    try {
      await switchChainAsync({
        chainId: network.chainId,
      });
      setIsNetworkDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Mini Games' },
    { path: '/games', label: 'All Games' },
    { path: '/paginated-games', label: 'Paginated Games' },
    { path: '/settings', label: 'Settings' },
    { path: '/objectives', label: 'Objectives' },
  ];

  console.log(connectors, address);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Metagame SDK Demo</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Network Dropdown and Connect Wallet */}
          <div className="flex items-center space-x-4">
            {/* Network Dropdown */}
            {address && (
              <div className="relative">
                <button
                  onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <span>{chain?.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isNetworkDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isNetworkDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      {networks.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => handleNetworkChange(network)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            currentNetwork.id === network.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {network.name}
                          {currentNetwork.id === network.id && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connect Wallet Button */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={() => {
                if (!address) {
                  connect({ connector: connectors[0] });
                }
              }}
            >
              {address ? displayAddress(address) : 'Connect Wallet'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Network Dropdown */}
          {address && (
            <div className="px-2 pb-3 border-t border-gray-200">
              <div className="mt-3">
                <button
                  onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span>Network: {chain?.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isNetworkDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isNetworkDropdownOpen && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="py-1">
                      {networks.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => handleNetworkChange(network)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            currentNetwork.id === network.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          {network.name}
                          {currentNetwork.id === network.id && (
                            <span className="ml-2 text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isNetworkDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsNetworkDropdownOpen(false)} />
      )}
    </nav>
  );
};

export default Navigation;
