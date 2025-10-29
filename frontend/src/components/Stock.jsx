// import { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { Trash2, Edit2, X, Check } from "lucide-react";

// export default function Stock() {
//   const [stockItems, setStockItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [showViewStock, setShowViewStock] = useState(false);
//   const [savedStocks, setSavedStocks] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [editData, setEditData] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });

//   // Helper function to format date to YYYY-MM-DD
//   const formatDateForDB = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//     fetchSavedStocks();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/categories");
//       if (res.ok) {
//         const data = await res.json();
//         setCategories(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch categories:", err);
//       toast.error("Failed to fetch categories");
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/products");
//       if (res.ok) {
//         const data = await res.json();
//         setProducts(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch products:", err);
//       toast.error("Failed to fetch products");
//     }
//   };

//   const fetchSavedStocks = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/stocks");
//       if (res.ok) {
//         const data = await res.json();
//         setSavedStocks(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch stocks:", err);
//       toast.error("Failed to fetch stocks");
//     }
//   };

//   const handleAddRow = () => {
//     setStockItems([
//       ...stockItems,
//       {
//         id: Date.now(),
//         date: new Date().toISOString().split('T')[0],
//         category: "",
//         productName: "",
//         quantity: "",
//         purchaseRate: "",
//         sellingRate: "",
//         priceLimit: "",
//         showCategoryDropdown: false,
//         filteredCategories: categories,
//         showProductDropdown: false,
//         filteredProducts: [],
//       },
//     ]);
//   };

//   const handleChange = (id, field, value) => {
//     if ((field === "purchaseRate" || field === "sellingRate" || field === "priceLimit" || field === "quantity") && value !== "") {
//       if (!/^\d+$/.test(value)) {
//         toast.error(`${field === "quantity" ? "Quantity" : "Rate"} must be a valid number.`);
//         return;
//       }
//     }

//     setStockItems(
//       stockItems.map((item) => {
//         if (item.id === id) {
//           const updatedItem = { ...item, [field]: value };

//           if (field === "category") {
//             if (value.trim()) {
//               const filtered = categories.filter((cat) =>
//                 cat.name.toLowerCase().includes(value.toLowerCase())
//               );
//               updatedItem.filteredCategories = filtered;
//               updatedItem.showCategoryDropdown = filtered.length > 0;
//             } else {
//               updatedItem.filteredCategories = categories;
//               updatedItem.showCategoryDropdown = categories.length > 0;
//             }
//             updatedItem.productName = "";
//             updatedItem.filteredProducts = [];
//             updatedItem.showProductDropdown = false;
//           }

//           if (field === "productName") {
//             let categoryProducts = [];
//             if (item.category && item.category.trim()) {
//               const selectedCategory = categories.find(
//                 (cat) => cat.name.toLowerCase() === item.category.toLowerCase()
//               );

//               if (selectedCategory) {
//                 categoryProducts = products.filter(
//                   (prod) =>
//                     (prod.categoryId && prod.categoryId === selectedCategory.id) ||
//                     (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
//                     (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
//                 );
//               }
//             } else {
//               categoryProducts = products;
//             }

//             if (value.trim()) {
//               const filtered = categoryProducts.filter(
//                 (prod) =>
//                   (prod.productName && prod.productName.toLowerCase().includes(value.toLowerCase())) ||
//                   (prod.name && prod.name.toLowerCase().includes(value.toLowerCase()))
//               );
//               updatedItem.filteredProducts = filtered;
//               updatedItem.showProductDropdown = filtered.length > 0;
//             } else {
//               updatedItem.filteredProducts = categoryProducts;
//               updatedItem.showProductDropdown = categoryProducts.length > 0;
//             }
//           }

//           return updatedItem;
//         }
//         return item;
//       })
//     );
//   };

//   const handleCategorySelect = (itemId, selectedCategory) => {
//     setStockItems(
//       stockItems.map((item) => {
//         if (item.id === itemId) {
//           const categoryProducts = products.filter(
//             (prod) =>
//               (prod.categoryId && prod.categoryId === selectedCategory.id) ||
//               (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
//               (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
//           );

//           return {
//             ...item,
//             category: selectedCategory.name,
//             showCategoryDropdown: false,
//             filteredCategories: [],
//             productName: "",
//             filteredProducts: categoryProducts,
//             showProductDropdown: false,
//           };
//         }
//         return item;
//       })
//     );
//   };

//   const handleProductSelect = async (itemId, selectedProduct) => {
//     const productName = selectedProduct.productName || selectedProduct.name || "";
    
//     setStockItems(prev =>
//       prev.map((item) => {
//         if (item.id === itemId) {
//           return {
//             ...item,
//             productName: productName,
//             showProductDropdown: false,
//             filteredProducts: [],
//           };
//         }
//         return item;
//       })
//     );

//     const currentItem = stockItems.find(item => item.id === itemId);
//     if (currentItem && currentItem.category && productName) {
//       try {
//         const purchaseRes = await fetch(
//           `http://localhost:5000/api/stocks/get-purchase-rate/${encodeURIComponent(currentItem.category)}/${encodeURIComponent(productName)}`
//         );
//         const purchaseData = await purchaseRes.json();

//         const sellingRes = await fetch(
//           `http://localhost:5000/api/stocks/get-selling-rate/${encodeURIComponent(productName)}`
//         );
//         const sellingData = await sellingRes.json();

//         setStockItems(prev =>
//           prev.map((item) => {
//             if (item.id === itemId) {
//               return {
//                 ...item,
//                 purchaseRate: purchaseData.purchase_rate || "",
//                 sellingRate: sellingData.selling_rate || "",
//                 priceLimit: ""
//               };
//             }
//             return item;
//           })
//         );

