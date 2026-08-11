import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { BarChart3, Download, Printer, Shield, FileSpreadsheet } from 'lucide-react';

const ReportsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get('/api/reports/audit-logs');
      setLogs(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><BarChart3 color="var(--primary)" /> Inventory Audit & Reports</h1>
          <p className="page-subtitle">Exportable financial valuation, stock movements, FEFO expiration reports & regulatory audit log</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrintReport} className="btn btn-secondary"><Printer size={16} /> Print Report</button>
          <button onClick={() => alert('Exporting Stock Ledger as CSV/Excel...')} className="btn btn-emerald"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Stock Valuation (FIFO/FEFO)</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total financial asset valuation based on landed unit cost.</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>₹78,350.00</div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>ABC Inventory Analysis</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Class A (High Value): 70% | Class B: 20% | Class C: 10%</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)' }}>Optimal Balanced</div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Controlled Drug Audit</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Narcotic & psychotropic register compliance rate.</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a5b4fc' }}>100% Compliant</div>
        </div>
      </div>

      {/* System Audit Log Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-card)', fontWeight: 700, fontSize: '1rem' }}>
          System Audit Trail & Regulatory Event Log
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Code</th>
                <th>Module Domain</th>
                <th>Performed By</th>
                <th>User Role</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(lg => (
                <tr key={lg._id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(lg.timestamp).toLocaleString()}
                  </td>
                  <td><StatusBadge status={lg.action} /></td>
                  <td><span className="badge badge-primary">{lg.module}</span></td>
                  <td><strong>{lg.performedBy}</strong></td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lg.userRole}</span></td>
                  <td><div style={{ fontSize: '0.85rem' }}>{lg.details}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
