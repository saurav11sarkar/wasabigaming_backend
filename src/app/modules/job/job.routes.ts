import express from 'express';
import auth from '../../middlewares/auth';
import { userRole } from '../user/user.constant';
import { jobController } from './job.controller';
import { fileUploader } from '../../helper/fileUploder';
const router = express.Router();

router.post(
  '/',
  auth(userRole.admin),
  fileUploader.upload.none(),
  jobController.createJob,
);

router.get('/locations', jobController.getUniqueLocations);
router.get('/applied-job', auth(userRole.student), jobController.appliedJob);
router.post(
  '/filter-job-cv-based',
  auth(userRole.student, userRole.admin),
  fileUploader.upload.single('file'),
  jobController.filterJobCvBased,
);

//================================update job==============================

router.post(
  '/manual-job',
  auth(userRole.admin, userRole.student),
  fileUploader.upload.none(),
  jobController.manualJob,
);

// router.get(
//   '/manual-job-students',
//   // auth(userRole.admin),
//   jobController.getStudentAllJobs,
// );

router.get(
  '/my-applied-job',
  auth(userRole.student),
  jobController.getMyAppliedJobs,
);
router.get(
  '/not-my-applied-job',
  auth(userRole.student),
  jobController.getNotMyAppliedJobs,
);

router.get('/recommended-jobs', auth(userRole.student, userRole.admin), jobController.getRecommendedJobs);

router.put(
  '/applied-job/:jobId',
  auth(userRole.student),
  jobController.applicationJobUser,
);
router.get('/my-application/:jobId', auth(userRole.student), jobController.getMySingleApplication);

router.put(
  '/application-status/:jobId',
  auth(userRole.student),
  jobController.updateApplicationStatus,
);


// router.put(
//   '/status/:jobId',
//   auth(userRole.admin),
//   jobController.adminApplicationJobStatus,
// );




//=========================================================================

router.post('/', auth(userRole.admin), jobController.createManualJob);
router.get('/', jobController.getAllJobs);
router.put('/approved/:id', auth(userRole.admin), jobController.approvedJob);
router.get('/:id', jobController.singleJob);
router.put('/:id', auth(userRole.admin), jobController.updateJob);
router.delete('/:id', auth(userRole.admin), jobController.deleteJob);

export const jobRouter = router;
