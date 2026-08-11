import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'var(--primary)', trend }) => {
  return (
    <div className="glass-card glass-card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: color,
        opacity: 0.12,
        filter: 'blur(20px)'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: `rgba(255, 255, 255, 0.05)`,
            border: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: trend.startsWith('+') ? '#34d399' : '#f87171'
          }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
