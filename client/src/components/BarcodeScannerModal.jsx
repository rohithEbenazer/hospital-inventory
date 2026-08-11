import React, { useState } from 'react';
import Modal from './Modal';
import { QrCode, Scan, CheckCircle2 } from 'lucide-react';

const BarcodeScannerModal = ({ onClose }) => {
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const sampleBarcodes = [
    { code: '890123450001', name: 'Paracetamol 500mg Tablets', batch: 'BAT-PAR-2026A', expiry: '2026-09-30' },
    { code: '890123450002', name: 'Amoxicillin & Clavulanate 625mg', batch: 'BAT-AMO-901', expiry: '2028-03-15' },
    { code: '890123450003', name: 'Disposable Syringe 5ml', batch: 'BAT-SYR-441', expiry: '2027-11-20' }
  ];

  const handleSimulateScan = (item) => {
    setScannedCode(item.code);
    setScanResult(item);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Barcode & QR Code Scanner Simulator">
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        {/* Animated Scanner Visual */}
        <div style={{
          width: '240px',
          height: '160px',
          margin: '0 auto 1.5rem auto',
          border: '2px dashed var(--primary)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Scan size={48} color="var(--primary)" style={{ animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Align barcode within frame</span>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--emerald)',
            boxShadow: '0 0 10px var(--emerald)',
            animation: 'scanLine 2s infinite linear'
          }} />
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Select a sample barcode to simulate physical hardware scanner input:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {sampleBarcodes.map(b => (
            <button
              key={b.code}
              onClick={() => handleSimulateScan(b)}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', width: '100%', fontSize: '0.85rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={16} color="var(--cyan)" />
                <span>{b.name}</span>
              </div>
              <span style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{b.code}</span>
            </button>
          ))}
        </div>

        {scanResult && (
          <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Barcode Verified</span>
            </div>
            <div style={{ fontSize: '0.85rem' }}><strong>Product:</strong> {scanResult.name}</div>
            <div style={{ fontSize: '0.85rem' }}><strong>Batch #:</strong> {scanResult.batch}</div>
            <div style={{ fontSize: '0.85rem' }}><strong>Expiry:</strong> {scanResult.expiry}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BarcodeScannerModal;
