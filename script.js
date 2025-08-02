document.addEventListener('DOMContentLoaded', () => {
  // --- Lazy Loading Images ---
  const lazyLoadImages = () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px', // Load images 50px before they enter viewport
      threshold: 0.01 // Trigger when 1% of image is visible
    });

    lazyImages.forEach(img => {
      observer.observe(img);
    });
  };

  // --- Card Fade-in Animation on Scroll ---
  const animateCardsOnScroll = () => {
    const cards = document.querySelectorAll('.card');
    const cardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    }, {
      rootMargin: '0px 0px -100px 0px', // Trigger when card is 100px from bottom of viewport
      threshold: 0.1 // Trigger when 10% of card is visible
    });

    cards.forEach(card => {
      cardObserver.observe(card);
    });
  };

  // --- Sticky Navigation Bar ---
  const nav = document.querySelector('nav');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Optional: Hide/show nav on scroll down/up (more advanced)
    // if (window.scrollY > lastScrollY && window.scrollY > nav.offsetHeight) {
    //   nav.style.transform = 'translateY(-100%)';
    // } else {
    //   nav.style.transform = 'translateY(0)';
    // }
    // lastScrollY = window.scrollY;
  });

  // --- Scroll to Top Button Logic ---
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.id = 'scrollToTopBtn';
  scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'; // Font Awesome icon
  document.body.appendChild(scrollToTopBtn);

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) { // Show button after scrolling 400px
      scrollToTopBtn.style.display = 'block';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scroll
    });
  });

  // --- Image Lightbox/Modal ---
  const setupLightbox = () => {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <span class="close">&times;</span>
      <img class="modal-content" id="img01">
      <div id="caption"></div>
    `;
    document.body.appendChild(modal);

    const modalImg = document.getElementById("img01");
    const captionText = document.getElementById("caption");
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }
    // Close modal when clicking outside the image
    modal.onclick = function(event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }

    // Attach click listener to all images that should open in modal
    document.querySelectorAll('.image-gallery img, .card img').forEach(img => {
      img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      }
    });
  };


  // --- Initial Data Fetch and Card Creation (for index.html) ---
  const fetchAndDisplayItems = (containerId, filterFn = null) => {
    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous content

        let itemsToDisplay = data;
        if (filterFn) {
          itemsToDisplay = data.filter(filterFn);
        }

        itemsToDisplay.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="https://via.placeholder.com/200x150?text=Loading..." data-src="${item.photo}" alt="${item.name}">
            <h3>${item.name}</h3>
            <a href="item.html?id=${item.id}">View Details</a>
          `;
          container.appendChild(card);
        });

        lazyLoadImages(); // Apply lazy load to newly added images
        animateCardsOnScroll(); // Apply fade-in animation to newly added cards
        setupLightbox(); // Re-attach lightbox listeners
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  // --- Page-specific Logic ---
  if (document.getElementById('items-container')) {
    fetchAndDisplayItems('items-container');
  }

  if (document.getElementById('area-select')) {
    document.getElementById('area-select').addEventListener('change', function () {
      const selectedArea = this.value;
      fetchAndDisplayItems('area-items', item => item.area === selectedArea);
    });
  }

  if (document.getElementById('floor-select')) {
    document.getElementById('floor-select').addEventListener('change', function () {
      const selectedFloor = this.value;
      fetchAndDisplayItems('floor-items', item => item.location === selectedFloor);
    });
  }

  // --- Item Details Page Logic ---
  if (document.getElementById('item-details')) {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    fetch('data.json')
      .then(res => res.json())
      .then(data => {
        const item = data.find(i => i.id == itemId);
        if (item) {
          document.getElementById('item-details').innerHTML = `
            <h1>${item.name}</h1>
            <div class="image-gallery">
              <img src="https://via.placeholder.com/200x150?text=Loading..." data-src="${item.photo}" alt="${item.name} - Image 1">
              <img src="https://via.placeholder.com/200x150?text=Loading..." data-src="${item.photo2}" alt="${item.name} - Image 2">
              <img src="https://via.placeholder.com/200x150?text=Loading..." data-src="${item.photo3}" alt="${item.name} - Image 3">
            </div>
            <p><strong>Found at:</strong> ${item.location}</p>
            <p><strong>Time:</strong> ${item.time}</p>
            <p><strong>Area:</strong> ${item.area}</p>
            <p><strong>Department:</strong> ${item.department}</p>
            <a href="https://wa.me/919999999999" class="contact-admin-btn">Contact Us (Admin)</a>
          `;
          lazyLoadImages(); // Apply lazy load to item details images
          setupLightbox(); // Attach lightbox to item details images
        } else {
          document.getElementById('item-details').innerHTML = '<h1>Item Not Found</h1><p>The item you are looking for does not exist.</p>';
        }
      })
      .catch(error => console.error('Error fetching item data:', error));
  }

  // --- Form Validation (Example for Upload Page) ---
  if (document.getElementById('upload-form')) {
    document.getElementById('upload-form').addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent default form submission

      const itemName = this.querySelector('input[name="name"]').value;
      const floor = this.querySelector('select[name="location"]').value;
      const area = this.querySelector('select[name="area"]').value;
      const hour = document.getElementById('hour').value;
      const minute = document.getElementById('minute').value;
      const ampm = document.getElementById('ampm').value;
      const department = this.querySelector('select[name="department"]').value;
      const photo = this.querySelector('input[name="photo"]').files.length;
      const photo2 = this.querySelector('input[name="photo2"]').files.length;
      const photo3 = this.querySelector('input[name="photo3"]').files.length;

      let isValid = true;
      let errorMessage = [];

      if (!itemName) errorMessage.push("Item Name is required.");
      if (!floor && !area) errorMessage.push("Please select either Floor or Campus Area.");
      if (floor && area) errorMessage.push("Please select only one of Floor or Campus Area.");
      if (!hour || !minute || !ampm) errorMessage.push("Time Found is required.");
      if (!department) errorMessage.push("Department is required.");
      if (!photo || !photo2 || !photo3) errorMessage.push("All three images are required.");

      if (errorMessage.length > 0) {
        alert("Please fix the following issues:\n" + errorMessage.join("\n"));
        isValid = false;
      }

      if (isValid) {
        // In a real application, you would send this data to a server
        alert("Item uploaded successfully! (This is a demo, no actual upload occurred)");
        this.reset(); // Clear the form
      }
    });
  }
});
