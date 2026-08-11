import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(localStorage.getItem('activeRole') || 'SUPER_ADMIN');
  const [user, setUser] = useState({
    username: 'admin',
    fullName: 'Dr. Sarah Jenkins',
    role: activeRole,
    department: 'Central Executive Management'
  });

  const rolesList = [
    { code: 'SUPER_ADMIN', name: 'Super Admin', desc: 'Full System Control' },
    { code: 'STORE_MANAGER', name: 'Store Manager', desc: 'Store & Stock Approvals' },
    { code: 'PHARMACIST', name: 'Pharmacist', desc: 'Medicine Dispensing & Controlled Drugs' },
    { code: 'NURSE', name: 'Nurse / Ward', desc: 'Department Indents & Consumption' },
    { code: 'PROCUREMENT_OFFICER', name: 'Procurement Officer', desc: 'POs, RFQs & GRNs' },
    { code: 'AUDITOR', name: 'Auditor', desc: 'Read-only Regulatory Audit' }
  ];

  const switchRole = (newRole) => {
    setActiveRole(newRole);
    localStorage.setItem('activeRole', newRole);
    setUser(prev => ({ ...prev, role: newRole }));
    axios.defaults.headers.common['x-demo-role'] = newRole;
  };

  useEffect(() => {
    axios.defaults.headers.common['x-demo-role'] = activeRole;
  }, [activeRole]);

  return (
    <AuthContext.Provider value={{ user, activeRole, switchRole, rolesList }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
