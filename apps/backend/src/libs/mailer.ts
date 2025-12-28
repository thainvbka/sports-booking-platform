import nodemailer from "nodemailer";
import { config } from "../configs";

const transporter = nodemailer.createTransport({
  host: config.MAIL_HOST,
  port: Number(config.MAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASS,
  },
});

export const sendActivationEmail = async (email: string, token: string) => {
  const verificationLink = `${config.CORS_ORIGIN}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Sports Booking Platform" <${config.MAIL_USER}>`,
    to: email,
    subject: "Kích hoạt tài khoản của bạn - Sports Booking Platform",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Chào mừng bạn đến với Sports Booking!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để kích hoạt tài khoản:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Kích hoạt ngay</a>
        <p>Hoặc copy đường dẫn này: ${verificationLink}</p>
        <p><i>Link này sẽ hết hạn sau 24 giờ.</i></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
