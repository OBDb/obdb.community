// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleComparison from './pages/VehicleComparison';
import Parameters from './pages/Parameters';
import Commands from './pages/Commands';
import VehicleDetail from './pages/VehicleDetail';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/compare" element={<VehicleComparison />} />
            <Route path="/vehicles/:make/:model" element={<VehicleDetail />} />
            <Route path="/vehicles/:make" element={<VehicleDetail />} />
            <Route path="/parameters" element={<Parameters />} />
            <Route path="/commands" element={<Commands />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;