const crypto = require('crypto');
const PaymentSchema = require('../../models/PaymentModels');

const createUpiOrder = async (req, res) => {
  try {
    const { amount, upiId, description } = req.body;
    
    // Generate unique order ID
    const orderId = crypto.randomBytes(16).toString('hex');
    
    // Create payment record
    await PaymentSchema.create({
      orderId,
      amount,
      upiId,
      description,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Something went wrong!" });
      }
      console.log("order",order)
      res.status(200).json({ data: order });
    });
    
  } catch (error) {
    console.error('Error creating UPI order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
   const result=   await PaymentSchema.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status:true,
      });
console.log("result : ",result);
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
    
    res.status(200).json({
      success: true,
      status: payment.status
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, status, transactionId } = req.body;
    
    await PaymentSchema.findOneAndUpdate(
      { orderId },
      {
        status,
        transactionId,
        updatedAt: new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
};

module.exports = {
  createUpiOrder,
  getPaymentStatus,
  updatePaymentStatus
};