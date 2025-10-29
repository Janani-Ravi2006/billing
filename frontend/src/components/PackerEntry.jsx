// ==========================================
// 1. PACKER ENTRY COMPONENT (PackerEntry.jsx)
// ==========================================
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PackerEntry() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddRow = () => {
    setEntries([
      ...entries,
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        billNumber: '',
        packerName: '',
        timeIn: '',
        timeOut: ''
      }
    ]);
  };

  const handleChange = (id, field, value) => {
    setEntries(entries.map((e) => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSaveAll = async () => {
    const unsaved = entries.filter((e) => e.billNumber.trim() && e.packerName.trim() && e.timeIn.trim());
    
    if (unsaved.length === 0) {
      toast.error("⚠️ Please add at least one complete entry!");
      return;
    }

    setLoading(true);

    try {
      for (const entry of unsaved) {
        const res = await fetch('http://localhost:5000/api/packer/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: entry.date,
            billNumber: entry.billNumber,
            packerName: entry.packerName,
            timeIn: entry.timeIn,
            timeOut: entry.timeOut || null
          })
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(`❌ ${data.error || "Failed to save entry"}`);
          setLoading(false);
          return;
        }
      }
      
      toast.success("✅ All entries saved successfully!");
      setEntries([]);
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="p-6 font-[Poppins] bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-600">📦 Packer Entry</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddRow}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
          >
            + Add Entry
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-lg disabled:bg-gray-400"
          >
            {loading ? '⏳ Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-base">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="border border-teal-600 p-3">S.No</th>
                <th className="border border-teal-600 p-3">Date</th>
                <th className="border border-teal-600 p-3">Bill Number</th>
                <th className="border border-teal-600 p-3">Packer Name</th>
                <th className="border border-teal-600 p-3">Time In</th>
                <th className="border border-teal-600 p-3">Time Out</th>
                <th className="border border-teal-600 p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="border p-8 text-center text-gray-500 text-lg">
                    No entries added yet. Click "+ Add Entry" to start
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border p-3 text-center">{index + 1}</td>
                    <td className="border p-3">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => handleChange(entry.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:border-teal-500"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        type="text"
                        value={entry.billNumber}
                        onChange={(e) => handleChange(entry.id, 'billNumber', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:border-teal-500"
                        placeholder="Bill Number"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        type="text"
                        value={entry.packerName}
                        onChange={(e) => handleChange(entry.id, 'packerName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:border-teal-500"
                        placeholder="Packer Name"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        type="time"
                        value={entry.timeIn}
                        onChange={(e) => handleChange(entry.id, 'timeIn', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:border-teal-500"
                      />
                    </td>
                    <td className="border p-3">
                      <input
                        type="time"
                        value={entry.timeOut}
                        onChange={(e) => handleChange(entry.id, 'timeOut', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-base focus:outline-none focus:border-teal-500"
                        placeholder="Optional"
                      />
                    </td>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
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

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-800">
          <strong>💡 Tip:</strong> Time Out is optional. You can leave it empty and add it later from the report page.
        </p>
      </div>
    </div>
  );
}
