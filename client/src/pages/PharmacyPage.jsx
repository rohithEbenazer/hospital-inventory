import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Pill, Plus, CheckSquare, ShieldCheck, UserCheck, Search } from 'lucide-react';

const PharmacyPage = () => {
  const [dispenses, setDispenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [patientId, setPatientId] = useState('PAT-2026-9081');
  const [patientName, setPatientName] = useState('John Doe');
  const [doctorName, setDoctorName] = useState('Dr. Alan Grant');
  const [prescriptionId, setPrescriptionId] = useState('RX-77182');
  const [qty, setQty] = useState(10);
  const [controlledChecked, setControlledChecked] = useState(true);

  useEffect(() => {
    fetchDispenses();
  }, []);

  const fetchDispenses = async () => {
    try {
      const res = await axios.get('/api/pharmacy/dispense');
      setDispenses(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDispenseMedicine = async (e) => {
    e.preventDefault();
    try {
      // Get sample product ID
      const prodRes = await axios.get('/api/products?itemType=MEDICINE');
      if (!prodRes.data.data.length) return alert('No medicines available');

      const prod = prodRes.data.data[0];

      await axios.post('/api/pharmacy/dispense', {
        patientId,
        patientName,
        doctorName,
        prescriptionId,
        controlledDrugVerified: controlledChecked,
        items: [
          { productId: prod._id, quantity: Number(qty), batchNumber: 'BAT-PAR-2026A' }
        ]
      });

      alert('Medicines Dispensed & Patient Bill Generated!');
      setShowModal(false);
      fetchDispenses();
    } catch (err) {
      alert('Error dispensing medicine: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Pill color="var(--primary)" /> Pharmacy & Dispensing Module</h1>
          <p className="page-subtitle">OPD/IPD patient medicine dispensing, controlled drug verification, and billing</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> New Patient Dispense
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Dispense ID & Date</th>
                <th>Patient Details</th>
                <th>Prescribing Doctor</th>
                <th>Dispensed Medicines</th>
                <th>Total Bill Amount</th>
                <th>Controlled Verification</th>
                <th>Pharmacist</th>
              </tr>
            </thead>
            <tbody>
              {dispenses.map(d => (
                <tr key={d._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{d.dispenseNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{d.patientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {d.patientId}</div>
                  </td>
                  <td>{d.doctorName}</td>
                  <td>
                    {d.items.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem' }}>
                        • {it.productName} ({it.quantity} units @ ₹{it.mrp})
                      </div>
                    ))}
                  </td>
                  <td><strong style={{ color: 'var(--emerald)' }}>₹{(d.totalBillAmount || 0).toLocaleString('en-IN')}</strong></td>
                  <td>
                    {d.controlledDrugVerified ? (
                      <span className="badge badge-emerald"><ShieldCheck size={12} /> Verified</span>
                    ) : (
                      <span className="badge badge-amber">Standard</span>
                    )}
                  </td>
                  <td>{d.pharmacistName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispense Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Dispense Medicine to Patient">
        <form onSubmit={handleDispenseMedicine}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Patient ID</label>
              <input type="text" required className="form-input" value={patientId} onChange={e => setPatientId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Patient Full Name</label>
              <input type="text" required className="form-input" value={patientName} onChange={e => setPatientName(e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Prescribing Doctor</label>
              <input type="text" required className="form-input" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Prescription / EMR Ref #</label>
              <input type="text" className="form-input" value={prescriptionId} onChange={e => setPrescriptionId(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dispense Quantity (Units)</label>
            <input type="number" required className="form-input" value={qty} onChange={e => setQty(e.target.value)} />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="ctrl" checked={controlledChecked} onChange={e => setControlledChecked(e.target.checked)} />
            <label htmlFor="ctrl" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              Confirm Narcotic / Controlled Substance Dual-Signoff Verification
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Process Dispense & Print Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PharmacyPage;
