import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import MiniGamesTable from './components/MiniGamesTable';
import GameCards from './components/GameCards';
import PaginatedGamesList from './components/PaginatedGamesList';
import SettingsTable from './components/SettingsTable';
import ObjectivesTable from './components/ObjectivesTable';
import './App.css';

function App() {
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
