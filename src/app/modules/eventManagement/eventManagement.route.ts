import express from 'express';
import { eventRegisterStudentController } from './eventManagement.controller';
import { userRole } from '../user/user.constant';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  auth(userRole.admin, userRole.school, userRole.student),
  eventRegisterStudentController.createEventRegisterStudent,
);

router.get(
  '/',
  auth(userRole.admin),
  eventRegisterStudentController.getAllEventRegisterStudents,
);

router.get(
  '/:id',
  auth(userRole.admin),
  eventRegisterStudentController.getEventRegisterStudentById,
);

router.patch(
  '/:id',
  auth(userRole.admin),
  eventRegisterStudentController.updateEventRegisterStudent,
);

router.delete(
  '/:id',
  auth(userRole.admin),
  eventRegisterStudentController.deleteEventRegisterStudent,
);

export const eventRegisterStudentRoutes = router;