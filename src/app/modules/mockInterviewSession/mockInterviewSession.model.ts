import mongoose, { Schema } from 'mongoose';
import { IMockInterviewSession } from './mockInterviewSession.interface';

const mockInterviewSessionSchema = new Schema<IMockInterviewSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  mockInterviewId: {
    type: Schema.Types.ObjectId,
    ref: 'MockInterview',
    index: true
  },

  attemptNumber: {
    type: Number
  },
   questions: [
    {
      _id:false,
      questionText: String,
      order: Number
    }
  ],
  category:{type:String},
  questionNumber:{type:String},
  status: {
    type: String,
    // enum: ['IN_PROGRESS', 'COMPLETED', 'EXPIRED'],
     default: 'in_progress'
  },

    answers: {
    type: [
        {
        questionIndex: Number,
        videoUrl: String,
        startTime: Date,
        endTime: Date,
        aiResult: {
            score: Number,
            interview_crushed: Number,
            communication_and_clarity: Number,
            commercial_awareness: Number,
            problem_solving: Number,
            professionalism_and_presence: Number,
            feedback_timeline: {
              opening_hook: {
                secound: Number,
                text: String,
              },
              filler_words: String,
              stronger_answer: String,
            },
            feedback: {
              strength: { type: String },
              areas_for_improvement: { type: String },
            },
          },
        },
    ],
    default: [], // ✅ VERY IMPORTANT
    },


  // finalResult: {
  //   averageScore: Number,
  //   strengths: [String],
  //   weaknesses: [String],
  //   finalFeedback: String
  // }
}, { timestamps: true });


const MockInterviewSession = mongoose.model<IMockInterviewSession>(
  'MockInterviewSession',
  mockInterviewSessionSchema,
);

export default MockInterviewSession;
