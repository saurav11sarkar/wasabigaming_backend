import express from 'express'
import { userRole } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { schoolManagementController } from './school_management.controller';
import { checkStudentSubscription } from '../../middlewares/checkSubscription';

const router = express.Router()

router.get('/overview', auth(userRole.school), checkStudentSubscription,schoolManagementController.schoolOverview)
router.get('/', auth(userRole.school), checkStudentSubscription, schoolManagementController.getSchoolStudents)
router.get('/:id', auth(userRole.school), schoolManagementController.getSingleStudent)
router.delete('/:id', auth(userRole.school), schoolManagementController.deleteStudent)

export const schoolManagementRouter = router;