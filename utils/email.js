const nodemailer = require('nodemailer');

// GENELDE GMAIL VESAIRE YERINE BASKA MAIL UYGULAMALARI ILE MAIL GONDERMEK DAHA MANITKLI

// nodemailer ile email göndermek için 3 aşama takip etmemız gerekiyor
const sendEmail = async (options) => {
  // 1) CREATE A TRANSPORTER => createTransport() içerisine birkaç option alır => kullanılacak service - authanticaton etc
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // ACTIVATE IN gmail "LESS SECURE app" option
  });
  // 2) DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: 'Efe Karakanlı <zefek10@gmail.com>',
    to: options.email,
    subject: options.email,
    text: options.message,
  };
  // 3) ACTUALLY SEND EMAIL
  await transporter.sendMail(mailOptions); // this will return a promise so we await it
};

module.exports = sendEmail;