//         if (!purchaseData.purchase_rate) {
//           toast.error("No purchase rate found for this product");
//         }
//         if (!sellingData.selling_rate) {
//           toast.error("No selling rate found in products table");
//         }

//       } catch (error) {
//         console.error("Error fetching rates:", error);
//         toast.error("Failed to fetch rates");
//       }
//     }
//   };

//   const handleCategoryFocus = (itemId) => {
//     setStockItems(
//       stockItems.map((item) => {
//         if (item.id === itemId) {
//           return {
//             ...item,
//             showCategoryDropdown: true,
//             filteredCategories: categories,
//           };
//         }
//         return item;
//       })
//     );
//   };

//   const handleProductFocus = (itemId) => {
//     setStockItems(
//       stockItems.map((item) => {
//         if (item.id === itemId) {
//           let productsToShow = [];
          
//           if (item.category && item.category.trim()) {
//             const selectedCategory = categories.find(cat => 
//               cat.name.toLowerCase() === item.category.toLowerCase()
//             );
            
//             if (selectedCategory) {
//               productsToShow = products.filter(prod => 
//                 (prod.categoryId && prod.categoryId === selectedCategory.id) ||
//                 (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
//                 (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
//               );
//             }
//           } else {
//             productsToShow = products;
//           }
          
//           return {
//             ...item,
//             showProductDropdown: productsToShow.length > 0,
//             filteredProducts: productsToShow,
//           };
//         }
//         return item;
//       })
//     );
//   };

//   const handleCategoryBlur = (itemId) => {
//     setTimeout(() => {
//       setStockItems(prev =>
//         prev.map((item) => {
//           if (item.id === itemId) {
//             return { ...item, showCategoryDropdown: false };
//           }
//           return item;
//         })
//       );
//     }, 200);
//   };

//   const handleProductBlur = (itemId) => {
//     setTimeout(() => {
//       setStockItems(prev =>
//         prev.map((item) => {
//           if (item.id === itemId) {
//             return { ...item, showProductDropdown: false };
//           }
//           return item;
//         })
//       );
//     }, 200);
//   };

//   const handleBlur = (id, field, value) => {
//     const normalized = parseInt(value, 10) || 0;
//     setStockItems(
//       stockItems.map((item) =>
//         item.id === id ? { ...item, [field]: normalized } : item
//       )
//     );
//   };

//   const handleDelete = (id) => {
//     setStockItems(stockItems.filter((item) => item.id !== id));
//     toast.success("Row deleted successfully");
//   };

//   const handleSaveAll = async () => {
//     if (stockItems.length === 0) {
//       toast.error("No items to save!");
//       return;
//     }

//     const validItems = stockItems.filter(item =>
//       item.category && item.productName && item.quantity && item.purchaseRate && item.sellingRate
//     );

//     if (validItems.length === 0) {
//       toast.error("No valid items to save! Please fill all required fields.");
//       return;
//     }

//     for (const item of validItems) {
//       const purchaseRate = parseFloat(item.purchaseRate);
//       const sellingRate = parseFloat(item.sellingRate);
//       const priceLimit = item.priceLimit ? parseFloat(item.priceLimit) : 0;

//       if (item.priceLimit) {
//         const min = Math.min(purchaseRate, sellingRate);
//         const max = Math.max(purchaseRate, sellingRate);

//         if (priceLimit < min || priceLimit > max) {
//           toast.error(
//             `Price limit for ${item.productName} must be between ₹${min} and ₹${max}!`
//           );
//           return;
//         }
//       }
//     }

//     try {
//       // Prepare items with proper data types
//       const itemsToSave = validItems.map(item => ({
//         date: item.date,
//         category: item.category,
//         productName: item.productName,
//         quantity: parseInt(item.quantity) || 0,
//         purchaseRate: parseFloat(item.purchaseRate) || 0,
//         sellingRate: parseFloat(item.sellingRate) || 0,
//         priceLimit: item.priceLimit ? parseFloat(item.priceLimit) : null
//       }));

//       console.log('Saving items:', itemsToSave); // Debug log

//       const response = await fetch('http://localhost:5000/api/stocks/save-stock', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ items: itemsToSave })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to save stock');
//       }

//       toast.success(`${validItems.length} stock items saved successfully!`);
//       fetchSavedStocks();
//       setStockItems([]);
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error("Failed to save stock: " + error.message);
//     }
//   };

//   const handleEditStart = (stock) => {
//     const stockId = stock.stock_id;
//     const dateValue = stock.date ? formatDateForDB(stock.date) : '';
    
//     setEditingId(stockId);
//     setEditData({
//       stock_id: stockId,
//       date: dateValue,
//       category: stock.category,
//       product_name: stock.product_name,
//       quantity: stock.quantity || '',
//       purchase_rate: stock.purchase_rate,
//       selling_rate: stock.selling_rate,
//       price_limit: stock.price_limit || ''
//     });
//   };

//   const handleEditChange = (field, value) => {
//     setEditData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleEditSave = async () => {
//     try {
//       const formattedDate = formatDateForDB(editData.date);
      
//       const response = await fetch(`http://localhost:5000/api/stocks/${editData.stock_id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           date: formattedDate,
//           category: editData.category,
//           product_name: editData.product_name,
//           quantity: parseFloat(editData.quantity),
//           purchase_rate: parseFloat(editData.purchase_rate),
//           selling_rate: parseFloat(editData.selling_rate),
//           price_limit: editData.price_limit ? parseFloat(editData.price_limit) : null
//         })
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData.error || 'Failed to update stock');
//       }

