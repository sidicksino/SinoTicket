const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');

const getDashboardStats = async (req, res) => {
  try {
    // 1. General counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments({ status: 'Active' });

    // 2. Revenue calculation
    let totalRevenue = 0;
    const payments = await Payment.aggregate([
      { $match: { status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    if (payments.length > 0) {
      totalRevenue = payments[0].total;
    }

    // 3. Latest events mapped securely
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('venue_id', 'name')
      .lean();

    // Format events for simple consumption on UI
    const latestEventsFormatted = recentEvents.map(e => ({
      _id: e._id,
      title: e.title,
      date: e.date,
      venue_name: e.venue_id ? e.venue_id.name : 'Unknown Venue',
      image: e.image_url || null,
      soldPercentage: Math.floor(Math.random() * 80) + 10, // Mocked sold percentage for flair until tickets are tightly correlated
    }));

    // 4. Graph Timeline Logic (Mocked realistic recent sales)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    
    // Generate a sleek 6-month trailing chart
    const chartData = [];
    let baseVal = 1000;
    for(let i = 5; i >= 0; i--) {
        let rawIdx = currentMonthIndex - i;
        let finalIdx = rawIdx < 0 ? 12 + rawIdx : rawIdx;
        
        let growthNode = Math.floor(Math.random() * 800) - 200; // random noise
        baseVal += growthNode;
        if(baseVal < 500) baseVal = 500;
        
        chartData.push({
            name: months[finalIdx],
            sales: baseVal + (totalRevenue > 0 ? (totalRevenue / 1000) : 0), // Boost chart minimally if real revenue exists
            visitors: baseVal * 2.4 + Math.floor(Math.random() * 500),
        });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalTickets,
        totalUsers,
        totalEvents,
        latestEvents: latestEventsFormatted,
        chartData
      }
    });

  } catch (error) {
    console.error('💥 Error in getDashboardStats:', error.message || error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getDashboardStats,
};
