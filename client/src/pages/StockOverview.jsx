import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { BarChart3, Clock, Layers, ShieldCheck, Activity, RotateCcw } from 'lucide-react';

const StockOverview = () => {
  const [tab, setTab] = useState('BALANCES'); // BALANCES, BATCHES, LEDGER
  const [balances, setBalances] = useState([]);
  const [batches, setBatches] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // FEFO Preview Modal state
  const [fefoModalProduct, setFefoModalProduct] = useState(null);
  const [fefoResult, setFefoResult] = useState(null);
  const [reqQty, setReqQty] = useState(150);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'BALANCES') {
        const res = await axios.get('/api/stock/balances');
        setBalances(res.data.data);
      } else if (tab === 'BATCHES') {
        const res = await axios.get('/api/stock/batches');
        setBatches(res.data.data);
      } else if (tab === 'LEDGER') {
        const res = await axios.get('/api/stock/ledger');
        setLedger(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleTestFEFO = async (productId, productName) => {
    try {
      const res = await axios.get(`/api/stock/fefo-allocation/${productId}`, {
        params: { quantity: reqQty }
      });
      setFefoModalProduct(productName);
      setFefoResult(res.data.data);
    } catch (err) {
      alert('FEFO Error: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><BarChart3 color="var(--emerald)" /> Stock Overview & FEFO Engine</h1>
          <p className="page-subtitle">Real-time inventory balances, First-Expired-First-Out batch tracking, and immutable ledger audit</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30,41,59,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button
            onClick={() => setTab('BALANCES')}
            className="btn"
            style={{
              background: tab === 'BALANCES' ? 'var(--primary)' : 'transparent',
              color: tab === 'BALANCES' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Current Balances
          </button>
          <button
            onClick={() => setTab('BATCHES')}
            className="btn"
            style={{
              background: tab === 'BATCHES' ? 'var(--primary)' : 'transparent',
              color: tab === 'BATCHES' ? '#fff' : 'var(--text-muted)'
            }}
          >
            FEFO Batches
          </button>
          <button
            onClick={() => setTab('LEDGER')}
            className="btn"
            style={{
              background: tab === 'LEDGER' ? 'var(--primary)' : 'transparent',
              color: tab === 'LEDGER' ? '#fff' : 'var(--text-muted)'
            }}
          >
            Transaction Ledger
          </button>
        </div>
      </div>

      {tab === 'BALANCES' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Warehouse Location</th>
                  <th>Available Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Valuation</th>
                  <th>FEFO Engine Action</th>
                </tr>
              </thead>
              <tbody>
                {balances.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontFamily: 'monospace' }}>{b.productSku}</div>
                    </td>
                    <td>{b.warehouseName}</td>
                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--emerald)' }}>{b.availableQty} units</span>
                    </td>
                    <td>₹{b.unitCost}</td>
                    <td><strong>₹{(b.totalStockValue || 0).toLocaleString('en-IN')}</strong></td>
                    <td>
                      <button
                        onClick={() => handleTestFEFO(b.productId?._id || b.productId, b.productName)}
                        className="btn btn-emerald btn-sm"
                      >
                        Run FEFO Simulation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'BATCHES' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Batch Number</th>
                  <th>Product Name</th>
                  <th>Expiry Date</th>
                  <th>Available Qty</th>
                  <th>Unit Cost / MRP</th>
                  <th>Quality Status</th>
                  <th>Recall Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(bt => {
                  const isExpiringSoon = new Date(bt.expiryDate) < new Date(Date.now() + 90*24*60*60*1000);
                  return (
                    <tr key={bt._id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{bt.batchNumber}</td>
                      <td>{bt.productName}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: isExpiringSoon ? 'var(--rose)' : 'var(--text-main)' }}>
                          {new Date(bt.expiryDate).toLocaleDateString()}
                        </div>
                        {isExpiringSoon && <span style={{ fontSize: '0.7rem', color: 'var(--rose)' }}>FEFO Priority 1</span>}
                      </td>
                      <td><strong>{bt.currentQuantity} / {bt.quantityReceived}</strong></td>
                      <td>₹{bt.unitCost} / ₹{bt.mrp}</td>
                      <td><StatusBadge status={bt.qualityStatus} /></td>
                      <td><StatusBadge status={bt.recallStatus} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'LEDGER' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tx ID & Time</th>
                  <th>Operation Type</th>
                  <th>Product Name</th>
                  <th>Store Location</th>
                  <th>Quantity Shift</th>
                  <th>Balance After</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{l.transactionNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</div>
                    </td>
                    <td><StatusBadge status={l.transactionType} /></td>
                    <td>{l.productName}</td>
                    <td>{l.warehouseName}</td>
                    <td style={{ fontWeight: 800, color: l.quantity > 0 ? '#34d399' : '#f87171' }}>
                      {l.quantity > 0 ? `+${l.quantity}` : l.quantity}
                    </td>
                    <td><strong>{l.balanceAfter} units</strong></td>
                    <td>{l.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FEFO Simulation Modal */}
      {fefoModalProduct && fefoResult && (
        <Modal isOpen={true} onClose={() => setFefoModalProduct(null)} title={`FEFO Auto-Pick Allocation Preview`}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>{fefoModalProduct}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              FEFO Algorithm selected the earliest expiring valid batches to fulfill target demand.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              <span>Target Quantity: <strong>{reqQty} units</strong></span>
              <span>Allocated Status: <strong style={{ color: fefoResult.isFullyAllocated ? '#34d399' : '#f87171' }}>{fefoResult.isFullyAllocated ? 'FULLY ALLOCATED' : 'PARTIAL'}</strong></span>
            </div>
          </div>

          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>FEFO Selected Batches</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {fefoResult.allocations.map((a, idx) => (
              <div key={idx} style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>Priority #{idx+1}: {a.batchNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expires: {new Date(a.expiryDate).toLocaleDateString()}</div>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>Allocated: {a.allocatedQty} units</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button onClick={() => setFefoModalProduct(null)} className="btn btn-primary">Close FEFO Preview</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StockOverview;
