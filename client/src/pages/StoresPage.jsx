import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusBadge from '../components/StatusBadge';
import { Warehouse as WarehouseIcon, MapPin, Plus, Thermometer, Shield } from 'lucide-react';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get('/api/stores');
      setStores(res.data.data);
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
          <h1 className="page-title"><WarehouseIcon color="var(--primary)" /> Warehouse & Store Management</h1>
          <p className="page-subtitle">Central stores, sub-stores, ward inventory points, and location bin maps</p>
        </div>
        <button className="btn btn-primary"><Plus size={18} /> Add New Sub-Store</button>
      </div>

      {/* Grid of Stores */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {stores.map(s => (
          <div key={s._id} className="glass-card glass-card-hover">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <StatusBadge status={s.type} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Thermometer size={14} color="var(--cyan)" /> {s.temperatureRange || '20-25°C'}
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>{s.name}</h3>
            <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontFamily: 'monospace', marginBottom: '1rem' }}>{s.code}</div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <strong>Department:</strong> {s.department}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <strong>Store Manager:</strong> {s.managerName}
            </div>

            {s.locations && s.locations.length > 0 && (
              <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={12} /> Bins & Racks ({s.locations.length})
                </div>
                {s.locations.map((loc, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#34d399' }}>
                    {loc.code} ({loc.description})
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoresPage;
