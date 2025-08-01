import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { VerificationCodes, EmailJSConfigs, EmailTemplates, Users, InternshipApplication} from "../models/model";
import { sendEmail } from "../mini_services/emailjs";
import { serialize } from 'cookie';

dotenv.config();
const authRouter = Router();
const JWT_SECRET     = process.env.JWT_SECRET || 'dev‑only‑secret';
const JWT_EXPIRES_IN = '1h';



authRouter.post('/login', async (req: Request, res: Response) => { 
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await Users.findOne({ email }).select('+password'); 
    if (!user)           
      return res.status(401).json({ message: 'Invalid credentials.' });
    
    if (!user.isActive) 
      return res.status(403).json({ message: 'Account is inactive.' });

     const ok = await bcrypt.compare(password, user.password);
    if (!ok) 
      return res.status(401).json({ message: 'Invalid credentials.' });
    
    const payload: Record<string, unknown> = {
      sub:  user.id,
      email: user.email
    };

    const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure:  process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:    '/',
    maxAge:  60 * 60,      // 1 hour in seconds
    }));

// then just send back the user (no need to return the token in JSON)
  res.json({
    token,
      user: {
    id:        user.id,
    firstname: user.firstname,
    lastname:  user.lastname,
    email:     user.email,
  }
  });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});




authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    
    if ( !firstname || !lastname || !email || !password ) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }
    
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    
    const newUserData: any = {
      firstname,
      lastname,
      email,
      password
    };
    
    const newUser = new Users(newUserData);
    await newUser.save();
    
    const payload: Record<string, unknown> = {
      sub:  newUser.id,
      email: newUser.email,
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({
      message: 'User registered successfully.',
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        id:        newUser.id,
        firstname: newUser.firstname,
        lastname:  newUser.lastname,
        email:     newUser.email,
        
      },
    });
  } catch (err) {
    console.error('[signup]', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


authRouter.post('/forgot-password', async (req: Request, res: Response) => {

  const { email} = req.body;
  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email." });
    }
    const generateVerificationPair = (): { code: number; token: string } => {
    const code: number  = crypto.randomInt(100000, 1000000);
    const token: string = crypto.randomBytes(23).toString('hex');
    return { code, token };
    };

    const {code, token} = generateVerificationPair();
    const duration = 10; 
    const expiring_date = new Date(Date.now() + duration * 60 * 1000);
  
    await VerificationCodes.create({
      code,
      token,
      action: "forgot_password",
      duration,
      expiring_date,
      is_expired: false,
      is_used: false
    });

    const config = await EmailJSConfigs.findOne();
    if (!config) {
      console.error("No EmailJS config in DB");
      return res.status(500).json({ message: "Email configuration missing." });
    }
    const template = await EmailTemplates.findOne({ action: "forgot_password" });
    if (!template) {
      console.error("No EmailJS template for forgot_password");
      return res.status(500).json({ message: "Email template missing." });
    }

    const emailSent = await sendEmail(email, code, token, {
      service_id:   config.service_id,
      public_key:   config.public_key,
      private_key:  config.private_key,
      template_id:  template.template_id
    });

    if (!emailSent) {
      return res.status(500).json({ message: "Email cannot be send. Please try again" });
    }
    return res.status(200).json({ message: "Verification code has been sent via email", expiring_date, token});
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error. Please try again" });
  }
});



authRouter.post('/verify', async (req: Request, res: Response) => {
  const { code, token, email} = req.body as { code: number; token: string, email:string};
  
  if (typeof code !== 'number' || typeof token !== 'string') {
   return res.status(400).json({ error: 'Code (number) and token (string) are required.' });
  }
  
  try {
   const record = await VerificationCodes.findOne({ code, token, action: 'forgot_password' });
   if (!record) {
    return res.status(404).json({ error: 'Invalid or wrong code.' });
   }
    
   const now = new Date();
   if (record.is_expired || record.expiring_date < now) {
    return res.status(400).json({ error: 'Code has expired.' });
   }
    
   if (record.is_used) {
    return res.status(400).json({ error: 'Code has already been used.' });
   }
    
   record.is_used = true;
   record.is_expired = true;
   await record.save();

   return res.status(200).json({ success: true});
  } catch (err: any) {
   return res.status(500).json({ error: err.message });
  }
}); 


authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body as {
    email: string;
    token: string;
    newPassword: string;
  };

  const user = await Users.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    return res.status(400).json({
      message: 'New password cannot be the same as the old password.'
    });
  }


  user.password = newPassword; 
  await user.save();

  return res.status(200).json({
    message: 'Password has been reset successfully.',
    email
  })
})

export default authRouter as Router
