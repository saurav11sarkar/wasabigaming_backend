import AppError from '../../error/appError';
import {
  aiPresentationTaskQuestion,
  aiPresentationTaskSubmission,
} from '../../helper/aiEndpoint';

import Aiassessment from '../aiassessment/aiassessment.model';
import User from '../user/user.model';
import { IPresentationTask } from './presentationtask.interface';
import PresentationTask from './presentationtask.model';

const createPresentationTask = async (
  userId: string,
  aiassigmentId: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');
  const aiassessment = await Aiassessment.findById(aiassigmentId);
  if (!aiassessment) throw new AppError(404, 'ai assessment not found');

  const aiResponse = await aiPresentationTaskQuestion();
  console.log(aiResponse);
  if (!aiResponse) throw new AppError(400, 'failed to get response from ai');

  const result = await PresentationTask.create({
    applicant: user._id,
    ventaraMobility: aiResponse.task,
    keyObject: aiResponse.instructions,
    proTip: aiResponse.proTips,
    aiassigmentId: aiassessment._id,
  });
  if (!result) throw new AppError(400, 'faild to create response');

  if (!aiassessment.applicationUser?.includes(user._id)) {
    aiassessment.applicationUser?.push(user._id);
    await aiassessment.save();
  }

  const resultData = await PresentationTask.findById(result._id)
    .populate('aiassigmentId')
    .populate('applicant', 'firstName lastName email profileImage');

  return resultData;
};

const getSinglePresentationTask = async (id: string) => {
  const result = await PresentationTask.findById(id)
    .populate('applicant', 'firstName lastName email profileImage')
    .populate('aiassigmentId');
  if (!result) throw new AppError(404, 'interview not found');
  return result;
};

const updatePresentationTask = async (
  id: string,
  payload: Partial<IPresentationTask>,
  file?: Express.Multer.File,
) => {
  const existingData = await PresentationTask.findById(id);
  if (!existingData) {
    throw new AppError(404, 'Presentation task not found');
  }

  // file validation
  if (!file?.buffer || !file?.originalname) {
    throw new AppError(400, 'Video file is required for submission');
  }

  // required AI fields validation
  if (
    !existingData.ventaraMobility ||
    !existingData.keyObject?.length ||
    !existingData.proTip?.length
  ) {
    throw new AppError(400, 'Presentation task data is incomplete');
  }

  // call AI service
  const aiResponse = await aiPresentationTaskSubmission(
    existingData.ventaraMobility,
    existingData.keyObject.join('\n'),
    existingData.proTip.join('\n'),
    file.buffer,
    file.originalname,
  );

  // random typing speed
  const typeSpeed = Math.floor(Math.random() * (60 - 20 + 1)) + 20;

  const updatedTask = await PresentationTask.findByIdAndUpdate(
    id,
    {
      feedback: aiResponse?.feedback ?? '',
      totalScore: aiResponse?.contentScore ?? 0,
      wordsCompleted: aiResponse?.wordCount ?? 0,
      completionRate: aiResponse?.completionRate ?? 0,
      writingSpeed: payload?.writingSpeed ?? 50,
      overallGrade: aiResponse?.OverallGrade ?? '',
      yourResponse: payload?.yourResponse ?? '',
      typeSpeed,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedTask;
};

export const PresentationTaskService = {
  createPresentationTask,
  getSinglePresentationTask,
  updatePresentationTask,
};
