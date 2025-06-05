const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.canadacargo.net',        
  port: 465,                           
  secure: true,                      
  auth: {
    user: 'info@canadacargo.net',      
    pass: 'cargodeliveryinfo',         
  },
  tls: {
    rejectUnauthorized: false,      
  },
  debug: true,                        
});

const mailOptions = {
  from: '"Canada cargo" <info@canadacargo.net>',  
  to: 'ajayitamilore@gmail.com',          
  subject: 'Test Email via cPanel SMTP',
  text: 'This is a plain text test email.',
  html: '<b>This is an HTML test email sent using Nodemailer + cPanel SMTP.</b>',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('❌ Error:', error);
  }
  console.log('✅ Email sent:', info.messageId);
});
