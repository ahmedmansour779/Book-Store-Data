const generateSecureHash = require('../utils/generateSecureHash.js');
const createPaymentIntentSchema = require('../utils/validation/PaymentIntentSchema.js');

const createPaymentIntent = async (req, res) => {
  try {
    const validatedData = await createPaymentIntentSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { SecureHash, ActionCode, TxnType, SystemReference, MerchantReference } = validatedData;

    if (process.env.PAYSKY_SECRET !== SecureHash) {
      return res.status(401).json({
        Message: 'Unauthorized',
        Success: false,
      });
    }

    // statnderd service success payment ==> userId , amount , serviceId

    return res.status(200).json({
      Message: 'Success',
      Success: true,
    });
  } catch (error) {
    // Yup validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        Message: 'Validation Failed',
        Success: false,
      });
    }

    console.error('PaySky Notification Error:', error);

    return res.status(500).json({
      Message: 'Internal Server Error',
      Success: false,
    });
  }
};

module.exports = { createPaymentIntent };
