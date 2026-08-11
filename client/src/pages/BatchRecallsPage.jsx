import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { AlertOctagon, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';

const BatchRecallsPage = () => {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [productName, setProductName] = useState('Paracetamol 500mg Tablets');
  const [batchNumber, setBatchNumber] = useState('BAT-PAR-2026A');
  const [reason, setReason] = useState('Regulatory Directive - Contamination Alert #882');

  useEffect(() => {
    fetchRecalls();
  }, []);

  const fetchRecalls = async () => {
    try {
      const res = await axios.get('/api/v1/recalls');
      setRecalls(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleIssueRecall = async (e) => {
    e.preventDefault();
    try {
      const prodRes = await axios.get('/api/v1/products');
      if (!prodRes.data.data.length) return alert('No products available');
      const prod = prodRes.data.data[0];

      const res = await axios.post('/api/v1/recalls', {
        productId: prod._id,
        productName,
        batchNumber,
        reason
      });

      alert(res.data.message);
      setShowModal(false);
      fetchRecalls();
    } catch (err) {
      alert('Error issuing recall: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><AlertOctagon color="var(--rose)" /> Batch Recall & Stock Quarantine Management</h1>
          <p className="page-subtitle">Immediate batch locking, FEFO exclusion, regulatory recall notices, and usage tracing</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-danger">
          <Plus size={18} /> Issue Batch Recall Notice
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Recall # & Date</th>
                <th>Target Product</th>
                <th>Recalled Batch Number</th>
                <th>Recall Reason / Directive</th>
                <th>Quarantined Units</th>
                <th>Status</th>
                <th>FEFO Lock Status</th>
              </tr>
            </thead>
            <tbody>
              {recalls.map(rc => (
                <tr key={rc._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#f87171', fontFamily: 'monospace' }}>{rc.recallNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(rc.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td><strong>{rc.productName}</strong></td>
                  <td><span style={{ fontFamily: 'monospace', color: '#a5b4fc', fontWeight: 700 }}>{rc.batchNumber}</span></td>
                  <td>{rc.reason}</td>
                  <td><strong style={{ color: 'var(--amber)' }}>{rc.quarantinedQty} units</strong></td>
                  <td><StatusBadge status={rc.status} /></td>
                  <td>
                    <span className="badge badge-rose"><ShieldAlert size={12} /> FEFO Bypassed & Locked</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Recall Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Issue Regulatory / Manufacturer Batch Recall">
        <form onSubmit={handleIssueRecall}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Batch Number to Recall & Quarantine</label>
            <input type="text" required className="form-input" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Recall Reason & Regulatory Directive #</label>
            <textarea className="form-textarea" rows="3" value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          <div style={{ background: 'rgba(244,63,94,0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.3)', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#fda4af' }}>
            ⚠️ Submitting this recall will automatically convert all matching batch balances to <strong>QUARANTINED</strong> status and permanently lock them out of the FEFO auto-pick algorithm.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-danger">Execute Batch Recall</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BatchRecallsPage;
