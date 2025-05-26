// Codigo realizado por Cameo y Segales
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Usuario", "Administrador"],
      default: "Usuario",
    },
    plan: {
      type: String,
      enum: ["Gratuito", "Premium"],
      default: "Gratuito",
    },
    profilePhoto: {
      type: String,
      default: 'imgsUsr/default.jpg'
    },    
    status: {
      type: Boolean,
      default: true,
    },
    verificationCode: {
      type: String,
    },
    verificationExpires: {
      type: Date,
    },    
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);