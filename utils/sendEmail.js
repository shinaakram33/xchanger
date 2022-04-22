// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     secure: false,
//     auth: {
//       user: process.env.USER_EMAIL,
//       pass: process.env.USER_PASSWORD,
//     },
//     tls: { rejectUnauthorized: false },
//   });
//   const mailOptions = {
//     from: 'aqilmanzoor750@gmail.coms',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html:
//   };
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  const mailOptions = {
    from: {
      name: 'X-Changer',
      email: process.env.EMAIL
    }, 
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  await sgMail.send(mailOptions);
};

module.exports = sendEmail
