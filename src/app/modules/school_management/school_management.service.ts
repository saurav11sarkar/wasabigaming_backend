import pagination, { IOption } from "../../helper/pagenation"
import User from "../user/user.model";
import InviteStudent from "../invite_students/invite_students.model";
import { Types } from 'mongoose';
import AppError from "../../error/appError";
import Aiassessment from "../aiassessment/aiassessment.model";

// const getAllStudents = async (
//   params: any,
//   options: IOption,
//   schoolId: string
// ) => {
//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);
//   const { searchTerm, year } = params;


//   const matchStage: any = {
//     status: 'accepted',
//     createBy: new Types.ObjectId(schoolId),
//   };

//   // 📅 Year filter
//   if (year) {
//     matchStage.createdAt = {
//       $gte: new Date(`${year}-01-01T00:00:00.000Z`),
//       $lte: new Date(`${year}-12-31T23:59:59.999Z`),
//     };
//   }

//   const pipeline: any[] = [

//     { $match: matchStage },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'email',
//         foreignField: 'email',
//         as: 'student',
//       },
//     },
//     { $unwind: '$student' },
//     {
//       $match: {
//         'student.role': 'student',
//       },
//     },
//   ];

//   if (searchTerm) {
//     pipeline.push({
//       $match: {
//         $or: [
//           { 'student.firstName': { $regex: searchTerm, $options: 'i' } },
//           { 'student.lastName': { $regex: searchTerm, $options: 'i' } },
//           { 'student.email': { $regex: searchTerm, $options: 'i' } },
//         ],
//       },
//     });
//   }

//   pipeline.push({
//     $sort: {
//       [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1,
//     },
//   });

//   pipeline.push(
//     { $skip: skip },
//     { $limit: limit }
//   );

//   pipeline.push({
//     $project: {
//       _id: 1,
//       email: 1,
//       status: 1,
//       createdAt: 1,

//       student: {
//         _id: '$student._id',
//         firstName: '$student.firstName',
//         lastName: '$student.lastName',
//         email: '$student.email',
//         grade: '$student.grade',
//         profileImage: '$student.profileImage',
//         status: '$student.status'
//       },
//     },
//   });

//   const countPipeline = [
//     ...pipeline.filter(stage => !('$skip' in stage || '$limit' in stage)),
//     { $count: 'total' },
//   ];

//   const [data, totalResult] = await Promise.all([
//     InviteStudent.aggregate(pipeline),
//     InviteStudent.aggregate(countPipeline),
//   ]);

//   const total = totalResult[0]?.total || 0;

//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data,
//   };
// };
// const getSchoolStudents = async (
//   userId: string,
//   params: any,
//   options: IOption,
// ) => {
//   // Check school exists
//   const school = await User.findById(userId);
//   if (!school) throw new AppError(404, 'School not found');

//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);
//   const { searchTerm, ...filterData } = params;

//   const andCondition: any[] = [];

//   // Only accepted invites created by this school
//   andCondition.push({ status: 'accepted' });
//   andCondition.push({ createBy: userId });

//   const searchableFields = ['name', 'email'];

//   if (searchTerm) {
//     andCondition.push({
//       $or: searchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: 'i' },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length) {
//     andCondition.push({
//       $and: Object.entries(filterData).map(([field, value]) => ({
//         [field]: value,
//       })),
//     });
//   }

//   const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

//   const result = await InviteStudent.find(whereCondition)
//     .populate('createBy', 'schoolName email')
//     .skip(skip)
//     .limit(limit)
//     .sort({ [sortBy]: sortOrder } as any);

//   if (!result) throw new AppError(404, 'No students found');

//   const total = await InviteStudent.countDocuments(whereCondition);

