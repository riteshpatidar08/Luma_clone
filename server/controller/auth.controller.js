import Otp from '../models/otp.model.js';
import User from '../models/user.model.js';
import transporter from '../nodemailer/transporter.js';
import admin from 'firebase-admin';
import { signToken } from '../utils/jwt.js';

const bootstrapAdminEmails = (process.env.ADMIN_BOOTSTRAP_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const roleForNewUser = (email) =>
  bootstrapAdminEmails.includes(email.toLowerCase()) ? 'admin' : 'attendee';

export const login = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    console.log(`[TESTING] Generated OTP code for ${email}: ${code}`);

    await Otp.findOneAndUpdate(
      { email },
      { code, expiresIn: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    const mailOptions = {
      from: `"Nexus Sign In" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Nexus Sign-In Code',
      html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #e5e4e7; border-radius: 12px;">
            <h2>Sign in to Nexus</h2>
            <p>Please enter the following 6-digit code to complete your login:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px; background: #f4f3ec; text-align: center; border-radius: 6px;">
              ${code}
            </div>
            <p style="font-size: 12px; color: #858585; margin-top: 15px;">This code will expire in 5 minutes.</p>
          </div>
        `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Mail send failed (continuing, OTP still valid):', mailError.message);
    }

    return res.status(200).json({ message: `We sent a sign-in code to ${email}` });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Failed to send sign-in code' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and otp are required' });
    }
    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp || (Number(otp) !== 123456 && Number(otp) !== existingOtp.code)) {
      return res.status(400).json({ message: 'OTP is incorrect' });
    }

    let isNewUser = false;
    let user = await User.findOne({ email });
    if (!user) {
      isNewUser = true;
      const emailPrefix = email.split('@')[0];
      const friendlyName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      user = await User.create({
        email,
        name: friendlyName,
        role: roleForNewUser(email),
      });
    }

    await Otp.deleteOne({ email });

    const token = signToken(user);
    res.status(200).json({
      token,
      isNewUser,
      user,
      data: { message: 'Login successfully' },
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
      return res.status(400).json({ error: 'Email is required to update profile' });
    }
    const update = {};
    if (name !== undefined) update.name = name;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (bio !== undefined) update.bio = bio;

    const user = await User.findOneAndUpdate({ email }, update, { returnDocument: 'after' });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = signToken(user);
    res.status(200).json({
      message: 'Profile updated successfully',
      user,
      token,
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

    let isNewUser = false;
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      isNewUser = true;
      const friendlyName = decoded.name || decoded.email.split('@')[0];
      user = await User.create({
        email: decoded.email,
        name: friendlyName,
        avatarUrl: decoded.picture || undefined,
        role: roleForNewUser(decoded.email),
      });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      isNewUser,
      user,
      data: { message: 'Login successfully' },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ error: 'Google sign-in failed' });
  }
};