//       toast.success("Stock updated successfully!");
//       setEditingId(null);
//       setEditData({});
//       fetchSavedStocks();
//     } catch (error) {
//       console.error('Update error:', error);
//       toast.error("Failed to update stock: " + error.message);
//     }
//   };

//   const handleEditCancel = () => {
//     setEditingId(null);
//     setEditData({});
//   };

//   const handleDeleteStock = async (stock) => {
//     const stockId = stock.stock_id;
//     if (window.confirm("Are you sure you want to delete this stock record?")) {
//       try {
//         const response = await fetch(`http://localhost:5000/api/stocks/${stockId}`, {
//           method: 'DELETE',
//         });

//         if (!response.ok) throw new Error('Failed to delete stock');

//         toast.success("Stock deleted successfully!");
//         fetchSavedStocks();
//       } catch (error) {
//         toast.error("Failed to delete stock: " + error.message);
//       }
//     }
//   };

//   const filteredStocks = savedStocks.filter(stock =>
//     stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     stock.category?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const sortedStocks = [...filteredStocks].sort((a, b) => {
//     const aValue = a[sortConfig.key];
//     const bValue = b[sortConfig.key];
    
//     if (sortConfig.direction === "asc") {
//       return aValue > bValue ? 1 : -1;
//     }
//     return aValue < bValue ? 1 : -1;
//   });

//   if (showViewStock) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
//         <Toaster position="top-right" />
//         <div className="max-w-7xl mx-auto">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Records</h1>
//               <p className="text-gray-600">Manage and track all stock entries</p>
//             </div>
//             <button 
//               onClick={() => setShowViewStock(false)}
//               className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg font-semibold"
//             >
//               <X size={20} />
//               Close
//             </button>
//           </div>

//           <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search by product name or category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full px-4 py-3 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500 placeholder-gray-400 transition-all"
//               />
//               <span className="absolute right-3 top-3 text-gray-400">🔍</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
//             <div className="overflow-x-auto">
//               <table className="w-full table-fixed">
//                 <thead className="bg-blue-600 text-white sticky top-0">
//                   <tr>
//                     <th className="px-6 py-4 text-left font-bold w-20">S.No</th>
//                     <th 
//                       className="px-6 py-4 text-left font-bold cursor-pointer hover:bg-blue-700 transition-colors w-32" 
//                       onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
//                     >
//                       Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                     </th>
//                     <th className="px-6 py-4 text-left font-bold w-32">Category</th>
//                     <th className="px-6 py-4 text-left font-bold w-40">Product Name</th>
//                     <th className="px-6 py-4 text-left font-bold w-24">Quantity</th>
//                     <th className="px-6 py-4 text-left font-bold w-32">Purchase Rate</th>
//                     <th className="px-6 py-4 text-left font-bold w-32">Selling Rate</th>
//                     <th className="px-6 py-4 text-left font-bold w-32">Price Limit</th>
//                     <th className="px-6 py-4 text-left font-bold w-48">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sortedStocks.length === 0 ? (
//                     <tr>
//                       <td colSpan="9" className="px-6 py-16 text-center">
//                         <div className="text-xl font-semibold text-gray-500">No stock records available</div>
//                       </td>
//                     </tr>
//                   ) : (
//                     sortedStocks.map((stock, index) => {
//                       const isEditing = editingId === stock.stock_id;
//                       return (
//                       <tr key={stock.stock_id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
//                         <td className="px-6 py-4 text-gray-800 font-medium">{index + 1}</td>
//                         {isEditing ? (
//                           <>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="date"
//                                 value={editData.date}
//                                 onChange={(e) => handleEditChange('date', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="text"
//                                 value={editData.category}
//                                 onChange={(e) => handleEditChange('category', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="text"
//                                 value={editData.product_name}
//                                 onChange={(e) => handleEditChange('product_name', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="number"
//                                 value={editData.quantity}
//                                 onChange={(e) => handleEditChange('quantity', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="number"
//                                 value={editData.purchase_rate}
//                                 onChange={(e) => handleEditChange('purchase_rate', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="number"
//                                 value={editData.selling_rate}
//                                 onChange={(e) => handleEditChange('selling_rate', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
//                               />
//                             </td>
//                             <td className="px-6 py-4">
//                               <input
//                                 type="number"
//                                 value={editData.price_limit || ''}
//                                 onChange={(e) => handleEditChange('price_limit', e.target.value)}
//                                 className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
//                               />
//                             </td>
//                             <td className="px-6 py-4 flex gap-2">
//                               <button
//                                 onClick={handleEditSave}
//                                 className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
//                               >
//                                 <Check size={16} />
//                                 Save
//                               </button>
//                               <button
//                                 onClick={handleEditCancel}
//                                 className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
//                               >
//                                 <X size={16} />
//                                 Cancel
//                               </button>
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td className="px-6 py-4 text-gray-700">
//                               {new Date(stock.date).toLocaleDateString('en-IN')}
//                             </td>
//                             <td className="px-6 py-4 text-gray-700 font-medium">{stock.category}</td>
//                             <td className="px-6 py-4 font-semibold text-gray-900">{stock.product_name}</td>
//                             <td className="px-6 py-4 text-purple-600 font-bold">{stock.quantity}</td>
//                             <td className="px-6 py-4 text-blue-600 font-semibold">₹{stock.purchase_rate}</td>
//                             <td className="px-6 py-4 text-green-600 font-bold">₹{stock.selling_rate}</td>
//                             <td className="px-6 py-4 text-amber-600 font-semibold">
//                               {stock.price_limit ? `₹${stock.price_limit}` : '-'}
//                             </td>
//                             <td className="px-6 py-4 flex gap-2">
//                               <button
//                                 onClick={() => handleEditStart(stock)}
//                                 className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
//                               >
//                                 <Edit2 size={16} />
//                                 Edit
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteStock(stock)}
//                                 className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
//                               >
//                                 <Trash2 size={16} />
//                                 Delete
//                               </button>
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
//             <p className="text-gray-700">Total Records: <span className="font-bold text-lg text-gray-900">{sortedStocks.length}</span></p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 font-[Poppins]">
//       <Toaster position="top-right" />
//       <style>{`
//         .dropdown-cell {
//           position: static !important;
//           overflow: visible !important;
//         }
//         .category-dropdown, .product-dropdown {
//           position: absolute !important;
//           z-index: 9999 !important;
//           background: white;
//           border: 1px solid #d1d5db;
//           border-radius: 6px;
//           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
//           max-height: 200px;
//           overflow-y: auto;
//           min-width: 180px;
//         }
//         .product-dropdown {
//           min-width: 200px;
//         }
//       `}</style>

