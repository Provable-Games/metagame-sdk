import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect } from '@starknet-react/core';
import { displayAddress } from '../lib/index';

const Navigation: React.FC = () => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Mini Games' },
    { path: '/games', label: 'All Games' },
    { path: '/paginated-games', label: 'Paginated Games' },
    { path: '/settings', label: 'Settings' },
    { path: '/objectives', label: 'Objectives' },
  ];

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

          {/* Connect Wallet Button */}
          <div className="flex items-center">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
