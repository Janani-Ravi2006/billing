// import React, { useState, useEffect } from "react";
// import toast, { Toaster } from "react-hot-toast";

// export default function AccountPage() {
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/bills/customers");
//       if (res.ok) {
//         const data = await res.json();
//         setCustomers(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch customers:", err);
//       toast.error("Failed to fetch customers");
//     }
//   };

//   // ✅ Fixed function — now shows all purchased products
//   const fetchCustomerPurchases = async (phone) => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `http://localhost:5000/api/bills/bills/customer/${phone}`
//       );
//       if (res.ok) {
//         const data = await res.json();

//         const filteredBills = (data || [])
//           .filter((bill) => bill.items && bill.items.length > 0)
//           .map((bill) => ({
//             ...bill,
//             totalAmount: bill.items.reduce(
//               (sum, item) =>
//                 sum + parseFloat(item.total_price || item.totalPrice || 0),
//               0
//             ),
//           }));

//         setPurchases(filteredBills);
//       } else {
//         console.error("Failed to fetch purchases:", res.status);
//         toast.error("Failed to fetch purchase history");
//       }
//     } catch (err) {
//       console.error("Failed to fetch purchases:", err);
//       toast.error("Failed to fetch purchase history");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewPurchases = async (customer) => {
//     setSelectedCustomer(customer);
//     setShowModal(true);
//     fetchCustomerPurchases(customer.customer_phone || customer.phone);
//   };

//   const filteredCustomers = customers.filter(
//     (customer) =>
//       (customer.customer_name || customer.customerName)
//         ?.toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       (customer.customer_phone || customer.phone)?.includes(searchTerm)
//   );

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen font-[Poppins]">
//       <Toaster position="top-right" />

//       <div className="max-w-7xl mx-auto">
//         <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-8 mb-6 text-white">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-4xl font-bold mb-2">Customer Accounts</h1>
//               <p className="text-teal-100">
//                 Manage and view customer purchase history
//               </p>
//             </div>
//             <div className="text-right">
//               <div className="text-5xl mb-2">👥</div>
//             </div>
//           </div>

