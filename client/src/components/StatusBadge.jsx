import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (str) => {
    const text = (str || '').toUpperCase();
    if (['AVAILABLE', 'APPROVED', 'PASSED', 'FULFILLED', 'PAID', 'ACTIVE'].includes(text)) return 'badge-emerald';
    if (['PENDING', 'PENDING_APPROVAL', 'SUBMITTED', 'ROUTINE', 'UNDER_REPAIR'].includes(text)) return 'badge-amber';
    if (['EXPIRED', 'RECALLED', 'QUARANTINED', 'REJECTED', 'CANCELLED', 'URGENT', 'EMERGENCY'].includes(text)) return 'badge-rose';
    return 'badge-primary';
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
};

export default StatusBadge;
