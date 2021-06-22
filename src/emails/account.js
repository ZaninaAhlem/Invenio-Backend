const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "invenio@gmail.com",
    subject: "Thankx for signing in",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "invenio@gmail.com",
    subject: "Your name has been deleted",
    text: `${name}Your name has been deleted`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
