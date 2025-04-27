import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { 
  ArrowLeft, 
  RefreshCw, 
  Download 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import services for fetching data
import { salesService } from '../../services/salesService';
import { inventoryService } from '../../services/inventoryService';
import { profitLossService } from '../../services/profitLossService';
import { useAuth } from '../../context/AuthContext';

const Analysis = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for different reports
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [profitLossData, setProfitLossData] = useState([]);
  const { user, isAuthenticated } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure user is authenticated before fetching data
      if (!isAuthenticated) {
        setLoading(false);
        setError('User not authenticated');
        return;
      }
      
      // Always fetch sales and stock reports
      const salesResponse = await salesService.getSalesReport();
      const stockResponse = await inventoryService.getStockReport();
      
      console.group('Report Data Structure');
      console.log('Sales Report Raw Data:', JSON.stringify(salesResponse.data, null, 2));
      console.log('Stock Report Raw Data:', JSON.stringify(stockResponse.data, null, 2));
      console.groupEnd();
      
      setSalesData(salesResponse.data.data);
      setStockData(stockResponse.data.data);

      // Only fetch profit/loss report for admin users
      if (isAdmin) {
        try {
          const profitLossResponse = await profitLossService.getProfitLossReport();
          console.log('Profit/Loss Report Raw Data:', JSON.stringify(profitLossResponse.data, null, 2));
          setProfitLossData(profitLossResponse.data.data);
        } catch (plError) {
          console.error('Profit/Loss Report Error:', plError.response ? plError.response.data : plError);
          // Don't set the main error state, just log the error
          setProfitLossData([]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      setLoading(false);
    }
  };

  // Export reports to PDF
  const exportReportToPDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set document title and metadata
    doc.setProperties({
      title: 'Inventory Analysis Report',
      subject: 'Comprehensive Business Performance Report',
      author: user?.name || 'System Admin'
    });

    // Add company logo or header (optional)
    doc.setFontSize(18);
    doc.text('Inventory Analysis Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Sales Report Section
    doc.setFontSize(14);
    doc.text('Sales Report', 14, 50);
    autoTable(doc, {
      startY: 60,
      head: [['Month', 'Total Sales', 'Order Count']],
      body: salesData.map(item => {
        // Dynamically extract values, with fallbacks
        const month = item.month || 'Unknown';
        const totalSales = item.totalSales || item.value || 0;
        const orderCount = item.orderCount || item.count || 0;
        
        return [
          month, 
          `$${Number(totalSales).toFixed(2)}`, 
          Number(orderCount).toLocaleString()
        ];
      }),
      theme: 'striped'
    });

    // Stock Report Section
    doc.setFontSize(14);
    doc.text('Stock Report', 14, doc.lastAutoTable.finalY + 20);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Category', 'Total Quantity', 'Average Price', 'Product Count']],
      body: stockData.map(item => {
        // Dynamically extract values, with fallbacks
        const category = item.category || item.name || 'Uncategorized';
        const totalQuantity = item.totalQuantity || item.quantity || item.value || 0;
        const averagePrice = item.averagePrice || item.price || 0;
        const productCount = item.productCount || item.count || item.totalProducts || 0;
        
        return [
          category, 
          Number(totalQuantity).toLocaleString(), 
          `$${Number(averagePrice).toFixed(2)}`, 
          Number(productCount).toLocaleString()
        ];
      }),
      theme: 'striped'
    });

    // Profit/Loss Report Section (only for admins)
    if (isAdmin && profitLossData.length > 0) {
      doc.setFontSize(14);
      doc.text('Profit & Loss Report', 14, doc.lastAutoTable.finalY + 20);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 30,
        head: [['Month', 'Revenue', 'Costs', 'Net Profit']],
        body: profitLossData.map(item => {
          // Dynamically extract values, with fallbacks
          const month = item.month || 'Unknown';
          const revenue = item.totalRevenue || item.revenue || item.income || 0;
          const costs = item.totalCost || item.costs || item.expenses || 0;
          const netProfit = item.netProfit || item.profit || item.value || (revenue - costs);
          
          return [
            month, 
            `$${Number(revenue).toFixed(2)}`, 
            `$${Number(costs).toFixed(2)}`, 
            `$${Number(netProfit).toFixed(2)}`
          ];
        }),
        theme: 'striped'
      });
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save(`inventory_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchReportsData();
    }
  }, [isAuthenticated]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-green-500 border-l-indigo-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-indigo-500 border-r-blue-500 border-b-purple-500 border-l-green-500 animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-4 border-t-purple-500 border-r-green-500 border-b-indigo-500 border-l-blue-500 animate-spin animation-delay-300"></div>
        </div>
        <p className="mt-6 text-white text-xl font-semibold">Loading reports...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-red-500 p-8 rounded-lg shadow-lg max-w-2xl mx-auto mt-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400">
              Failed to Fetch Reports
            </h2>
          </div>
          <p className="mb-6 text-gray-300 border-l-4 border-red-500 pl-4">{error}</p>
          <button
            onClick={fetchReportsData}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center">
            <RefreshCw className="mr-2" size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render sales chart
  const renderSalesChart = () => {
    // Ensure salesData is an array and has data
    if (!salesData || salesData.length === 0) return null;

    // Modern color palette
    const colors = {
      sales: '#6366f1', // Indigo
      orders: '#10b981', // Emerald
      gradient1: '#6366f1', // Indigo
      gradient2: '#8b5cf6', // Violet
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={salesData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.gradient1} stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.orders} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.orders} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#e5e7eb' }} 
            axisLine={{ stroke: '#4b5563' }}
            tickMargin={10}
          />
          <YAxis 
            label={{ 
              value: 'Sales Amount ($)', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#e5e7eb',
              style: { textAnchor: 'middle' },
              dx: -10
            }} 
            tick={{ fill: '#e5e7eb' }}
            axisLine={{ stroke: '#4b5563' }}
            tickMargin={10}
            width={80}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => [
              `$${value.toLocaleString()}`, 
              name === 'value' ? 'Total Sales' : 'Order Count'
            ]}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }}
          />
          <Bar 
            dataKey="value" 
            name="Total Sales" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#salesGradient)"
            animationDuration={1500}
          />
          <Bar 
            dataKey="orderCount" 
            name="Order Count" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#ordersGradient)"
            animationDuration={1500}
            animationBegin={300}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render stock chart
  const renderStockChart = () => {
    // Ensure stockData is an array and has data
    if (!stockData || stockData.length === 0) return null;

    // Modern color palette
    const colors = {
      stock: '#8b5cf6', // Violet
      products: '#ec4899', // Pink
      gradient1: '#8b5cf6', // Violet
      gradient2: '#a78bfa', // Light violet
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={stockData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.stock} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.stock} stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="productsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.products} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.products} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="category" 
            tick={{ fill: '#e5e7eb' }} 
            axisLine={{ stroke: '#4b5563' }}
          />
          <YAxis 
            label={{ 
              value: 'Stock Quantity', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#e5e7eb',
              style: { textAnchor: 'middle' },
              dx: -10
            }} 
            tick={{ fill: '#e5e7eb' }}
            axisLine={{ stroke: '#4b5563' }}
            tickMargin={10}
            width={80}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => [
              name === 'value' ? value.toLocaleString() : value, 
              name === 'value' ? 'Total Stock' : 
              name === 'totalProducts' ? 'Total Products' : 
              'Average Price'
            ]}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }}
          />
          <Bar 
            dataKey="value" 
            name="Total Stock" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#stockGradient)"
            animationDuration={1500}
          />
          <Bar 
            dataKey="totalProducts" 
            name="Total Products" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#productsGradient)"
            animationDuration={1500}
            animationBegin={300}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render profit/loss chart
  const renderProfitLossChart = () => {
    // Ensure profitLossData is an array and has data
    if (!profitLossData || profitLossData.length === 0) return null;

    // Modern color palette
    const colors = {
      profit: '#10b981', // Emerald
      revenue: '#3b82f6', // Blue
      cost: '#ef4444', // Red
      gradient1: '#10b981', // Emerald
      gradient2: '#34d399', // Light emerald
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={profitLossData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.profit} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.profit} stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.revenue} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.revenue} stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.cost} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.cost} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#e5e7eb' }} 
            axisLine={{ stroke: '#4b5563' }}
            tickMargin={10}
          />
          <YAxis 
            label={{ 
              value: 'Profit/Loss ($)', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#e5e7eb',
              style: { textAnchor: 'middle' },
              dx: -10
            }} 
            tick={{ fill: '#e5e7eb' }}
            axisLine={{ stroke: '#4b5563' }}
            tickMargin={10}
            width={80}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
              border: '1px solid #4b5563',
              borderRadius: '8px',
              color: '#e5e7eb'
            }}
            formatter={(value, name) => [
              `$${value.toLocaleString()}`, 
              name === 'value' ? 'Net Profit/Loss' : 
              name === 'totalRevenue' ? 'Total Revenue' : 
              'Total Cost'
            ]}
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend 
            wrapperStyle={{ color: '#e5e7eb', paddingTop: '10px' }}
          />
          <Bar 
            dataKey="value" 
            name="Net Profit/Loss" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#profitGradient)"
            animationDuration={1500}
          />
          <Bar 
            dataKey="totalRevenue" 
            name="Total Revenue" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#revenueGradient)"
            animationDuration={1500}
            animationBegin={300}
          />
          <Bar 
            dataKey="totalCost" 
            name="Total Cost" 
            barSize={30}
            radius={[4, 4, 0, 0]}
            fill="url(#costGradient)"
            animationDuration={1500}
            animationBegin={600}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="flex justify-between items-center mb-8 bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 shadow-md">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-dark-muted hover:text-dark-foreground transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Analysis
          </h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={fetchReportsData}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center"
          >
            <RefreshCw className="mr-2" size={16} />
            Refresh
          </button>
          <button
            onClick={exportReportToPDF}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Download className="mr-2" size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {/* Sales Report */}
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Sales Report
          </h2>
          {renderSalesChart()}
        </div>

        {/* Stock Report */}
        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
            Stock Report
          </h2>
          {renderStockChart()}
        </div>

        {/* Profit/Loss Report - Only visible to admin */}
        {isAdmin && (
          <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Profit & Loss Report
            </h2>
            {renderProfitLossChart()}
          </div>
        )}
        
        {/* Message for non-admin users */}
        {!isAdmin && (
          <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-0">
                Restricted Access
              </h2>
            </div>
            <p className="text-gray-300">
              The Profit & Loss Report is only available to administrators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
