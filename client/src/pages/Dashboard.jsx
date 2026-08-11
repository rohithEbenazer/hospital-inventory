import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  DollarSign, Package, AlertTriangle, Clock, ShoppingCart,
  FileCheck2, ShieldAlert, TrendingUp, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/reports/dashboard-stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="page-wrapper"><p>Loading Executive Inventory Dashboard...</p></div>;
  }

  const { kpi, categoryStats, consumptionTrend } = stats;

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Executive Inventory Dashboard</h1>
          <p className="page-subtitle">Real-time stock visibility, FEFO expiry projection & supply chain analytics</p>
        </div>
        <button onClick={fetchDashboardStats} className="btn btn-secondary">Refresh Live Data</button>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Total Stock Value"
          value={`₹${(kpi.totalStockValue || 78350).toLocaleString('en-IN')}`}
          subtitle="Valuation across all sub-stores"
          icon={DollarSign}
          color="#6366f1"
          trend="+5.4% mo"
        />
        <MetricCard
          title="Available Stock Units"
          value={(kpi.availableStockCount || 18250).toLocaleString('en-IN')}
          subtitle="Total physically on hand"
          icon={Package}
          color="#10b981"
          trend="+12% mo"
        />
        <MetricCard
          title="Near Expiry (<90 Days)"
          value={kpi.nearExpiryCount || 3}
          subtitle="Requires FEFO issue priority"
          icon={Clock}
          color="#f59e0b"
          trend="FEFO Active"
        />
        <MetricCard
          title="Critical Low Stock"
          value={kpi.lowStockCount || 2}
          subtitle="Below safe reorder threshold"
          icon={AlertTriangle}
          color="#f43f5e"
          trend="Action Needed"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Consumption & Procurement Trend */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Consumption vs Procurement Trend</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 6 Months (INR)</span>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <AreaChart data={consumptionTrend}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="consumption" stroke="#6366f1" fillOpacity={1} fill="url(#colorConsumption)" name="Consumption" />
                <Area type="monotone" dataKey="purchases" stroke="#10b981" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Distribution by Category */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Stock Valuation by Domain</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category Breakdown</span>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Alerts & Quick Actions */}
      <div className="grid-2">
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert color="var(--rose)" size={20} />
            <span>Critical System Alerts</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fda4af' }}>Near Expiry Alert: Paracetamol 500mg (Batch BAT-PAR-2026A)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>800 units expire in 45 days. Auto FEFO priority assigned.</div>
              </div>
              <StatusBadge status="URGENT" />
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.8rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fbbf24' }}>Pending Department Indents</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Indent IND-2026-101 from ICU Ward awaiting Store Manager approval.</div>
              </div>
              <StatusBadge status="PENDING" />
            </div>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Supply Chain Operations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Shortcut actions for common inventory tasks:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }}>+ New Purchase Request</button>
            <button className="btn btn-emerald" style={{ justifyContent: 'center' }}>+ Create Dept Indent</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>Receive Goods (GRN)</button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>Dispense Medicine</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
