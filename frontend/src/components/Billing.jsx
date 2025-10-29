// import React, { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";

// let translationCache = {};

// const translateToTamil = async (englishText) => {
//   if (!englishText) return englishText;
//   if (translationCache[englishText]) return translationCache[englishText];
//   try {
//     const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|ta`);
//     const data = await response.json();
//     if (data.responseStatus === 200 && data.responseData.translatedText) {
//       const tamilText = data.responseData.translatedText;
//       translationCache[englishText] = tamilText;
//       return tamilText;
//     }
//   } catch (error) {
//     console.error('Translation failed:', error);
//   }
//   return englishText;
// };

// const preloadTranslations = async (products) => {
//   const promises = products.map(product => translateToTamil(product.productName));
//   await Promise.all(promises);
// };

// export default function Billing({ userId }) {
//   const [tabs, setTabs] = useState([]);
//   const [activeTab, setActiveTab] = useState(null);
//   const [nextTabId, setNextTabId] = useState(1);
//   const [products, setProducts] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [latestBillNo, setLatestBillNo] = useState(0);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const billingContainerRef = useRef(null);

//   useEffect(() => {
//     const initializeData = async () => {
//       await fetchProducts();
//       await fetchCustomers();
//       await fetchLatestBillNo();
//       setIsInitialized(true);
//     };
//     initializeData();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/products");
//       if (res.ok) {
//         const data = await res.json();
//         setProducts(data);
//         preloadTranslations(data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch products:", err);
//       toast.error("Failed to fetch products");
//     }
//   };

//   const fetchCustomers = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/bills/customers");
//       if (res.ok) {
//         const data = await res.json();
//         const customersWithNumericDue = data.map(customer => ({
//           ...customer,
//           dueAmount: parseFloat(customer.dueAmount) || 0
//         }));
//         setCustomers(customersWithNumericDue);
//         console.log("Customers fetched:", customersWithNumericDue.length);
//       }
//     } catch (err) {
//       console.error("Failed to fetch customers:", err);
//     }
//   };

//   const fetchLatestBillNo = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/bills/latest-bill-no");
//       if (res.ok) {
//         const data = await res.json();
//         setLatestBillNo(data.latestBillNo || 0);
//         console.log("Latest bill no:", data.latestBillNo);
//       }
//     } catch (err) {
//       console.error("Failed to fetch latest bill number:", err);
//     }
//   };

//   const getCurrentDate = () => new Date().toLocaleDateString('en-IN');

//   const getNextAvailableBillNumber = () => {
//     const usedBillNumbers = tabs.map(tab => tab.billNo);
//     const maxUsedBillNo = usedBillNumbers.length > 0 ? Math.max(...usedBillNumbers) : 0;
//     const nextBillNo = Math.max(maxUsedBillNo, latestBillNo) + 1;
//     console.log("Next bill number:", nextBillNo, "Used:", usedBillNumbers, "Latest:", latestBillNo);
//     return nextBillNo;
//   };

//   const createNewTab = () => {
//     const nextBillNo = getNextAvailableBillNumber();
    
//     const newTab = {
//       id: nextTabId,
//       name: `Bill ${nextBillNo}`,
//       billNo: nextBillNo,
//       billItems: [],
//       nextBillId: 1,
//       customerName: "",
//       customerPhone: "",
//       selectedLanguage: "en",
//       paymentMethod: "Cash",
//       paidAmount: "",
//       showPaymentModal: false,
//       printCopies: 1,
//       tamilTranslations: {},
//       isSaved: false,
//       balanceDue: 0,
//       previousDueAmount: 0,
//       showDueAlert: false,
//       pendingDueCustomer: null,
//       purchaseTotal: 0,
//       totalDue: 0
//     };
    
//     console.log("Creating new tab:", newTab.name, "Bill No:", nextBillNo);
//     setTabs(prev => [...prev, newTab]);
//     setActiveTab(newTab.id);
//     setNextTabId(prev => prev + 1);
//   };

//   const closeTab = (tabId, e) => {
//     e?.stopPropagation();
//     if (tabs.length <= 1) {
//       toast.error("Cannot close the last tab");
//       return;
//     }
//     const tabToClose = tabs.find(tab => tab.id === tabId);
//     if (tabToClose && !tabToClose.isSaved && tabToClose.billItems.length > 0) {
//       if (!confirm("This bill has unsaved changes. Are you sure you want to close it?")) return;
//     }
//     const newTabs = tabs.filter(tab => tab.id !== tabId);
//     setTabs(newTabs);
//     if (activeTab === tabId && newTabs.length > 0) {
//       setActiveTab(newTabs[0].id);
//     }
//   };

//   const updateTab = (tabId, updates) => {
//     setTabs(prev => prev.map(tab => tab.id === tabId ? { ...tab, ...updates } : tab));
//   };

//   const getActiveTab = () => tabs.find(tab => tab.id === activeTab);

//   const handleLanguageChange = (tabId, language) => {
//     updateTab(tabId, { selectedLanguage: language });
//   };

//   const handleAddRow = (tabId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
//     const newBillItems = [...tab.billItems, {
//       id: Date.now(),
//       bill_id: tab.nextBillId,
//       productName: "",
//       displayName: "",
//       categoryName: "",
//       quantity: "",
//       unitPrice: "",
//       totalPrice: 0,
//       product_id: null,
//       showProductDropdown: false,
//       filteredProducts: products.slice(0, 10),
//     }];
//     updateTab(tabId, { billItems: newBillItems, nextBillId: tab.nextBillId + 1 });
//   };

//   const addDueAmountItem = (tabId, dueAmount) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;

//     const dueItem = {
//       id: `due-${Date.now()}`,
//       bill_id: tab.nextBillId,
//       productName: "Previous Due Amount",
//       displayName: tab.selectedLanguage === 'ta' ? "முந்தைய நிலுவை தொகை" : "Previous Due Amount",
//       categoryName: "Due",
//       quantity: 1,
//       unitPrice: dueAmount,
//       totalPrice: dueAmount,
//       product_id: null,
//       isDueItem: true
//     };

//     const newBillItems = [...tab.billItems, dueItem];
//     updateTab(tabId, { 
//       billItems: newBillItems, 
//       nextBillId: tab.nextBillId + 1,
//       previousDueAmount: dueAmount,
//       showDueAlert: false,
//       pendingDueCustomer: null
//     });
    
//     toast.success(`Previous due amount of ₹${dueAmount} added to bill`, {
//       duration: 4000,
//       icon: '💰'
//     });
//   };

//   const handleChange = (tabId, itemId, field, value) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
//     const updatedBillItems = tab.billItems.map(item => {
//       if (item.id === itemId) {
//         if (item.isDueItem) return item;

//         const updatedItem = { ...item, [field]: value };
//         if (field === 'productName') {
//           updatedItem.productName = value;
//           updatedItem.displayName = value;
//           if (value.trim()) {
//             const filtered = products.filter((prod) =>
//               prod.productName.toLowerCase().includes(value.toLowerCase()) ||
//               prod.categoryName.toLowerCase().includes(value.toLowerCase())
//             ).slice(0, 10);
//             updatedItem.filteredProducts = filtered;
//             updatedItem.showProductDropdown = true;
//           } else {
//             updatedItem.filteredProducts = products.slice(0, 10);
//             updatedItem.showProductDropdown = products.length > 0;
//           }
//         }
//         if (field === 'quantity' || field === 'unitPrice') {
//           const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
//           const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updatedItem.unitPrice) || 0;
//           updatedItem.totalPrice = (qty * price).toFixed(2);
//         }
//         return updatedItem;
//       }
//       return item;
//     });
//     updateTab(tabId, { billItems: updatedBillItems });
//   };

//   const handleProductSelect = (tabId, itemId, product) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
    
//     let displayName = product.productName;
//     if (tab.selectedLanguage === 'ta' && translationCache[product.productName]) {
//       displayName = translationCache[product.productName];
//     }
    
//     const updatedBillItems = tab.billItems.map(item => {
//       if (item.id === itemId) {
//         const qty = parseFloat(item.quantity) || 0;
//         const total = (qty * product.unitPrice).toFixed(2);
//         return {
//           ...item,
//           productName: product.productName,
//           displayName: displayName,
//           categoryName: product.categoryName,
//           unitPrice: product.unitPrice,
//           product_id: product.product_id,
//           totalPrice: total,
//           showProductDropdown: false,
//           filteredProducts: [],
//         };
//       }
//       return item;
//     });
//     updateTab(tabId, { billItems: updatedBillItems });
//   };

//   const handleProductFocus = (tabId, itemId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
//     const updatedBillItems = tab.billItems.map(item => {
//       if (item.id === itemId && !item.isDueItem) {
//         return { ...item, showProductDropdown: true, filteredProducts: products.slice(0, 10) };
//       }
//       return item;
//     });
//     updateTab(tabId, { billItems: updatedBillItems });
//   };

//   const handleProductBlur = (tabId, itemId) => {
//     setTimeout(() => {
//       const tab = tabs.find(t => t.id === tabId);
//       if (!tab) return;
//       const updatedBillItems = tab.billItems.map(item => {
//         if (item.id === itemId) return { ...item, showProductDropdown: false };
//         return item;
//       });
//       updateTab(tabId, { billItems: updatedBillItems });
//     }, 200);
//   };

//   const handleDelete = (tabId, itemId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
//     const itemToDelete = tab.billItems.find(item => item.id === itemId);
    
//     if (itemToDelete && itemToDelete.isDueItem) {
//       toast.error("Cannot delete due amount item");
//       return;
//     }
    
//     const updatedBillItems = tab.billItems.filter(item => item.id !== itemId);
//     updateTab(tabId, { billItems: updatedBillItems });
//   };

