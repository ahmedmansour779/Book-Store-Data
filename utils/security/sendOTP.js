import { MailtrapClient } from "mailtrap";

export const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const TOKEN = process.env.MAIL_TOKEN;

  const client = new MailtrapClient({
    token: TOKEN,
  });

  const sender = {
    email: "support@cprintagency.com",
    name: "Cprintagency",
  };
  const recipients = [
    {
      email: email,
    },
  ];

  await client.send({
    from: sender,
    to: recipients,
    subject: "cp - opt",
    text: `Your OTP is: ${otp}`,
    category: "OTP",
  });

  return otp;
};
