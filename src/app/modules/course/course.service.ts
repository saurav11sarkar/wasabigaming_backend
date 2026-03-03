import Stripe from 'stripe';
import AppError from '../../error/appError';
import { fileUploader } from '../../helper/fileUploder';
import pagination, { IOption } from '../../helper/pagenation';
import User from '../user/user.model';
import { ICourse } from './course.interface';
import Course from './course.model';
import config from '../../config';
import Payment from '../payment/payment.model';
import { CourseQuizAttempt } from '../courseQuizAttempt/courseQuizAttempt.model';
import mongoose from 'mongoose';
import Certificate from '../certificate/certificate.model';
import VideoProgress from '../videoProgress/videoProgress.model';

const stripe = new Stripe(config.stripe.secretKey!);

// const createCourse = async (
//   userId: string,
//   payload: ICourse,
//   files?: Express.Multer.File[],
//   titles?: string[], // optional custom titles
// ) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(400, 'User not found');

//   const courseExist = await Course.findOne({ name: payload.name });
//   if (courseExist) throw new AppError(400, 'Course already exists');

//   if (files && files.length > 0) {
//     const uploadedVideos = await Promise.all(
//       files.map(async (file, index) => {
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return {
//           title: titles?.[index] || file.originalname, // use custom title or fallback
//           url: uploaded.url,
//           time: '00:00',
//         };
//       }),
//     );

//     payload.courseVideo = uploadedVideos;
//   }

//   const result = await Course.create({ ...payload, createdBy: user._id });
//   return result;
// };

const createCourse = async (
  userId: string,
  payload: ICourse,
  files?: {
    courseVideo?: Express.Multer.File[];
    thumbnail?: Express.Multer.File[];
  },
  titles?: string[],
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const courseExist = await Course.findOne({ name: payload.name });
  if (courseExist) throw new AppError(400, 'Course already exists');

  // ✅ Upload videos
  if (files?.courseVideo?.length) {
    payload.courseVideo = await Promise.all(
      files.courseVideo.map(async (file, index) => {
        const uploaded = await fileUploader.uploadToCloudinary(file);
        return {
          title: titles?.[index] || file.originalname,
          url: uploaded.url,
          time: '00:00',
        };
      }),
    );
  }

  // ✅ Upload thumbnail (single file)
  if (files?.thumbnail?.[0]) {
    const uploadedThumbnail = await fileUploader.uploadToCloudinary(
      files.thumbnail[0],
    );
    payload.thumbnail = uploadedThumbnail.url;
  }

  const result = await Course.create({
    ...payload,
    createdBy: user._id,
  });

  return result;
};

// const uploadCourse = async (
//   userId: string,
//   id: string,
//   payload: Partial<ICourse>,
//   files?: Express.Multer.File[],
//   titles?: string[],
// ) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(400, 'User not found');

//   const course = await Course.findById(id);
//   if (!course) throw new AppError(400, 'Course not found');

//   if (
//     user.role !== 'admin' &&
//     course.createdBy &&
//     course.createdBy.toString() !== user._id.toString()
//   ) {
//     throw new AppError(400, 'You are not authorized to update this course');
//   }

//   if (files && files.length > 0) {
//     const uploadedVideos = await Promise.all(
//       files.map(async (file, index) => {
//         const uploaded = await fileUploader.uploadToCloudinary(file);
//         return {
//           title: titles?.[index] || file.originalname,
//           url: uploaded.url,
//           time: '00:00',
//         };
//       }),
//     );

//     payload.courseVideo = uploadedVideos;
//   }

//   const result = await Course.findByIdAndUpdate(
//     id,
//     { ...payload, createdBy: user._id },
//     { new: true },
//   );
//   return result;
// };

const uploadCourse = async (
  userId: string,
  courseId: string,
  payload: Partial<ICourse>,
  files?: {
    courseVideo?: Express.Multer.File[];
    thumbnail?: Express.Multer.File[];
  },
  titles?: string[],
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(404, 'Course not found');

  // Upload new videos (append)
  if (files?.courseVideo?.length) {
    const uploadedVideos = await Promise.all(
      files.courseVideo.map(async (file, index) => {
        const uploaded = await fileUploader.uploadToCloudinary(file);
        return {
          title: titles?.[index] || file.originalname,
          url: uploaded.url,
          time: '00:00',
        };
      }),
    );

    course.courseVideo = [...(course.courseVideo || []), ...uploadedVideos];
  }

  // Replace thumbnail if provided
  if (files?.thumbnail?.[0]) {
    const uploadedThumbnail = await fileUploader.uploadToCloudinary(
      files.thumbnail[0],
    );
    course.thumbnail = uploadedThumbnail.url;
  }

  // Update other fields
  Object.assign(course, payload);

  await course.save();
  return course;
};

// const getAllCourse = async (params: any, options: IOption) => {
//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);
//   const { searchTerm, year, ...filterData } = params;

//   const andCondition: any[] = [];
//   const userSearchableFields = [
//     'name',
//     'description',
//     'gradeLevel',
//     'category',
//   ];

//   if (searchTerm) {
//     andCondition.push({
//       $or: userSearchableFields.map((field) => ({
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

//   if (year) {
//     const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
//     const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
//     andCondition.push({ createdAt: { $gte: startDate, $lte: endDate } });
//   }

//   const whereCondition = andCondition.length ? { $and: andCondition } : {};

//   const result = await Course.find(whereCondition)
//     .skip(skip)
//     .limit(limit)
//     .sort({ [sortBy]: sortOrder } as any)
//     .populate({
//       path: 'courseVideo.quiz',
//       model: 'Quizzes',
//     })
//     .populate('reviews');

//   const total = await Course.countDocuments(whereCondition);

//   return { data: result, meta: { total, page, limit } };
// };

const getAllCourse = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = [
    'name',
    'description',
    'gradeLevel',
    'category',
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

  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    andCondition.push({ createdAt: { $gte: startDate, $lte: endDate } });
  }

  const whereCondition = andCondition.length ? { $and: andCondition } : {};

  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const result = await Course.aggregate([
    { $match: whereCondition },

    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'courseId',
        as: 'reviewData',
      },
    },

    {
      $addFields: {
        averageRating: {
          $cond: [
            { $eq: [{ $size: '$reviewData' }, 0] },
            0,
            { $avg: '$reviewData.rating' },
          ],
        },
        totalReviews: { $size: '$reviewData' },
      },
    },

    { $sort: { [sortBy || 'createdAt']: sortDirection } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Course.countDocuments(whereCondition);

  return { data: result, meta: { total, page, limit } };
};

const getUserSingleCourse = async (userId: string, courseId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  // validate course
  const course = await Course.findById(courseId).populate({
    path: 'courseVideo.quiz',
    model: 'Quizzes',
  });
  if (!course) throw new AppError(400, 'Course not found');

  // fetch all attempts of this user for this course
  const attempts = await CourseQuizAttempt.find({
    user: userId,
    course: courseId,
  }).select('video');

  // attempted video ids
  const attemptedVideoIds = attempts.map((a) => a.video.toString());

  const courseObj = course.toObject();

  // add attempted flag per video
  if (courseObj.courseVideo) {
    courseObj.courseVideo = courseObj.courseVideo.map((video) => ({
      ...video,
      attempted: attemptedVideoIds.includes(video._id?.toString() || ''),
    }));
  }

  return courseObj;
};
const getSingleCourse = async (id: string) => {
  const result = await Course.findById(id)
    .populate({
      path: 'courseVideo.quiz',
      model: 'Quizzes',
    })
    .populate(
      'createdBy',
      'firstName lastName schoolName schoolType email role profileImage phone',
    )
    .populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'firstName lastName email profileImage',
      },
    });
  if (!result) throw new AppError(404, 'Course not found');
  return result;
};

