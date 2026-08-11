import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Lock, Bell, Sliders } from 'lucide-react';

const SettingsPage = () => {
  const { rolesList, activeRole, switchRole } = useAuth();

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title"><Settings color="var(--primary)" /> System Settings & RBAC Permissions</h1>
        <p className="page-subtitle">Configure role-based access control, approval matrix limits, and inventory system preferences</p>
      </div>

      <div className="grid-2">
        {/* Role Matrix */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield color="var(--primary)" size={20} />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rolesList.map(r => (
              <div
                key={r.code}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  background: activeRole === r.code ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: activeRole === r.code ? '1px solid var(--primary)' : '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.name} ({r.code})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
                <button
                  onClick={() => switchRole(r.code)}
                  className={`btn btn-sm ${activeRole === r.code ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {activeRole === r.code ? 'Active Simulator' : 'Switch Role'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Global Inventory Configuration */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders color="var(--emerald)" size={20} />
            <span>Global Inventory System Rules</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Stock Issue Policy Rule</label>
            <select className="form-select" defaultValue="FEFO">
              <option value="FEFO">FEFO (First Expired First Out - Mandatory for Medicines)</option>
              <option value="FIFO">FIFO (First In First Out)</option>
              <option value="LIFO">LIFO (Last In First Out)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Manager Approval Threshold (INR)</label>
            <input type="number" className="form-input" defaultValue="50000" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Purchase Orders & Indents above this amount require Super Admin signoff.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Near Expiry Alert Threshold (Days)</label>
            <input type="number" className="form-input" defaultValue="90" />
          </div>

          <button className="btn btn-emerald" onClick={() => alert('Settings Saved!')}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
