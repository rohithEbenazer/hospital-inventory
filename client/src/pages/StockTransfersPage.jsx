import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ArrowLeftRight, Plus, Send, CheckCircle2, Warehouse } from 'lucide-react';

const StockTransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [fromWarehouse, setFromWarehouse] = useState('Central Store');
  const [toWarehouse, setToWarehouse] = useState('ICU Store');
  const [transferQty, setTransferQty] = useState(50);
  const [batchNumber, setBatchNumber] = useState('BAT-PAR-2026A');

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const res = await axios.get('/api/v1/transfers');
      setTransfers(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      const prodRes = await axios.get('/api/v1/products');
      if (!prodRes.data.data.length) return alert('No products available');
      const prod = prodRes.data.data[0];

      await axios.post('/api/v1/transfers', {
        fromWarehouse,
        toWarehouse,
        items: [
          { productId: prod._id, productSku: prod.sku, productName: prod.name, transferQty: Number(transferQty), batchNumber }
        ]
      });

      alert('Inter-store Transfer Requested!');
      setShowModal(false);
      fetchTransfers();
    } catch (err) {
      alert('Error creating transfer: ' + err.message);
    }
  };

  const handleDispatch = async (id) => {
    try {
      await axios.post(`/api/v1/transfers/${id}/dispatch`);
      alert('Stock Dispatched and placed IN_TRANSIT!');
      fetchTransfers();
    } catch (err) {
      alert('Error dispatching: ' + err.message);
    }
  };

  const handleReceive = async (id) => {
    try {
      await axios.post(`/api/v1/transfers/${id}/receive`);
      alert('Transfer Received and added to destination store stock!');
      fetchTransfers();
    } catch (err) {
      alert('Error receiving: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><ArrowLeftRight color="var(--primary)" /> Inter-Store Stock Transfers</h1>
          <p className="page-subtitle">Central Store to Sub-store movements, dispatch control, and In-Transit receiving workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Request Stock Transfer
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Transfer # & Date</th>
                <th>From Warehouse</th>
                <th>To Warehouse</th>
                <th>Items & Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(tr => (
                <tr key={tr._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{tr.transferNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(tr.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td><strong>{tr.fromWarehouse}</strong></td>
                  <td><strong>{tr.toWarehouse}</strong></td>
                  <td>
                    {tr.items.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem' }}>
                        • {it.productName} ({it.transferQty} units - Batch: {it.batchNumber})
                      </div>
                    ))}
                  </td>
                  <td><StatusBadge status={tr.status} /></td>
                  <td>
                    {tr.status === 'REQUESTED' && (
                      <button onClick={() => handleDispatch(tr._id)} className="btn btn-emerald btn-sm">
                        <Send size={14} /> Dispatch (In Transit)
                      </button>
                    )}
                    {tr.status === 'IN_TRANSIT' && (
                      <button onClick={() => handleReceive(tr._id)} className="btn btn-primary btn-sm">
                        <CheckCircle2 size={14} /> Receive in Store
                      </button>
                    )}
                    {tr.status === 'RECEIVED' && (
                      <span className="badge badge-emerald">Received</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Request Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Inter-Store Transfer Request">
        <form onSubmit={handleCreateTransfer}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Source Warehouse</label>
              <input type="text" className="form-input" value={fromWarehouse} onChange={e => setFromWarehouse(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Sub-store</label>
              <input type="text" className="form-input" value={toWarehouse} onChange={e => setToWarehouse(e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Transfer Quantity (Units)</label>
              <input type="number" required className="form-input" value={transferQty} onChange={e => setTransferQty(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input type="text" required className="form-input" value={batchNumber} onChange={e => setBatchNumber(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Transfer Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockTransfersPage;
