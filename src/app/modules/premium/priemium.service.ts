import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/appError';
import pagination, { IOption } from '../../helper/pagenation';
import { IPremium } from './premium.interface';
import Premium from './premium.model';
import User from '../user/user.model';
import Payment from '../payment/payment.model';

const stripe = new Stripe(config.stripe.secretKey!);

const createPremium = async (payload: IPremium) => {
  const existingPremium = await Premium.findOne({
  name: payload.name,
  type: payload.type,
  subscriptionCategory: payload.subscriptionCategory,
});

if (existingPremium) {
  throw new AppError(400, 'Premium already exists');
}

const result = await Premium.create(payload);
return result;
};

const getAllPremium = async (params: any, options: IOption) => {
  const { page, limit, skip, sortBy, sortOrder } = pagination(options);
  const { searchTerm, year, ...filterData } = params;

  const andCondition: any[] = [];
  const userSearchableFields = ['name', 'type', 'features', 'status', 'subscriptionCategory'];

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

  const result = await Premium.find(whereCondition)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder } as any);

  if (!result) {
    throw new AppError(404, 'Premium not found');
  }

  const total = await Premium.countDocuments(whereCondition);

  return {
    data: result,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const getSinglePremium = async (id: string) => {
  const result = await Premium.findById(id);
  if (!result) throw new AppError(400, 'Failed to get single premium');
  return result;
};

const updatePremium = async (id: string, payload: IPremium) => {
  const result = await Premium.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new AppError(400, 'Failed to update premium');
  return result;
};

const deletePremium = async (id: string) => {
  const result = await Premium.findByIdAndDelete(id);
  if (!result) throw new AppError(400, 'Failed to delete premium');
  return result;
};

const activePremium = async (id: string) => {
  await Premium.updateMany({}, { status: 'inactive' });
  const result = await Premium.findByIdAndUpdate(
    id,
    { status: 'active' },
    { new: true },
  );

  if (!result) {
    throw new AppError(400, 'Failed to activate premium');
  }

  return result;
};

const paySubscription = async (userId: string, subscriptionId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');
  const premium = await Premium.findById(subscriptionId);
  if (!premium) throw new AppError(404, 'Premium not found');


    if (
    premium.name === 'free' &&
    premium.totalSubscripeUser?.includes(user._id)
  ) {
    throw new AppError(400, 'You have already subscribed to this plan');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: premium.price * 100,
          product_data: {
            name: premium.name,
            description: premium.type,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    success_url: `${config.frontendUrl}/payment/success`,
    cancel_url: `${config.frontendUrl}/payment/cancel`,
    metadata: {
      userId: user._id.toString(),
      subscriptionId: premium._id.toString(),
      paymentType: 'subscription',
      type: premium.type,
      price: premium.price.toString(),
    },
  } as Stripe.Checkout.SessionCreateParams);

  await Payment.create({
    user: user._id,
    subscription: premium._id,
    stripeSessionId: session.id,
    amount: premium.price,
    currency: 'gbp',
    status: 'pending',
  });

  return { url: session.url, sessionId: session.id };
};

export const premiumService = {
  createPremium,
  getAllPremium,
  getSinglePremium,
  updatePremium,
  deletePremium,
  activePremium,
  paySubscription,
};
