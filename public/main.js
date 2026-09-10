document.addEventListener('DOMContentLoaded', () => {
  // Review Form Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameEl = document.getElementById('reviewName');
      const typeEl = document.getElementById('reviewProjectType');
      const ratingEl = document.getElementById('reviewRating');
      const commentEl = document.getElementById('reviewComment');

      const formData = {
        name: nameEl ? nameEl.value : '',
        projectType: typeEl ? typeEl.value : '',
        rating: ratingEl ? ratingEl.value : '5',
        comment: commentEl ? commentEl.value : ''
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

  if (fileInput && fileChosenName) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        fileChosenName.textContent = `Selected: ${fileInput.files[0].name}`;
      } else {
        fileChosenName.textContent = '';
      }
    });
  }

  // Booking Form Submission
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData();
      const nameField = document.getElementById('name');
      const emailField = document.getElementById('email');
      const messageField = document.getElementById('message');

      if (nameField) formData.append('name', nameField.value);
      if (emailField) formData.append('email', emailField.value);
      if (messageField) formData.append('message', messageField.value);

      // Collect all checked service checkboxes
      const selectedServices = [];
      document.querySelectorAll('input[name="services"]:checked').forEach((checkbox) => {
        selectedServices.push(checkbox.value);
      });
      formData.append('projectType', selectedServices.join(', '));

      // Append file if selected
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('briefFile', fileInput.files[0]);
      }

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        if (response.ok) {
          alert('Booking inquiry sent successfully!');
          bookingForm.reset();
          if (fileChosenName) fileChosenName.textContent = '';
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
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }

  document.querySelectorAll('.role-card').forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};