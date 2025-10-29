import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function SavedCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch saved categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/categories");
      const data = await res.json();
      if (!res.ok) {
        toast.error("❌ Failed to fetch categories");
        return;
      }
      const sorted = data.sort((a, b) => a.id - b.id);
      setCategories(sorted.map((c) => ({ ...c, editMode: false })));
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle input change
  const handleChange = (id, value) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, name: value } : c))
    );
  };

  // Toggle Edit/Save
  const handleToggleEdit = async (id) => {
    const category = categories.find((c) => c.id === id);

    if (category.editMode) {
      if (!category.name.trim()) {
        toast.error("⚠️ Category name cannot be empty!");
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: category.name }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(`❌ ${data.error || "Failed to update category"}`);
          return;
        }
        toast.success("✅ Category updated successfully!");
        setCategories(
          categories.map((c) =>
            c.id === id ? { ...c, editMode: false } : c
          )
        );
      } catch (err) {
        toast.error("⚠️ Server error: " + err.message);
      }
    } else {
      setCategories(
        categories.map((c) =>
          c.id === id ? { ...c, editMode: true } : c
        )
      );
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(`❌ ${data.error || "Failed to delete category"}`);
        return;
      }
      toast.success("🗑️ Category deleted successfully");
      const updated = categories.filter((c) => c.id !== id);
      const sorted = updated.sort((a, b) => a.id - b.id);
      setCategories(sorted);
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  // Filtered categories ignoring spaces and case
  const filteredCategories = categories.filter((c) =>
    c.name.replace(/\s+/g, "").toLowerCase().includes(
      searchTerm.replace(/\s+/g, "").toLowerCase()
    )
  );

  return (
    <div className="p-6 font-[Poppins]">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-600">Saved Categories</h2>
        <button
          onClick={() => navigate("/category")}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
        >
          Back
        </button>
      </div>

      {/* Search box with icon */}
      <div className="mb-4 flex items-center border rounded w-64 px-3 py-2 gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-base">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="border p-3">ID</th>
              <th className="border p-3">Category Name</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((c) => (
              <tr key={c.id} className="text-center">
                <td className="border p-3">{c.id}</td>
                <td className="border p-3">
                  <input
                    value={c.name}
                    onChange={(e) => handleChange(c.id, e.target.value)}
                    className="border px-3 py-2 rounded w-full text-lg"
                    disabled={!c.editMode}
                  />
                </td>
                <td className="border p-3 flex gap-3 justify-center">
                  <button
                    onClick={() => handleToggleEdit(c.id)}
                    className={`${
                      c.editMode
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    } text-white px-3 py-1 rounded text-sm`}
                  >
                    {c.editMode ? "Save" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredCategories.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="border p-6 text-center text-gray-500 text-lg"
                >
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
