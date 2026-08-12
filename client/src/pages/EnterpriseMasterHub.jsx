import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Cpu, Layers, GitPullRequest, Truck, Smartphone, Printer, BarChart2, TrendingUp, Activity, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const EnterpriseMasterHub = () => {
  const [activeTab, setActiveTab] = useState('BINS'); // BINS, RULES, SUPPLIER_PORTAL, MOBILE_SYNC, LABELS, ANALYTICS, FORECASTING, HEALTH
  const [bins, setBins] = useState([]);
  const [rules, setRules] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [syncQueue, setSyncQueue] = useState([]);
  const [abcData, setAbcData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'BINS') {
        const res = await axios.get('/api/v1/enterprise/bin-locations');
        setBins(res.data.data);
      } else if (activeTab === 'RULES') {
        const res = await axios.get('/api/v1/enterprise/workflow-rules');
        setRules(res.data.data);
      } else if (activeTab === 'SUPPLIER_PORTAL') {
        const res = await axios.get('/api/v1/enterprise/supplier-portal/ratings');
        setRatings(res.data.data);
      } else if (activeTab === 'MOBILE_SYNC') {
        const res = await axios.get('/api/v1/enterprise/mobile-sync/queue');
        setSyncQueue(res.data.data);
      } else if (activeTab === 'ANALYTICS') {
        const res = await axios.get('/api/v1/enterprise/analytics/abc');
        setAbcData(res.data.data);
      } else if (activeTab === 'FORECASTING') {
        const res = await axios.get('/api/v1/enterprise/analytics/forecasting');
        setForecastData(res.data.data);
      } else if (activeTab === 'HEALTH') {
        const res = await axios.get('/api/v1/enterprise/health/readiness');
        setHealthData(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Cpu color="var(--cyan)" /> Enterprise Master Hub & Governance</h1>
          <p className="page-subtitle">6-Tier bin hierarchy, workflow approval rules, supplier B2B portal, mobile sync, label printing, ABC/VEN matrix, forecasting & observability</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(30,41,59,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button onClick={() => setActiveTab('BINS')} className={`btn ${activeTab === 'BINS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Layers size={16} color="var(--indigo)" /> 6-Tier Bins
          </button>
          <button onClick={() => setActiveTab('RULES')} className={`btn ${activeTab === 'RULES' ? 'btn-primary' : 'btn-secondary'}`}>
            <GitPullRequest size={16} color="var(--emerald)" /> Workflow Rules
          </button>
          <button onClick={() => setActiveTab('SUPPLIER_PORTAL')} className={`btn ${activeTab === 'SUPPLIER_PORTAL' ? 'btn-primary' : 'btn-secondary'}`}>
            <Truck size={16} color="var(--amber)" /> Supplier Portal
          </button>
          <button onClick={() => setActiveTab('MOBILE_SYNC')} className={`btn ${activeTab === 'MOBILE_SYNC' ? 'btn-primary' : 'btn-secondary'}`}>
            <Smartphone size={16} color="var(--cyan)" /> Mobile Sync
          </button>
          <button onClick={() => setActiveTab('ANALYTICS')} className={`btn ${activeTab === 'ANALYTICS' ? 'btn-primary' : 'btn-secondary'}`}>
            <BarChart2 size={16} color="var(--purple)" /> ABC Analytics
          </button>
          <button onClick={() => setActiveTab('FORECASTING')} className={`btn ${activeTab === 'FORECASTING' ? 'btn-primary' : 'btn-secondary'}`}>
            <TrendingUp size={16} color="var(--rose)" /> Demand Forecast
          </button>
          <button onClick={() => setActiveTab('HEALTH')} className={`btn ${activeTab === 'HEALTH' ? 'btn-primary' : 'btn-secondary'}`}>
            <Activity size={16} /> Observability
          </button>
        </div>
      </div>

      {/* --- TAB 1: 6-TIER BIN LOCATIONS --- */}
      {activeTab === 'BINS' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bin Code & Barcode</th>
                  <th>Zone Code</th>
                  <th>Rack & Shelf</th>
                  <th>Capacity Limit</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bins.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--cyan)' }}>{b.binCode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.barcode}</div>
                    </td>
                    <td><span className="badge badge-indigo">{b.zoneCode}</span></td>
                    <td>{b.rackCode} / {b.shelfCode}</td>
                    <td>{b.capacityUnits} units</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: '#1e293b', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${(b.currentItems / b.capacityUnits) * 100}%`, background: 'var(--cyan)', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{b.currentItems}/{b.capacityUnits}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CONFIGURABLE WORKFLOW RULES --- */}
      {activeTab === 'RULES' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rule Identifier & Module</th>
                  <th>Threshold Value</th>
                  <th>Sequential Approval Chain</th>
                  <th>Effective Date</th>
                  <th>Rule Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.ruleName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>{r.moduleType}</div>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--emerald)' }}>≥ ₹{r.thresholdAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {r.approvalChain.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="badge badge-indigo">Step {step.stepOrder}: {step.roleTitle}</span>
                            {idx < r.approvalChain.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(r.effectiveFrom).toLocaleDateString()}</td>
                    <td><StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: SUPPLIER PORTAL RATINGS --- */}
      {activeTab === 'SUPPLIER_PORTAL' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Supplier Organization</th>
                  <th>Delivery On-Time Score</th>
                  <th>Quality Inspection Score</th>
                  <th>Late Delivery Rate</th>
                  <th>Overall B2B Rating</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 700 }}>{s.supplierName}</td>
                    <td><strong style={{ color: 'var(--emerald)' }}>{s.deliveryScore}%</strong></td>
                    <td><strong style={{ color: 'var(--cyan)' }}>{s.qualityScore}%</strong></td>
                    <td><span style={{ color: 'var(--amber)' }}>{s.lateDeliveryRate}%</span></td>
                    <td><StatusBadge status={s.overallRating} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: MOBILE SYNC QUEUE --- */}
      {activeTab === 'MOBILE_SYNC' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Idempotency Key</th>
                  <th>Device Serial</th>
                  <th>Action Type</th>
                  <th>Sync Timestamp</th>
                  <th>Sync Status</th>
                </tr>
              </thead>
              <tbody>
                {syncQueue.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      Mobile scanner queue synced. No pending offline transactions.
                    </td>
                  </tr>
                ) : (
                  syncQueue.map(q => (
                    <tr key={q._id}>
                      <td style={{ fontFamily: 'monospace', color: '#a5b4fc' }}>{q.idempotencyKey}</td>
                      <td>{q.deviceSerial}</td>
                      <td><span className="badge badge-emerald">{q.actionType}</span></td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(q.createdAt).toLocaleString()}</td>
                      <td><StatusBadge status={q.syncStatus} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: ABC / VEN ANALYTICS --- */}
      {activeTab === 'ANALYTICS' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Unit Cost</th>
                  <th>Current Stock</th>
                  <th>Total Inventory Valuation</th>
                  <th>Pareto ABC Category</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.productName}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{item.sku}</div>
                    </td>
                    <td>₹{item.unitCost}</td>
                    <td>{item.totalQuantity} units</td>
                    <td style={{ fontWeight: 800 }}>₹{item.totalValue.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${item.category === 'A' ? 'badge-rose' : item.category === 'B' ? 'badge-amber' : 'badge-emerald'}`}>
                        Category {item.category} (Top {item.cumulativePct}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 6: DEMAND FORECASTING --- */}
      {activeTab === 'FORECASTING' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            <TrendingUp color="var(--rose)" size={20} /> Exponential Smoothing Demand Forecast Engine
          </h3>
          {forecastData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">Target Item SKU</div>
                <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--cyan)' }}>{forecastData.sku}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{forecastData.productName}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Exponential Alpha (α)</div>
                <div className="stat-value" style={{ color: 'var(--purple)' }}>{forecastData.alphaSmoothingFactor}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smoothing Constant</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Next Month Demand Forecast</div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>{forecastData.projectedNextMonthDemand} units</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>Projected Consumption</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Reorder Point Threshold</div>
                <div className="stat-value" style={{ color: 'var(--amber)' }}>{forecastData.reorderPoint} units</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>Includes {forecastData.recommendedSafetyStock} Safety Stock</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 7: OBSERVABILITY & HEALTH --- */}
      {activeTab === 'HEALTH' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
            <Activity color="var(--emerald)" size={20} /> Production System Observability & Health Probes
          </h3>
          {healthData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-label">System Readiness Probe</div>
                <div className="stat-value" style={{ color: 'var(--emerald)' }}>{healthData.status}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Liveness Probe Status 200 OK</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Database Connection</div>
                <div className="stat-value" style={{ color: 'var(--cyan)' }}>{healthData.dbConnection}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mongoose Connection Pool</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Process Uptime</div>
                <div className="stat-value" style={{ color: 'var(--purple)' }}>{Math.round(healthData.uptimeSeconds)} sec</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous Runtime</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnterpriseMasterHub;
