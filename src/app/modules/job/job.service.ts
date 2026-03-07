import { Types } from 'mongoose';
import AppError from '../../error/appError';
import { aiIntregation, cvBasedJobFilter } from '../../helper/aiEndpoint';
import pagination, { IOption } from '../../helper/pagenation';
import Lawfirm from '../lawfirm/lawfirm.model';
import { userRole } from '../user/user.constant';
import User from '../user/user.model';
import { IJob } from './job.interface';
import Job from './job.model';
import dayjs from 'dayjs';
import CVbuilder from '../cvbuilder/cvbuilder.model';

// export const extractClosingDate = (text?: string): Date | null => {
//   if (!text) return null;

//   // Case 1: date inside parentheses
//   const parenMatch = text.match(/\((.*?)\)/);
//   if (parenMatch) {
//     const clean = parenMatch[1]?.replace(/at\s.*$/i, "").trim();
//     const parsed = dayjs(clean);
//     return parsed.isValid() ? parsed.toDate() : null;
//   }

//   // Case 2: "Closes on Friday 10 April 2026"
//   const onMatch = text.match(/Closes on (.+)/i);
//   if (onMatch) {
//     const clean = onMatch[1]?.replace(/at\s.*$/i, "").trim();
//     const parsed = dayjs(clean);
//     return parsed.isValid() ? parsed.toDate() : null;
//   }

//   return null;
// };

export const extractClosingDate = (text?: string): string | null => {
  if (!text) return null;

  // Case 1: date inside parentheses
  const parenMatch = text.match(/\((.*?)\)/);
  if (parenMatch) {
    const clean = parenMatch[1]?.replace(/at\s.*$/i, '').trim();
    const parsed = dayjs(clean);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  }

  // Case 2: "Closes on Friday 10 April 2026"
  const onMatch = text.match(/Closes on (.+)/i);
  if (onMatch) {
    const clean = onMatch[1]?.replace(/at\s.*$/i, '').trim();
    const parsed = dayjs(clean);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  }

  return null;
};

export interface ILawFirmJob {
  vacancy_id: string;
  title: string;
  url: string;
  employer: string;
  location: string;
  distance: string;
  start_date: string;
  training_course: string;
  wage: string;
  closing_text: string;
  posted_date: string;
  disability_confident: boolean;
  companyType: string;
}

const createManualJob = async (userId: string, payload: IJob) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');

  const result = await Job.create({ ...payload, createBy: userId });
  return result;
};

// const createJob = async (userId: string, job_title: string) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(404, 'user is not found');

//   const dataResponse: ILawFirmJob[] = await aiIntregation.lawFirmAi(job_title);
// console.log(dataResponse)

//   const result = await Promise.all(
//     dataResponse.map(async (data) => {
//       const lawfirm = await Lawfirm.findOne({ firmName: data.employer });
//       const jobID = await Job.findOne({ jobId: data.vacancy_id });
//       if (jobID) {
//         return null;
//       }
//       const text = data.closing_text;
//       const match = text.match(/\((.*?)\)/);

//       const date = match ? dayjs(match[1]).toDate() : null;

//       const job = await Job.findOneAndUpdate({
//         title: data.title,
//         url: data.url,
//         location: data.location,
//         companyName: data.employer,
//         companyType: data?.companyType || null,
//         postedBy: data.employer,
//         description: data.training_course || null,
//         level: data.training_course || null,
//         salaryRange: data.wage || '0',
//         startDate: data.start_date,
//         applicationDeadline: date,
//         jobId: data.vacancy_id,
//         jobStatus: 'Open',
//         status: 'inactive',
//         createBy: userId,
//         companyId: lawfirm?._id || null,
//       });

//       if (lawfirm && job) {
//         lawfirm?.jobs?.push(job._id);
//         await lawfirm.save();
//       }

//       return job;
//     }),
//   );

//   // Filter out null values (existing jobs)
//   const filteredResult = result.filter((job) => job !== null);

