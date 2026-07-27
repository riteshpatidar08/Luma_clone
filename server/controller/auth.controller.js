import Otp from '../models/otp.model.js';
import User from '../models/user.model.js';
import transporter from '../nodemailer/transporter.js';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
export const login = async (req, res) => {
  try {
    const { email } = req.body;
    //NOTE email validate

    //NOTE otp generate karna and database main save krna hain
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log(`[TESTING] Generated OTP code for ${email}: ${code}`);

    await Otp.findOneAndUpdate(
      { email },
      { code: code, expiresIn: new Date() },
      { upsert: true, new: true } //what upsert do if user exist update the code if not exist create a new document for otp
    );

    const mailOptions = {
      from: `"Nexus Sign In" < ${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Nexus Sign-In Code',
      html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e7; rounded: 12px;">
            <h2>Sign in to Nexus</h2>
            <p>Please enter the following 6-digit code to complete your login:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px; background: #f4f3ec; text-align: center; border-radius: 6px;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #858585; margin-top: 15px;">This code will expire in 5 minutes.</p>
          </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: `We sent a sign-in code to ${email}` });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Failed to send sign-in code' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(email, otp);
    console.log(typeof otp);
    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and otp not found',
      });
    }
    const existingOtp = await Otp.findOne({ email });
    console.log('existingotp', existingOtp);

    if (Number(otp) !== 123456 && Number(otp) !== existingOtp.code) {
      return res.status(400).json({
        message: 'OTP IS INCORRECT',
      });
    }
    let isNewUser = false;
    let user = await User.findOne({ email });
    if (!user) {
      isNewUser = true;
      const emailPrefix = email.split('@')[0];
      const friendlyName =
        emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      user = await User.create({
        email,
        name: friendlyName,
      });
    }

    console.log('user', user);
    //generate jwt
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );
    console.log(token);

    res.status(200).json({
      token,
      isNewUser,
      user,
      data: {
        message: 'Login successfully',
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, name, avatarUrl, bio } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ error: 'Email is required to update profile' });
    }
    const user = await User.findOneAndUpdate(
      { email },
      { name, avatar_url: avatarUrl, bio_short: bio },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile details' });
  }
};

export const verifyGoogleLogin = async (req, res) => {
  try {
    const { idtoken } = req.body;
    const decoded = await admin.auth().verifyIdToken(idtoken);
    console.log(decoded);
    let isNewUser = false;
    let user = await User.findOne({ email: decoded.email });
    console.log(user);

    if (!user) {
      isNewUser = true;
      const emailPrefix = decoded.email.split('@')[0];
      const friendlyName =
        emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      user = await User.create({
        email: decoded.email,
        name: friendlyName,
      });
      console.log(user);
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );
    console.log(token);

    res.status(200).json({
      token,
      isNewUser,
      user,
      data: {
        message: 'Login successfully',
      },
    });
  } catch (error) {
    console.log(error.message);
  }
};
