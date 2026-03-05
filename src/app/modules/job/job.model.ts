import { Schema, model, Types } from 'mongoose';
import { IJob } from './job.interface';

const jobSchema = new Schema<IJob>(
  {
    title: { type: String },
    location: { type: String },
    companyName: { type: String },
    companyType: { type: String },
    postedBy: { type: String },
    level: { type: String },
    salaryRange: { type: String },
    startDate: { type: String },
    applicationDeadline: { type: String },
    jobId: { type: Schema.Types.Mixed, unique: true },
    jobStatus: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    description: { type: String },
    additionalInfo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    requiredSkills: { type: [String], default: [] },
    createBy: { type: Types.ObjectId, ref: 'User' },
    url: { type: String },
    companyId: { type: Types.ObjectId, ref: 'Lawfirm' },
    applicants: [{ type: Types.ObjectId, ref: 'User' }],
    // applicationJob: {
    //   type: String,
    //   enum: ['pending', 'accepted', 'rejected'],
    //   default: 'accepted',
    // },
  },
  { timestamps: true },
);

const Job = model<IJob>('Job', jobSchema);

export default Job;
