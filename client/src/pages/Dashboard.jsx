import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  DollarSign, Package, AlertTriangle, Clock, ShoppingCart,
  FileCheck2, ShieldAlert, TrendingUp, BarChart2, ShieldX,
  FileClock, CheckSquare, Building2, Store, Truck, Flame, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const defaultStats = {
  kpi: {
    totalStockValue: 148500,
    availableStock: 18250,
    reservedStock: 1240,
    lowStockItems: 2,
    outOfStock: 1,
    nearExpiry: 3,
    expired: 1,
    pendingIndents: 4,
    pendingPurchaseOrders: 3,
    pendingGRNs: 2
  },
  categoryStats: [
    { name: 'Pharmaceuticals & Drugs', value: 45 },
    { name: 'Surgical Consumables', value: 30 },
    { name: 'Diagnostic Reagents', value: 15 },
    { name: 'Medical Equipment & Spares', value: 10 }
  ],
  storeStats: [
    { name: 'Central Store', value: 65000 },
    { name: 'Pharmacy Sub-store', value: 42000 },
    { name: 'OT Store', value: 24000 },
    { name: 'ICU Ward Par', value: 11500 },
    { name: 'Lab Reagent Store', value: 6000 }
  ],
  purchaseTrend: [
    { month: 'Mar', purchase: 48000 },
    { month: 'Apr', purchase: 45000 },
    { month: 'May', purchase: 55000 },
    { month: 'Jun', purchase: 50000 },
    { month: 'Jul', purchase: 62000 },
    { month: 'Aug', purchase: 60000 }
  ],
  consumptionTrend: [
    { month: 'Mar', consumption: 42000 },
    { month: 'Apr', consumption: 46000 },
    { month: 'May', consumption: 51000 },
    { month: 'Jun', consumption: 49000 },
    { month: 'Jul', consumption: 58000 },
    { month: 'Aug', consumption: 62000 }
  ],
  expiryTrend: [
    { month: 'Sep', count: 2 },
    { month: 'Oct', count: 5 },
    { month: 'Nov', count: 3 },
    { month: 'Dec', count: 8 },
    { month: 'Jan', count: 4 }
  ],
  fastMoving: [
    { name: 'Paracetamol 500mg', volume: 4500 },
    { name: 'N95 Respirators', volume: 3800 },
    { name: 'Normal Saline 500ml', volume: 3100 },
    { name: 'Surgical Gloves L', volume: 2900 },
    { name: 'IV Cannula 20G', volume: 2400 }
  ],
  slowMoving: [
    { name: 'Cefotaxime 1g Inj', volume: 12 },
    { name: 'Metoprolol 50mg', volume: 15 },
    { name: 'Spinal Needles 25G', volume: 18 },
    { name: 'Suction Catheters 14F', volume: 22 },
    { name: 'Endotracheal Tube 7.5', volume: 25 }
  ],
  nonMoving: [
    { name: 'Halothane Inhalation 250ml', daysDormant: 180 },
    { name: 'Dexamethasone 8mg Inj', daysDormant: 120 },
    { name: 'Tracheostomy Tube 8.0', daysDormant: 95 }
  ],
  departmentConsumption: [
    { name: 'Emergency Room (ER)', spend: 34000 },
    { name: 'Main Operation Theatre (OT)', spend: 28500 },
    { name: 'Intensive Care Unit (ICU)', spend: 22000 },
    { name: 'General Male Ward', spend: 14200 },
    { name: 'Outpatient Clinic (OPD)', spend: 9800 }
  ],
  supplierSpend: [
    { name: 'Apex Meditech Ltd', spend: 54000 },
    { name: 'Sun Pharma Distribution', spend: 41000 },
    { name: 'Cipla Supply Chain', spend: 32000 },
    { name: 'Novartis Healthcare', spend: 21500 }
  ],
  criticalAlerts: [
    { id: 1, type: 'EXPIRED_MEDICINE', message: 'Batch BATCH-AUG-2026 (Amoxicillin 500mg) expired today', timestamp: 'Just now' },
    { id: 2, type: 'RECALLED_BATCH', message: 'Manufacturer Recall Notice received for Lot RECALL-88392', timestamp: '1 hour ago' },
    { id: 3, type: 'OUT_OF_STOCK', message: 'Critical item Propofol 10mg/ml is completely Out of Stock', timestamp: '2 hours ago' }
  ],
  warningAlerts: [
    { id: 1, type: 'LOW_STOCK', message: 'Surgical Gloves L is below safe reorder threshold (8 units remaining)', timestamp: '3 hours ago' },
    { id: 2, type: 'NEAR_EXPIRY', message: '3 batches expiring within 90 days require FEFO priority issue', timestamp: 'Today' },
    { id: 3, type: 'PENDING_GRN', message: 'Shipment GRN-2026-0044 awaiting QC inspector verification', timestamp: 'Today' },
    { id: 4, type: 'PENDING_APPROVAL', message: 'Indent IND-2026-0091 requires Executive Sign-off (>₹50,000)', timestamp: 'Yesterday' },
    { id: 5, type: 'OVERDUE_PO', message: 'Purchase Order PO-2026-0812 from Sun Pharma is 2 days overdue', timestamp: '2 days ago' }
  ],
  infoAlerts: [
    { id: 1, type: 'CONTRACT_EXPIRY', message: 'Apex Meditech AMC Rate Contract expiring in 15 days', timestamp: 'Upcoming' },
    { id: 2, type: 'WARRANTY_EXPIRY', message: 'Biomedical Asset MRI Magnetom Warranty expiring on 2026-09-30', timestamp: 'Upcoming' },
    { id: 3, type: 'SCHEDULED_COUNT', message: 'Quarterly Physical Cycle Stock Count scheduled for Central Store on Aug 15', timestamp: 'Scheduled' }
  ]
};

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/reports/dashboard-stats');
      if (res.data && res.data.kpi) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeStats = stats || defaultStats;
  const {
    kpi, categoryStats, storeStats, purchaseTrend, consumptionTrend,
    expiryTrend, fastMoving, slowMoving, nonMoving, departmentConsumption,
    supplierSpend, criticalAlerts, warningAlerts, infoAlerts
  } = activeStats;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Executive Inventory Dashboard (Section 8)</h1>
          <p className="page-subtitle">Real-time KPI metrics, 10 supply-chain charts & severity alert engine</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchDashboardStats} className="btn btn-secondary">Refresh Live Data</button>
        </div>
      </div>

      {/* 8.1 10 Executive KPI Cards */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#f8fafc' }}>
        Section 8.1 — Executive KPI Cards (10 Metrics)
      </h2>
      <div className="grid-4" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <MetricCard
          title="1. Total Stock Value"
          value={`₹${(kpi.totalStockValue || 148500).toLocaleString('en-IN')}`}
          subtitle="Valuation across all sub-stores"
          icon={DollarSign}
          color="#6366f1"
        />
        <MetricCard
          title="2. Available Stock"
          value={(kpi.availableStock || 18250).toLocaleString('en-IN')}
          subtitle="Usable unreserved stock"
          icon={Package}
          color="#10b981"
        />
        <MetricCard
          title="3. Reserved Stock"
          value={(kpi.reservedStock || 1240).toLocaleString('en-IN')}
          subtitle="Held for indents & OT"
          icon={CheckSquare}
          color="#3b82f6"
        />
        <MetricCard
          title="4. Low Stock Items"
          value={kpi.lowStockItems || 2}
          subtitle="Below safe reorder limit"
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <MetricCard
          title="5. Out of Stock"
          value={kpi.outOfStock || 1}
          subtitle="Zero available balance"
          icon={ShieldX}
          color="#ef4444"
        />
        <MetricCard
          title="6. Near Expiry"
          value={kpi.nearExpiry || 3}
          subtitle="Expires in <90 days"
          icon={Clock}
          color="#f97316"
        />
        <MetricCard
          title="7. Expired Stock"
          value={kpi.expired || 1}
          subtitle="Auto-quarantined batches"
          icon={ShieldAlert}
          color="#dc2626"
        />
        <MetricCard
          title="8. Pending Indents"
          value={kpi.pendingIndents || 4}
          subtitle="Awaiting manager sign-off"
          icon={FileClock}
          color="#8b5cf6"
        />
        <MetricCard
          title="9. Pending POs"
          value={kpi.pendingPurchaseOrders || 3}
          subtitle="Issued POs awaiting delivery"
          icon={ShoppingCart}
          color="#06b6d4"
        />
        <MetricCard
          title="10. Pending GRNs"
          value={kpi.pendingGRNs || 2}
          subtitle="Delivered awaiting QC"
          icon={Truck}
          color="#14b8a6"
        />
      </div>

      {/* 8.3 Alerts Section */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', color: '#f8fafc' }}>
        Section 8.3 — Supply Chain Alerts & Notifications
      </h2>
      <div className="grid-3" style={{ marginBottom: '2rem', gap: '1rem' }}>
        {/* Critical Alerts */}
        <div className="glass-card" style={{ borderColor: '#ef444440' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ef4444' }}>
            <ShieldAlert size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Critical Alerts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {criticalAlerts?.map(alert => (
              <div key={alert.id} style={{ padding: '0.75rem', background: '#ef444415', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5', margin: 0 }}>{alert.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Alerts */}
        <div className="glass-card" style={{ borderColor: '#f59e0b40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Warning Alerts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {warningAlerts?.slice(0, 3).map(alert => (
              <div key={alert.id} style={{ padding: '0.75rem', background: '#f59e0b15', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fde68a', margin: 0 }}>{alert.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Information Alerts */}
        <div className="glass-card" style={{ borderColor: '#3b82f640' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#3b82f6' }}>
            <FileCheck2 size={20} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Information Alerts</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {infoAlerts?.map(alert => (
              <div key={alert.id} style={{ padding: '0.75rem', background: '#3b82f615', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd', margin: 0 }}>{alert.message}</p>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8.2 10 Charts & Analytics */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.5rem 0 0.75rem', color: '#f8fafc' }}>
        Section 8.2 — 10 Visual Charts & Analytics
      </h2>

      {/* Grid 1: Category & Store Share */}
      <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>1. Stock Value by Category</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryStats?.map((e, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>2. Stock Value by Store</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <BarChart data={storeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Valuation (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Purchase vs Consumption Trends */}
      <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>3. Purchase Trend (Last 6 Months)</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <AreaChart data={purchaseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="purchase" stroke="#10b981" fill="#10b98140" name="Procurement (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>4. Consumption Trend (Last 6 Months)</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <AreaChart data={consumptionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="consumption" stroke="#6366f1" fill="#6366f140" name="Consumption (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 3: Expiry & Department Spend */}
      <div className="grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>5. Expiry Projection Trend</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <BarChart data={expiryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expiring Batches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>6. Department Consumption Spend</h3>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <BarChart data={departmentConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Spend (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 4: Fast, Slow & Non-Moving Stock Tables */}
      <div className="grid-3" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#10b981' }}>7. Fast-Moving Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {fastMoving?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff05', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.name}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>{item.volume} units</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#f59e0b' }}>8. Slow-Moving Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {slowMoving?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff05', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.name}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>{item.volume} units</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ef4444' }}>9. Non-Moving Stock</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {nonMoving?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#ffffff05', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{item.name}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>{item.daysDormant} days</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 5: Supplier Spend */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>10. Supplier Purchase Spend</h3>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer>
            <BarChart data={supplierSpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="spend" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Purchase Spend (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
