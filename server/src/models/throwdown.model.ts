import mongoose, { Schema, Document, Types } from 'mongoose';


export interface IParticipant {
  user: Types.ObjectId;
  score?: any; // legacy single score
  scores?: any[]; // array for multi-workout scores
}

export interface IWorkoutPiece {
  description: string;
  timeCap: number;
  scoreType: Types.ObjectId | import('./scoreType.model').IScoreType | string;
}

export interface IThrowdown extends Document {
  title: string;
  startDate: Date;
  duration: number;
  author: Types.ObjectId;
  workouts: IWorkoutPiece[];
  videoRequired: boolean;
  scale: 'beginner' | 'intermediate' | 'rx';
  participants?: IParticipant[];
}

const ParticipantSchema = new Schema<IParticipant>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Schema.Types.Mixed, required: false },
  scores: { type: [Schema.Types.Mixed], required: false },
}, { _id: false });

const WorkoutPieceSchema = new Schema<IWorkoutPiece>({
  description: { type: String, required: true },
  timeCap: { type: Number, required: true },
  scoreType: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const ThrowdownSchema = new Schema<IThrowdown>({
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workouts: { type: [WorkoutPieceSchema], required: true },
  videoRequired: { type: Boolean, default: false },
  scale: { type: String, enum: ['beginner', 'intermediate', 'rx'], required: true },
  participants: [ParticipantSchema],
}, { timestamps: true });

export default mongoose.models.Throwdown
  ? (mongoose.models.Throwdown as mongoose.Model<IThrowdown>)
  : mongoose.model<IThrowdown>('Throwdown', ThrowdownSchema);
