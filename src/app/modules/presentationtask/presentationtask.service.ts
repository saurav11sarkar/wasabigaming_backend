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
  if (!user) throw new AppError(404, 'User not found');

  const aiassessment = await Aiassessment.findById(aiassigmentId);
  if (!aiassessment) throw new AppError(404, 'AI assessment not found');

  // aiResponse = { task, instructions, proTips }
  const aiResponse = await aiPresentationTaskQuestion();
  if (!aiResponse) throw new AppError(400, 'Failed to get response from AI');

  console.log('Saving to DB:', {
    task: aiResponse.task,
    instructions: aiResponse.instructions,
    proTips: aiResponse.proTips,
  });

  const result = await PresentationTask.create({
    applicant: user._id,
    ventaraMobility: aiResponse.task,
    keyObject: aiResponse.instructions,   // string[]
    proTip: aiResponse.proTips,           // string[]
    aiassigmentId: aiassessment._id,
  });

  if (!result) throw new AppError(400, 'Failed to create presentation task');

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
  if (!result) throw new AppError(404, 'Presentation task not found');
  return result;
};

const updatePresentationTask = async (
  id: string,
  payload: Partial<IPresentationTask>,
  file?: Express.Multer.File,
) => {
  const existingData = await PresentationTask.findById(id);
  if (!existingData) throw new AppError(404, 'Presentation task not found');

  // ✅ Validate file buffer
  if (!file?.buffer || file.buffer.length === 0) {
    throw new AppError(400, 'Valid video file is required');
  }

  // ✅ Validate DB fields are populated
  if (
    !existingData.ventaraMobility ||
    !existingData.keyObject?.length ||
    !existingData.proTip?.length
  ) {
    console.log('Missing DB fields:', {
      ventaraMobility: existingData.ventaraMobility,
      keyObject: existingData.keyObject,
      proTip: existingData.proTip,
    });
    throw new AppError(400, 'Presentation task data is incomplete. Please create the task first.');
  }

  console.log('Sending to AI:', {
    file: file.originalname,
    mimetype: file.mimetype,
    bufferSize: file.buffer.length,
    task: existingData.ventaraMobility?.substring(0, 80),
    keyObject: existingData.keyObject,
    proTip: existingData.proTip,
  });

  const aiResponse = await aiPresentationTaskSubmission(
    existingData.ventaraMobility,
    existingData.keyObject,   // ✅ string[] directly — no .join()
    existingData.proTip,      // ✅ string[] directly — no .join()
    file.buffer,
    file.originalname,
    file.mimetype,            // ✅ real mimetype from multer
  );

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
    { new: true, runValidators: true },
  );

  return updatedTask;
};


export const PresentationTaskService = {
  createPresentationTask,
  getSinglePresentationTask,
  updatePresentationTask,
};
