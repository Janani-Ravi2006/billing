// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";

// export default function ExecutiveReport() {
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedExecutive, setSelectedExecutive] = useState("");
//   const [selectedDate, setSelectedDate] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const months = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   // Fetch users from database on component mount
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/executive/users");
//       if (res.ok) {
//         const data = await res.json();
//         setUsers(data);
//       } else {
//         toast.error("Failed to fetch users");
//       }
//     } catch (err) {
//       console.error("Failed to fetch users:", err);
//       toast.error("Failed to fetch users");
//     }
//   };

//   // Get days in current month
//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();

//     const days = [];
    
//     // Add empty cells for days before month starts
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(null);
//     }
    
//     // Add days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(new Date(year, month, day));
//     }
    
//     return days;
//   };

//   const openCalendar = () => {
//     setShowCalendar(true);
//   };

//   const handleExecutiveChange = (executive) => {
//     setSelectedExecutive(executive);
    
//     if (selectedDate) {
//       // If a specific date is selected, generate report for that date
//       generateReportForSpecificDate(selectedDate, executive);
//     }
//   };

//   const handleDateSelect = (date) => {
//     if (!date) return;
    
//     const formattedDate = date.toISOString().split('T')[0];
//     setSelectedDate(formattedDate);
//     setShowCalendar(false);
    
//     if (selectedExecutive) {
//       generateReportForSpecificDate(formattedDate, selectedExecutive);
//     } else {
//       toast.error("⚠️ Please select an executive first!");
//     }
//   };

//   const generateReportForSpecificDate = async (date, executive) => {
//     if (!date || !executive) return;

//     setLoading(true);

//     try {
//       if (executive === "all") {
//         // Fetch data for all executives
//         const allReports = await Promise.all(
//           users.map(async (user, index) => {
//             try {
//               const res = await fetch(
//                 `http://localhost:5000/api/executive/executive-salary/${user.username}`
//               );
              
//               if (res.ok) {
//                 const data = await res.json();
//                 return {
//                   id: index + 1,
//                   date: date,
//                   executiveName: user.username,
//                   noOfBills: data.totalBills || 0,
//                   totalRevenue: data.totalRevenue || 0,
//                   firstBillDate: data.firstBillDate,
//                   lastBillDate: data.lastBillDate
//                 };
//               }
//               return null;
//             } catch (err) {
//               console.error(`Error fetching data for ${user.username}:`, err);
//               return null;
//             }
//           })
//         );

//         const validReports = allReports.filter(report => report !== null);
//         setReportData(validReports);
        
//         if (validReports.length > 0) {
//           toast.success(`📊 Report generated for All Executives - ${formatDate(date)}`);
//         } else {
//           toast.error("No data found for the selected date");
//         }
//       } else {
//         // Fetch data for specific executive
//         const res = await fetch(
//           `http://localhost:5000/api/executive/executive-salary/${executive}`
//         );
        
//         if (!res.ok) {
//           const error = await res.json();
//           toast.error(error.error || "Failed to fetch data");
//           setReportData([]);
//           return;
//         }

//         const data = await res.json();
        
//         const reportEntry = {
//           id: 1,
//           date: date,
//           executiveName: data.username,
//           noOfBills: data.totalBills || 0,
//           totalRevenue: data.totalRevenue || 0,
//           firstBillDate: data.firstBillDate,
//           lastBillDate: data.lastBillDate
//         };
        
//         setReportData([reportEntry]);
//         toast.success(`📊 Report generated for ${data.username} - ${formatDate(date)}`);
//       }
//     } catch (err) {
//       console.error("Failed to fetch report data:", err);
//       toast.error("Failed to generate report");
//       setReportData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateMonth = (direction) => {
//     const newMonth = new Date(currentMonth);
//     newMonth.setMonth(currentMonth.getMonth() + direction);
//     setCurrentMonth(newMonth);
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amount);
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const totalBills = reportData.reduce((sum, item) => sum + item.noOfBills, 0);
//   const totalRevenue = reportData.reduce((sum, item) => sum + item.totalRevenue, 0);

//   const days = getDaysInMonth(currentMonth);

//   const handleExport = () => {
//     if (reportData.length === 0) {
//       toast.error("No data to export!");
//       return;
//     }