//   return {
//     data: result,
//     meta: {
//       total,
//       page,
//       limit,
//     },
//   };
// };
const getSchoolStudents = async (
  userId: string,
  params: any,
  options: IOption,
) => {
  // Check school exists
  const school = await User.findById(userId);
  if (!school) throw new AppError(404, 'School not found');

  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const inviteCondition: any[] = [];

  // Only accepted invites created by this school
  inviteCondition.push({ status: 'accepted' });
  inviteCondition.push({ createBy: new Types.ObjectId(userId) });

  const whereCondition =
    inviteCondition.length > 0 ? { $and: inviteCondition } : {};

  // Step 1: Get all accepted invites for this school
  const acceptedInvites = await InviteStudent.find(whereCondition).lean();

  if (!acceptedInvites.length) {
    return {
      data: [],
      meta: { total: 0, page, limit },
    };
  }

  // Step 2: Extract invited emails
  const invitedEmails = acceptedInvites.map((invite) => invite.email);

  // Step 3: Build User query conditions
  const userCondition: any[] = [
    { role: 'student' },
    { schoolId: new Types.ObjectId(userId) },
    { email: { $in: invitedEmails } },
  ];

  // Search across user fields
  const searchableFields = ['firstName', 'lastName', 'email', 'phone', 'grade'];
  if (searchTerm) {
    userCondition.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    userCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const userWhereCondition = { $and: userCondition };

  // Step 4: Get total count for pagination
  const total = await User.countDocuments(userWhereCondition);

  // Step 5: Fetch full student profiles with all relations
  const students = await User.find(userWhereCondition)
    .select('-password -otp -otpExpiry -loginHistory')
    .populate('course', 'title description duration')
    .populate('subscription', 'plan price expiry')
    .populate('applicationJob.job', 'title company location salary')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any)
    .lean();

  // Step 6: Attach invite info + assessment stats to each student
  const inviteMap = new Map(
    acceptedInvites.map((invite) => [invite.email, invite]),
  );

  const studentIds = students.map((s) => s._id);

  // Fetch assessments for all students in one query
  const assessments = await Aiassessment.find({
    applicationUser: { $in: studentIds },
  })
    .select('title type status applicationUser')
    .lean();

  // Map assessments count per student
  const assessmentCountMap = new Map<string, number>();
  assessments.forEach((assessment) => {
    assessment?.applicationUser?.forEach((uid: any) => {
      const key = uid.toString();
      assessmentCountMap.set(key, (assessmentCountMap.get(key) || 0) + 1);
    });
  });

  const enrichedStudents = students.map((student) => {
    const invite = inviteMap.get(student.email);
    const totalApplications = student.applicationJob?.length || 0;

    const applicationsByStatus = (student.applicationJob || []).reduce(
      (acc: Record<string, number>, app: any) => {
        const status = app.status || 'Applied';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );

    return {
      profile: {
        ...student,
      },
      invite: {
        name: invite?.name,
        email: invite?.email,
        status: invite?.status,
        invitedAt: invite?._id,
      },
      stats: {
        totalApplications,
        applicationsByStatus,
        totalAssessments: assessmentCountMap.get(student._id.toString()) || 0,
        totalCourses: student.course?.length || 0,
      },
    };
  });

  return {
    data: enrichedStudents,
    meta: {
      total,
      page,
      limit,
    },
  };
};


const getSingleStudent = async (studentId: string, schoolId: string) => {
    const student = await User.findOne({ _id: studentId, schoolId, role: 'student' })
    .populate('schoolId', 'schoolName schoolType');
    return student;
}

const deleteStudent = async (studentId: string, schoolId: string) => {
    const student = await User.findOneAndDelete({ _id: studentId, schoolId, role: 'student' });
    return student;
}


const schoolOverview = async (schoolId: string) => {
  const schoolObjectId = new Types.ObjectId(schoolId);
  const schoolExists = await User.findById(schoolObjectId);

  if (!schoolExists) {
    throw new Error('School not found');
  }

  // Basic student counts
  const totalStudents = await User.countDocuments({
    role: 'student',
    schoolId: schoolObjectId,
  });

  const activeStudents = await User.countDocuments({
    role: 'student',
    schoolId: schoolObjectId,
    status: 'active',
  });

  const inactiveStudents = await User.countDocuments({
    role: 'student',
    schoolId: schoolObjectId,
    status: 'inactive',
  });

  // Aggregate total applied applications across all students in this school
  const applicationAggregation = await User.aggregate([
    {
      $match: {
        role: 'student',
        schoolId: schoolObjectId,
      },
    },
    {
      $project: {
        totalApplications: { $size: { $ifNull: ['$applicationJob', []] } },
      },
    },
    {
      $group: {
        _id: null,
        totalAppliedApplications: { $sum: '$totalApplications' },
      },
    },
  ]);

  const totalAppliedApplications =
    applicationAggregation.length > 0
      ? applicationAggregation[0].totalAppliedApplications
      : 0;

  const schoolStudentIds = await User.find(
    { role: 'student', schoolId: schoolObjectId },
    { _id: 1 },
  ).lean();

  const studentIds = schoolStudentIds.map((s) => s._id);

  const totalAssessments = await Aiassessment.aggregate([
    {
      $match: {
        applicationUser: { $in: studentIds },
      },
    },
    {
      $project: {
        matchedUsers: {
          $size: {
            $filter: {
              input: '$applicationUser',
              as: 'userId',
              cond: { $in: ['$$userId', studentIds] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: '$matchedUsers' },
      },
    },
  ]);

  const totalAssessmentCount =
    totalAssessments.length > 0 ? totalAssessments[0].totalAssessments : 0;

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    totalAppliedApplications,
    totalAssessments: totalAssessmentCount,
  };
};



export const schoolManagementService = {
    getSchoolStudents,
    getSingleStudent,
    deleteStudent,
    schoolOverview
}