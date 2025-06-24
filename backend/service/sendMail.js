
const Axios = require("axios");
const EMAIL_SENDER_NAME = process.env.BREVO_EMAIL_SENDER_NAME;

const axios = Axios.create({
  baseURL: "https://api.brevo.com/v3/smtp/email",
  timeout: 4000,
  headers: {
    "Content-Type": "application/json",
    "api-key": process.env.BREVO_API_KEY, // use .env instead of hardcoding
    accept: "application/json",
  },
});

async function sendResetPasswordConfirmationMail(to) {
  return axios
    .post("", {
      sender: { name: EMAIL_SENDER_NAME, email: "ak1096561@gmail.com" },
      to: [{ email: to }],
      subject: "Reset Password Confirmation",
      htmlContent: `<p>Your password has been reset </p>`,
    })
    .then((response) => {
      console.log("Email sent successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error sending email:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

async function sendResetPasswordMail(to, otpCode) {
  return axios
    .post("", {
      sender: { name: EMAIL_SENDER_NAME, email: "ak1096561@gmail.com" },
      to: [{ email: to }],
      subject: "Reset Password Request",
      htmlContent: `<p>Your OTP for password reset is ${otpCode}</a></p>`,
    })
    .then((response) => {
      console.log("Email sent successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error sending email:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}


module.exports = {
  sendResetPasswordMail,
  sendResetPasswordConfirmationMail,
};