//     // Convert report data to CSV
//     const headers = ["S.No", "Date", "Executive Name", "No. of Bills", "Total Revenue"];
//     const csvRows = [
//       headers.join(","),
//       ...reportData.map((item, index) => 
//         [
//           index + 1,
//           item.date,
//           item.executiveName,
//           item.noOfBills,
//           item.totalRevenue
//         ].join(",")
//       ),
//       "", // Empty row
//       `Total,,${reportData.length} Executives,${totalBills},${totalRevenue}`
//     ];

//     const csvContent = csvRows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `executive_report_${selectedDate || 'all'}.csv`;
//     link.click();
    
//     toast.success("📤 Report exported successfully!");
//   };

//   const handlePrint = () => {
//     if (reportData.length === 0) {
//       toast.error("No data to print!");
//       return;
//     }

//     const printContent = generatePrintContent();
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(printContent);
//     printWindow.document.close();
//     printWindow.print();
//     toast.success("🖨️ Printing report...");
//   };

//   const generatePrintContent = () => {
//     const currentDate = new Date().toLocaleDateString('en-IN');
    
//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Executive Report</title>
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             margin: 30px;
//             line-height: 1.6;
//           }
//           .header { 
//             text-align: center; 
//             margin-bottom: 30px;
//             border-bottom: 3px solid #14b8a6;
//             padding-bottom: 20px;
//           }
//           .company-name { 
//             font-size: 32px; 
//             font-weight: bold; 
//             color: #14b8a6;
//             margin-bottom: 10px;
//           }
//           .report-title {
//             font-size: 24px;
//             font-weight: bold;
//             color: #333;
//             margin-top: 10px;
//           }
//           .report-table {
//             width: 100%;
//             border-collapse: collapse;
//             margin: 20px 0;
//           }
//           .report-table th,
//           .report-table td {
//             border: 1px solid #333;
//             padding: 12px;
//             text-align: left;
//           }
//           .report-table th {
//             background: #14b8a6;
//             color: white;
//             font-weight: bold;
//             text-align: center;
//           }
//           .total-row {
//             background: #f0f0f0;
//             font-weight: bold;
//             font-size: 18px;
//           }
//           .footer {
//             margin-top: 50px;
//             text-align: center;
//             padding-top: 20px;
//             border-top: 2px solid #ddd;
//             color: #666;
//           }
//           @media print {
//             body { margin: 20px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <div class="company-name">Stores</div>
//           <div class="report-title">Executive Report (Billing)</div>
//           <div style="margin-top: 10px; font-size: 14px; color: #666;">
//             Generated on: ${currentDate}
//             ${selectedDate ? `<br>Report Date: ${formatDate(selectedDate)}` : ''}
//           </div>
//         </div>
        
//         <table class="report-table">
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Date</th>
//               <th>Executive Name</th>
//               <th>No. of Bills</th>
//               <th>Total Revenue</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${reportData.map((item, index) => `
//               <tr>
//                 <td style="text-align: center;">${index + 1}</td>
//                 <td style="text-align: center;">${formatDate(item.date)}</td>
//                 <td>${item.executiveName}</td>
//                 <td style="text-align: center;">${item.noOfBills}</td>
//                 <td style="text-align: right;">${formatCurrency(item.totalRevenue)}</td>
//               </tr>
//             `).join('')}
//             <tr class="total-row">
//               <td colspan="3" style="text-align: right;">Total:</td>
//               <td style="text-align: center;">${totalBills}</td>
//               <td style="text-align: right;">${formatCurrency(totalRevenue)}</td>
//             </tr>
//           </tbody>
//         </table>

//         <div style="margin-top: 30px;">
//           <p><strong>Summary:</strong></p>
//           <p>Total Executives: ${reportData.length}</p>
//           <p>Total Bills Processed: ${totalBills}</p>
//           <p>Total Revenue Generated: ${formatCurrency(totalRevenue)}</p>
//         </div>

//         <div class="footer">
//           <p><strong>Stores</strong></p>
//           <p style="font-size: 12px;">
//             This is a computer-generated document.
//           </p>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
//       <Toaster position="top-right" />
      
//       {/* Header */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-teal-600">Executive Report (Billing)</h1>
//           <div className="flex gap-3">
//             <button
//               onClick={handleExport}
//               disabled={reportData.length === 0}
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               📤 Export CSV
//             </button>
//             <button
//               onClick={handlePrint}
//               disabled={reportData.length === 0}
//               className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               🖨️ Print
//             </button>
//           </div>
//         </div>

