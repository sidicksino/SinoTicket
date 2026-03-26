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
    name: 'Stade National du 11 Août',
    location: 'N\'Djamena, Tchad',
    capacity: 30000,
  },
  {
    name: 'Palais du Peuple',
    location: 'N\'Djamena, Tchad',
    capacity: 5000,
  },
  {
    name: 'Goz Beida Arena',
    location: 'Goz Beida, Tchad',
    capacity: 8000,
  },
];

const VENUE_SECTIONS = [
  ['VIP Tribune', 'Golden Circle', 'Pelouse Nord'],
  ['Salle Principale', 'Balcon VIP', 'Espace Debout'],
  ['Tribune Est', 'Tribune Ouest', 'Fosse Centrale'],
];

const EVENTS = [
  {
    title: 'N\'Djamena Tech Summit 2026',
    description: 'Le plus grand rassemblement de technologie et d\'innovation en Afrique Centrale. Rejoignez des centaines de développeurs, entrepreneurs et investisseurs dans une journée de conférences et d\'ateliers.',
    imageUrl: 'https://images.unsplash.com/photo-1540575861501-7ad058c67a3f?q=80&w=1200&auto=format&fit=crop',
    date: new Date('2026-06-15T09:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Keynote: Future of AI in Africa', time: '09:00' },
      { name: 'Panel: Fintech Innovation', time: '11:30' },
      { name: 'Workshop: Mobile-First Development', time: '14:00' },
    ],
    categories: [
      { name: 'Standard', price: 5000, quantity: 200 },  // XAF
      { name: 'VIP', price: 15000, quantity: 50 },
    ],
    venueIndex: 0,
  },
  {
    title: 'Sahara Music Festival',
    description: 'Vivez une nuit inoubliable sous les étoiles au rythme des meilleurs artistes du Tchad et de la sous-région. Un festival unique en son genre célébrant la diversité musicale africaine.',
    imageUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=1200&auto=format&fit=crop',
    date: new Date('2026-07-04T20:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Artiste Invité 1', time: '20:00' },
      { name: 'Artiste Invité 2', time: '21:30' },
      { name: 'Headliner', time: '23:00' },
    ],
    categories: [
      { name: 'Entrée Générale', price: 3000, quantity: 500 },
      { name: 'Golden Circle', price: 10000, quantity: 100 },
      { name: 'VVIP Lounge', price: 25000, quantity: 20 },
    ],
    venueIndex: 0,
  },
  {
    title: 'Forum Économique du Tchad',
    description: 'Le rendez-vous annuel des leaders économiques et politiques pour débattre des enjeux du développement durable au Tchad et dans la région.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    date: new Date('2026-08-20T08:30:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Ouverture officielle', time: '08:30' },
      { name: 'Table ronde: Investissements', time: '10:00' },
      { name: 'Session Networking', time: '15:00' },
    ],
    categories: [
      { name: 'Délégué', price: 20000, quantity: 150 },
      { name: 'Observateur', price: 8000, quantity: 200 },
    ],
    venueIndex: 1,
  },
  {
    title: 'Gala de la Mode Africaine',
    description: 'Une soirée de haute couture africaine réunissant les créateurs de mode les plus talentueux du continent. Attendez-vous à des défilés spectaculaires et des tenues époustouflantes.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop',
    date: new Date('2026-09-12T19:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Défilé Créateurs Émergents', time: '19:00' },
      { name: 'Défilé Maison Principale', time: '21:00' },
      { name: 'After-Party & Awards', time: '23:00' },
    ],
    categories: [
      { name: 'Normal', price: 12000, quantity: 300 },
      { name: 'Front Row', price: 35000, quantity: 30 },
    ],
    venueIndex: 1,
  },
  {
    title: 'Derby de Goz Beida 2026',
    description: 'L\'affrontement tant attendu entre les deux équipes de football les plus populaires de la région de Goz Beida. Un match à ne rater sous aucun prétexte !',
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200&auto=format&fit=crop',
    date: new Date('2026-05-30T16:00:00'),
    status: 'Upcoming',
    artist_lineup: [
      { name: 'Pré-match Animations', time: '15:00' },
      { name: 'Match (90 min)', time: '16:00' },
      { name: 'Cérémonie des Trophées', time: '18:30' },
    ],
    categories: [
      { name: 'Tribune Populaire', price: 500, quantity: 5000 },
      { name: 'Tribune Couverte', price: 2000, quantity: 1000 },
      { name: 'Loge VIP', price: 10000, quantity: 50 },
    ],
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
