const express = require('express');
const router = express.Router();

console.log('🔵 Payment router loading...');

// Load Razorpay & Crypto
let Razorpay, crypto;
try {
  Razorpay = require('razorpay');
  crypto = require('crypto');
  console.log('✅ Razorpay module loaded successfully');
} catch (error) {
  console.error('❌ Razorpay module load failed:', error.message);
  console.error('💡 Install: npm install razorpay');
}

// Initialize Razorpay with your credentials
let razorpay;
if (Razorpay) {
  try {
    razorpay = new Razorpay({
      key_id: 'rzp_test_RVfnEKJK8bSncF',
      key_secret: '4QIbXrJCP1wUN22VF3JF0rnM'
    });
    console.log('✅ Razorpay instance created successfully');
  } catch (error) {
    console.error('❌ Razorpay instance failed:', error.message);
  }
}

// Test endpoint - Root level
router.get('/test', (req, res) => {
  console.log('✅ Payment test endpoint hit!');
  res.json({ 
    success: true,
    message: 'Payment router working!',
    timestamp: new Date().toISOString(),
    razorpayStatus: razorpay ? 'initialized' : 'not initialized'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('📍 Payment health check called');
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Payment routes working',
    razorpayLoaded: !!Razorpay,
    razorpayInitialized: !!razorpay,
    timestamp: new Date().toISOString()
  });
});

// CREATE RAZORPAY ORDER
router.post('/create-razorpay-order', async (req, res) => {
  console.log('\n========================================');
  console.log('📥 CREATE RAZORPAY ORDER REQUEST');
  console.log('========================================');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Check if Razorpay is initialized
  if (!Razorpay || !razorpay) {
    console.error('❌ Razorpay not initialized');
    return res.status(500).json({ 
      success: false, 
      error: 'Razorpay not configured. Please install: npm install razorpay' 
    });
  }
  
  try {
    const { amount, purchaseId, buyerName } = req.body;
    
    console.log('📊 Request Data:');
    console.log('  Amount:', amount, typeof amount);
    console.log('  Purchase ID:', purchaseId);
    console.log('  Buyer Name:', buyerName);
    
    // Validate amount
    if (!amount && amount !== 0) {
      console.error('❌ Amount is missing');
      return res.status(400).json({ 
        success: false, 
        error: 'Amount is required' 
      });
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount value: ' + amount 
      });
    }
    
    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(numAmount * 100);
    console.log('💵 Amount in paise:', amountInPaise);
    
    // Create order options
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${purchaseId || Date.now()}`,
      notes: {
        purchaseId: purchaseId ? purchaseId.toString() : 'new',
        buyerName: buyerName || 'Guest',
        createdAt: new Date().toISOString()
      }
    };
    
    console.log('🔄 Creating Razorpay order with options:', JSON.stringify(orderOptions, null, 2));
    
    // Create order with Razorpay
    const order = await razorpay.orders.create(orderOptions);
    
    console.log('✅ ORDER CREATED SUCCESSFULLY!');
    console.log('Order Details:');
    console.log('  Order ID:', order.id);
    console.log('  Amount:', order.amount);
    console.log('  Currency:', order.currency);
    console.log('  Receipt:', order.receipt);
    
    const response = {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key_id: 'rzp_test_RVfnEKJK8bSncF'
    };
    
    console.log('📤 SENDING RESPONSE:');
    console.log(JSON.stringify(response, null, 2));
    console.log('========================================\n');
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ ERROR IN CREATE ORDER');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    if (error.error) {
      console.error('Razorpay Error Details:', JSON.stringify(error.error, null, 2));
    }
    console.error('========================================\n');
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create order',
      details: error.error ? error.error.description : null
    });
  }
});

// VERIFY RAZORPAY PAYMENT
router.post('/verify-razorpay-payment', (req, res) => {
  console.log('\n========================================');
  console.log('📥 VERIFY RAZORPAY PAYMENT REQUEST');
  console.log('========================================');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing payment verification details');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment details' 
      });
    }
    
    // Create signature verification text
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', '4QIbXrJCP1wUN22VF3JF0rnM')
      .update(text)
      .digest('hex');
    
    console.log('🔐 Signature Verification:');
    console.log('  Received Signature:', razorpay_signature);
    console.log('  Expected Signature:', expectedSignature);
    console.log('  Match:', razorpay_signature === expectedSignature);
    
    // Verify signature
    if (razorpay_signature === expectedSignature) {
      console.log('✅ PAYMENT VERIFIED SUCCESSFULLY!');
      console.log('========================================\n');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      console.error('❌ Signature mismatch - Payment verification failed!');
      console.error('========================================\n');
      
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature - verification failed' 
      });
    }
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ VERIFICATION ERROR');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Payment verification failed'
    });
  }
});

// Get payment details by payment ID
router.get('/payment/:paymentId', async (req, res) => {
  const paymentId = req.params.paymentId;
  console.log('📥 Fetching payment details for:', paymentId);
  
  if (!razorpay) {
    return res.status(500).json({ 
      success: false, 
      error: 'Razorpay not initialized' 
    });
  }
  
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('✅ Payment details fetched:', payment.id);
    
    return res.json({ 
      success: true, 
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        email: payment.email,
        contact: payment.contact
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payment:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Logging successful router setup
console.log('✅ Payment routes configured successfully');
console.log('📍 Available Payment Endpoints:');
console.log('  - GET  /api/payment/test');
console.log('  - GET  /api/payment/health');
console.log('  - POST /api/payment/create-razorpay-order');
console.log('  - POST /api/payment/verify-razorpay-payment');
console.log('  - GET  /api/payment/payment/:paymentId');

module.exports = router;