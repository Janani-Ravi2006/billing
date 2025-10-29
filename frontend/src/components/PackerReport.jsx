import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PackerReport() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    packerName: '',
    billNumber: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/packer/entries");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        setFilteredEntries(data);
      } else {
        toast.error("❌ Failed to load entries");
      }
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      toast.error("❌ Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilters = () => {
    let filtered = [...entries];

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(e => {
        const entryDate = new Date(e.date);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        return entryDate >= start && entryDate <= end;
      });
    }

    if (filters.packerName) {
      filtered = filtered.filter(e => 
        e.packer_name.toLowerCase().includes(filters.packerName.toLowerCase())
      );
    }

    if (filters.billNumber) {
      filtered = filtered.filter(e => 
        e.bill_number.toString().includes(filters.billNumber)
      );
    }

    setFilteredEntries(filtered);
    toast.success(`✅ Found ${filtered.length} entries`);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      packerName: '',
      billNumber: ''
    });
    setFilteredEntries(entries);
    toast.success("✅ Filters cleared");
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({
      date: entry.date.split('T')[0],
      bill_number: entry.bill_number,
      packer_name: entry.packer_name,
      time_in: entry.time_in,
      time_out: entry.time_out || ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/packer/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editData.date,
          billNumber: editData.bill_number,
          packerName: editData.packer_name,
          timeIn: editData.time_in,
          timeOut: editData.time_out || null
        })
      });

      if (res.ok) {
        toast.success("✅ Entry updated successfully!");
        setEditingId(null);
        fetchEntries();
      } else {
        const data = await res.json();
        toast.error(`❌ ${data.error || 'Failed to update entry'}`);
      }
    } catch (err) {
      console.error('Error updating entry:', err);
      toast.error("❌ Failed to update entry");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/packer/entries/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('✅ Entry deleted successfully!');
        fetchEntries();
      } else {
        toast.error('❌ Failed to delete entry');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      toast.error('❌ Failed to delete entry');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csvContent = [
      ['S.No', 'Date', 'Bill Number', 'Packer Name', 'Time In', 'Time Out'],
      ...filteredEntries.map((e, i) => [
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
    a.download = `packer_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("✅ Report exported");
  };

  return (
    <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-purple-600">📊 Packer Report</h2>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Packer Name
            </label>
            <input
              type="text"
              value={filters.packerName}
              onChange={(e) => handleFilterChange('packerName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Search packer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Number
            </label>
            <input
              type="text"
              value={filters.billNumber}
              onChange={(e) => handleFilterChange('billNumber', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Search bill"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📋 Entries ({filteredEntries.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No entries found</p>
          </div>
        ) : (
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
                  <th className="border border-purple-600 p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border p-3 text-center">{index + 1}</td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => handleEditChange('date', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        formatDate(entry.date)
                      )}
                    </td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          value={editData.bill_number}
                          onChange={(e) => handleEditChange('bill_number', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        entry.bill_number
                      )}
                    </td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          value={editData.packer_name}
                          onChange={(e) => handleEditChange('packer_name', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        entry.packer_name
                      )}
                    </td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="time"
                          value={editData.time_in}
                          onChange={(e) => handleEditChange('time_in', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        entry.time_in
                      )}
                    </td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <input
                          type="time"
                          value={editData.time_out}
                          onChange={(e) => handleEditChange('time_out', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-purple-500"
                        />
                      ) : (
                        entry.time_out || '-'
                      )}
                    </td>
                    <td className="border p-3 text-center">
                      {editingId === entry.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleSaveEdit(entry.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}