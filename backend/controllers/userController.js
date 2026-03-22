const User = require('../models/User');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const getMe = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No valid Clerk token' });
    }

    let user = await User.findOne({ user_id: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        user_id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName || clerkUser.emailAddresses[0].emailAddress.split('@')[0],
        profile_photo: clerkUser.imageUrl,
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('💥 Error in getMe:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const makeMeAdmin = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { role: 'Admin' },
      { new: true }
    );

    res.json({ success: true, message: 'You are now an Admin!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
  getMe,
  makeMeAdmin,
  registerUser,
  checkUserExists,
};
