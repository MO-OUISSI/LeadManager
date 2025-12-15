import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { listLeads } from '../api/leadsApi';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Users, Phone, Target } from 'lucide-react';
import '../css/Analytics.css';
import Loading from '../components/Loading';

const Analytics = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await listLeads();
        setLeads(data);
      } catch (err) {
        console.error("Error fetching leads:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  if (loading) return <DashboardLayout> <Loading /> </DashboardLayout>;

  const totalLeads = leads.length;
  const totalCalls = leads.reduce((sum, l) => sum + (l.nbAppels || 0), 0);
  const qualifiedLeads = leads.filter(l => l.etat === 'Qualifié').length;
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  const overviewStats = [
    { label: 'Total Leads', value: totalLeads, icon: Users },
    { label: 'Taux de conversion', value: conversionRate + '%', icon: Target },
    { label: 'Appels totaux', value: totalCalls, icon: Phone },
  ];

  const etatList = ['Nouveau', 'En cours', 'Qualifié', 'Non qualifié', 'Gagné', 'Perdu'];
  const etatDistribution = etatList.map(etat => {
    const count = leads.filter(l => l.etat === etat).length;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return { etat, count, percentage };
  });

  const getEtatColor = (etat) => {
    const palette = {
      light: {
        'Nouveau': '#0369A1',
        'En cours': '#B45309',
        'Qualifié': '#15803D',
        'Non qualifié': '#B91C1C',
        'Gagné': '#4338CA',
        'Perdu': '#374151',
        default: '#374151',
      },
      dark: {
        'Nouveau': '#7DD3FC',
        'En cours': '#FACC15',
        'Qualifié': '#4ADE80',
        'Non qualifié': '#FCA5A5',
        'Gagné': '#A5B4FC',
        'Perdu': '#D1D5DB',
        default: '#D1D5DB',
      }
    };
    return isDarkMode ? palette.dark[etat] || palette.dark.default : palette.light[etat] || palette.light.default;
  };

  return (
    <DashboardLayout>
      <div className="analytics-page">
        <div className="analytics-header">
          <h2 className="page-title">Analytics des Leads</h2>
          <p className="page-subtitle">Analysez les performances et tendances</p>
        </div>

        {/* Overview Stats */}
        <div className="analytics-overview">
          {overviewStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="analytics-card">
                <div className="analytics-icon">
                  <Icon size={24} />
                </div>
                <div className="analytics-content">
                  <p className="analytics-label">{stat.label}</p>
                  <h3 className="analytics-value">{stat.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="analytics-grid">
          {/* State Distribution */}
          <div className="analytics-chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Distribution par état</h3>
            </div>
            <div className="chart-content">
              <div className="state-distribution">
                {etatDistribution.map((item, idx) => (
                  <div key={idx} className="distribution-item">
                    <div className="distribution-header">
                      <span className="distribution-state">{item.etat}</span>
                      <span className="distribution-count">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="distribution-bar">
                      <div className="distribution-fill" style={{ width: `${item.percentage}%`, backgroundColor: getEtatColor(item.etat) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
