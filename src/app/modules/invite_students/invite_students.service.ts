import InviteStudent from './invite_students.model';
import { IInviteStudent } from './invite_students.interface';
import AppError from '../../error/appError';
import pagination, { IOption } from '../../helper/pagenation';
import { fileUploader } from '../../helper/fileUploder';
import User from '../user/user.model';
import { userRole } from '../user/user.constant';
import sendMailer from '../../helper/sendMailer';
import { sendInvitation, sendPasswordAndEmail }  from '../../utils/createOtpTemplate';
import { Types } from "mongoose";
// import sendPasswordAndEmail from '../../utils/createOtpTemplate';

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
 const sendInvite = async (
  userId: string,
  payload: IInviteStudent | IInviteStudent[] 
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, 'User not found');
  }

  const schoolName = user.schoolName;
  const schoolCategory = user.schoolCategory;

  if (user.role !== userRole.school) {
    throw new AppError(403, 'Only school users can send invites');
  }

  const students = Array.isArray(payload) ? payload : [payload];
  const formattedStudents = students.map((student) => ({
    ...student,
    createBy: user._id,
    // url: fileUrl,
  }));

  const result = await InviteStudent.insertMany(formattedStudents);

await Promise.all(
  formattedStudents.map(student =>
    sendMailer(
      student.email,
      "Student Invitation",
       sendInvitation(
        student.name || '',
        schoolName || '',
        schoolCategory,
        student.email,
        userId
      )
    )
  )
);


  return result;
};

const getAllInviteStudents = async (params: any, options: IOption, schoolId:string) => {
  
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [{ createBy: schoolId }];
  const userSearchableFields = ['name', 'email'];
  if (searchTerm) {
    andCondition.push({
      $or: userSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    andCondition.push({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  const result = await InviteStudent.find(whereCondition)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);


  const total = await InviteStudent.countDocuments(whereCondition);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getInviteStudentById = async (id: string) => {
  const inviteStudent = await InviteStudent.findById(id);

  if (!inviteStudent) {
    throw new AppError(404, 'Student not found');
  }

  return inviteStudent;
};

const updatedInviteStudent = async (updateData: IInviteStudent, id: string, userId: string) => {
  console.log("mahabur");
  
  const updatedStudentData = await InviteStudent.findById(id);

  if (!updatedStudentData) {
    throw new AppError(404, 'Student data not found');
  }

  // if (updateData.email !== undefined) {
  //   const emailExists = await InviteStudent.findOne({
  //     email: updateData.email,
  //     _id: { $ne: id },
  //   });

  //   if (emailExists) {
  //     throw new AppError(409, 'Email already exists');
  //   }
  // }
  // const isOwner = updatedStudentData.createBy?.toString() === userId;
  // const isAdmin = (await User.findById(userId))?.role === userRole.admin;

  // if (!isOwner && !isAdmin) {
  //   throw new AppError(403, 'You are not authorized to update this student data');
  // }

  const updated = await InviteStudent.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  const updateStudentData = await User.findOne({ email: updatedStudentData.email })
  if (updateStudentData) {
    updateStudentData.schoolId = new Types.ObjectId(userId); 
    await updateStudentData.save();
  }
  return updated;
};

const deleteInviteStudent = async (id: string, userId:string) => {

  const inviteStudentData = await InviteStudent.findById(id);
  if (!inviteStudentData) {
    throw new AppError(404, 'Student not found');
  }
  const isOwner = inviteStudentData.createBy?.toString() === userId;
  const isAdmin = (await User.findById(userId))?.role === userRole.admin;

  if (!isOwner && !isAdmin) {
    throw new AppError(403, 'You are not authorized to update this student data');
  }

  await InviteStudent.findByIdAndDelete(id);

  return inviteStudentData;
};

const updateInviteStudentStatus = async (payload: any) => {
  const { email, status, schoolId, name } = payload;
  // console.log(payload);

  const school = await User.findById(schoolId);
  // console.log('School found:', school);
  if (!school) {
    throw new AppError(404, 'School not found');
  }

  const inviteStudent = await InviteStudent.findOne({ email });
  if (!inviteStudent) {
    throw new AppError(404, 'Invite student not found');
  }

  if (status === 'accepted') {
    let studentUser = await User.findOne({ email });
    let password = null;
    if (!studentUser) {
      password = generateSixDigitCode();
      studentUser = await User.create({
        name: name,
        email: email,
        role: 'student',
        schoolId: school._id,
        password,
        registered:true,
        isSubscription:true,
        subscription:school.subscription,
        subscriptionExpiry:school.subscriptionExpiry
      });

        inviteStudent.name = name;
        await inviteStudent.save();

        await sendMailer(
          email,
          name,
          sendPasswordAndEmail(password, email, 'Aspiring Legal Network.'),
      );
    } else {
      studentUser.schoolId = school._id;
      await studentUser.save();
    }
    inviteStudent.status = 'accepted';
    await inviteStudent.save();

    return {
      inviteStatus: inviteStudent,
      student: studentUser,
    };
  }
  if (status === 'rejected') {
    inviteStudent.status = 'rejected';
    await inviteStudent.save();

    return {
      inviteStatus: inviteStudent,
    };
  }

  throw new AppError(400, 'Invalid invite status');
};


export const studentInviteService = {
  sendInvite,
  getAllInviteStudents,
  getInviteStudentById,
  deleteInviteStudent,
  updatedInviteStudent,
  updateInviteStudentStatus,
};
