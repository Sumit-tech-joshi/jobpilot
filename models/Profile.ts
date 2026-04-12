import mongoose, { Schema } from 'mongoose'

const SkillCategorySchema = new Schema({
  id: String,
  categoryName: String,
  skills: [String],
}, { _id: false })

const ExperienceSchema = new Schema({
  id: String,
  jobTitle: String,
  employer: String,
  location: String,
  startDate: String,
  endDate: String,
  currentRole: { type: Boolean, default: false },
  employmentType: String,
  industry: String,
  description: String,
  achievements: [String],
}, { _id: false })

const EducationSchema = new Schema({
  id: String,
  credential: String,
  institution: String,
  location: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  fieldOfStudy: String,
  notes: String,
}, { _id: false })

const CertificationSchema = new Schema({
  id: String,
  name: String,
  issuingBody: String,
  issueDate: String,
  expiryDate: String,
  credentialId: String,
}, { _id: false })

const ProjectSchema = new Schema({
  id: String,
  name: String,
  description: String,
  role: String,
  techOrTools: [String],
  url: String,
  highlights: [String],
}, { _id: false })

const LanguageSchema = new Schema({
  language: String,
  proficiency: String,
}, { _id: false })

const VolunteerSchema = new Schema({
  id: String,
  role: String,
  organization: String,
  startDate: String,
  endDate: String,
  description: String,
}, { _id: false })

const ProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: String,
    headline: String,
    phone: String,
    location: String,
    email: String,
    portfolio: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String,
    workAuthorization: String,
    skillCategories: [SkillCategorySchema],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    certifications: [CertificationSchema],
    projects: [ProjectSchema],
    languages: [LanguageSchema],
    volunteer: [VolunteerSchema],
    // Additional info for AI context
    careerObjective: String,
    standoutFacts: String,
    workEnvironment: String,
    availability: String,
    aiContext: String,
  },
  { timestamps: true }
)

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)
