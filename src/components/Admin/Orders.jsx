import React, { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaSearch, FaFilter, FaDownload, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import './Orders.css';
import { getAllOrdersForAdmin, updateOrderStatus, deleteOrder } from '../../firebase/firestore';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Helper function to get the first image from a comma-separated list
  const getFirstImage = (imageField) => {
    if (!imageField) return null;
    const imagesArr = imageField.split(',').map(img => img.trim()).filter(Boolean);
    if (imagesArr.length > 0) {
      return imagesArr[0].startsWith('/') ? imagesArr[0] : `/${imagesArr[0]}`;
    }
    return null;
  };

  // Function to count images in a comma-separated string
  const countImages = (imageUrl) => {
    if (!imageUrl) return 0;
    return imageUrl.includes(',') ? imageUrl.split(',').length : 1;
  };
  
  // Helper function to format address object to string
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    
    // If address is already a string, return it
    if (typeof address === 'string') return address;
    
    // If address is an object, format it
    if (typeof address === 'object') {
      try {
        const parts = [];
        if (address.fullName) parts.push(address.fullName);
        if (address.addressLine1) parts.push(address.addressLine1);
        if (address.addressLine2) parts.push(address.addressLine2);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.pincode) parts.push(address.pincode);
        if (address.mobile) parts.push(`Phone: ${address.mobile}`);
        
        return parts.length > 0 ? parts.join(', ') : 'N/A';
      } catch (err) {
        console.error('Error formatting address:', err);
        return 'Address formatting error';
      }
    }
    
    return 'N/A';
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getAllOrdersForAdmin();
      
      console.log("Raw orders data from Firebase:", ordersData);
      
      // Transform the data to handle different formats from both collections
      const transformedOrders = ordersData.map(order => {
        // Extract customer info based on the source
        let customerName = 'N/A';
        let customerEmail = 'N/A';
        let customerPhone = 'N/A';
        let shippingAddress = 'N/A';
        
        if (order.source === 'orders') {
          // Standard orders collection format
          customerName = order.customer?.name || 'N/A';
          customerEmail = order.customer?.email || 'N/A';
          customerPhone = order.customer?.phone || 'N/A';
          shippingAddress = formatAddress(order.shipping?.address);
        } else {
          // successfulPayments collection format
          customerName = order.userDetails?.name || order.userDetails?.firstName || 'N/A';
          customerEmail = order.userDetails?.email || 'N/A';
          customerPhone = order.userDetails?.phone || order.userDetails?.mobile || 'N/A';
          shippingAddress = formatAddress(order.shippingAddress || order.userDetails?.address);
        }
        
        // Handle different date formats
        let createdDate;
        if (order.created_at?.toDate) {
          createdDate = order.created_at.toDate();
        } else if (order.created_at) {
          createdDate = new Date(order.created_at);
        } else if (order.orderDate) {
          createdDate = new Date(order.orderDate);
        } else {
          createdDate = new Date();
        }
        
        // Handle different amount formats (paise vs rupees)
        let totalAmount;
        if (order.amount) {
          // Razorpay stores amounts in paise (100 paise = 1 rupee)
          totalAmount = order.amount;
        } else if (order.total_amount) {
          totalAmount = order.total_amount;
        } else if (order.orderTotal) {
          totalAmount = order.orderTotal;
        } else {
          totalAmount = 0;
        }
        
        // Log all possible status fields for debugging
        console.log(`Order ${order.id || order.razorpay_order_id} status fields:`, {
          fulfillment_status: order.fulfillment_status,
          status: order.status,
          payment_status: order.payment_status,
          orderStatus: order.orderStatus,
          all_order_keys: Object.keys(order)
        });
        
        // Determine the status - try all possible status fields
        let orderStatus = 'pending';
        
        // Check all possible status fields in order of priority
        if (order.status) {
          orderStatus = order.status;
        } else if (order.payment_status) {
          orderStatus = order.payment_status;
        } else if (order.fulfillment_status) {
          orderStatus = order.fulfillment_status;
        } else if (order.orderStatus) {
          orderStatus = order.orderStatus;
        }
        
        console.log(`Final status for order ${order.id}: ${orderStatus}`);
        
        return {
          ...order,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          total_amount: totalAmount,
          items: order.items || [],
          created_at: createdDate,
          formatted_date: createdDate.toLocaleDateString(),
          formatted_time: createdDate.toLocaleTimeString(),
          status: orderStatus,
          fulfillment_status: orderStatus
        };
      });
      
      setOrders(transformedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    // Create a serializable version of the order object
    const serializableOrder = {
      ...order,
      // Convert Date object to ISO string
      created_at: order.created_at ? new Date(order.created_at) : new Date(),
      // Ensure items are properly serialized
      items: order.items ? order.items.map(item => ({
        ...item,
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 1, 10),
        // Process image field if it exists
        processedImage: item.image ? getFirstImage(item.image) : null,
        imageCount: item.image ? countImages(item.image) : 0
      })) : [],
      // Ensure all properties are serializable
      total_amount: parseFloat(order.total_amount || 0),
      // Add other needed properties
      customer_name: order.customer_name || 'N/A',
      customer_email: order.customer_email || 'N/A',
      customer_phone: order.customer_phone || 'N/A',
      shipping_address: typeof order.shipping_address === 'object' 
        ? formatAddress(order.shipping_address) 
        : (order.shipping_address || 'N/A'),
      shippingAddress: order.shippingAddress || {},
      id: order.id || '',
      source: order.source || 'orders',
      status: order.status || 'pending',
      razorpay_order_id: order.razorpay_order_id || '',
      razorpay_payment_id: order.razorpay_payment_id || '',
      payment_method: order.payment_method || '',
      payment_status: order.payment_status || '',
      notes: order.notes || ''
    };
    
    setSelectedOrder(serializableOrder);
    setShowModal(true);
  };

  const handleDelete = async (id, source) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        console.log(`Deleting order ${id} from ${source} collection`);
        await deleteOrder(id, source);
        await fetchOrders(); // Refresh the orders list
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (orderId, newStatus, source) => {
    try {
      console.log(`Updating order ${orderId} from ${source} to status: ${newStatus}`);
      
      // Update the UI immediately first for responsiveness
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            console.log(`Updating local state for order ${orderId} to ${newStatus}`);
            return {
              ...order,
              status: newStatus,
              fulfillment_status: newStatus
            };
          }
          return order;
        })
      );
      
      // Then update the database
      await updateOrderStatus(orderId, newStatus, source);
      console.log(`Status update sent to database for order ${orderId}`);
      
      // Refresh the orders from the server to ensure we have the latest data
      setTimeout(() => {
        console.log("Refreshing orders after status update");
        fetchOrders();
      }, 500); // Small delay to ensure the database has time to update
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status: ' + err.message);
      
      // Refresh orders anyway to ensure UI is in sync with the database
      fetchOrders();
    }
  };

  // Filter and search functions
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        (order.razorpay_order_id && order.razorpay_order_id.toLowerCase().includes(search)) ||
        (order.id && order.id.toLowerCase().includes(search)) ||
        order.customer_name.toLowerCase().includes(search) ||
        order.customer_email.toLowerCase().includes(search) ||
        order.customer_phone.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const exportToCSV = () => {
    // Create CSV data
    const headers = ['Order ID', 'Source', 'Customer', 'Email', 'Phone', 'Date', 'Amount', 'Status'];
    const csvData = filteredOrders.map(order => [
      order.razorpay_order_id || order.id,
      order.source || 'orders',
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.formatted_date,
      order.total_amount.toFixed(2),
      order.status
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Orders Management</h2>
        <div className="orders-count">
          <span>Total Orders: {orders.length}</span>
          {error && <div className="error-banner"><FaExclamationCircle /> {error}</div>}
        </div>
      </div>

      <div className="orders-controls">
        <div className="search-box">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FaFilter />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button className="export-btn" onClick={exportToCSV}>
          <FaDownload /> Export CSV
        </button>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Payment</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th style={{ position: 'sticky', right: '100px', backgroundColor: 'white', zIndex: 1, minWidth: '140px' }}>Delivery Status</th>
              <th style={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 2, width: '100px', minWidth: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-orders">No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.razorpay_order_id || order.id}</td>
                  <td>
                    <span className={`source-badge ${order.source}`}>
                      {order.source || 'orders'}
                    </span>
                  </td>
                  <td>{order.userDetails?.firstName || order.customer_name}</td>
                  <td>{order.formatted_date}</td>
                  <td>₹{order.total_amount.toFixed(2)}</td>
                  <td style={{ position: 'sticky', right: '100px', backgroundColor: 'white', zIndex: 1, minWidth: '140px' }}>
                    <select
                      value={order.status || order.payment_status || order.fulfillment_status || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value, order.source)}
                      className={`status-select ${order.status || order.payment_status || order.fulfillment_status || 'pending'}`}
                      style={{ width: '100%' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="action-buttons" style={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 2, width: '100px', minWidth: '100px',marginTop: '0rem', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewOrder(order)}
                        title="View Order Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(order.id, order.source)}
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close-x"
              onClick={() => {
                setShowModal(false);
                setSelectedOrder(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1000,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              title="Close"
            >
              <FaTimes />
            </button>
            
            <h3>Order Details</h3>
            
            <div className="order-id-section">
              <h4>Order #{selectedOrder.razorpay_order_id || selectedOrder.id}</h4>
              <div className="order-meta">
                <span className={`status-badge ${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
                <span className={`source-badge ${selectedOrder.source}`}>
                  {selectedOrder.source || 'orders'}
                </span>
              </div>
            </div>
            
            <div className="order-sections">
              <div className="order-section">
                <h4>Customer Information</h4>
                <div className="order-details">
                  <div className="detail-group">
                    <label>Name:</label>
                    <span>{selectedOrder.shippingAddress?.fullName || selectedOrder.customer_name}</span>
                  </div>
                  <div className="detail-group">
                    <label>Email:</label>
                    <span>{selectedOrder.shippingAddress?.userEmail || selectedOrder.customer_email}</span>
                  </div>
                  <div className="detail-group">
                    <label>Phone:</label>
                    <span>{selectedOrder.shippingAddress?.mobile || selectedOrder.customer_phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-section">
                <h4>Shipping Information</h4>
                <div className="order-details">
                  <div className="detail-group">
                    <label>Address:</label>
                    <span>{selectedOrder.shipping_address}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-section">
                <h4>Order Information</h4>
                <div className="order-details">
                  <div className="detail-group">
                    <label>Order Date:</label>
                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                  <div className="detail-group">
                    <label>Total Amount:</label>
                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="detail-group">
                    <label>Status:</label>
                    <select
                      value={selectedOrder.status || selectedOrder.payment_status || selectedOrder.fulfillment_status || 'pending'}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value, selectedOrder.source)}
                      className={`status-select ${selectedOrder.status || selectedOrder.payment_status || selectedOrder.fulfillment_status || 'pending'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="order-section">
                <h4>Payment Information</h4>
                <div className="order-details">
                  {selectedOrder.razorpay_payment_id ? (
                    <>
                      <div className="detail-group">
                        <label>Payment ID:</label>
                        <span>{selectedOrder.razorpay_payment_id}</span>
                      </div>
                      <div className="detail-group">
                        <label>Payment Method:</label>
                        <span>{selectedOrder.payment_method || 'Razorpay'}</span>
                      </div>
                      <div className="detail-group">
                        <label>Payment Status:</label>
                        <span className="status-badge success">
                          {selectedOrder.payment_status || 'Successful'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="detail-group">
                      <span>Payment information not available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-items">
              <h4>Order Items</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.processedImage ? (
                            <img src={item.processedImage} alt={item.name} className="item-image" />
                          ) : item.image ? (
                            <img src={item.image} alt={item.name} className="item-image" />
                          ) : null}
                          <span>{item.name}</span>
                          {/* {item.imageCount > 1 && (
                            <small className="image-count">+{item.imageCount - 1} more</small>
                          )} */}
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan="3">Total</td>
                      <td>₹{selectedOrder.total_amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="no-items">No items found for this order</p>
              )}
            </div>

            <div className="order-notes">
              <h4>Order Notes</h4>
              <textarea 
                placeholder="Add notes about this order..." 
                defaultValue={selectedOrder.notes || ''}
                className="order-notes-textarea"
              ></textarea>
            </div>

            <div className="modal-buttons">
              <button 
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  setSelectedOrder(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .orders-table-container {
          overflow-x: auto;
          position: relative;
        }
        
        .view-btn, .delete-btn {
          padding: 6px 10px;
          min-width: 36px;
        }
        
        .orders-table th, .orders-table td {
          padding: 10px;
          white-space: nowrap;
        }
        
        .orders-table th:not(:last-child),
        .orders-table td:not(:last-child) {
          border-right: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};

export default Orders; 