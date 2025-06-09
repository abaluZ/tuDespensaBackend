// Codigo realizado por Cameo Y Segales
import { User } from "../models/user.model.js";
import Information from "../models/information.model.js";
import UserGoal from "../models/goal.model.js";
import bcrypt from "bcryptjs";
export const getUsers = async (req, res) => {
  const users = await User.find();
  //}).populate('user') remplaza en la linea 8
  // esto nos dara toda la inf del usuario si es que lo necesitamos
  res.json(users);
};

export const createUsers = async (req, res) => {
  //para crear y guardar una nueva tarea "esto se puede usar para la lista de la despena?"
  const { username, email, password, role } = req.body;

  const newUser = new User({
    username,
    email,
    password,
    role,
    //para agarrar el id del usuario logeado usamos
    // user: req.user.id,
  });
  //guardamos
  const savedUser = await newUser.save();
  res.json(savedUser);
};

export const getTask = async (req, res) => {
  //buscar una tarea en especifico mediante el id
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
};

export const deleteUser = async (req, res) => {
  //buscar una tarea en especifico mediante el id y lo elimina usando 'findByIdAndDelete'
  const user = await User.findByIdAndUpdate(req.params.id,{status:false});
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.sendStatus(204); //el 204 es un mensaje de que todo salio bien pero no retornara nada
};

export const updateUser = async (req, res) => {
  try {
    console.log("ID recibido:", req.params.id);
    console.log("Datos recibidos:", req.body);

    const { password, ...rest } = req.body; // Separamos la contraseña del resto

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Actualiza los campos normales
    Object.assign(user, rest);

    // Si se envió una nueva contraseña, la encriptamos
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Guardamos el usuario actualizado
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// Para poder utilizar en la app movil
export const getUserProfileApp = async (req, res) => {
  try {
    console.log("Datos del usuario en el token:", req.user);
    const userId = req.user.id || req.user.userId;

    if (!userId) {
      console.error("ID de usuario no encontrado en el token");
      return res.status(401).json({ 
        message: "ID de usuario no encontrado en el token",
        user: req.user 
      });
    }

    console.log("Buscando usuario con ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuario no encontrado en la base de datos");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("Usuario encontrado, buscando información adicional...");
    const goal = await UserGoal.findOne({ user: userId });
    const info = await Information.findOne({ user: userId });

    const response = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        plan: user.plan,
        profilePhoto: user.profilePhoto
      },
      goal,
      information: info,
    };

    console.log("Enviando respuesta completa del perfil");
    res.json(response);
  } catch (error) {
    console.error("Error en getUserProfileApp:", error);
    res.status(500).json({ 
      message: "Error al obtener el perfil para app",
      error: error.message 
    });
  }
};

export const upgradeToPremium = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    user.plan = 'Premium';
    await user.save();
    res.json({ message: 'Usuario actualizado a Premium', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar a Premium', error: error.message });
  }
};

export const downgradeToFree = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    user.plan = 'Gratuito';
    await user.save();
    res.json({ message: 'Suscripción cancelada. Ahora eres usuario gratuito.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar suscripción', error: error.message });
  }
};
