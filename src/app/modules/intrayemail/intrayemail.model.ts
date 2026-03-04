import mongoose from 'mongoose';
import { IIntrayemail } from './intrayemail.interface';

const intrayemailSchema = new mongoose.Schema<IIntrayemail>(
  {
    aiassigmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Aiassessment',
    },

    discribtion: {
      type: String,
      trim: true,
    },

    question: {
      type: String,
      trim: true,
    },

    yourResponse: {
      type: String,
    },

    prioritization: {
      type: String,
    },

    commercialAwarness: {
      type: String,
    },

    contextUnderstanding: {
      type: String,
    },

    judgment: {
      type: String,
    },

    riskAssessment: {
      type: String,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
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
    overallGrade: {
      type: String,
      trim: true,
    },
    typeSpeed: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Intrayemail = mongoose.model<IIntrayemail>(
  'Intrayemail',
  intrayemailSchema,
);

export default Intrayemail;
