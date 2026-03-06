import Stripe from 'stripe';
import config from '../config';
import { Request, Response } from 'express';
import Payment from '../modules/payment/payment.model';
import User from '../modules/user/user.model';
import Premium from '../modules/premium/premium.model';
import Course from '../modules/course/course.model';

const stripe = new Stripe(config.stripe.secretKey!);

const webHookHandlers = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret!,
    );
  } catch (err: any) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ===============================
    // CHECKOUT COMPLETED
    // ===============================
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (!payment) return res.json({ received: true });

      payment.status = 'completed';
      payment.stripePaymentIntentId = session.payment_intent as string;
      await payment.save();

      const user = await User.findById(payment.user);
      if (!user) return res.json({ received: true });

      const paymentType = session.metadata?.paymentType;
      // const paymentType = session?.mode;
      // console.log("session metadat", session.metadata);
      console.log("payment type",paymentType);
      // console.log("all payment data", payment);
      // console.log("session data", session?.mode)
      // ===============================
      // SUBSCRIPTION PAYMENT
      // ===============================
      if (paymentType === 'subscription') {
        // console.log("mamun");

        const subscription = await Premium.findById(payment.subscription);
        if (!subscription) return res.json({ received: true });

        if (!subscription.totalSubscripeUser?.includes(user._id)) {
          subscription?.totalSubscripeUser?.push(user._id);
          await subscription.save();
        }

        // const monthAdd = subscription.type === 'year' ? 12 : 1;

        // const expireDate = new Date();
        // expireDate.setMonth(expireDate.getMonth() + monthAdd);
         let expireDate = new Date();

        if (subscription.type === 'yearly') {
          expireDate.setFullYear(expireDate.getFullYear() + 1);
        } else if (subscription.type === 'monthly') {
          expireDate.setMonth(expireDate.getMonth() + 1);
        } else if (subscription.type === 'weekly') {
          expireDate.setDate(expireDate.getDate() + 7);
        }



        user.isSubscription = true;
        user.subscription = subscription._id;
        user.subscriptionExpiry = expireDate;
        await user.save();



        return res.json({ received: true });
      }
      // if (paymentType === 'subscription') {

      //   const subscription = await Premium.findById(payment.subscription);
      //   if (!subscription) {
      //     return res.status(404).json({ success: false, message: 'Subscription not found' });
      //   }
      //   if (!subscription.totalSubscripeUser?.includes(user._id)) {
      //     subscription.totalSubscripeUser?.push(user._id);
      //     await subscription.save();
      //   }

      //   const monthAdd = subscription.type === 'year' ? 12 : 1;
      //   const expireDate = new Date();
      //   expireDate.setMonth(expireDate.getMonth() + monthAdd);

      //   user.isSubscription = true;
      //   user.subscription = subscription._id;
      //   user.subscriptionExpiry = expireDate;
      //   await user.save();

      //   return res.json({ received: true });
      // }


      // ===============================
      // COURSE PAYMENT
      // ===============================
      if (paymentType === 'course') {
        const course = await Course.findById(payment.course);
        if (!course) return res.json({ received: true });

        // Initialize enrolledStudents if it's undefined
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

        user.course?.push(course._id)
        await user.save();
      }

      return res.json({ received: true });
    }

    // ===============================
    // PAYMENT FAILED
    // ===============================
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;

      const payment = await Payment.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }

      return res.json({ received: true });
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Handler Error:', err.message);
    return res.status(500).send(`Webhook Handler Error: ${err.message}`);
  }
};

export default webHookHandlers;
