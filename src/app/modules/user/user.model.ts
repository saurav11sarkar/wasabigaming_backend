import { Schema, model } from 'mongoose';
import { IApplication, IEducation, IExperience, IUser } from './user.interface';
import bcrypt from 'bcryptjs';
import config from '../../config';

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      // enum: [
      //   'Applied',
      //   'Interview',
      //   'Offer',
      //   'Rejected',
      //   'Pending',
      //   'Cancelled',
      // ],
      default: 'Applied',
    },
    interviewDate: { type: Date },
    notes: { type: String },
  },
  { _id: false },
);

const educationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  year: { type: Number, required: true },
});

const experienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, required: true },
});

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    schoolName: { type: String },
    schoolType: { type: String },
    schoolStatus: {
      type: String,
      enum: ['accepted', 'pending', 'rejected'],
    },
    aboutSchool: { type: String },

    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
      type: String,
      enum: ['student', 'school', 'admin'],
      required: true,
    },
    schoolCategory: {
      type: String,
    },

    profileImage: { type: String },
    phone: { type: String },

    otp: { type: String },
    otpExpiry: { type: Date },
    verified: { type: Boolean, default: false },
    registered: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    address: { type: String },

    stripeAccountId: { type: String },

    schoolId: { type: Schema.Types.ObjectId, ref: 'User' },

    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String }],
    grade: { type: String },

    isSubscription: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date },
    subscription: { type: Schema.Types.ObjectId, ref: 'Premium' },
    jobTitle: { type: String },
    course: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    company: { type: String },
    bio: { type: String },
    socileLinks: {
      type: [
        {
          name: { type: String },
          link: { type: String },
        },
      ],
      default: [],
    },
    loginHistory: [
      {
        device: String,
        ipAddress: String,
        loginTime: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shareLink: { type: String },
    applicationJob: [applicationSchema],
    authType: { type: String, default: "manual" },
    subscribedSchool: { type: Schema.Types.ObjectId, ref: 'Premium' },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  );
  next();
});

const User = model<IUser>('User', userSchema);

export default User;
