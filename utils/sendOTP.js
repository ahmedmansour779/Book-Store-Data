const nodemailer = require('nodemailer');

const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'cp - opt',
    text: `Your OTP is: ${otp}`,
  });

  return otp;
};

module.exports = { sendOTP };