//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-teal-600">Stock Management</h2>
//         <div className="flex gap-3">
//           <button
//             onClick={handleSaveAll}
//             className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-semibold"
//           >
//             Save All
//           </button>
//           <button
//             onClick={() => setShowViewStock(true)}
//             className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 font-semibold"
//           >
//             View Stock
//           </button>
//         </div>
//       </div>

//       <button
//         onClick={handleAddRow}
//         className="mb-4 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
//       >
//         + Add Row
//       </button>

//       <div className="overflow-x-auto" style={{ overflow: 'visible', position: 'relative' }}>
//         <table className="w-full border-collapse border text-sm">
//           <thead className="bg-teal-500 text-white">
//             <tr>
//               <th className="border p-2">S.No</th>
//               <th className="border p-2">Date</th>
//               <th className="border p-2">Category</th>
//               <th className="border p-2">Product Name</th>
//               <th className="border p-2">Quantity</th>
//               <th className="border p-2">Purchase Rate</th>
//               <th className="border p-2">Selling Rate</th>
//               <th className="border p-2">Price Limit</th>
//               <th className="border p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {stockItems.length === 0 ? (
//               <tr>
//                 <td colSpan="9" className="border p-4 text-center text-gray-500">
//                   Click "+ Add Row" to start adding stock items
//                 </td>
//               </tr>
//             ) : (
//               stockItems.map((item, index) => (
//                 <tr key={item.id} className="text-center">
//                   <td className="border p-2">{index + 1}</td>
//                   <td className="border p-2">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                  
//                   <td className="border p-2 dropdown-cell" style={{ position: 'relative', overflow: 'visible' }}>
//                     <div style={{ position: 'relative', zIndex: stockItems.length - index + 100 }}>
//                       <input
//                         value={item.category}
//                         onChange={(e) => handleChange(item.id, "category", e.target.value)}
//                         onFocus={() => handleCategoryFocus(item.id)}
//                         onBlur={() => handleCategoryBlur(item.id)}
//                         className="border px-2 py-1 rounded w-full"
//                         placeholder="Category"
//                         autoComplete="off"
//                       />

//                       {item.showCategoryDropdown &&
//                         item.filteredCategories &&
//                         item.filteredCategories.length > 0 && (
//                           <div
//                             className="category-dropdown"
//                             style={{
//                               position: 'absolute',
//                               top: '100%',
//                               left: '0',
//                               right: '0',
//                               zIndex: 9999,
//                               marginTop: '2px'
//                             }}
//                           >
//                             {item.filteredCategories.map((category, idx) => (
//                               <div
//                                 key={category.id || idx}
//                                 className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
//                                 style={{
//                                   borderBottom: idx < item.filteredCategories.length - 1 ? '1px solid #f3f4f6' : 'none'
//                                 }}
//                                 onMouseDown={(e) => {
//                                   e.preventDefault();
//                                   handleCategorySelect(item.id, category);
//                                 }}
//                               >
//                                 {category.name}
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                     </div>
//                   </td>

//                   <td className="border p-2 dropdown-cell" style={{ position: 'relative', overflow: 'visible' }}>
//                     <div style={{ position: 'relative', zIndex: stockItems.length - index + 90 }}>
//                       <input
//                         value={item.productName}
//                         onChange={(e) => handleChange(item.id, "productName", e.target.value)}
//                         onFocus={() => handleProductFocus(item.id)}
//                         onBlur={() => handleProductBlur(item.id)}
//                         className="border px-2 py-1 rounded w-full"
//                         placeholder="Product name"
//                         autoComplete="off"
//                       />

//                       {item.showProductDropdown &&
//                         item.filteredProducts &&
//                         item.filteredProducts.length > 0 && (
//                           <div
//                             className="product-dropdown"
//                             style={{
//                               position: 'absolute',
//                               top: '100%',
//                               left: '0',
//                               right: '0',
//                               zIndex: 9998,
//                               marginTop: '2px'
//                             }}
//                           >
//                             {item.filteredProducts.map((product, idx) => (
//                               <div
//                                 key={product.id || idx}
//                                 className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
//                                 style={{
//                                   borderBottom: idx < item.filteredProducts.length - 1 ? '1px solid #f3f4f6' : 'none'
//                                 }}
//                                 onMouseDown={(e) => {
//                                   e.preventDefault();
//                                   handleProductSelect(item.id, product);
//                                 }}
//                               >
//                                 <div className="font-semibold">
//                                   {product.productName || product.name}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                     </div>
//                   </td>

