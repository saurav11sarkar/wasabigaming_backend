import pick from "../../helper/pick";
import catchAsync from "../../utils/catchAsycn";
import sendResponse from "../../utils/sendResponse";
import { schoolManagementService } from "./school_management.service";

// const getAllStudents = catchAsync(async(req , res) =>{

//     const schoolId = req.user.id;
//     const options = pick(req.query, ['sortBy', 'limit', 'page']);
//     const filters = pick(req.query, ['searchTerm', 'status', 'year', 'firstName', 'lastName', 'email']);
//     const students = await schoolManagementService.getAllStudents(options, filters, schoolId);

//     sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: 'Students retrieved successfully',
//         data: students,
//       });


// })

const getSchoolStudents = catchAsync(async (req, res) => {
  const userId = req.user.id;
  console.log('School ID from token:', userId, "mahabur");

  const filters = pick(req.query, [
    'searchTerm',
    'name',
    'email',
    'status',
  ]);

  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await schoolManagementService.getSchoolStudents(
    userId,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'School students retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});


const getSingleStudent = catchAsync(async(req , res) =>{

    const studentId = req.params.id;
    const schoolId = req.user.id;

    const student = await schoolManagementService.getSingleStudent(studentId!, schoolId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Student retrieved successfully',
        data: student,
      });
});
const deleteStudent = catchAsync(async(req , res) =>{

    const studentId = req.params.id;
    const schoolId = req.user.id;
    const student = await schoolManagementService.deleteStudent(studentId!, schoolId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Student deleted successfully',
        data: student,
      });
});

const schoolOverview = catchAsync(async (req, res) => {
  const schoolId = req.user.id;
  const result = await schoolManagementService.schoolOverview(schoolId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'School overview retrieved successfully',
    data: result,
  });
});


export const schoolManagementController = {
    getSchoolStudents,
    getSingleStudent,
    deleteStudent,
    schoolOverview
}