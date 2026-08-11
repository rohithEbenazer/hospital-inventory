import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '650px' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth,
        background: '#1e293b',
        border: '1px solid var(--border-card)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
