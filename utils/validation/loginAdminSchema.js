import yup from 'yup';

const messages = {
  required: 'هذا الحقل مطلوب',
  email: 'يجب إدخال بريد إلكتروني صحيح',
};

const loginSchema = yup.object().shape({
  email: yup.string().email(messages.email).required(messages.required),

  password: yup.string().required(messages.required),
});

export default loginSchema;
