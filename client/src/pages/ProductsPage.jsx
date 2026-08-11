import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Package, Plus, Search, Filter, QrCode, AlertCircle } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', genericName: '', itemType: 'MEDICINE', category: 'Medicines > General',
    purchaseUnit: 'Box', issueUnit: 'Piece', conversionFactor: 10,
    unitCost: 10, mrp: 15, minStock: 100, reorderPoint: 250, controlledItem: false
  });

  useEffect(() => {
    fetchProducts();
  }, [filterType, search]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', {
        params: { itemType: filterType, search }
      });
      setProducts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/products', formData);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title"><Package color="var(--primary)" /> Product Master Catalog</h1>
          <p className="page-subtitle">Central registry of medicines, consumables, surgical, reagents and equipment assets</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by Name, SKU, Generic Name, Barcode..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '220px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Item Types</option>
            <option value="MEDICINE">Medicines</option>
            <option value="CONSUMABLE">Medical Consumables</option>
            <option value="SURGICAL">Surgical Supplies</option>
            <option value="EQUIPMENT">Equipment Assets</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU & Barcode</th>
                <th>Product Details</th>
                <th>Item Domain</th>
                <th>Units & Conv.</th>
                <th>Reorder Threshold</th>
                <th>Unit Cost / MRP</th>
                <th>Controlled / Critical</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#a5b4fc', fontFamily: 'monospace' }}>{p.sku}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <QrCode size={12} /> {p.barcode || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.genericName || p.category}</div>
                  </td>
                  <td><StatusBadge status={p.itemType} /></td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>1 {p.purchaseUnit} = {p.conversionFactor} {p.issueUnit}s</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Min: <strong>{p.minStock}</strong> | Reorder: <strong>{p.reorderPoint}</strong></div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Cost: ₹{p.unitCost} | MRP: ₹{p.mrp}</div>
                  </td>
                  <td>
                    {p.controlledItem && <span className="badge badge-rose" style={{ marginRight: '4px' }}>Controlled</span>}
                    {p.criticalItem && <span className="badge badge-amber">Critical</span>}
                    {!p.controlledItem && !p.criticalItem && <span style={{ color: 'var(--text-dark)', fontSize: '0.8rem' }}>Standard</span>}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Inventory Product Master">
        <form onSubmit={handleCreateProduct}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Ceftriaxone 1g Injection"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Generic Name / Composition</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ceftriaxone Sodium"
                value={formData.genericName}
                onChange={e => setFormData({...formData, genericName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Item Domain Classification</label>
              <select
                className="form-select"
                value={formData.itemType}
                onChange={e => setFormData({...formData, itemType: e.target.value})}
              >
                <option value="MEDICINE">MEDICINE</option>
                <option value="CONSUMABLE">CONSUMABLE</option>
                <option value="SURGICAL">SURGICAL</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Purchase Unit</label>
              <input
                type="text"
                className="form-input"
                value={formData.purchaseUnit}
                onChange={e => setFormData({...formData, purchaseUnit: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Issue Unit</label>
              <input
                type="text"
                className="form-input"
                value={formData.issueUnit}
                onChange={e => setFormData({...formData, issueUnit: e.target.value})}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Unit Cost (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formData.unitCost}
                onChange={e => setFormData({...formData, unitCost: Number(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Point (Min Units)</label>
              <input
                type="number"
                className="form-input"
                value={formData.reorderPoint}
                onChange={e => setFormData({...formData, reorderPoint: Number(e.target.value)})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