//         {/* Selection Controls */}
//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Calendar Date Picker */}
//           <div className="space-y-2">
//             <label className="block text-lg font-semibold text-gray-700">
//               📅 Select Date
//             </label>
//             <button
//               onClick={openCalendar}
//               className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-teal-500 cursor-pointer bg-white hover:bg-teal-50 text-left"
//             >
//               {selectedDate ? formatDate(selectedDate) : "Click to select date..."}
//             </button>
//           </div>

//           {/* Select Executive */}
//           <div className="space-y-2">
//             <label className="block text-lg font-semibold text-gray-700">
//               👨‍💼 Select Executive
//             </label>
//             <select
//               value={selectedExecutive}
//               onChange={(e) => handleExecutiveChange(e.target.value)}
//               className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-teal-500 cursor-pointer bg-white"
//             >
//               <option value="">Choose Executive...</option>
//               <option value="all">All Executives</option>
//               {users.map((user) => (
//                 <option key={user.id} value={user.username}>
//                   {user.username}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Clear Filters */}
//         {(selectedDate || selectedExecutive) && (
//           <div className="mt-4">
//             <button
//               onClick={() => {
//                 setSelectedDate("");
//                 setSelectedExecutive("");
//                 setReportData([]);
//                 toast.success("🔄 Filters cleared");
//               }}
//               className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
//             >
//               Clear All Filters
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Calendar Modal */}
//       {showCalendar && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-teal-600">Select Date</h3>
//               <button
//                 onClick={() => setShowCalendar(false)}
//                 className="text-gray-500 hover:text-gray-700 text-xl"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Calendar Header */}
//             <div className="flex justify-between items-center mb-4">
//               <button
//                 onClick={() => navigateMonth(-1)}
//                 className="p-2 hover:bg-gray-100 rounded"
//               >
//                 ← Prev
//               </button>
//               <h4 className="text-lg font-semibold">
//                 {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
//               </h4>
//               <button
//                 onClick={() => navigateMonth(1)}
//                 className="p-2 hover:bg-gray-100 rounded"
//               >
//                 Next →
//               </button>
//             </div>

//             {/* Weekday Headers */}
//             <div className="grid grid-cols-7 gap-1 mb-2">
//               {weekdays.map(day => (
//                 <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
//                   {day}
//                 </div>
//               ))}
//             </div>

//             {/* Calendar Days */}
//             <div className="grid grid-cols-7 gap-1">
//               {days.map((date, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleDateSelect(date)}
//                   disabled={!date}
//                   className={`
//                     p-3 text-center rounded hover:bg-teal-100 transition-colors
//                     ${!date ? 'invisible' : 'text-gray-700 hover:text-teal-600'}
//                     ${date && date.toDateString() === new Date().toDateString() 
//                       ? 'bg-teal-500 text-white hover:bg-teal-600' 
//                       : ''
//                     }
//                     ${date && selectedDate && date.toISOString().split('T')[0] === selectedDate
//                       ? 'bg-teal-400 text-white'
//                       : ''
//                     }
//                   `}
//                 >
//                   {date ? date.getDate() : ''}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Loading State */}
//       {loading && (
//         <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
//           <span className="text-lg font-semibold text-blue-700">
//             ⏳ Loading report data...
//           </span>
//         </div>
//       )}

