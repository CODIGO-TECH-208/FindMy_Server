import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export async function sendOTP(name, email, otp) {
  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
      .container { max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .otp-box { background-color: #e8f5e8; padding: 14px 20px; font-size: 28px; font-weight: bold; letter-spacing: 6px; width: fit-content; border-radius: 6px; margin: 16px 0; }
      .footer { font-size: 12px; color: #888; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Welcome to Findmy, ${name}!</h2>
      <p>Use the OTP below to complete your registration. It is valid for <strong>10 minutes</strong>.</p>
      <div class="otp-box">${otp}</div>
      <p><strong>Do not share this code with anyone.</strong></p>
      <p class="footer">If you did not request this, please ignore this email.</p>
    </div>
  </body>
  </html>
`;

  const mailOptions = {
    from: `"FindMy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your FindMy Verification OTP",
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendOTP error:", error.message);
    return { success: false, error: error.message };
  }
}


export async function sendPasswordResetEmail(name, email, otp) {
  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
      .container { max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .otp-box { background-color: #fef3cd; padding: 14px 20px; font-size: 28px; font-weight: bold; letter-spacing: 6px; width: fit-content; border-radius: 6px; margin: 16px 0; }
      .footer { font-size: 12px; color: #888; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, use the OTP below to reset your FindMy password. It is valid for <strong>10 minutes</strong>.</p>
      <div class="otp-box">${otp}</div>
      <p><strong>Do not share this code with anyone.</strong></p>
      <p class="footer">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
  </body>
  </html>
`;

  const mailOptions = {
    from: `"FindMy" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your FindMy Password Reset OTP",
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendPasswordResetEmail error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendClaimNotificationEmail(ownerName, ownerEmail, claimantName, itemTitle) {
  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
      .container { max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .footer { font-size: 12px; color: #888; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>New Claim on Your Item!</h2>
      <p>Hi ${ownerName},</p>
      <p><strong>${claimantName}</strong> has submitted a claim for the item you posted: <strong>${itemTitle}</strong>.</p>
      <p>Please log in to your FindMy account to review the claim, verify their identity, and respond to them.</p>
      <p class="footer">Thank you for helping others find their belongings!</p>
    </div>
  </body>
  </html>
`;

  const mailOptions = {
    from: `"FindMy" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New Claim on: ${itemTitle}`,
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendClaimNotificationEmail error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function sendClaimStatusEmail(claimantName, claimantEmail, itemTitle, status) {
  const statusColor = status === "accepted" ? "#28a745" : "#dc3545";
  
  const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
      .container { max-width: 500px; margin: auto; background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .status { color: ${statusColor}; font-weight: bold; text-transform: uppercase; }
      .footer { font-size: 12px; color: #888; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Claim Update</h2>
      <p>Hi ${claimantName},</p>
      <p>Your claim for the item <strong>${itemTitle}</strong> has been <span class="status">${status}</span> by the owner.</p>
      ${status === "accepted" ? "<p>Please log in to your FindMy account to chat with the owner and arrange how to get your item.</p>" : "<p>Unfortunately, the owner rejected your claim. If you have valid proof, you can try reaching out to admins.</p>"}
      <p class="footer">Thank you.</p>
    </div>
  </body>
  </html>
`;

  const mailOptions = {
    from: `"FindMy" <${process.env.EMAIL_USER}>`,
    to: claimantEmail,
    subject: `Update on Your Claim for: ${itemTitle}`,
    html: emailTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendClaimStatusEmail error:", error.message);
    return { success: false, error: error.message };
  }
}