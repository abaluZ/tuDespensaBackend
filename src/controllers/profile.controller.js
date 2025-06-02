import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';
import { existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs';
import { User } from '../models/user.model.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { pipeline } from 'stream/promises';

// Para usar __dirname en ES Modules:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función de utilidad para esperar un tiempo
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para copiar archivo de forma segura
async function copyFile(source, destination) {
  try {
    const readStream = createReadStream(source);
    const writeStream = createWriteStream(destination);
    await pipeline(readStream, writeStream);
    return true;
  } catch (error) {
    console.error('Error copiando archivo:', error);
    throw error;
  }
}

// Función de utilidad para eliminar archivo con reintentos
async function deleteFileWithRetry(filePath, maxRetries = 3, delayMs = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Intento ${i + 1} fallido al eliminar ${filePath}:`, error);
      if (i === maxRetries - 1) throw error;
      await wait(delayMs * (i + 1)); // Incrementar el delay en cada intento
    }
  }
  return false;
}

// Función para limpiar archivos de forma segura
async function safeCleanup(filePath, maxAttempts = 3) {
  if (!filePath || !existsSync(filePath)) return;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await wait((i + 1) * 500); // Esperar más tiempo entre intentos
      await fs.unlink(filePath);
      console.log(`Archivo eliminado exitosamente: ${filePath}`);
      return;
    } catch (error) {
      console.log(`Intento ${i + 1} de eliminar ${filePath} falló, reintentando...`);
      if (i === maxAttempts - 1) {
        console.log(`No se pudo eliminar ${filePath}, se limpiará en el próximo reinicio`);
        // No lanzar el error, solo registrarlo
      }
    }
  }
}

// Función para programar limpieza posterior
function scheduleCleanup(filePath) {
  setTimeout(async () => {
    try {
      await safeCleanup(filePath);
    } catch (error) {
      console.log('Error en limpieza programada:', error);
    }
  }, 5000); // Intentar limpiar después de 5 segundos
}

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'imgsUsr');
    try {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true, mode: 0o777 });
      }
      // Verificar permisos del directorio
      fs.access(dir, fs.constants.W_OK)
        .then(() => cb(null, dir))
        .catch(err => {
          console.error('Error de permisos en directorio:', err);
          cb(err);
        });
    } catch (error) {
      console.error('Error al crear/verificar directorio:', error);
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    try {
      if (!req.user || !req.user.id) {
        cb(new Error('Usuario no autenticado o ID no disponible'));
        return;
      }
      
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${req.user.id}${ext}`;
      const filePath = path.join(__dirname, '..', 'imgsUsr', fileName);

      // Si el archivo existe, intentar eliminarlo primero
      if (existsSync(filePath)) {
        try {
          await deleteFileWithRetry(filePath);
        } catch (error) {
          console.error('Error al eliminar archivo existente:', error);
          // Continuar aunque falle la eliminación
        }
      }

      cb(null, fileName);
    } catch (error) {
      console.error('Error al generar nombre de archivo:', error);
      cb(error);
    }
  },
});

const fileFilter = (req, file, cb) => {
  try {
    console.log('Tipo de archivo recibido:', file.mimetype);
    if (file.mimetype.startsWith('image/') || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('El archivo debe ser una imagen (jpg, jpeg, png, gif o webp)'), false);
    }
  } catch (error) {
    console.error('Error en fileFilter:', error);
    cb(error);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadProfilePhoto = async (req, res) => {
  let originalFilePath = null;
  let processedFilePath = null;
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario no autenticado o ID no disponible' });
    }

    console.log('Archivo recibido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    originalFilePath = req.file.path;
    tempFilePath = path.join(__dirname, '..', 'imgsUsr', `temp_${Date.now()}_${req.file.filename}`);
    processedFilePath = path.join(__dirname, '..', 'imgsUsr', `processed_${req.file.filename}`);

    // Primero, hacer una copia del archivo original
    await copyFile(originalFilePath, tempFilePath);
    console.log('Archivo copiado exitosamente a:', tempFilePath);

    // Procesar la imagen con sharp usando la copia
    try {
      await sharp(tempFilePath)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(processedFilePath);

      console.log('Imagen procesada exitosamente');

      // Obtener el usuario actual
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Limpiar archivos antiguos
      if (user.profilePhoto && user.profilePhoto !== 'imgsUsr/default.jpg') {
        const oldImagePath = path.join(__dirname, '..', user.profilePhoto);
        scheduleCleanup(oldImagePath);
      }

      // Actualizar el usuario con la nueva ruta
      const newFilePath = `imgsUsr/processed_${req.file.filename}`;
      user.profilePhoto = newFilePath;
      await user.save();

      // Programar la limpieza de archivos temporales
      scheduleCleanup(originalFilePath);
      scheduleCleanup(tempFilePath);

      res.status(200).json({
        message: 'Foto de perfil actualizada exitosamente.',
        profilePhoto: newFilePath,
        user,
      });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      // Programar limpieza de archivos en caso de error
      scheduleCleanup(processedFilePath);
      throw error;
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    
    // Programar limpieza de todos los archivos en caso de error
    scheduleCleanup(originalFilePath);
    scheduleCleanup(tempFilePath);
    scheduleCleanup(processedFilePath);
    
    res.status(500).json({ 
      message: 'Error al subir la imagen de perfil.',
      error: error.message 
    });
  }
};

export const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.profilePhoto && user.profilePhoto !== 'imgsUsr/default.jpg') {
      const imagePath = path.join(__dirname, '..', user.profilePhoto);
      
      try {
        if (existsSync(imagePath)) {
          await deleteFileWithRetry(imagePath);
        }
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
      }
      
      user.profilePhoto = 'imgsUsr/default.jpg';
      await user.save();
      
      return res.status(200).json({ 
        message: 'Foto de perfil eliminada exitosamente',
        profilePhoto: user.profilePhoto 
      });
    }
    
    return res.status(400).json({ 
      message: 'El usuario ya tiene la foto por defecto' 
    });
    
  } catch (error) {
    console.error('Error al eliminar la foto de perfil:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la foto de perfil' 
    });
  }
};

export const uploadMiddleware = upload.single('profilePhoto');
