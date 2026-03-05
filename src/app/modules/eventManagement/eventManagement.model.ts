import { model, Schema } from 'mongoose';
import { IEventRegisterStudent } from './eventManagement.interface';

const eventRegisterStudentSchema = new Schema<IEventRegisterStudent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const EventRegisterStudent = model<IEventRegisterStudent>(
  'eventRegisterStudent',
  eventRegisterStudentSchema,
);

export default EventRegisterStudent;