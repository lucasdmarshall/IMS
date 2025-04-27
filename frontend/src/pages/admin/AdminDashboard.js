import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    totalStaff: 0,
    totalManagers: 0,
    recentTransactions: [] // Initialize as an empty array
  });

  useEffect(() => {
    document.body.classList.add('dark');

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/v1/dashboard'); // Update with actual API endpoint
        const { data } = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();

    return () => {
      document.body.classList.remove('dark');
    };
  }, []);

  return (
    <div className="bg-dark-400 min-h-screen">
      <Navbar />
      <div className="p-6 space-y-6 pt-24">
        <h1 className="text-3xl font-bold text-dark-foreground mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Metrics Cards */}
          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalSuppliers}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalStaff}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Managers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.totalManagers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        {dashboardData.recentTransactions && (
          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader>
              <CardTitle className="text-dark-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-dark-primary">
                    <th className="py-3 text-dark-muted">Transaction ID</th>
                    <th className="py-3 text-dark-muted">Type</th>
                    <th className="py-3 text-dark-muted">Amount</th>
                    <th className="py-3 text-dark-muted">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-dark-primary">
                      <td className="py-3 text-dark-foreground">{transaction.id}</td>
                      <td className="py-3 text-dark-foreground">{transaction.type}</td>
                      <td className="py-3 text-dark-foreground">{transaction.amount}</td>
                      <td className="py-3 text-dark-foreground">{transaction.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
