const nodeMailer = require("nodemailer");

module.exports = class Email {
  constructor(user) {
    this.from = process.env.EMAIL_FROM;
    this.to = user.email;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodeMailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }
  }

  async send(subject, html) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }
};
