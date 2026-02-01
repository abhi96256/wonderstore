import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { createRazorpayOrder, verifyPayment } from '../../firebase/functions';

const PaymentContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const PaymentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 1rem;
  background-color: #3399cc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

const PaymentFormComponent = () => {
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      // Create order using Firebase Function
      const order = await createRazorpayOrder(parseFloat(amount));

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'UniqueStore',
        description: 'Payment for UniqueStore Services',
        handler: async (response) => {
          try {
            // Verify payment using Firebase Function
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (result.verified) {
              toast.success('Payment successful!');
              navigate('/payment-success');
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <PaymentContainer>
      <h2>Make a Payment</h2>
      <PaymentForm onSubmit={handlePayment}>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Button type="submit">Pay Now</Button>
      </PaymentForm>
    </PaymentContainer>
  );
};

export default PaymentFormComponent; 