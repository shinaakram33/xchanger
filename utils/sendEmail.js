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
