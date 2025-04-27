import React, { Suspense, lazy } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { motion } from 'framer-motion';

// Import AuthProvider
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import Scanner from './components/Scanner';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));

// Admin Routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminStockManagement = lazy(() => import('./pages/admin/StockManagement'));
const Analysis = lazy(() => import('./pages/admin/Analysis'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// Manager Routes
const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const ManagerProducts = lazy(() => import('./pages/manager/Products'));
const ManagerStockManagement = lazy(() => import('./pages/manager/StockManagement'));

// Staff Routes
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const StaffProducts = lazy(() => import('./pages/staff/Products'));
const StaffStockView = lazy(() => import('./pages/staff/StockView'));

// Shared Routes
const OrderManagement = lazy(() => import('./pages/shared/OrderManagement'));
const PurchaseOrdersSuppliers = lazy(() => import('./pages/shared/PurchaseOrdersSuppliers'));

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Login />
                </motion.div>
              } 
            />
            <Route 
              path="/scanner" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Scanner />
                </motion.div>
              } 
            />

            {/* Admin Protected Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminDashboard />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <UserManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock/inventory" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stock/orders" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/inventory" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/history" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/purchase-orders-suppliers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PurchaseOrdersSuppliers />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analysis" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Analysis />
                  </motion.div>
                </ProtectedRoute>
              } 
            />

            {/* Manager Protected Routes */}
            <Route 
              path="/manager/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ManagerDashboard />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/products" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ManagerProducts />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/stock" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ManagerStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/stock/inventory" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ManagerStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/stock/orders" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ManagerStockManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/orders" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/orders/inventory" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/orders/history" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/purchase-orders-suppliers" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <PurchaseOrdersSuppliers />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/analysis" 
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Analysis />
                  </motion.div>
                </ProtectedRoute>
              } 
            />

            {/* Staff Protected Routes */}
            <Route 
              path="/staff/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StaffDashboard />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/products" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StaffProducts />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/stock" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StaffStockView />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/stock/inventory" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StaffStockView />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/stock/orders" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <StaffStockView />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff/orders" 
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <OrderManagement />
                  </motion.div>
                </ProtectedRoute>
              } 
            />

            {/* Default Route */}
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Navigate to="/login" replace />
                </motion.div>
              } 
            />

            {/* Catch-all route */}
            {/* Settings Routes with Role-Based Access */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AdminSettings />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/access-denied" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AccessDenied />
                </motion.div>
              } 
            />
            
            <Route 
              path="*" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <NotFound />
                </motion.div>
              } 
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
