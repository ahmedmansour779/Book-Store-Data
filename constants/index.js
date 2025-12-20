const globalMessages = {
  addSuccess: 'تم الاضافه بنجاح',
  editSuccess: 'تم التعديل بنجاح',
  deleteSuccess: 'تم الحذف بنجاح',
  invalidId: 'معرف العنصر غير صحيح',
  notFound: 'لا توجد عناصر',
  titleIsRequire: 'العنوان مطلوب',
  itemsIsRequire: 'العناصر مطلوب',
  contentIsRequire: 'المحتوي مطلوب',
  descriptionIsRequire: 'الوصف مطلوب',
  jobDescriptionIsRequire: 'المسمي الوظيفي مطلوب',
  ratingIsRequire: 'التقيم مطلوب',
  imageIsRequire: 'الصورة مطلوبة',
  urlIsRequire: 'الرابط مطلوب',
  categoryIsRequire: 'التصنيف مطلوب',
  notAddAccessibility: 'ليس لديك صلاحية لاضافة',
  notEditAccessibility: 'ليس لديك صلاحية التعديل',
  notDeleteAccessibility: 'ليس لديك صلاحية الحذف',
  notShowAccessibility: 'ليس لديك صلاحية الوصول',
  errorDeletingImage: 'حدث خطا في حذف الصورة من الخادم',
};

const adminMessages = {
  ...globalMessages,
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
  resetPasswordSuccess: 'تم تغير كلمة المرور بنجاح يمكنك تسجيل الدخول',
  resetPasswordFail: 'البريد الالكتروني او المعرف غير صحيح',
  changeRoleSuccess: 'تم تغير الدور بنجاح',
};

const blogsMessages = {
  ...globalMessages,
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

const jobsMessages = {
  ...globalMessages,
  notAddAccessibility: 'لا يمكنك أضافة وظيفة',
  JobsAddSuccess: 'تم اضافة الوظيفة بنجاح',
  notJobsFound: 'لا توجد وظائف',
  invalidJobId: 'معرف الوظيفة غير صالح',
  JobNotFound: 'الوظيفة غير موجودة',
  notDeleteAccessibility: 'لا يمكنك حذف هذه الوظيفة',
  deleteSuccess: 'تم حذف الوظيفة بنجاح',
  notUpdataAccessibility: 'لا يمكنك تعديل هذه الوظيفة',
  updateSuccess: 'تم تعديل الوظيفة بنجاح',
  applySuccess: 'تم التقديم بنجاح',
  fullName: 'الاسم مطلوب',
  country: 'الدولة مطلوبة',
  state: 'المدينة مطلوبة',
  gender: 'النوع مطلوب',
  email: 'البريد الإلكتروني مطلوب',
  phone: 'رقم الهاتف مطلوب',
  cv: 'السيرة الذاتية مطلوبة',
  employmentType: 'نوع الوظيفة مطلوبة',
  experience: 'الخبرة مطلوبة',
};

const userMessages = {
  nameRequired: 'الاسم مطلوب',
  phoneRequired: 'رقم الهاتف مطلوب',
  subjectRequired: 'الموضوع مطلوب',
  massageRequired: 'الرسالة مطلوب',
  whatsappRequired: 'رقم الواتساب مطلوب',
  emailRequired: 'البريد الإلكتروني مطلوب',
  emailInvalid: 'يجب إدخال بريد Gmail صحيح بدون نقاط قبل @',
  emailExists: 'البريد الإلكتروني مستخدم من قبل',
  passwordRequired: 'كلمة المرور مطلوبة',
  passwordMinLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  favoriteContactRequired: 'طريقة التواصل المفضلة مطلوبة',
  favoriteContactInvalid: 'طريقة التواصل المفضلة غير صحيحة',
  registerSuccess: 'تم تسجيل الحساب بنجاح',
  emailAndPasswordRequired: 'البريد الالكتروني وكلمة السر مطلوبين',
  invalidEmail: 'البريد الالكتروني غير صحيح',
  invalidPassword: 'كلمة المرور غير صحيحة',
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  otpSent: 'تم ارسال رمز التحقق',
  resetPasswordSuccess: 'تم تغير كلمة المرور بنجاح يمكنك تسجيل الدخول',
  resetPasswordFail: 'البريد الالكتروني او المعرف غير صحيح',
  otpExpired: 'رمز التحقق منتهي الصلاحية أو غير موجود',
  invalidOTP: 'رمز التحقق غير صحيح',
  otpVerified: 'تم التحقق من الرمز بنجاح',
  dataFetched: 'تم جلب البيانات بنجاح',
  invalidIUserId: 'معرف الحساب غير صالح',
  updateSuccess: 'تم تحديث البيانات بنجاح',
  notGetAccessibility: 'لا يمكنك الحصول علي البيانات',
  userNotFound: 'لا يوجد مستخدمين',
  notDeleteAccessibility: 'لا يمكنك حذف هذه الحساب',
  deleteSuccess: 'تم حذف الحساب بنجاح',
  typeServiceRequired: 'نوع الخدمة مطلوب',
  serviceDetailsRequired: 'تفاصيل الخدمة مطلوبة',
};

const termsMessages = {
  ...globalMessages,
  notAddAccessibility: 'ليس لديك صلاحية اضافة الشروط',
  notEditAccessibility: 'ليس لديك صلاحية تعديل هذا الشرط',
  mustBeArray: 'يجب ان تكون العناصر علي هيئة مصفوفة بداخلها عناصر نصية',
};

const testimonialsMessages = {
  ...globalMessages,
};

const portfolioMessages = {
  ...globalMessages,
};

const contactMessages = {
  ...globalMessages,
};

const StandardServiceMessages = {
  ...globalMessages,
  priceEgypt: 'السعر المصري مطلوب',
  priceSaudi: 'السعر السعودي مطلوب',
};

const CustomServicesMessages = {
  ...globalMessages,
  justHrAndAdmin: 'فقط موظف العلاقات العامة والمشرف فقط يمكنهم الحصول علي هذة البيانات',
};

module.exports = {
  adminMessages,
  blogsMessages,
  jobsMessages,
  userMessages,
  termsMessages,
  testimonialsMessages,
  portfolioMessages,
  contactMessages,
  StandardServiceMessages,
  CustomServicesMessages,
};
