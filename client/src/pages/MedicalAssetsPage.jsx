import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Stethoscope, Calendar, Wrench, ShieldCheck, Plus } from 'lucide-react';

const MedicalAssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await axios.get('/api/assets');
      setAssets(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Stethoscope color="var(--emerald)" /> Medical Equipment Asset Tracker</h1>
          <p className="page-subtitle">Serialized biomedical asset lifecycles, warranty tracking, AMC contracts and calibration logs</p>
        </div>
        <button className="btn btn-primary"><Plus size={18} /> Register Serialized Asset</button>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Serial Number & Asset</th>
                <th>Assigned Department & Store</th>
                <th>Asset Status</th>
                <th>Warranty Expiry</th>
                <th>Calibration Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(ast => (
                <tr key={ast._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{ast.serialNumber}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ast.productName}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ast.assignedDepartment}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location: {ast.warehouseName}</div>
                  </td>
                  <td><StatusBadge status={ast.status} /></td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(ast.warrantyEnd).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: '#34d399' }}>
                      Next Service: {new Date(ast.nextServiceDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">Log Calibration</button>
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

export default MedicalAssetsPage;
