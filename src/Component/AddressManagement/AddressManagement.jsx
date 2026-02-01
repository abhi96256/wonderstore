import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import AddressForm from './AddressForm';
import './AddressManagement.css';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Use user.uid from the AuthContext (which is properly set up in the context)
  const userId = user?.uid;

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      if (!userId) {
        console.error('No user ID available to fetch addresses');
        setAddresses([]);
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching addresses for user:", userId);
      
      // Use Firebase directly to fetch addresses
      const addressesQuery = query(
        collection(db, "addresses"), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(addressesQuery);
      console.log(`Found ${querySnapshot.size} addresses`);
      
      const addressList = [];
      
      querySnapshot.forEach((doc) => {
        addressList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setAddresses(addressList);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address) => {
    setEditAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        // Use Firebase directly to delete the address
        await deleteDoc(doc(db, 'addresses', addressId));
        setAddresses(addresses.filter(addr => addr.id !== addressId));
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleSaveAddress = async (formData) => {
    try {
      if (!userId) {
        console.error('No user ID available to save address');
        return;
      }
      
      // Add user ID and metadata to the form data
      const addressData = {
        ...formData,
        userId,
        userEmail: user?.email || "",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (editAddress) {
        // Update existing address using Firestore
        const addressRef = doc(db, 'addresses', editAddress.id);
        await updateDoc(addressRef, {
          ...addressData,
          updatedAt: new Date()
        });
        
        // If this address is set as default, update any other default addresses
        if (addressData.isDefault) {
          const prevDefault = addresses.find(addr => addr.isDefault && addr.id !== editAddress.id);
          if (prevDefault) {
            const prevDefaultRef = doc(db, 'addresses', prevDefault.id);
            await updateDoc(prevDefaultRef, {
              isDefault: false,
              updatedAt: new Date()
            });
          }
        }
      } else {
        // Create new address using Firestore
        await addDoc(collection(db, 'addresses'), addressData);
        
        // If this is the first address or marked as default
        if (addresses.length === 0 || addressData.isDefault) {
          // Set any previous default address to non-default
          if (addresses.length > 0) {
            const prevDefault = addresses.find(addr => addr.isDefault);
            if (prevDefault) {
              const prevDefaultRef = doc(db, 'addresses', prevDefault.id);
              await updateDoc(prevDefaultRef, {
                isDefault: false,
                updatedAt: new Date()
              });
            }
          }
        }
      }
      
      // Refresh the addresses list
      fetchAddresses();
      setShowForm(false);
      setEditAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditAddress(null);
  };

  if (isLoading) {
    return (
      <div className="address-loading">
        Loading addresses...
      </div>
    );
  }

  return (
    <div className="address-management-container">
      <div className="address-header">
        <h2><FaMapMarkerAlt /> My Addresses</h2>
        <button className="add-address-btn" onClick={handleAddAddress}>
          + Add New Address
        </button>
      </div>

      <hr className="divider" />

      {showForm ? (
        <AddressForm 
          address={editAddress} 
          onSave={handleSaveAddress} 
          onCancel={handleCancel}
        />
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="no-addresses">
              <p>You don't have any saved addresses yet.</p>
              <button className="add-first-address-btn" onClick={handleAddAddress}>
                Add Your First Address
              </button>
            </div>
          ) : (
            <>
              <p className="address-count">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
              <div className="addresses-list">
                {addresses.map((address) => (
                  <div key={address.id} className="address-card">
                    {address.isDefault && (
                      <div className="default-badge">
                        <FaCheckCircle /> Default
                      </div>
                    )}
                    
                    <div className="address-info">
                      <div className="address-user">
                        <FaUser className="icon" /> {address.fullName}
                      </div>
                      <div className="address-phone">
                        <FaPhoneAlt className="icon" /> {address.mobile}
                      </div>
                    </div>
                    
                    <div className="address-location">
                      <FaMapMarkerAlt className="icon" />
                      <div className="address-text">
                        {address.addressLine1},
                        {address.addressLine2 && <> {address.addressLine2},</>}
                        <br />
                        {address.city}, {address.state} {address.pincode}
                      </div>
                    </div>
                    
                    <div className="address-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditAddress(address)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AddressManagement; 