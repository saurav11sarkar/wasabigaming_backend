import { Schema, model, Types } from 'mongoose';
import { ICareanalysis } from './careanalysis.interface';

const careanalysisSchema = new Schema<ICareanalysis>(
  {
    aiassigmentId: {
      type: Types.ObjectId,
      ref: 'Aiassessment',
    },
    precedentSummary: {
      type: String,
      trim: true,
    },
    pretendCase: {
      type: String,
      trim: true,
    },
    yourResponse: {
      type: String,
      trim: true,
    },
    legalIssue: {
      type: String,
      trim: true,
    },
    caseLinking: {
      type: String,
      trim: true,
    },
    summaryQuality: {
      type: [String],
      trim: true,
    },
    applicant: {
      type: Types.ObjectId,
      ref: 'User',
    },
    wordCount: {
      type: Number,
      min: 0,
    },
    completionRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    contentScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      trim: true,
    },
    typeSpreed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Careanalysis = model<ICareanalysis>('Careanalysis', careanalysisSchema);
export default Careanalysis;
