import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Payment.css";
import { createRazorpayOrder, verifyPayment, testRazorpayConnection, createTestOrder } from "../../firebase/functions";
import { saveSuccessfulPayment, getUser } from "../../firebase/firestore";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import AddressForm from "../../Component/AddressManagement/AddressForm";

// Custom simple icons to avoid SVG path errors
const SimpleLocationIcon = () => (
  <span className="simple-icon location-icon">📍</span>
);

const SimplePlusIcon = () => (
  <span className="simple-icon plus-icon">+</span>
);

const Payment = ({ onClose, total, promoCode = '', discount = 0 }) => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  // Address selection state
  const [showAddressSelection, setShowAddressSelection] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Calculate final total after applying discount
  const finalTotal = Math.max(0, total - (discount || 0));

  // Fetch user details if logged in
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.uid) {
        try {
          const userData = await getUser(user.uid);
          setUserDetails(userData);
        } catch (err) {
          console.error('[PAYMENT] Error fetching user details:', err);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  // Fetch user addresses
  useEffect(() => {
    if (user && user.uid) {
      fetchAddresses();
    } else {
      setAddressesLoading(false);
      setAddresses([]);
    }
  }, [user]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setError("");

    try {
      // Check if user exists and has uid
      if (!user || !user.uid) {
        console.error('No user ID available to fetch addresses');
        setAddresses([]);
        setAddressesLoading(false);
        return;
      }

      console.log("Fetching addresses for user:", user.uid);

      // Use Firebase directly to fetch addresses
      const addressesQuery = query(
        collection(db, "addresses"),
        where("userId", "==", user.uid)
      );

      console.log("Executing Firestore query...");
      const querySnapshot = await getDocs(addressesQuery);
      console.log(`Found ${querySnapshot.size} addresses`);

      const addressList = [];

      querySnapshot.forEach((doc) => {
        addressList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log("Processed address list:", addressList);
      setAddresses(addressList);

      // Select default address if exists
      const defaultAddress = addressList.find(addr => addr.isDefault);
      if (defaultAddress) {
        console.log("Setting default address:", defaultAddress.id);
        setSelectedAddressId(defaultAddress.id);
        setSelectedAddress(defaultAddress);
      } else if (addressList.length > 0) {
        console.log("No default address found, using first address");
        setSelectedAddressId(addressList[0].id);
        setSelectedAddress(addressList[0]);
      } else {
        console.log("No addresses found for user");
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      console.error('Error details:', error.code, error.message);
      setAddresses([]);
      setError("Failed to load addresses: " + error.message);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      // Check if user exists and has uid
      if (!user || !user.uid) {
        setError("You must be logged in to save an address");
        return;
      }

      setLoading(true);

      // Add user ID and other metadata to the form data
      const addressData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log("Saving address data:", addressData);

      try {
        // Use Firebase directly to save the address
        const docRef = await addDoc(collection(db, "addresses"), addressData);
        console.log("Address saved with ID:", docRef.id);

        // If this is the first address or marked as default
        if (addresses.length === 0 || addressData.isDefault) {
          // Set any previous default address to non-default
          if (addresses.length > 0) {
            const prevDefault = addresses.find(addr => addr.isDefault);
            if (prevDefault) {
              console.log("Updating previous default address:", prevDefault.id);
              await updateDoc(doc(db, "addresses", prevDefault.id), {
                isDefault: false,
                updatedAt: new Date()
              });
            }
          }
        }

        // Add the new address to the local state
        const newAddress = {
          id: docRef.id,
          ...addressData
        };

        setAddresses(prev => [...prev, newAddress]);
        setSelectedAddressId(newAddress.id);
        setSelectedAddress(newAddress);
        setShowAddressForm(false);
        setError("");

      } catch (firestoreError) {
        console.error('Firestore error saving address:', firestoreError);
        setError(`Failed to save address: ${firestoreError.message}`);
      }
    } catch (error) {
      console.error('Error in save address function:', error);
      setError("Error saving address: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteDoc(doc(db, "addresses", addressId));
      setAddresses(addresses.filter(addr => addr.id !== addressId));

      if (selectedAddressId === addressId) {
        if (addresses.length > 1) {
          const nextAddress = addresses.find(addr => addr.id !== addressId);
          if (nextAddress) {
            setSelectedAddressId(nextAddress.id);
            setSelectedAddress(nextAddress);
          } else {
            setSelectedAddressId(null);
            setSelectedAddress(null);
          }
        } else {
          setSelectedAddressId(null);
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      setError("Failed to delete address. Please try again.");
    }
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    setSelectedAddress(address);
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setShowAddressSelection(false);
  };

  const handleBackToAddresses = () => {
    setShowAddressSelection(true);
  };

  // COD state
  const [showCODForm, setShowCODForm] = useState(false);
  const [codForm, setCodForm] = useState({
    name: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    deliveryTime: ''
  });
  const [codSuccess, setCodSuccess] = useState(false);

  const handleCODChange = (e) => {
    setCodForm({ ...codForm, [e.target.name]: e.target.value });
  };

  const handleCODSubmit = (e) => {
    e.preventDefault();
    setCodSuccess(true);
    setShowCODForm(false);

    // Create new order object
    const newOrder = {
      id: 'ORD' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      total: getCartTotal(),
      address: { ...codForm },
      items: cart.map(item => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
        image: item.image
      }))
    };

    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Add new order
    localStorage.setItem('orders', JSON.stringify([newOrder, ...existingOrders]));

    clearCart();
  };

  const displayRazorpay = async () => {
    setLoading(true);
    setError("");

    try {
      const amount = Number(total); // Use the total prop which includes shipping
      console.log('[PAYMENT] Starting payment process with amount:', amount);

      if (amount <= 0) {
        console.error('[PAYMENT] Invalid amount:', amount);
        setError("Invalid payment amount");
        return;
      }

      // Create order using Firebase callable function
      console.log('[PAYMENT] Creating Razorpay order...');
      const orderResponse = await createRazorpayOrder(amount);
      console.log('[PAYMENT] Order created successfully:', orderResponse);

      if (!orderResponse || !orderResponse.id) {
        console.error('[PAYMENT] Failed to get valid order response:', orderResponse);
        setError("Failed to create payment order");
        return;
      }

      // Format address for Razorpay
      const formattedAddress = selectedAddress ?
        `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ''}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.pincode}` :
        "No address provided";

      // Initialize Razorpay options - Following documentation more closely
      const options = {
        key: "rzp_live_oR04gue1fn6wcY", // Updated to production key
        // Convert final total to paisa and ensure it's an integer
        amount: Math.round(finalTotal * 100),
        currency: orderResponse.currency,
        name: "UniqueStore",
        description: "Premium Lifestyle Essentials",
        order_id: orderResponse.id,
        callback_url: "https://us-central1-uniquestore-37fb9.cloudfunctions.net/verifyPaymentCallback", // Add callback URL
        redirect: false, // Disable redirect to prevent the error
        prefill: {
          name: selectedAddress ? selectedAddress.fullName : "Customer",
          email: user?.email || "customer@example.com",
          contact: selectedAddress ? selectedAddress.mobile : "9999999999"
        },
        notes: {
          address: formattedAddress
        },
        theme: {
          color: "#000000"
        },
        handler: async function (response) {
          try {
            console.log('[PAYMENT] Handler triggered with response:', response);

            if (!response.razorpay_payment_id) {
              console.error('[PAYMENT] Missing payment ID in response');
            }
            if (!response.razorpay_order_id) {
              console.error('[PAYMENT] Missing order ID in response');
            }
            if (!response.razorpay_signature) {
              console.error('[PAYMENT] Missing signature in response');
            }

            if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
              console.error('[PAYMENT] Invalid payment response - missing required fields');
              setError("Invalid payment response");
              return;
            }

            // Save successful payment to backup collection first
            console.log('[PAYMENT] Saving payment details to backup collection...');
            try {
              // Get promo code and discount from URL or props
              const urlParams = new URLSearchParams(window.location.search);
              const promoCode = urlParams.get('promoCode') || '';
              const discount = parseFloat(urlParams.get('discount')) || 0;

              await saveSuccessfulPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: options.amount / 100, // Convert from paisa to rupees
                currency: options.currency,
                items: cart.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price,
                  image: item.image,
                  id: item.id || item._id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                })),
                userId: user?.uid || null,
                userDetails: userDetails || {
                  name: options.prefill?.name || 'Guest Customer',
                  email: options.prefill?.email || '',
                  phone: options.prefill?.contact || '',
                  address: options.notes?.address || ''
                },
                shippingAddress: selectedAddress || options.notes?.address || '',
                orderDate: new Date().toISOString(),
                orderTotal: finalTotal,
                originalTotal: total,
                promoCode: promoCode,
                discountApplied: discount,
                promoCode: promoCode,
                discount: discount,
                subtotal: total + discount, // Add discount back to get the original subtotal
              });
              console.log('[PAYMENT] Successfully saved payment to backup collection');
            } catch (backupError) {
              console.error('[PAYMENT] Error saving to backup collection:', backupError);
              // Continue despite backup error
            }

            // Verify payment using Firebase callable function
            console.log('[PAYMENT] Verifying payment with backend...');
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            console.log('[PAYMENT] Verification data:', verificationData);

            try {
              const verifyResponse = await verifyPayment(verificationData);
              console.log('[PAYMENT] Verification response received:', verifyResponse);

              if (verifyResponse.verified) {
                console.log('[PAYMENT] Payment successfully verified!');
                alert('Payment Successful');

                console.log('[PAYMENT] Clearing cart...');
                clearCart();
              }
            } catch (verifyError) {
              console.error('[PAYMENT] Verification error:', verifyError);
              // Continue despite verification error - just log it
            }

            // Always navigate to success page if we have payment ID
            // This happens regardless of verification or database errors
            console.log('[PAYMENT] Navigating to success page...');
            navigate(`/payment-success?order_id=${response.razorpay_order_id}`);
            console.log('[PAYMENT] Navigation triggered');

          } catch (err) {
            console.error('[PAYMENT] Error in handler function:', err);
            console.error('[PAYMENT] Error details:', {
              message: err.message,
              stack: err.stack,
              code: err.code,
              details: err.details
            });
            setError("Error verifying payment: " + (err.message || JSON.stringify(err)));

            // Even if there's a major error, try to navigate to success if we have payment_id
            if (response && response.razorpay_payment_id && response.razorpay_order_id) {
              navigate(`/payment-success?order_id=${response.razorpay_order_id}`);
            }
          }
        }
      };

      console.log('[PAYMENT] Initializing Razorpay with options:', {
        ...options,
        key: options.key.substring(0, 5) + '...'  // Don't log full key
      });

      // Create and open Razorpay instance
      console.log('[PAYMENT] Creating Razorpay instance...');
      const paymentObject = new window.Razorpay(options);
      console.log('[PAYMENT] Razorpay instance created');

      console.log('[PAYMENT] Opening Razorpay payment form...');
      paymentObject.open();
      console.log('[PAYMENT] Razorpay payment form opened');
    } catch (err) {
      console.error('[PAYMENT] Error in displayRazorpay function:', err);
      console.error('[PAYMENT] Error details:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        name: err.name,
        data: err.data
      });
      setError("Error in payment processing: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[PAYMENT] Processing COD order');

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const orderId = 'UNIQ-COD-' + Date.now();

      // Save order to Firestore (using the same structure as successful payments but marked as COD)
      await saveSuccessfulPayment({
        orderId: orderId,
        paymentId: 'COD-' + Math.random().toString(36).substr(2, 9),
        signature: 'COD_ORDER',
        amount: total,
        currency: 'INR',
        payment_method: 'Cash on Delivery',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          id: item.id || item._id || `item-${Date.now()}`
        })),
        userId: user?.uid || null,
        userDetails: userDetails || {
          name: selectedAddress.fullName,
          email: user?.email || '',
          phone: selectedAddress.mobile,
          address: `${selectedAddress.addressLine1}, ${selectedAddress.city}`
        },
        shippingAddress: selectedAddress,
        orderDate: new Date().toISOString(),
        orderTotal: total,
        originalTotal: total,
        promoCode: promoCode,
        discountApplied: discount,
        status: 'Pending (COD)'
      });

      console.log('[PAYMENT] COD Order saved successfully');

      // Clear cart
      clearCart();

      // Success alert and navigation
      alert('Order Placed Successfully! (Cash on Delivery)');
      navigate(`/payment-success?order_id=${orderId}&method=cod`);

    } catch (err) {
      console.error('[PAYMENT] Error saving COD order:', err);
      setError("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add test function
  const handleTestOrder = async () => {
    setLoading(true);
    setError("");

    try {
      // Create test order
      const orderResponse = await createTestOrder();
      console.log('Test order created:', orderResponse);

      // Show success
      setError("Test order success! Order ID: " + orderResponse.id);
    } catch (err) {
      console.error('Test order error:', err);
      setError("Test order error: " + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const testDirectRazorpay = () => {
    setLoading(true);
    setError("");

    try {
      console.log('Testing direct Razorpay integration');

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        console.log('Razorpay script loaded successfully');

        // Create a simple test options object
        const options = {
          key: "rzp_live_oR04gue1fn6wcY", // Updated to production key
          amount: "10000", // 100 INR
          currency: "INR",
          name: "UniqueStore Test",
          description: "Test Transaction",
          // No order_id needed for testing
          prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#000000"
          },
          handler: function (response) {
            console.log('Test payment response:', response);
            alert('Test payment captured');
          }
        };

        console.log('Initializing Razorpay with test options');

        try {
          const rzp = new window.Razorpay(options);
          console.log('Razorpay object created:', rzp);
          rzp.open();
          console.log('Razorpay opened');
        } catch (err) {
          console.error('Error initializing Razorpay:', err);
          setError("Error initializing Razorpay: " + err.message);
        }
      };

      script.onerror = (err) => {
        console.error('Failed to load Razorpay script:', err);
        setError("Failed to load Razorpay script");
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error('Razorpay test error:', err);
      setError("Razorpay test error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {showAddressSelection ? (
          <>
            <h2><SimpleLocationIcon /> Select Delivery Address</h2>

            {addressesLoading ? (
              <div className="address-loading">Loading addresses...</div>
            ) : (
              <>
                {addresses.length === 0 ? (
                  <div className="no-addresses-message">
                    <p>You don't have any saved addresses. Please add a new address to continue.</p>
                    <button
                      className="add-address-btn"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <SimplePlusIcon /> Add New Address
                    </button>
                  </div>
                ) : (
                  <>
                    {!showAddressForm && (
                      <>
                        <div className="addresses-list">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                              onClick={() => handleSelectAddress(address.id)}
                            >
                              <div className="address-selection">
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={selectedAddressId === address.id}
                                  onChange={() => handleSelectAddress(address.id)}
                                />
                              </div>
                              <div className="address-content">
                                {address.isDefault && <span className="default-badge">Default</span>}
                                <div className="address-name">{address.fullName}</div>
                                <div className="address-mobile">{address.mobile}</div>
                                <div className="address-details">
                                  {address.addressLine1},
                                  {address.addressLine2 && <> {address.addressLine2},</>}
                                  <br />
                                  {address.city}, {address.state} {address.pincode}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          className="add-another-address-btn"
                          onClick={() => setShowAddressForm(true)}
                        >
                          <SimplePlusIcon /> Add New Address
                        </button>
                      </>
                    )}

                    {showAddressForm ? (
                      <AddressForm
                        onSave={handleSaveAddress}
                        onCancel={() => setShowAddressForm(false)}
                      />
                    ) : (
                      <div className="address-selection-actions">
                        <button
                          className="cancel-btn"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button
                          className="continue-btn"
                          onClick={handleContinueToPayment}
                          disabled={!selectedAddressId}
                        >
                          Deliver to this Address
                        </button>
                      </div>
                    )}
                  </>
                )}

                {addresses.length === 0 && showAddressForm && (
                  <AddressForm
                    onSave={handleSaveAddress}
                    onCancel={() => setShowAddressForm(false)}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <h2>Checkout</h2>

            <div className="selected-address-summary">
              <div className="address-header">
                <h3><SimpleLocationIcon /> Delivery Address</h3>
                <button className="change-address-btn" onClick={handleBackToAddresses}>
                  Change
                </button>
              </div>
              <div className="address-details">
                <div className="address-name">{selectedAddress.fullName}</div>
                <div className="address-mobile">{selectedAddress.mobile}</div>
                <div>
                  {selectedAddress.addressLine1},
                  {selectedAddress.addressLine2 && <> {selectedAddress.addressLine2},</>}
                  <br />
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </div>
              </div>
            </div>

            <div className="order-overview">
              <h3>Order Summary</h3>
              <div className="summary-details">
                <p>
                  Total Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p>Total Amount: ₹{total.toFixed(2)}</p>
              </div>
            </div>

            {error && <div className="payment-error">{error}</div>}

            <div className="payment-actions">
              <button
                className="submit-payment-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Placing Order..." : `Confirm Order (COD) ₹${total.toFixed(2)}`}
              </button>
            </div>
          </>
        )}

        {codSuccess && (
          <div className="cod-success-overlay">
            <div className="cod-success-modal">
              <h3>Order Placed Successfully!</h3>
              <p>Your COD order has been placed. Thank you!</p>
              <button onClick={() => { setCodSuccess(false); onClose(); }}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
