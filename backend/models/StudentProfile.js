import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema({
  studentId: { type: String, required: true },

  personalDetails: {
    fullName: String,
    email: String,
    phone: String,
    dob: String,
    gender: String,
    address: String,
    profileImage: String,
  },

  academic: {
    course: String,
    department: String,
    year: String,
    cgpa: String,
    backlogs: String,
    university: String,
    tenthSchool: String,
    tenthPercentage: String,
    tenthYear: String,
    twelfthSchool: String,
    twelfthPercentage: String,
    twelfthYear: String,
  },

  internships: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    },
  ],

  projects: [
    {
      title: String,
      techStack: String,
      description: String,
      link: String,
    },
  ],

  skills: [String],

  certifications: [
    {
      name: String,
      issuer: String,
      year: String,
    },
  ],

  achievements: [String],
});

export default mongoose.model("StudentProfile", StudentProfileSchema);
