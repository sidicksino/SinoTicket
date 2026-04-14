const User = require('../models/User');
const { clerkClient } = require('@clerk/express');
const { Buffer } = require('buffer');

const getMe = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No valid Clerk token' });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    let user = await User.findOne({ user_id: userId });

    if (!user) {
      user = await User.create({
        user_id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName || clerkUser.emailAddresses[0].emailAddress.split('@')[0],
        profile_photo: clerkUser.imageUrl,
      });
    }

    const role = clerkUser.publicMetadata?.role || 'member';

    res.json({ success: true, user: { ...user.toObject(), role } });
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

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'Admin'
      }
    });

    const user = await User.findOne({ user_id: userId });

    res.json({ 
      success: true, 
      message: 'You are now an Admin!', 
      user: { ...user.toObject(), role: 'Admin' } 
    });
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

const updateMe = async (req, res) => {
  try {
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('📝 updateMe received fields:', Object.keys(req.body));

    const existingUser = await User.findOne({ user_id: userId });
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, phone_number, profile_photo, preferences } = req.body;
    const updateFields = {};

    // ── 1. Sync name to Clerk ──
    if (name !== undefined && name.trim()) {
      const trimmedName = name.trim();
      const nameParts = trimmedName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || undefined;

      try {
        await clerkClient.users.updateUser(userId, { firstName, lastName });
        console.log('✅ Clerk name synced:', firstName, lastName);
      } catch (clerkErr) {
        console.error('⚠️ Clerk name sync failed (continuing):', clerkErr.message);
      }

      updateFields.name = trimmedName;
    }

    // ── 2. Sync avatar to Clerk ──
    if (profile_photo !== undefined && profile_photo.startsWith('data:')) {
      try {
        // Extract base64 data from data URI
        const base64Data = profile_photo.split(',')[1];
        const mimeType = profile_photo.split(';')[0].split(':')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        // Create a File-like object for Clerk
        const file = new File([buffer], 'avatar.jpg', { type: mimeType });
        await clerkClient.users.updateUserProfileImage(userId, { file });
        console.log('✅ Clerk avatar synced');
      } catch (clerkErr) {
        console.error('⚠️ Clerk avatar sync failed (continuing):', clerkErr.message);
      }

      updateFields.profile_photo = profile_photo;
    }

    // ── 3. Phone (backend only) ──
    if (phone_number !== undefined) {
      updateFields.phone_number = phone_number.trim() || null;
    }

    // ── 4. Preferences (backend only) ──
    if (preferences !== undefined) {
      if (typeof preferences !== 'object' || Array.isArray(preferences) || preferences === null) {
        return res.status(400).json({ error: 'preferences must be an object' });
      }
      updateFields.preferences = {
        ...(existingUser.preferences || {}),
        ...preferences,
      };
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // ── 5. Save to MongoDB ──
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      updateFields,
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ updateMe complete:', updatedUser.name, updatedUser.phone_number);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('💥 Error in updateMe:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      users
    });
  } catch (error) {
    console.error('💥 Error in getAllUsers:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getMe,
  makeMeAdmin,
  registerUser,
  checkUserExists,
  updateMe,
  getAllUsers,
};
