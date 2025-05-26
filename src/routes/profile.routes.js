import express from 'express';
import { uploadProfilePhoto, uploadMiddleware } from '../controllers/profile.controller.js';
import { authRequired } from '../middlewares/validateToken.js';


const router = express.Router();

router.post('/upload-profile-photo', authRequired, uploadMiddleware, uploadProfilePhoto);

export default router;