//           <div className="flex flex-col md:flex-row gap-4 items-end">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-teal-100 mb-2">
//                 Search Customers
//               </label>
//               <input
//                 type="text"
//                 placeholder="Search by name or phone number..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full border-2 border-teal-400 bg-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-400"
//               />
//             </div>
//             <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3 backdrop-blur-sm">
//               <div className="text-sm text-teal-100">Total Customers</div>
//               <div className="text-2xl font-bold">
//                 {filteredCustomers.length}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-teal-500 text-white">
//               <tr>
//                 <th className="p-4 text-left">S.No</th>
//                 <th className="p-4 text-left">Customer Name</th>
//                 <th className="p-4 text-left">Phone Number</th>
//                 <th className="p-4 text-right">Due Amount</th>
//                 <th className="p-4 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCustomers.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-500">
//                     No customers found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredCustomers.map((customer, index) => (
//                   <tr
//                     key={customer.customer_id || index}
//                     className="border-b hover:bg-gray-50"
//                   >
//                     <td className="p-4">{index + 1}</td>
//                     <td className="p-4 font-semibold">
//                       {customer.customer_name || customer.customerName}
//                     </td>
//                     <td className="p-4">
//                       {customer.customer_phone || customer.phone}
//                     </td>
//                     <td className="p-4 text-right">
//                       <span
//                         className={`font-semibold ${
//                           customer.dueAmount > 0
//                             ? "text-red-600"
//                             : "text-green-600"
//                         }`}
//                       >
//                         ₹{parseFloat(customer.dueAmount || 0).toFixed(2)}
//                       </span>
//                     </td>
//                     <td className="p-4 text-center">
//                       <button
//                         onClick={() => handleViewPurchases(customer)}
//                         className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
//                       >
//                         View Purchases
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Purchase History Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//             <div className="bg-teal-500 text-white p-6 flex justify-between items-center">
//               <div>
//                 <h2 className="text-2xl font-bold">Purchase History</h2>
//                 <p className="text-teal-100 mt-1">
//                   {selectedCustomer?.customer_name ||
//                     selectedCustomer?.customerName}{" "}
//                   -{" "}
//                   {selectedCustomer?.customer_phone ||
//                     selectedCustomer?.phone}
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setSelectedCustomer(null);
//                   setPurchases([]);
//                 }}
//                 className="text-white hover:bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto flex-1">
//               {loading ? (
//                 <div className="flex items-center justify-center h-64 text-gray-500">
//                   Loading purchase history...
//                 </div>
//               ) : purchases.length === 0 ? (
//                 <div className="flex items-center justify-center h-64 text-gray-500">
//                   No purchase history found
//                 </div>
//               ) : (
//                 <div className="space-y-6">
//                   {purchases.map((bill, billIndex) => (
//                     <div
//                       key={bill.bill_id || billIndex}
//                       className="border border-gray-200 rounded-lg overflow-hidden"
//                     >
//                       <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
//                         <div>
//                           <div className="font-bold text-lg text-teal-600">
//                             Bill #{bill.bill_no || bill.billNo}
//                           </div>
//                           <div className="text-sm text-gray-600">
//                             {formatDate(bill.bill_date || bill.date)}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm text-gray-600">
//                             Bill Total
//                           </div>
//                           <div className="font-bold text-lg text-teal-600">
//                             ₹{bill.totalAmount.toFixed(2)}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="overflow-x-auto">
//                         <table className="w-full">
//                           <thead className="bg-gray-100">
//                             <tr>
//                               <th className="p-3 text-left text-sm">S.No</th>
//                               <th className="p-3 text-left text-sm">
//                                 Product Name
//                               </th>
//                               <th className="p-3 text-center text-sm">
//                                 Quantity
//                               </th>
//                               <th className="p-3 text-right text-sm">
//                                 Unit Price
//                               </th>
//                               <th className="p-3 text-right text-sm">Total</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {(bill.items || []).map((item, index) => (
//                               <tr
//                                 key={item.bill_item_id || index}
//                                 className="border-b hover:bg-gray-50"
//                               >
//                                 <td className="p-3 text-center">{index + 1}</td>
//                                 <td className="p-3 font-semibold">
//                                   {item.product_name || item.productName}
//                                 </td>
//                                 <td className="p-3 text-center">
//                                   {item.quantity}
//                                 </td>
//                                 <td className="p-3 text-right">
//                                   ₹
//                                   {parseFloat(
//                                     item.unit_price || item.unitPrice
//                                   ).toFixed(2)}
//                                 </td>
//                                 <td className="p-3 text-right font-semibold">
//                                   ₹
//                                   {parseFloat(
//                                     item.total_price || item.totalPrice
//                                   ).toFixed(2)}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       <div className="bg-gray-50 p-4 border-t text-sm">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">
//                             Payment Method:{" "}
//                             <span className="font-semibold">
//                               {bill.payment_method || bill.paymentMethod}
//                             </span>
//                           </span>
//                           <span className="text-gray-600">
//                             Paid:{" "}
//                             <span className="font-semibold text-green-600">
//                               ₹
//                               {parseFloat(
//                                 bill.paid_amount || bill.paidAmount || 0
//                               ).toFixed(2)}
//                             </span>
//                           </span>
//                           <span className="text-gray-600">
//                             Due:{" "}
//                             <span className="font-semibold text-red-600">
//                               ₹
//                               {parseFloat(
//                                 bill.balance_due || bill.balanceDue || 0
//                               ).toFixed(2)}
//                             </span>
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
//                     <div className="flex justify-between items-center">
//                       <div className="text-lg font-semibold text-teal-700">
//                         Total Purchases
//                       </div>
//                       <div className="text-2xl font-bold text-teal-600">
//                         ₹
//                         {purchases
//                           .reduce((sum, bill) => sum + bill.totalAmount, 0)
//                           .toFixed(2)}
//                       </div>
//                     </div>
//                     <div className="text-sm text-gray-600 mt-2">
//                       Total Bills: {purchases.length}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AccountPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bills/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to fetch customers");
    }
  };

  // ✅ Fetch customer purchases - Backend already filters customers with HSN products
  const fetchCustomerPurchases = async (phone) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/bills/bills/customer/${phone}`
      );
      
      if (!res.ok) {
        console.error("Failed to fetch purchases. Status:", res.status);
        const errorText = await res.text();
        console.error("Error response:", errorText);
        toast.error("Failed to fetch purchase history");
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("✓ Fetched bills data:", data);

      // Filter bills and items - ONLY show items with HSN code
      const filteredBills = (data || [])
        .map((bill) => {
          // Filter items - keep only products with HSN code
          const validItems = (bill.items || []).filter((item) => {
            const hasHsnCode = item.hsnCode && item.hsnCode.trim() !== "";
            const hasProductId = item.product_id !== null && item.product_id !== undefined;
            
            // Only include if it has BOTH HSN code AND product_id
            return hasHsnCode && hasProductId;
          });

          return {
            ...bill,
            items: validItems,
          };
        })
        .filter((bill) => bill.items && bill.items.length > 0) // Remove bills with no valid items
        .map((bill) => ({
          ...bill,
          // Recalculate total based on filtered items only
          totalAmount: bill.items.reduce(
            (sum, item) =>
              sum + parseFloat(item.total_price || item.totalPrice || 0),
            0
          ),
        }));

      console.log("✓ Filtered bills with HSN products:", filteredBills.length);
      setPurchases(filteredBills);
      
      if (filteredBills.length === 0) {
        toast("No product purchases found (only due payments exist)", {
          duration: 4000,
          icon: "ℹ️",
        });
      }
    } catch (err) {
      console.error("❌ Error fetching purchases:", err);
      toast.error("Failed to fetch purchase history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPurchases = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    fetchCustomerPurchases(customer.customer_phone || customer.phone);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.customer_name || customer.customerName)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (customer.customer_phone || customer.phone)?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-[Poppins]">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Customer Accounts</h1>
              <p className="text-teal-100">
                Manage and view customer purchase history
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl mb-2">👥</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-teal-100 mb-2">
                Search Customers
              </label>
              <input
                type="text"
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 border-teal-400 bg-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-400"
              />
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3 backdrop-blur-sm">
              <div className="text-sm text-teal-100">Total Customers</div>
              <div className="text-2xl font-bold">
                {filteredCustomers.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="p-4 text-left">S.No</th>
                <th className="p-4 text-left">Customer Name</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-right">Due Amount</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.customer_id || index}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4 font-semibold">
                      {customer.customer_name || customer.customerName}
                    </td>
                    <td className="p-4">
                      {customer.customer_phone || customer.phone}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`font-semibold ${
                          customer.dueAmount > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ₹{parseFloat(customer.dueAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewPurchases(customer)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        View Purchases
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase History Modal - Only shows products WITH HSN code */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-teal-500 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Product Purchase History</h2>
                <p className="text-teal-100 mt-1">
                  {selectedCustomer?.customer_name ||
                    selectedCustomer?.customerName}{" "}
                  -{" "}
                  {selectedCustomer?.customer_phone ||
                    selectedCustomer?.phone}
                </p>
                <p className="text-teal-100 text-sm mt-1">
                  (Only showing purchased products with HSN code)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCustomer(null);
                  setPurchases([]);
                }}
                className="text-white hover:bg-teal-600 rounded-full w-8 h-8 flex items-center justify-center text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Loading purchase history...
                </div>
              ) : purchases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <div className="text-6xl mb-4">📦</div>
                  <div className="text-lg font-semibold">No Product Purchases Found</div>
                  <div className="text-sm mt-2">This customer has no product purchases with HSN code</div>
                  <div className="text-sm text-gray-400 mt-1">(Due payments are not shown here)</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchases.map((bill, billIndex) => (
                    <div
                      key={bill.bill_id || billIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                        <div>
                          <div className="font-bold text-lg text-teal-600">
                            Bill #{bill.bill_no || bill.billNo}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(bill.bill_date || bill.date)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            Products Total
                          </div>
                          <div className="font-bold text-lg text-teal-600">
                            ₹{bill.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-3 text-left text-sm">S.No</th>
                              <th className="p-3 text-left text-sm">
                                Product Name
                              </th>
                              <th className="p-3 text-center text-sm">
                                HSN Code
                              </th>
                              <th className="p-3 text-center text-sm">
                                Quantity
                              </th>
                              <th className="p-3 text-right text-sm">
                                Unit Price
                              </th>
                              <th className="p-3 text-right text-sm">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(bill.items || []).map((item, index) => (
                              <tr
                                key={item.bill_item_id || index}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-3 text-center">{index + 1}</td>
                                <td className="p-3 font-semibold">
                                  {item.product_name || item.productName}
                                </td>
                                <td className="p-3 text-center">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                                    {item.hsnCode}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  {item.quantity}
                                </td>
                                <td className="p-3 text-right">
                                  ₹
                                  {parseFloat(
                                    item.unit_price || item.unitPrice
                                  ).toFixed(2)}
                                </td>
                                <td className="p-3 text-right font-semibold">
                                  ₹
                                  {parseFloat(
                                    item.total_price || item.totalPrice
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-50 p-4 border-t text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Payment Method:{" "}
                            <span className="font-semibold">
                              {bill.payment_method || bill.paymentMethod}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Paid:{" "}
                            <span className="font-semibold text-green-600">
                              ₹
                              {parseFloat(
                                bill.paid_amount || bill.paidAmount || 0
                              ).toFixed(2)}
                            </span>
                          </span>
                          <span className="text-gray-600">
                            Due:{" "}
                            <span className="font-semibold text-red-600">
                              ₹
                              {parseFloat(
                                bill.balance_due || bill.balanceDue || 0
                              ).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold text-teal-700">
                        Total Product Purchases
                      </div>
                      <div className="text-2xl font-bold text-teal-600">
                        ₹
                        {purchases
                          .reduce((sum, bill) => sum + bill.totalAmount, 0)
                          .toFixed(2)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Total Bills: {purchases.length} | Total Products:{" "}
                      {purchases.reduce(
                        (sum, bill) => sum + bill.items.length,
                        0
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