//                   <td className="border p-2">
//                     <input
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) => handleChange(item.id, "quantity", e.target.value)}
//                       onBlur={(e) => handleBlur(item.id, "quantity", e.target.value)}
//                       className="border px-2 py-1 rounded w-20"
//                       placeholder="Qty"
//                     />
//                   </td>
//                   <td className="border p-2">
//                     <input
//                       type="number"
//                       value={item.purchaseRate}
//                       onChange={(e) => handleChange(item.id, "purchaseRate", e.target.value)}
//                       onBlur={(e) => handleBlur(item.id, "purchaseRate", e.target.value)}
//                       className="border px-2 py-1 rounded w-20"
//                       placeholder="₹"
//                     />
//                   </td>
//                   <td className="border p-2">
//                     <input
//                       type="number"
//                       value={item.sellingRate}
//                       onChange={(e) => handleChange(item.id, "sellingRate", e.target.value)}
//                       onBlur={(e) => handleBlur(item.id, "sellingRate", e.target.value)}
//                       className="border px-2 py-1 rounded w-20"
//                       placeholder="₹"
//                     />
//                   </td>
//                   <td className="border p-2">
//                     <input
//                       type="number"
//                       value={item.priceLimit}
//                       onChange={(e) => handleChange(item.id, "priceLimit", e.target.value)}
//                       onBlur={(e) => handleBlur(item.id, "priceLimit", e.target.value)}
//                       className="border px-2 py-1 rounded w-20"
//                       placeholder="₹"
//                     />
//                   </td>
//                   <td className="border p-2">
//                     <button
//                       onClick={() => handleDelete(item.id)}
//                       className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Trash2, Edit2, X, Check, Bell, AlertTriangle } from "lucide-react";

