const yup = require('yup');

const messages = {
  required: 'هذا الحقل مطلوب',
  email: 'يجب إدخال بريد إلكتروني صحيح',
  otpLength: 'رمز التحقق يجب أن يكون 6 أرقام',
};

const verifyOTPSchema = yup.object().shape({
  email: yup.string().email(messages.email).required(messages.required),

  otp: yup.string().required(messages.required).length(6, messages.otpLength),
});

module.exports = verifyOTPSchema;
