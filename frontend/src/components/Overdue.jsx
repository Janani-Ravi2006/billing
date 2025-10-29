import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Phone, User, DollarSign, Clock, Printer, Search, Bell } from 'lucide-react';

const OverdueBillsPage = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Fetch overdue bills
  useEffect(() => {
    fetchOverdueBills();
    fetchSummary();
  }, []);

  const fetchOverdueBills = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/overdue-bills/overdue-bills');
      const data = await response.json();
      setBills(data);
      setFilteredBills(data);
      setLoading(false);
      
      // Check for newly overdue bills (1+ days)
      checkForAlerts(data);
    } catch (error) {
      console.error('Error fetching overdue bills:', error);
      setLoading(false);
    }
  };

  const checkForAlerts = (billsData) => {
    const newAlerts = billsData.filter(bill => bill.days_overdue >= 1 && bill.balance_due > 0);
    if (newAlerts.length > 0) {
      setAlerts(newAlerts);
      setShowAlerts(true);
      
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`${newAlerts.length} Overdue Bills Alert!`, {
          body: `You have ${newAlerts.length} bill(s) with pending balance`,
          icon: '🔔'
        });
      }
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/overdue-bills/overdue-bills/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // Filter bills
  useEffect(() => {
    let filtered = [...bills];

    // Apply day filter
    if (filter === '7days') {
      filtered = filtered.filter(bill => bill.days_overdue >= 7);
    } else if (filter === '30days') {
      filtered = filtered.filter(bill => bill.days_overdue >= 30);
    } else if (filter === '60days') {
      filtered = filtered.filter(bill => bill.days_overdue >= 60);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customer_phone?.includes(searchTerm) ||
        bill.bill_no?.toString().includes(searchTerm)
      );
    }

    setFilteredBills(filtered);
  }, [filter, searchTerm, bills]);

  const handlePayment = async () => {
    if (!paymentAmount || !paymentModal) return;

    try {
      const response = await fetch('http://localhost:5000/api/overdue-bills/overdue-bills/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id: paymentModal.bill_id,
          payment_amount: parseFloat(paymentAmount)
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment updated successfully!');
        setPaymentModal(null);
        setPaymentAmount('');
        fetchOverdueBills();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDaysColor = (days) => {
    if (days < 7) return 'text-yellow-600';
    if (days < 30) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-800">Overdue Bills</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlerts(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Bell className="w-5 h-5" />
                Alerts
                {alerts.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Printer className="w-5 h-5" />
                Print Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-sm text-gray-600 font-medium">Total Overdue Bills</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{summary.total_overdue_bills}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <h3 className="text-sm text-gray-600 font-medium">Total Amount Due</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(summary.total_overdue_amount || 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-sm text-gray-600 font-medium">Avg Days Overdue</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(summary.avg_days_overdue || 0)} days
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                <h3 className="text-sm text-gray-600 font-medium">Max Days Overdue</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {summary.max_days_overdue || 0} days
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or bill number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('7days')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === '7days' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                7+ Days
              </button>
              <button
                onClick={() => setFilter('30days')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === '30days' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                30+ Days
              </button>
              <button
                onClick={() => setFilter('60days')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === '60days' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                60+ Days
              </button>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">S.No</th>
                  <th className="px-6 py-4 text-left">Bill No</th>
                  <th className="px-6 py-4 text-left">Bill Date</th>
                  <th className="px-6 py-4 text-left">Customer Name</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                  <th className="px-6 py-4 text-right">Balance Due</th>
                  <th className="px-6 py-4 text-center">Days Overdue</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No overdue bills found
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill, index) => (
                    <tr key={bill.bill_id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold">{bill.bill_no}</td>
                      <td className="px-6 py-4">{formatDate(bill.bill_date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {bill.customer_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {bill.customer_phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(bill.total_amount)}</td>
                      <td className="px-6 py-4 text-right text-green-600">{formatCurrency(bill.paid_amount)}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        {formatCurrency(bill.balance_due)}
                      </td>
                      <td className={`px-6 py-4 text-center font-bold ${getDaysColor(bill.days_overdue)}`}>
                        {bill.days_overdue} days
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setPaymentModal(bill)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Add Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {paymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add Payment</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Bill No: <span className="font-bold">{paymentModal.bill_no}</span></p>
                <p className="text-sm text-gray-600">Customer: <span className="font-bold">{paymentModal.customer_name}</span></p>
                <p className="text-lg font-bold text-red-600 mt-2">
                  Balance Due: {formatCurrency(paymentModal.balance_due)}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Payment Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePayment}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Submit Payment
                </button>
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Modal */}
        {showAlerts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold">Overdue Bills Alert</h2>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {alerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No overdue bills at this time</p>
              ) : (
                <>
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-800 font-semibold">
                      ⚠️ {alerts.length} bill(s) have pending balance for 1+ days
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {alerts.map((bill) => (
                      <div key={bill.bill_id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-lg">Bill #{bill.bill_no}</p>
                            <p className="text-gray-600">{bill.customer_name}</p>
                            <p className="text-sm text-gray-500">{bill.customer_phone}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-600">
                              {formatCurrency(bill.balance_due)}
                            </p>
                            <p className="text-sm text-gray-600">Balance Due</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-600">
                              Bill Date: {formatDate(bill.bill_date)}
                            </span>
                            <span className={`font-bold ${getDaysColor(bill.days_overdue)}`}>
                              {bill.days_overdue} days overdue
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setPaymentModal(bill);
                              setShowAlerts(false);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            Add Payment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowAlerts(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueBillsPage;