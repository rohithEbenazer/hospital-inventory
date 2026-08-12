import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import StockOverview from './pages/StockOverview';
import StoresPage from './pages/StoresPage';
import StockTransfersPage from './pages/StockTransfersPage';
import ProcurementPage from './pages/ProcurementPage';
import DepartmentIndents from './pages/DepartmentIndents';
import StockCountPage from './pages/StockCountPage';
import BatchRecallsPage from './pages/BatchRecallsPage';
import PharmacyPage from './pages/PharmacyPage';
import MedicalAssetsPage from './pages/MedicalAssetsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import System300Dashboard from './pages/System300Dashboard';
import OperationsHub from './pages/OperationsHub';
import ClinicalHub from './pages/ClinicalHub';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductsPage />;
      case 'stock': return <StockOverview />;
      case 'stores': return <StoresPage />;
      case 'transfers': return <StockTransfersPage />;
      case 'procurement': return <ProcurementPage />;
      case 'indents': return <DepartmentIndents />;
      case 'counts': return <StockCountPage />;
      case 'recalls': return <BatchRecallsPage />;
      case 'pharmacy': return <PharmacyPage />;
      case 'assets': return <MedicalAssetsPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      case 'system300': return <System300Dashboard />;
      case 'ops': return <OperationsHub />;
      case 'clinical': return <ClinicalHub />;
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
