const nodemailer = require('nodemailer');

// GENELDE GMAIL VESAIRE YERINE BASKA MAIL UYGULAMALARI ILE MAIL GONDERMEK DAHA MANITKLI

// nodemailer ile email göndermek için 3 aşama takip etmemız gerekiyor
const sendEmial = (options) => {
  // 1) CREATE A TRANSPORTER => createTransport() içerisine birkaç option alır => kullanılacak service - authanticaton etc
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // ACTIVATE IN gmail "LESS SECURE app" option
  });
  // 2) DEFINE THE EMAIL OPTIONS
  // 3) ACTUALLY SEND EMAIL
};
