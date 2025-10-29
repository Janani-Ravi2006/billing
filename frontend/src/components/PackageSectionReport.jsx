import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PackerReport() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPacker, setSelectedPacker] = useState("");
  const [packersList, setPackersList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchPackersList();
  }, []);

  const fetchPackersList = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/packer/packers-list");
      if (res.ok) {
        const data = await res.json();
        setPackersList(data);
      }
    } catch (err) {
      console.error("Failed to fetch packers:", err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setShowCalendar(false);
    setSelectedPacker("");
    setReportData([]);
    
    toast.success(`📅 Date selected: ${formatDate(formattedDate)}`);
  };

  const handlePackerChange = async (packerName) => {
    if (!selectedDate) {
      toast.error("⚠️ Please select a date first!");
      return;
    }

    setSelectedPacker(packerName);
    await fetchPackerReport(selectedDate, packerName);
  };

  const fetchPackerReport = async (date, packerName) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/packer/report?date=${date}&packerName=${encodeURIComponent(packerName)}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        
        if (data.length === 0) {
          toast.error("No entries found for this date and packer");
        } else {
          toast.success(`✅ Found ${data.length} entries`);
        }
      } else {
        toast.error("❌ Failed to fetch report");
        setReportData([]);
      }
    } catch (err) {
      console.error("Failed to fetch report:", err);
      toast.error("❌ Failed to fetch report");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.error("⚠️ No data to export");
      return;
    }

    const csvContent = [
      ['S.No', 'Date', 'Bill Number', 'Packer Name', 'Time In', 'Time Out'],
      ...reportData.map((e, i) => [
        i + 1,
        formatDate(e.date),
        e.bill_number,
        e.packer_name,
        e.time_in,
        e.time_out || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `packer_report_${selectedDate}_${selectedPacker}.csv`;
    a.click();
    toast.success("✅ Report exported");
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedPacker("");
    setReportData([]);
    toast.success("🔄 Filters cleared");
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-600">📊 Packer Report - Calendar View</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-lg"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-lg"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Selection Area */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              📅 Select Date
            </label>
            <button
              onClick={() => setShowCalendar(true)}
              className="w-full border-2 border-purple-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-purple-500 bg-white hover:bg-purple-50 text-left"
            >
              {selectedDate ? formatDate(selectedDate) : "Click to select date from calendar..."}
            </button>
          </div>

          {/* Packer Selection */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold text-gray-700">
              📦 Select Packer Name
            </label>
            <select
              value={selectedPacker}
              onChange={(e) => handlePackerChange(e.target.value)}
              disabled={!selectedDate}
              className="w-full border-2 border-purple-300 px-4 py-3 rounded-lg text-lg focus:outline-none focus:border-purple-500 cursor-pointer bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Choose Packer...</option>
              {packersList.map((packer, index) => (
                <option key={index} value={packer}>
                  {packer}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedDate || selectedPacker) && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-600">Select Date</h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded font-bold"
              >
                ← Prev
              </button>
              <h4 className="text-lg font-semibold">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded font-bold"
              >
                Next →
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map(day => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  disabled={!date}
                  className={`
                    p-3 text-center rounded hover:bg-purple-100 transition-colors
                    ${!date ? 'invisible' : 'text-gray-700 hover:text-purple-600'}
                    ${date && date.toDateString() === new Date().toDateString() 
                      ? 'bg-purple-500 text-white hover:bg-purple-600 font-bold' 
                      : ''
                    }
                    ${date && selectedDate && date.toISOString().split('T')[0] === selectedDate
                      ? 'bg-purple-400 text-white font-bold ring-2 ring-purple-600'
                      : ''
                    }
                  `}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDate && selectedPacker && (
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-purple-700">
              📦 Showing entries for: <strong>{selectedPacker}</strong> on <strong>{formatDate(selectedDate)}</strong>
            </span>
            <span className="text-sm text-purple-600">
              Total Entries: {reportData.length}
            </span>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base">
            <thead className="bg-purple-500 text-white">
              <tr>
                <th className="border border-purple-600 p-3">S.No</th>
                <th className="border border-purple-600 p-3">Date</th>
                <th className="border border-purple-600 p-3">Bill Number</th>
                <th className="border border-purple-600 p-3">Packer Name</th>
                <th className="border border-purple-600 p-3">Time In</th>
                <th className="border border-purple-600 p-3">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="border p-8 text-center text-gray-500 text-lg">
                    Loading...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border p-8 text-center text-gray-500 text-lg">
                    📅 Please select a date and packer to view entries
                  </td>
                </tr>
              ) : (
                reportData.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border p-3 text-center">{index + 1}</td>
                    <td className="border p-3 text-center">{formatDate(entry.date)}</td>
                    <td className="border p-3 text-center font-medium">{entry.bill_number}</td>
                    <td className="border p-3">{entry.packer_name}</td>
                    <td className="border p-3 text-center">{entry.time_in}</td>
                    <td className="border p-3 text-center">{entry.time_out || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-800">
          <strong>💡 How to use:</strong> First, click on a date from the calendar. Then select a packer name from the dropdown to view their entries for that date.
        </p>
      </div>
    </div>
  );
}