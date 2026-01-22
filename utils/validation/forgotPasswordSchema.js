import yup from 'yup';

const messages = {
  required: 'هذا الحقل مطلوب',
  email: 'يجب إدخال بريد إلكتروني صحيح',
};

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email(messages.email).required(messages.required),
});

export default forgotPasswordSchema;
