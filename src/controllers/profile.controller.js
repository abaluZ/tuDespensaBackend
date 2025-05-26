import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { User } from '../models/user.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para usar __dirname en ES Modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'imgsUsr');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${req.user.id}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }

    const newFilePath = `imgsUsr/${req.file.filename}`;

    // Obtener el usuario actual
    const user = await User.findById(req.user.id);

    // Si el usuario ya tenía una foto (y no era la default), eliminarla
    if (user.profilePhoto && user.profilePhoto !== 'imgsUsr/default.jpg') {
      const oldImagePath = path.join(__dirname, '..', user.profilePhoto);

      // Verificar si el archivo existe antes de eliminarlo
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Eliminar el archivo
      }
    }

    // Actualizar el usuario con la nueva ruta
    user.profilePhoto = newFilePath;
    await user.save();

    res.status(200).json({
      message: 'Foto de perfil actualizada exitosamente.',
      profilePhoto: newFilePath,
      user,
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen de perfil.' });
  }
};


export const uploadMiddleware = upload.single('profilePhoto');
