const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
  });
  const mailOptions = {
    from: 'aqilmanzoor750@gmail.coms',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
