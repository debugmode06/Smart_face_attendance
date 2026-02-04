import Assessment from "../models/Assessment.js";
import AssessmentSubmission from "../models/AssessmentSubmission.js";

// 🔹 Get all assessments for a faculty
export const getFacultyAssessments = async (req, res) => {
  const facultyId = req.user._id;
  const assessments = await Assessment.find({ facultyId }).sort({ createdAt: -1 });
  res.json({ assessments });
};

// 🔹 Get single assessment by id (for student attempt)
export const getAssessmentById = async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  res.json({ assessment });
};

// 🔹 Submit assessment (student)
export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    const studentId = req.user._id;

    const assessment = await Assessment.findById(assessmentId);
    
    let score = 0;

    const checkedAnswers = assessment.questions.map((q, idx) => {
      const studentAnswer = answers[idx];
      let isCorrect = false;

      if (q.type === "mcq") {
        isCorrect = Number(studentAnswer) === Number(q.correctOptionIndex);
        if (isCorrect) score += q.marks;
      }

      return {
        questionId: idx,
        answer: studentAnswer,
        isCorrect,
      };
    });

    await AssessmentSubmission.create({
      assessmentId,
      studentId,
      answers: checkedAnswers,
      score,
    });

    res.json({ message: "Submitted!", score });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error submitting assessment" });
  }
};

// 🔹 Get submissions for a specific assessment (faculty)
export const getAssessmentSubmissions = async (req, res) => {
  const { assessmentId } = req.params;
  const submissions = await AssessmentSubmission.find({ assessmentId })
    .populate("studentId", "name email")
    .sort({ createdAt: -1 });

  res.json({ submissions });
};
