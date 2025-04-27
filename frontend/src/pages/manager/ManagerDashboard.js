import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    inventoryTrends: []
  });

  useEffect(() => {
    // Add dark mode class to body
    document.body.classList.add('dark');

    // Simulated data fetch - replace with actual API call
    const fetchDashboardData = async () => {
      // Simulate API call
      setDashboardData({
        totalProducts: 150,
        inventoryValue: 75000,
        lowStockItems: 10,
        inventoryTrends: [
          { name: 'Jan', Stock: 400, Sold: 240 },
          { name: 'Feb', Stock: 300, Sold: 139 },
          { name: 'Mar', Stock: 200, Sold: 280 },
          { name: 'Apr', Stock: 278, Sold: 390 },
          { name: 'May', Stock: 189, Sold: 180 },
        ]
      });
    };

    fetchDashboardData();

    // Cleanup function to remove dark mode class if needed
    return () => {
      document.body.classList.remove('dark');
    };
  }, []);

  return (
    <div className="bg-dark-400 min-h-screen">
      <Navbar />
      <div className="p-6 space-y-6 pt-24">
        <h1 className="text-3xl font-bold text-dark-foreground mb-6">Manager Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Metrics Cards */}
          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Products</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-8V5a2 2 0 012-2h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Inventory Value</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">${dashboardData.inventoryValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Low Stock Items</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{dashboardData.lowStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Trends Chart */}
        <Card className="col-span-full bg-dark-300 border-dark-primary">
          <CardHeader>
            <CardTitle className="text-dark-foreground">Inventory Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dashboardData.inventoryTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" tick={{fill: '#e5e7eb'}} />
                <YAxis tick={{fill: '#e5e7eb'}} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e2747',
                    color: '#e5e7eb',
                    borderColor: '#2d3748'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="Stock" stroke="#8884d8" />
                <Line type="monotone" dataKey="Sold" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Summary Table */}
        <Card className="bg-dark-300 border-dark-primary">
          <CardHeader>
            <CardTitle className="text-dark-foreground">Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-dark-primary">
                  <th className="py-3 text-dark-muted">Product</th>
                  <th className="py-3 text-dark-muted">Current Stock</th>
                  <th className="py-3 text-dark-muted">Minimum Stock</th>
                  <th className="py-3 text-dark-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'Laptop', currentStock: 50, minStock: 20, status: 'Good' },
                  { product: 'Smartphone', currentStock: 15, minStock: 30, status: 'Low' },
                  { product: 'Tablet', currentStock: 25, minStock: 25, status: 'Critical' },
                ].map((item, index) => (
                  <tr key={index} className="border-b border-dark-primary">
                    <td className="py-3 text-dark-foreground">{item.product}</td>
                    <td className="py-3 text-dark-foreground">{item.currentStock}</td>
                    <td className="py-3 text-dark-foreground">{item.minStock}</td>
                    <td className="py-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${item.status === 'Good' ? 'bg-green-900 text-green-300' : 
                          item.status === 'Low' ? 'bg-yellow-900 text-yellow-300' : 
                          'bg-red-900 text-red-300'}
                      `}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
