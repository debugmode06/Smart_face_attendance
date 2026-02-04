import User from "../models/User.js";

export const saveInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: "No interests provided" });
    }

    const user = await User.findById(req.user._id);

    user.interests = interests;
    await user.save();

    res.json({ message: "Interests saved successfully", interests });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving interests" });
  }
};
