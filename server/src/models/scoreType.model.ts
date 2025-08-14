import mongoose, { Schema, Document } from 'mongoose';

export interface IScoreType extends Document {
  name: string; // e.g. 'rounds-reps', 'time', 'reps'
  description: string;
  inputFields: string[]; // e.g. ['rounds', 'reps'] or ['minutes', 'seconds']
  compareLogic: string; // e.g. 'highest', 'lowest', 'roundsThenReps', etc.
}

const ScoreTypeSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  inputFields: [{ type: String, required: true }],
  compareLogic: { type: String, required: true },
});

export default mongoose.model<IScoreType>('ScoreType', ScoreTypeSchema);
