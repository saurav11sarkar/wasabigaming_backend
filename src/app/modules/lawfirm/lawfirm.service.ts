import AppError from '../../error/appError';
import { fileUploader } from '../../helper/fileUploder';
import pagination, { IOption } from '../../helper/pagenation';
import Job from '../job/job.model';
import Premium from '../premium/premium.model';
import { userRole } from '../user/user.constant';
import User from '../user/user.model';
import { ILawfirm } from './lawfirm.interface';
import LawFirm from './lawfirm.model';

const createLawfirm = async (
  userId: string,
  payload: ILawfirm,
  files?: { [fieldname: string]: Express.Multer.File[] },
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  const logoFile = files?.logo?.[0];
  const coverFile = files?.coverImage?.[0];

  if (logoFile)
    payload.logo = (await fileUploader.uploadToCloudinary(logoFile)).url;
  if (coverFile)
    payload.coverImage = (await fileUploader.uploadToCloudinary(coverFile)).url;
  const result = await LawFirm.create({ ...payload, createdBy: user._id });
  return result;
};

const getAllLawfirm = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = [
    'location',
    'status',
    'description',
    'internshipTraining',
    'exertise',
    'aboutFirm',
    'tags',
    'firmName',
    'firmType',
    'headquarters',
  ];

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

  const result = await LawFirm.find(whereCondition)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  if (!result) {
    throw new AppError(404, 'Lawfirm not found');
  }

  const total = await LawFirm.countDocuments(whereCondition);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const getSingleLawfirm = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');

  // if (user.role !== 'admin') {
  //   const subscribe = await Premium.findById(user.subscription);
  //   if (subscribe?.name !== 'premium') {
  //     throw new AppError(403, 'Subscription plan error');
  //   }
  // }
  const result = await LawFirm.findById(id);
  if (!result) {
    throw new AppError(404, 'Lawfirm not found');
  }
  return result;
};

const uploadLawfirm = async (
  userId: string,
  id: string,
  payload: Partial<ILawfirm>,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, 'User not found');
  }
  const course = await LawFirm.findById(id);
  if (!course) {
    throw new AppError(400, 'lawfirm not found');
  }

  if (user.role !== 'admin') {
    if (course?.createdBy?.toString() !== user._id.toString()) {
      throw new AppError(400, 'You are not authorized to update this course');
    }
  }

  if (file) {
    const courseVideos = await fileUploader.uploadToCloudinary(file);
    payload.logo = courseVideos.url;
  }
  const result = await LawFirm.findByIdAndUpdate(
    id,
    { ...payload, createdBy: user._id },
    { new: true },
  );
  return result;
};

const deleteLawfirm = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, 'User not found');
  }
  const course = await LawFirm.findById(id);
  if (!course) {
    throw new AppError(400, 'lawfirm not found');
  }

  if (user.role !== 'admin') {
    if (course?.createdBy?.toString() !== user._id.toString()) {
      throw new AppError(400, 'You are not authorized to delete this course');
    }
  }

  const result = await LawFirm.findByIdAndDelete(id);
  return result;
};

const approvedLawfirm = async (id: string) => {
  const lawfirm = await LawFirm.findById(id);
  if (!lawfirm) {
    throw new AppError(400, 'lawfirm not found');
  }
  const result = await LawFirm.findByIdAndUpdate(
    id,
    { status: 'approved' },
    { new: true },
  );
  return result;
};

const getJobLawFirmBased = async (firmName: string) => {
  const job = await Job.find({ companyName: firmName });
  if (!job) {
    throw new AppError(404, 'Job not found');
  }
  return job;
};

export const lawfirmService = {
  createLawfirm,
  getAllLawfirm,
  getSingleLawfirm,
  uploadLawfirm,
  deleteLawfirm,
  approvedLawfirm,
  getJobLawFirmBased,
};
