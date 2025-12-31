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
  const verificationLink = `${config.CLIENT_URL}/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"T-Sport" <${config.MAIL_USER}>`,
    to: email,
    subject: "Kích hoạt tài khoản của bạn - T-Sport",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Chào mừng bạn đến với T-Sport!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để kích hoạt tài khoản:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Kích hoạt ngay</a>
        <p>Hoặc copy đường dẫn này: ${verificationLink}</p>
        <p><i>Link này sẽ hết hạn sau 24 giờ.</i></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const verificationLink = `${config.CLIENT_URL}/auth/reset-password/${token}`;

  const mailOptions = {
    from: `"T-Sport" <${config.MAIL_USER}>`,
    to: email,
    subject: "Đặt lại mật khẩu - T-Sport",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Yêu cầu đặt lại mật khẩu - T-Sport!</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản trên T-Sport</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu ngay</a>
        <p>Hoặc copy đường dẫn này: ${verificationLink}</p>
        <p><i>Link này sẽ hết hạn sau 15 phút.</i></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
