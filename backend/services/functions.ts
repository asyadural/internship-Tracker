import { Types } from 'mongoose';
import {
  Users,
  InternshipApplication,
  VerificationCodes,
  EmailJSConfigs,
  EmailTemplates,
  IUser,
  IInternshipApplication,
  IVerificationCode,
  IEmailJSConfig,
  IEmailTemplate
} from '../models/model';


export async function getAllUsers(): Promise<IUser[]> {
  return Users.find().exec();
}

export async function getUserById(id: string): Promise<IUser | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user ID');
  return Users.findById(id).exec();
}

export async function createUser(data: IUser): Promise<IUser> {
  const user = new Users(data);
  return user.save();
}

export async function updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user ID');
  return Users.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteUser(id: string): Promise<IUser | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid user ID');
  return Users.findByIdAndDelete(id).exec();
}


export async function getAllApplications(userId: string): Promise<IInternshipApplication[]> {
  if (!Types.ObjectId.isValid(userId)) throw new Error('Invalid user ID');
  return InternshipApplication.find({ user: userId }).sort({ applicationDate: -1 }).exec();
}

export async function getApplicationById(id: string): Promise<IInternshipApplication | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid application ID');
  return InternshipApplication.findById(id).populate('user').exec();
}

export async function createApplication(data: IInternshipApplication & { user: string }): Promise<IInternshipApplication> {
  const app = new InternshipApplication(data);
  return app.save();
}

export async function updateApplication(
  id: string,
  updates: Partial<IInternshipApplication>
): Promise<IInternshipApplication | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid application ID');
  return InternshipApplication.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteApplication(id: string): Promise<IInternshipApplication | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid application ID');
  return InternshipApplication.findByIdAndDelete(id).exec();
}

export async function getAllVerificationCodes(): Promise<IVerificationCode[]> {
  return VerificationCodes.find().exec();
}

export async function getVerificationCodeById(id: string): Promise<IVerificationCode | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid code ID');
  return VerificationCodes.findById(id).exec();
}

export async function createVerificationCode(data: IVerificationCode): Promise<IVerificationCode> {
  const code = new VerificationCodes(data);
  return code.save();
}

export async function updateVerificationCode(
  id: string,
  updates: Partial<IVerificationCode>
): Promise<IVerificationCode | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid code ID');
  return VerificationCodes.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteVerificationCode(id: string): Promise<IVerificationCode | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid code ID');
  return VerificationCodes.findByIdAndDelete(id).exec();
}


export async function getEmailJSConfigs(): Promise<IEmailJSConfig[]> {
  return EmailJSConfigs.find().exec();
}

export async function getEmailJSConfigById(id: string): Promise<IEmailJSConfig | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid config ID');
  return EmailJSConfigs.findById(id).exec();
}

export async function createEmailJSConfig(data: IEmailJSConfig): Promise<IEmailJSConfig> {
  const cfg = new EmailJSConfigs(data);
  return cfg.save();
}

export async function updateEmailJSConfig(
  id: string,
  updates: Partial<IEmailJSConfig>
): Promise<IEmailJSConfig | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid config ID');
  return EmailJSConfigs.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteEmailJSConfig(id: string): Promise<IEmailJSConfig | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid config ID');
  return EmailJSConfigs.findByIdAndDelete(id).exec();
}



export async function getEmailTemplates(): Promise<IEmailTemplate[]> {
  return EmailTemplates.find().exec();
}

export async function getEmailTemplateById(id: string): Promise<IEmailTemplate | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid template ID');
  return EmailTemplates.findById(id).exec();
}

export async function createEmailTemplate(data: IEmailTemplate): Promise<IEmailTemplate> {
  const tpl = new EmailTemplates(data);
  return tpl.save();
}

export async function updateEmailTemplate(
  id: string,
  updates: Partial<IEmailTemplate>
): Promise<IEmailTemplate | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid template ID');
  return EmailTemplates.findByIdAndUpdate(id, updates, { new: true }).exec();
}

export async function deleteEmailTemplate(id: string): Promise<IEmailTemplate | null> {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid template ID');
  return EmailTemplates.findByIdAndDelete(id).exec();
}