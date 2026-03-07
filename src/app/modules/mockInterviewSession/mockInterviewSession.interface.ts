import { Types } from 'mongoose';

export interface IFeedbackTimeline {
  opening_hook?: {
    secound?: number;
    text?: string;
  };
  filler_words?: string;
  stronger_answer?: string;
}

export interface IAIResult {
  score?: number;
  interview_crushed?: number;
  communication_and_clarity?: number;
  commercial_awareness?: number;
  problem_solving?: number;
  professionalism_and_presence?: number;
  feedback_timeline?: IFeedbackTimeline;
  feedback?: {
    strength: string;
    areas_for_improvement: string;
  };
}

export interface IMockInterviewAnswer {
  questionIndex: number;
  videoUrl: string;
  startTime: Date;
  endTime: Date;
  aiResult?: IAIResult; 
}
export interface IMockInterviewQuestion {
  questionText: string;
  order: number;
}
// export interface IFinalResult {
//   averageScore: number;
//   strengths: string[];
//   weaknesses: string[];
//   finalFeedback: string;
// }

export interface IMockInterviewSession {
  userId: Types.ObjectId;
  mockInterviewId: Types.ObjectId;

  status?: string;
  attemptNumber?:number;
  questions?:IMockInterviewQuestion[];
  category?:string;
  questionNumber?:string;

  answers: IMockInterviewAnswer[];

  // finalResult?: IFinalResult;

  createdAt?: Date;
  updatedAt?: Date;
}
