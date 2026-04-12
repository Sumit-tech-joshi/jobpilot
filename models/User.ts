import mongoose, { Schema } from 'mongoose'

export interface IUser {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  emailVerified: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  image?: string
  provider: 'credentials' | 'google'
  onboardingComplete: boolean
  industry?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    image: { type: String },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    onboardingComplete: { type: Boolean, default: false },
    industry: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
