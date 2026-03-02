import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import pick from '../../helper/pick';
import { getLoginHistoryFromDB, userService } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const { fullName } = req.body;
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ')[1];
  const result = await userService.createUser({
    ...req.body,
    firstName,
    lastName,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const filters = pick(req.query, [
    'searchTerm',
    'firstName',
    'lastName',
    'email',
    'role',
    'schoolName',
    'schoolType',
    'schoolStatus',
    'aboutSchool',
    'year',
    'grade'
  ]);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await userService.getAllUser(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new Error('User ID is required');
  }
  const result = await userService.getUserById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const updateUserById = catchAsync(async (req, res) => {
  const file = req.file;
  const fromData = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await userService.updateUserById(req.params.id!, fromData, file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new Error('User ID is required');
  }
  const result = await userService.deleteUserById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const profile = catchAsync(async (req, res) => {
  const result = await userService.profile(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile fetched successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const file = req.file;
  const fromData = req.body.data ? JSON.parse(req.body.data) : req.body;
  const result = await userService.updateMyProfile(req.user?.id, fromData, file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const schoolOverview = catchAsync(async (req, res) => {
  console.log('first');
  const result = await userService.schoolOverview();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile fetched successfully',
    data: result,
  });
});
export const getJobsMatchingUserSkillsController = catchAsync(
  async (req, res) => {
    const userId = req.user.id;
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = await userService.getJobsMatchingUserSkills(userId, options);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Jobs matching your skills retrieved successfully',
      data: result,
    });
  },
);
export const getLoginHistory = catchAsync(async (req, res) => {
  const userId = req.user.id; // auth middleware থেকে আসবে

  const result = await getLoginHistoryFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login history retrieved successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  profile,
  schoolOverview,
  getJobsMatchingUserSkillsController,
  getLoginHistory,
  updateMyProfile
};
