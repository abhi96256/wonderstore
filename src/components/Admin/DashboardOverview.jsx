import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { FaBell, FaUserCircle, FaUsers, FaBox, FaDollarSign, FaChartLine, FaShoppingBag, FaStar } from 'react-icons/fa';
import { getDashboardStats } from '../../firebase/firestore';
import './DashboardOverview.css';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div className="loading-mini">Refining data...</div>;

  const orderChartData = {
    labels: stats.orderTrend?.labels || [],
    datasets: [{
      label: 'Orders',
      data: stats.orderTrend?.data || [],
      backgroundColor: 'rgba(26, 26, 26, 0.8)',
      borderColor: '#1a1a1a',
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const revenueData = {
    labels: stats.revenueTrend?.labels || [],
    datasets: [{
      label: 'Revenue',
      data: stats.revenueTrend?.data || [],
      borderColor: '#c5a059',
      backgroundColor: 'rgba(197, 160, 89, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="dashboard-content-unique">
      <div className="dashboard-header-modern">
        <h2 className="modern-title">Sales Analytics <span>Snapshot</span></h2>
        <div className="premium-date-badge">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
      </div>

      <div className="stats-cards-unique">
        <div className="stat-card-modern revenue">
          <div className="stat-top">
            <span className="label">Revenue</span>
            <FaDollarSign className="icon" />
          </div>
          <p className="value">₹{stats.totalRevenue?.toLocaleString()}</p>
          <div className="trend-up">+12.5% from last month</div>
        </div>

        <div className="stat-card-modern orders">
          <div className="stat-top">
            <span className="label">Total Orders</span>
            <FaShoppingBag className="icon" />
          </div>
          <p className="value">{stats.totalOrders}</p>
          <div className="trend-up">Ongoing growth</div>
        </div>

        <div className="stat-card-modern users">
          <div className="stat-top">
            <span className="label">Active Users</span>
            <FaUsers className="icon" />
          </div>
          <p className="value">{stats.totalUsers}</p>
          <div className="trend-up">New signups today</div>
        </div>
      </div>

      <div className="charts-grid-unique">
        <div className="chart-item-modern main-chart">
          <h3>Order Volume</h3>
          <Bar data={orderChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="chart-item-modern side-chart">
          <h3>Revenue Stream</h3>
          <Line data={revenueData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="recent-activity-unique">
        <h3>Recent Performance Overview</h3>
        <div className="performance-stats">
          <div className="perf-item">
            <span className="p-label">Average Order</span>
            <span className="p-val">₹{stats.averageOrderValue?.toFixed(2)}</span>
          </div>
          <div className="perf-item">
            <span className="p-label">Products Listed</span>
            <span className="p-val">{stats.totalProducts}</span>
          </div>
          <div className="perf-item">
            <span className="p-label">Store Rating</span>
            <span className="p-val">{stats.averageRating?.toFixed(1)} <FaStar className="star" /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;