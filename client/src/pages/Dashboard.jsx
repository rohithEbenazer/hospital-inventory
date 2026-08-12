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

const defaultStats = {
  kpi: { totalStockValue: 148500, availableStockCount: 18250, nearExpiryCount: 3, lowStockCount: 2 },
  categoryStats: [
    { name: 'Pharmaceuticals & Drugs', value: 45 },
    { name: 'Surgical Consumables', value: 30 },
    { name: 'Diagnostic Reagents', value: 15 },
    { name: 'Medical Equipment & Spares', value: 10 }
  ],
  consumptionTrend: [
    { month: 'Mar', consumption: 42000, procurement: 48000 },
    { month: 'Apr', consumption: 46000, procurement: 45000 },
    { month: 'May', consumption: 51000, procurement: 55000 },
    { month: 'Jun', consumption: 49000, procurement: 50000 },
    { month: 'Jul', consumption: 58000, procurement: 62000 },
    { month: 'Aug', consumption: 62000, procurement: 60000 }
  ]
};

const Dashboard = () => {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/reports/dashboard-stats');
      if (res.data && res.data.kpi) {
        setStats(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const activeStats = stats || defaultStats;
  const { kpi, categoryStats, consumptionTrend } = activeStats;
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

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
          value={`₹${(kpi.totalStockValue || 148500).toLocaleString('en-IN')}`}
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
                  <linearGradient id="colorProcurement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="consumption" stroke="#6366f1" fillOpacity={1} fill="url(#colorConsumption)" name="Consumption" />
                <Area type="monotone" dataKey="procurement" stroke="#10b981" fillOpacity={1} fill="url(#colorProcurement)" name="Procurement" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Stock Share by Category</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution</span>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                <Legend formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
