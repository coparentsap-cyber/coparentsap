const nodemailer = require("nodemailer")

exports.handler = async function (event, context) {
  try {
    const { to, subject, text } = JSON.parse(event.body)

    // ⚠️ Configure tes identifiants SMTP dans Netlify (SMTP_USER et SMTP_PASS)
    let transporter = nodemailer.createTransport({
      service: "gmail", // tu peux mettre "hotmail", "outlook", etc.
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: \`"Co-Parents" <\${process.env.SMTP_USER}>\`,
      to,
      subject,
      text,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Email envoyé ✅" }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    }
  }
}
