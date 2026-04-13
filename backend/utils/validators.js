const { z } = require('zod');

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  date: z.string().datetime({ message: "Invalid datetime format" }),
  imageUrl: z.string().url().optional().nullable(),
  venue_id: z.string().length(24, 'Invalid Venue ID (must be a 24-character ObjectId)'),
  status: z.enum(['Upcoming', 'Ongoing', 'Ended']).optional(),
  category: z.enum(['Music', 'Sports', 'Cultural', 'Business', 'Fashion']).optional(),
  artist_lineup: z.array(z.object({
    name: z.string(),
    time: z.string()
  })).optional(),
  ticket_categories: z.array(z.object({
    category_id: z.string().length(24).optional().nullable(),
    name: z.string(),
    price: z.number().nonnegative(),
    section_id: z.string().length(24).optional().nullable(),
    quantity: z.number().int().positive()
  })).optional()
}).strict();

const venueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  capacity: z.number().int().positive('Capacity must be a positive number')
}).strict();

module.exports = {
  eventSchema,
  venueSchema
};