//   return filteredResult;
// };

// const createJob = async (userId: string, job_title: string) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(404, 'User is not found');

//   const dataResponse: ILawFirmJob[] = await aiIntregation.lawFirmAi(job_title);

//   const results = await Promise.all(
//     dataResponse.map(async (data) => {
//       try {
//         const lawfirm = await Lawfirm.findOne({
//           firmName: data.employer,
//         });

//         // robust date parsing
//         const applicationDeadline = extractClosingDate(data.closing_text);

//         // UPSERT — prevents duplicates + race condition
//         const job = await Job.findOneAndUpdate(
//           { jobId: data.vacancy_id },
//           {
//             title: data.title,
//             url: data.url,
//             location: data.location,
//             companyName: data.employer,
//             companyType: data?.companyType || null,
//             postedBy: data.employer,
//             description: data.training_course || null,
//             level: data.training_course || null,
//             salaryRange: data.wage || '0',
//             startDate: data.start_date,
//             applicationDeadline,
//             jobId: data.vacancy_id,
//             jobStatus: 'Open',
//             status: 'inactive',
//             createBy: userId,
//             companyId: lawfirm?._id || null,
//           },
//           {
//             upsert: true,
//             new: true,
//             setDefaultsOnInsert: true,
//           },
//         );

//         // prevent duplicate push into lawfirm.jobs
//         if (lawfirm && job) {
//           const alreadyExists = lawfirm.jobs?.some(
//             (id: any) => id.toString() === job._id.toString(),
//           );

//           if (!alreadyExists) {
//             lawfirm?.jobs?.push(job._id);
//             await lawfirm.save();
//           }
//         }

//         return job;
//       } catch (error) {
//         console.error('Job creation failed:', error);
//         return null;
//       }
//     }),
//   );

//   // remove null safely
//   return results.filter(Boolean);
// };

