import { Types } from 'mongoose';

export interface IIntrayemail {
  aiassigmentId?: Types.ObjectId;
  discribtion?: string;
  question?: string;
  yourResponse?: string;
  prioritization?: string;
  judgment?: string;
  commercialAwarness?: string;
  contextUnderstanding?: string;
  riskAssessment?: string;
  applicant?: Types.ObjectId;

  wordCount?: number;
  completionRate?: number;
  overallGrade?: string;
  typeSpeed?: number;
}
