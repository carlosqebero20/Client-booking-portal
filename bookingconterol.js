const Booking = require('../models/Booking');

// @desc    Create new booking inquiry
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { fullName, email, service, details } = req.body;

    if (!fullName || !email || !service || !details) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newBooking = await Booking.create({
      fullName,
      email,
      service,
      details
    });

    res.status(201).json({
      success: true,
      data: newBooking
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error creating booking request.'
    });
  }
};

// @desc    Get all booking inquiries
// @route   GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error retrieving bookings.'
    });
  }
};