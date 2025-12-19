const yup = require('yup');

const adminSchema = yup.object().shape({
    name: yup.string().required('الاسم مطلوب'),

    phone: yup.string().required('رقم الهاتف مطلوب'),

    email: yup.string().email('يجب إدخال بريد إلكتروني صحيح').required('البريد الإلكتروني مطلوب'),

    password: yup
        .string()
        .required('كلمة المرور مطلوبة')
        .min(8, 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'),
});

const passwordSchema = yup.object({
    password: yup
        .string()
        .required('كلمة المرور مطلوبة')
        .min(8, 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'),
});

module.exports = { adminSchema, passwordSchema };
