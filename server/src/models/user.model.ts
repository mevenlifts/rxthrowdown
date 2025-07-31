import mongoose, { Schema, Document } from 'mongoose';


export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  homeGym?: string;
  birthdate?: string;
  bio?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  createdAt?: Date;
  updatedAt?: Date;
  socialIds?: {
    google?: string;
    facebook?: string;
    [key: string]: string | undefined;
  };
}


const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  homeGym: { type: String },
  birthdate: { type: String },
  bio: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  socialIds: {
    type: Map,
    of: String,
    default: {},
  },
}, { timestamps: true });

export default mongoose.models.User
  ? (mongoose.models.User as mongoose.Model<IUser>)
  : mongoose.model<IUser>('User', UserSchema);