import AppError from '../../error/appError';
import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import { PresentationTaskService } from './presentationtask.service';

const createPresentationTask = catchAsync(async (req, res) => {
  const result = await PresentationTaskService.createPresentationTask(
    req.user?.id,
    req.params.id!,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Presentation Task created successfully',
    data: result,
  });
});

const getSinglePresentationTask = catchAsync(async (req, res) => {
  const result = await PresentationTaskService.getSinglePresentationTask(
    req.params.id!,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Presentation Task retrieved successfully',
    data: result,
  });
});

const updatePresentationTask = catchAsync(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'Video file is required');
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new AppError(
      400,
      'Video file buffer is empty — check multer memoryStorage config',
    );
  }

  console.log('File received in controller:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.buffer.length,
  });

  const result = await PresentationTaskService.updatePresentationTask(
    req.params.id!,
    req.body,
    file,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Presentation Task updated successfully',
    data: result,
  });
});
export const PresentationTaskController = {
  createPresentationTask,
  getSinglePresentationTask,
  updatePresentationTask,
};