const deleteCourse = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(id);
  if (!course) throw new AppError(400, 'Course not found');

  if (
    user.role !== 'admin' &&
    course.createdBy &&
    course.createdBy.toString() !== user._id.toString()
  ) {
    throw new AppError(400, 'You are not authorized to delete this course');
  }

  const result = await Course.findByIdAndDelete(id);
  return result;
};

const addCourseVideo = async (
  userId: string,
  courseId: string,
  files: Express.Multer.File[],
  titles?: string[],
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(404, 'Course not found');

  if (
    user.role !== 'admin' &&
    course.createdBy?.toString() !== user._id.toString()
  ) {
    throw new AppError(403, 'Unauthorized');
  }

  const uploadedVideos = await Promise.all(
    files.map(async (file, index) => {
      const uploaded = await fileUploader.uploadToCloudinary(file);
      return {
        title: titles?.[index] || file.originalname,
        url: uploaded.url,
        time: '00:00',
      };
    }),
  );

  if (!course.courseVideo) {
    course.courseVideo = [];
  }
  course.courseVideo.push(...uploadedVideos);
  await course.save();

  return course;
};

const removeCourseVideo = async (
  userId: string,
  courseId: string,
  videoId: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(404, 'Course not found');

  if (
    user.role !== 'admin' &&
    course.createdBy?.toString() !== user._id.toString()
  ) {
    throw new AppError(403, 'Unauthorized');
  }

  if (!course.courseVideo) {
    throw new AppError(400, 'No videos found in this course');
  }

  course.courseVideo = course.courseVideo.filter(
    (video: any) => video._id.toString() !== videoId,
  );

  await course.save();
  return course;
};

