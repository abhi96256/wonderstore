import React, { useState, useEffect } from 'react';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddressForm from '../AddressManagement/AddressForm';
import './AddressSelection.css';

const AddressSelection = ({ onSelectAddress, onClose }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, currentUser } = useAuth();
  
  const userId = user?.id || currentUser?.id;

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/addresses/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        
        // Select default address if exists
        const defaultAddress = data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      } else {
        console.error('Failed to fetch addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      // Add user ID to the form data
      const addressData = {
        ...formData,
        userId
      };
      
      // Replace with your actual API call
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (response.ok) {
        const newAddress = await response.json();
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
      } else {
        console.error('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleContinue = () => {
    if (selectedAddressId) {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      onSelectAddress(selectedAddress);
    }
  };

  if (isLoading) {
    return <div className="address-selection-loading">Loading addresses...</div>;
  }

  return (
    <div className="address-selection-container">
      <div className="address-selection-header">
        <h2>
          <FaMapMarkerAlt /> Select Delivery Address
        </h2>
      </div>

      {addresses.length === 0 ? (
        <div className="no-addresses-message">
          <p>You don't have any saved addresses. Please add a new address to continue.</p>
          <button 
            className="add-address-btn" 
            onClick={() => setShowAddressForm(true)}
          >
            <FaPlus /> Add New Address
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
                    onClick={() => setSelectedAddressId(address.id)}
                  >
                    <div className="address-selection">
                      <input 
                        type="radio" 
                        name="selectedAddress"
                        checked={selectedAddressId === address.id} 
                        onChange={() => setSelectedAddressId(address.id)}
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
                <FaPlus /> Add New Address
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
                onClick={handleContinue}
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
    </div>
  );
};

export default AddressSelection; 