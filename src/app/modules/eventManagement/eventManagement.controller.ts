import pick from '../../helper/pick';
import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import { eventRegisterStudentService } from './eventManagement.service';

const createEventRegisterStudent = catchAsync(async (req, res) => {
  const result = await eventRegisterStudentService.createEventRegisterStudent(
    req.body,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student registered for event successfully',
    data: result,
  });
});

const getAllEventRegisterStudents = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['searchTerm', 'name', 'email', 'phone', 'eventId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await eventRegisterStudentService.getAllEventRegisterStudents(
    filters,
    options,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registered students retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getEventRegisterStudentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await eventRegisterStudentService.getSingleEventRegisterStudent(id!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registered student retrieved successfully',
    data: result,
  });
});

const updateEventRegisterStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await eventRegisterStudentService.updateEventRegisterStudent(
    id!,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registered student updated successfully',
    data: result,
  });
});

const deleteEventRegisterStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result =
    await eventRegisterStudentService.deleteEventRegisterStudent(id!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Registered student deleted successfully',
    data: result,
  });
});

export const eventRegisterStudentController = {
  createEventRegisterStudent,
  getAllEventRegisterStudents,
  getEventRegisterStudentById,
  updateEventRegisterStudent,
  deleteEventRegisterStudent,
};