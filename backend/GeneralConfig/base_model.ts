import { Schema, Document } from 'mongoose';

export interface BaseDocument extends Document {
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
}

export const BaseSchema = new Schema({
  created_at: {
    type: Date,
    default: Date.now,
    required: false
  },
  created_by: {
    type: String,
    required: false
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: false
  },
  updated_by: {
    type: String,
    required: false
  }

});