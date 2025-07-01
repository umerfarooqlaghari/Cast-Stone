
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


async function sendOrderConfirmationEmail(to, order) {
  const orderItemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>${item.description}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #8B4513; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Cast Stone Interiors & Decorations</h1>
        <h2 style="margin: 10px 0 0 0;">Order Confirmation</h2>
      </div>

      <div style="padding: 20px; background: #f9f9f9;">
        <h3>Thank you for your order!</h3>
        <p>Your order has been confirmed and is being processed.</p>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Order Details:</h4>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Shipping Address:</h4>
          <p>
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </p>
        </div>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Order Items:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: right;">
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Tax: $${order.tax.toFixed(2)}</p>
            <p>Shipping: $${order.shipping.toFixed(2)}</p>
            <h3 style="border-top: 2px solid #8B4513; padding-top: 10px;">
              Total: $${order.total.toFixed(2)}
            </h3>
          </div>
        </div>

        <p>We'll send you another email when your order ships with tracking information.</p>
        <p>If you have any questions, please contact us at support@caststone.com</p>
      </div>
    </div>
  `;

  return axios
    .post("", {
      sender: { name: EMAIL_SENDER_NAME, email: "ak1096561@gmail.com" },
      to: [{ email: to }],
      subject: `Order Confirmation - ${order.orderNumber}`,
      htmlContent
    })
    .then((response) => {
      console.log("Order confirmation email sent successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error sending order confirmation email:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

async function sendPaymentConfirmationEmail(to, order) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #059669; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Payment Confirmed</h1>
        <h2 style="margin: 10px 0 0 0;">Cast Stone Interiors & Decorations</h2>
      </div>

      <div style="padding: 20px; background: #f9f9f9;">
        <h3>Payment Successfully Processed</h3>
        <p>Your payment has been successfully processed for order ${order.orderNumber}.</p>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4>Payment Details:</h4>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Payment Amount:</strong> $${order.total.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentInfo.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${order.paymentInfo.transactionId}</p>
          <p><strong>Payment Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            ✅ Your payment has been confirmed and your order is now being processed.
          </p>
        </div>

        <p>You will receive a separate email with order details and shipping information.</p>
        <p>Thank you for choosing Cast Stone Interiors & Decorations!</p>
      </div>
    </div>
  `;

  return axios
    .post("", {
      sender: { name: EMAIL_SENDER_NAME, email: "ak1096561@gmail.com" },
      to: [{ email: to }],
      subject: `Payment Confirmation - ${order.orderNumber}`,
      htmlContent
    })
    .then((response) => {
      console.log("Payment confirmation email sent successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(
        "Error sending payment confirmation email:",
        error.response ? error.response.data : error.message
      );
      throw error;
    });
}

module.exports = {
  sendResetPasswordMail,
  sendResetPasswordConfirmationMail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
};