import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleAddRow = () => {
    setProducts([
      ...products,
      {
        id: Date.now(),
        categoryName: "",
        productName: "",
        unitOfMeasurement: "",
        unitPrice: "",
        hsnCode: "",
        showCategoryDropdown: false,
        filteredCategories: categories,
      },
    ]);
  };

  const handleChange = (id, field, value) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updatedProduct = { ...p, [field]: value };

          // Handle category search
          if (field === "categoryName") {
            if (value.trim()) {
              const filtered = categories.filter((cat) =>
                cat.name.toLowerCase().includes(value.toLowerCase())
              );
              updatedProduct.filteredCategories = filtered;
              updatedProduct.showCategoryDropdown = true;
            } else {
              updatedProduct.filteredCategories = categories;
              updatedProduct.showCategoryDropdown = categories.length > 0;
            }
          }
          return updatedProduct;
        }
        return p;
      })
    );
  };

  const handleCategorySelect = (productId, categoryName) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              categoryName,
              showCategoryDropdown: false,
              filteredCategories: [],
            }
          : p
      )
    );
  };

  const handleCategoryFocus = (productId) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? { ...p, showCategoryDropdown: true, filteredCategories: categories }
          : p
      )
    );
  };

  const handleCategoryBlur = (productId) => {
    setTimeout(() => {
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, showCategoryDropdown: false } : p
        )
      );
    }, 200);
  };

  const handleSaveAll = async () => {
    // ✅ HSN Code removed from required fields
    const unsaved = products.filter(
      (p) =>
        p.categoryName.trim() &&
        p.productName.trim() &&
        p.unitOfMeasurement.trim() &&
        p.unitPrice.trim()
    );

    if (unsaved.length === 0) {
      toast.error("⚠️ No complete products to save!");
      return;
    }

    try {
      for (const product of unsaved) {
        const res = await fetch("http://localhost:5000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryName: product.categoryName,
            productName: product.productName,
            unitOfMeasurement: product.unitOfMeasurement,
            unitPrice: parseFloat(product.unitPrice),
            // ✅ HSN code included only if user entered it
            ...(product.hsnCode ? { hsnCode: product.hsnCode } : {}),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(`❌ ${data.error || "Failed to save product"}`);
          return;
        }
      }
      toast.success("✅ All products saved successfully!");
      setProducts([]);
    } catch (err) {
      toast.error("⚠️ Server error: " + err.message);
    }
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleViewSaved = () => {
    navigate("/saved-products");
  };

  return (
    <div className="p-6 font-[Poppins]" style={{ position: "relative" }}>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-teal-600">Products</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddRow}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-lg"
          >
            + Add Product
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

      <style jsx>{`
        .table-container {
          overflow: visible !important;
        }
        .dropdown-cell {
          position: static !important;
          overflow: visible !important;
        }
        .category-dropdown {
          position: absolute !important;
          z-index: 9999 !important;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          max-height: 200px;
          overflow-y: auto;
          min-width: 200px;
        }
      `}</style>

      <div
        className="table-container"
        style={{ overflow: "visible", position: "relative" }}
      >
        <table
          className="w-full border-collapse border text-base"
          style={{ position: "relative" }}
        >
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="border p-3">S.No</th>
              <th className="border p-3">Category Name</th>
              <th className="border p-3">Product Name</th>
              <th className="border p-3">Unit of Measurement</th>
              <th className="border p-3">Unit Price</th>
              <th className="border p-3">HSN Code </th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="border p-6 text-center text-gray-500 text-lg"
                >
                  No products added yet
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={product.id} className="text-center">
                  <td className="border p-3">{index + 1}</td>

                  {/* Category Name with Dropdown */}
                  <td className="border p-3 dropdown-cell">
                    <div style={{ position: "relative", zIndex: 1000 }}>
                      <input
                        value={product.categoryName}
                        onChange={(e) =>
                          handleChange(product.id, "categoryName", e.target.value)
                        }
                        onFocus={() => handleCategoryFocus(product.id)}
                        onBlur={() => handleCategoryBlur(product.id)}
                        className="border px-3 py-2 rounded w-full text-lg"
                        placeholder="Category Name"
                        autoComplete="off"
                      />

                      {product.showCategoryDropdown &&
                        product.filteredCategories?.length > 0 && (
                          <div
                            className="category-dropdown"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              zIndex: 9999,
                            }}
                          >
                            {product.filteredCategories.map((category, idx) => (
                              <div
                                key={category.id || idx}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleCategorySelect(product.id, category.name);
                                }}
                              >
                                {category.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </td>

                  {/* Product Name */}
                  <td className="border p-3">
                    <input
                      value={product.productName}
                      onChange={(e) =>
                        handleChange(product.id, "productName", e.target.value)
                      }
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Product Name"
                    />
                  </td>

                  {/* Unit of Measurement */}
                  <td className="border p-3">
                    <input
                      value={product.unitOfMeasurement}
                      onChange={(e) =>
                        handleChange(
                          product.id,
                          "unitOfMeasurement",
                          e.target.value
                        )
                      }
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Unit (kg, pcs, etc.)"
                    />
                  </td>

                  {/* Unit Price */}
                  <td className="border p-3">
                    <input
                      type="number"
                      step="0.01"
                      value={product.unitPrice}
                      onChange={(e) =>
                        handleChange(product.id, "unitPrice", e.target.value)
                      }
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="Price"
                    />
                  </td>

                  {/* HSN Code (Optional) */}
                  <td className="border p-3">
                    <input
                      value={product.hsnCode}
                      onChange={(e) =>
                        handleChange(product.id, "hsnCode", e.target.value)
                      }
                      className="border px-3 py-2 rounded w-full text-lg"
                      placeholder="HSN Code"
                    />
                  </td>

                  {/* Delete Button */}
                  <td className="border p-3">
                    <button
                      onClick={() => handleDelete(product.id)}
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
