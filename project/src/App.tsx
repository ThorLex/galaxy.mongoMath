import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Documentation from './pages/Documentation';
import Examples from './pages/Examples';
import Community from './pages/Community';
import ApiReference from './pages/ApiReference';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/examples" element={<Examples />} />
          <Route path="/community" element={<Community />} />
          <Route path="/api" element={<ApiReference />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;