//       {/* Selection Summary */}
//       {selectedDate && selectedExecutive && reportData.length > 0 && !loading && (
//         <div className="bg-blue-50 p-4 rounded-lg mb-6">
//           <div className="flex items-center justify-between">
//             <span className="text-lg font-semibold text-blue-700">
//               📊 Report for: {selectedExecutive === "all" ? "All Executives" : selectedExecutive} - {formatDate(selectedDate)}
//             </span>
//             <div className="text-sm text-blue-600">
//               Records: {reportData.length} | Total Bills: {totalBills} | Total Revenue: {formatCurrency(totalRevenue)}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Table */}
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead className="bg-teal-500 text-white">
//               <tr>
//                 <th className="border border-teal-600 p-3">S.No</th>
//                 <th className="border border-teal-600 p-3">Date</th>
//                 <th className="border border-teal-600 p-3">Executive Name</th>
//                 <th className="border border-teal-600 p-3">No. of Bills</th>
//                 <th className="border border-teal-600 p-3">Total Revenue</th>
//               </tr>
//             </thead>
//             <tbody>
//               {reportData.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
//                     📅 Please select date and executive to generate report
//                   </td>
//                 </tr>
//               ) : (
//                 reportData.map((item, index) => (
//                   <tr key={item.id} className="text-center hover:bg-gray-50">
//                     <td className="border border-gray-300 p-3 font-medium">{index + 1}</td>
//                     <td className="border border-gray-300 p-3">{formatDate(item.date)}</td>
//                     <td className="border border-gray-300 p-3 text-left">{item.executiveName}</td>
//                     <td className="border border-gray-300 p-3">{item.noOfBills}</td>
//                     <td className="border border-gray-300 p-3 text-right font-semibold text-green-600">
//                       {formatCurrency(item.totalRevenue)}
//                     </td>
//                   </tr>
//                 ))
//               )}
              
//               {/* Total Row */}
//               {reportData.length > 0 && (
//                 <tr className="bg-teal-50 font-bold">
//                   <td colSpan="3" className="border border-gray-300 p-3 text-right text-lg">
//                     Total:
//                   </td>
//                   <td className="border border-gray-300 p-3 text-center text-lg text-teal-600">
//                     {totalBills}
//                   </td>
//                   <td className="border border-gray-300 p-3 text-right text-xl text-teal-600">
//                     {formatCurrency(totalRevenue)}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       {reportData.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Executives</h3>
//             <p className="text-2xl font-bold text-teal-600">{reportData.length}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bills Processed</h3>
//             <p className="text-2xl font-bold text-blue-600">{totalBills}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
//             <p className="text-2xl font-bold text-green-600">
//               {formatCurrency(totalRevenue)}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";

// export default function ExecutiveReport() {
//   const [reportData, setReportData] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [selectedExecutive, setSelectedExecutive] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//     const today = new Date();
//     const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
//     setSelectedMonth(currentMonth);
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/executive/users");
//       if (res.ok) {
//         const data = await res.json();
//         setUsers(data);
//       } else {
//         toast.error("Failed to fetch users");
//       }
//     } catch (err) {
//       console.error("Failed to fetch users:", err);
//       toast.error("Failed to fetch users");
//     }
//   };

//   const handleFetchReport = async () => {
//     if (!selectedExecutive && !selectedMonth) {
//       toast.error("Please select at least executive or month!");
//       return;
//     }

//     setLoading(true);
//     try {
//       let url = "http://localhost:5000/api/executive/salary-history?";
//       const params = [];
      
//       if (selectedExecutive) {
//         params.push(`username=${selectedExecutive}`);
//       }
      
//       if (selectedMonth) {
//         params.push(`month=${selectedMonth}`);
//       }
      
//       url += params.join('&');

//       const res = await fetch(url);
      
//       if (!res.ok) {
//         const error = await res.json();
//         toast.error(error.error || "Failed to fetch report");
//         return;
//       }

//       const data = await res.json();
      
//       if (data.length === 0) {
//         toast.error("No salary records found for the selected criteria!");
//         setReportData([]);
//         return;
//       }

//       setReportData(data);
//       toast.success(`Found ${data.length} salary record(s)!`);
//     } catch (err) {
//       console.error("Failed to fetch report:", err);
//       toast.error("Failed to fetch report data");
//       setReportData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClearFilters = () => {
//     setSelectedExecutive("");
//     setSelectedMonth("");
//     setReportData([]);
//     toast.success("Filters cleared!");
//   };

//   const getMonthName = (monthStr) => {
//     if (!monthStr) return '';
//     const [year, month] = monthStr.split('-');
//     const date = new Date(year, month - 1);
//     return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amount);
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const totalBills = reportData.reduce((sum, item) => sum + item.total_bills, 0);
//   const totalSalary = reportData.reduce((sum, item) => sum + parseFloat(item.salary_amount), 0);

//   const handleExport = () => {
//     if (reportData.length === 0) {
//       toast.error("No data to export!");
//       return;
//     }

