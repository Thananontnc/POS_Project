import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SalesJournal from './pages/SalesJournal';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<SalesJournal />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
// Router setup
