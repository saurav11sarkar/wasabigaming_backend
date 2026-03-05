import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { dashboardRouter } from '../modules/dashboard/dashboard.routes';
import { courseRouter } from '../modules/course/course.routes';
import { quizzesRouter } from '../modules/quizzes/quizzes.routes';

import { contactRouter } from '../modules/contact/contact.routes';

import { taskRouter } from '../modules/task/task.routes';
import { lawfirmsRouter } from '../modules/lawfirm/lawfirm.routes';
import { inviteStudentRouter } from '../modules/invite_students/invite_students.routes';
import { applicationTrackerRouter } from '../modules/applicationTracker/applicationTracker.routes';
import { websiteRouter } from '../modules/website/website.routes';
import { premiumRouter } from '../modules/premium/premium.routes';
import { jobRouter } from '../modules/job/job.routes';
import { cvBuilderRouter } from '../modules/cvbuilder/cvbuilder.routes';
// import { psychometricRouter } from '../modules/psychometricAttempt/psychometricAttempt.routes';
import { psychometricTestRouter } from '../modules/psychometricTest/psychometricTest.routes';
// import { psychometricResultRouter } from '../modules/psychometricResult/psychometricResult.routes';
import { eventRouter } from '../modules/event/event.routes';

import { schoolManagementRouter } from '../modules/school_management/school_management.routes';
import { psychometricAttemptRouter } from '../modules/psychometricAttempt/psychometricAttempt.routes';
import { courseQuizAttemptRouter } from '../modules/courseQuizAttempt/courseQuizAttempt.routes';
import { teamRoutes } from '../modules/team/team.route';
import { cardRouter } from '../modules/card/card.routes';
import { coverLetterRouter } from '../modules/coverLetter/coverLetter.route';
import { appliedJobRoutes } from '../modules/appliedJob/appliedJob.routes';
import { mockInterviewRouter } from '../modules/mockInterview/mockInterview.route';
import { mockInterviewSessionRouter } from '../modules/mockInterviewSession/mockInterviewSession.route';
import { bookMarkRouter } from '../modules/jobBookMark/jobBookMark.route';
import { aiassessmentRouter } from '../modules/aiassessment/aiassessment.routes';
import { writtencasestudyRoutes } from '../modules/writtencasestudy/writtencasestudy.routes';
import { presentationtaskRoutes } from '../modules/presentationtask/presentationtask.routes';
import { intrayemailRouter } from '../modules/intrayemail/intrayemail.routes';
import { careanalysisRouter } from '../modules/careanalysis/careanalysis.routes';
import { lawBookmarkRoutes } from '../modules/lawbookmark/lawbookmark.routes';
import path from 'path';
import { communityRoutes } from '../modules/joinCommunity/joinCommunity.routes';
import { dynamicWebsiteRoutes } from '../modules/dynamicWebsite/dynamicWebsite.route';
import { reviewRoutes } from '../modules/review/review.routes';
import { cvRoutes } from '../modules/cv/cv.routes';
import { certificateRoutes } from '../modules/certificate/certificate.routes';
import { videoProgressRoutes } from '../modules/videoProgress/videoProgress.routes';
import { eventRegisterStudentRoutes } from '../modules/eventManagement/eventManagement.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/dashboard',
    route: dashboardRouter,
  },
  {
    path: '/course',
    route: courseRouter,
  },
  {
    path: '/quizzes',
    route: quizzesRouter,
  },
  {
    path: '/course-quizzes',
    route: courseQuizAttemptRouter,
  },
  {
    path: '/contacts',
    route: contactRouter,
  },
  {
    path: '/task',
    route: taskRouter,
  },
  {
    path: '/lawfirm',
    route: lawfirmsRouter,
  },
  {
    path: '/invite-students',
    route: inviteStudentRouter,
  },
  {
    path: '/application-tracker',
    route: applicationTrackerRouter,
  },
  {
    path: '/website',
    route: websiteRouter,
  },
  {
    path: '/premium',
    route: premiumRouter,
  },
  {
    path: '/job',
    route: jobRouter,
  },
  {
    path: '/cvbuilder',
    route: cvBuilderRouter,
  },
  {
    path: '/psychometric-attempt',
    route: psychometricAttemptRouter,
  },
  {
    path: '/psychometric-test',
    route: psychometricTestRouter,
  },
  // {
  //   path: '/psychometric-result',
  //   route: psychometricResultRouter,
  // },
  {
    path: '/event',
    route: eventRouter,
  },
  {
    path: '/team',
    route: teamRoutes,
  },
  {
    path: '/school-management',
    route: schoolManagementRouter,
  },
  {
    path: '/card',
    route: cardRouter,
  },
  {
    path: '/cover-letter',
    route: coverLetterRouter,
  },
  {
    path: '/applied-job',
    route: appliedJobRoutes,
  },
  {
    path: '/mock-interview',
    route: mockInterviewRouter,
  },
  {
    path: '/mock-interview-session',
    route: mockInterviewSessionRouter,
  },
  {
    path: '/book-mark',
    route: bookMarkRouter,
  },
  {
    path: '/aiassessment',
    route: aiassessmentRouter,
  },
  {
    path: '/writtencasestudy',
    route: writtencasestudyRoutes,
  },
  {
    path: '/presentationtask',
    route: presentationtaskRoutes,
  },
  {
    path: '/intrayemail',
    route: intrayemailRouter,
  },
  {
    path: '/careanalysis',
    route: careanalysisRouter,
  },
  {
    path: '/law-bookmark',
    route: lawBookmarkRoutes,
  },
  {
    path: '/community',
    route: communityRoutes,
  },
  {
    path: '/dynamic-website',
    route: dynamicWebsiteRoutes,
  },
  {
    path: '/review',
    route: reviewRoutes,
  },
  {
    path: '/cv',
    route: cvRoutes,
  },
  {
    path: '/certificate',
    route: certificateRoutes,
  },
  {
    path: '/video-progress',
    route: videoProgressRoutes,
  },
 {
    path: '/event-management',
    route: eventRegisterStudentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
