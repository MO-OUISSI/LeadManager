import React from 'react';
import '../css/Loading.css';

import DashboardLayout from '../components/DashboardLayout';
const Loading = () => {
  return (
    <div className="spinner center">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spinner-blade" style={{ animationDelay: `${i * 0.083}s`, transform: `rotate(${i * 30}deg)` }}></div>
      ))}
    </div>
  );
};

export default Loading;
