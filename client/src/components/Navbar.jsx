import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Bell, Search, QrCode, User, ChevronDown, Activity } from 'lucide-react';
import BarcodeScannerModal from './BarcodeScannerModal';

const Navbar = () => {
  const { user, activeRole, switchRole, rolesList } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 40
      }}>
        {/* Search & Scanner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
          <div style={{
            position: 'relative',
            width: '100%'
          }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products, SKU, GRN, indents or barcode..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontSize: '0.85rem' }}
            />
            <button
              onClick={() => setShowScanner(true)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Scan Barcode / QR"
            >
              <QrCode size={18} />
            </button>
          </div>
        </div>

        {/* Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Hospital Live Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Activity size={16} color="#34d399" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399' }}>SCEC Main Hospital</span>
          </div>

          {/* Notifications */}
          <button style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--rose)'
            }} />
          </button>

          {/* Role Simulator Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#a5b4fc',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              <Shield size={16} />
              <span>Role: {activeRole.replace('_', ' ')}</span>
              <ChevronDown size={14} />
            </button>

            {showRoleDropdown && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                background: '#1e293b',
                border: '1px solid var(--border-card)',
                borderRadius: '10px',
                padding: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Simulate User Role
                </div>
                {rolesList.map(r => (
                  <div
                    key={r.code}
                    onClick={() => {
                      switchRole(r.code);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: activeRole === r.code ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: activeRole === r.code ? '#a5b4fc' : 'var(--text-main)',
                      marginBottom: '2px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              SJ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.fullName}</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{user.department}</span>
            </div>
          </div>
        </div>
      </header>

      {showScanner && <BarcodeScannerModal onClose={() => setShowScanner(false)} />}
    </>
  );
};

export default Navbar;
