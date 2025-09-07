export const smtpConfig = {
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true si vous utilisez le port 465
};
