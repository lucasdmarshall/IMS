import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const StaffDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    assignedTasks: [],
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    // Add dark mode class to body
    document.body.classList.add('dark');

    // Simulated data fetch - replace with actual API call
    const fetchDashboardData = async () => {
      // Simulate API call
      setDashboardData({
        assignedTasks: [
          { id: 1, title: 'Update Inventory Count', status: 'Pending' },
          { id: 2, title: 'Receive New Shipment', status: 'In Progress' },
          { id: 3, title: 'Organize Warehouse Shelf', status: 'Completed' }
        ],
        completedTasks: 1,
        pendingTasks: 2
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
        <h1 className="text-3xl font-bold text-dark-foreground mb-6">Staff Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Key Metrics Cards */}
          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Total Tasks</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-foreground">{dashboardData.assignedTasks.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Completed Tasks</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{dashboardData.completedTasks}</div>
            </CardContent>
          </Card>

          <Card className="bg-dark-300 border-dark-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-dark-muted">Pending Tasks</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 text-dark-muted">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{dashboardData.pendingTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Tasks Table */}
        <Card className="col-span-full bg-dark-300 border-dark-primary">
          <CardHeader>
            <CardTitle className="text-dark-foreground">Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-dark-primary">
                  <th className="py-3 text-dark-muted">Task ID</th>
                  <th className="py-3 text-dark-muted">Title</th>
                  <th className="py-3 text-dark-muted">Status</th>
                  <th className="py-3 text-dark-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.assignedTasks.map((task) => (
                  <tr key={task.id} className="border-b border-dark-primary">
                    <td className="py-3 text-dark-foreground">{task.id}</td>
                    <td className="py-3 text-dark-foreground">{task.title}</td>
                    <td className="py-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${task.status === 'Completed' ? 'bg-green-900 text-green-300' : 
                          task.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' : 
                          'bg-gray-900 text-gray-300'}
                      `}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-blue-400 hover:text-blue-300 mr-2">
                        View
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        Update
                      </button>
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

export default StaffDashboard;
