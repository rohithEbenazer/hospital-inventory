import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { FileCheck2, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const DepartmentIndents = () => {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    try {
      const res = await axios.get('/api/indents');
      setIndents(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApproveIssue = async (indentId) => {
    if (!confirm('Approve Indent and Issue stock via FEFO algorithm?')) return;
    try {
      const res = await axios.post(`/api/indents/${indentId}/approve-issue`);
      alert('Indent Approved & Stock Issued via FEFO!');
      fetchIndents();
    } catch (err) {
      alert('Error approving indent: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><FileCheck2 color="var(--amber)" /> Department Indents & Approvals</h1>
          <p className="page-subtitle">Ward requests (ICU, OT, Emergency) & Store Manager FEFO approval workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-emerald">
          <Plus size={18} /> Create New Department Indent
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Indent Number</th>
                <th>Department & Requester</th>
                <th>Requested Products</th>
                <th>Priority</th>
                <th>Status</th>
                <th>FEFO Batch Allocation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {indents.map(ind => (
                <tr key={ind._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{ind.indentNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ind.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ind.departmentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By: {ind.requestedBy}</div>
                  </td>
                  <td>
                    {ind.items.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem' }}>
                        • {it.productName}: <strong>{it.requestedQty} units</strong> (Issued: {it.issuedQty})
                      </div>
                    ))}
                  </td>
                  <td><StatusBadge status={ind.priority} /></td>
                  <td><StatusBadge status={ind.status} /></td>
                  <td>
                    {ind.items.map(it => (
                      it.batchAllocations.map((ba, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace' }}>
                          ✓ {ba.batchNumber} ({ba.quantity} u)
                        </div>
                      ))
                    ))}
                    {ind.status === 'PENDING_APPROVAL' && <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Awaiting FEFO Pick</span>}
                  </td>
                  <td>
                    {ind.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => handleApproveIssue(ind._id)}
                        className="btn btn-emerald btn-sm"
                      >
                        <CheckCircle size={14} /> Approve & Issue FEFO
                      </button>
                    ) : (
                      <span className="badge badge-emerald">Fulfilled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentIndents;
