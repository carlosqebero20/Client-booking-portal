const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    lowercase: true,
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Photo Modeling / Editorial',
      'Social Media Hosting',
      'Brand Ambassador Campaign',
      'Virtual Executive Assistance / PM'
    ]
  },
  details: {
    type: String,
    required: [true, 'Project details are required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        service: document.getElementById('serviceSelect').value,
        details: document.getElementById('projectDetails').value
      };

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          alert(`Thank you, ${payload.fullName}! Your booking inquiry has been logged successfully.`);
          bookingForm.reset();
        } else {
          alert(`Submission error: ${data.error || 'Please review your entries.'}`);
        }
      } catch (error) {
        console.error('API submit error:', error);
        alert('Network connection error. Server is unreachable.');
      }
    });
  }
});