import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const handleAddRow = () => {
    setCategories([...categories, { id: Date.now(), name: "" }]);
  };

  const handleChange = (id, value) => {
    if (/\d/.test(value)) {
      toast.error("⚠️ Category name should only contain letters.");
      return;
    }
    setCategories(categories.map((c) => (c.id === id ? { ...c, name: value } : c)));
  };

  const handleSaveAll = async () => {
    const unsaved = categories.filter((c) => c.name.trim());
    if (unsaved.length === 0) {
      toast.error("⚠️ No new categories to save!");
      return;
    }
    try {
      for (const c of unsaved) {
        const res = await fetch("http://localhost:5000/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: c.name }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(`❌ ${data.error || "Failed to save category"}`);
          return;
        }
      }
      toast.success("✅ All categories saved successfully!");
      setCategories([]);
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleViewSaved = () => {
    navigate("/saved"); // navigate to SavedCategories page
  };

  return (
    <div className="p-6 font-[Poppins]">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-600">Categories</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddRow}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
          >
            + Add Category
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
              <th className="border p-3">Category Name</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="border p-6 text-center text-gray-500 text-lg">
                  No categories added yet
                </td>
              </tr>
            ) : (
              categories.map((c, index) => (
                <tr key={c.id} className="text-center">
                  <td className="border p-3">{index + 1}</td>
                  <td className="border p-3">
                    <input
                      value={c.name}
                      onChange={(e) => handleChange(c.id, e.target.value)}
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Category Name"
                    />
                  </td>
                  <td className="border p-3 flex gap-3 justify-center">
                    <button
                      onClick={() => handleDelete(c.id)}
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