//   const calculateGrandTotal = (billItems) => {
//     const total = billItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
//     return parseFloat(total.toFixed(2));
//   };

//   const calculatePurchaseTotal = (billItems) => {
//     const regularItems = billItems.filter(item => !item.isDueItem);
//     const total = regularItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
//     return parseFloat(total.toFixed(2));
//   };

//   const calculateTotalDue = (tab) => {
//     if (!tab) return 0;
//     const purchaseTotal = calculatePurchaseTotal(tab.billItems);
//     const previousDue = tab.previousDueAmount || 0;
//     return purchaseTotal + previousDue;
//   };

//   const hasRegularItems = (billItems) => {
//     return billItems.some(item => !item.isDueItem && item.productName && item.productName.trim() !== "");
//   };

//   const handleCustomerPhoneChange = async (tabId, phone) => {
//     const cleanPhone = phone.replace(/\D/g, '');
//     updateTab(tabId, { customerPhone: cleanPhone });
    
//     if (cleanPhone.length < 10) {
//       updateTab(tabId, { 
//         showDueAlert: false,
//         pendingDueCustomer: null,
//         previousDueAmount: 0,
//         customerName: ""
//       });
//       return;
//     }
    
//     if (cleanPhone.length === 10) {
//       await fetchCustomers();
      
//       setTimeout(() => {
//         const customer = customers.find(c => c.phone === cleanPhone);
        
//         if (customer) {
//           console.log("Customer found:", customer.customerName, "Due:", customer.dueAmount);
//           updateTab(tabId, { 
//             customerName: customer.customerName,
//             pendingDueCustomer: customer
//           });
          
//           const tab = tabs.find(t => t.id === tabId);
//           if (tab && customer.dueAmount > 0) {
//             const hasDueItem = tab.billItems.some(item => item.isDueItem);
            
//             if (!hasDueItem) {
//               updateTab(tabId, { 
//                 showDueAlert: true,
//                 previousDueAmount: customer.dueAmount,
//                 pendingDueCustomer: customer
//               });
//             } else {
//               toast.info(`Customer has due: ₹${customer.dueAmount} (Already added)`, {
//                 duration: 3000
//               });
//             }
//           } else {
//             updateTab(tabId, { 
//               showDueAlert: false,
//               previousDueAmount: 0,
//               pendingDueCustomer: null
//             });
//           }
//         } else {
//           updateTab(tabId, { 
//             showDueAlert: false,
//             previousDueAmount: 0,
//             pendingDueCustomer: null,
//             customerName: ""
//           });
//         }
//       }, 100);
//     }
//   };

//   const handleDueAmountConfirmation = async (tabId, shouldAdd) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;

//     if (shouldAdd && tab.previousDueAmount > 0) {
//       addDueAmountItem(tabId, tab.previousDueAmount);
//     } else {
//       await fetchCustomers();
      
//       updateTab(tabId, { 
//         showDueAlert: false,
//         pendingDueCustomer: null,
//         previousDueAmount: 0
//       });
      
//       toast.info("Due amount skipped", {
//         duration: 2000
//       });
//     }
//   };

//   const handlePayment = (tabId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
    
//     if (!hasRegularItems(tab.billItems)) {
//       toast.error("Add purchase items before processing payment!");
//       return;
//     }
    
//     if (tab.billItems.length === 0) {
//       toast.error("Add items to generate bill!");
//       return;
//     }
    
//     if (!tab.customerName.trim()) {
//       toast.error("Please enter customer name!");
//       return;
//     }
    
//     const purchaseTotal = calculatePurchaseTotal(tab.billItems);
//     const previousDue = tab.previousDueAmount || 0;
//     const totalDue = calculateTotalDue(tab);
    
//     let balanceDue = 0;
//     if (tab.paidAmount) {
//       const paid = parseFloat(tab.paidAmount) || 0;
//       balanceDue = Math.max(0, totalDue - paid);
//     } else {
//       balanceDue = totalDue;
//     }
    
//     updateTab(tabId, { 
//       showPaymentModal: true, 
//       balanceDue,
//       purchaseTotal,
//       previousDueAmount: previousDue,
//       totalDue 
//     });
//   };

//   const processPayment = async (tabId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
    
//     const totalDue = calculateTotalDue(tab);
//     const paid = parseFloat(tab.paidAmount) || 0;
    
//     try {
//       let balanceDue = 0;
      
//       if (tab.paymentMethod === "GPay") {
//         balanceDue = 0;
//         updateTab(tabId, { paidAmount: totalDue.toString(), balanceDue: 0 });
//         toast.success("GPay payment successful!");
//       } else if (tab.paymentMethod === "Credit") {
//         balanceDue = totalDue - paid;
//         updateTab(tabId, { balanceDue });
//         if (paid > 0) {
//           toast.success(`Credit payment recorded! Balance due: ₹${balanceDue.toFixed(2)}`);
//         } else {
//           toast.success("Credit bill saved!");
//         }
//       } else {
//         if (paid >= totalDue) {
//           balanceDue = 0;
//           const changeAmount = paid - totalDue;
//           updateTab(tabId, { balanceDue: 0 });
//           toast.success(`Cash payment successful!${changeAmount > 0 ? ` Change: ₹${changeAmount.toFixed(2)}` : ''}`);
//         } else {
//           balanceDue = totalDue - paid;
//           updateTab(tabId, { balanceDue });
//           toast.success(`Partial payment! Balance due: ₹${balanceDue.toFixed(2)}`);
//         }
//       }
      
//       updateTab(tabId, { showPaymentModal: false });
//     } catch (error) {
//       toast.error("Payment processing failed!");
//     }
//   };

//   const handleSaveBill = async (tabId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
    
//     // CRITICAL FIX: Check if userId is available
//     if (!userId) {
//       toast.error("User ID not found! Please log in again.");
//       console.error("❌ userId is missing:", userId);
//       return;
//     }
    
//     if (!hasRegularItems(tab.billItems)) {
//       toast.error("Add purchase items before saving bill!");
//       return;
//     }
    
//     if (tab.billItems.length === 0) {
//       toast.error("No items to save!");
//       return;
//     }
    
//     if (!tab.customerName.trim()) {
//       toast.error("Please enter customer name!");
//       return;
//     }
    
//     const grandTotal = calculateGrandTotal(tab.billItems);
//     const paid = parseFloat(tab.paidAmount) || 0;
//     const balanceDue = tab.balanceDue || (grandTotal - paid);
    
//     const regularItems = tab.billItems.filter(item => !item.isDueItem);
//     const dueItems = tab.billItems.filter(item => item.isDueItem);
    
//     const billData = {
//       billNo: tab.billNo,
//       customerName: tab.customerName,
//       customerPhone: tab.customerPhone,
//       language: tab.selectedLanguage,
//       paymentMethod: tab.paymentMethod,
//       paidAmount: paid,
//       balanceDue: balanceDue,
//       items: regularItems.map(item => ({
//         bill_id: item.bill_id,
//         product_id: item.product_id,
//         productName: item.productName,
//         quantity: parseFloat(item.quantity),
//         unitPrice: parseFloat(item.unitPrice),
//         totalPrice: parseFloat(item.totalPrice)
//       })),
//       dueItems: dueItems.map(item => ({
//         productName: item.productName,
//         amount: parseFloat(item.totalPrice)
//       })),
//       totalAmount: grandTotal,
//       date: new Date().toISOString(),
//       createdBy: userId  // ✅ FIXED: Using the logged-in user's ID
//     };
    
//     console.log("💾 Saving bill with userId:", userId);
//     console.log("Bill data:", billData);
    
//     try {
//       const res = await fetch("http://localhost:5000/api/bills/bills", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify(billData)
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error('Server error:', errorText);
//         throw new Error(`Server error: ${res.status}`);
//       }

//       const data = await res.json();

//       if (data.error) {
//         toast.error(`❌ ${data.error}`);
//         return;
//       }
      
//       if (data.billId) {
//         try {
//           await fetch(`http://localhost:5000/api/bills/bills/${data.billId}/payment`, {
//             method: "PUT",
//             headers: { 
//               "Content-Type": "application/json",
//               "Accept": "application/json"
//             },
//             body: JSON.stringify({
//               paidAmount: paid,
//               balanceDue: balanceDue,
//               paymentMethod: tab.paymentMethod
//             })
//           });
//           console.log("Payment updated in database");
//         } catch (paymentError) {
//           console.error("Failed to update payment:", paymentError);
//         }
//       }
      
//       toast.success("✅ Bill saved successfully!");
//       setLatestBillNo(tab.billNo);
      
//       await fetchCustomers();
      
//       updateTab(tabId, {
//         billItems: [],
//         nextBillId: 1,
//         customerName: "",
//         customerPhone: "",
//         selectedLanguage: "en",
//         paymentMethod: "Cash",
//         paidAmount: "",
//         showPaymentModal: false,
//         printCopies: 1,
//         tamilTranslations: {},
//         isSaved: false,
//         balanceDue: 0,
//         previousDueAmount: 0,
//         showDueAlert: false,
//         pendingDueCustomer: null,
//         purchaseTotal: 0,
//         totalDue: 0
//       });
      
//     } catch (err) {
//       console.error("Save bill error:", err);
//       toast.error("Failed to save bill: " + err.message);
//     }
//   };

//   const handlePrint = (tabId) => {
//     const tab = tabs.find(t => t.id === tabId);
//     if (!tab) return;
    
//     if (!hasRegularItems(tab.billItems)) {
//       toast.error("Add purchase items before printing!");
//       return;
//     }
    
//     if (!tab.customerName.trim()) {
//       toast.error("Please enter customer name!");
//       return;
//     }
    
