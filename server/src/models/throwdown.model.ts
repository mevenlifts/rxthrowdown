import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IParticipant {
  user: Types.ObjectId;
  score: number;
}

export interface IThrowdown extends Document {
  name: string;
  startDate: Date;
  duration: number;
  endDate: Date;
  author: Types.ObjectId;
  workout: string;
  scale: 'beginner' | 'intermediate' | 'rx';
  participants?: IParticipant[];
}

const ParticipantSchema = new Schema<IParticipant>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: false },
}, { _id: false });

const ThrowdownSchema = new Schema<IThrowdown>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 },
  endDate: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workout: { type: String, required: true },
  scale: { type: String, enum: ['beginner', 'intermediate', 'rx'], required: true },
  participants: [ParticipantSchema],
}, { timestamps: true });

export default mongoose.models.Throwdown
  ? (mongoose.models.Throwdown as mongoose.Model<IThrowdown>)
  : mongoose.model<IThrowdown>('Throwdown', ThrowdownSchema);
