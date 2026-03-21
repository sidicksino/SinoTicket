const User = require('../models/User');

const registerUser = async (req, res) => {
  try {
    const { name, email, clerkId, profilePhoto } = req.body;

    if (!name || !email || !clerkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        user_id: clerkId,
        name,
        profile_photo: profilePhoto || null
      },
      { returnDocument: 'after', upsert: true }
    );

    return res.status(201).json({ data: [updatedUser] });
  } catch (error) {
    console.error('💥 Error in registerUser:', error.message || error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
};

const checkUserExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const userExists = await User.exists({ email });

    return res.status(200).json({ exists: !!userExists });
  } catch (error) {
    console.error('💥 Error in checkUserExists:', error.message || error);
    return res.status(500).json({ 
      error: 'Internal Server Error'
    });
  }
};

module.exports = {
  registerUser,
  checkUserExists,
};
