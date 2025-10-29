import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";


export default function Purchase() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyerName, setBuyerName] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [savedPurchases, setSavedPurchases] = useState([]);
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);


  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSavedPurchases();
  }, []);


  const fetchSavedPurchases = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/purchases/purchases");
      if (res.ok) {
        const data = await res.json();
        setSavedPurchases(data);
      }
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories");
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
      toast.error("Failed to load products");
    }
  };


  const handleAddRow = () => {
    if (!buyerName.trim()) {
      toast.error("⚠️ Please enter Buyer Name first!");
      return;
    }


    setPurchases([
      ...purchases,
      {
        id: purchases.length + 1,
        category: "",
        product: "",
        hsn: "",
        qty: "",
        rate: "",
        total: 0,
        paid: false,
        showCategoryDropdown: false,
        filteredCategories: categories,
        showProductDropdown: false,
        filteredProducts: [],
      },
    ]);
  };


  const handleChange = (id, field, value) => {
    if (field === "qty" && value !== "") {
      if (!/^\d+$/.test(value)) {
        toast.error("⚠️ Quantity must be a whole number (Ex: 5, 10).");
        return;
      }
    }


    if (field === "rate" && value !== "") {
      if (!/^\d+$/.test(value)) {
        toast.error("⚠️ Unit Rate must be a valid number (Ex: 100, 250).");
        return;
      }
    }


    setPurchases(
      purchases.map((p) => {
        if (p.id === id) {
          const updatedPurchase = { ...p, [field]: value };


          if (field === "category") {
            if (value.trim()) {
              const filtered = categories.filter((cat) =>
                cat.name.toLowerCase().includes(value.toLowerCase())
              );
              updatedPurchase.filteredCategories = filtered;
              updatedPurchase.showCategoryDropdown = filtered.length > 0;
            } else {
              updatedPurchase.filteredCategories = categories;
              updatedPurchase.showCategoryDropdown = categories.length > 0;
            }
            updatedPurchase.product = "";
            updatedPurchase.hsn = "";
            updatedPurchase.rate = "";
            updatedPurchase.total = 0;
            updatedPurchase.filteredProducts = [];
            updatedPurchase.showProductDropdown = false;
          }


          if (field === "product") {
            let categoryProducts = [];
            if (p.category && p.category.trim()) {
              const selectedCategory = categories.find(
                (cat) => cat.name.toLowerCase() === p.category.toLowerCase()
              );


              if (selectedCategory) {
                categoryProducts = products.filter(
                  (prod) =>
                    (prod.categoryId && prod.categoryId === selectedCategory.id) ||
                    (prod.categoryName &&
                      prod.categoryName.toLowerCase() ===
                        selectedCategory.name.toLowerCase()) ||
                    (prod.category &&
                      prod.category.toLowerCase() ===
                        selectedCategory.name.toLowerCase())
                );
              }
            } else {
              categoryProducts = products;
            }


            if (value.trim()) {
              const filtered = categoryProducts.filter(
                (prod) =>
                  (prod.productName &&
                    prod.productName
                      .toLowerCase()
                      .includes(value.toLowerCase())) ||
                  (prod.name &&
                    prod.name.toLowerCase().includes(value.toLowerCase()))
              );
              updatedPurchase.filteredProducts = filtered;
              updatedPurchase.showProductDropdown = filtered.length > 0;
            } else {
              updatedPurchase.filteredProducts = categoryProducts;
              updatedPurchase.showProductDropdown = categoryProducts.length > 0;
            }
          }


          if (field === "qty" || field === "rate") {
            const qty =
              field === "qty" ? Number(value) || 0 : Number(p.qty) || 0;
            const rate =
              field === "rate" ? Number(value) || 0 : Number(p.rate) || 0;
            updatedPurchase.total = qty * rate;
          }


          return updatedPurchase;
        }
        return p;
      })
    );
  };


  const handleCategorySelect = (purchaseId, selectedCategory) => {
    setPurchases(
      purchases.map((p) => {
        if (p.id === purchaseId) {
          const categoryProducts = products.filter(
            (prod) =>
              (prod.categoryId && prod.categoryId === selectedCategory.id) ||
              (prod.categoryName &&
                prod.categoryName.toLowerCase() ===
                  selectedCategory.name.toLowerCase()) ||
              (prod.category &&
                prod.category.toLowerCase() ===
                  selectedCategory.name.toLowerCase())
          );


          return {
            ...p,
            category: selectedCategory.name,
            showCategoryDropdown: false,
            filteredCategories: [],
            product: "",
            hsn: "",
            rate: "",
            total: 0,
            filteredProducts: categoryProducts,
            showProductDropdown: false,
          };
        }
        return p;
      })
    );
  };


  const handleProductSelect = (purchaseId, selectedProduct) => {
    setPurchases(
      purchases.map((p) => {
        if (p.id === purchaseId) {
          const productName =
            selectedProduct.productName || selectedProduct.name || "";
          const hsnCode = selectedProduct.hsnCode || selectedProduct.hsn || "";


          return {
            ...p,
            product: productName,
            hsn: hsnCode,
            rate: "",
            total: 0,
            showProductDropdown: false,
            filteredProducts: [],
          };
        }
        return p;
      })
    );
  };


  const handleCategoryFocus = (purchaseId) => {
    setPurchases(
      purchases.map((p) => {
        if (p.id === purchaseId) {
          return {
            ...p,
            showCategoryDropdown: true,
            filteredCategories: categories,
          };
        }
        return p;
      })
    );
  };


  const handleProductFocus = (purchaseId) => {
    setPurchases(
      purchases.map((p) => {
        if (p.id === purchaseId) {
          let productsToShow = [];
         
          if (p.category && p.category.trim()) {
            const selectedCategory = categories.find(cat =>
              cat.name.toLowerCase() === p.category.toLowerCase()
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
            ...p,
            showProductDropdown: productsToShow.length > 0,
            filteredProducts: productsToShow,
          };
        }
        return p;
      })
    );
  };


  const handleCategoryBlur = (purchaseId) => {
    setTimeout(() => {
      setPurchases(prev =>
        prev.map((p) => {
          if (p.id === purchaseId) {
            return {
              ...p,
              showCategoryDropdown: false,
            };
          }
          return p;
        })
      );
    }, 200);
  };


  const handleProductBlur = (purchaseId) => {
    setTimeout(() => {
      setPurchases(prev =>
        prev.map((p) => {
          if (p.id === purchaseId) {
            return {
              ...p,
              showProductDropdown: false,
            };
          }
          return p;
        })
      );
    }, 200);
  };


  const handleBlur = (id, field, value) => {
    const normalized = parseInt(value, 10) || 0;
    setPurchases(
      purchases.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: normalized,
              total:
                field === "qty" || field === "rate"
                  ? (field === "qty" ? normalized : Number(p.qty) || 0) *
                    (field === "rate" ? normalized : Number(p.rate) || 0)
                  : p.total,
            }
          : p
      )
    );
  };


  const handleDelete = (id) => {
    setPurchases(purchases.filter((p) => p.id !== id));
    toast.success("🗑️ Row deleted successfully");
  };


  const savePurchase = async () => {
    if (!buyerName.trim()) {
      toast.error("⚠️ Please enter Buyer Name!");
      return;
    }


    if (purchases.length === 0) {
      toast.error("⚠️ Please add at least one product!");
      return;
    }


    const validItems = purchases.filter(p =>
      p.product && p.qty && p.rate && p.total > 0
    );


    if (validItems.length === 0) {
      toast.error("⚠️ No valid items to save!");
      return;
    }


    const purchaseData = {
      date: date,
      buyer: buyerName,
      items: validItems.map(item => ({
        category: item.category,
        product: item.product,
        hsn: item.hsn,
        qty: item.qty,
        rate: item.rate,
        total: item.total
      })),
      total: validItems.reduce((sum, item) => sum + item.total, 0)
    };


    try {
      const response = await fetch('http://localhost:5000/api/purchases/save-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
     
      if (!response.ok) throw new Error('Failed to save purchase');
     
      const result = await response.json();
      toast.success(`✅ Purchase saved successfully! ID: ${result.purchaseId}`);
     
      fetchSavedPurchases();
     
      setPurchases([]);
      setBuyerName("");
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error("❌ Failed to save purchase: " + error.message);
    }
  };

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Verify and Save Payment after Razorpay success
  const verifyAndSavePayment = async (razorpayResponse, orderData) => {
    setProcessingPayment(true);

    try {
      // Verify payment signature
      const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error('Payment verification failed');
      }

      // Save purchase with paid status
      const purchaseData = {
        date: date,
        buyer: buyerName,
        items: purchases.filter(p => p.product && p.qty && p.rate && p.total > 0)
          .map(item => ({
            category: item.category,
            product: item.product,
            hsn: item.hsn,
            qty: item.qty,
            rate: item.rate,
            total: item.total
          })),
        total: purchases.reduce((sum, p) => sum + p.total, 0),
        paid: true
      };

      const saveResponse = await fetch('http://localhost:5000/api/purchases/save-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });

      if (!saveResponse.ok) throw new Error('Failed to save purchase');

      const result = await saveResponse.json();

      setProcessingPayment(false);
      
      // Show success message
      toast.success(`✅ Payment Successful! Purchase ID: ${result.purchaseId}`);
      
      // Reset form
      fetchSavedPurchases();
      setPurchases([]);
      setBuyerName("");
      setDate(new Date().toISOString().split('T')[0]);
      setShowOnlinePayment(false);

    } catch (error) {
      setProcessingPayment(false);
      toast.error("❌ Payment failed: " + error.message);
    }
  };

  // Initiate Razorpay Payment (New Purchase)
  const initiateRazorpayPayment = async () => {
    setProcessingPayment(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const totalAmount = purchases.reduce((sum, p) => sum + p.total, 0);

      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          buyerName: buyerName
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      setProcessingPayment(false);

      // Razorpay checkout options
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Purchase Payment',
        description: `Payment for ${buyerName}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          await verifyAndSavePayment(response, orderData.order);
        },
        prefill: {
          name: buyerName,
          email: '',
          contact: ''
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setProcessingPayment(false);
      toast.error("❌ Payment initialization failed: " + error.message);
    }
  };

  // Initiate Razorpay Payment for Existing Purchase
  const initiateExistingPurchasePayment = async () => {
    if (!selectedPurchase || !selectedPurchase.id) {
      toast.error("⚠️ Invalid purchase selected!");
      return;
    }

    setProcessingPayment(true);
    setShowPayment(false);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:5000/api/payment/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPurchase.total_amount,
          purchaseId: selectedPurchase.id,
          buyerName: selectedPurchase.buyer_name
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Order creation failed');
      }

      setProcessingPayment(false);

      // Razorpay checkout options
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Purchase Payment',
        description: `Payment for Purchase #${selectedPurchase.id}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          await verifyExistingPurchasePayment(response);
        },
        prefill: {
          name: selectedPurchase.buyer_name,
          email: '',
          contact: ''
        },
        theme: {
          color: '#14b8a6'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            setShowPaymentReceipt(true);
            toast.error('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setProcessingPayment(false);
      setShowPaymentReceipt(true);
      toast.error("❌ Payment initialization failed: " + error.message);
    }
  };

  // Verify existing purchase payment
  const verifyExistingPurchasePayment = async (razorpayResponse) => {
    setProcessingPayment(true);

    try {
      // Verify payment signature
      const verifyResponse = await fetch('http://localhost:5000/api/payment/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error('Payment verification failed');
      }

      // Mark purchase as paid
      const markPaidResponse = await fetch(`http://localhost:5000/api/purchases/mark-paid/${selectedPurchase.id}`, {
        method: 'POST'
      });

      if (!markPaidResponse.ok) throw new Error('Failed to update purchase status');

      setProcessingPayment(false);
      toast.success("✅ Payment Successful!");
      fetchSavedPurchases();
      setShowPaymentReceipt(true);

    } catch (error) {
      setProcessingPayment(false);
      toast.error("❌ Payment failed: " + error.message);
      setShowPaymentReceipt(true);
    }
  };


  const handleOnlinePayment = () => {
    if (!buyerName.trim()) {
      toast.error("⚠️ Please enter Buyer Name first!");
      return;
    }


    if (purchases.length === 0) {
      toast.error("⚠️ Please add at least one product!");
      return;
    }


    const validItems = purchases.filter(p => p.product && p.qty && p.rate && p.total > 0);


    if (validItems.length === 0) {
      toast.error("⚠️ No valid items for payment!");
      return;
    }


    setPurchases(prev => prev.map(p => ({
      ...p,
      showCategoryDropdown: false,
      showProductDropdown: false,
      filteredCategories: [],
      filteredProducts: []
    })));


    setShowOnlinePayment(true);
  };


  const processOnlinePayment = async () => {
    setShowOnlinePayment(false);
    await initiateRazorpayPayment();
  };


  const showReceipt = () => {
    setShowPaymentReceipt(true);
  };


  const closeReceipt = () => {
    setShowPaymentReceipt(false);
  };

  const viewPurchaseDetails = async (purchaseId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/purchases/purchase/${purchaseId}`);
      if (res.ok) {
        const data = await res.json();
        setViewingPurchase(data);
        setShowPurchaseDetails(true);
      } else {
        toast.error("Failed to fetch purchase details");
      }
    } catch (err) {
      console.error("Error fetching purchase details:", err);
      toast.error("Failed to load purchase details");
    }
  };

  const closePurchaseDetails = () => {
    setShowPurchaseDetails(false);
    setViewingPurchase(null);
  };

  const printIndividualReceipt = async (purchase) => {
    try {
      const res = await fetch(`http://localhost:5000/api/purchases/purchase/${purchase.id}`);
      if (!res.ok) {
        toast.error("Failed to fetch purchase details");
        return;
      }
      
      const fullPurchase = await res.json();
      
      const printWindow = window.open('', '_blank');
      const items = fullPurchase.items || [];
      
      const itemsHTML = items.map((item, index) => `
        <tr>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
          <td style="border: 1px solid #000; padding: 8px;">${item.category || '-'}</td>
          <td style="border: 1px solid #000; padding: 8px; font-weight: 600;">${item.product}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.hsn || '-'}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.qty}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right;">₹${item.rate}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; color: #0d9488;">₹${item.total}</td>
        </tr>
      `).join('');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Purchase Receipt - ${fullPurchase.buyer_name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              padding: 20px;
              background: white;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0d9488;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #0d9488;
              font-size: 28px;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
              background: #f0fdfa;
              padding: 15px;
              border-radius: 8px;
            }
            .info-item {
              padding: 8px;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            .status-pending {
              background: #fee2e2;
              color: #991b1b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #0d9488;
              color: white;
              padding: 12px 8px;
              text-align: left;
              border: 1px solid #000;
              font-size: 14px;
            }
            td {
              border: 1px solid #000;
              padding: 8px;
              font-size: 13px;
            }
            .total-row {
              background: #f3f4f6;
              font-weight: bold;
            }
            .grand-total {
              font-size: 24px;
              color: #0d9488;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>📋 PURCHASE RECEIPT</h1>
              <p>Transaction Details</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Receipt ID</div>
                <div class="info-value">#${fullPurchase.id}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Purchase Date</div>
                <div class="info-value">${new Date(fullPurchase.purchase_date).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Buyer Name</div>
                <div class="info-value">${fullPurchase.buyer_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Status</div>
                <div class="info-value">
                  <span class="status-badge ${fullPurchase.paid ? 'status-paid' : 'status-pending'}">
                    ${fullPurchase.paid ? '✓ PAID' : '⏳ PENDING'}
                  </span>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">S.No</th>
                  <th>Category</th>
                  <th>Product Name</th>
                  <th style="width: 100px;">HSN Code</th>
                  <th style="width: 80px; text-align: right;">Qty</th>
                  <th style="width: 100px; text-align: right;">Rate</th>
                  <th style="width: 120px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr class="total-row">
                  <td colspan="6" style="text-align: right; padding: 12px;">Grand Total:</td>
                  <td style="text-align: right; padding: 12px;">
                    <span class="grand-total">₹${fullPurchase.total_amount}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Printed on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (err) {
      console.error("Error printing receipt:", err);
      toast.error("Failed to print receipt");
    }
  };


  if (showPurchaseDetails && viewingPurchase) {
    return (
      <div className="p-6 font-[Poppins] min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#000000',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-teal-600">📋 Purchase Details</h1>
            <button
              onClick={closePurchaseDetails}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 bg-teal-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Purchase ID</p>
              <p className="font-bold text-lg">#{viewingPurchase.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-bold text-lg">
                {new Date(viewingPurchase.purchase_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Buyer Name</p>
              <p className="font-bold text-lg">{viewingPurchase.buyer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                viewingPurchase.paid
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {viewingPurchase.paid ? '✓ PAID' : '⏳ PENDING'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Product Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="border-2 border-gray-300 p-3 text-left">S.No</th>
                    <th className="border-2 border-gray-300 p-3 text-left">Category</th>
                    <th className="border-2 border-gray-300 p-3 text-left">Product</th>
                    <th className="border-2 border-gray-300 p-3 text-left">HSN Code</th>
                    <th className="border-2 border-gray-300 p-3 text-right">Quantity</th>
                    <th className="border-2 border-gray-300 p-3 text-right">Rate</th>
                    <th className="border-2 border-gray-300 p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingPurchase.items && viewingPurchase.items.length > 0 ? (
                    viewingPurchase.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border-2 border-gray-300 p-3">{index + 1}</td>
                        <td className="border-2 border-gray-300 p-3">{item.category || '-'}</td>
                        <td className="border-2 border-gray-300 p-3 font-semibold">{item.product}</td>
                        <td className="border-2 border-gray-300 p-3">{item.hsn || '-'}</td>
                        <td className="border-2 border-gray-300 p-3 text-right">{item.qty}</td>
                        <td className="border-2 border-gray-300 p-3 text-right">₹{item.rate}</td>
                        <td className="border-2 border-gray-300 p-3 text-right font-bold text-teal-600">
                          ₹{item.total}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="border-2 border-gray-300 p-4 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan="6" className="border-2 border-gray-300 p-3 text-right font-bold">
                      Grand Total:
                    </td>
                    <td className="border-2 border-gray-300 p-3 text-right font-bold text-2xl text-teal-600">
                      ₹{viewingPurchase.total_amount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              🖨️ Print
            </button>
            <button
              onClick={closePurchaseDetails}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (showPaymentReceipt) {
    const filteredPurchases = savedPurchases.filter(purchase => {
      const searchLower = searchQuery.toLowerCase();
      return (
        purchase.buyer_name?.toLowerCase().includes(searchLower) ||
        purchase.id?.toString().includes(searchLower) ||
        purchase.products?.toLowerCase().includes(searchLower) ||
        purchase.total_amount?.toString().includes(searchLower)
      );
    });

    return (
      <div className="p-6 font-[Poppins] min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#000000',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-teal-600 mb-2">💳 Payment Receipt</h1>
                <p className="text-gray-600">Manage all your purchase transactions</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  🖨️ Print All
                </button>
                <button
                  onClick={closeReceipt}
                  className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search by Buyer Name, ID, Products, or Amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-teal-300 rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 text-lg shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2 ml-2">
                Found {filteredPurchases.length} of {savedPurchases.length} records
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <tr>
                    <th className="border border-teal-400 p-4 text-left font-bold">S.No</th>
                    <th className="border border-teal-400 p-4 text-left font-bold">Date</th>
                    <th className="border border-teal-400 p-4 text-left font-bold">Buyer Name</th>
                    <th className="border border-teal-400 p-4 text-left font-bold">Products</th>
                    <th className="border border-teal-400 p-4 text-left font-bold">Total Amount</th>
                    <th className="border border-teal-400 p-4 text-center font-bold">Status</th>
                    <th className="border border-teal-400 p-4 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="border border-gray-200 p-8 text-center text-gray-500">
                        {searchQuery ? (
                          <div>
                            <p className="text-2xl mb-2">🔍</p>
                            <p className="text-lg font-semibold">No results found for "{searchQuery}"</p>
                            <p className="text-sm mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-2xl mb-2">📋</p>
                            <p className="text-lg font-semibold">No payment records available</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase, index) => (
                      <tr key={purchase.id} className="hover:bg-teal-50 transition-colors duration-150">
                        <td className="border border-gray-200 p-4 font-semibold text-gray-700">{index + 1}</td>
                        <td className="border border-gray-200 p-4">
                          <span className="text-blue-600 font-medium">
                            {new Date(purchase.purchase_date).toLocaleDateString('en-IN')}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-4">
                          <span className="font-semibold text-gray-800">
                            {purchase.buyer_name}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-4 text-gray-600">
                          {purchase.products || "Multiple items"}
                        </td>
                        <td className="border border-gray-200 p-4">
                          <span className="font-bold text-lg text-teal-600">
                            ₹{Number(purchase.total_amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-4 text-center">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold inline-block ${
                            purchase.paid
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {purchase.paid ? '✓ PAID' : '⏳ PENDING'}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-4">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => viewPurchaseDetails(purchase.id)}
                              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-xs font-semibold shadow-md transition-all duration-200 flex items-center gap-1"
                            >
                              👁️ View
                            </button>
                            <button
                              onClick={() => printIndividualReceipt(purchase)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-xs font-semibold shadow-md transition-all duration-200 flex items-center gap-1"
                            >
                              🖨️ Print
                            </button>
                            {!purchase.paid && (
                              <button
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  setShowPayment(true);
                                  setShowPaymentReceipt(false);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-xs font-semibold shadow-md transition-all duration-200 flex items-center gap-1"
                              >
                                💳 Pay Now
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {savedPurchases.length > 0 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">Total Purchases</h3>
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-4xl font-extrabold">{savedPurchases.length}</p>
                    <p className="text-blue-100 text-sm mt-1">All time records</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">Paid Amount</h3>
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-4xl font-extrabold">
                      ₹{savedPurchases.filter(p => p.paid).reduce((sum, p) => sum + Number(p.total_amount), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-green-100 text-sm mt-1">
                      {savedPurchases.filter(p => p.paid).length} transactions
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">Pending Amount</h3>
                      <span className="text-3xl">⏳</span>
                    </div>
                    <p className="text-4xl font-extrabold">
                      ₹{savedPurchases.filter(p => !p.paid).reduce((sum, p) => sum + Number(p.total_amount), 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-red-100 text-sm mt-1">
                      {savedPurchases.filter(p => !p.paid).length} transactions
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  const isModalOpen = showOnlinePayment || showPayment;


  return (
    <div className="p-6 font-[Poppins]">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#000000',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <style jsx>{`
        .table-container {
          overflow: visible !important;
        }
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
        <h2 className="text-2xl font-bold text-teal-600">Purchase Management</h2>
        <button
          onClick={showReceipt}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
        >
          Payment Receipt
        </button>
      </div>


      <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Purchase Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Seller Name
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full border-2 border-teal-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter buyer name (e.g., Janani)"
            />
          </div>
        </div>
      </div>


      <button
        onClick={handleAddRow}
        className="mb-4 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
      >
        + Add Product
      </button>


      <div className="table-container" style={{ overflow: 'visible', position: 'relative' }}>
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="border p-2">S.No</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Product Name</th>
              <th className="border p-2">HSN Code</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Unit Rate</th>
              <th className="border p-2">Total Amount</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="8" className="border p-4 text-center text-gray-500">
                  Enter buyer name and click "+ Add Product" to start
                </td>
              </tr>
            ) : (
              purchases.map((p, index) => (
                <tr key={p.id} className="text-center">
                  <td className="border p-2">{index + 1}</td>
                 
                  <td className="border p-2 dropdown-cell" style={{ position: 'relative', overflow: 'visible' }}>
                    <div style={{ position: 'relative', zIndex: purchases.length - index + 100 }}>
                      <input
                        value={p.category}
                        onChange={(e) => handleChange(p.id, "category", e.target.value)}
                        onFocus={() => !isModalOpen && handleCategoryFocus(p.id)}
                        onBlur={() => handleCategoryBlur(p.id)}
                        className="border px-2 py-1 rounded w-full"
                        placeholder="Category"
                        autoComplete="off"
                      />


                      {!isModalOpen && p.showCategoryDropdown &&
                        p.filteredCategories &&
                        p.filteredCategories.length > 0 && (
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
                            {p.filteredCategories.map((category, idx) => (
                              <div
                                key={category.id || idx}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                style={{
                                  borderBottom: idx < p.filteredCategories.length - 1 ? '1px solid #f3f4f6' : 'none'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleCategorySelect(p.id, category);
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
                    <div style={{ position: 'relative', zIndex: purchases.length - index + 90 }}>
                      <input
                        value={p.product}
                        onChange={(e) => handleChange(p.id, "product", e.target.value)}
                        onFocus={() => !isModalOpen && handleProductFocus(p.id)}
                        onBlur={() => handleProductBlur(p.id)}
                        className="border px-2 py-1 rounded w-full"
                        placeholder="Product name"
                        autoComplete="off"
                      />


                      {!isModalOpen && p.showProductDropdown &&
                        p.filteredProducts &&
                        p.filteredProducts.length > 0 && (
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
                            {p.filteredProducts.map((product, idx) => (
                              <div
                                key={product.id || idx}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                style={{
                                  borderBottom: idx < p.filteredProducts.length - 1 ? '1px solid #f3f4f6' : 'none'
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleProductSelect(p.id, product);
                                }}
                              >
                                <div className="font-semibold">
                                  {product.productName || product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  HSN: {product.hsnCode || product.hsn || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </td>


                  <td className="border p-2">
                    <input
                      value={p.hsn}
                      onChange={(e) => handleChange(p.id, "hsn", e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                      placeholder="HSN"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={p.qty}
                      onChange={(e) => handleChange(p.id, "qty", e.target.value)}
                      onBlur={(e) => handleBlur(p.id, "qty", e.target.value)}
                      className="border px-2 py-1 rounded w-16"
                      placeholder="Qty"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      value={p.rate}
                      onChange={(e) => handleChange(p.id, "rate", e.target.value)}
                      onBlur={(e) => handleBlur(p.id, "rate", e.target.value)}
                      className="border px-2 py-1 rounded w-20"
                      placeholder="Rate"
                    />
                  </td>
                  <td className="border p-2">
                    <span className="font-semibold">₹{p.total}</span>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(p.id)}
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


      {purchases.length > 0 && (
        <div className="mt-4 bg-teal-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">
              Total Items: {purchases.length}
            </span>
            <span className="text-2xl font-bold text-teal-600">
              Grand Total: ₹{purchases.reduce((sum, p) => sum + p.total, 0)}
            </span>
          </div>
        </div>
      )}


      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={savePurchase}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
        >
          💾 Save Purchase
        </button>
       
        <button
          onClick={showReceipt}
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
        >
          👁️ View Records
        </button>
       
        <button
          onClick={handleOnlinePayment}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
        >
          💳 Pay with Razorpay
        </button>
      </div>


      {showOnlinePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[500px]">
            <h3 className="text-2xl font-bold mb-6 text-teal-600 text-center">💳 Payment Confirmation</h3>
           
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-bold">{date}</p>
                </div>
               
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Buyer Name</p>
                  <p className="font-bold">{buyerName}</p>
                </div>
              </div>
             
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-2">Products</p>
                <div className="max-h-32 overflow-y-auto">
                  {purchases.filter(p => p.product && p.qty && p.rate).map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b">
                      <span className="text-sm">{item.product}</span>
                      <span className="text-sm font-semibold">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
             
              <div className="bg-teal-50 p-4 rounded border-2 border-teal-300">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-3xl text-teal-600 text-center">
                  ₹{purchases.reduce((sum, p) => sum + p.total, 0)}
                </p>
              </div>


              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  🔒 Secure payment via Razorpay
                </p>
              </div>
            </div>


            <div className="flex gap-3">
              <button
                onClick={processOnlinePayment}
                className="flex-1 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 font-semibold"
              >
                ✓ Pay Now
              </button>
              <button
                onClick={() => setShowOnlinePayment(false)}
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[10002]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] text-center">
            <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment...</h3>
            <p className="text-gray-600">Please wait while we process your transaction</p>
          </div>
        </div>
      )}

      {showPayment && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-[450px]">
            <h3 className="text-2xl font-bold mb-6 text-teal-600">💳 Payment Details</h3>
           
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Purchase ID</p>
                <p className="font-bold text-lg">#{selectedPurchase.id}</p>
              </div>
             
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Buyer Name</p>
                <p className="font-bold text-lg">{selectedPurchase.buyer_name}</p>
              </div>
             
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">Products</p>
                <p className="font-semibold">{selectedPurchase.products || "Multiple items"}</p>
              </div>
             
              <div className="bg-teal-50 p-4 rounded border-2 border-teal-300">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-3xl text-teal-600">₹{selectedPurchase.total_amount}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-700 text-center">
                  🔒 Secure payment via Razorpay
                </p>
              </div>
            </div>


            <div className="flex gap-3">
              <button
                onClick={initiateExistingPurchasePayment}
                className="flex-1 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 font-semibold"
              >
                ✓ Pay Now
              </button>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setShowPaymentReceipt(true);
                }}
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}