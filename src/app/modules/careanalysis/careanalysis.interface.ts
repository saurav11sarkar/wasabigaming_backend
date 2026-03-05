import { Types } from 'mongoose';

export interface ICareanalysis {
  aiassigmentId?: Types.ObjectId;
  precedentSummary?: string;
  pretendCase?: string;
  yourResponse?: string;
  wordCount?: number;
  completionRate?: number;
  contentScore?: number;
  grade?: string;
  legalIssue?: string;
  caseLinking?: string;
  summaryQuality?: string[];
  applicant?: Types.ObjectId;
  typeSpreed?: number;
}
