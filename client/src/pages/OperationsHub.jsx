import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardList, Clock, Activity, Wrench, CheckCircle2, AlertOctagon, Plus, RefreshCw, UserCheck } from 'lucide-react';

const OperationsHub = () => {
  const [activeTab, setActiveTab] = useState('INBOX'); // INBOX, SHIFTS, JOBS, SPARE_PARTS
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shift Handover Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    shiftName: 'Night Shift', storekeeper: '', openingBal: 1290, receipts: 50, issues: 180, returns: 5, adjustments: 0, actualClosing: 1165
  });

  // Spare Parts Work Order Modal State
  const [showWoModal, setShowWoModal] = useState(false);
  const [woForm, setWoForm] = useState({ equipmentName: 'Ventilator ICU-02', technician: 'Tech Alex', partId: '', qty: 1 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'INBOX') {
        const res = await axios.get('/api/v1/ops/task-inbox');
        setTasks(res.data.data);
      } else if (activeTab === 'SHIFTS') {
        const res = await axios.get('/api/v1/ops/shifts');
        setShifts(res.data.data);
      } else if (activeTab === 'JOBS') {
        const res = await axios.get('/api/v1/ops/jobs');
        setJobs(res.data.data);
      } else if (activeTab === 'SPARE_PARTS') {
        const res = await axios.get('/api/v1/ops/spare-parts');
        setSpareParts(res.data.data);
        setWorkOrders(res.data.workOrders || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await axios.post(`/api/v1/ops/task-inbox/${id}/complete`);
      fetchData();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  const handleToggleJob = async (id) => {
    try {
      await axios.post(`/api/v1/ops/jobs/${id}/toggle`);
      fetchData();
    } catch (err) {
      alert('Error toggling job: ' + err.message);
    }
  };

  const handleSubmitShiftHandover = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/ops/shifts/handover', shiftForm);
      setShowShiftModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving shift handover: ' + err.message);
    }
  };

  const handleReserveSparePart = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/ops/work-orders/reserve', woForm);
      setShowWoModal(false);
      fetchData();
    } catch (err) {
      alert('Error reserving spare part: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><ClipboardList color="var(--emerald)" /> Central Operations & Shift Handover</h1>
          <p className="page-subtitle">Unified operational task inbox, shift reconciliation, job scheduler health, and maintenance spare parts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30,41,59,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button onClick={() => setActiveTab('INBOX')} className={`btn ${activeTab === 'INBOX' ? 'btn-primary' : 'btn-secondary'}`}>
            <ClipboardList size={16} /> Task Inbox (258)
          </button>
          <button onClick={() => setActiveTab('SHIFTS')} className={`btn ${activeTab === 'SHIFTS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Clock size={16} /> Shift Handover (260)
          </button>
          <button onClick={() => setActiveTab('JOBS')} className={`btn ${activeTab === 'JOBS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Activity size={16} /> Job Scheduler (249)
          </button>
          <button onClick={() => setActiveTab('SPARE_PARTS')} className={`btn ${activeTab === 'SPARE_PARTS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Wrench size={16} /> Spare Parts BOM (271)
          </button>
        </div>
      </div>

      {/* --- TAB 1: TASK INBOX --- */}
      {activeTab === 'INBOX' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>SLA Due Date</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {t._id}</div>
                    </td>
                    <td><span className="badge badge-emerald">{t.taskType}</span></td>
                    <td>{t.department}</td>
                    <td>
                      <span style={{ color: t.priority === 'CRITICAL' ? 'var(--rose)' : 'var(--amber)', fontWeight: 700 }}>
                        {t.slaDue}
                      </span>
                    </td>
                    <td>{t.assignee}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      {t.status !== 'COMPLETED' ? (
                        <button onClick={() => handleCompleteTask(t._id)} className="btn btn-emerald btn-sm">
                          <CheckCircle2 size={14} /> Resolve Task
                        </button>
                      ) : (
                        <span style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 700 }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: SHIFT HANDOVER --- */}
      {activeTab === 'SHIFTS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Shift Stock Reconciliation & Handover Logs</h3>
            <button onClick={() => setShowShiftModal(true)} className="btn btn-emerald"><Plus size={16} /> New Shift Handover Signoff</button>
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Shift & Storekeeper</th>
                    <th>Opening Bal</th>
                    <th>Receipts (+)</th>
                    <th>Issues (-)</th>
                    <th>Returns (+)</th>
                    <th>Adjustments (±)</th>
                    <th>Expected Closing</th>
                    <th>Actual Closing</th>
                    <th>Variance</th>
                    <th>Supervisor Signoff</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.shiftName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.storekeeper}</div>
                      </td>
                      <td>{s.openingBal}</td>
                      <td style={{ color: 'var(--emerald)' }}>+{s.receipts}</td>
                      <td style={{ color: 'var(--rose)' }}>-{s.issues}</td>
                      <td>+{s.returns}</td>
                      <td>{s.adjustments}</td>
                      <td style={{ fontWeight: 700 }}>{s.expectedClosing}</td>
                      <td style={{ fontWeight: 800, color: '#a5b4fc' }}>{s.actualClosing}</td>
                      <td style={{ fontWeight: 700, color: s.variance === 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                        {s.variance}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        <div style={{ color: 'var(--emerald)', fontWeight: 700 }}>✔ {s.status}</div>
                        <div style={{ color: 'var(--text-muted)' }}>By: {s.supervisor}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: JOB SCHEDULER GOVERNANCE --- */}
      {activeTab === 'JOBS' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Identifier</th>
                  <th>Schedule Rule</th>
                  <th>Owner Service</th>
                  <th>Last Execution</th>
                  <th>Next Execution</th>
                  <th>Status</th>
                  <th>Controls</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{j.jobId}</td>
                    <td style={{ fontSize: '0.85rem' }}>{j.schedule}</td>
                    <td>{j.owner}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(j.lastRun).toLocaleTimeString()}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(j.nextRun).toLocaleTimeString()}</td>
                    <td>
                      {j.status === 'RUNNING' ? (
                        <span className="badge badge-emerald">ACTIVE RUNNING</span>
                      ) : (
                        <span className="badge badge-amber">PAUSED</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleJob(j._id)}
                        className={`btn ${j.status === 'RUNNING' ? 'btn-rose' : 'btn-emerald'} btn-sm`}
                      >
                        {j.status === 'RUNNING' ? 'Pause Job' : 'Resume Job'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: SPARE PARTS & WORK ORDERS --- */}
      {activeTab === 'SPARE_PARTS' && (
        <div className="grid-2">
          {/* Spare Parts Inventory */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Spare Parts Inventory (Section 271)</h3>
              <button onClick={() => setShowWoModal(true)} className="btn btn-primary btn-sm"><Plus size={14} /> Work Order Reserve</button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Part Number & Name</th>
                    <th>Category</th>
                    <th>In Stock</th>
                    <th>Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map(sp => (
                    <tr key={sp._id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{sp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontFamily: 'monospace' }}>{sp.partNumber}</div>
                      </td>
                      <td><span className="badge badge-emerald">{sp.category}</span></td>
                      <td><strong>{sp.inStock} units</strong></td>
                      <td>₹{sp.unitCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance Work Orders */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Active Work Order Reservations (Section 270)</h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>WO # & Equipment</th>
                    <th>Reserved Spare Part</th>
                    <th>Technician</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map(wo => (
                    <tr key={wo._id}>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{wo.workOrderNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{wo.equipmentName}</div>
                      </td>
                      <td><strong>{wo.sparePart}</strong> ({wo.reservedQty}x)</td>
                      <td>{wo.technician}</td>
                      <td><span className="badge badge-emerald">{wo.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showShiftModal && (
        <Modal isOpen={true} onClose={() => setShowShiftModal(false)} title="Shift Handover Stock Reconciliation">
          <form onSubmit={handleSubmitShiftHandover}>
            <div className="grid-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Shift Name</label>
                <input
                  type="text"
                  required
                  value={shiftForm.shiftName}
                  onChange={e => setShiftForm({ ...shiftForm, shiftName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Opening Stock Bal</label>
                <input
                  type="number"
                  required
                  value={shiftForm.openingBal}
                  onChange={e => setShiftForm({ ...shiftForm, openingBal: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Receipts (+)</label>
                <input
                  type="number"
                  value={shiftForm.receipts}
                  onChange={e => setShiftForm({ ...shiftForm, receipts: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Issues (-)</label>
                <input
                  type="number"
                  value={shiftForm.issues}
                  onChange={e => setShiftForm({ ...shiftForm, issues: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Returns (+)</label>
                <input
                  type="number"
                  value={shiftForm.returns}
                  onChange={e => setShiftForm({ ...shiftForm, returns: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Actual Physical Count Closing</label>
              <input
                type="number"
                required
                value={shiftForm.actualClosing}
                onChange={e => setShiftForm({ ...shiftForm, actualClosing: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-emerald">Sign-off Shift Handover</button>
            </div>
          </form>
        </Modal>
      )}

      {showWoModal && (
        <Modal isOpen={true} onClose={() => setShowWoModal(false)} title="Reserve Spare Part for Maintenance Work Order">
          <form onSubmit={handleReserveSparePart}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Equipment Target</label>
              <input
                type="text"
                required
                value={woForm.equipmentName}
                onChange={e => setWoForm({ ...woForm, equipmentName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Select Spare Part</label>
              <select
                required
                value={woForm.partId}
                onChange={e => setWoForm({ ...woForm, partId: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              >
                <option value="">Select Spare Part...</option>
                {spareParts.map(sp => (
                  <option key={sp._id} value={sp._id}>{sp.name} ({sp.inStock} in stock)</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-emerald">Reserve Spare Part</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OperationsHub;