//     for (let i = 0; i < tab.printCopies; i++) {
//       setTimeout(() => {
//         const printContent = generatePrintContent(tab);
//         const printWindow = window.open('', '_blank');
//         printWindow.document.write(printContent);
//         printWindow.document.close();
//         printWindow.print();
//       }, i * 500);
//     }
//     toast.success(`Printed ${tab.printCopies} copies!`);
//   };

//   const generatePrintContent = (tab) => {
//     const grandTotal = calculateGrandTotal(tab.billItems);
//     const paid = parseFloat(tab.paidAmount) || 0;
//     const due = tab.balanceDue || 0;
//     const change = paid > grandTotal ? paid - grandTotal : 0;
    
//     const regularItems = tab.billItems.filter(item => !item.isDueItem);
//     const dueItems = tab.billItems.filter(item => item.isDueItem);
    
//     const sortedItems = [...regularItems].sort((a, b) => {
//       const catA = a.categoryName || 'ZZZ';
//       const catB = b.categoryName || 'ZZZ';
//       return catA.localeCompare(catB);
//     });

//     return `<!DOCTYPE html><html><head><title>Bill #${tab.billNo}</title><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');body{font-family:Arial,sans-serif;margin:20px;line-height:1.4}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #333;padding-bottom:15px}.shop-name{font-size:28px;font-weight:bold;margin-bottom:10px;color:#2c5530}.bill-info{margin-bottom:20px;background:#f8f9fa;padding:15px;border-radius:8px}.bill-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px}.bill-table th,.bill-table td{border:1px solid #000;padding:10px 8px;text-align:left}.bill-table th{background-color:#2c5530;color:white;font-weight:bold;text-align:center}.total-row{font-weight:bold;background-color:#e9ecef}.due-row{background-color:#fff3cd;font-weight:bold}.footer{text-align:center;margin-top:30px;border-top:2px solid #333;padding-top:15px}.payment-info{margin:15px 0;padding:12px;background:#e7f3ff;border-radius:6px;border-left:4px solid #007bff}.tamil-text{font-family:'Noto Sans Tamil',sans-serif;font-size:18px;font-weight:500}.tamil-heading{font-family:'Noto Sans Tamil',sans-serif;font-size:22px;font-weight:700}</style></head><body><div class="header"><div class="shop-name ${tab.selectedLanguage==='ta'?'tamil-heading':''}">${tab.selectedLanguage==='ta'?'கடை':'Stores'}</div><div><strong>${tab.selectedLanguage==='ta'?'பில் எண்:':'Bill No:'}</strong> #${tab.billNo}</div><div><strong>${tab.selectedLanguage==='ta'?'தேதி:':'Date:'}</strong> ${getCurrentDate()}</div></div><div class="bill-info"><div class="${tab.selectedLanguage==='ta'?'tamil-text':''}"><strong>${tab.selectedLanguage==='ta'?'வாடிக்கையாளர்:':'Customer:'}</strong> ${tab.customerName}</div><div><strong>${tab.selectedLanguage==='ta'?'தொலைபேசி:':'Phone:'}</strong> ${tab.customerPhone}</div></div><table class="bill-table"><thead><tr><th>${tab.selectedLanguage==='ta'?'எண்':'S.No'}</th><th>${tab.selectedLanguage==='ta'?'பொருள்':'Product'}</th><th>${tab.selectedLanguage==='ta'?'அளவு':'Qty'}</th><th>${tab.selectedLanguage==='ta'?'விலை':'Price'}</th><th>${tab.selectedLanguage==='ta'?'மொத்தம்':'Total'}</th></tr></thead><tbody>${sortedItems.map((item,index)=>`<tr><td style="text-align:center;">${index+1}</td><td class="${tab.selectedLanguage==='ta'?'tamil-text':''}">${tab.selectedLanguage==='ta'?(translationCache[item.productName]||item.productName):item.productName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td><td style="text-align:right;">₹${parseFloat(item.totalPrice).toFixed(2)}</td></tr>`).join('')}${dueItems.map((item,index)=>`<tr class="due-row"><td style="text-align:center;">${sortedItems.length+index+1}</td><td class="${tab.selectedLanguage==='ta'?'tamil-text':''}">${item.displayName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td><td style="text-align:right;">₹${parseFloat(item.totalPrice).toFixed(2)}</td></tr>`).join('')}<tr class="total-row"><td colspan="4" style="text-align:right;">${tab.selectedLanguage==='ta'?'மொத்த தொகை:':'Grand Total:'}</td><td style="text-align:right;">₹${grandTotal.toFixed(2)}</td></tr></tbody></table>${paid>0||due>0?`<div class="payment-info">${paid>0?`<div><strong>${tab.selectedLanguage==='ta'?'செலுத்திய தொகை:':'Paid:'}</strong> ₹${paid.toFixed(2)}</div>`:''}${due>0?`<div><strong>${tab.selectedLanguage==='ta'?'நிலுவை:':'Due:'}</strong> ₹${due.toFixed(2)}</div>`:''}${change>0?`<div><strong>${tab.selectedLanguage==='ta'?'மீதம்:':'Change:'}</strong> ₹${change.toFixed(2)}</div>`:''}</div>`:''}<div class="footer"><div class="${tab.selectedLanguage==='ta'?'tamil-heading':''}">${tab.selectedLanguage==='ta'?'நன்றி! மீண்டும் வருக!':'Thank you! Visit again!'}</div></div></body></html>`;
//   };

//   const getChangeAmount = (tab) => {
//     const totalDue = calculateTotalDue(tab);
//     const paid = parseFloat(tab.paidAmount) || 0;
//     return paid > totalDue ? paid - totalDue : 0;
//   };

//   const getDisplayProductName = (tab, product) => {
//     if (tab.selectedLanguage === 'ta' && translationCache[product.productName]) {
//       return translationCache[product.productName];
//     }
//     return product.productName;
//   };

//   const getDisplayNameForItem = (tab, item) => {
//     return item.displayName || item.productName || "";
//   };

//   const activeTabData = getActiveTab();

//   useEffect(() => {
//     if (isInitialized && tabs.length === 0) {
//       console.log("Initializing first tab");
//       createNewTab();
//     }
//   }, [isInitialized]);

//   // Show user ID in console for debugging
//   useEffect(() => {
//     if (userId) {
//       console.log("✅ Billing component loaded with userId:", userId);
//     } else {
//       console.warn("⚠️ Billing component loaded WITHOUT userId!");
//     }
//   }, [userId]);

//   return (
//     <div className="p-6 font-[Poppins]" ref={billingContainerRef}>
//       <Toaster position="top-right" />
      
//       <style>{`
//         .table-container{overflow:visible!important}
//         .dropdown-cell{position:static!important;overflow:visible!important}
//         .product-dropdown{position:absolute!important;z-index:9999!important;background:white;border:1px solid #d1d5db;border-radius:6px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);max-height:200px;overflow-y:auto;min-width:300px}
//         .category-header{background:#f3f4f6;padding:8px 12px;font-weight:600;font-size:13px;color:#374151;border-bottom:2px solid #e5e7eb;position:sticky;top:0;z-index:1}
//         .tamil-ui-text{font-family:'Noto Sans Tamil','Arial Unicode MS',sans-serif;font-size:16px;font-weight:500}
//         .due-item{background-color:#fff3cd!important;font-weight:bold}
//         .due-item input{background-color:transparent;border:none;font-weight:bold;color:#856404}
//         .animate-slide-in{animation:slideInRight 0.3s ease-out}
//         @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
//       `}</style>

//       {activeTabData?.showDueAlert && (
//         <div className="fixed top-20 right-6 z-50 animate-slide-in">
//           <div className="bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 w-96">
//             <div className="bg-orange-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <span className="text-2xl">⚠️</span>
//                 <h3 className="font-bold text-lg">Due Amount Alert!</h3>
//               </div>
//             </div>
            
//             <div className="p-5">
//               <div className="mb-4">
//                 <div className="text-sm text-gray-600 mb-2">
//                   <strong>Customer:</strong> {activeTabData.pendingDueCustomer?.customerName}
//                 </div>
//                 <div className="text-sm text-gray-600 mb-3">
//                   <strong>Phone:</strong> {activeTabData.pendingDueCustomer?.phone}
//                 </div>
                
//                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
//                   <div className="text-center">
//                     <div className="text-sm text-orange-700 font-semibold mb-1">Previous Due Amount</div>
//                     <div className="text-3xl font-bold text-orange-600">
//                       ₹{activeTabData.previousDueAmount?.toFixed(2)}
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
//                   <p className="mb-2">
//                     <strong>Note:</strong> This amount will be added to the current purchase.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => handleDueAmountConfirmation(activeTab, false)}
//                   className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
//                 >
//                   Skip
//                 </button>
//                 <button
//                   onClick={() => handleDueAmountConfirmation(activeTab, true)}
//                   className="flex-1 bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
//                 >
//                   Add Due Amount
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center bg-gray-100 border-b border-gray-300 mb-6 rounded-t-lg">
//         <div className="flex flex-1 overflow-x-auto">
//           {tabs.map((tab) => (
//             <div
//               key={tab.id}
//               className={`flex items-center px-4 py-3 border-r border-gray-300 cursor-pointer min-w-32 transition-colors ${
//                 activeTab === tab.id 
//                   ? 'bg-white border-t-2 border-t-teal-500 text-teal-600 font-semibold' 
//                   : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               <span className="flex-1 truncate mr-2">{tab.name}</span>
//               {tabs.length > 1 && (
//                 <button
//                   onClick={(e) => closeTab(tab.id, e)}
//                   className="text-gray-500 hover:text-red-600 text-lg font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100"
//                 >
//                   ×
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={createNewTab}
//           className="px-4 py-3 bg-teal-500 text-white hover:bg-teal-600 transition-colors font-semibold"
//         >
//           +
//         </button>
//       </div>