//     const headers = ["S.No", "Date", "Executive Name", "Month", "No. of Bills", "Salary"];
//     const csvRows = [
//       headers.join(","),
//       ...reportData.map((item, index) => 
//         [
//           index + 1,
//           formatDate(item.date),
//           item.username,
//           getMonthName(item.salary_month),
//           item.total_bills,
//           item.salary_amount
//         ].join(",")
//       ),
//       "",
//       `Total,,${reportData.length} Records,${totalBills},${totalSalary}`
//     ];

//     const csvContent = csvRows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `executive_salary_report_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
    
//     toast.success("📤 Report exported successfully!");
//   };

//   const handlePrint = () => {
//     if (reportData.length === 0) {
//       toast.error("No data to print!");
//       return;
//     }

//     const printContent = generatePrintContent();
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(printContent);
//     printWindow.document.close();
//     printWindow.print();
//     toast.success("🖨️ Printing report...");
//   };

//   const generatePrintContent = () => {
//     const currentDate = new Date().toLocaleDateString('en-IN');
    
//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Executive Salary Report</title>
//         <style>
//           body { 
//             font-family: Arial, sans-serif; 
//             margin: 30px;
//             line-height: 1.6;
//           }
//           .header { 
//             text-align: center; 
//             margin-bottom: 30px;
//             border-bottom: 3px solid #14b8a6;
//             padding-bottom: 20px;
//           }
//           .company-name { 
//             font-size: 32px; 
//             font-weight: bold; 
//             color: #14b8a6;
//             margin-bottom: 10px;
//           }
//           .report-title {
//             font-size: 24px;
//             font-weight: bold;
//             color: #333;
//             margin-top: 10px;
//           }
//           .report-table {
//             width: 100%;
//             border-collapse: collapse;
//             margin: 20px 0;
//           }
//           .report-table th,
//           .report-table td {
//             border: 1px solid #333;
//             padding: 12px;
//             text-align: left;
//           }
//           .report-table th {
//             background: #14b8a6;
//             color: white;
//             font-weight: bold;
//             text-align: center;
//           }
//           .total-row {
//             background: #f0f0f0;
//             font-weight: bold;
//             font-size: 18px;
//           }
//           @media print {
//             body { margin: 20px; }
//           }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <div class="company-name">Stores</div>
//           <div class="report-title">Executive Salary Report</div>
//           <div style="margin-top: 10px; font-size: 14px; color: #666;">
//             Generated on: ${currentDate}
//           </div>
//         </div>
        
//         <table class="report-table">
//           <thead>
//             <tr>
//               <th>S.No</th>
//               <th>Date</th>
//               <th>Executive Name</th>
//               <th>Month</th>
//               <th>No. of Bills</th>
//               <th>Salary</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${reportData.map((item, index) => `
//               <tr>
//                 <td style="text-align: center;">${index + 1}</td>
//                 <td style="text-align: center;">${formatDate(item.date)}</td>
//                 <td>${item.username}</td>
//                 <td style="text-align: center;">${getMonthName(item.salary_month)}</td>
//                 <td style="text-align: center;">${item.total_bills}</td>
//                 <td style="text-align: right;">${formatCurrency(item.salary_amount)}</td>
//               </tr>
//             `).join('')}
//             <tr class="total-row">
//               <td colspan="4" style="text-align: right;">Total:</td>
//               <td style="text-align: center;">${totalBills}</td>
//               <td style="text-align: right;">${formatCurrency(totalSalary)}</td>
//             </tr>
//           </tbody>
//         </table>

//         <div style="margin-top: 30px;">
//           <p><strong>Summary:</strong></p>
//           <p>Total Records: ${reportData.length}</p>
//           <p>Total Bills Processed: ${totalBills}</p>
//           <p>Total Salary Paid: ${formatCurrency(totalSalary)}</p>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   return (
//     <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
//       <Toaster position="top-right" />
      
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-teal-600">Executive Salary Report</h1>
//           <div className="flex gap-3">
//             <button
//               onClick={handleExport}
//               disabled={reportData.length === 0}
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               📤 Export CSV
//             </button>
//             <button
//               onClick={handlePrint}
//               disabled={reportData.length === 0}
//               className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               🖨️ Print
//             </button>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               👨‍💼 Select Executive
//             </label>
//             <select
//               value={selectedExecutive}
//               onChange={(e) => setSelectedExecutive(e.target.value)}
//               className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-teal-500 bg-white"
//             >
//               <option value="">All Executives</option>
//               {users.map((user) => (
//                 <option key={user.id} value={user.username}>
//                   {user.username}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               📅 Select Month
//             </label>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-teal-500 bg-white"
//             />
//           </div>

