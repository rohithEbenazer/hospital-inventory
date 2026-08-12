import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Stethoscope, Droplet, Flame, Flame as GasIcon, ShieldCheck, Activity, CheckCircle, AlertTriangle, Layers, FileText, Lock, Plus } from 'lucide-react';

const ClinicalHub = () => {
  const [activeTab, setActiveTab] = useState('BLOOD'); // BLOOD, CSSD, GAS, CRASH_CARTS, WARD_PAR, MATCHING, FHIR
  const [bloodUnits, setBloodUnits] = useState([]);
  const [cssdTrays, setCssdTrays] = useState([]);
  const [medicalGas, setMedicalGas] = useState([]);
  const [crashCarts, setCrashCarts] = useState([]);
  const [wardPars, setWardPars] = useState([]);
  const [invoiceMatches, setInvoiceMatches] = useState([]);
  const [fhirData, setFhirData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Crash Cart Inspection Modal State
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  const [newSeal, setNewSeal] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'BLOOD') {
        const res = await axios.get('/api/v1/clinical/blood-bank');
        setBloodUnits(res.data.data);
      } else if (activeTab === 'CSSD') {
        const res = await axios.get('/api/v1/clinical/cssd/trays');
        setCssdTrays(res.data.data);
      } else if (activeTab === 'GAS') {
        const res = await axios.get('/api/v1/clinical/medical-gas');
        setMedicalGas(res.data.data);
      } else if (activeTab === 'CRASH_CARTS') {
        const res = await axios.get('/api/v1/clinical/crash-carts');
        setCrashCarts(res.data.data);
      } else if (activeTab === 'WARD_PAR') {
        const res = await axios.get('/api/v1/clinical/ward-par');
        setWardPars(res.data.data);
      } else if (activeTab === 'MATCHING') {
        const res = await axios.get('/api/v1/clinical/invoice-matching');
        setInvoiceMatches(res.data.data);
      } else if (activeTab === 'FHIR') {
        const res = await axios.get('/api/v1/clinical/fhir/SupplyDelivery');
        setFhirData(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleInspectCart = async (e) => {
    e.preventDefault();
    if (!selectedCart) return;
    try {
      await axios.post(`/api/v1/clinical/crash-carts/${selectedCart._id}/inspect`, { sealNumber: newSeal });
      setShowInspectModal(false);
      fetchData();
    } catch (err) {
      alert('Error inspecting cart: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Stethoscope color="var(--rose)" /> Clinical Stores & Special Subsystems</h1>
          <p className="page-subtitle">Blood bank units, CSSD sterilization, medical gas manifolds, crash carts, ward par levels, 3-way invoice matching & FHIR adapters</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(30,41,59,0.8)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <button onClick={() => setActiveTab('BLOOD')} className={`btn ${activeTab === 'BLOOD' ? 'btn-primary' : 'btn-secondary'}`}>
            <Droplet size={16} color="var(--rose)" /> Blood Bank (38)
          </button>
          <button onClick={() => setActiveTab('CSSD')} className={`btn ${activeTab === 'CSSD' ? 'btn-primary' : 'btn-secondary'}`}>
            <Flame size={16} color="var(--cyan)" /> CSSD Sterile (269)
          </button>
          <button onClick={() => setActiveTab('GAS')} className={`btn ${activeTab === 'GAS' ? 'btn-primary' : 'btn-secondary'}`}>
            <Activity size={16} color="var(--emerald)" /> Medical Gas (270)
          </button>
          <button onClick={() => setActiveTab('CRASH_CARTS')} className={`btn ${activeTab === 'CRASH_CARTS' ? 'btn-primary' : 'btn-secondary'}`}>
            <ShieldCheck size={16} color="var(--amber)" /> Crash Carts (265)
          </button>
          <button onClick={() => setActiveTab('WARD_PAR')} className={`btn ${activeTab === 'WARD_PAR' ? 'btn-primary' : 'btn-secondary'}`}>
            <Layers size={16} /> Ward Par (260)
          </button>
          <button onClick={() => setActiveTab('MATCHING')} className={`btn ${activeTab === 'MATCHING' ? 'btn-primary' : 'btn-secondary'}`}>
            <FileText size={16} /> 3-Way Match
          </button>
          <button onClick={() => setActiveTab('FHIR')} className={`btn ${activeTab === 'FHIR' ? 'btn-primary' : 'btn-secondary'}`}>
            <Activity size={16} /> FHIR Adapter
          </button>
        </div>
      </div>

      {/* --- TAB 1: BLOOD BANK --- */}
      {activeTab === 'BLOOD' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Unit ID & Group</th>
                  <th>Component Type</th>
                  <th>Collection Date</th>
                  <th>Expiry Date</th>
                  <th>Storage Freezer</th>
                  <th>Compatibility</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bloodUnits.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Droplet size={16} /> {b.bloodGroup} ({b.unitNumber})
                      </div>
                    </td>
                    <td><span className="badge badge-emerald">{b.componentType}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(b.collectionDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{new Date(b.expiryDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.storageLocation}</td>
                    <td><StatusBadge status={b.compatibilityStatus} /></td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CSSD STERILE SUPPLY --- */}
      {activeTab === 'CSSD' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tray Barcode & Set Name</th>
                  <th>Autoclave Cycle #</th>
                  <th>Sterilization Date</th>
                  <th>Sterile Expiry</th>
                  <th>Bio Indicator Log</th>
                  <th>Current State</th>
                </tr>
              </thead>
              <tbody>
                {cssdTrays.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.setName}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{t.trayBarcode}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{t.autoclaveCycleNo}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(t.sterilizationDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald)' }}>{new Date(t.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-emerald"><CheckCircle size={12} /> {t.biologicalIndicatorStatus}</span>
                    </td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: MEDICAL GAS CYLINDERS --- */}
      {activeTab === 'GAS' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cylinder Serial</th>
                  <th>Gas Type</th>
                  <th>Capacity (L)</th>
                  <th>Manifold Pressure (PSI)</th>
                  <th>Current Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicalGas.map(g => (
                  <tr key={g._id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{g.cylinderSerial}</td>
                    <td><span className="badge badge-emerald">{g.gasType}</span></td>
                    <td>{g.capacityLiters} L</td>
                    <td>
                      <span style={{ fontWeight: 800, color: g.pressurePsi > 1500 ? 'var(--emerald)' : 'var(--amber)' }}>
                        {g.pressurePsi} PSI
                      </span>
                    </td>
                    <td>{g.location}</td>
                    <td><StatusBadge status={g.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: CRASH CARTS --- */}
      {activeTab === 'CRASH_CARTS' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cart Identifier</th>
                  <th>Assigned Department</th>
                  <th>Tamper Seal Number</th>
                  <th>Last Inspection</th>
                  <th>Next Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {crashCarts.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{c.cartNumber}</td>
                    <td>{c.department}</td>
                    <td style={{ fontFamily: 'monospace', color: '#a5b4fc', fontWeight: 700 }}>🔒 {c.sealNumber}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.lastInspectionDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{new Date(c.nextInspectionDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={c.replenishmentStatus} /></td>
                    <td>
                      <button onClick={() => { setSelectedCart(c); setShowInspectModal(true); }} className="btn btn-emerald btn-sm">
                        <CheckCircle size={14} /> Inspect & Reseal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 5: WARD PAR REPLENISHMENT --- */}
      {activeTab === 'WARD_PAR' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ward Location</th>
                  <th>Product SKU & Name</th>
                  <th>Par Target</th>
                  <th>Min Level</th>
                  <th>Current Stock</th>
                  <th>Replenishment Needed</th>
                </tr>
              </thead>
              <tbody>
                {wardPars.map((w, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{w.wardName}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.productName}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{w.productSku}</div>
                    </td>
                    <td><strong>{w.parLevel}</strong></td>
                    <td>{w.minLevel}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: w.needsReplenishment ? 'var(--rose)' : 'var(--emerald)' }}>
                        {w.currentStock} units
                      </span>
                    </td>
                    <td>
                      {w.needsReplenishment ? (
                        <span style={{ color: 'var(--rose)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={14} /> REPLENISH +{w.shortageQty} UNITS
                        </span>
                      ) : (
                        <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>STABLE PAR</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 6: 3-WAY FINANCIAL MATCHING --- */}
      {activeTab === 'MATCHING' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO / GRN / Invoice Ref</th>
                  <th>PO Amount</th>
                  <th>GRN Amount</th>
                  <th>Supplier Invoice</th>
                  <th>3-Way Match Status</th>
                  <th>Finance Clearance</th>
                </tr>
              </thead>
              <tbody>
                {invoiceMatches.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#a5b4fc' }}>{m.poNumber} | {m.grnNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice #: {m.invoiceNumber}</div>
                    </td>
                    <td>₹{m.poAmount.toLocaleString('en-IN')}</td>
                    <td>₹{m.grnAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700 }}>₹{m.invoiceAmount.toLocaleString('en-IN')}</td>
                    <td>
                      {m.matchStatus === 'MATCHED' ? (
                        <span className="badge badge-emerald"><CheckCircle size={12} /> MATCHED</span>
                      ) : (
                        <span className="badge badge-rose"><AlertTriangle size={12} /> {m.matchStatus}</span>
                      )}
                    </td>
                    <td>
                      {m.approvedForPayment ? (
                        <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>APPROVED FOR PAYMENT</span>
                      ) : (
                        <span style={{ color: 'var(--amber)', fontWeight: 700 }}>HELD FOR REVIEW</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 7: FHIR ADAPTER --- */}
      {activeTab === 'FHIR' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>FHIR R4 JSON Interoperability Resource Adapter</h3>
          {fhirData && (
            <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto' }}>
              {JSON.stringify(fhirData, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Modal */}
      {showInspectModal && (
        <Modal isOpen={true} onClose={() => setShowInspectModal(false)} title={`Inspect & Reseal ${selectedCart?.cartNumber}`}>
          <form onSubmit={handleInspectCart}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>New Tamper Seal Number</label>
              <input
                type="text"
                required
                placeholder="e.g. SEAL-994099"
                value={newSeal}
                onChange={e => setNewSeal(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="submit" className="btn btn-emerald">Reseal & Log Inspection</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ClinicalHub;
