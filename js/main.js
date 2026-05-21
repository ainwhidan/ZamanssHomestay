// ===========================
// NAVBAR — Scroll Effect
// ===========================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===========================
// HAMBURGER — Mobile Menu
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===========================
// SEARCH — Date Validation
// ===========================
const checkin = document.getElementById('checkin');
const checkout = document.getElementById('checkout');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
if (checkin) checkin.setAttribute('min', today);

checkin && checkin.addEventListener('change', () => {
  if (checkout) {
    checkout.setAttribute('min', checkin.value);
    if (checkout.value && checkout.value < checkin.value) {
      checkout.value = '';
    }
  }
});

function handleSearch() {
  const location = document.querySelectorAll('.search-field select')[0].value;
  const checkin  = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const guests   = document.querySelectorAll('.search-field select')[1].value;

  if (!checkin || !checkout) {
    alert('Please select your check-in and check-out dates.');
    return;
  }

  window.location.href = `search.php?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&guests=${encodeURIComponent(guests)}`;
}

// ===========================
// WISHLIST BUTTON — Toggle
// ===========================
document.querySelectorAll('.wishlist-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.textContent === '♡') {
      btn.textContent = '♥';
      btn.style.color = '#e53e3e';
    } else {
      btn.textContent = '♡';
      btn.style.color = '';
    }
  });
});

// ===========================
// SCROLL ANIMATION (Simple)
// ===========================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.homestay-card, .why-card, .testi-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Close dropdown bila click luar
document.addEventListener('click', function(e) {
  const dropdown = document.querySelector('.nav-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.querySelector('.dropdown-menu').style.opacity = '0';
    dropdown.querySelector('.dropdown-menu').style.visibility = 'hidden';
  }
});