//           <div className="flex items-end gap-2">
//             <button
//               onClick={handleFetchReport}
//               disabled={loading}
//               className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
//             >
//               {loading ? "Loading..." : "🔍 Fetch"}
//             </button>
//             <button
//               onClick={handleClearFilters}
//               className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
//             >
//               Clear
//             </button>
//           </div>
//         </div>
//       </div>

//       {loading && (
//         <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
//           <span className="text-lg font-semibold text-blue-700">
//             ⏳ Loading report data...
//           </span>
//         </div>
//       )}

//       {reportData.length > 0 && !loading && (
//         <div className="bg-blue-50 p-4 rounded-lg mb-6">
//           <div className="flex items-center justify-between">
//             <span className="text-lg font-semibold text-blue-700">
//               📊 Found {reportData.length} salary record(s)
//             </span>
//             <div className="text-sm text-blue-600">
//               Total Bills: {totalBills} | Total Salary: {formatCurrency(totalSalary)}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead className="bg-teal-500 text-white">
//               <tr>
//                 <th className="border border-teal-600 p-3">S.No</th>
//                 <th className="border border-teal-600 p-3">Date</th>
//                 <th className="border border-teal-600 p-3">Executive Name</th>
//                 <th className="border border-teal-600 p-3">Month</th>
//                 <th className="border border-teal-600 p-3">No. of Bills</th>
//                 <th className="border border-teal-600 p-3">Salary</th>
//               </tr>
//             </thead>
//             <tbody>
//               {reportData.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
//                     📅 Please select filters and click "Fetch" to view salary records
//                   </td>
//                 </tr>
//               ) : (
//                 reportData.map((item, index) => (
//                   <tr key={item.id} className="text-center hover:bg-gray-50">
//                     <td className="border border-gray-300 p-3 font-medium">{index + 1}</td>
//                     <td className="border border-gray-300 p-3">{formatDate(item.date)}</td>
//                     <td className="border border-gray-300 p-3 text-left">{item.username}</td>
//                     <td className="border border-gray-300 p-3">{getMonthName(item.salary_month)}</td>
//                     <td className="border border-gray-300 p-3 font-semibold text-blue-600">{item.total_bills}</td>
//                     <td className="border border-gray-300 p-3 text-right font-semibold text-green-600">
//                       {formatCurrency(item.salary_amount)}
//                     </td>
//                   </tr>
//                 ))
//               )}
              
