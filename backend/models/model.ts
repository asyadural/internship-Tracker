import { Schema, model} from "mongoose";
import bcrypt from 'bcrypt';
import { BaseDocument, BaseSchema } from '../generalConfig/base_model.ts';


export interface IUser extends BaseDocument {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    ...BaseSchema.obj,
    firstname: {type: String, required: true},
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8, select: false },
    isActive: {type: Boolean, default: true}
  });


UserSchema.pre<IUser>('save', async function () {
 if (!this.isModified('password')) return;
 const salt = await bcrypt.genSalt(10);
 this.password = await bcrypt.hash(this.password, salt);
});

export const Users = model<IUser>('User', UserSchema);


export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "No Response"
  | "To Be Applied";

export interface IInternshipApplication extends BaseDocument {
  user: Schema.Types.ObjectId; 
  companyName: string;
  positionTitle?: string;
  location: string;
  applicationDate: Date;
  applicationStatus: ApplicationStatus;
  companyWebsite?: string;
  notes?: string;
}

const InternshipApplicationSchema = new Schema<IInternshipApplication>(
  {
    ...BaseSchema.obj,
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    positionTitle: { type: String },
    location: { type: String, required: true },
    applicationDate: { type: Date, default: Date.now },
    applicationStatus: {
      type: String,
      enum: ["Applied", "Interviewing", "Offer", "Rejected", "No Response", "To Be Applied"],
      default: "Applied",
    },
    companyWebsite: { type: String },
    notes: { type: String },
  });

export const InternshipApplication = model<IInternshipApplication>("InternshipApplication",InternshipApplicationSchema);

export interface IVerificationCode extends BaseDocument {
  code: number;
  token: string;
  action: string;
  duration: number;
  expiring_date: Date;
  is_expired: boolean;
  is_used: boolean;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
  ...BaseSchema.obj,
  code: { type: Number, required: true },
  token: { type: String, required: true, unique: true},
  duration: { type: Number, required: true },
  expiring_date: { type: Date, required: true },
  is_expired: { type: Boolean, default: false },
  is_used: { type: Boolean, default: false },
  action: { type: String, required: true }
});

export const VerificationCodes = model<IVerificationCode>('VerificationCode', VerificationCodeSchema);

export interface IEmailJSConfig extends BaseDocument {
  service_id: string;
  public_key: string;
  private_key: string;
}
const EmailJSConfigSchema = new Schema<IEmailJSConfig>({
  ...BaseSchema.obj,
  service_id:   { type: String, required: true },
  public_key:   { type: String, required: true },
  private_key:  { type: String, required: true },
});
export const EmailJSConfigs = model<IEmailJSConfig>('EmailJSConfig', EmailJSConfigSchema);



export interface IEmailTemplate extends BaseDocument {
  action:        string;  //name of the action here for example forgot password 
  template_id: string;  //we have a template_id for each action mail template
}
const EmailTemplateSchema = new Schema<IEmailTemplate>({
  ...BaseSchema.obj,
  action:        { type: String, required: true, unique: true },
  template_id: { type: String, required: true },
});
export const EmailTemplates = model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
