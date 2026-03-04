import AppError from '../../error/appError';
import {
  aiintrayemailquestion,
  aiintrayemailSubmission,
} from '../../helper/aiEndpoint';
import Aiassessment from '../aiassessment/aiassessment.model';
import User from '../user/user.model';
import { IIntrayemail } from './intrayemail.interface';
import Intrayemail from './intrayemail.model';

const createIntrayemail = async (userId: string, aiassigmentId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');
  const aiassessment = await Aiassessment.findById(aiassigmentId);
  if (!aiassessment) throw new AppError(404, 'ai assessment not found');

  const aiResponse = await aiintrayemailquestion();
  // console.log(aiResponse);
  if (!aiResponse) throw new AppError(400, 'failed to get response from ai');

  const result = await Intrayemail.create({
    applicant: user._id,
    discribtion: aiResponse.instructions,
    question: aiResponse.draftEmail,
    aiassigmentId: aiassessment._id,
  });
  if (!result) throw new AppError(400, 'faild to create response');

  if (!aiassessment.applicationUser?.includes(user._id)) {
    aiassessment.applicationUser?.push(user._id);
    await aiassessment.save();
  }

  const resultData = await Intrayemail.findById(result._id)
    .populate('aiassigmentId')
    .populate('applicant', 'firstName lastName email profileImage');

  return resultData;
};

const getSingleIntrayemail = async (id: string) => {
  const result = await Intrayemail.findById(id)
    .populate('applicant', 'firstName lastName email profileImage')
    .populate('aiassigmentId');
  if (!result) throw new AppError(404, 'interview not found');
  return result;
};

const updateIntrayemail = async (
  id: string,
  payload: Partial<IIntrayemail>,
) => {
  const existingData = await Intrayemail.findById(id);
  if (!existingData) throw new AppError(404, 'Data not found');
  payload.discribtion = existingData.discribtion || '';
  payload.question = existingData.question || '';
  const aiResponse = await aiintrayemailSubmission(payload.yourResponse!);
  // console.log(aiResponse);
  const typeSpreed = Math.floor(Math.random() * (60 - 20 + 1)) + 20;
  const result = await Intrayemail.findByIdAndUpdate(
    id,
    {
      yourResponse: payload.yourResponse,
      prioritization: aiResponse.prioritization,
      judgment: aiResponse.judgment,
      commercialAwarness: aiResponse.commercialAwarness,
      contextUnderstanding: aiResponse.contextUnderstanding,
      riskAssessment: aiResponse.riskAssessment,
      wordCount: aiResponse.wordCount,
      completionRate: aiResponse.completionRate,
      overallGrade: aiResponse.overallGrade,
      typeSpeed: typeSpreed,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  return result;
};

export const intrayemailService = {
  createIntrayemail,
  getSingleIntrayemail,
  updateIntrayemail,
};
