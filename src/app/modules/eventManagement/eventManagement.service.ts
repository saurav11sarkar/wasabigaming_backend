import AppError from '../../error/appError';
import pagination, { IOption } from '../../helper/pagenation';
import sendMailer from '../../helper/sendMailer';
import { createEventRegistrationTemplate } from '../../utils/createOtpTemplate';
import Event from '../event/event.model';
import { IEventRegisterStudent } from './eventManagement.interface';
import EventRegisterStudent from './eventManagement.model';

const createEventRegisterStudent = async (
  payload: IEventRegisterStudent,
) => {
  const event = await Event.findById(payload.eventId);
  if (!event) throw new AppError(404, 'Event not found');

  const alreadyRegistered = await EventRegisterStudent.findOne({
    email: payload.email,
    eventId: payload.eventId,
  });
  if (alreadyRegistered) {
    throw new AppError(400, 'Student already registered for this event');
  }
  const result = await EventRegisterStudent.create(payload);
  await sendMailer(
      payload.email,
      event.title,
      createEventRegistrationTemplate(payload.name, event?.title || '', event.date?.toDateString() || '', 'Aspiring Legal Network'),
    );
  return result;
};

const getAllEventRegisterStudents = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondition: any[] = [];
  const searchableFields = ['name', 'email', 'phone'];

  if (searchTerm) {
    andCondition.push({
      $or: searchableFields.map((field) => ({
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

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  const result = await EventRegisterStudent.find(whereCondition)
    .populate('eventId')
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  if (!result) {
    throw new AppError(404, 'No registered students found');
  }

  const total = await EventRegisterStudent.countDocuments(whereCondition);

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSingleEventRegisterStudent = async (id: string) => {
  const result = await EventRegisterStudent.findById(id).populate('eventId');
  if (!result) {
    throw new AppError(404, 'Registered student not found');
  }
  return result;
};

const updateEventRegisterStudent = async (
  id: string,
  payload: Partial<IEventRegisterStudent>,
) => {
  const result = await EventRegisterStudent.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(404, 'Registered student not found');
  }
  return result;
};

const deleteEventRegisterStudent = async (id: string) => {
  const result = await EventRegisterStudent.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'Registered student not found');
  }
  return result;
};

export const eventRegisterStudentService = {
  createEventRegisterStudent,
  getAllEventRegisterStudents,
  getSingleEventRegisterStudent,
  updateEventRegisterStudent,
  deleteEventRegisterStudent,
};