/*
 * Premium iOS Developer Portfolio JavaScript Logic
 * Inspired by Apple's Design Philosophy (apple.com)
 * Vanilla JavaScript only, modular structure, optimized scroll triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all modular elements
  initThemeManager();
  initCustomCursor();
  initMagneticElements();
  initIphoneTilt();
  initScrollAnimations();
  initTimelineProgress();
  initNumberCounters();
  initTestimonialsSlider();
  initProjectModals();
  initMobileMenu();
});

/* ==========================================================================
   1. THEME MANAGER (Light/Dark Mode & OS Sync)
   ========================================================================== */
function initThemeManager() {
  const themeToggle = document.querySelector('.theme-toggle-btn');
  if (!themeToggle) return;

  const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const savedTheme = localStorage.getItem('theme') || getSystemTheme();
  
  // Set theme attribute
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Toggle theme click handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Watch for OS theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  });
}

/* ==========================================================================
   2. CUSTOM CURSOR FOLLOW (Lerp Animation)
   ========================================================================== */
function initCustomCursor() {
  // Don't initialize on touch screens
  if (window.matchMedia('(max-width: 1024px)').matches) return;

  // Create cursor elements dynamically
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';

  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  // Coordinates
  const mouse = { x: -100, y: -100 }; // Target position
  const cursorStyle = { x: -100, y: -100 }; // Follower current position
  
  // Update mouse target coordinates
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Quick update for core dot
    cursor.style.left = `${mouse.x}px`;
    cursor.style.top = `${mouse.y}px`;
  });

  // Linear interpolation function (lerp)
  function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
  }

  // Animation Loop at 60 FPS
  function animateFollower() {
    cursorStyle.x = lerp(cursorStyle.x, mouse.x, 0.15);
    cursorStyle.y = lerp(cursorStyle.y, mouse.y, 0.15);

    follower.style.left = `${cursorStyle.x}px`;
    follower.style.top = `${cursorStyle.y}px`;

    requestAnimationFrame(animateFollower);
  }
  requestAnimationFrame(animateFollower);

  // Hover states
  const hoverElements = document.querySelectorAll('a, button, .tab-btn, .project-card, .timeline-content, .card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}

/* ==========================================================================
   3. MAGNETIC BUTTONS (Pointer Proximity Physics)
   ========================================================================== */
function initMagneticElements() {
  const magneticItems = document.querySelectorAll('.magnetic-btn');
  if (window.matchMedia('(max-width: 1024px)').matches) return;

  magneticItems.forEach(item => {
    item.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      // Mouse coordinates relative to this button center
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      // Push button elements toward cursor (30% coefficient)
      this.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
      
      // Inside text push (15% coefficient)
      const text = this.querySelector('span, svg, a');
      if (text) {
        text.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      }
    });

    item.addEventListener('mouseleave', function() {
      // Smooth reset
      this.style.transform = 'translate(0px, 0px)';
      const text = this.querySelector('span, svg, a');
      if (text) {
        text.style.transform = 'translate(0px, 0px)';
      }
    });
  });
}

/* ==========================================================================
   4. IPHONE TILT PARALLAX (Cursor Coordinates)
   ========================================================================== */
