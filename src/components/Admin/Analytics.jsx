import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title } from 'chart.js';
import './Analytics.css';
import { FaShoppingCart, FaUsers, FaRupeeSign, FaChartLine, FaBoxOpen, FaGlobe, FaExchangeAlt, FaShoppingBag, FaSpinner, FaDownload, FaFileCsv } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Title);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for different data
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    returnRate: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    userGrowth: 0,
    aovGrowth: 0,
    conversionGrowth: 0,
    returnRateChange: 0
  });

  const [orderStatusData, setOrderStatusData] = useState({
    completed: 0,
    processing: 0,
    shipped: 0,
    pending: 0,
    cancelled: 0
  });

  const [paymentMethodsData, setPaymentMethodsData] = useState({
    card: 0,
    upi: 0,
    netbanking: 0,
    wallet: 0,
    cod: 0,
    other: 0
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    revenue: [],
    orders: [],
    newUsers: [],
    returningUsers: [],
    aov: [],
    conversionRate: [],
    abandonmentRate: []
  });

  const [productData, setProductData] = useState({
    categories: {
      labels: [],
      values: []
    },
    topProducts: {
      labels: [],
      values: []
    }
  });

  const [trafficSourcesData, setTrafficSourcesData] = useState({
    labels: [],
    values: []
  });

  const [geographicData, setGeographicData] = useState({
    labels: [],
    values: []
  });

  // Function to handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Helper function to get date range based on timeRange
  const getDateRange = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '6months':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
    }

    return {
      start: startDate,
      end: now
    };
  };

  // Generate month labels for the selected time range
  const generateMonthLabels = () => {
    const { start, end } = getDateRange();
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const monthName = months[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      labels.push(`${monthName} ${year}`);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return labels;
  };

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { start, end } = getDateRange();

        // Convert dates to Firestore Timestamps
        const startTimestamp = Timestamp.fromDate(start);
        const endTimestamp = Timestamp.fromDate(end);

        // Fetch orders data
        await fetchOrdersData(startTimestamp, endTimestamp);

        // Fetch users data
        await fetchUsersData(startTimestamp, endTimestamp);

        // Fetch products data
        await fetchProductsData();

        // Generate month labels for charts
        const monthLabels = generateMonthLabels();
        setMonthlyData(prev => ({ ...prev, labels: monthLabels }));

        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to fetch analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Fetch orders data
  const fetchOrdersData = async (startTimestamp, endTimestamp) => {
    try {
      // Query orders from both collections
      const ordersQuery = query(
        collection(db, 'orders'),
        where('created_at', '>=', startTimestamp),
        where('created_at', '<=', endTimestamp),
        orderBy('created_at', 'desc')
      );

      const paymentsQuery = query(
        collection(db, 'successfulPayments'),
        where('created_at', '>=', startTimestamp),
        where('created_at', '<=', endTimestamp),
        orderBy('created_at', 'desc')
      );

      const [ordersSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(ordersQuery),
        getDocs(paymentsQuery)
      ]);

      // Process orders data
      const orders = [];
      const existingOrderIds = new Set();

      ordersSnapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
        existingOrderIds.add(doc.id);
      });

      paymentsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!existingOrderIds.has(doc.id) && !existingOrderIds.has(data.razorpay_order_id)) {
          orders.push({ id: doc.id, ...data });
          existingOrderIds.add(doc.id);
          if (data.razorpay_order_id) existingOrderIds.add(data.razorpay_order_id);
        }
      });

      // Calculate total revenue, orders, and status counts
      let totalRevenue = 0;
      let totalOrders = orders.length;
      let statusCounts = {
        completed: 0,
        processing: 0,
        shipped: 0,
        pending: 0,
        cancelled: 0
      };

      let paymentMethods = {
        card: 0,
        upi: 0,
        netbanking: 0,
        wallet: 0,
        cod: 0,
        other: 0
      };

      // Group by month for time series data
      const monthlyRevenue = {};
      const monthlyOrders = {};
      const monthlyAOV = {};

      // Geographic data
      const stateOrders = {};

      orders.forEach(order => {
        // Handle total revenue calculation
        let orderAmount = 0;
        if (order.amount) {
          // Razorpay stores amounts in paise (100 paise = 1 rupee)
          orderAmount = order.amount / 100;
        } else if (order.total_amount) {
          orderAmount = order.total_amount;
        } else if (order.orderTotal) {
          orderAmount = order.orderTotal;
        }

        // Skip cancelled orders in revenue calculation
        const status = order.status || 'pending';
        if (status !== 'cancelled') {
          totalRevenue += orderAmount;
        }

        // Count order statuses
        switch (status) {
          case 'completed':
            statusCounts.completed++;
            break;
          case 'processing':
            statusCounts.processing++;
            break;
          case 'shipped':
            statusCounts.shipped++;
            break;
          case 'pending':
            statusCounts.pending++;
            break;
          case 'cancelled':
            statusCounts.cancelled++;
            break;
          default:
            statusCounts.pending++;
        }

        // Count payment methods
        const method = order.payment_method || (order.razorpay_payment_id ? 'online' : 'other');
        if (method.includes('card')) paymentMethods.card++;
        else if (method.includes('upi')) paymentMethods.upi++;
        else if (method.includes('netbanking')) paymentMethods.netbanking++;
        else if (method.includes('wallet')) paymentMethods.wallet++;
        else if (method.includes('cod') || method.includes('cash')) paymentMethods.cod++;
        else paymentMethods.other++;

        // Group by month for time series
        const orderDate = order.created_at?.toDate?.() ||
          new Date(order.created_at || order.orderDate || Date.now());

        const monthKey = `${orderDate.getMonth()}-${orderDate.getFullYear()}`;

        // Add to monthly revenue
        if (!monthlyRevenue[monthKey]) monthlyRevenue[monthKey] = 0;
        if (status !== 'cancelled') monthlyRevenue[monthKey] += orderAmount;

        // Add to monthly orders
        if (!monthlyOrders[monthKey]) monthlyOrders[monthKey] = 0;
        monthlyOrders[monthKey]++;

        // Geographic data
        const state = order.shipping?.state ||
          order.shippingAddress?.state ||
          order.userDetails?.state ||
          'Unknown';

        if (state !== 'Unknown') {
          if (!stateOrders[state]) stateOrders[state] = 0;
          stateOrders[state]++;
        }
      });

      // Calculate AOV
      const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate monthly AOV
      const monthLabels = generateMonthLabels();
      const revenueValues = [];
      const orderValues = [];
      const aovValues = [];

      monthLabels.forEach(monthLabel => {
        const [month, year] = monthLabel.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = months.indexOf(month);
        const monthKey = `${monthIndex}-${year}`;

        const monthRevenue = monthlyRevenue[monthKey] || 0;
        const monthOrders = monthlyOrders[monthKey] || 0;
        const monthAov = monthOrders > 0 ? monthRevenue / monthOrders : 0;

        revenueValues.push(monthRevenue);
        orderValues.push(monthOrders);
        aovValues.push(monthAov);
      });

      // Get top 5 states by order count
      const topStates = Object.entries(stateOrders)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Set state with processed data
      setKpiData(prev => ({
        ...prev,
        totalRevenue,
        totalOrders,
        averageOrderValue: aov,
      }));

      setOrderStatusData(statusCounts);
      setPaymentMethodsData(paymentMethods);

      setMonthlyData(prev => ({
        ...prev,
        revenue: revenueValues,
        orders: orderValues,
        aov: aovValues
      }));

      setGeographicData({
        labels: topStates.map(state => state[0]),
        values: topStates.map(state => state[1])
      });

    } catch (error) {
      console.error('Error fetching orders data:', error);
      throw error;
    }
  };

  // Fetch users data
  const fetchUsersData = async (startTimestamp, endTimestamp) => {
    try {
      // Query all users
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = [];

      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      const totalUsers = users.length;

      // Count users created in the selected time range
      const usersInRange = users.filter(user => {
        if (!user.createdAt) return false;
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        return createdDate >= startTimestamp.toDate() && createdDate <= endTimestamp.toDate();
      });

      // Group by month for time series
      const monthlyNewUsers = {};

      usersInRange.forEach(user => {
        const createdDate = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const monthKey = `${createdDate.getMonth()}-${createdDate.getFullYear()}`;

        if (!monthlyNewUsers[monthKey]) monthlyNewUsers[monthKey] = 0;
        monthlyNewUsers[monthKey]++;
      });

      // Calculate new users by month
      const monthLabels = generateMonthLabels();
      const newUsersValues = [];
      const returningUsersValues = [];

      // Estimate returning users (for demo purposes - in a real app you'd track this)
      monthLabels.forEach(monthLabel => {
        const [month, year] = monthLabel.split(' ');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = months.indexOf(month);
        const monthKey = `${monthIndex}-${year}`;

        const newUsers = monthlyNewUsers[monthKey] || 0;
        // Estimate returning users as 40% of monthly orders
        const totalMonthlyOrders = monthlyData.orders[monthLabels.indexOf(monthLabel)] || 0;
        const returningUsers = Math.round(totalMonthlyOrders * 0.4);

        newUsersValues.push(newUsers);
        returningUsersValues.push(returningUsers);
      });

      // Set state with processed data
      setKpiData(prev => ({
        ...prev,
        totalUsers,
        // Estimate conversion rate at 3.5%
        conversionRate: 3.5,
        // Estimate return rate at 4.2%
        returnRate: 4.2
      }));

      setMonthlyData(prev => ({
        ...prev,
        newUsers: newUsersValues,
        returningUsers: returningUsersValues,
        // Mock data for conversion and abandonment rates
        conversionRate: [2.4, 2.8, 3.1, 3.5, 3.7, 4.0],
        abandonmentRate: [65, 62, 59, 57, 55, 53]
      }));

      // Estimate traffic sources (for demo - in a real app you'd track this)
      setTrafficSourcesData({
        labels: ['Direct', 'Organic Search', 'Social Media', 'Email', 'Referral', 'Paid Ads'],
        values: [30, 25, 20, 10, 10, 5]
      });

    } catch (error) {
      console.error('Error fetching users data:', error);
      throw error;
    }
  };

  // Fetch products data
  const fetchProductsData = async () => {
    try {
      // Query regular products
      const productsQuery = query(
        collection(db, 'products'),
        limit(100)
      );

      const [productsSnapshot] = await Promise.all([
        getDocs(productsQuery)
      ]);

      const products = [];
      productsSnapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });

      // Group products by category
      const categoryCounts = {};

      products.forEach(product => {
        const category = product.Category || product.category || 'Uncategorized';
        if (!categoryCounts[category]) categoryCounts[category] = 0;
        categoryCounts[category]++;
      });

      // Get top 5 categories
      const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // For demo purposes, generate top products
      // In a real app, you'd use actual sales data
      const demoTopProducts = [
        { name: 'British Tea Rose Candle', sales: 180 },
        { name: 'Lavender Dreams Candle', sales: 150 },
        { name: 'Vanilla Bliss Candle', sales: 130 },
        { name: 'Ocean Breeze Candle', sales: 110 },
        { name: 'Cinnamon Spice Candle', sales: 90 }
      ];

      setProductData({
        categories: {
          labels: topCategories.map(cat => cat[0]),
          values: topCategories.map(cat => cat[1])
        },
        topProducts: {
          labels: demoTopProducts.map(product => product.name),
          values: demoTopProducts.map(product => product.sales)
        }
      });

    } catch (error) {
      console.error('Error fetching products data:', error);
      throw error;
    }
  };

  // Prepare chart data objects based on the fetched data
  const revenueOrdersData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        backgroundColor: 'rgba(108, 71, 255, 0.2)',
        borderColor: '#6c47ff',
        data: monthlyData.revenue,
        type: 'line',
        yAxisID: 'y',
        tension: 0.4,
      },
      {
        label: 'Orders',
        backgroundColor: '#6c47ff',
        data: monthlyData.orders,
        borderRadius: 8,
        yAxisID: 'y1',
      }
    ],
  };

  const userGrowthData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'New Users',
        backgroundColor: '#f8961e',
        data: monthlyData.newUsers,
        borderRadius: 8,
      },
      {
        label: 'Returning Users',
        backgroundColor: '#4cc9f0',
        data: monthlyData.returningUsers,
        borderRadius: 8,
      },
    ],
  };

  const orderStatusChartData = {
    labels: ['Completed', 'Processing', 'Shipped', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          orderStatusData.completed,
          orderStatusData.processing,
          orderStatusData.shipped,
          orderStatusData.pending,
          orderStatusData.cancelled
        ],
        backgroundColor: ['#4cc9f0', '#6c47ff', '#f8961e', '#FFD166', '#f72585'],
        borderWidth: 0,
      },
    ],
  };

  const salesByCategoryData = {
    labels: productData.categories.labels,
    datasets: [
      {
        data: productData.categories.values,
        backgroundColor: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'],
        borderWidth: 0,
      },
    ],
  };

  const topProductsData = {
    labels: productData.topProducts.labels,
    datasets: [
      {
        label: 'Units Sold',
        backgroundColor: '#6c47ff',
        data: productData.topProducts.values,
        borderRadius: 8,
      },
    ],
  };

  const aovData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Average Order Value (₹)',
        data: monthlyData.aov,
        fill: true,
        backgroundColor: 'rgba(247, 37, 133, 0.08)',
        borderColor: '#f72585',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f72585',
      },
    ],
  };

  const conversionData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: monthlyData.conversionRate,
        fill: true,
        backgroundColor: 'rgba(76, 201, 240, 0.08)',
        borderColor: '#4cc9f0',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4cc9f0',
      },
      {
        label: 'Cart Abandonment Rate (%)',
        data: monthlyData.abandonmentRate,
        fill: true,
        backgroundColor: 'rgba(247, 37, 133, 0.08)',
        borderColor: '#f72585',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f72585',
      },
    ],
  };

  const paymentMethodsChartData = {
    labels: ['Credit Card', 'UPI', 'Net Banking', 'Wallet', 'COD', 'Other'],
    datasets: [
      {
        data: [
          paymentMethodsData.card,
          paymentMethodsData.upi,
          paymentMethodsData.netbanking,
          paymentMethodsData.wallet,
          paymentMethodsData.cod,
          paymentMethodsData.other
        ],
        backgroundColor: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#f8961e'],
        borderWidth: 0,
      },
    ],
  };

  const trafficSourcesChartData = {
    labels: trafficSourcesData.labels,
    datasets: [
      {
        data: trafficSourcesData.values,
        backgroundColor: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#f8961e'],
        borderWidth: 0,
      },
    ],
  };

  const geographicChartData = {
    labels: geographicData.labels,
    datasets: [
      {
        label: 'Orders by State',
        backgroundColor: '#6c47ff',
        data: geographicData.values,
        borderRadius: 8,
      },
    ],
  };

  // Format currency
  const formatCurrency = (value) => {
    return '₹' + value.toLocaleString('en-IN');
  };

  // KPI metrics
  const kpiMetrics = [
    {
      icon: <FaRupeeSign />,
      label: 'Total Revenue',
      value: formatCurrency(kpiData.totalRevenue),
      change: '+15%'
    },
    {
      icon: <FaShoppingCart />,
      label: 'Total Orders',
      value: kpiData.totalOrders,
      change: '+8%'
    },
    {
      icon: <FaUsers />,
      label: 'Total Users',
      value: kpiData.totalUsers,
      change: '+12%'
    },
    {
      icon: <FaRupeeSign />,
      label: 'Avg. Order Value',
      value: formatCurrency(kpiData.averageOrderValue),
      change: '+5%'
    },
    {
      icon: <FaChartLine />,
      label: 'Conversion Rate',
      value: kpiData.conversionRate + '%',
      change: '+0.7%'
    },
    {
      icon: <FaExchangeAlt />,
      label: 'Return Rate',
      value: kpiData.returnRate + '%',
      change: '-0.5%'
    },
  ];

  // Function to convert data to CSV format
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    // Get headers
    const headers = Object.keys(data[0]).join(',');

    // Get rows
    const rows = data.map(item =>
      Object.values(item)
        .map(value => {
          // Handle strings with commas by wrapping in quotes
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  };

  // Function to download CSV
  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export revenue and orders data
  const exportRevenueOrdersData = () => {
    const data = monthlyData.labels.map((label, index) => ({
      Month: label,
      Revenue: monthlyData.revenue[index] || 0,
      Orders: monthlyData.orders[index] || 0,
      AverageOrderValue: monthlyData.aov[index] || 0
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, `revenue_orders_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export customer insights data
  const exportCustomerData = () => {
    const data = monthlyData.labels.map((label, index) => ({
      Month: label,
      NewUsers: monthlyData.newUsers[index] || 0,
      ReturningUsers: monthlyData.returningUsers[index] || 0,
      ConversionRate: monthlyData.conversionRate[index] || 0,
      CartAbandonment: monthlyData.abandonmentRate[index] || 0
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, `customer_insights_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export product performance data
  const exportProductData = () => {
    // Categories data
    const categoriesData = productData.categories.labels.map((label, index) => ({
      Category: label,
      Count: productData.categories.values[index] || 0
    }));

    // Top products data
    const productsData = productData.topProducts.labels.map((label, index) => ({
      Product: label,
      UnitsSold: productData.topProducts.values[index] || 0
    }));

    const categoriesCsv = convertToCSV(categoriesData);
    const productsCsv = convertToCSV(productsData);

    downloadCSV(categoriesCsv, `product_categories_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => {
      downloadCSV(productsCsv, `top_products_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    }, 100);
  };

  // Export order status data
  const exportOrderStatusData = () => {
    const statusData = [
      { Status: 'Completed', Count: orderStatusData.completed },
      { Status: 'Processing', Count: orderStatusData.processing },
      { Status: 'Shipped', Count: orderStatusData.shipped },
      { Status: 'Pending', Count: orderStatusData.pending },
      { Status: 'Cancelled', Count: orderStatusData.cancelled }
    ];

    const paymentData = [
      { Method: 'Credit Card', Count: paymentMethodsData.card },
      { Method: 'UPI', Count: paymentMethodsData.upi },
      { Method: 'Net Banking', Count: paymentMethodsData.netbanking },
      { Method: 'Wallet', Count: paymentMethodsData.wallet },
      { Method: 'COD', Count: paymentMethodsData.cod },
      { Method: 'Other', Count: paymentMethodsData.other }
    ];

    const statusCsv = convertToCSV(statusData);
    const paymentCsv = convertToCSV(paymentData);

    downloadCSV(statusCsv, `order_status_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => {
      downloadCSV(paymentCsv, `payment_methods_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    }, 100);
  };

  // Export geographic data
  const exportGeographicData = () => {
    const data = geographicData.labels.map((label, index) => ({
      State: label,
      Orders: geographicData.values[index] || 0
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, `geographic_data_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Export all data
  const exportAllData = () => {
    exportRevenueOrdersData();
    setTimeout(() => exportCustomerData(), 200);
    setTimeout(() => exportProductData(), 400);
    setTimeout(() => exportOrderStatusData(), 600);
    setTimeout(() => exportGeographicData(), 800);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <FaSpinner className="spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="analytics-admin-page">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="analytics-controls">
          <select value={timeRange} onChange={handleTimeRangeChange} className="time-range-selector">
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="export-all-btn" onClick={exportAllData} title="Export all analytics data">
            <FaDownload /> Export All
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="analytics-kpi-grid">
        {kpiMetrics.map((metric, index) => (
          <div className="kpi-card" key={index}>
            <div className="kpi-icon">{metric.icon}</div>
            <div className="kpi-content">
              <div className="kpi-label">{metric.label}</div>
              <div className="kpi-value">{metric.value}</div>
              <div className={`kpi-change ${metric.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Revenue & Orders</h3>
          <button className="export-btn" onClick={exportRevenueOrdersData} title="Export revenue and orders data">
            <FaFileCsv />
          </button>
        </div>
        <div className="analytics-charts-row">
          <div className="analytics-chart analytics-double-y-chart">
            <Bar
              data={revenueOrdersData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Revenue (₹)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Orders'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                }
              }}
              height={250}
            />
          </div>
          <div className="analytics-chart analytics-line-chart">
            <h4>Average Order Value</h4>
            <Line
              data={aovData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Customer Insights</h3>
          <button className="export-btn" onClick={exportCustomerData} title="Export customer insights data">
            <FaFileCsv />
          </button>
        </div>
        <div className="analytics-charts-row">
          <div className="analytics-chart analytics-bar-chart">
            <h4>User Growth</h4>
            <Bar
              data={userGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top'
                  }
                }
              }}
              height={250}
            />
          </div>
          <div className="analytics-chart analytics-line-chart">
            <h4>Conversion & Cart Abandonment Rates</h4>
            <Line
              data={conversionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: function (value) {
                        return value + '%';
                      }
                    }
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Product Performance Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Product Performance</h3>
          <button className="export-btn" onClick={exportProductData} title="Export product performance data">
            <FaFileCsv />
          </button>
        </div>
        <div className="analytics-charts-row">
          <div className="analytics-chart analytics-pie-chart">
            <h4>Sales by Category</h4>
            <Pie
              data={salesByCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
              height={250}
            />
          </div>
          <div className="analytics-chart analytics-bar-chart">
            <h4>Top Selling Products</h4>
            <Bar
              data={topProductsData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Order Status Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Order Analytics</h3>
          <button className="export-btn" onClick={exportOrderStatusData} title="Export order analytics data">
            <FaFileCsv />
          </button>
        </div>
        <div className="analytics-charts-row">
          <div className="analytics-chart analytics-donut-chart">
            <h4>Order Status</h4>
            <Doughnut
              data={orderStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
              height={250}
            />
          </div>
          <div className="analytics-chart analytics-donut-chart">
            <h4>Payment Methods</h4>
            <Doughnut
              data={paymentMethodsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>

      {/* Traffic & Geographic Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3>Traffic & Geographic Insights</h3>
          <button className="export-btn" onClick={exportGeographicData} title="Export geographic data">
            <FaFileCsv />
          </button>
        </div>
        <div className="analytics-charts-row">
          <div className="analytics-chart analytics-pie-chart">
            <h4>Traffic Sources</h4>
            <Pie
              data={trafficSourcesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
              height={250}
            />
          </div>
          <div className="analytics-chart analytics-bar-chart">
            <h4>Top States by Orders</h4>
            <Bar
              data={geographicChartData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 