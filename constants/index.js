const adminMessages = {
  adminExists: 'المسؤول مسجل بالفعل',
  adminNotFound: 'البريد الإلكتروني غير مسجل',
  invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  registrationSuccess: 'تم التسجيل بنجاح',
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  emailRequired: 'البريد الإلكتروني مطلوب',
  emailNotFound: 'البريد الإلكتروني غير مسجل',
  otpSent: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
  otpExpired: 'رمز التحقق منتهي الصلاحية أو غير موجود',
  invalidOTP: 'رمز التحقق غير صحيح',
  otpVerified: 'تم التحقق من الرمز بنجاح',
  dataFetched: 'تم جلب البيانات بنجاح',
};

const blogsMessages = {
  notAddAccessibility: 'لا يمكنك إضافة مقالة',
  blogAddSuccess: 'تم اضافة المقالة بنجاح',
  notBlogsFound: 'لا توجد مقالات',
  invalidBlogId: 'معرف المقالة غير صالح',
  blogNotFound: 'المقالة غير موجودة',
  notDeleteAccessibility: 'لا يمكنك حذف هذه المقالة',
  deleteSuccess: 'تم حذف المقالة بنجاح',
  notUpdataAccessibility: 'لا يمكنك تعديل هذه المقالة',
  updateSuccess: 'تم تعديل المقالة بنجاح',
};

module.exports = { adminMessages, blogsMessages };
