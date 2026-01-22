import yup from 'yup';

const createPaymentIntentSchema = yup.object().shape({
  MerchantId: yup
    .string()
    .min(1, 'MerchantId must be at least 1 character')
    .max(18, 'MerchantId must not exceed 18 characters')
    .required('MerchantId is required'),

  TerminalId: yup
    .string()
    .min(1, 'TerminalId must be at least 1 character')
    .max(8, 'TerminalId must not exceed 8 characters')
    .required('TerminalId is required'),

  SecureHash: yup
    .string()
    .min(20, 'SecureHash must be at least 20 characters')
    .max(250, 'SecureHash must not exceed 250 characters')
    .required('SecureHash is required'),

  // DateTimeLocalTrxn: yup
  //   .string()
  //   .transform((value) => {
  //     return typeof value === 'number' ? String(value) : value;
  //   })
  //   .length(12, 'DateTimeLocalTrxn must be exactly 12 characters')
  //   .matches(/^\d{12}$/, 'DateTimeLocalTrxn must be in format yyyyMMddHHmmss (12 digits)')
  //   .required('DateTimeLocalTrxn is required'),

  Message: yup
    .string()
    .max(250, 'Message must not exceed 250 characters')
    .required('Message is required'),

  TxnType: yup
    .number()
    .integer('TxnType must be an integer')
    .min(1, 'TxnType must be between 1 and 4')
    .max(4, 'TxnType must be between 1 and 4')
    .oneOf([1, 2, 3, 4], 'TxnType must be 1 (Sale), 2 (Refund), 3 (Void Sale), or 4 (Void Refund)')
    .required('TxnType is required'),

  PaidThrough: yup
    .string()
    .min(1, 'PaidThrough must be at least 1 character')
    .max(50, 'PaidThrough must not exceed 50 characters')
    .required('PaidThrough is required'),

  SystemReference: yup
    .string()
    .min(1, 'SystemReference must be at least 1 character')
    .max(14, 'SystemReference must not exceed 14 characters')
    .required('SystemReference is required'),

  Amount: yup
    .string()
    .min(1, 'Amount must be at least 1 character')
    .max(15, 'Amount must not exceed 15 characters')
    .matches(/^\d+$/, 'Amount must contain only digits')
    .required('Amount is required'),

  Currency: yup
    .string()
    .length(3, 'Currency must be exactly 3 characters')
    .matches(/^\d{3}$/, 'Currency must be a 3-digit numeric ISO 4217 code (e.g., "818" for EGP)')
    .required('Currency is required'),

  PayerAccount: yup
    .string()
    .min(10, 'PayerAccount must be at least 10 characters')
    .max(100, 'PayerAccount must not exceed 100 characters')
    .required('PayerAccount is required'),

  // Optional Fields
  NetwrokReference: yup
    .string()
    .max(32, 'NetwrokReference must not exceed 32 characters')
    .optional(),

  MerchantReference: yup
    .string()
    .max(300, 'MerchantReference must not exceed 300 characters')
    .optional(),

  PayerName: yup.string().max(100, 'PayerName must not exceed 100 characters').optional(),

  ActionCode: yup.string().max(3, 'ActionCode must not exceed 3 characters').optional(),

  SID: yup.string().max(200, 'SID must not exceed 200 characters').optional(),

  Token: yup.string().max(200, 'Token must not exceed 200 characters').optional(),
});

export default createPaymentIntentSchema;
