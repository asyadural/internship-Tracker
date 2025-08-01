import { Types } from "mongoose";
import { Users, IUser, InternshipApplication, IInternshipApplication } from "../models/model";

export const getAllUsers = async () => {
  return await Users.find();
};

export const getUserById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await Users.findById(id);
};

export const createUser = async (data: IUser) => {
  const user = new Users(data);
  return await user.save();
};

export const updateUser = async (id: string, updates: Partial<IUser>) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await Users.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteUser = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await Users.findByIdAndDelete(id);
};

// ***** INTERNSHIP APPLICATIONS *****

export async function getAllApplications(userId: string) {
  return InternshipApplication
    .find({ user: userId })
    .sort({ applicationDate: -1 });
}

export const getApplicationById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await InternshipApplication.findById(id).populate("user");
};

export const createApplication = async (data: IInternshipApplication) => {
  const application = new InternshipApplication(data);
  return await application.save();
};

export const updateApplication = async (
  id: string,
  updates: Partial<IInternshipApplication>
) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await InternshipApplication.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteApplication = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error("Invalid ID");
  return await InternshipApplication.findByIdAndDelete(id);
};