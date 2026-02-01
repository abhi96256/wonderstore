import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Homepage from './Component/Homepage.jsx';
import NewArrivals from './components/NewArrivals/NewArrivals.jsx';
import AllProducts from './components/AllProducts/AllProducts.jsx';
import FeaturedStories from './components/FeaturedStories/FeaturedStories.jsx';
import Contact from './components/Contact/Contact.jsx';
import ProductDetails from './components/ProductDetails/ProductDetails.jsx';
import Cart from './components/Cart/Cart.jsx';
import Wishlist from './components/Wishlist/Wishlist.jsx';
import CategoryProducts from './components/CategoryProducts/CategoryProducts.jsx';
import Navbar from './Component/Navbar/Navbar.jsx';
import Login from './components/Login/Login.jsx';
import Signup from './components/Login/Signup.jsx';
import About from './components/Aboutpage/About.jsx';
import './App.css';
import Footer from './Component/Footer/Footer.jsx';
import Profile from './Component/Profile/Profile.jsx';
import MyOrders from './Component/Orders/MyOrders';
import Settings from './Component/Settings/Settings';
import Notifications from './Component/Notifications/Notifications';
import ChangePassword from './components/ChangePassword.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ScrollToTop from './components/ScrollToTop';
import TermsAndConditions from './components/Login/TermsAndConditions';
import PrivacyPolicy from './components/Login/PrivacyPolicy';
import OrderTracking from './pages/OrderTracking.jsx';
import CookieConsent from './components/CookieConsent/CookieConsent.jsx';

import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import DashboardOverview from './components/Admin/DashboardOverview.jsx';
import Orders from './components/Admin/Orders.jsx';
import Analytics from './components/Admin/Analytics.jsx';
import NotificationsAdmin from './components/Admin/Notifications.jsx';
import Users from './components/Admin/Users.jsx';
import Categories from './components/Admin/Categories.jsx';
import Products from './components/Admin/Products.jsx';
import ReturnsExchange from './pages/ReturnsExchange.jsx';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import AddressManagement from './Component/AddressManagement/AddressManagement.jsx';
import OrderDeliveryManagement from './components/Admin/OrderDeliveryManagement.jsx';
import SavedCart from './Component/SavedCart/SavedCart.jsx';
import CartManagement from './components/Admin/CartManagement';
import WishlistManagement from './components/Admin/WishlistManagement.jsx';
import TestimonialsManagement from './components/Admin/TestimonialsManagement.jsx';
import SeedData from './SeedData.jsx';


// Layout component with navbar and footer
const PageLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
      <CookieConsent />
    </div>
  );
};

// Protected Route component for features that require login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <PageLayout>{children}</PageLayout>;
};

// Admin Route component for admin-only features
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="727732829380-un80uanpnh4rra3sfjr59a48et2rph38.apps.googleusercontent.com">
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PageLayout><Homepage /></PageLayout>} />
                <Route path="/new-arrivals" element={<PageLayout><NewArrivals /></PageLayout>} />
                <Route path="/all-products" element={<PageLayout><AllProducts /></PageLayout>} />
                <Route path="/featured-stories" element={<PageLayout><FeaturedStories /></PageLayout>} />
                <Route path="/contact" element={<PageLayout><Contact /></PageLayout>} />
                <Route path="/about" element={<PageLayout><About /></PageLayout>} />
                <Route path="/product/:id" element={<PageLayout><ProductDetails /></PageLayout>} />
                <Route path="/category/:categoryName" element={<PageLayout><CategoryProducts /></PageLayout>} />
                <Route path="/terms" element={<PageLayout><TermsAndConditions /></PageLayout>} />
                <Route path="/privacy-policy" element={<PageLayout><PrivacyPolicy /></PageLayout>} />
                <Route path="/track-order" element={<PageLayout><OrderTracking /></PageLayout>} />
                <Route path="/returns-exchange" element={<PageLayout><ReturnsExchange /></PageLayout>} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Payment Status Routes */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />

                {/* Protected Routes - Require Login */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/addresses" element={<ProtectedRoute><AddressManagement /></ProtectedRoute>} />
                <Route path="/saved-cart" element={<ProtectedRoute><SavedCart /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/change-password" element={<PageLayout><ChangePassword /></PageLayout>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }>
                  <Route index element={<DashboardOverview />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="delivery-management" element={<OrderDeliveryManagement />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<NotificationsAdmin />} />
                  <Route path="users" element={<Users />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="products" element={<Products />} />
                  <Route path="cart-management" element={<CartManagement />} />
                  <Route path="wishlist-management" element={<WishlistManagement />} />
                  <Route path="testimonials" element={<TestimonialsManagement />} />
                </Route>

                <Route path="/seed" element={<SeedData />} />
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
