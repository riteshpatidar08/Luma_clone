import Otp from '../models/otp.model.js';
import transporter from '../nodemailer/transporter.js';
export const login = async (req,res) => {
  try {
    const { email } = req.body;
    //NOTE email validate

    //NOTE otp generate karna and database main save krna hain
    const code = Math.floor(100000 + Math.random() * 900000);

    await Otp.findOneAndUpdate(
        { email },
        { code: otpCode, createdAt: new Date() },
        { upsert: true, new: true } //what upsert do if user exist update the code if not exist create a new document for otp
      );
    
    const mailOptions = {
        from: `"Luma Sign In" < ${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Luma Sign-In Code',
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e7; rounded: 12px;">
            <h2>Sign in to Luma</h2>
            <p>Please enter the following 6-digit code to complete your login:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px; background: #f4f3ec; text-align: center; border-radius: 6px;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #858585; margin-top: 15px;">This code will expire in 5 minutes.</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "OTP sent successfully" });
    
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Failed to send sign-in code" });
  }

}
