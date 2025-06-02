import express from 'express';
import { uploadProfilePhoto, uploadMiddleware, deleteProfilePhoto } from '../controllers/profile.controller.js';
import { authRequired } from '../middlewares/validateToken.js';


const router = express.Router();

router.post('/upload-profile-photo', authRequired, uploadMiddleware, uploadProfilePhoto);
router.delete('/delete-profile-photo', authRequired, deleteProfilePhoto);

export default router;
