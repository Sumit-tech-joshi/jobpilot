import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  jobId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobType?: string;
  source: 'adzuna' | 'jsearch';
  sourceUrl: string;
  postedDate?: Date;
  savedAt: Date;
  tags: string[];
}

const JobSchema = new Schema<IJob>({
  jobId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: String },
  jobType: { type: String },
  source: { type: String, enum: ['adzuna', 'jsearch'], required: true },
  sourceUrl: { type: String, required: true },
  postedDate: { type: Date },
  savedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
