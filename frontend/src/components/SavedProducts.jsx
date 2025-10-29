import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added
import toast, { Toaster } from "react-hot-toast";

export default function SavedProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); 
  const navigate = useNavigate(); // ✅ added

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleDelete = async (product_id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${product_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("✅ Product deleted!");
      fetchProducts();
    } catch (err) {
      toast.error("⚠️ " + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.product_id);
    setEditedProduct({ ...product });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedProduct({});
  };

  const handleChange = (field, value) => {
    setEditedProduct({ ...editedProduct, [field]: value });
  };

  const handleSave = async () => {
    const { product_id, categoryName, productName, unitOfMeasurement, unitPrice, hsnCode } = editedProduct;

    if (!categoryName?.trim() || !productName?.trim() || !unitOfMeasurement?.trim() || !unitPrice || !hsnCode?.trim()) {
      return toast.error("⚠️ All fields are required");
    }

    const numericPrice = typeof unitPrice === "string" ? parseFloat(unitPrice) : unitPrice;

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return toast.error("⚠️ Invalid price value");
    }

    try {
      const payload = {
        categoryName: categoryName.trim(),
        productName: productName.trim(),
        unitOfMeasurement: unitOfMeasurement.trim(),
        unitPrice: numericPrice,
        hsnCode: hsnCode.trim(),
      };

      const res = await fetch(`http://localhost:5000/products/${product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      toast.success("✅ Product updated!");
      setEditingId(null);
      setEditedProduct({});
      fetchProducts();
    } catch (err) {
      toast.error("⚠️ " + err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.categoryName + p.productName + p.unitOfMeasurement + p.hsnCode)
      .replace(/\s+/g, "")
      .toLowerCase()
      .includes(searchTerm.replace(/\s+/g, "").toLowerCase())
  );

  return (
    <div className="p-6 font-[Poppins]">
      <Toaster />
      {/* ✅ Header with Back button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-teal-600">Saved Products</h2>
        <button
          onClick={() => navigate("/products")} // <-- change route as needed
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
        >
          Back
        </button>
      </div>

      {/* Search box */}
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
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm focus:outline-none"
        />
      </div>

      <table className="w-full border-collapse border text-base">
        <thead className="bg-teal-500 text-white">
          <tr>
            <th className="border p-3">S.No</th>
            <th className="border p-3">Category</th>
            <th className="border p-3">Product Name</th>
            <th className="border p-3">Unit</th>
            <th className="border p-3">Price</th>
            <th className="border p-3">HSN Code</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="border p-6 text-center text-gray-500 text-lg">
                No products found
              </td>
            </tr>
          ) : (
            filteredProducts.map((p, index) => (
              <tr key={p.product_id} className="text-center">
                <td className="border p-3">{index + 1}</td>
                <td className="border p-3">
                  {editingId === p.product_id ? (
                    <input
                      value={editedProduct.categoryName || ""}
                      onChange={(e) => handleChange("categoryName", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.categoryName
                  )}
                </td>
                <td className="border p-3">
                  {editingId === p.product_id ? (
                    <input
                      value={editedProduct.productName || ""}
                      onChange={(e) => handleChange("productName", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.productName
                  )}
                </td>
                <td className="border p-3">
                  {editingId === p.product_id ? (
                    <input
                      value={editedProduct.unitOfMeasurement || ""}
                      onChange={(e) => handleChange("unitOfMeasurement", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.unitOfMeasurement
                  )}
                </td>
                <td className="border p-3">
                  {editingId === p.product_id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedProduct.unitPrice || ""}
                      onChange={(e) => handleChange("unitPrice", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.unitPrice
                  )}
                </td>
                <td className="border p-3">
                  {editingId === p.product_id ? (
                    <input
                      value={editedProduct.hsnCode || ""}
                      onChange={(e) => handleChange("hsnCode", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    p.hsnCode
                  )}
                </td>
                <td className="border p-3">
                  <div className="flex gap-2 justify-center">
                    {editingId === p.product_id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.product_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
