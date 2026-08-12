import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Cpu, Printer, Lock, Scale, GitCompare, Plus, RefreshCw, ShieldAlert, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

const System300Dashboard = () => {
  const [activeTab, setActiveTab] = useState('DEVICES'); // DEVICES, LABELS, PERIODS, LANDED_COST, RECONCILIATION
  const [devices, setDevices] = useState([]);
  const [printLogs, setPrintLogs] = useState([]);
  const [periodLocks, setPeriodLocks] = useState([]);
  const [sequences, setSequences] = useState([]);
  const [reconciliation, setReconciliation] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Device Modal State
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ deviceId: '', deviceType: 'BARCODE_SCANNER', assignedUser: '', department: 'ICU' });

  // Print Label Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printForm, setPrintForm] = useState({ labelType: 'BATCH_LABEL', entityCode: 'BAT-AMO-9942', reason: 'Sticker Replacement', isReprint: true, qty: 1 });

  // Landed Cost State
  const [landedForm, setLandedForm] = useState({ baseAmount: 150000, freight: 4500, duty: 12000, insurance: 1500, allocationMethod: 'BY_VALUE' });
  const [landedResult, setLandedResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'DEVICES') {
        const res = await axios.get('/api/v1/system300/devices');
        setDevices(res.data.data);
      } else if (activeTab === 'LABELS') {
        const res = await axios.get('/api/v1/system300/labels/print-log');
        setPrintLogs(res.data.data);
      } else if (activeTab === 'PERIODS') {
        const [locksRes, seqRes] = await Promise.all([
          axios.get('/api/v1/system300/period-locks'),
          axios.get('/api/v1/system300/sequences')
        ]);
        setPeriodLocks(locksRes.data.data);
        setSequences(seqRes.data.data);
      } else if (activeTab === 'RECONCILIATION') {
        const res = await axios.get('/api/v1/system300/reconciliation');
        setReconciliation(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/system300/devices', deviceForm);
      setShowDeviceModal(false);
      fetchData();
    } catch (err) {
      alert('Error registering device: ' + err.message);
    }
  };

  const handleUpdateDeviceStatus = async (id, status) => {
    try {
      await axios.patch(`/api/v1/system300/devices/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Error updating device status: ' + err.message);
    }
  };

  const handleLogPrint = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/system300/labels/print-log', printForm);
      setShowPrintModal(false);
      fetchData();
    } catch (err) {
      alert('Error logging print: ' + err.message);
    }
  };

  const handleToggleLock = async (periodId) => {
    try {
      await axios.post('/api/v1/system300/period-locks/toggle', { periodId });
      fetchData();
    } catch (err) {
      alert('Error toggling lock: ' + err.message);
    }
  };

  const handleCalculateLandedCost = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/system300/landed-cost/allocate', landedForm);
      setLandedResult(res.data.data);
    } catch (err) {
      alert('Error calculating landed cost: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Cpu color="var(--primary)" /> 300-Series Operational & Compliance Suite</h1>
          <p className="page-subtitle">Device scanners, label print auditing, fiscal period locks, landed cost allocation, and system reconciliation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30,41,59,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button onClick={() => setActiveTab('DEVICES')} className={`btn ${activeTab === 'DEVICES' ? 'btn-primary' : 'btn-secondary'}`}>
            <Cpu size={16} /> Devices (299)
          </button>
          <button onClick={() => setActiveTab('LABELS')} className={`btn ${activeTab === 'LABELS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Printer size={16} /> Print Studio (300)
          </button>
          <button onClick={() => setActiveTab('PERIODS')} className={`btn ${activeTab === 'PERIODS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Lock size={16} /> Period Locks (316)
          </button>
          <button onClick={() => setActiveTab('LANDED_COST')} className={`btn ${activeTab === 'LANDED_COST' ? 'btn-primary' : 'btn-secondary'}`}>
            <Scale size={16} /> Landed Cost (313)
          </button>
          <button onClick={() => setActiveTab('RECONCILIATION')} className={`btn ${activeTab === 'RECONCILIATION' ? 'btn-primary' : 'btn-secondary'}`}>
            <GitCompare size={16} /> Sync Matrix (280)
          </button>
        </div>
      </div>

      {/* --- TAB 1: DEVICE MANAGEMENT --- */}
      {activeTab === 'DEVICES' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Registered Barcode Scanners & Mobile Terminals</h3>
            <button onClick={() => setShowDeviceModal(true)} className="btn btn-emerald"><Plus size={16} /> Register New Device</button>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Type</th>
                    <th>Assigned User & Dept</th>
                    <th>OS / App Version</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(d => (
                    <tr key={d._id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{d.deviceId}</td>
                      <td><span className="badge badge-emerald">{d.deviceType}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.assignedUser}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dept: {d.department}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{d.osVersion}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>App: {d.appVersion}</div>
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {d.status !== 'ACTIVE' && (
                            <button onClick={() => handleUpdateDeviceStatus(d._id, 'ACTIVE')} className="btn btn-emerald btn-sm">Activate</button>
                          )}
                          {d.status !== 'LOST' && (
                            <button onClick={() => handleUpdateDeviceStatus(d._id, 'LOST')} className="btn btn-rose btn-sm">Flag Lost</button>
                          )}
                          {d.status !== 'BLOCKED' && (
                            <button onClick={() => handleUpdateDeviceStatus(d._id, 'BLOCKED')} className="btn btn-secondary btn-sm">Revoke</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PRINT STUDIO & AUDIT --- */}
      {activeTab === 'LABELS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Barcode Label Templates & Audit Reprint Log</h3>
            <button onClick={() => setShowPrintModal(true)} className="btn btn-primary"><Printer size={16} /> Print & Audit Log Label</button>
          </div>

          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card">
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--emerald)" /> Batch Label Template
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Generates Code128 barcode + GS1 DataMatrix QR for medicine vials.</p>
              <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#34d399', border: '1px dashed #334155' }}>
                [SKU: MED-AMO-500] [LOT: BAT-AMO-9942]<br/>
                EXP: 2027-08-31 | MRP: ₹120.00
              </div>
            </div>

            <div className="glass-card">
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--cyan)" /> Bin & Location Label
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Rack shelf bin identifier tags for warehouse pickers.</p>
              <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#38bdf8', border: '1px dashed #334155' }}>
                LOC: CENTRAL-STORE / ZONE-A<br/>
                RACK: R03 / SHELF: S02 / BIN: B05
              </div>
            </div>

            <div className="glass-card">
              <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} color="var(--amber)" /> Medical Asset Tag Label
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Fixed asset serial stickers with AMC/Warranty QR.</p>
              <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#fbbf24', border: '1px dashed #334155' }}>
                ASSET: ICU-VENT-0492<br/>
                SERIAL: SN-994021 | CAL DUE: 2026-11
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Log ID & Time</th>
                    <th>Label Type</th>
                    <th>Entity Code</th>
                    <th>Printed By</th>
                    <th>Reprint Status</th>
                    <th>Audit Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {printLogs.map(l => (
                    <tr key={l._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        <div>{l._id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(l.timestamp).toLocaleString()}</div>
                      </td>
                      <td><span className="badge badge-emerald">{l.labelType}</span></td>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{l.entityCode}</td>
                      <td>{l.requestedBy}</td>
                      <td>
                        {l.isReprint ? (
                          <span style={{ color: 'var(--rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <AlertTriangle size={14} /> REPRINT ({l.qty}x)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>ORIGINAL ({l.qty}x)</span>
                        )}
                      </td>
                      <td>{l.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: PERIOD LOCKS & SEQUENCES --- */}
      {activeTab === 'PERIODS' && (
        <div className="grid-2">
          {/* Fiscal Period Locks */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock color="var(--rose)" size={20} /> Fiscal Accounting Period Locks (Section 316)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Locked periods prevent backdated inventory stock transactions and enforce financial cut-off integrity.
            </p>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Period Name</th>
                    <th>Dates</th>
                    <th>Lock Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {periodLocks.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 700 }}>{p.periodName}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.startDate} to {p.endDate}</td>
                      <td>
                        {p.isLocked ? (
                          <span style={{ color: 'var(--rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Lock size={14} /> LOCKED
                          </span>
                        ) : (
                          <span style={{ color: 'var(--emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle size={14} /> ACTIVE OPEN
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleLock(p._id)}
                          className={`btn ${p.isLocked ? 'btn-emerald' : 'btn-rose'} btn-sm`}
                        >
                          {p.isLocked ? 'Unlock Period' : 'Lock Period'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Numbering Sequences */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers color="var(--cyan)" size={20} /> Concurrency-Safe Sequence Numbers (Section 307)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Centralized sequence counters ensure no missing or duplicate document numbers.
            </p>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Document Module</th>
                    <th>Prefix</th>
                    <th>Current Counter</th>
                    <th>Next Sequence Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {sequences.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{s.module}</td>
                      <td style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{s.prefix}</td>
                      <td><strong>{s.currentNumber}</strong></td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--emerald)', fontWeight: 700 }}>{s.nextSample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: LANDED COST ENGINE --- */}
      {activeTab === 'LANDED_COST' && (
        <div className="grid-2">
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale color="var(--emerald)" size={20} /> Landed Cost Allocation Engine (Section 313)
            </h3>
            <form onSubmit={handleCalculateLandedCost}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>PO Invoice Base Amount (₹)</label>
                <input
                  type="number"
                  value={landedForm.baseAmount}
                  onChange={e => setLandedForm({ ...landedForm, baseAmount: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div className="grid-3" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Freight (₹)</label>
                  <input
                    type="number"
                    value={landedForm.freight}
                    onChange={e => setLandedForm({ ...landedForm, freight: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Custom Duty (₹)</label>
                  <input
                    type="number"
                    value={landedForm.duty}
                    onChange={e => setLandedForm({ ...landedForm, duty: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Insurance (₹)</label>
                  <input
                    type="number"
                    value={landedForm.insurance}
                    onChange={e => setLandedForm({ ...landedForm, insurance: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald" style={{ width: '100%' }}>Calculate Landed Cost Multiplier</button>
            </form>
          </div>

          {landedResult && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Landed Cost Calculation Result</h3>
              <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  <span>Base Purchase Amount:</span>
                  <strong>₹{landedResult.baseAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--amber)' }}>
                  <span>Allocated Freight / Duty / Charges:</span>
                  <strong>+ ₹{landedResult.additionalCharges.toLocaleString('en-IN')}</strong>
                </div>
                <hr style={{ borderColor: 'var(--border-card)', margin: '0.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Total Effective Landed Stock Valuation:</span>
                  <strong style={{ color: 'var(--emerald)' }}>₹{landedResult.totalLandedCost.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#a5b4fc' }}>
                  Unit Cost Allocation Multiplier: <strong>{landedResult.costMultiplier}x</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 5: RECONCILIATION MATRIX --- */}
      {activeTab === 'RECONCILIATION' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Subsystem Module Sync</th>
                  <th>Inventory Ledger Valuation</th>
                  <th>Secondary System Valuation</th>
                  <th>Variance</th>
                  <th>Reconciliation Status</th>
                  <th>Last Sync Check</th>
                </tr>
              </thead>
              <tbody>
                {reconciliation.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{r.module}</td>
                    <td>₹{r.inventoryVal.toLocaleString('en-IN')}</td>
                    <td>₹{r.secondaryVal.toLocaleString('en-IN')}</td>
                    <td style={{ color: r.variance > 0 ? 'var(--rose)' : 'var(--emerald)', fontWeight: 700 }}>
                      ₹{r.variance.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {r.status === 'MATCHED' ? (
                        <span className="badge badge-emerald"><CheckCircle size={12} /> MATCHED</span>
                      ) : (
                        <span className="badge badge-rose"><ShieldAlert size={12} /> VARIANCE ALERT</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.lastCheck).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeviceModal && (
        <Modal isOpen={true} onClose={() => setShowDeviceModal(false)} title="Register Barcode Scanner / Mobile Terminal">
          <form onSubmit={handleRegisterDevice}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Device Serial / ID</label>
              <input
                type="text"
                required
                placeholder="e.g. SCAN-ICU-04"
                value={deviceForm.deviceId}
                onChange={e => setDeviceForm({ ...deviceForm, deviceId: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Assigned User</label>
              <input
                type="text"
                required
                placeholder="e.g. Nurse Sarah"
                value={deviceForm.assignedUser}
                onChange={e => setDeviceForm({ ...deviceForm, assignedUser: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-emerald">Register Device</button>
            </div>
          </form>
        </Modal>
      )}

      {showPrintModal && (
        <Modal isOpen={true} onClose={() => setShowPrintModal(false)} title="Print & Audit Log Barcode Label">
          <form onSubmit={handleLogPrint}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Label Entity Code</label>
              <input
                type="text"
                required
                value={printForm.entityCode}
                onChange={e => setPrintForm({ ...printForm, entityCode: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Mandatory Audit Reason</label>
              <textarea
                required
                placeholder="Explain why this label is being printed/reprinted..."
                value={printForm.reason}
                onChange={e => setPrintForm({ ...printForm, reason: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', minHeight: '80px' }}
              />
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-primary">Submit & Log Print</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default System300Dashboard;