function initIphoneTilt() {
  const container = document.querySelector('.hero-mockup-container');
  const frame = document.querySelector('.iphone-frame');
  
  if (!container || !frame || window.matchMedia('(max-width: 1024px)').matches) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    
    // Normalized position (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Smooth rotate based on offset
    frame.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 24}deg) translateZ(20px)`;
    frame.style.transition = 'none'; // Avoid transition delay while moving
  });

  container.addEventListener('mouseleave', () => {
    // Reset to default floating state
    frame.style.transform = 'rotateY(-5deg) rotateX(5deg) translateZ(0)';
    frame.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  });
}

/* ==========================================================================
   5. INTERSECTION OBSERVER FOR SCROLL REVEALS
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-hidden');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Reveal when 15% is visible
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target); // Trigger only once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Dynamic status bar chart update inside floating iPhone on scroll trigger
  const iphoneChart = document.querySelector('.iphone-app-chart');
  if (iphoneChart) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = iphoneChart.querySelectorAll('.iphone-chart-bar');
          bars.forEach((bar, index) => {
            setTimeout(() => {
              bar.classList.add('filled');
              // Random heights to animate
              const heights = [28, 38, 20, 35, 15, 39];
              bar.style.height = `${heights[index]}px`;
            }, index * 80);
          });
        }
      });
    }, { threshold: 0.5 });
    chartObserver.observe(iphoneChart);
  }
}

/* ==========================================================================
   6. SVG SCROLL PATH TIMELINE DRAWING
   ========================================================================== */
function initTimelineProgress() {
  const timeline = document.querySelector('.timeline-container');
  const path = document.querySelector('.timeline-line-progress');
  const dots = document.querySelectorAll('.timeline-dot');
  
  if (!timeline || !path) return;

  const pathLength = path.getTotalLength();
  
  // Set up dash offset properties
  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;

  function updateTimeline() {
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Calculate how far down the timeline is relative to screen center
    const startPoint = rect.top - (viewportHeight * 0.4);
    const totalHeight = rect.height;
    
    // Scroll progress normalized between 0 and 1
    let progress = -startPoint / totalHeight;
    progress = Math.max(0, Math.min(1, progress));

    // Draw SVG Path
    path.style.strokeDashoffset = pathLength - (progress * pathLength);

    // Highlight Dots based on scroll alignment
    dots.forEach(dot => {
      const dotRect = dot.getBoundingClientRect();
      if (dotRect.top < viewportHeight * 0.5) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Bind update events
  window.addEventListener('scroll', updateTimeline);
  window.addEventListener('resize', updateTimeline);
  updateTimeline(); // Initial run
}

/* ==========================================================================
   7. NUMERIC COUNTERS (scroll triggered)
   ========================================================================== */
function initNumberCounters() {
  const counters = document.querySelectorAll('.counter-val');
  
  const animateCounter = (el) => {
    const target = +el.getAttribute('data-target');
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();

    const updateValue = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out function
      const easeOutQuad = t => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const val = Math.floor(easedProgress * target);
      el.textContent = val;

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        el.textContent = target; // Safeguard correct value finish
      }
    };

    requestAnimationFrame(updateValue);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

/* ==========================================================================
   8. TESTIMONIALS SLIDER (Mouse drag & Touch swipe)
   ========================================================================== */
function initTestimonialsSlider() {
  const container = document.querySelector('.testimonials-slider-container');
  const slider = document.querySelector('.testimonials-slider');
  const dotsContainer = document.querySelector('.testimonials-pagination');
  
  if (!container || !slider) return;

  const cards = slider.querySelectorAll('.testimonial-card');
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let walk = 0;
  let activeIndex = 0;

  // Create page dots
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `pag-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => scrollToCard(index));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.pag-dot');

  // Mouse Drag Events
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    slider.style.transition = 'none';
    startX = e.pageX - slider.offsetLeft;
    // Current matrix translate coordinate
    const style = window.getComputedStyle(slider);
    const matrix = new WebKitCSSMatrix(style.transform);
    scrollLeft = matrix.m41;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    snapToNearest();
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    walk = x - startX;
    slider.style.transform = `translateX(${scrollLeft + walk}px)`;
  });

  // Touch Swipe Events (Mobile)
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    slider.style.transition = 'none';
    startX = e.touches[0].pageX - slider.offsetLeft;
    const style = window.getComputedStyle(slider);
    const matrix = new WebKitCSSMatrix(style.transform);
    scrollLeft = matrix.m41;
  });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    snapToNearest();
  });

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - slider.offsetLeft;
    walk = x - startX;
    slider.style.transform = `translateX(${scrollLeft + walk}px)`;
  });

  // Utility to scroll directly
  function scrollToCard(index) {
    activeIndex = index;
    const cardWidth = cards[0].offsetWidth + 32; // width + gap
    const targetOffset = -index * cardWidth;
    
    slider.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    slider.style.transform = `translateX(${targetOffset}px)`;
    updateDots();
  }

  // Snap after drag release
  function snapToNearest() {
    const cardWidth = cards[0].offsetWidth + 32;
    const style = window.getComputedStyle(slider);
    const matrix = new WebKitCSSMatrix(style.transform);
    const currentOffset = matrix.m41;
    
    // Estimate index
    let index = Math.round(-currentOffset / cardWidth);
    index = Math.max(0, Math.min(cards.length - 1, index));
    
    scrollToCard(index);
  }

  function updateDots() {
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Resize adjust handler
  window.addEventListener('resize', () => scrollToCard(activeIndex));
}

