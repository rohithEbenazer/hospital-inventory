import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ShoppingCart, Plus, Truck, CheckCircle2, FileText, Building2 } from 'lucide-react';

const ProcurementPage = () => {
  const [activeTab, setActiveTab] = useState('POS'); // POS, SUPPLIERS
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'POS') {
        const res = await axios.get('/api/procurement/purchase-orders');
        setOrders(res.data.data);
      } else {
        const res = await axios.get('/api/procurement/suppliers');
        setSuppliers(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleReceiveGRN = async (poId) => {
    if (!confirm('Receive Goods Receipt Note (GRN) for this PO? This will generate batches and increment physical stock.')) return;
    try {
      const res = await axios.post(`/api/procurement/purchase-orders/${poId}/grn`);
      alert(`GRN Processed! Generated GRN #: ${res.data.grnNumber}`);
      fetchData();
    } catch (err) {
      alert('Error receiving GRN: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><ShoppingCart color="var(--cyan)" /> Procurement & Goods Receipt (GRN)</h1>
          <p className="page-subtitle">Purchase Orders, Supplier contracts, Quotations, and GRN quality verification</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('POS')}
            className={`btn ${activeTab === 'POS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Purchase Orders & GRN
          </button>
          <button
            onClick={() => setActiveTab('SUPPLIERS')}
            className={`btn ${activeTab === 'SUPPLIERS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Supplier Directory
          </button>
        </div>
      </div>

      {activeTab === 'POS' ? (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO Number & Date</th>
                  <th>Supplier Name</th>
                  <th>Order Items</th>
                  <th>Total PO Amount</th>
                  <th>PO Status</th>
                  <th>GRN Reference</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(po => (
                  <tr key={po._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{po.poNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(po.orderDate).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{po.supplierName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {po.requestedBy}</div>
                    </td>
                    <td>
                      {po.items.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem' }}>
                          • {item.productName} ({item.orderedQty} units @ ₹{item.unitCost})
                        </div>
                      ))}
                    </td>
                    <td><strong>₹{(po.totalAmount || 0).toLocaleString('en-IN')}</strong></td>
                    <td><StatusBadge status={po.status} /></td>
                    <td>
                      {po.grnNumber ? (
                        <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {po.grnNumber}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Pending GRN</span>
                      )}
                    </td>
                    <td>
                      {po.status !== 'RECEIVED' ? (
                        <button
                          onClick={() => handleReceiveGRN(po._id)}
                          className="btn btn-emerald btn-sm"
                        >
                          <Truck size={14} /> Receive GRN
                        </button>
                      ) : (
                        <span className="badge badge-emerald">Received & Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {suppliers.map(sup => (
            <div key={sup._id} className="glass-card glass-card-hover">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{sup.name}</div>
                <StatusBadge status={sup.status} />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontFamily: 'monospace', marginBottom: '1rem' }}>{sup.code}</div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <strong>Contact:</strong> {sup.contactPerson} ({sup.phone})
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <strong>GST:</strong> {sup.gstNumber} | <strong>DL #:</strong> {sup.drugLicenseNo || 'N/A'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: 600 }}>
                Supplier Quality Rating: ★ {sup.rating} / 5.0
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
