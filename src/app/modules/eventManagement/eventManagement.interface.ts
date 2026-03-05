import { Types } from 'mongoose';

export interface IEventRegisterStudent {
  name: string;
  email: string;
  phone: string;
  eventId: Types.ObjectId;
}