/* ==========================================================================
   9. FEATURED PROJECTS DETAIL MODAL (Drawer overlay)
   ========================================================================== */
function initProjectModals() {
  const openButtons = document.querySelectorAll('.open-details-btn');
  const overlay = document.querySelector('.modal-overlay');
  const closeButton = document.querySelector('.modal-close-btn');
  const modalContent = document.querySelector('.modal-content-inject');

  if (!overlay || !closeButton || !modalContent) return;

  // Mock details data payload to inject based on clicked project
  const projectCaseStudies = {
    fintech: {
      title: 'WealthFlow iOS: Wealth Management Platform',
      subtitle: 'FinTech App & Portfolio tracker',
      challenge: 'Managing real-time synchronization of volatile stock indices while keeping rendering performance locked at 60 FPS on older iOS devices.',
      solution: 'Developed custom CoreData local storage layer configured with parent-child contexts to parse network calls off-thread. Implemented SwiftUI View drawing optimizations and structured state diffs using diffable data sources to prevent unnecessary layout invalidations.',
      architecture: 'Clean Architecture with MVVM, Coordinator pattern, and complete Dependency Injection flow. Network layers abstract raw transactions via protocols.',
      results: [
        'Reduced app launch launch latency from 1.8s down to 0.45s.',
        'Obtained 4.8 App Store Rating over 50k weekly active installations.',
        '100% crash-free sessions across latest iOS SDK iterations.'
      ]
    },
    health: {
      title: 'PulsePulse: Intelligent Fitness Coach',
      subtitle: 'Health & CoreML tracking App',
      challenge: 'Interpreting complex sensor readouts from Apple Watch accelerometer streams synchronously without heating up the device battery.',
      solution: 'Trained a CoreML activity classification model. Leveraged Apple\'s Vision and Accelerometer frameworks to queue tensor operations through the Apple Neural Engine (ANE) via asynchronous GCD pipelines, avoiding execution bottlenecks on main thread.',
      architecture: 'VIPER pattern to isolate presentation from background CoreML threads. Interactors trigger isolated ML pipelines via worker delegates.',
      results: [
        'Cut Neural Engine battery draw down by 42% on compatible Apple Silicons.',
        'Ranked #8 Top Free Health Apps on the App Store during feature launches.',
        'Seamless local sensor analytics working completely offline.'
      ]
    },
    vision: {
      title: 'SightFinder: Real-time Vision Recognition',
      subtitle: 'AR and object detection API',
      challenge: 'High latency classification when overlaying bounding boxes onto real-time 4K live video capture feeds.',
      solution: 'Leveraged iOS Vision framework combined with customized YOLOv8 ML configurations. Streamlined frame captures via AVFoundation and mapped rendering steps directly to metal textures via Metal Performance Shaders.',
      architecture: 'MVVM-C with reactive Combine data bindings linking camera feeds to presentation coordinates.',
      results: [
        'Attained real-time object classification latency under 12ms per frames.',
        'Recognized 120+ categories of workspace items under low-light configurations.',
        'Featured by Apple as a Highlighted Developer Tool.'
      ]
    }
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pKey = btn.getAttribute('data-project');
      const data = projectCaseStudies[pKey];
      
      if (!data) return;

      // Inject content structure
      modalContent.innerHTML = `
        <h3>${data.title}</h3>
        <p class="modal-subtitle">${data.subtitle}</p>
        
        <div class="modal-section">
          <h4>Technical Challenge</h4>
          <p>${data.challenge}</p>
        </div>
        
        <div class="modal-section">
          <h4>Solution & Implementation</h4>
          <p>${data.solution}</p>
        </div>

        <div class="modal-section">
          <h4>Architectural Approach</h4>
          <p>${data.architecture}</p>
        </div>

        <div class="modal-section">
          <h4>Business & Technical Results</h4>
          <ul class="modal-list">
            ${data.results.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `;

      // Open drawer
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
    });
  });

  const closeModal = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Release scroll
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key press
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   10. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.navbar-menu');
  const navLinks = document.querySelectorAll('.navbar-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active'); // Close menu on click
    });
  });
}
