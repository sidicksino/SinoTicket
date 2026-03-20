const { neon } = require('@neondatabase/serverless');

const registerUser = async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const { name, email, clerkId, profilePhoto } = req.body;

    if (!name || !email || !clerkId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await sql`
      INSERT INTO users (
        user_id,
        email, 
        name,
        profile_photo
      ) 
      VALUES (
        ${clerkId}, 
        ${email},
        ${name},
        ${profilePhoto || null}
      )
      RETURNING *;`;

    return res.status(201).json({ data: response });
  } catch (error) {
    console.error('💥 Error in registerUser:', error.message || error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
};

module.exports = {
  registerUser,
};
