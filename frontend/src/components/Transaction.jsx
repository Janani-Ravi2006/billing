import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Transaction() {
  const [activeTab, setActiveTab] = useState("income");
  const [expenseData, setExpenseData] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expenseRecords, setExpenseRecords] = useState([]);
  const [expenseSearchTerm, setExpenseSearchTerm] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("general");
  const [incomeFromDate, setIncomeFromDate] = useState("");
  const [incomeToDate, setIncomeToDate] = useState("");
  const [calculatedIncome, setCalculatedIncome] = useState(null);
  const [incomeBills, setIncomeBills] = useState([]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleTodayIncome = () => {
    const today = getTodayDate();
    setIncomeFromDate(today);
    setIncomeToDate(today);
  };

  const handleTodayProfit = () => {
    const today = getTodayDate();
    setFromDate(today);
    setToDate(today);
  };

  const handleCalculateIncome = async () => {
    if (!incomeFromDate || !incomeToDate) {
      toast.error("⚠️ Please select both from and to dates!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bills/bills");
      const allBills = await res.json();

      if (res.ok) {
        const filteredBills = allBills.filter(bill => {
          const billDate = new Date(bill.bill_date);
          const fromDateObj = new Date(incomeFromDate);
          const toDateObj = new Date(incomeToDate);
          
          billDate.setHours(0, 0, 0, 0);
          fromDateObj.setHours(0, 0, 0, 0);
          toDateObj.setHours(23, 59, 59, 999);
          
          return billDate >= fromDateObj && billDate <= toDateObj;
        });

        const totalIncome = filteredBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0);
        
        setIncomeBills(filteredBills);
        setCalculatedIncome({
          totalIncome: totalIncome,
          billCount: filteredBills.length,
          fromDate: incomeFromDate,
          toDate: incomeToDate
        });
        
        toast.success(`✅ Income calculated successfully! Found ${filteredBills.length} bills`);
      } else {
        toast.error("❌ Failed to fetch bills data");
      }
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const fetchExpenseRecords = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions");
      const data = await res.json();
      if (res.ok) {
        const expenseOnly = data.filter(record => record.type === 'expense');
        setExpenseRecords(expenseOnly);
        setActiveTab("expense-records");
      } else {
        toast.error("❌ Failed to fetch expense records");
      }
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleEditExpense = (record) => {
    setEditingExpense({ ...record });
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense.date || !editingExpense.reason || !editingExpense.amount) {
      toast.error("⚠️ All fields are required!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date: editingExpense.date,
          reason: editingExpense.reason, 
          amount: parseFloat(editingExpense.amount),
          type: "expense",
          category: editingExpense.category || "general"
        }),
      });
      if (res.ok) {
        toast.success("✅ Expense updated successfully!");
        setEditingExpense(null);
        fetchExpenseRecords();
      } else {
        const error = await res.json();
        toast.error(`❌ ${error.error || 'Failed to update expense'}`);
      }
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleDeleteExpenseRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("✅ Expense deleted successfully!");
        fetchExpenseRecords();
      } else {
        toast.error("❌ Failed to delete expense");
      }
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const filteredExpenseRecords = expenseRecords.filter((record) =>
    record.date?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
    record.reason?.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
    record.amount?.toString().includes(expenseSearchTerm) ||
    record.category?.toLowerCase().includes(expenseSearchTerm.toLowerCase())
  );

  const handleAddExpense = () => {
    setExpenseData([...expenseData, { id: Date.now(), reason: "", amount: "" }]);
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenseData(expenseData.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteExpense = (id) => {
    setExpenseData(expenseData.filter((item) => item.id !== id));
  };

  const handleSaveExpense = async () => {
    if (!expenseDate) {
      toast.error("⚠️ Please select a date!");
      return;
    }
    const validExpense = expenseData.filter((item) => item.reason && item.amount);
    if (validExpense.length === 0) {
      toast.error("⚠️ No valid expense entries to save!");
      return;
    }
    try {
      for (const item of validExpense) {
        const res = await fetch("http://localhost:5000/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            date: expenseDate,
            reason: item.reason, 
            amount: parseFloat(item.amount),
            type: "expense",
            category: expenseCategory
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(`❌ ${data.error || "Failed to save expense"}`);
          return;
        }
      }
      toast.success("✅ Expenses saved successfully!");
      setExpenseData([]);
      setExpenseDate("");
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleCalculateProfit = async () => {
    if (!fromDate || !toDate) {
      toast.error("⚠️ Please select both from and to dates!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/profit?from=${fromDate}&to=${toDate}`);
      const data = await res.json();
      if (res.ok) {
        setProfitData(data);
        toast.success("✅ Profit calculated successfully!");
      } else {
        toast.error(`❌ ${data.error || "Failed to calculate profit"}`);
      }
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'purchase': return 'Purchase';
      case 'executive_salary': return 'Executive Salary';
      case 'general': return 'General';
      default: return category;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'purchase': return 'bg-orange-100 text-orange-700';
      case 'executive_salary': return 'bg-purple-100 text-purple-700';
      case 'general': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 font-sans">
      <Toaster />
      <h2 className="text-3xl font-bold text-teal-600 mb-6">Transaction Management</h2>

      <div className="flex gap-2 mb-6 border-b-2">
        <button
          onClick={() => setActiveTab("income")}
          className={`px-6 py-3 text-lg font-semibold ${
            activeTab === "income"
              ? "bg-teal-500 text-white rounded-t-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-t-lg"
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`px-6 py-3 text-lg font-semibold ${
            activeTab === "expense"
              ? "bg-teal-500 text-white rounded-t-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-t-lg"
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setActiveTab("profit")}
          className={`px-6 py-3 text-lg font-semibold ${
            activeTab === "profit"
              ? "bg-teal-500 text-white rounded-t-lg"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-t-lg"
          }`}
        >
          Profit
        </button>
      </div>

      {activeTab === "income" && (
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-6">Income Calculation</h3>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-600 mb-4">Select date range to calculate total income from bills</p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2">From Date</label>
                <input
                  type="date"
                  value={incomeFromDate}
                  onChange={(e) => setIncomeFromDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2">To Date</label>
                <input
                  type="date"
                  value={incomeToDate}
                  onChange={(e) => setIncomeToDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-lg"
                />
              </div>
              <button
                onClick={handleTodayIncome}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 text-lg"
              >
                Today
              </button>
              <button
                onClick={handleCalculateIncome}
                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 text-lg"
              >
                Calculate Income
              </button>
            </div>
          </div>

          {calculatedIncome && (
            <div className="bg-white border-2 border-teal-500 rounded-lg p-6 mb-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Income Summary</h4>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-gray-600 font-semibold">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">₹{calculatedIncome.totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-gray-600 font-semibold">Total Bills</p>
                  <p className="text-3xl font-bold text-blue-600">{calculatedIncome.billCount}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <p className="text-gray-600 font-semibold">Date Range</p>
                  <p className="text-sm font-bold text-purple-600">
                    {new Date(calculatedIncome.fromDate).toLocaleDateString('en-GB')} - {new Date(calculatedIncome.toDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              {incomeBills.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-gray-700 mb-3">Bill Details ({incomeBills.length} bills)</h5>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse border">
                      <thead className="bg-teal-500 text-white sticky top-0">
                        <tr>
                          <th className="border p-3">S.No</th>
                          <th className="border p-3">Bill Date</th>
                          <th className="border p-3">Customer Name</th>
                          <th className="border p-3">Bill Number</th>
                          <th className="border p-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomeBills.map((bill, index) => (
                          <tr key={bill.bill_id} className="text-center">
                            <td className="border p-3">{index + 1}</td>
                            <td className="border p-3">
                              {new Date(bill.bill_date).toLocaleDateString('en-GB')}
                            </td>
                            <td className="border p-3">{bill.customer_name}</td>
                            <td className="border p-3">{bill.bill_no}</td>
                            <td className="border p-3 font-semibold text-green-600">
                              ₹{parseFloat(bill.total_amount).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "expense" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-700">Expense Management</h3>
            <div className="flex gap-3 items-center">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="border px-3 py-2 rounded text-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="border px-3 py-2 rounded text-lg"
                >
                  <option value="general">General</option>
                  <option value="purchase">Purchase</option>
                  <option value="executive_salary">Executive Salary</option>
                </select>
              </div>
              <button
                onClick={handleAddExpense}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 mt-6"
              >
                + Add Expense
              </button>
              <button
                onClick={handleSaveExpense}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mt-6"
              >
                Save All
              </button>
              <button
                onClick={fetchExpenseRecords}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-6"
              >
                View Records
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead className="bg-teal-500 text-white">
                <tr>
                  <th className="border p-3">S.No</th>
                  <th className="border p-3">Expense Reason</th>
                  <th className="border p-3">Amount</th>
                  <th className="border p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border p-6 text-center text-gray-500 text-lg">
                      No expense entries added yet
                    </td>
                  </tr>
                ) : (
                  expenseData.map((item, index) => (
                    <tr key={item.id} className="text-center">
                      <td className="border p-3">{index + 1}</td>
                      <td className="border p-3">
                        <input
                          type="text"
                          value={item.reason}
                          onChange={(e) => handleExpenseChange(item.id, "reason", e.target.value)}
                          className="border px-3 py-2 rounded w-full text-lg"
                          placeholder="Expense Reason"
                        />
                      </td>
                      <td className="border p-3">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleExpenseChange(item.id, "amount", e.target.value)}
                          className="border px-3 py-2 rounded w-full text-lg"
                          placeholder="Amount"
                        />
                      </td>
                      <td className="border p-3">
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "expense-records" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Expense Records</h3>
            <button
              onClick={() => setActiveTab("expense")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Back to Expense
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by date, reason, amount or category..."
              value={expenseSearchTerm}
              onChange={(e) => setExpenseSearchTerm(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg text-lg"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead className="bg-teal-500 text-white">
                <tr>
                  <th className="border p-3">S.No</th>
                  <th className="border p-3">Date</th>
                  <th className="border p-3">Category</th>
                  <th className="border p-3">Expense Reason</th>
                  <th className="border p-3">Amount</th>
                  <th className="border p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenseRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border p-6 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredExpenseRecords.map((record, index) => (
                    <tr key={record.id} className="text-center">
                      <td className="border p-3">{index + 1}</td>
                      <td className="border p-3">
                        {editingExpense?.id === record.id ? (
                          <input
                            type="date"
                            value={editingExpense.date}
                            onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          new Date(record.date).toLocaleDateString('en-GB')
                        )}
                      </td>
                      <td className="border p-3">
                        {editingExpense?.id === record.id ? (
                          <select
                            value={editingExpense.category || 'general'}
                            onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                            className="border px-2 py-1 rounded"
                          >
                            <option value="general">General</option>
                            <option value="purchase">Purchase</option>
                            <option value="executive_salary">Executive Salary</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(record.category)}`}>
                            {getCategoryLabel(record.category)}
                          </span>
                        )}
                      </td>
                      <td className="border p-3">
                        {editingExpense?.id === record.id ? (
                          <input
                            type="text"
                            value={editingExpense.reason}
                            onChange={(e) => setEditingExpense({ ...editingExpense, reason: e.target.value })}
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          record.reason
                        )}
                      </td>
                      <td className="border p-3">
                        {editingExpense?.id === record.id ? (
                          <input
                            type="number"
                            value={editingExpense.amount}
                            onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                            className="border px-2 py-1 rounded"
                          />
                        ) : (
                          `₹${parseFloat(record.amount).toFixed(2)}`
                        )}
                      </td>
                      <td className="border p-3">
                        {editingExpense?.id === record.id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={handleUpdateExpense}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingExpense(null)}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditExpense(record)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteExpenseRecord(record.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "profit" && (
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Profit Calculation</h3>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-2">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full text-lg"
                />
              </div>
              <button
                onClick={handleTodayProfit}
                className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 text-lg"
              >
                Today
              </button>
              <button
                onClick={handleCalculateProfit}
                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 text-lg"
              >
                Calculate Profit
              </button>
            </div>
          </div>

          {profitData && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-teal-500 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Profit Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-gray-600 font-semibold">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">₹{parseFloat(profitData.totalIncome || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <p className="text-gray-600 font-semibold">Total Expense</p>
                    <p className="text-2xl font-bold text-red-600">₹{parseFloat(profitData.totalExpense || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <p className="text-gray-600 font-semibold">Net Profit</p>
                    <p className={`text-2xl font-bold ${profitData.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ₹{parseFloat(profitData.profit || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {profitData.expenseBreakdown && (
                <div className="bg-white border-2 border-orange-500 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown by Category</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-orange-100 p-4 rounded-lg">
                      <p className="text-gray-600 font-semibold">Purchase</p>
                      <p className="text-sm text-gray-500 mb-1">
                        {profitData.purchaseStats && `${profitData.purchaseStats.totalPurchases} purchases`}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{parseFloat(profitData.expenseBreakdown.purchase || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <p className="text-gray-600 font-semibold">Executive Salary</p>
                      <p className="text-sm text-gray-500 mb-1">
                        {profitData.executiveDetails && `${profitData.executiveDetails.length} executives`}
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{parseFloat(profitData.expenseBreakdown.executiveSalary || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-200 p-4 rounded-lg">
                      <p className="text-gray-600 font-semibold">General Expenses</p>
                      <p className="text-2xl font-bold text-gray-700">
                        ₹{parseFloat(profitData.expenseBreakdown.general || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profitData.executiveDetails && profitData.executiveDetails.length > 0 && (
                <div className="bg-white border-2 border-purple-500 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Executive Salary Details</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border">
                      <thead className="bg-purple-500 text-white">
                        <tr>
                          <th className="border p-3">Executive Name</th>
                      
                          <th className="border p-3">Total Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitData.executiveDetails.map((exec, index) => (
                          <tr key={index} className="text-center">
                            <td className="border p-3 font-semibold">{exec.username}</td>
                           
                            <td className="border p-3 font-bold text-purple-600">₹{exec.salary.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}