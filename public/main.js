document.addEventListener('DOMContentLoaded', () => {
  // Review Form Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById('reviewName').value,
        projectType: document.getElementById('reviewProjectType').value,
        rating: document.getElementById('reviewRating').value,
        comment: document.getElementById('reviewComment').value
      };

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (response.ok) {
          alert('Review submitted successfully!');
          reviewForm.reset();
        } else {
          alert('Error: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to connect to the server.');
      }
    });
  }

  // Dynamic File Name Display Listener
  const fileInput = document.getElementById('campaignBrief');
  const fileChosenName = document.getElementById('file-chosen-name');

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        fileChosenName.textContent = `Selected: ${fileInput.files[0].name}`;
      } else {
        fileChosenName.textContent = '';
      }
    });
  }

  // Booking Form Submission (Supports Checkboxes & Files via FormData)
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append('name', document.getElementById('name').value);
      formData.append('email', document.getElementById('email').value);
      formData.append('message', document.getElementById('message').value);

      // Collect all checked service checkboxes
      const selectedServices = [];
      document.querySelectorAll('input[name="services"]:checked').forEach((checkbox) => {
        selectedServices.push(checkbox.value);
      });
      formData.append('projectType', selectedServices.join(', '));

      // Append file if selected
      if (fileInput && fileInput.files[0]) {
        formData.append('briefFile', fileInput.files[0]);
      }

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          // Note: Do NOT set Content-Type header manually when using FormData
          body: formData
        });

        const result = await response.json();
        if (response.ok) {
          alert('Booking inquiry sent successfully!');
          bookingForm.reset();
          if (fileChosenName) fileChosenName.textContent = ''; // Clear file display text on reset
        } else {
          alert('Error: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to connect to the server.');
      }
    });
  }
});

// Services Filter Tab Logic
window.filterServices = function(category, event) {
  // Update active tab button style
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Filter service cards
  document.querySelectorAll('.role-card').forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};