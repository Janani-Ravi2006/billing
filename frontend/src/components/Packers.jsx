import { useState } from "react";

// Mock toast functions since react-hot-toast is not available in this environment
const toast = {
  error: (message) => alert(message),
  success: (message) => alert(message)
};

const Toaster = () => null;

export default function Packers() {
  const [packers, setPackers] = useState([]);

  const handleAddRow = () => {
    setPackers([
      ...packers, 
      { 
        id: Date.now(), 
        date: "",
        name: "",
        noOfPackage: "",
        salary: ""
      }
    ]);
  };

  const handleChange = (id, field, value) => {
    // Validation for name field - only letters allowed
    if (field === 'name' && /\d/.test(value)) {
      toast.error("⚠️ Packer name should only contain letters.");
      return;
    }
    
    // Validation for noOfPackage and salary - only numbers allowed
    if ((field === 'noOfPackage' || field === 'salary') && value !== '' && !/^\d+(\.\d*)?$/.test(value)) {
      toast.error(`⚠️ ${field === 'noOfPackage' ? 'Number of packages' : 'Salary'} should only contain numbers.`);
      return;
    }

    setPackers(packers.map((p) => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSaveAll = async () => {
    const unsaved = packers.filter((p) => 
      p.date.trim() && p.name.trim() && p.noOfPackage.trim() && p.salary.trim()
    );
    
    if (unsaved.length === 0) {
      toast.error("⚠️ No new packers to save!");
      return;
    }

    try {
      for (const p of unsaved) {
        const res = await fetch("http://localhost:5000/packers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: p.date,
            name: p.name,
            noOfPackage: parseInt(p.noOfPackage),
            salary: parseFloat(p.salary)
          }),
        });
        
        const data = await res.json();
        if (!res.ok) {
          toast.error(`❌ ${data.error || "Failed to save packer"}`);
          return;
        }
      }
      toast.success("✅ All packers saved successfully!");
      setPackers([]);
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleDelete = (id) => {
    setPackers(packers.filter((p) => p.id !== id));
  };

  const handleViewSaved = () => {
    alert("Navigate to saved packers page"); // Same as navigate("/saved-packers")
  };

  return (
    <div className="p-6 font-[Poppins]">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-600">Packers</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddRow}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
          >
            + Add Packer
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-lg"
          >
            Save All
          </button>
          <button
            onClick={handleViewSaved}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-lg"
          >
            View Saved
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-base">
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="border p-3">S.No</th>
              <th className="border p-3">Date</th>
              <th className="border p-3">Name</th>
              <th className="border p-3">No of Package</th>
              <th className="border p-3">Salary</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packers.length === 0 ? (
              <tr>
                <td colSpan="6" className="border p-6 text-center text-gray-500 text-lg">
                  No packers added yet
                </td>
              </tr>
            ) : (
              packers.map((p, index) => (
                <tr key={p.id} className="text-center">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">
                    <input
                      type="date"
                      value={p.date}
                      onChange={(e) => handleChange(p.id, 'date', e.target.value)}
                      className="border px-3 py-2 rounded w-full text-lg"
                    />
                  </td>
                  <td className="border p-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleChange(p.id, 'name', e.target.value)}
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Packer Name"
                    />
                  </td>
                  <td className="border p-3">
                    <input
                      type="text"
                      value={p.noOfPackage}
                      onChange={(e) => handleChange(p.id, 'noOfPackage', e.target.value)}
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="No of Package"
                    />
                  </td>
                  <td className="border p-3">
                    <input
                      type="text"
                      value={p.salary}
                      onChange={(e) => handleChange(p.id, 'salary', e.target.value)}
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Salary"
                    />
                  </td>
                  <td className="border p-3 flex gap-3 justify-center">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
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
  );
}