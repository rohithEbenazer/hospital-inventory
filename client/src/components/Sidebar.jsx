import React from 'react';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  FileCheck2, Pill, Stethoscope, BarChart3, Settings, Hospital,
  ArrowLeftRight, ClipboardCheck, AlertOctagon, Cpu, ClipboardList
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Master', icon: Package },
    { id: 'stock', label: 'Stock & FEFO Ledger', icon: BarChart3 },
    { id: 'stores', label: 'Stores & Sub-stores', icon: Warehouse },
    { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
    { id: 'procurement', label: 'Procurement & GRN', icon: ShoppingCart },
    { id: 'indents', label: 'Dept Indents & Approvals', icon: FileCheck2 },
    { id: 'counts', label: 'Physical Stock Counts', icon: ClipboardCheck },
    { id: 'recalls', label: 'Batch Recalls', icon: AlertOctagon },
    { id: 'pharmacy', label: 'Pharmacy & Dispensing', icon: Pill },
    { id: 'assets', label: 'Medical Asset Tracker', icon: Stethoscope },
    { id: 'reports', label: 'Reports & Audits', icon: BarChart3 },
    { id: 'system300', label: '300 Ops & Compliance', icon: Cpu },
    { id: 'ops', label: 'Operations & Shifts', icon: ClipboardList },
    { id: 'clinical', label: 'Clinical Stores & Hub', icon: Stethoscope },
    { id: 'enterprise', label: 'Enterprise Master & Rules', icon: Cpu },
    { id: 'settings', label: 'RBAC & Settings', icon: Settings }
  ];

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid var(--border-card)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Brand Logo */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--border-card)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--emerald), var(--primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <Hospital size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SCEC Health
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Supply Chain System
          </div>
        </div>
      </div>

      {/* Domain Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dark)', padding: '0.5rem 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Inventory Domains
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))' : 'transparent',
                color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '0.25rem',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-card)', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
        <div>SCEC MERN Inventory v1.0-PROD</div>
        <div>Atomic FEFO & RBAC Active</div>
      </div>
    </aside>
  );
};

export default Sidebar;
