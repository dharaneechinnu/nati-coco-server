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
    
    res.status(200).json({
      success: true,
      orderId,
      message: 'UPI payment order created successfully'
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
    const { orderId } = req.params;
    
    const payment = await PaymentSchema.findOne({ orderId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
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