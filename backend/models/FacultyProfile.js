import mongoose from "mongoose";

const FacultyProfileSchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: true,
      unique: true,
    },

    personalDetails: {
      fullName: String,
      email: String,
      phone: String,
      gender: String,
      dob: String,
      country: String,
      state: String,
      university: String,
      profileImage: String,
    },

    education: {
      highestQualification: String,
      specialization: String,
      certificateLink: String,
    },

    experience: {
      currentPosition: String,
      yearsOfExperience: String,
      pastRoles: String,
    },

    publications: {
      orcid: String,
      scholarId: String,
      scopusId: String,
      researchGate: String,
    },

    roles: {
      adminRoles: String,
      responsibilities: String,
    },

    achievements: {
      awards: String,
      fundedProjects: String,
      certifications: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("FacultyProfile", FacultyProfileSchema);