//       <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//         <div className="flex items-center gap-4">
//           <span className="text-sm font-medium text-blue-700">Language / மொழி:</span>
//           <button
//             onClick={() => activeTabData && handleLanguageChange(activeTab, 'en')}
//             className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//               activeTabData?.selectedLanguage === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
//             }`}
//           >
//             English
//           </button>
//           <button
//             onClick={() => activeTabData && handleLanguageChange(activeTab, 'ta')}
//             className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//               activeTabData?.selectedLanguage === 'ta' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
//             }`}
//           >
//             தமிழ்
//           </button>
//         </div>
//       </div>

//       {activeTabData?.showPaymentModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-96">
//             <h3 className="text-xl font-bold mb-4">Payment - {activeTabData.name}</h3>
            
//             <div className="mb-4 space-y-2">
//               {activeTabData.previousDueAmount > 0 && (
//                 <div className="flex justify-between text-sm">
//                   <span className="text-orange-600">Previous Due:</span>
//                   <span className="font-semibold">₹{activeTabData.previousDueAmount.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-sm">
//                 <span>Current Purchase:</span>
//                 <span className="font-semibold">₹{activeTabData.purchaseTotal?.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-lg font-bold border-t pt-2">
//                 <span className="text-teal-600">Total Amount:</span>
//                 <span className="text-teal-600">₹{activeTabData.totalDue?.toFixed(2)}</span>
//               </div>
//             </div>

//             {(activeTabData.paymentMethod === "Cash" || activeTabData.paymentMethod === "Credit") && (
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Enter paid amount:</label>
//                 <input
//                   type="number"
//                   value={activeTabData.paidAmount}
//                   onChange={(e) => updateTab(activeTab, { paidAmount: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                   placeholder="0.00"
//                   min="0"
//                   step="0.01"
//                 />
//               </div>
//             )}

