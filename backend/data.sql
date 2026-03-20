CREATE TYPE user_role AS ENUM ('Attendee', 'Admin');

CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY, -- Clerk IDs are safe here
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  name VARCHAR(100),
  profile_photo TEXT,
  role user_role NOT NULL DEFAULT 'Attendee',
  password VARCHAR(255) NULL,
  preferences JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

