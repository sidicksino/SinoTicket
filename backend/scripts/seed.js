/**
 * SinoTicket - Database Seed Script
 * Run: node backend/scripts/seed.js
 * 
 * Creates: 1 Admin, 3 Venues, 3 Sections per venue, 40 seats per section, 5 Events
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User    = require('../models/User');
const Venue   = require('../models/Venue');
const Section = require('../models/Section');
const Seat    = require('../models/Seat');
const Event   = require('../models/Event');

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL not found. Check backend/.env'); process.exit(1); }

// ───────────────────────────────────────────────
// TEST DATA
// ───────────────────────────────────────────────

const ADMIN = {
  user_id: 'seed_admin_001',
  email:   'admin@sinoticket.com',
  name:    'Sino Admin',
  role:    'Admin',
  is_verified: true,
};

const VENUES = [
  {
    name: 'Palais des Arts et de la Culture',
    location: 'N\'Djamena, Tchad (Quartier Sabangali)',
    capacity: 5000,
  },
  {
    name: 'Stade Idriss Mahamat Ouya',
    location: 'N\'Djamena, Tchad (Avenue Mobutu)',
    capacity: 20000,
  },
  {
    name: 'Hôtel Radisson Blu - Grand Ballroom',
    location: 'N\'Djamena, Tchad (Quartier Sabangali)',
    capacity: 1200,
  },
];

const VENUE_SECTIONS = [
  ['VIP Tribune', 'Golden Circle', 'Pelouse Nord'],
  ['Salle Principale', 'Balcon VIP', 'Espace Debout'],
  ['Tribune Est', 'Tribune Ouest', 'Fosse Centrale'],
];

const EVENTS = [
  {
    title: 'Afrotronix: Nomadic Blues Live',
    description: 'Une expérience audiovisuelle immersive mêlant rythmes traditionnels tchadiens et sonorités futuristes. Afrotronix revient au pays pour un concert historique au Palais des Arts.',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200',
    date: new Date('2026-05-20T20:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Afrotronix (Main Show)', time: '21:00' },
      { name: 'Grosse Machine (Opening)', time: '20:00' },
    ],
    categories: [
      { name: 'General Admission', price: 5000, quantity: 200 },
      { name: 'VIP Zone', price: 20000, quantity: 50 },
    ],
    category: 'Music',
    venueIndex: 0,
  },
  {
    title: 'Festival Dari: Terre de Culture',
    description: 'Le plus grand festival culturel du Tchad. Venez découvrir les danses, l\'artisanat et la gastronomie des 23 provinces du pays. Une célébration de notre identité nationale.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200',
    date: new Date('2026-12-01T10:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Ouverture Officielle', time: '10:00' },
      { name: 'Danses Traditionnelles (Kanem/Ouaddaï)', time: '14:00' },
      { name: 'Concert de Clôture', time: '18:00' },
    ],
    categories: [
      { name: 'Accès Journée', price: 1000, quantity: 500 },
      { name: 'Pass Festival (3 jours)', price: 2500, quantity: 100 },
    ],
    category: 'Cultural',
    venueIndex: 1,
  },
  {
    title: 'Mawndoe: Concert Acoustique',
    description: 'La voix d\'or du Tchad, Mawndoe, vous invite à une soirée intime et acoustique. Un voyage musical chargé d\'émotion et de poésie au Radisson Blu.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253344-99a30489246a?q=80&w=1200',
    date: new Date('2026-06-12T19:30:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Mawndoe (Acoustique)', time: '20:30' },
      { name: 'Innocent (Solo Piano)', time: '19:30' },
    ],
    categories: [
      { name: 'Premium Seats', price: 25000, quantity: 100 },
      { name: 'Backstage Access', price: 50000, quantity: 10 },
    ],
    category: 'Music',
    venueIndex: 2,
  },
  {
    title: 'Les Saos vs Lions Indomptables',
    description: 'Match de gala entre l\'équipe nationale du Tchad et le Cameroun. Venez supporter les Saos dans ce derby d\'Afrique Centrale électrisant au Stade Idriss Mahamat Ouya.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200',
    date: new Date('2026-04-15T16:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Kick-off', time: '16:00' },
      { name: 'Animations Mi-temps', time: '16:45' },
    ],
    categories: [
      { name: 'Tribune Populaire', price: 1000, quantity: 300 },
      { name: 'Tribune d\'Honneur', price: 10000, quantity: 30 },
    ],
    category: 'Sports',
    venueIndex: 1,
  },
  {
    title: 'N\'Djamena Fashion Week 2026',
    description: 'La mode tchadienne sous les projecteurs. Découvrez les nouvelles collections des designers locaux et internationaux les plus en vogue du moment.',
    imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200',
    date: new Date('2026-10-05T18:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Red Carpet Reception', time: '18:00' },
      { name: 'Fashion Show Part 1', time: '19:30' },
      { name: 'Gala Dinner', time: '21:30' },
    ],
    categories: [
      { name: 'Classic Entrance', price: 15000, quantity: 200 },
      { name: 'VVIP Table', price: 100000, quantity: 10 },
    ],
    category: 'Fashion',
    venueIndex: 2,
  },
];

// ───────────────────────────────────────────────
// SEED FUNCTION
// ───────────────────────────────────────────────

async function seed() {
  await mongoose.connect(DB_URL);
  console.log('✅ Connected to MongoDB');

  // 1. Wipe existing seed data (keep real user data)
  console.log('🧹 Clearing previous seed data...');
  await Event.deleteMany({});
  await Seat.deleteMany({});
  await Section.deleteMany({});
  await Venue.deleteMany({});
  await User.deleteOne({ user_id: ADMIN.user_id });

  // 2. Create Admin User
  const admin = await User.create(ADMIN);
  console.log(`👤 Created admin: ${admin.email}`);

  // 3. Create Venues + their Sections + Seats
  const createdVenues = [];
  for (let vi = 0; vi < VENUES.length; vi++) {
    const venue = await Venue.create({ ...VENUES[vi], admin_id: admin._id });
    console.log(`🏟️  Created venue: ${venue.name}`);
    createdVenues.push(venue);

    const sectionNames = VENUE_SECTIONS[vi];
    for (const sectionName of sectionNames) {
      const section = await Section.create({
        venue_id: venue._id,
        name: sectionName,
        description: `Section ${sectionName} de ${venue.name}`,
      });

      // Create 40 seats per section (8 rows x 5 cols)
      const seatDocs = Array.from({ length: 40 }, (_, i) => ({
        section_id: section._id,
        number: i + 1,
        status: 'available',
      }));
      await Seat.insertMany(seatDocs);
      console.log(`   💺 ${sectionName} — 40 seats created`);
    }
  }

  // 4. Create Events - assign to venues and sections
  for (const evData of EVENTS) {
    const venue = createdVenues[evData.venueIndex];
    // Fetch sections for this venue to link ticket categories
    const sections = await Section.find({ venue_id: venue._id });

    const ticket_categories = evData.categories.map((cat, i) => ({
      name: cat.name,
      price: cat.price,
      quantity: cat.quantity,
      sold: 0,
      section_id: sections[i % sections.length]?._id,
    }));

    await Event.create({
      title: evData.title,
      description: evData.description,
      imageUrl: evData.imageUrl,
      date: evData.date,
      status: evData.status,
      category: evData.category,
      venue_id: venue._id,
      admin_id: admin._id,
      artist_lineup: evData.artist_lineup,
      ticket_categories,
    });
    console.log(`🎭 Created event: ${evData.title}`);
  }

  console.log('\n🎉 Seed complete!');
  console.log(`   • 1 Admin`);
  console.log(`   • ${VENUES.length} Venues`);
  console.log(`   • ${VENUES.length * 3} Sections`);
  console.log(`   • ${VENUES.length * 3 * 40} Seats`);
  console.log(`   • ${EVENTS.length} Events`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
