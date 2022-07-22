import nodeMailer from 'nodemailer';
import chalk from 'chalk';

import config from '../../config.js';

export const sendEmail = async (
  to = [],
  subject = '',
  plainbody = '',
  body = '',
) => {
  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PWD,
    },
  });
  const mailOptions = {
    from: '"Contact <contact@', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: plainbody, // plain text body
    html: body, // html body
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // eslint-disable-next-line no-console
      return console.info(`${chalk.red('[ERROR]:')}`, error);
    }
    // eslint-disable-next-line no-console
    console.info(
      `${chalk.green('[server]:')} mensaje enviado`,
      info.messageId,
      info.response,
    );
  });
};