const createJob = async (userId: string, job_title: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User is not found');

  const dataResponse: ILawFirmJob[] = await aiIntregation.lawFirmAi(job_title);

  const results = await Promise.all(
    dataResponse.map(async (data) => {
      try {
        // lawfirm find
        const lawfirm = await Lawfirm.findOne({
          firmName: { $regex: data.employer.trim(), $options: 'i' },
        });

        const applicationDeadline = extractClosingDate(data.closing_text);

        // job create / update
        const job = await Job.findOneAndUpdate(
          { jobId: data.vacancy_id },
          {
            title: data.title,
            url: data.url,
            location: data.location,
            companyName: data.employer,
            companyType: data?.companyType || null,
            postedBy: data.employer,
            description: data.training_course || null,
            level: data.training_course || null,
            salaryRange: data.wage || '0',
            startDate: data.start_date,
            applicationDeadline,
            jobId: data.vacancy_id,
            jobStatus: 'Open',
            status: 'inactive',
            createBy: userId,
            companyId: lawfirm?._id || null,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        // add job into lawfirm
        if (lawfirm && job) {
          await Lawfirm.updateOne(
            { _id: lawfirm._id },
            {
              $addToSet: { jobs: job._id },
            },
          );
        }

        return job;
      } catch (error) {
        console.error('Job creation failed:', error);
        return null;
      }
    }),
  );

  return results.filter(Boolean);
};

const manualJob = async (userId: string, payload: IJob) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  if (user.role === userRole.student) {
    payload.status = 'active';
    payload.jobStatus = 'Open';
  } else if (user.role === userRole.admin) {
    payload.status = 'active';
    payload.jobStatus = 'Open';
  }
  payload.jobId = `MAN${Date.now()}`;

  const result = await Job.create({
    ...payload,
    createBy: userId,
  });

  return result;
};

// const adminApplicationJobStatus = async (jobId: string, status: string) => {
//   const job = await Job.findById(jobId);
//   if (!job) throw new AppError(404, 'Job not found');

//   if (job.status === 'active' || job.status === 'inactive') {
//     throw new AppError(
//       400,
//       `Cannot update application with current status: ${job.status}`,
//     );
//   }

//   job.status = status;
//   await job.save();
//   return job;
// };

const getStudentAllJobs = async (
  params: any,
  options: IOption,
  userRole: 'student' | 'admin',
) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = [
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
    'applicationJob',
  ];

  // 🔍 Search
  if (searchTerm) {
    andCondition.push({
      $or: userSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // 🎯 Filters
  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // 📅 Year filter
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    andCondition.push({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // 🔹 Find jobs with role filter
  const jobs = await Job.find(whereCondition)
    .populate({
      path: 'createBy',
      match: { role: userRole }, // role filter
      select: '-password',
    })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy || 'createdAt']: sortOrder || -1 } as any);

  // 🔹 Remove jobs not matching role
  const filteredJobs = jobs.filter((job) => job.createBy);

  if (filteredJobs.length === 0) {
    throw new AppError(404, 'Jobs not found for this role');
  }

  // 🔹 Total after role filter
  const total = filteredJobs.length;

  return {
    data: filteredJobs,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const getAllJobs = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = [
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

  const result = await Job.find(whereCondition)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  if (!result) {
    throw new AppError(404, 'Job not found');
  }

  const total = await Job.countDocuments(whereCondition);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const singleJob = async (id: string) => {
  const result = await Job.findById(id);
  if (!result) {
    throw new AppError(404, 'Job not found');
  }
  return result;
};

const updateJob = async (
  userId: string,
  id: string,
  payload: Partial<IJob>,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');

  const job = await Job.findById(id);
  if (!job) throw new AppError(404, 'Job not found');
  if (user.role !== userRole.admin) {
    if (job.createBy?.toString() !== userId)
      throw new AppError(404, 'You are not authorized to update this job');
  }

  const result = await Job.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteJob = async (userId: string, id: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'user is not found');

  const job = await Job.findById(id);
  if (!job) throw new AppError(404, 'Job not found');
  if (user.role !== userRole.admin) {
    if (job.createBy?.toString() !== userId)
      throw new AppError(404, 'You are not authorized to delete this job');
  }

  const result = await Job.findByIdAndDelete(id);
  return result;
};

const approvedJob = async (id: string) => {
  const result = await Job.findByIdAndUpdate(
    id,
    { status: 'active' },
    { new: true },
  );
  if (!result) throw new AppError(404, 'Job not found');
  return result;
};

const appliedJob = async (userId: string, params: any, options: IOption) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondition: any[] = [];

  const searchableFields = [
    'title',
    'location',
    'companyName',
    'companyType',
    'postedBy',
    'level',
  ];

  // search
  if (searchTerm) {
    andCondition.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // filters
  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // applied job condition
  andCondition.push({ applicants: userId });

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  const result = await Job.find(whereCondition)
    .populate('applicants', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  const total = await Job.countDocuments(whereCondition);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

//================== update applicated user ===========================
// const getNotMyAppliedJobs = async (
//   userId: string,
//   params: any,
//   options: IOption,
// ) => {
//   const user = await User.findById(userId);
//   if (!user) throw new AppError(404, 'User not found');

//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);
//   const { searchTerm, year, ...filterData } = params;

//   console.log(filterData);

//   const andCondition: any[] = [];

//   const searchableFields = [
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
//   ];

//   if (searchTerm !== undefined && searchTerm !== null) {
//     andCondition.push({
//       $or: searchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: 'i' },
//       })),
//     });
//   }

//   // if (Object.keys(filterData).length) {
//   //   andCondition.push({
//   //     $and: Object.entries(filterData).map(([field, value]) => ({
//   //       [field]: value,
//   //     })),
//   //   });
//   // }
//   if (Object.keys(filterData).length) {
//     andCondition.push({
//       $and: Object.entries(filterData).map(([field, value]) => ({
//         [field]: { $regex: value, $options: 'i' },
//       })),
//     });
//   }

//   if (year) {
//     const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
//     const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

//     andCondition.push({
//       createdAt: { $gte: startDate, $lte: endDate },
//     });
//   }

//   const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

//   const finalQuery = {
//     ...whereCondition,
//     applicants: { $nin: [userId] },
//   };

//   const result = await Job.find(finalQuery)
//     .skip(skip)
//     .limit(limit)
//     .sort({ [sortBy]: sortOrder } as any);

//   const total = await Job.countDocuments(finalQuery);

//   return {
//     data: result,
//     meta: { total, page, limit },
//   };
// };

const getNotMyAppliedJobs = async (
  userId: string,
  params: any,
  options: IOption,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  // convert to ObjectId
  const userObjectId = new Types.ObjectId(userId);

  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];

  // searchable text fields only
  const searchableFields = [
    'additionalInfo',
    'description',
    'salaryRange',
    'level',
    'postedBy',
    'companyName',
    'location',
    'title',
  ];

  // search term
  if (searchTerm) {
    andCondition.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // exact filters (VERY IMPORTANT)
  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => {
        // exact match fields
        const exactFields = ['status', 'jobStatus', 'companyType'];

        if (exactFields.includes(field)) {
          return { [field]: value };
        }

        // partial match fields
        return {
          [field]: { $regex: value, $options: 'i' },
        };
      }),
    });
  }

  // year filter
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    andCondition.push({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // MAIN FIX HERE
  const finalQuery = {
    ...whereCondition,
    applicants: { $nin: [userObjectId] },
  };

  const result = await Job.find(finalQuery)
    .skip(skip)
    .limit(limit)
    .sort({
      [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1,
    });

  const total = await Job.countDocuments(finalQuery);

  return {
    data: result,
    meta: { total, page, limit },
  };
};



// const getMyAppliedJobs = async (
//   userId: string,
//   params: any,
//   options: IOption,
// ) => {
//   const user = await User.findById(userId).populate('applicationJob.job');
//   if (!user) throw new AppError(404, 'User not found');

//   const { page, limit, skip, sortBy, sortOrder } = pagination(options);

//   // Map applications with job info
//   let applications = user.applicationJob || [];

//   // Optional: Filter/search
//   if (params.searchTerm) {
//     const term = params.searchTerm.toLowerCase();
//     applications = applications.filter(
//       (app) =>
//         app.job &&
//         typeof app.job !== 'string' &&
//         ((app.job as any).title?.toLowerCase().includes(term) ||
//           (app.job as any).companyName?.toLowerCase().includes(term)),
//     );
//   }

//   const total = applications.length;

//   // Pagination
//   const paginated = applications.slice(skip, skip + limit);

//   return {
//     data: paginated.map((app) => ({
//       jobId: (app.job as any)._id,
//       title: (app.job as any).title,
//       companyName: (app.job as any).companyName,
//       location: (app.job as any).location,
//       level: (app.job as any).level,
//       status: app.status, // include status
//       interviewDate: app.interviewDate,
//       notes: app.notes,
//       createdAt: (app.job as any).createdAt,
//     })),
//     meta: { total, page, limit },
//   };
// };

const getMyAppliedJobs = async (
  userId: string,
  params: any,
  options: IOption,
) => {
  const user = await User.findById(userId).populate({
    path: 'applicationJob.job',
    model: 'Job',
    select: 'title companyName location level createdAt',
  });

  if (!user) throw new AppError(404, 'User not found');

  const { page, limit, skip, sortBy, sortOrder } = pagination(options);

  // ensure array exists
  let applications = user.applicationJob || [];

  // remove broken job references (CRITICAL FIX)
  applications = applications.filter(
    (app: any) => app.job && typeof app.job !== 'string',
  );

  // search filter
  if (params.searchTerm) {
    const term = params.searchTerm.toLowerCase();

    applications = applications.filter((app: any) => {
      const job = app.job as any;

      return (
        job?.title?.toLowerCase().includes(term) ||
        job?.companyName?.toLowerCase().includes(term)
      );
    });
  }

  // sorting (SAFE)
  if (sortBy) {
    const direction = sortOrder === 'asc' ? 1 : -1;

    applications.sort((a: any, b: any) => {
      const aVal = (a.job as any)?.[sortBy];
      const bVal = (b.job as any)?.[sortBy];

      if (aVal > bVal) return direction;
      if (aVal < bVal) return -direction;
      return 0;
    });
  }

  const total = applications.length;

  // pagination
  const paginated = applications.slice(skip, skip + limit);

  // final mapping (SAFE)
  const data = paginated.map((app: any) => {
    const job = app.job as any;

    return {
      jobId: job?._id,
      title: job?.title,
      companyName: job?.companyName,
      location: job?.location,
      level: job?.level,
      status: app?.status,
      interviewDate: app?.interviewDate,
      notes: app?.notes,
      createdAt: job?.createdAt,
    };
  });

  return {
    data,
    meta: { total, page, limit },
  };
};


const getMySingleApplication = async (userId: string, jobId: string) => {
  const user = await User.findById(userId).populate({
    path: 'applicationJob.job',
    model: 'Job',
    select: 'title companyName location level createdAt',
  });
  if (!user) throw new AppError(404, 'User not found');
  const application = user.applicationJob?.find((app) => app.job.toString() === jobId);
  if (!application) throw new AppError(404, 'Application not found');
  return application;
};

const applicationJobUser = async (userId: string, jobId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const job = await Job.findById(jobId);
  if (!job) throw new AppError(404, 'Job not found');

  if (job.jobStatus === 'Closed') {
    throw new AppError(400, 'Cannot apply to a closed job');
  }

  const applicationIndex = user?.applicationJob
    ? user.applicationJob.findIndex(
        (app) => app.job.toString() === job._id.toString(),
      )
    : -1;

  if (applicationIndex > -1) {
    const app = user?.applicationJob
      ? user.applicationJob[applicationIndex]
      : undefined;

    if (!app) {
      throw new AppError(404, 'Application not found');
    }

    // Only allow cancel if job is open and status is not final
    if (['Offer', 'Rejected', 'Interview'].includes(app.status || '')) {
      throw new AppError(
        400,
        `Cannot cancel application with current status: ${app.status || 'Unknown'}`,
      );
    }

    // Remove application
    if (user?.applicationJob) {
      user.applicationJob.splice(applicationIndex, 1);
    }
    await Job.findByIdAndUpdate(jobId, { $pull: { applicants: user._id } });
    await user.save();

    return { message: 'Application cancelled', status: 'Cancelled' };
  }

  // Apply new
  user?.applicationJob?.push({ job: job._id, status: 'Applied' });
  await Job.findByIdAndUpdate(jobId, { $addToSet: { applicants: user._id } });
  await user.save();

  return { message: 'Application successful', status: 'Applied', job };
};

const updateApplicationStatus = async (
  userId: string,
  jobId: string,
  newStatus: string,
  interviewDate?: Date,
  notes?: string,
) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const app = user?.applicationJob?.find(
    (a) => a.job.toString() === jobId.toString(),
  );

  if (!app) throw new AppError(404, 'Application not found');

  // // Cannot update final statuses
  // if (['Offer', 'Rejected'].includes(app?.status || '')) {
  //   throw new AppError(
  //     400,
  //     `Cannot update application with current status: ${app?.status || 'Unknown'}`,
  //   );
  // }

  // Only allow allowed statuses
  // const allowedStatuses = ['Applied', 'Interview', 'Pending', 'Cancelled'];
  // if (!allowedStatuses.includes(newStatus)) {
  //   throw new AppError(400, 'Invalid status update');
  // }

  if (app) {
    app.status = newStatus as
      | 'Applied'
      | 'Interview'
      | 'Offer'
      | 'Rejected'
      | 'Pending'
      | 'Cancelled';
    if (interviewDate) app.interviewDate = interviewDate;
    if (notes) app.notes = notes;
  }

  await user.save();

  return { message: 'Application updated', application: app };
};

//========================================================================

const filterJobCvBased = async (
  options: IOption,
  file?: Express.Multer.File,
) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  if (!file) {
    throw new AppError(404, 'File upload required');
  }

  const aiApiCall = await cvBasedJobFilter(file);
  if (!aiApiCall) {
    throw new AppError(404, 'Currently not found job your cv based');
  }
  // const andCondition: any[] = [];
  // const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // const result = await Job.find(whereCondition)
  //   .skip(skip)
  //   .limit(limit)
  //   .sort({ [sortBy]: sortOrder } as any);

  // if (!result) {
  //   throw new AppError(404, 'Job not found');
  // }

  // const total = await Job.countDocuments(whereCondition);

  return aiApiCall;
};
const getUniqueLocations = async () => {
  const locations = await Job.distinct('location', {
    jobStatus: 'Open',
    status: 'active',
  });

  // const locationList = locations
  //   .filter((location) => location) // remove null/empty
  //   .map((location, index) => ({
  //     id: index + 1,
  //     name: location,
  //     value: location,
  //   }));
  const locationList = locations
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map((location, index) => ({
      id: index + 1,
      name: location,
      value: location,
    }));

  return locationList;
};

const getRecommendedJobs = async (
  userId: string,
  params: any,
  options: IOption,
) => {
  // const userObjectId = new Types.ObjectId(userId);
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  // Get the user's latest CV
  const cv = await CVbuilder.findOne({ createBy: userId }).sort({
    createdAt: -1,
  });
  // console.log('User CV:', cv, userId);

  //   if (!cv) {
  //     throw new AppError(404, 'No CV found for this user');
  //   }

  // Extract all jobTitles from legalWorkExperience
  const jobTitles = cv?.legalWorkExperience
    ?.map((exp) => exp.jobTitle)
    .filter(Boolean);

  if (!jobTitles || jobTitles.length === 0) {
    throw new AppError(404, 'No legal work experience found in your CV');
  }

  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;
  const andCondition: any[] = [];

  const searchableFields = [
    'additionalInfo',
    'description',
    'salaryRange',
    'level',
    'postedBy',
    'companyName',
    'location',
    'title',
  ];

  // Search term
  if (searchTerm) {
    andCondition.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // Exact / partial filters
  if (Object.keys(filterData).length) {
    andCondition.push({
      $and: Object.entries(filterData).map(([field, value]) => {
        const exactFields = ['status', 'jobStatus', 'companyType'];
        if (exactFields.includes(field)) {
          return { [field]: value };
        }
        return { [field]: { $regex: value, $options: 'i' } };
      }),
    });
  }

  // Year filter
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    andCondition.push({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // ✅ Core recommendation filter merged with search/filter conditions
  const finalQuery = {
    ...whereCondition,
    applicants: { $nin: [user._id] },
    level: {
      $in: jobTitles.map((title) => new RegExp(`^${title}$`, 'i')),
    },
    status: 'active',
    jobStatus: 'Open',
  };

  const result = await Job.find(finalQuery)
    .skip(skip)
    .limit(limit)
    .sort({
      [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1,
    });

  const total = await Job.countDocuments(finalQuery);

  return {
    data: result,
    meta: { total, page, limit },
  };
};

export const jobService = {
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
  getNotMyAppliedJobs,
  getMyAppliedJobs,
  updateApplicationStatus,
  getUniqueLocations,
  manualJob,
  getMySingleApplication,

  // adminApplicationJobStatus,
  //getStudentAllJobs,

  getRecommendedJobs,
};
