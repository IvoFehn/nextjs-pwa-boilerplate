import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