export default function Stock() {
  const [stockItems, setStockItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showViewStock, setShowViewStock] = useState(false);
  const [savedStocks, setSavedStocks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // ✅ Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast.success("✅ Browser notifications enabled!");
        }
      });
    }
  }, []);

  // ✅ Function to show browser notification
  const showBrowserNotification = (stockData) => {
    if (!("Notification" in window)) {
      console.log("Browser doesn't support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      const notification = new Notification("🚨 Low Stock Alert!", {
        body: `${stockData.product_name} - Only ${stockData.quantity} units left!`,
        icon: "https://cdn-icons-png.flaticon.com/512/3176/3176369.png",
        badge: "https://cdn-icons-png.flaticon.com/512/3176/3176369.png",
        tag: `stock-${stockData.product_name}`,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: stockData
      });

      notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateForDB = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSavedStocks();
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
      toast.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to fetch products");
    }
  };

  const fetchSavedStocks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stocks");
      if (res.ok) {
        const data = await res.json();
        setSavedStocks(data);
        
        // ✅ Check for low stock items and show notifications
        const lowStockItems = data.filter(item => item.quantity <= 20);
        if (lowStockItems.length > 0) {
          toast(`⚠️ ${lowStockItems.length} items are low in stock!`, {
            duration: 5000,
            icon: '⚠️'
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
      toast.error("Failed to fetch stocks");
    }
  };

  const handleAddRow = () => {
    setStockItems([
      ...stockItems,
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        category: "",
        productName: "",
        quantity: "",
        purchaseRate: "",
        sellingRate: "",
        priceLimit: "",
        showCategoryDropdown: false,
        filteredCategories: categories,
        showProductDropdown: false,
        filteredProducts: [],
      },
    ]);
  };

  const handleChange = (id, field, value) => {
    if ((field === "purchaseRate" || field === "sellingRate" || field === "priceLimit" || field === "quantity") && value !== "") {
      if (!/^\d+$/.test(value)) {
        toast.error(`${field === "quantity" ? "Quantity" : "Rate"} must be a valid number.`);
        return;
      }
    }

    setStockItems(
      stockItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "category") {
            if (value.trim()) {
              const filtered = categories.filter((cat) =>
                cat.name.toLowerCase().includes(value.toLowerCase())
              );
              updatedItem.filteredCategories = filtered;
              updatedItem.showCategoryDropdown = filtered.length > 0;
            } else {
              updatedItem.filteredCategories = categories;
              updatedItem.showCategoryDropdown = categories.length > 0;
            }
            updatedItem.productName = "";
            updatedItem.filteredProducts = [];
            updatedItem.showProductDropdown = false;
          }

          if (field === "productName") {
            let categoryProducts = [];
            if (item.category && item.category.trim()) {
              const selectedCategory = categories.find(
                (cat) => cat.name.toLowerCase() === item.category.toLowerCase()
              );

              if (selectedCategory) {
                categoryProducts = products.filter(
                  (prod) =>
                    (prod.categoryId && prod.categoryId === selectedCategory.id) ||
                    (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                    (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
                );
              }
            } else {
              categoryProducts = products;
            }

            if (value.trim()) {
              const filtered = categoryProducts.filter(
                (prod) =>
                  (prod.productName && prod.productName.toLowerCase().includes(value.toLowerCase())) ||
                  (prod.name && prod.name.toLowerCase().includes(value.toLowerCase()))
              );
              updatedItem.filteredProducts = filtered;
              updatedItem.showProductDropdown = filtered.length > 0;
            } else {
              updatedItem.filteredProducts = categoryProducts;
              updatedItem.showProductDropdown = categoryProducts.length > 0;
            }
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleCategorySelect = (itemId, selectedCategory) => {
    setStockItems(
      stockItems.map((item) => {
        if (item.id === itemId) {
          const categoryProducts = products.filter(
            (prod) =>
              (prod.categoryId && prod.categoryId === selectedCategory.id) ||
              (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
              (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
          );

          return {
            ...item,
            category: selectedCategory.name,
            showCategoryDropdown: false,
            filteredCategories: [],
            productName: "",
            filteredProducts: categoryProducts,
            showProductDropdown: false,
          };
        }
        return item;
      })
    );
  };

  const handleProductSelect = async (itemId, selectedProduct) => {
    const productName = selectedProduct.productName || selectedProduct.name || "";
    
    setStockItems(prev =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            productName: productName,
            showProductDropdown: false,
            filteredProducts: [],
          };
        }
        return item;
      })
    );

    const currentItem = stockItems.find(item => item.id === itemId);
    if (currentItem && currentItem.category && productName) {
      try {
        const purchaseRes = await fetch(
          `http://localhost:5000/api/stocks/get-purchase-rate/${encodeURIComponent(currentItem.category)}/${encodeURIComponent(productName)}`
        );
        const purchaseData = await purchaseRes.json();

        const sellingRes = await fetch(
          `http://localhost:5000/api/stocks/get-selling-rate/${encodeURIComponent(productName)}`
        );
        const sellingData = await sellingRes.json();

        setStockItems(prev =>
          prev.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                purchaseRate: purchaseData.purchase_rate || "",
                sellingRate: sellingData.selling_rate || "",
                priceLimit: ""
              };
            }
            return item;
          })
        );

        if (!purchaseData.purchase_rate) {
          toast.error("No purchase rate found for this product");
        }
        if (!sellingData.selling_rate) {
          toast.error("No selling rate found in products table");
        }

      } catch (error) {
        console.error("Error fetching rates:", error);
        toast.error("Failed to fetch rates");
      }
    }
  };

  const handleCategoryFocus = (itemId) => {
    setStockItems(
      stockItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            showCategoryDropdown: true,
            filteredCategories: categories,
          };
        }
        return item;
      })
    );
  };

  const handleProductFocus = (itemId) => {
    setStockItems(
      stockItems.map((item) => {
        if (item.id === itemId) {
          let productsToShow = [];
          
          if (item.category && item.category.trim()) {
            const selectedCategory = categories.find(cat => 
              cat.name.toLowerCase() === item.category.toLowerCase()
            );
            
            if (selectedCategory) {
              productsToShow = products.filter(prod => 
                (prod.categoryId && prod.categoryId === selectedCategory.id) ||
                (prod.categoryName && prod.categoryName.toLowerCase() === selectedCategory.name.toLowerCase()) ||
                (prod.category && prod.category.toLowerCase() === selectedCategory.name.toLowerCase())
              );
            }
          } else {
            productsToShow = products;
          }
          
          return {
            ...item,
            showProductDropdown: productsToShow.length > 0,
            filteredProducts: productsToShow,
          };
        }
        return item;
      })
    );
  };

  const handleCategoryBlur = (itemId) => {
    setTimeout(() => {
      setStockItems(prev =>
        prev.map((item) => {
          if (item.id === itemId) {
            return { ...item, showCategoryDropdown: false };
          }
          return item;
        })
      );
    }, 200);
  };

  const handleProductBlur = (itemId) => {
    setTimeout(() => {
      setStockItems(prev =>
        prev.map((item) => {
          if (item.id === itemId) {
            return { ...item, showProductDropdown: false };
          }
          return item;
        })
      );
    }, 200);
  };

  const handleBlur = (id, field, value) => {
    const normalized = parseInt(value, 10) || 0;
    setStockItems(
      stockItems.map((item) =>
        item.id === id ? { ...item, [field]: normalized } : item
      )
    );
  };

  const handleDelete = (id) => {
    setStockItems(stockItems.filter((item) => item.id !== id));
    toast.success("Row deleted successfully");
  };

  const handleSaveAll = async () => {
    if (stockItems.length === 0) {
      toast.error("No items to save!");
      return;
    }

    const validItems = stockItems.filter(item =>
      item.category && item.productName && item.quantity && item.purchaseRate && item.sellingRate
    );

    if (validItems.length === 0) {
      toast.error("No valid items to save! Please fill all required fields.");
      return;
    }

    for (const item of validItems) {
      const purchaseRate = parseFloat(item.purchaseRate);
      const sellingRate = parseFloat(item.sellingRate);
      const priceLimit = item.priceLimit ? parseFloat(item.priceLimit) : 0;

      if (item.priceLimit) {
        const min = Math.min(purchaseRate, sellingRate);
        const max = Math.max(purchaseRate, sellingRate);

        if (priceLimit < min || priceLimit > max) {
          toast.error(
            `Price limit for ${item.productName} must be between ₹${min} and ₹${max}!`
          );
          return;
        }
      }
    }

    try {
      const itemsToSave = validItems.map(item => ({
        date: item.date,
        category: item.category,
        productName: item.productName,
        quantity: parseInt(item.quantity) || 0,
        purchaseRate: parseFloat(item.purchaseRate) || 0,
        sellingRate: parseFloat(item.sellingRate) || 0,
        priceLimit: item.priceLimit ? parseFloat(item.priceLimit) : null
      }));

      console.log('Saving items:', itemsToSave);

      const response = await fetch('http://localhost:5000/api/stocks/save-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSave })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save stock');
      }

      const result = await response.json();

      // ✅ Show browser notifications for low stock items
      if (result.lowStockAlerts && result.lowStockAlerts.length > 0) {
        result.lowStockAlerts.forEach(alert => {
          const stockItem = validItems.find(item => item.productName === alert.product);
          if (stockItem && alert.emailSent) {
            showBrowserNotification({
              product_name: stockItem.productName,
              quantity: stockItem.quantity,
              category: stockItem.category
            });
            
            toast.error(
              `⚠️ ${stockItem.productName} is low in stock (${stockItem.quantity} units)!\n📧 Email alert sent.`,
              { duration: 6000 }
            );
          }
        });
      }

      toast.success(`${validItems.length} stock items saved successfully!`);
      fetchSavedStocks();
      setStockItems([]);
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save stock: " + error.message);
    }
  };

  const handleEditStart = (stock) => {
    const stockId = stock.stock_id;
    const dateValue = stock.date ? formatDateForDB(stock.date) : '';
    
    setEditingId(stockId);
    setEditData({
      stock_id: stockId,
      date: dateValue,
      category: stock.category,
      product_name: stock.product_name,
      quantity: stock.quantity || '',
      purchase_rate: stock.purchase_rate,
      selling_rate: stock.selling_rate,
      price_limit: stock.price_limit || ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    try {
      const formattedDate = formatDateForDB(editData.date);
      
      const response = await fetch(`http://localhost:5000/api/stocks/${editData.stock_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          category: editData.category,
          product_name: editData.product_name,
          quantity: parseFloat(editData.quantity),
          purchase_rate: parseFloat(editData.purchase_rate),
          selling_rate: parseFloat(editData.selling_rate),
          price_limit: editData.price_limit ? parseFloat(editData.price_limit) : null
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update stock');
      }

      // ✅ Show notification if stock is low after update
      if (responseData.lowStockAlert) {
        showBrowserNotification({
          product_name: editData.product_name,
          quantity: editData.quantity,
          category: editData.category
        });
        toast.error(`⚠️ ${editData.product_name} is now low in stock!`, { duration: 5000 });
      }

      toast.success("Stock updated successfully!");
      setEditingId(null);
      setEditData({});
      fetchSavedStocks();
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Failed to update stock: " + error.message);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDeleteStock = async (stock) => {
    const stockId = stock.stock_id;
    if (window.confirm("Are you sure you want to delete this stock record?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/stocks/${stockId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete stock');

        toast.success("Stock deleted successfully!");
        fetchSavedStocks();
      } catch (error) {
        toast.error("Failed to delete stock: " + error.message);
      }
    }
  };

  const filteredStocks = savedStocks.filter(stock =>
    stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  // ✅ Enable notifications button
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Your browser doesn't support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      toast.success("✅ Notifications enabled successfully!");
      // Test notification
      showBrowserNotification({
        product_name: "Test Product",
        quantity: 15,
        category: "Test Category"
      });
    } else if (permission === "denied") {
      toast.error("❌ Notification permission denied");
    }
  };

  if (showViewStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Records</h1>
              <p className="text-gray-600">Manage and track all stock entries</p>
            </div>
            <div className="flex gap-3">
              {notificationPermission !== "granted" && (
                <button 
                  onClick={requestNotificationPermission}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg font-semibold"
                >
                  <Bell size={20} />
                  Enable Notifications
                </button>
              )}
              <button 
                onClick={() => setShowViewStock(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg font-semibold"
              >
                <X size={20} />
                Close
              </button>
            </div>
          </div>

          {/* ✅ Low Stock Alert Banner */}
          {sortedStocks.filter(s => s.quantity <= 20).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={32} />
                <div>
                  <h3 className="text-red-800 font-bold text-lg">
                    ⚠️ Low Stock Alert!
                  </h3>
                  <p className="text-red-700 mt-1">
                    {sortedStocks.filter(s => s.quantity <= 20).length} products have low stock (≤20 units). 
                    Please reorder soon!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-500 placeholder-gray-400 transition-all"
              />
              <span className="absolute right-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold w-20">S.No</th>
                    <th 
                      className="px-6 py-4 text-left font-bold cursor-pointer hover:bg-blue-700 transition-colors w-32" 
                      onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    >
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-4 text-left font-bold w-32">Category</th>
                    <th className="px-6 py-4 text-left font-bold w-40">Product Name</th>
                    <th className="px-6 py-4 text-left font-bold w-24">Quantity</th>
                    <th className="px-6 py-4 text-left font-bold w-32">Purchase Rate</th>
                    <th className="px-6 py-4 text-left font-bold w-32">Selling Rate</th>
                    <th className="px-6 py-4 text-left font-bold w-32">Price Limit</th>
                    <th className="px-6 py-4 text-left font-bold w-48">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-16 text-center">
                        <div className="text-xl font-semibold text-gray-500">No stock records available</div>
                      </td>
                    </tr>
                  ) : (
                    sortedStocks.map((stock, index) => {
                      const isEditing = editingId === stock.stock_id;
                      const isLowStock = stock.quantity <= 20;
                      return (
                      <tr 
                        key={stock.stock_id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ${
                          isLowStock ? 'bg-red-50 hover:bg-red-100' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">{index + 1}</td>
                        {isEditing ? (
                          <>
                            <td className="px-6 py-4">
                              <input
                                type="date"
                                value={editData.date}
                                onChange={(e) => handleEditChange('date', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editData.category}
                                onChange={(e) => handleEditChange('category', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={editData.product_name}
                                onChange={(e) => handleEditChange('product_name', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={editData.quantity}
                                onChange={(e) => handleEditChange('quantity', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={editData.purchase_rate}
                                onChange={(e) => handleEditChange('purchase_rate', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={editData.selling_rate}
                                onChange={(e) => handleEditChange('selling_rate', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={editData.price_limit || ''}
                                onChange={(e) => handleEditChange('price_limit', e.target.value)}
                                className="bg-white text-gray-800 px-3 py-2 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                              />
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={handleEditSave}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
                              >
                                <Check size={16} />
                                Save
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
                              >
                                <X size={16} />
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-gray-700">
                              {new Date(stock.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">{stock.category}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                              {stock.product_name}
                              {isLowStock && <AlertTriangle className="text-red-600" size={18} />}
                            </td>
                            <td className={`px-6 py-4 font-bold ${isLowStock ? 'text-red-600' : 'text-purple-600'}`}>
                              {stock.quantity}
                              {isLowStock && ' ⚠️'}
                            </td>
                            <td className="px-6 py-4 text-blue-600 font-semibold">₹{stock.purchase_rate}</td>
                            <td className="px-6 py-4 text-green-600 font-bold">₹{stock.selling_rate}</td>
                            <td className="px-6 py-4 text-amber-600 font-semibold">
                              {stock.price_limit ? `₹${stock.price_limit}` : '-'}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={() => handleEditStart(stock)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStock(stock)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-200 flex items-center gap-1 font-semibold text-sm"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-700">
                Total Records: <span className="font-bold text-lg text-gray-900">{sortedStocks.length}</span>
              </p>
              <p className="text-red-700 font-semibold">
                Low Stock Items: <span className="font-bold text-lg text-red-600">
                  {sortedStocks.filter(s => s.quantity <= 20).length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-[Poppins]">
      <Toaster position="top-right" />
      <style>{`
        .dropdown-cell {
          position: static !important;
          overflow: visible !important;
        }
        .category-dropdown, .product-dropdown {
          position: absolute !important;
          z-index: 9999 !important;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          max-height: 200px;
          overflow-y: auto;
          min-width: 180px;
        }
        .product-dropdown {
          min-width: 200px;
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-600">Stock Management</h2>
        <div className="flex gap-3">
          {notificationPermission !== "granted" && (
            <button
              onClick={requestNotificationPermission}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 font-semibold flex items-center gap-2"
            >
              <Bell size={20} />
              Enable Alerts
            </button>
          )}
          <button
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-semibold"
          >
            Save All
          </button>
          <button
            onClick={() => setShowViewStock(true)}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 font-semibold"
          >
            View Stock
          </button>
        </div>
      </div>

      <button
        onClick={handleAddRow}
        className="mb-4 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
      >
        + Add Row
      </button>

      <div className="overflow-x-auto" style={{ overflow: 'visible', position: 'relative' }}>
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Purchase Rate</th>
              <th className="border p-2">Selling Rate</th>
              <th className="border p-2">Price Limit</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="border p-4 text-center text-gray-500">
                  Click "+ Add Row" to start adding stock items
                </td>
              </tr>
            ) : (
              stockItems.map((item, index) => (
                <tr key={item.id} className="text-center">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{new Date(item.date).toLocaleDateString('en-IN')}</td>
                  
                  <td className="border p-2 dropdown-cell" style={{ position: 'relative', overflow: 'visible' }}>
                    <div style={{ position: 'relative', zIndex: stockItems.length - index + 100 }}>
                      <input
                        value={item.category}
                        onChange={(e) => handleChange(item.id, "category", e.target.value)}
                        onFocus={() => handleCategoryFocus(item.id)}
                        onBlur={() => handleCategoryBlur(item.id)}
                        className="border px-2 py-1 rounded w-full"
                        placeholder="Category"
                        autoComplete="off"
                      />

                      {item.showCategoryDropdown &&
                        item.filteredCategories &&
                        item.filteredCategories.length > 0 && (
                          <div
                            className="category-dropdown"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              right: '0',
                              zIndex: 9999,
                              marginTop: '2px'
                            }}
                          >
                            {item.filteredCategories.map((category, idx) => (
                              <div
                                key={category.id || idx}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                style={{
                                  borderBottom: idx < item.filteredCategories.length - 1 ? '1px solid #f3f4f6' : 'none'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleCategorySelect(item.id, category);
                                }}
                              >
                                {category.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </td>

                  <td className="border p-2 dropdown-cell" style={{ position: 'relative', overflow: 'visible' }}>
                    <div style={{ position: 'relative', zIndex: stockItems.length - index + 90 }}>
                      <input
                        value={item.productName}
                        onChange={(e) => handleChange(item.id, "productName", e.target.value)}
                        onFocus={() => handleProductFocus(item.id)}
                        onBlur={() => handleProductBlur(item.id)}
                        className="border px-2 py-1 rounded w-full"
                        placeholder="Product name"
                        autoComplete="off"
                      />

                      {item.showProductDropdown &&
                        item.filteredProducts &&
                        item.filteredProducts.length > 0 && (
                          <div
                            className="product-dropdown"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              right: '0',
                              zIndex: 9998,
                              marginTop: '2px'
                            }}
                          >
                            {item.filteredProducts.map((product, idx) => (
                              <div
                                key={product.id || idx}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                style={{
                                  borderBottom: idx < item.filteredProducts.length - 1 ? '1px solid #f3f4f6' : 'none'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleProductSelect(item.id, product);
                                }}
                              >
                                <div className="font-semibold">
                                  {product.productName || product.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleChange(item.id, "quantity", e.target.value)}
                      onBlur={(e) => handleBlur(item.id, "quantity", e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                      placeholder="Qty"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.purchaseRate}
                      onChange={(e) => handleChange(item.id, "purchaseRate", e.target.value)}
                      onBlur={(e) => handleBlur(item.id, "purchaseRate", e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                      placeholder="₹"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.sellingRate}
                      onChange={(e) => handleChange(item.id, "sellingRate", e.target.value)}
                      onBlur={(e) => handleBlur(item.id, "sellingRate", e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                      placeholder="₹"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={item.priceLimit}
                      onChange={(e) => handleChange(item.id, "priceLimit", e.target.value)}
                      onBlur={(e) => handleBlur(item.id, "priceLimit", e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                      placeholder="₹"
                    />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
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