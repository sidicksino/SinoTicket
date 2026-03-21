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
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        profile_photo = EXCLUDED.profile_photo
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

const checkUserExists = async (req, res) => {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const response = await sql`
      SELECT user_id 
      FROM users 
      WHERE email = ${email} 
      LIMIT 1;
    `;

    return res.status(200).json({ exists: response.length > 0 });
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
