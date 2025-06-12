import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MiniGamesTable from './components/MiniGamesTable';
import GameCards from './components/GameCards';
import PaginatedGamesList from './components/PaginatedGamesList';
import SettingsTable from './components/SettingsTable';
import ObjectivesTable from './components/ObjectivesTable';
import { useSubscribeSettings, useSubscribeObjectives } from 'metagame-sdk/subscriptions';
import './App.css';

function App() {
  const { settings } = useSubscribeSettings({
    gameAddresses: ['0x0342e2e99bedf83a081f9e6905315448e5877dbd15f8491c8d461d65d114b90a'],
    settingsIds: [1],
  });
  const { objectives } = useSubscribeObjectives({
    gameAddresses: ['0x0342e2e99bedf83a081f9e6905315448e5877dbd15f8491c8d461d65d114b90a'],
    objectiveIds: [1],
  });

  console.log(settings);
  console.log(objectives);
  console.log(settings);
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<MiniGamesTable />} />
            <Route path="/games" element={<GameCards />} />
            <Route path="/paginated-games" element={<PaginatedGamesList />} />
            <Route path="/settings" element={<SettingsTable />} />
            <Route path="/objectives" element={<ObjectivesTable />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
