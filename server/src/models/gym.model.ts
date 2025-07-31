import mongoose, { Document, Schema } from 'mongoose';

export interface IGym extends Document {
  name: string;
  location?: string;
  // Add more fields as needed
}

const GymSchema = new Schema<IGym>({
  name: { type: String, required: true, unique: true },
  location: { type: String },
});

export default mongoose.model<IGym>('Gym', GymSchema);