//               {reportData.length > 0 && (
//                 <tr className="bg-teal-50 font-bold">
//                   <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg">
//                     Total:
//                   </td>
//                   <td className="border border-gray-300 p-3 text-center text-lg text-teal-600">
//                     {totalBills}
//                   </td>
//                   <td className="border border-gray-300 p-3 text-right text-xl text-teal-600">
//                     {formatCurrency(totalSalary)}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {reportData.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Records</h3>
//             <p className="text-2xl font-bold text-teal-600">{reportData.length}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bills Processed</h3>
//             <p className="text-2xl font-bold text-blue-600">{totalBills}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Salary Paid</h3>
//             <p className="text-2xl font-bold text-green-600">
//               {formatCurrency(totalSalary)}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ExecutiveReport() {
  const [reportData, setReportData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  const handleFetchReport = async () => {
    if (!selectedMonth) {
      toast.error("Please select a month!");
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5000/api/executive/salary-history?month=${selectedMonth}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Failed to fetch report");
        return;
      }

      const data = await res.json();
      
      if (data.length === 0) {
        toast.error("No salary records found for the selected month!");
        setReportData([]);
        return;
      }

      setReportData(data);
      toast.success(`Found ${data.length} salary record(s) for ${getMonthName(selectedMonth)}!`);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      toast.error("Failed to fetch report data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalBills = reportData.reduce((sum, item) => sum + item.total_bills, 0);
  const totalSalary = reportData.reduce((sum, item) => sum + parseFloat(item.salary_amount), 0);

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const headers = ["S.No", "Date", "Executive Name", "Month", "No. of Bills", "Salary"];
    const csvRows = [
      headers.join(","),
      ...reportData.map((item, index) => 
        [
          index + 1,
          formatDate(item.date),
          item.username,
          getMonthName(item.salary_month),
          item.total_bills,
          item.salary_amount
        ].join(",")
      ),
      "",
      `Total,,,${reportData.length} Records,${totalBills},${totalSalary}`
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `executive_salary_report_${selectedMonth}.csv`;
    link.click();
    
    toast.success("📤 Report exported successfully!");
  };

  const handlePrint = () => {
    if (reportData.length === 0) {
      toast.error("No data to print!");
      return;
    }

    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    toast.success("🖨️ Printing report...");
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
            border-bottom: 3px solid #14b8a6;
            padding-bottom: 20px;
          }
          .company-name { 
            font-size: 32px; 
            font-weight: bold; 
            color: #14b8a6;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .report-table th,
          .report-table td {
            border: 1px solid #333;
            padding: 12px;
            text-align: left;
          }
          .report-table th {
            background: #14b8a6;
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
            Generated on: ${currentDate}<br>
            Report Month: ${getMonthName(selectedMonth)}
          </div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Executive Name</th>
              <th>Month</th>
              <th>No. of Bills</th>
              <th>Salary</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.map((item, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="text-align: center;">${formatDate(item.date)}</td>
                <td>${item.username}</td>
                <td style="text-align: center;">${getMonthName(item.salary_month)}</td>
                <td style="text-align: center;">${item.total_bills}</td>
                <td style="text-align: right;">${formatCurrency(item.salary_amount)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">Total:</td>
              <td style="text-align: center;">${totalBills}</td>
              <td style="text-align: right;">${formatCurrency(totalSalary)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px;">
          <p><strong>Summary:</strong></p>
          <p>Total Executives: ${reportData.length}</p>
          <p>Total Bills Processed: ${totalBills}</p>
          <p>Total Salary Paid: ${formatCurrency(totalSalary)}</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-600">Executive Salary Report</h1>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={reportData.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              📤 Export CSV
            </button>
            <button
              onClick={handlePrint}
              disabled={reportData.length === 0}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              📅 Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-teal-500 bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFetchReport}
              disabled={loading}
              className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Loading..." : "🔍 Fetch Report"}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
          <span className="text-lg font-semibold text-blue-700">
            ⏳ Loading report data...
          </span>
        </div>
      )}

      {reportData.length > 0 && !loading && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-lg font-semibold text-blue-700">
              📊 Salary Report for {getMonthName(selectedMonth)} - {reportData.length} Executive(s)
            </span>
            <div className="text-sm text-blue-600">
              Total Bills: {totalBills} | Total Salary: {formatCurrency(totalSalary)}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="border border-teal-600 p-3 text-center">S.No</th>
                <th className="border border-teal-600 p-3 text-center">Date</th>
                <th className="border border-teal-600 p-3 text-center">Executive Name</th>
                <th className="border border-teal-600 p-3 text-center">Month</th>
                <th className="border border-teal-600 p-3 text-center">No. of Bills</th>
                <th className="border border-teal-600 p-3 text-center">Salary (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
                    📅 Please select a month and click "Fetch Report" to view salary records
                  </td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3 text-center font-medium">{index + 1}</td>
                    <td className="border border-gray-300 p-3 text-center bg-gray-50">{formatDate(item.date)}</td>
                    <td className="border border-gray-300 p-3 bg-gray-50">{item.username}</td>
                    <td className="border border-gray-300 p-3 text-center bg-gray-50">{getMonthName(item.salary_month)}</td>
                    <td className="border border-gray-300 p-3 text-center font-semibold text-blue-600 bg-gray-50">{item.total_bills}</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold text-green-600">
                      ₹{parseFloat(item.salary_amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
              
              {reportData.length > 0 && (
                <tr className="bg-teal-50 font-bold">
                  <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg">
                    Total:
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-lg text-teal-600">
                    {totalBills}
                  </td>
                  <td className="border border-gray-300 p-3 text-right text-xl text-teal-600">
                    ₹{totalSalary.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Executives</h3>
            <p className="text-2xl font-bold text-teal-600">{reportData.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bills Processed</h3>
            <p className="text-2xl font-bold text-blue-600">{totalBills}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Salary Paid</h3>
            <p className="text-2xl font-bold text-green-600">
              ₹{totalSalary.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}