const payCourse = async (userId: string, courseId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(400, 'Course not found');

  // if (!user.isSubscription)
  //   throw new AppError(400, 'You are not subscribed to this course');

  if (user.role !== 'student')
    throw new AppError(400, 'You are not authorized to pay for this course');
  if (course.coursePrice !== 0) {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: Number(course.coursePrice) * 100,
            product_data: {
              name: course.name,
              description: course.description || 'No description',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      success_url: `${config.frontendUrl}/success`,
      cancel_url: `${config.frontendUrl}/cancel`,
      metadata: {
        userId: user._id.toString(),
        paymentType: 'course',
        courseId: course._id.toString(),
        courseName: course.name,
        coursePrice: course.coursePrice!.toString(),
      },
    } as Stripe.Checkout.SessionCreateParams);

    await Payment.create({
      user: user._id,
      course: course._id,
      amount: course.coursePrice,
      stripeSessionId: session.id,
      currency: 'gbp',
      status: 'pending',
    });

    return { url: session.url, sessionId: session.id };
  }
  if (!course.enrolledStudents) {
    course.enrolledStudents = [];
  }

  const alreadyEnrolled = course.enrolledStudents.some(
    (id) => id.toString() === user._id.toString(),
  );

  if (!alreadyEnrolled) {
    course.enrolledStudents.push(user._id);
    await course.save();
  }
  await course.save();
  return { url: null, sessionId: null };
};

const couseEnroleuser = async (userId: string, courseId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(400, 'Course not found');

  if ((course?.coursePrice ?? 0) > 0) {
    if (
      !course.enrolledStudents?.some(
        (studentId) => studentId.toString() === user._id.toString(),
      )
    ) {
      throw new AppError(400, 'You are not enrolled to this course');
    }
  }

  const result = await Course.findById(courseId)
    .populate('enrolledStudents')
    .populate({
      path: 'courseVideo.quiz',
      model: 'Quizzes',
    });

  return result;
};

const couseHeader = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const enrolledCourseCount = await Course.countDocuments({
    enrolledStudents: userObjectId,
  });

  const totalCertificate = await Certificate.countDocuments({
    user: userObjectId,
  });

  const purchasedCourseCount = await Payment.countDocuments({
    user: userObjectId,
    status: 'completed',
    course: { $ne: null },
  });

  // const completedVideoCount = 0;
  const completedVideoCount = await VideoProgress.countDocuments({
    user: userObjectId,
    isCompleted: true,
  });

  return {
    enrolledCourseCount,
    purchasedCourseCount,
    completedVideoCount,
    totalCertificate,
  };
};

const dashboardOverview = async () => {
  const totalStudents = await User.countDocuments({
    role: 'student',
    status: 'active',
  });

  const totalFreeCourses = await Course.countDocuments({
    isCourseFree: true,
    status: 'active',
  });

  return {
    totalStudents,
    totalFreeCourses,
  };
};

export const courseService = {
  createCourse,
  uploadCourse,
  getAllCourse,
  getSingleCourse,
  deleteCourse,
  addCourseVideo,
  removeCourseVideo,
  payCourse,
  couseEnroleuser,
  getUserSingleCourse,
  couseHeader,
  dashboardOverview,
};
