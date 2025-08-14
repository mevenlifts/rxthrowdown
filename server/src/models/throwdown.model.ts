import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IParticipant {
  user: Types.ObjectId;
  score?: any; // number or object for multi-score support
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
  scoreType: Types.ObjectId | import('./scoreType.model').IScoreType;
}

const ParticipantSchema = new Schema<IParticipant>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Schema.Types.Mixed, required: false },
}, { _id: false });

const ThrowdownSchema = new Schema<IThrowdown>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    scoreType: { type: Schema.Types.ObjectId, ref: 'ScoreType', required: true },
  endDate: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workout: { type: String, required: true },
  scale: { type: String, enum: ['beginner', 'intermediate', 'rx'], required: true },
  participants: [ParticipantSchema],
}, { timestamps: true });

export default mongoose.models.Throwdown
  ? (mongoose.models.Throwdown as mongoose.Model<IThrowdown>)
  : mongoose.model<IThrowdown>('Throwdown', ThrowdownSchema);
