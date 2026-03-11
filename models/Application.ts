import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';
  appliedDate?: Date;
  generatedResume?: string;
  generatedCoverLetter?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'rejected', 'offer'],
      default: 'saved',
    },
    appliedDate: { type: Date },
    generatedResume: { type: String },
    generatedCoverLetter: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
