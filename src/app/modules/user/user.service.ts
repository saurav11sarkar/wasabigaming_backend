import AppError from '../../error/appError';
import { fileUploader } from '../../helper/fileUploder';
import pagination, { IOption } from '../../helper/pagenation';
import sendMailer from '../../helper/sendMailer';
import Job from '../job/job.model';
import Premium from '../premium/premium.model';
import { userRole } from './user.constant';

import { IUser } from './user.interface';
import User from './user.model';

const createUser = async (payload: IUser) => {
  const randomPassword = Math.random().toString(36).slice(-8);
  payload.password = randomPassword;
  payload.role = userRole.student;
  payload.registered = true;
  const result = await User.create(payload);
  if (!result) {
    throw new AppError(400, 'Failed to create user');
  }

  await sendMailer(
    payload.email,
    '🎓 New Student Account Created',
    `
  <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 25px; border-radius: 8px;">
      
      <h2 style="color: #4A90E2; text-align: center;">🎉 Welcome to Our Platform!</h2>

      <p>Hello,</p>
      <p>Your student account has been successfully created. Below are your login details:</p>

      <div style="
        background: #f0f4ff; 
        padding: 15px; 
        border-left: 4px solid #4A90E2; 
        border-radius: 4px;
        margin: 20px 0;
      ">
        <p style="margin: 5px 0;"><strong>Email:</strong> ${payload.email}</p>
        <p style="margin: 5px 0;"><strong>Password:</strong> ${payload.password}</p>
      </div>

      <p>Please keep your login information safe.</p>

      <br />
      <p>Regards,<br /><strong>Your School Management Team</strong></p>

    </div>
  </div>
  `,
  );

  return result;
};

const getAllUser = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = [
    'firstName',
    'lastName',
    'email',
    'role',
    'schoolName',
    'schoolType',
    'schoolStatus',
    'aboutSchool',
    'grade',
  ];

  if (searchTerm) {
    andCondition.push({
      $or: userSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // if (Object.keys(filterData).length) {
  //   andCondition.push({
  //     $and: Object.entries(filterData).map(([field, value]) => ({
  //       [field]: value,
  //     })),
  //   });
  // }
  const cleanedFilter = Object.fromEntries(
    Object.entries(filterData).filter(
      ([_, value]) => value !== '' && value !== null && value !== undefined,
    ),
  );

  if (Object.keys(cleanedFilter).length) {
    andCondition.push({
      $and: Object.entries(cleanedFilter).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // YEAR Filter → createdAt
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

  const result = await User.find(whereCondition)
    .populate('subscription')
    .populate('course')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  if (!result) {
    throw new AppError(404, 'Users not found');
  }

  const total = await User.countDocuments(whereCondition);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};

const updateUserById = async (
  id: string,
  payload: IUser,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(id);
  // console.log('upadte user by id', payload);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (file) {
    const uploadProfile = await fileUploader.uploadToCloudinary(file);
    if (!uploadProfile?.url) {
      throw new AppError(400, 'Failed to upload profile image');
    }
    payload.profileImage = uploadProfile.url;
  }
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  // console.log(result);
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};


const updateMyProfile = async (
  id: string,
  payload: IUser,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(id);
  // console.log('upadte user by id', payload);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (file) {
    const uploadProfile = await fileUploader.uploadToCloudinary(file);
    if (!uploadProfile?.url) {
      throw new AppError(400, 'Failed to upload profile image');
    }
    payload.profileImage = uploadProfile.url;
  }
  const result = await User.findByIdAndUpdate(id, payload, { new: true });
  // console.log(result);
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};

const deleteUserById = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};

const profile = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(404, 'User not found');
  }

  let subscribe = null;
  if (result?.subscription) {
    subscribe = await Premium.findById(result?.subscription);
  }
  return {
    data: result,
    subscription: subscribe,
  };
};

const schoolOverview = async () => {
  console.log('first');
  const totalSchool = await User.countDocuments({ role: 'school' });

  const premiumSchool = await User.countDocuments({
    role: 'school',
    isSubscription: true,
  });

  const apprivedSchool = await User.countDocuments({
    role: 'school',
    schoolStatus: 'approved',
  });

  const pendingSchool = await User.countDocuments({
    role: 'school',
    schoolStatus: 'pending',
  });

  const rejectedSchool = await User.countDocuments({
    role: 'school',
    schoolStatus: 'rejected',
  });

  return {
    totalSchool,
    premiumSchool,
    apprivedSchool,
    pendingSchool,
    rejectedSchool,
  };
};

const getJobsMatchingUserSkills = async (userId: string, options: IOption) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  if (!user.skills || user.skills.length === 0) {
    return {
      data: [],
      meta: { total: 0, page: options.page, limit: options.limit },
    };
  }
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const query = {
    requiredSkills: { $in: user.skills },
  };

  const jobs = await Job.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Job.countDocuments(query);

  return {
    data: jobs,
    meta: { total, page, limit },
  };
};
export const getLoginHistoryFromDB = async (userId: string) => {
  const user = await User.findById(userId).select('loginHistory');

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // latest first
  const sortedHistory = user.loginHistory?.sort(
    (a: any, b: any) =>
      new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime(),
  );

  return sortedHistory || [];
};
export const userService = {
  createUser,
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
  profile,
  schoolOverview,
  getJobsMatchingUserSkills,
  getLoginHistoryFromDB,
  updateMyProfile
};