//             <div className="mb-4 space-y-2">
//               {activeTabData.paymentMethod === "Cash" && activeTabData.paidAmount && (
//                 <>
//                   <div className="text-green-600 font-semibold">
//                     Change: ₹{getChangeAmount(activeTabData).toFixed(2)}
//                   </div>
//                   {activeTabData.balanceDue > 0 && (
//                     <div className="text-orange-600 font-semibold">
//                       Balance Due: ₹{activeTabData.balanceDue.toFixed(2)}
//                     </div>
//                   )}
//                 </>
//               )}
//               {activeTabData.paymentMethod === "Credit" && activeTabData.paidAmount && (
//                 <div className="text-orange-600 font-semibold">
//                   Balance Due: ₹{activeTabData.balanceDue?.toFixed(2)}
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-3 justify-end">
//               <button
//                 onClick={() => updateTab(activeTab, { showPaymentModal: false })}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => processPayment(activeTab)}
//                 className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
//               >
//                 Process Payment
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTabData && (
//         <>
//           <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <h1 className="text-3xl font-bold text-teal-600">Billing System - {activeTabData.name}</h1>
//               <div className="text-right">
//                 <div className="text-lg font-bold text-teal-600">Bill No: #{activeTabData.billNo}</div>
//                 <div className="text-sm text-gray-600">Date: <span className="font-semibold">{getCurrentDate()}</span></div>
//               </div>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone:</label>
//                 <input
//                   type="tel"
//                   value={activeTabData.customerPhone}
//                   onChange={(e) => handleCustomerPhoneChange(activeTab, e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                   placeholder="Enter 10-digit phone"
//                   maxLength="10"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name:</label>
//                 <input
//                   type="text"
//                   value={activeTabData.customerName}
//                   onChange={(e) => updateTab(activeTab, { customerName: e.target.value })}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                   placeholder="Enter customer name"
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Language:</label>
//                 <select
//                   value={activeTabData.selectedLanguage}
//                   onChange={(e) => handleLanguageChange(activeTab, e.target.value)}
//                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 >
//                   <option value="en">English</option>
//                   <option value="ta">தமிழ் (Tamil)</option>
//                 </select>
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method:</label>
//                 <div className="flex gap-4">
//                   <label className="flex items-center">
//                     <input type="radio" name="paymentMethod" value="Cash" checked={activeTabData.paymentMethod === "Cash"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
//                     <span className="text-sm">Cash</span>
//                   </label>
//                   <label className="flex items-center">
//                     <input type="radio" name="paymentMethod" value="Credit" checked={activeTabData.paymentMethod === "Credit"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
//                     <span className="text-sm">Credit</span>
//                   </label>
//                   <label className="flex items-center">
//                     <input type="radio" name="paymentMethod" value="GPay" checked={activeTabData.paymentMethod === "GPay"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
//                     <span className="text-sm">GPay</span>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {(activeTabData.paidAmount > 0 || activeTabData.balanceDue > 0) && (
//               <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {activeTabData.paidAmount > 0 && (
//                     <div className="text-center">
//                       <div className="text-sm text-blue-600">Paid Amount</div>
//                       <div className="text-lg font-bold text-blue-700">₹{parseFloat(activeTabData.paidAmount).toFixed(2)}</div>
//                     </div>
//                   )}
//                   {activeTabData.balanceDue > 0 && (
//                     <div className="text-center">
//                       <div className="text-sm text-orange-600">Balance Due</div>
//                       <div className="text-lg font-bold text-orange-700">₹{activeTabData.balanceDue.toFixed(2)}</div>
//                     </div>
//                   )}
//                   {getChangeAmount(activeTabData) > 0 && (
//                     <div className="text-center">
//                       <div className="text-sm text-green-600">Change</div>
//                       <div className="text-lg font-bold text-green-700">₹{getChangeAmount(activeTabData).toFixed(2)}</div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3 mb-4 flex-wrap justify-end">
//               <button onClick={() => handleAddRow(activeTab)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors">+ Add Item</button>
//               <button onClick={() => handlePayment(activeTab)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Process Payment</button>
//               <div className="flex items-center gap-2">
//                 <select value={activeTabData.printCopies} onChange={(e) => updateTab(activeTab, { printCopies: parseInt(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
//                   {[1, 2, 3].map(num => (<option key={num} value={num}>{num} copies</option>))}
//                 </select>
//                 <button onClick={() => handlePrint(activeTab)} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">Print</button>
//               </div>
//               <button onClick={() => handleSaveBill(activeTab)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Save Bill</button>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="table-container">
//               <table className="w-full border-collapse">
//                 <thead className="bg-teal-500 text-white">
//                   <tr>
//                     <th className="border border-teal-600 p-3 text-left">S.No</th>
//                     <th className="border border-teal-600 p-3 text-left">Product Name</th>
//                     <th className="border border-teal-600 p-3 text-center">Quantity</th>
//                     <th className="border border-teal-600 p-3 text-center">Unit Price (₹)</th>
//                     <th className="border border-teal-600 p-3 text-center">Total Price (₹)</th>
//                     <th className="border border-teal-600 p-3 text-center">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {activeTabData.billItems.length === 0 ? (
//                     <tr>
//                       <td colSpan="6" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
//                         No items added yet. Click 'Add Item' to start billing.
//                       </td>
//                     </tr>
//                   ) : (
//                     activeTabData.billItems.map((item) => (
//                       <tr key={item.id} className={`hover:bg-gray-50 ${item.isDueItem ? 'due-item' : ''}`}>
//                         <td className="border border-gray-300 p-3 text-center font-medium">{item.bill_id}</td>
                        
//                         <td className="border border-gray-300 p-3 dropdown-cell" style={{position:'relative',overflow:'visible'}}>
//                           {item.isDueItem ? (
//                             <div className={`font-bold ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}>{item.displayName}</div>
//                           ) : (
//                             <div style={{position:'relative',zIndex:activeTabData.billItems.length-activeTabData.billItems.findIndex(i=>i.id===item.id)+100}}>
//                               {item.categoryName && (
//                                 <div className="text-xs text-gray-500 mb-1">
//                                   <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.categoryName}</span>
//                                 </div>
//                               )}
//                               <input
//                                 type="text"
//                                 value={getDisplayNameForItem(activeTabData, item)}
//                                 onChange={(e) => handleChange(activeTab, item.id, 'productName', e.target.value)}
//                                 onFocus={() => handleProductFocus(activeTab, item.id)}
//                                 onBlur={() => handleProductBlur(activeTab, item.id)}
//                                 className={`w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}
//                                 placeholder={activeTabData.selectedLanguage === 'ta' ? "தயாரிப்பு தேடு..." : "Search product..."}
//                                 autoComplete="off"
//                               />

//                               {item.showProductDropdown && item.filteredProducts && item.filteredProducts.length > 0 && (
//                                 <div className="product-dropdown" style={{position:'absolute',top:'100%',left:'0',right:'0',zIndex:9999,marginTop:'4px'}}>
//                                   {(() => {
//                                     const grouped = {};
//                                     item.filteredProducts.forEach(prod => {
//                                       const cat = prod.categoryName || 'Other';
//                                       if (!grouped[cat]) grouped[cat] = [];
//                                       grouped[cat].push(prod);
//                                     });
                                    
//                                     return Object.entries(grouped).map(([category, prods]) => (
//                                       <div key={category}>
//                                         <div className="category-header">{category}</div>
//                                         {prods.map((product, idx) => (
//                                           <div
//                                             key={product.product_id || idx}
//                                             className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-left"
//                                             style={{borderBottom:'1px solid #f3f4f6'}}
//                                             onMouseDown={(e) => {
//                                               e.preventDefault();
//                                               handleProductSelect(activeTab, item.id, product);
//                                             }}
//                                           >
//                                             <div className={`font-medium text-sm ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}>
//                                               {getDisplayProductName(activeTabData, product)} - ₹{product.unitPrice}
//                                             </div>
//                                             {activeTabData.selectedLanguage === 'ta' && (
//                                               <div className="text-xs text-gray-500 mt-1">{product.productName}</div>
//                                             )}
//                                           </div>
//                                         ))}
//                                       </div>
//                                     ));
//                                   })()}
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </td>

//                         <td className="border border-gray-300 p-3">
//                           {item.isDueItem ? (
//                             <div className="text-center font-bold">{item.quantity}</div>
//                           ) : (
//                             <input type="number" value={item.quantity} onChange={(e) => handleChange(activeTab, item.id, 'quantity', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Qty" min="0" step="0.01"/>
//                           )}
//                         </td>

//                         <td className="border border-gray-300 p-3">
//                           {item.isDueItem ? (
//                             <div className="text-center font-bold">₹{parseFloat(item.unitPrice).toFixed(2)}</div>
//                           ) : (
//                             <input type="number" value={item.unitPrice} onChange={(e) => handleChange(activeTab, item.id, 'unitPrice', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Price" min="0" step="0.01"/>
//                           )}
//                         </td>

//                         <td className="border border-gray-300 p-3 text-center font-semibold">₹{parseFloat(item.totalPrice || 0).toFixed(2)}</td>

//                         <td className="border border-gray-300 p-3 text-center">
//                           {!item.isDueItem && (
//                             <button onClick={() => handleDelete(activeTab, item.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm">Delete</button>
//                           )}
//                           {item.isDueItem && (
//                             <span className="text-xs text-orange-600 font-semibold px-2 py-1 bg-orange-100 rounded">DUE</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))
//                   )}
                  
//                   {activeTabData.billItems.length > 0 && (
//                     <>
//                       <tr className="bg-gray-50 font-semibold">
//                         <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg">
//                           {activeTabData.selectedLanguage === 'ta' ? 'மொத்த தொகை:' : 'Grand Total:'}
//                         </td>
//                         <td className="border border-gray-300 p-3 text-center text-lg text-teal-600 font-bold">₹{calculateGrandTotal(activeTabData.billItems).toFixed(2)}</td>
//                         <td className="border border-gray-300 p-3"></td>
//                       </tr>
                      
//                       {activeTabData.previousDueAmount > 0 && (
//                         <tr className="bg-orange-50">
//                           <td colSpan="4" className="border border-gray-300 p-3 text-right text-sm text-orange-700">
//                             {activeTabData.selectedLanguage === 'ta' ? 'முந்தைய நிலுவை:' : 'Previous Due:'}
//                           </td>
//                           <td className="border border-gray-300 p-3 text-center text-sm text-orange-700 font-semibold">₹{activeTabData.previousDueAmount.toFixed(2)}</td>
//                           <td className="border border-gray-300 p-3"></td>
//                         </tr>
//                       )}
                      
//                       <tr className="bg-blue-50 font-bold">
//                         <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg text-blue-700">
//                           {activeTabData.selectedLanguage === 'ta' ? 'மொத்த நிலுவை:' : 'Total Amount:'}
//                         </td>
//                         <td className="border border-gray-300 p-3 text-center text-lg text-blue-700">₹{calculateTotalDue(activeTabData).toFixed(2)}</td>
//                         <td className="border border-gray-300 p-3"></td>
//                       </tr>
//                     </>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };



import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

let translationCache = {};

const translateToTamil = async (englishText) => {
  if (!englishText) return englishText;
  if (translationCache[englishText]) return translationCache[englishText];
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|ta`);
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      const tamilText = data.responseData.translatedText;
      translationCache[englishText] = tamilText;
      return tamilText;
    }
  } catch (error) {
    console.error('Translation failed:', error);
  }
  return englishText;
};

const preloadTranslations = async (products) => {
  const promises = products.map(product => translateToTamil(product.productName));
  await Promise.all(promises);
};

export default function Billing({ userId }) {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [nextTabId, setNextTabId] = useState(1);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [latestBillNo, setLatestBillNo] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const billingContainerRef = useRef(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchProducts();
      await fetchCustomers();
      await fetchLatestBillNo();
      setIsInitialized(true);
    };
    initializeData();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        preloadTranslations(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      toast.error("Failed to fetch products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bills/customers");
      if (res.ok) {
        const data = await res.json();
        const customersWithNumericDue = data.map(customer => ({
          ...customer,
          dueAmount: parseFloat(customer.dueAmount) || 0
        }));
        setCustomers(customersWithNumericDue);
        console.log("Customers fetched:", customersWithNumericDue.length);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  const fetchLatestBillNo = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bills/latest-bill-no");
      if (res.ok) {
        const data = await res.json();
        setLatestBillNo(data.latestBillNo || 0);
        console.log("Latest bill no:", data.latestBillNo);
      }
    } catch (err) {
      console.error("Failed to fetch latest bill number:", err);
    }
  };

  const getCurrentDate = () => new Date().toLocaleDateString('en-IN');

  const getNextAvailableBillNumber = () => {
    const usedBillNumbers = tabs.map(tab => tab.billNo);
    const maxUsedBillNo = usedBillNumbers.length > 0 ? Math.max(...usedBillNumbers) : 0;
    const nextBillNo = Math.max(maxUsedBillNo, latestBillNo) + 1;
    console.log("Next bill number:", nextBillNo, "Used:", usedBillNumbers, "Latest:", latestBillNo);
    return nextBillNo;
  };

  const createNewTab = () => {
    const nextBillNo = getNextAvailableBillNumber();
    
    const newTab = {
      id: nextTabId,
      name: `Bill ${nextBillNo}`,
      billNo: nextBillNo,
      billItems: [],
      nextBillId: 1,
      customerName: "",
      customerPhone: "",
      selectedLanguage: "en",
      paymentMethod: "Cash",
      paidAmount: "",
      showPaymentModal: false,
      printCopies: 1,
      tamilTranslations: {},
      isSaved: false,
      balanceDue: 0,
      previousDueAmount: 0,
      showDueAlert: false,
      pendingDueCustomer: null,
      purchaseTotal: 0,
      totalDue: 0
    };
    
    console.log("Creating new tab:", newTab.name, "Bill No:", nextBillNo);
    setTabs(prev => [...prev, newTab]);
    setActiveTab(newTab.id);
    setNextTabId(prev => prev + 1);
  };

  const closeTab = (tabId, e) => {
    e?.stopPropagation();
    if (tabs.length <= 1) {
      toast.error("Cannot close the last tab");
      return;
    }
    const tabToClose = tabs.find(tab => tab.id === tabId);
    if (tabToClose && !tabToClose.isSaved && tabToClose.billItems.length > 0) {
      if (!confirm("This bill has unsaved changes. Are you sure you want to close it?")) return;
    }
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTab = (tabId, updates) => {
    setTabs(prev => prev.map(tab => tab.id === tabId ? { ...tab, ...updates } : tab));
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTab);

  const handleLanguageChange = (tabId, language) => {
    updateTab(tabId, { selectedLanguage: language });
  };

  const handleAddRow = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const newBillItems = [...tab.billItems, {
      id: Date.now(),
      bill_id: tab.nextBillId,
      productName: "",
      displayName: "",
      categoryName: "",
      quantity: "",
      unitPrice: "",
      totalPrice: 0,
      product_id: null,
      showProductDropdown: false,
      filteredProducts: products.slice(0, 10),
    }];
    updateTab(tabId, { billItems: newBillItems, nextBillId: tab.nextBillId + 1 });
  };

  const addDueAmountItem = (tabId, dueAmount) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    const dueItem = {
      id: `due-${Date.now()}`,
      bill_id: tab.nextBillId,
      productName: "Previous Due Amount",
      displayName: tab.selectedLanguage === 'ta' ? "முந்தைய நிலுவை தொகை" : "Previous Due Amount",
      categoryName: "Due",
      quantity: 1,
      unitPrice: dueAmount,
      totalPrice: dueAmount,
      product_id: null,
      isDueItem: true
    };

    const newBillItems = [...tab.billItems, dueItem];
    updateTab(tabId, { 
      billItems: newBillItems, 
      nextBillId: tab.nextBillId + 1,
      previousDueAmount: dueAmount,
      showDueAlert: false,
      pendingDueCustomer: null
    });
    
    toast.success(`Previous due amount of ₹${dueAmount} added to bill`, {
      duration: 4000,
      icon: '💰'
    });
  };

  const handleChange = (tabId, itemId, field, value) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const updatedBillItems = tab.billItems.map(item => {
      if (item.id === itemId) {
        if (item.isDueItem) return item;

        const updatedItem = { ...item, [field]: value };
        if (field === 'productName') {
          updatedItem.productName = value;
          updatedItem.displayName = value;
          if (value.trim()) {
            const filtered = products.filter((prod) =>
              prod.productName.toLowerCase().includes(value.toLowerCase()) ||
              prod.categoryName.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 10);
            updatedItem.filteredProducts = filtered;
            updatedItem.showProductDropdown = true;
          } else {
            updatedItem.filteredProducts = products.slice(0, 10);
            updatedItem.showProductDropdown = products.length > 0;
          }
        }
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
          const price = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updatedItem.unitPrice) || 0;
          updatedItem.totalPrice = (qty * price).toFixed(2);
        }
        return updatedItem;
      }
      return item;
    });
    updateTab(tabId, { billItems: updatedBillItems });
  };

  const handleProductSelect = (tabId, itemId, product) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    let displayName = product.productName;
    if (tab.selectedLanguage === 'ta' && translationCache[product.productName]) {
      displayName = translationCache[product.productName];
    }
    
    const updatedBillItems = tab.billItems.map(item => {
      if (item.id === itemId) {
        const qty = parseFloat(item.quantity) || 0;
        const total = (qty * product.unitPrice).toFixed(2);
        return {
          ...item,
          productName: product.productName,
          displayName: displayName,
          categoryName: product.categoryName,
          unitPrice: product.unitPrice,
          product_id: product.product_id,
          totalPrice: total,
          showProductDropdown: false,
          filteredProducts: [],
        };
      }
      return item;
    });
    updateTab(tabId, { billItems: updatedBillItems });
  };

  const handleProductFocus = (tabId, itemId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const updatedBillItems = tab.billItems.map(item => {
      if (item.id === itemId && !item.isDueItem) {
        return { ...item, showProductDropdown: true, filteredProducts: products.slice(0, 10) };
      }
      return item;
    });
    updateTab(tabId, { billItems: updatedBillItems });
  };

  const handleProductBlur = (tabId, itemId) => {
    setTimeout(() => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;
      const updatedBillItems = tab.billItems.map(item => {
        if (item.id === itemId) return { ...item, showProductDropdown: false };
        return item;
      });
      updateTab(tabId, { billItems: updatedBillItems });
    }, 200);
  };

  const handleDelete = (tabId, itemId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const itemToDelete = tab.billItems.find(item => item.id === itemId);
    
    if (itemToDelete && itemToDelete.isDueItem) {
      toast.error("Cannot delete due amount item");
      return;
    }
    
    const updatedBillItems = tab.billItems.filter(item => item.id !== itemId);
    updateTab(tabId, { billItems: updatedBillItems });
  };

  const calculateGrandTotal = (billItems) => {
    const total = billItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    return parseFloat(total.toFixed(2));
  };

  const calculatePurchaseTotal = (billItems) => {
    const regularItems = billItems.filter(item => !item.isDueItem);
    const total = regularItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    return parseFloat(total.toFixed(2));
  };

  const calculateTotalDue = (tab) => {
    if (!tab) return 0;
    const purchaseTotal = calculatePurchaseTotal(tab.billItems);
    const previousDue = tab.previousDueAmount || 0;
    return purchaseTotal + previousDue;
  };

  const hasRegularItems = (billItems) => {
    return billItems.some(item => !item.isDueItem && item.productName && item.productName.trim() !== "");
  };

  const handleCustomerPhoneChange = async (tabId, phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    updateTab(tabId, { customerPhone: cleanPhone });
    
    if (cleanPhone.length < 10) {
      updateTab(tabId, { 
        showDueAlert: false,
        pendingDueCustomer: null,
        previousDueAmount: 0,
        customerName: ""
      });
      return;
    }
    
    if (cleanPhone.length === 10) {
      await fetchCustomers();
      
      setTimeout(() => {
        const customer = customers.find(c => c.phone === cleanPhone);
        
        if (customer) {
          console.log("Customer found:", customer.customerName, "Due:", customer.dueAmount);
          updateTab(tabId, { 
            customerName: customer.customerName,
            pendingDueCustomer: customer
          });
          
          const tab = tabs.find(t => t.id === tabId);
          if (tab && customer.dueAmount > 0) {
            const hasDueItem = tab.billItems.some(item => item.isDueItem);
            
            if (!hasDueItem) {
              updateTab(tabId, { 
                showDueAlert: true,
                previousDueAmount: customer.dueAmount,
                pendingDueCustomer: customer
              });
            } else {
              toast.info(`Customer has due: ₹${customer.dueAmount} (Already added)`, {
                duration: 3000
              });
            }
          } else {
            updateTab(tabId, { 
              showDueAlert: false,
              previousDueAmount: 0,
              pendingDueCustomer: null
            });
          }
        } else {
          updateTab(tabId, { 
            showDueAlert: false,
            previousDueAmount: 0,
            pendingDueCustomer: null,
            customerName: ""
          });
        }
      }, 100);
    }
  };

  const handleDueAmountConfirmation = async (tabId, shouldAdd) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (shouldAdd && tab.previousDueAmount > 0) {
      addDueAmountItem(tabId, tab.previousDueAmount);
    } else {
      await fetchCustomers();
      
      updateTab(tabId, { 
        showDueAlert: false,
        pendingDueCustomer: null,
        previousDueAmount: 0
      });
      
      toast.info("Due amount skipped", {
        duration: 2000
      });
    }
  };

  const handlePayment = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    if (!hasRegularItems(tab.billItems)) {
      toast.error("Add purchase items before processing payment!");
      return;
    }
    
    if (tab.billItems.length === 0) {
      toast.error("Add items to generate bill!");
      return;
    }
    
    if (!tab.customerName.trim()) {
      toast.error("Please enter customer name!");
      return;
    }
    
    const purchaseTotal = calculatePurchaseTotal(tab.billItems);
    const previousDue = tab.previousDueAmount || 0;
    const totalDue = calculateTotalDue(tab);
    
    let balanceDue = 0;
    if (tab.paidAmount) {
      const paid = parseFloat(tab.paidAmount) || 0;
      balanceDue = Math.max(0, totalDue - paid);
    } else {
      balanceDue = totalDue;
    }
    
    updateTab(tabId, { 
      showPaymentModal: true, 
      balanceDue,
      purchaseTotal,
      previousDueAmount: previousDue,
      totalDue 
    });
  };

  const processPayment = async (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    const totalDue = calculateTotalDue(tab);
    const paid = parseFloat(tab.paidAmount) || 0;
    
    try {
      let balanceDue = 0;
      
      if (tab.paymentMethod === "GPay") {
        balanceDue = 0;
        updateTab(tabId, { paidAmount: totalDue.toString(), balanceDue: 0 });
        toast.success("GPay payment successful!");
      } else if (tab.paymentMethod === "Credit") {
        balanceDue = totalDue - paid;
        updateTab(tabId, { balanceDue });
        if (paid > 0) {
          toast.success(`Credit payment recorded! Balance due: ₹${balanceDue.toFixed(2)}`);
        } else {
          toast.success("Credit bill saved!");
        }
      } else {
        if (paid >= totalDue) {
          balanceDue = 0;
          const changeAmount = paid - totalDue;
          updateTab(tabId, { balanceDue: 0 });
          toast.success(`Cash payment successful!${changeAmount > 0 ? ` Change: ₹${changeAmount.toFixed(2)}` : ''}`);
        } else {
          balanceDue = totalDue - paid;
          updateTab(tabId, { balanceDue });
          toast.success(`Partial payment! Balance due: ₹${balanceDue.toFixed(2)}`);
        }
      }
      
      updateTab(tabId, { showPaymentModal: false });
    } catch (error) {
      toast.error("Payment processing failed!");
    }
  };

  const handleSaveBill = async (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return false;
    
    if (!userId) {
      toast.error("User ID not found! Please log in again.");
      console.error("❌ userId is missing:", userId);
      return false;
    }
    
    if (!hasRegularItems(tab.billItems)) {
      toast.error("Add purchase items before saving bill!");
      return false;
    }
    
    if (tab.billItems.length === 0) {
      toast.error("No items to save!");
      return false;
    }
    
    if (!tab.customerName.trim()) {
      toast.error("Please enter customer name!");
      return false;
    }
    
    const grandTotal = calculateGrandTotal(tab.billItems);
    const paid = parseFloat(tab.paidAmount) || 0;
    const balanceDue = tab.balanceDue || (grandTotal - paid);
    
    const regularItems = tab.billItems.filter(item => !item.isDueItem);
    const dueItems = tab.billItems.filter(item => item.isDueItem);
    
    const billData = {
      billNo: tab.billNo,
      customerName: tab.customerName,
      customerPhone: tab.customerPhone,
      language: tab.selectedLanguage,
      paymentMethod: tab.paymentMethod,
      paidAmount: paid,
      balanceDue: balanceDue,
      items: regularItems.map(item => ({
        bill_id: item.bill_id,
        product_id: item.product_id,
        productName: item.productName,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice)
      })),
      dueItems: dueItems.map(item => ({
        productName: item.productName,
        amount: parseFloat(item.totalPrice)
      })),
      totalAmount: grandTotal,
      date: new Date().toISOString(),
      createdBy: userId
    };
    
    console.log("💾 Saving bill with userId:", userId);
    console.log("Bill data:", billData);
    
    try {
      const res = await fetch("http://localhost:5000/api/bills/bills", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(billData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        toast.error(`❌ ${data.error}`);
        return false;
      }
      
      if (data.billId) {
        try {
          await fetch(`http://localhost:5000/api/bills/bills/${data.billId}/payment`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              paidAmount: paid,
              balanceDue: balanceDue,
              paymentMethod: tab.paymentMethod
            })
          });
          console.log("Payment updated in database");
        } catch (paymentError) {
          console.error("Failed to update payment:", paymentError);
        }
      }
      
      toast.success("✅ Bill saved successfully!");
      setLatestBillNo(tab.billNo);
      
      await fetchCustomers();
      
      updateTab(tabId, { isSaved: true });
      
      return true;
      
    } catch (err) {
      console.error("Save bill error:", err);
      toast.error("Failed to save bill: " + err.message);
      return false;
    }
  };

  const handlePrint = async (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    if (!hasRegularItems(tab.billItems)) {
      toast.error("Add purchase items before printing!");
      return;
    }
    
    if (!tab.customerName.trim()) {
      toast.error("Please enter customer name!");
      return;
    }
    
    const saved = await handleSaveBill(tabId);
    if (!saved) {
      return;
    }
    
    for (let i = 0; i < tab.printCopies; i++) {
      setTimeout(() => {
        const printContent = generatePrintContent(tab);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }, i * 500);
    }
    toast.success(`Bill saved and printed ${tab.printCopies} copies!`);
    
    updateTab(tabId, {
      billItems: [],
      nextBillId: 1,
      customerName: "",
      customerPhone: "",
      selectedLanguage: "en",
      paymentMethod: "Cash",
      paidAmount: "",
      showPaymentModal: false,
      printCopies: 1,
      tamilTranslations: {},
      isSaved: false,
      balanceDue: 0,
      previousDueAmount: 0,
      showDueAlert: false,
      pendingDueCustomer: null,
      purchaseTotal: 0,
      totalDue: 0
    });
  };

  const generatePrintContent = (tab) => {
    const grandTotal = calculateGrandTotal(tab.billItems);
    const paid = parseFloat(tab.paidAmount) || 0;
    const due = tab.balanceDue || 0;
    const change = paid > grandTotal ? paid - grandTotal : 0;
    
    const regularItems = tab.billItems.filter(item => !item.isDueItem);
    const dueItems = tab.billItems.filter(item => item.isDueItem);
    
    const sortedItems = [...regularItems].sort((a, b) => {
      const catA = a.categoryName || 'ZZZ';
      const catB = b.categoryName || 'ZZZ';
      return catA.localeCompare(catB);
    });

    return `<!DOCTYPE html><html><head><title>Bill #${tab.billNo}</title><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');body{font-family:Arial,sans-serif;margin:20px;line-height:1.4}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #333;padding-bottom:15px}.shop-name{font-size:28px;font-weight:bold;margin-bottom:10px;color:#2c5530}.bill-info{margin-bottom:20px;background:#f8f9fa;padding:15px;border-radius:8px}.bill-table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px}.bill-table th,.bill-table td{border:1px solid #000;padding:10px 8px;text-align:left}.bill-table th{background-color:#2c5530;color:white;font-weight:bold;text-align:center}.total-row{font-weight:bold;background-color:#e9ecef}.due-row{background-color:#fff3cd;font-weight:bold}.footer{text-align:center;margin-top:30px;border-top:2px solid #333;padding-top:15px}.payment-info{margin:15px 0;padding:12px;background:#e7f3ff;border-radius:6px;border-left:4px solid #007bff}.tamil-text{font-family:'Noto Sans Tamil',sans-serif;font-size:18px;font-weight:500}.tamil-heading{font-family:'Noto Sans Tamil',sans-serif;font-size:22px;font-weight:700}</style></head><body><div class="header"><div class="shop-name ${tab.selectedLanguage==='ta'?'tamil-heading':''}">${tab.selectedLanguage==='ta'?'கடை':'Stores'}</div><div><strong>${tab.selectedLanguage==='ta'?'பில் எண்:':'Bill No:'}</strong> #${tab.billNo}</div><div><strong>${tab.selectedLanguage==='ta'?'தேதி:':'Date:'}</strong> ${getCurrentDate()}</div></div><div class="bill-info"><div class="${tab.selectedLanguage==='ta'?'tamil-text':''}"><strong>${tab.selectedLanguage==='ta'?'வாடிக்கையாளர்:':'Customer:'}</strong> ${tab.customerName}</div><div><strong>${tab.selectedLanguage==='ta'?'தொலைபேசி:':'Phone:'}</strong> ${tab.customerPhone}</div></div><table class="bill-table"><thead><tr><th>${tab.selectedLanguage==='ta'?'எண்':'S.No'}</th><th>${tab.selectedLanguage==='ta'?'பொருள்':'Product'}</th><th>${tab.selectedLanguage==='ta'?'அளவு':'Qty'}</th><th>${tab.selectedLanguage==='ta'?'விலை':'Price'}</th><th>${tab.selectedLanguage==='ta'?'மொத்தம்':'Total'}</th></tr></thead><tbody>${sortedItems.map((item,index)=>`<tr><td style="text-align:center;">${index+1}</td><td class="${tab.selectedLanguage==='ta'?'tamil-text':''}">${tab.selectedLanguage==='ta'?(translationCache[item.productName]||item.productName):item.productName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td><td style="text-align:right;">₹${parseFloat(item.totalPrice).toFixed(2)}</td></tr>`).join('')}${dueItems.map((item,index)=>`<tr class="due-row"><td style="text-align:center;">${sortedItems.length+index+1}</td><td class="${tab.selectedLanguage==='ta'?'tamil-text':''}">${item.displayName}</td><td style="text-align:center;">${item.quantity}</td><td style="text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td><td style="text-align:right;">₹${parseFloat(item.totalPrice).toFixed(2)}</td></tr>`).join('')}<tr class="total-row"><td colspan="4" style="text-align:right;">${tab.selectedLanguage==='ta'?'மொத்த தொகை:':'Grand Total:'}</td><td style="text-align:right;">₹${grandTotal.toFixed(2)}</td></tr></tbody></table>${paid>0||due>0?`<div class="payment-info">${paid>0?`<div><strong>${tab.selectedLanguage==='ta'?'செலுத்திய தொகை:':'Paid:'}</strong> ₹${paid.toFixed(2)}</div>`:''}${due>0?`<div><strong>${tab.selectedLanguage==='ta'?'நிலுவை:':'Due:'}</strong> ₹${due.toFixed(2)}</div>`:''}${change>0?`<div><strong>${tab.selectedLanguage==='ta'?'மீதம்:':'Change:'}</strong> ₹${change.toFixed(2)}</div>`:''}</div>`:''}<div class="footer"><div class="${tab.selectedLanguage==='ta'?'tamil-heading':''}">${tab.selectedLanguage==='ta'?'நன்றி! மீண்டும் வருக!':'Thank you! Visit again!'}</div></div></body></html>`;
  };

  const getChangeAmount = (tab) => {
    const totalDue = calculateTotalDue(tab);
    const paid = parseFloat(tab.paidAmount) || 0;
    return paid > totalDue ? paid - totalDue : 0;
  };

  const getDisplayProductName = (tab, product) => {
    if (tab.selectedLanguage === 'ta' && translationCache[product.productName]) {
      return translationCache[product.productName];
    }
    return product.productName;
  };

  const getDisplayNameForItem = (tab, item) => {
    return item.displayName || item.productName || "";
  };

  const activeTabData = getActiveTab();

  useEffect(() => {
    if (isInitialized && tabs.length === 0) {
      console.log("Initializing first tab");
      createNewTab();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (userId) {
      console.log("✅ Billing component loaded with userId:", userId);
    } else {
      console.warn("⚠️ Billing component loaded WITHOUT userId!");
    }
  }, [userId]);

  return (
    <div className="p-6 font-[Poppins]" ref={billingContainerRef}>
      <Toaster position="top-right" />
      
      <style>{`
        .table-container{overflow:visible!important}
        .dropdown-cell{position:static!important;overflow:visible!important}
        .product-dropdown{position:absolute!important;z-index:9999!important;background:white;border:1px solid #d1d5db;border-radius:6px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05);max-height:200px;overflow-y:auto;min-width:300px}
        .category-header{background:#f3f4f6;padding:8px 12px;font-weight:600;font-size:13px;color:#374151;border-bottom:2px solid #e5e7eb;position:sticky;top:0;z-index:1}
        .tamil-ui-text{font-family:'Noto Sans Tamil','Arial Unicode MS',sans-serif;font-size:16px;font-weight:500}
        .due-item{background-color:#fff3cd!important;font-weight:bold}
        .due-item input{background-color:transparent;border:none;font-weight:bold;color:#856404}
        .animate-slide-in{animation:slideInRight 0.3s ease-out}
        @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>

      {activeTabData?.showDueAlert && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-white rounded-lg shadow-2xl border-l-4 border-orange-500 w-96">
            <div className="bg-orange-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-lg">Due Amount Alert!</h3>
              </div>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Customer:</strong> {activeTabData.pendingDueCustomer?.customerName}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Phone:</strong> {activeTabData.pendingDueCustomer?.phone}
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <div className="text-center">
                    <div className="text-sm text-orange-700 font-semibold mb-1">Previous Due Amount</div>
                    <div className="text-3xl font-bold text-orange-600">
                      ₹{activeTabData.previousDueAmount?.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                  <p className="mb-2">
                    <strong>Note:</strong> This amount will be added to the current purchase.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDueAmountConfirmation(activeTab, false)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Skip
                </button>
                <button
                  onClick={() => handleDueAmountConfirmation(activeTab, true)}
                  className="flex-1 bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Add Due Amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center bg-gray-100 border-b border-gray-300 mb-6 rounded-t-lg">
        <div className="flex flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center px-4 py-3 border-r border-gray-300 cursor-pointer min-w-32 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white border-t-2 border-t-teal-500 text-teal-600 font-semibold' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="flex-1 truncate mr-2">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="text-gray-500 hover:text-red-600 text-lg font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-100"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="px-4 py-3 bg-teal-500 text-white hover:bg-teal-600 transition-colors font-semibold"
        >
          +
        </button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-700">Language / மொழி:</span>
          <button
            onClick={() => activeTabData && handleLanguageChange(activeTab, 'en')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTabData?.selectedLanguage === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
            }`}
          >
            English
          </button>
          <button
            onClick={() => activeTabData && handleLanguageChange(activeTab, 'ta')}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTabData?.selectedLanguage === 'ta' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
            }`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {activeTabData?.showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Payment - {activeTabData.name}</h3>
            
            <div className="mb-4 space-y-2">
              {activeTabData.previousDueAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600">Previous Due:</span>
                  <span className="font-semibold">₹{activeTabData.previousDueAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Current Purchase:</span>
                <span className="font-semibold">₹{activeTabData.purchaseTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-teal-600">Total Amount:</span>
                <span className="text-teal-600">₹{activeTabData.totalDue?.toFixed(2)}</span>
              </div>
            </div>

            {(activeTabData.paymentMethod === "Cash" || activeTabData.paymentMethod === "Credit") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter paid amount:</label>
                <input
                  type="number"
                  value={activeTabData.paidAmount}
                  onChange={(e) => updateTab(activeTab, { paidAmount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="mb-4 space-y-2">
              {activeTabData.paymentMethod === "Cash" && activeTabData.paidAmount && (
                <>
                  <div className="text-green-600 font-semibold">
                    Change: ₹{getChangeAmount(activeTabData).toFixed(2)}
                  </div>
                  {activeTabData.balanceDue > 0 && (
                    <div className="text-orange-600 font-semibold">
                      Balance Due: ₹{activeTabData.balanceDue.toFixed(2)}
                    </div>
                  )}
                </>
              )}
              {activeTabData.paymentMethod === "Credit" && activeTabData.paidAmount && (
                <div className="text-orange-600 font-semibold">
                  Balance Due: ₹{activeTabData.balanceDue?.toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => updateTab(activeTab, { showPaymentModal: false })}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => processPayment(activeTab)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTabData && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-teal-600">Billing System - {activeTabData.name}</h1>
              <div className="text-right">
                <div className="text-lg font-bold text-teal-600">Bill No: #{activeTabData.billNo}</div>
                <div className="text-sm text-gray-600">Date: <span className="font-semibold">{getCurrentDate()}</span></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone:</label>
                <input
                  type="tel"
                  value={activeTabData.customerPhone}
                  onChange={(e) => handleCustomerPhoneChange(activeTab, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter 10-digit phone"
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name:</label>
                <input
                  type="text"
                  value={activeTabData.customerName}
                  onChange={(e) => updateTab(activeTab, { customerName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language:</label>
                <select
                  value={activeTabData.selectedLanguage}
                  onChange={(e) => handleLanguageChange(activeTab, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method:</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input type="radio" name={`paymentMethod-${activeTab}`} value="Cash" checked={activeTabData.paymentMethod === "Cash"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
                    <span className="text-sm">Cash</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name={`paymentMethod-${activeTab}`} value="Credit" checked={activeTabData.paymentMethod === "Credit"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
                    <span className="text-sm">Credit</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name={`paymentMethod-${activeTab}`} value="GPay" checked={activeTabData.paymentMethod === "GPay"} onChange={(e) => updateTab(activeTab, { paymentMethod: e.target.value })} className="mr-1"/>
                    <span className="text-sm">GPay</span>
                  </label>
                </div>
              </div>
            </div>

            {(activeTabData.paidAmount > 0 || activeTabData.balanceDue > 0) && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeTabData.paidAmount > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-blue-600">Paid Amount</div>
                      <div className="text-lg font-bold text-blue-700">₹{parseFloat(activeTabData.paidAmount).toFixed(2)}</div>
                    </div>
                  )}
                  {activeTabData.balanceDue > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-orange-600">Balance Due</div>
                      <div className="text-lg font-bold text-orange-700">₹{activeTabData.balanceDue.toFixed(2)}</div>
                    </div>
                  )}
                  {getChangeAmount(activeTabData) > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-green-600">Change</div>
                      <div className="text-lg font-bold text-green-700">₹{getChangeAmount(activeTabData).toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-4 flex-wrap justify-end">
              <button onClick={() => handleAddRow(activeTab)} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors">+ Add Item</button>
              <button onClick={() => handlePayment(activeTab)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Process Payment</button>
              <div className="flex items-center gap-2">
                <select value={activeTabData.printCopies} onChange={(e) => updateTab(activeTab, { printCopies: parseInt(e.target.value) })} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {[1, 2, 3].map(num => (<option key={num} value={num}>{num} copies</option>))}
                </select>
                <button onClick={() => handlePrint(activeTab)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold">Save & Print</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="table-container">
              <table className="w-full border-collapse">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="border border-teal-600 p-3 text-left">S.No</th>
                    <th className="border border-teal-600 p-3 text-left">Product Name</th>
                    <th className="border border-teal-600 p-3 text-center">Quantity</th>
                    <th className="border border-teal-600 p-3 text-center">Unit Price (₹)</th>
                    <th className="border border-teal-600 p-3 text-center">Total Price (₹)</th>
                    <th className="border border-teal-600 p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTabData.billItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="border border-gray-300 p-8 text-center text-gray-500 text-lg">
                        No items added yet. Click 'Add Item' to start billing.
                      </td>
                    </tr>
                  ) : (
                    activeTabData.billItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 ${item.isDueItem ? 'due-item' : ''}`}>
                        <td className="border border-gray-300 p-3 text-center font-medium">{item.bill_id}</td>
                        
                        <td className="border border-gray-300 p-3 dropdown-cell" style={{position:'relative',overflow:'visible'}}>
                          {item.isDueItem ? (
                            <div className={`font-bold ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}>{item.displayName}</div>
                          ) : (
                            <div style={{position:'relative',zIndex:activeTabData.billItems.length-activeTabData.billItems.findIndex(i=>i.id===item.id)+100}}>
                              {item.categoryName && (
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.categoryName}</span>
                                </div>
                              )}
                              <input
                                type="text"
                                value={getDisplayNameForItem(activeTabData, item)}
                                onChange={(e) => handleChange(activeTab, item.id, 'productName', e.target.value)}
                                onFocus={() => handleProductFocus(activeTab, item.id)}
                                onBlur={() => handleProductBlur(activeTab, item.id)}
                                className={`w-full border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}
                                placeholder={activeTabData.selectedLanguage === 'ta' ? "தயாரிப்பு தேடு..." : "Search product..."}
                                autoComplete="off"
                              />

                              {item.showProductDropdown && item.filteredProducts && item.filteredProducts.length > 0 && (
                                <div className="product-dropdown" style={{position:'absolute',top:'100%',left:'0',right:'0',zIndex:9999,marginTop:'4px'}}>
                                  {(() => {
                                    const grouped = {};
                                    item.filteredProducts.forEach(prod => {
                                      const cat = prod.categoryName || 'Other';
                                      if (!grouped[cat]) grouped[cat] = [];
                                      grouped[cat].push(prod);
                                    });
                                    
                                    return Object.entries(grouped).map(([category, prods]) => (
                                      <div key={category}>
                                        <div className="category-header">{category}</div>
                                        {prods.map((product, idx) => (
                                          <div
                                            key={product.product_id || idx}
                                            className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-left"
                                            style={{borderBottom:'1px solid #f3f4f6'}}
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              handleProductSelect(activeTab, item.id, product);
                                            }}
                                          >
                                            <div className={`font-medium text-sm ${activeTabData.selectedLanguage === 'ta' ? 'tamil-ui-text' : ''}`}>
                                              {getDisplayProductName(activeTabData, product)} - ₹{product.unitPrice}
                                            </div>
                                            {activeTabData.selectedLanguage === 'ta' && (
                                              <div className="text-xs text-gray-500 mt-1">{product.productName}</div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="border border-gray-300 p-3">
                          {item.isDueItem ? (
                            <div className="text-center font-bold">{item.quantity}</div>
                          ) : (
                            <input type="number" value={item.quantity} onChange={(e) => handleChange(activeTab, item.id, 'quantity', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Qty" min="0" step="0.01"/>
                          )}
                        </td>

                        <td className="border border-gray-300 p-3">
                          {item.isDueItem ? (
                            <div className="text-center font-bold">₹{parseFloat(item.unitPrice).toFixed(2)}</div>
                          ) : (
                            <input type="number" value={item.unitPrice} onChange={(e) => handleChange(activeTab, item.id, 'unitPrice', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Price" min="0" step="0.01"/>
                          )}
                        </td>

                        <td className="border border-gray-300 p-3 text-center font-semibold">₹{parseFloat(item.totalPrice || 0).toFixed(2)}</td>

                        <td className="border border-gray-300 p-3 text-center">
                          {!item.isDueItem && (
                            <button onClick={() => handleDelete(activeTab, item.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm">Delete</button>
                          )}
                          {item.isDueItem && (
                            <span className="text-xs text-orange-600 font-semibold px-2 py-1 bg-orange-100 rounded">DUE</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  
                  {activeTabData.billItems.length > 0 && (
                    <>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg">
                          {activeTabData.selectedLanguage === 'ta' ? 'மொத்த தொகை:' : 'Grand Total:'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center text-lg text-teal-600 font-bold">₹{calculateGrandTotal(activeTabData.billItems).toFixed(2)}</td>
                        <td className="border border-gray-300 p-3"></td>
                      </tr>
                      
                      {activeTabData.previousDueAmount > 0 && (
                        <tr className="bg-orange-50">
                          <td colSpan="4" className="border border-gray-300 p-3 text-right text-sm text-orange-700">
                            {activeTabData.selectedLanguage === 'ta' ? 'முந்தைய நிலுவை:' : 'Previous Due:'}
                          </td>
                          <td className="border border-gray-300 p-3 text-center text-sm text-orange-700 font-semibold">₹{activeTabData.previousDueAmount.toFixed(2)}</td>
                          <td className="border border-gray-300 p-3"></td>
                        </tr>
                      )}
                      
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan="4" className="border border-gray-300 p-3 text-right text-lg text-blue-700">
                          {activeTabData.selectedLanguage === 'ta' ? 'மொத்த நிலுவை:' : 'Total Amount:'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center text-lg text-blue-700">₹{calculateTotalDue(activeTabData).toFixed(2)}</td>
                        <td className="border border-gray-300 p-3"></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}