const catchAsync = require('./../utils/catchAsync');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split()[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`;
  }
  async newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    console.log('here.................');
    return await nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      // ACTIVATE in gmail "less secure app " option
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../view/emails/${template.toLowerCase()}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html)
    };
    console.log(await this.newTransport().sendMail);
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('Welcome', 'welcome to Natours family');
  }
};
// const sendEmail = async options => {
//   // 1) create a transporter
//   const transporter = nodemailer.createTransport({
//     // service: 'Gmail',
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//     // ACTIVATE in gmail "less secure app " option
//   });
//   //2) Define the email options
//   const mailOptions = {
//     from: 'omar fareed <fareedomar159@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

//
