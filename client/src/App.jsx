import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import StockOverview from './pages/StockOverview';
import StoresPage from './pages/StoresPage';
import ProcurementPage from './pages/ProcurementPage';
import DepartmentIndents from './pages/DepartmentIndents';
import PharmacyPage from './pages/PharmacyPage';
import MedicalAssetsPage from './pages/MedicalAssetsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsPage />;
      case 'stock': return <StockOverview />;
      case 'stores': return <StoresPage />;
      case 'procurement': return <ProcurementPage />;
      case 'indents': return <DepartmentIndents />;
      case 'pharmacy': return <PharmacyPage />;
      case 'assets': return <MedicalAssetsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <div className="app-container">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="main-content">
          <Navbar />
          {renderContent()}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
