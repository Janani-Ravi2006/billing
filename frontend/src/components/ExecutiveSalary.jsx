import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ExecutiveSalary() {
  const [executives, setExecutives] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/executive/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to fetch users");
    }
  };

  const handleSalaryChange = (id, value) => {
    setExecutives(executives.map(exec => {
      if (exec.id === id) {
        return { ...exec, salary: value };
      }
      return exec;
    }));
  };

  const handleDelete = (id) => {
    setExecutives(executives.filter(exec => exec.id !== id));
    toast.success("Executive record deleted!");
  };

  const handleFetch = async () => {
    if (!selectedExecutive) {
      toast.error("Please select an executive!");
      return;
    }

    if (!selectedMonth) {
      toast.error("Please select a month!");
      return;
    }

    const exists = executives.find(exec => exec.username === selectedExecutive && exec.month === selectedMonth);
    if (exists) {
      toast.error("This executive for this month is already in the table!");
      return;
    }

    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/executive/executive-salary-month/${selectedExecutive}?month=${selectedMonth}`
      );
      
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to fetch data");
        return;
      }

      const data = await res.json();
      
      if (data.totalBills === 0) {
        toast.error(`No bills found for ${data.username} in ${getMonthName(selectedMonth)}`);
        return;
      }

      const fetchedData = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        name: data.username,
        username: data.username,
        noOfBills: data.totalBills,
        salary: "",
        month: selectedMonth,
        monthName: getMonthName(selectedMonth),
        startDate: startDate,
        endDate: endDate
      };
      
      setExecutives([...executives, fetchedData]);
      toast.success(`Fetched ${data.totalBills} bills for ${data.username}!`);
    } catch (err) {
      console.error("Failed to fetch:", err);
      toast.error("Failed to fetch executive data");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const handleSaveAll = async () => {
    if (executives.length === 0) {
      toast.error("No executive records to save!");
      return;
    }

    const emptySalaries = executives.filter(exec => !exec.salary || exec.salary === "");
    if (emptySalaries.length > 0) {
      toast.error("Please enter salary for all executives!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/executive/save-salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ executives }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to save records");
        return;
      }

      const result = await res.json();
      toast.success(result.message || "All executive records saved successfully!");

      setExecutives([]);
      setSelectedExecutive("");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save records: " + err.message);
    }
  };

  const handlePrint = () => {
    if (executives.length === 0) {
      toast.error("No data to print!");
      return;
    }

    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    toast.success("Printing salary report...");
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('en-IN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Executive Salary Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 30px;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 3px solid #2c5530;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #2c5530;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
          }
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .salary-table th,
          .salary-table td {
            border: 1px solid #333;
            padding: 12px;
            text-align: left;
          }
          .salary-table th {
            background: #2c5530;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          .total-row {
            background: #f0f0f0;
            font-weight: bold;
            font-size: 18px;
          }
          @media print {
            body { margin: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Stores</div>
          <div class="report-title">Executive Salary Report</div>
          <div style="margin-top: 10px; font-size: 14px; color: #666;">
            Generated on: ${currentDate}
          </div>
        </div>
        
        <table class="salary-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Month</th>
              <th>No. of Bills</th>
              <th>Salary (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${executives.map((exec, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${exec.name}</td>
                <td style="text-align: center;">${exec.monthName}</td>
                <td style="text-align: center;">${exec.noOfBills}</td>
                <td style="text-align: right;">₹${parseInt(exec.salary).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">Total Salary Expense:</td>
              <td style="text-align: right;">₹${calculateTotalSalary().toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const calculateTotalSalary = () => {
    return executives.reduce((total, exec) => total + (parseInt(exec.salary) || 0), 0);
  };

  return (
    <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-600">Executive Salary</h1>
          <div className="text-sm text-gray-600">
            Date: <span className="font-semibold">{new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Executive:</label>
            <select
              value={selectedExecutive}
              onChange={(e) => setSelectedExecutive(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Choose an executive...</option>
              {users.map((user) => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleFetch}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Loading..." : "Fetch"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Save All
          </button>
          <button
            onClick={handlePrint}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="border border-teal-600 p-3 text-center">S.No</th>
                <th className="border border-teal-600 p-3 text-center">Name</th>
                <th className="border border-teal-600 p-3 text-center">Month</th>
                <th className="border border-teal-600 p-3 text-center">No. of Bills</th>
                <th className="border border-teal-600 p-3 text-center">Salary (₹)</th>
                <th className="border border-teal-600 p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {executives.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
                    No executive records added yet. Select executive and month, then click "Fetch".
                  </td>
                </tr>
              ) : (
                executives.map((exec, index) => (
                  <tr key={exec.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 p-3 bg-gray-50">
                      {exec.name}
                    </td>
                    <td className="border border-gray-300 p-3 text-center bg-gray-50">
                      {exec.monthName}
                    </td>
                    <td className="border border-gray-300 p-3 text-center bg-gray-50 font-semibold text-blue-600">
                      {exec.noOfBills}
                    </td>
                    <td className="border border-gray-300 p-3">
                      <input
                        type="number"
                        value={exec.salary}
                        onChange={(e) => handleSalaryChange(exec.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-green-600"
                        placeholder="Enter salary"
                        min="0"
                      />
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <button
                        onClick={() => handleDelete(exec.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
              
              {executives.length > 0 && (
                <tr className="bg-teal-50 font-bold">
                  <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg">
                    Total Salary Expense:
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-xl text-teal-600">
                    ₹{calculateTotalSalary().toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 p-3"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {executives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Executives</h3>
            <p className="text-2xl font-bold text-teal-600">{executives.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bills Processed</h3>
            <p className="text-2xl font-bold text-blue-600">
              {executives.reduce((total, exec) => total + (parseInt(exec.noOfBills) || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Salary</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{Math.round(calculateTotalSalary() / executives.length).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}