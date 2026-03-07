import pick from '../../helper/pick';
import catchAsync from '../../utils/catchAsycn';
import sendResponse from '../../utils/sendResponse';
import { cvbuilderService } from '../cvbuilder/cvbuilder.service';
import { jobService } from './job.service';

const createManualJob = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await jobService.createManualJob(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

const createJob = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { job_title } = req.body;
  const result = await jobService.createJob(userId, job_title);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

const manualJob = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await jobService.manualJob(userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Job created successfully',
    data: result,
  });
});

// const getStudentAllJobs = catchAsync(async (req, res) => {
//   const filters = pick(req.query, [
//     'searchTerm',
//     'status',
//     'additionalInfo',
//     'responsibilities',
//     'description',
//     'jobStatus',
//     'salaryRange',
//     'level',
//     'postedBy',
//     'companyType',
//     'companyName',
//     'location',
//     'title',
//     'applicationJob',
//   ]);
//   const roleToFilter = ((filters.role as string) || 'student') as
//     | 'student'
//     | 'admin';
//   delete filters.role;

//   const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//   const result = await jobService.getStudentAllJobs(
//     filters,
//     options,
//     roleToFilter,
//   );
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Jobs retrieved successfully',
//     meta: result.meta,
//     data: result.data,
//   });
// });

// const adminApplicationJobStatus = catchAsync(async (req, res) => {
//   const { jobId } = req.params;
//   const { status } = req.body;
//   const result = await jobService.adminApplicationJobStatus(jobId!, status);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Job status updated successfully',
//     data: result,
//   });
// });

const getAllJobs = catchAsync(async (req, res) => {
  const filters = pick(req.query, [
    'searchTerm',
    'status',
    'additionalInfo',
    'responsibilities',
    'description',
    'jobStatus',
    'salaryRange',
    'level',
    'postedBy',
    'companyType',
    'companyName',
    'location',
    'title',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await jobService.getAllJobs(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

//=================================update applicated user =======================

const getNotMyAppliedJobs = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const filters = pick(req.query, [
    'searchTerm',
    'jobStatus',
    'additionalInfo',
    'responsibilities',
    'description',
    'jobStatus',
    'salaryRange',
    'level',
    'postedBy',
    'companyType',
    'companyName',
    'location',
    'title',
    'status',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await jobService.getNotMyAppliedJobs(userId, filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});
const getMyAppliedJobs = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const filters = pick(req.query, [
    'searchTerm',
    'status',
    'additionalInfo',
    'responsibilities',
    'description',
    'jobStatus',
    'salaryRange',
    'level',
    'postedBy',
    'companyType',
    'companyName',
    'location',
    'title',
    'status',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await jobService.getMyAppliedJobs(userId, filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getMySingleApplication = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { jobId } = req.params;
  const result = await jobService.getMySingleApplication(userId, jobId!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job retrieved successfully',
    data: result,
  });
});

const applicationJobUser = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user.id;
  const result = await jobService.applicationJobUser(userId, jobId!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job applied successfully',
    data: result,
  });
});

const updateApplicationStatus = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { jobId } = req.params;
  const { status, interviewDate, notes } = req.body;

  const result = await jobService.updateApplicationStatus(
    userId,
    jobId!,
    status,
    interviewDate,
    notes,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.application,
  });
});

//===============================================================================

const singleJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await jobService.singleJob(id!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job retrieved successfully',
    data: result,
  });
});

const updateJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await jobService.updateJob(userId, id!, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job updated successfully',
    data: result,
  });
});

const deleteJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await jobService.deleteJob(userId, id!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job deleted successfully',
    data: result,
  });
});

const approvedJob = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await jobService.approvedJob(id!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job approved successfully',
    data: result,
  });
});

const appliedJob = catchAsync(async (req, res) => {
  const userId = req.user?.id;

  const filters = pick(req.query, [
    'searchTerm',
    'title',
    'location',
    'companyName',
    'companyType',
    'postedBy',
    'level',
  ]);

  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await jobService.appliedJob(userId, filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Applied jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const filterJobCvBased = catchAsync(async (req, res) => {
  const file = req.file;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await jobService.filterJobCvBased(options, file);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Applied jobs retrieved successfully',
    data: result,
  });
});

const getUniqueLocations = catchAsync(async (req, res) => {
  const result = await jobService.getUniqueLocations();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Unique locations retrieved successfully',
    data: result,
  });
});

// const getRecommendedJobs = catchAsync(async (req, res) => {
//   const userId = req.user?.id;
//   const filters = pick(req.query, [
//     'searchTerm',
//     'jobStatus',
//     'additionalInfo',
//     'responsibilities',
//     'description',
//     'jobStatus',
//     'salaryRange',
//     'level',
//     'postedBy',
//     'companyType',
//     'companyName',
//     'location',
//     'title',
//     'status',
//   ]);
//   const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//   const result = await jobService.getRecommendedJobs(userId, filters, options);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Recommended jobs retrieved successfully',
//     data: result,
//   });
// });

const getRecommendedJobs = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const filters = pick(req.query, [
    'searchTerm',
    'title',
    'location',
    'companyName',
    'companyType',
    'level',
    'salaryRange',
    'postedBy',
    'jobStatus',
    'status',
    'year',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await jobService.getRecommendedJobs(userId, filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recommended jobs retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const jobController = {
  createJob,
  getAllJobs,
  singleJob,
  updateJob,
  deleteJob,
  approvedJob,
  createManualJob,
  appliedJob,
  filterJobCvBased,
  applicationJobUser,
  getMyAppliedJobs,
  getNotMyAppliedJobs,
  updateApplicationStatus,
  getUniqueLocations,
  manualJob,
  getMySingleApplication,

  // getStudentAllJobs,
  // adminApplicationJobStatus,

  getRecommendedJobs

};
