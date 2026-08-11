import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardCheck, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

const StockCountPage = () => {
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [warehouseName, setWarehouseName] = useState('Central Store');
  const [systemQty, setSystemQty] = useState(100);
  const [physicalQty, setPhysicalQty] = useState(92); // -8 variance test
  const [reason, setReason] = useState('Damaged box discovered during audit');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await axios.get('/api/v1/stock-counts');
      setCounts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateCount = async (e) => {
    e.preventDefault();
    try {
      const prodRes = await axios.get('/api/v1/products');
      if (!prodRes.data.data.length) return alert('No products available');
      const prod = prodRes.data.data[0];

      const sys = Number(systemQty);
      const phys = Number(physicalQty);
      const variance = phys - sys;

      await axios.post('/api/v1/stock-counts', {
        warehouseName,
        totalSystemQty: sys,
        totalPhysicalQty: phys,
        totalVarianceQty: variance,
        items: [
          {
            productId: prod._id,
            productName: prod.name,
            batchNumber: 'BAT-PAR-2026A',
            systemQty: sys,
            physicalQty: phys,
            varianceQty: variance,
            reason
          }
        ]
      });

      alert('Physical Stock Audit Session Created!');
      setShowModal(false);
      fetchCounts();
    } catch (err) {
      alert('Error creating stock count: ' + err.message);
    }
  };

  const handlePostVariance = async (id) => {
    if (!confirm('Approve and post variance adjustments to ledger? System balances will be updated.')) return;
    try {
      await axios.post(`/api/v1/stock-counts/${id}/post-variance`);
      alert('Stock Variance Posted to Inventory Ledger!');
      fetchCounts();
    } catch (err) {
      alert('Error posting variance: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><ClipboardCheck color="var(--emerald)" /> Physical Stock Count & Variance Audit</h1>
          <p className="page-subtitle">Freeze scope inventory count sessions, physical counts, variance audit and ledger adjustments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-emerald">
          <Plus size={18} /> New Stock Audit Session
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Count # & Date</th>
                <th>Store Warehouse</th>
                <th>System Qty</th>
                <th>Physical Qty</th>
                <th>Variance (Audit)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {counts.map(sc => (
                <tr key={sc._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{sc.countNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conducted By: {sc.conductedBy}</div>
                  </td>
                  <td><strong>{sc.warehouseName}</strong></td>
                  <td>{sc.totalSystemQty} units</td>
                  <td><strong>{sc.totalPhysicalQty} units</strong></td>
                  <td>
                    <span style={{ fontWeight: 800, color: sc.totalVarianceQty < 0 ? 'var(--rose)' : (sc.totalVarianceQty > 0 ? '#34d399' : 'var(--text-main)') }}>
                      {sc.totalVarianceQty > 0 ? `+${sc.totalVarianceQty}` : sc.totalVarianceQty} units
                    </span>
                  </td>
                  <td><StatusBadge status={sc.status} /></td>
                  <td>
                    {sc.status === 'IN_PROGRESS' || sc.status === 'SUBMITTED' ? (
                      <button onClick={() => handlePostVariance(sc._id)} className="btn btn-emerald btn-sm">
                        <CheckCircle2 size={14} /> Approve & Post Variance
                      </button>
                    ) : (
                      <span className="badge badge-emerald">Posted to Ledger</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Count Session Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Physical Inventory Count Session">
        <form onSubmit={handleCreateCount}>
          <div className="form-group">
            <label className="form-label">Warehouse Store Scope</label>
            <input type="text" className="form-input" value={warehouseName} onChange={e => setWarehouseName(e.target.value)} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">System Expected Quantity</label>
              <input type="number" required className="form-input" value={systemQty} onChange={e => setSystemQty(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Actual Physical Counted Qty</label>
              <input type="number" required className="form-input" value={physicalQty} onChange={e => setPhysicalQty(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Variance Justification / Audit Reason</label>
            <input type="text" className="form-input" value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Physical Count</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockCountPage;
