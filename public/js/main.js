/**
 * Rising Promise Website - Main JavaScript
 * Handles all interactive functionality and content population from config.js
 */

(function() {
  'use strict';

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize the website when DOM is ready
   */
  function init() {
    // Populate content from config
    populateNavigation();
    populateFooter();
    
    // Page-specific content population
    const currentPage = getCurrentPage();
    
    if (currentPage === 'index') {
      populateHomepage();
    } else if (currentPage === 'raffle') {
      populateRafflePage();
      handleComingSoonOverlay('raffleActive');
    } else if (currentPage === 'programs') {
      populateProgramsPage();
      handleComingSoonOverlay('programsActive');
    }
    
    // Initialize interactive features
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initFormHandlers();
    initSocialShare();
  }

  /**
   * Get current page identifier
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('raffle')) return 'raffle';
    if (path.includes('programs')) return 'programs';
    return 'index';
  }

  // ============================================================================
  // CONTENT POPULATION
  // ============================================================================

  /**
   * Populate navigation menu from config
   */
  function populateNavigation() {
    const config = window.siteConfig;
    const navMenu = document.getElementById('nav-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!config || !navMenu) return;
    
    // Build navigation HTML
    let navHTML = '';
    config.navigation.menuItems.forEach(item => {
      navHTML += `<a href="${item.href}" class="nav-link" data-testid="link-nav-${item.text.toLowerCase().replace(/\s+/g, '-')}">${item.text}</a>`;
    });
    
    // Add raffle link if active
    if (config.features.showRaffleInNav) {
      navHTML += '<a href="raffle.html" class="nav-link" data-testid="link-nav-raffle">Raffle</a>';
    }
    
    // Update desktop menu
    navMenu.innerHTML = navHTML;
    
    // Update mobile menu (add items after close button)
    if (mobileMenu) {
      const closeBtn = mobileMenu.querySelector('.mobile-menu-close');
      mobileMenu.innerHTML = '';
      mobileMenu.appendChild(closeBtn);
      
      const mobileItems = navHTML.split('</a>').filter(Boolean);
      mobileItems.forEach(item => {
        mobileMenu.innerHTML += item + '</a>';
      });
    }
  }

  /**
   * Populate homepage content
   */
  function populateHomepage() {
    const config = window.siteConfig;
    if (!config) return;
    
    // Hero Section
    populateElement('hero-headline', config.hero.headline);
    populateElement('hero-subheadline', config.hero.subheadline);
    
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.style.backgroundImage = `url('${config.hero.backgroundImage}')`;
    }
    
    const heroButtons = document.getElementById('hero-buttons');
    if (heroButtons) {
      heroButtons.innerHTML = `
        <a href="${config.hero.primaryButtonHref}" class="btn btn-primary btn-large" data-testid="button-hero-primary">${config.hero.primaryButtonText}</a>
        <a href="${config.hero.secondaryButtonHref}" class="btn btn-outline btn-large" data-testid="button-hero-secondary">${config.hero.secondaryButtonText}</a>
      `;
    }
    
    // Story Section
    populateElement('story-headline', config.story.headline);
    populateElement('story-closing', config.story.closing);
    
    const storyParagraphs = document.getElementById('story-paragraphs');
    if (storyParagraphs) {
      storyParagraphs.innerHTML = config.story.paragraphs.map((p, i) => 
        `<p class="story-paragraph fade-in" data-testid="text-story-p${i+1}">${p}</p>`
      ).join('');
    }
    
    // Who We See Section
    populateElement('who-headline', config.whoWeSee.headline);
    populateElement('who-closing', config.whoWeSee.closing);
    
    const whoParagraphs = document.getElementById('who-paragraphs');
    if (whoParagraphs) {
      whoParagraphs.innerHTML = config.whoWeSee.paragraphs.map((p, i) => 
        `<p class="who-paragraph fade-in" data-testid="text-who-p${i+1}">${p}</p>`
      ).join('');
    }
    
    // What We Do Section
    populateElement('what-headline', config.whatWeDo.headline);
    populateElement('feature-promise', config.whatWeDo.promise);
    
    const featuresGrid = document.getElementById('features-grid');
    if (featuresGrid) {
      featuresGrid.innerHTML = config.whatWeDo.features.map((feature, i) => `
        <div class="feature-card fade-in" data-testid="card-feature-${i}">
          <i class="${feature.icon} feature-icon"></i>
          <h3 class="feature-title" data-testid="text-feature-title-${i}">${feature.title}</h3>
          <p class="feature-description" data-testid="text-feature-desc-${i}">${feature.description}</p>
        </div>
      `).join('');
    }
    
    const programsButton = document.getElementById('programs-button');
    if (programsButton) {
      programsButton.textContent = config.whatWeDo.buttonText;
      programsButton.href = config.whatWeDo.buttonHref;
      
      if (config.whatWeDo.buttonComingSoon) {
        programsButton.insertAdjacentHTML('afterend', '<span class="coming-soon-badge">Coming Soon</span>');
      }
    }
    
    // Impact Section
    populateElement('impact-headline', config.impact.headline);
    populateElement('impact-intro', config.impact.introText);
    populateElement('impact-closing', config.impact.closing);
    
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = config.impact.stats.map((stat, i) => `
        <div class="stat-card fade-in" data-testid="card-stat-${i}">
          <div class="stat-number" data-testid="text-stat-number-${i}">${stat.number}</div>
          <div class="stat-label" data-testid="text-stat-label-${i}">${stat.label}</div>
          ${stat.sublabel ? `<div class="stat-sublabel" data-testid="text-stat-sublabel-${i}">${stat.sublabel}</div>` : ''}
        </div>
      `).join('');
    }
    
    // Team Section
    populateElement('team-headline', config.team.headline);
    populateElement('team-intro', config.team.introText);
    populateElement('team-closing', config.team.closing);
    
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
      teamGrid.innerHTML = config.team.members.map((member, i) => `
        <div class="team-member fade-in" data-testid="card-team-${i}">
          <img src="${member.photo}" alt="${member.name}" class="team-photo" data-testid="img-team-${i}">
          <h3 class="team-name" data-testid="text-team-name-${i}">${member.name}</h3>
          <p class="team-title" data-testid="text-team-title-${i}">${member.title}</p>
          <p class="team-quote" data-testid="text-team-quote-${i}">"${member.quote}"</p>
        </div>
      `).join('');
    }
    
    // Join Us Section
    populateElement('join-headline', config.joinUs.headline);
    populateElement('need-headline', config.joinUs.needUs.headline);
    populateElement('need-text', config.joinUs.needUs.text);
    populateElement('need-note', config.joinUs.needUs.note);
    populateElement('believe-headline', config.joinUs.believeInUs.headline);
    populateElement('believe-text', config.joinUs.believeInUs.text);
    populateElement('join-closing', config.joinUs.believeInUs.closing);
    
    // Update form placeholders
    updateFormPlaceholder('need-email-form', 'input[type="text"]', config.joinUs.needUs.formPlaceholderName);
    updateFormPlaceholder('need-email-form', 'input[type="email"]', config.joinUs.needUs.formPlaceholderEmail);
    updateFormButton('need-email-form', 'button', config.joinUs.needUs.buttonText);
    
    const actionButtons = document.getElementById('action-buttons');
    if (actionButtons) {
      actionButtons.innerHTML = config.joinUs.believeInUs.actions.map((action, i) => `
        <a href="${action.href}" class="action-btn" data-testid="button-action-${i}">
          <i class="${action.icon}"></i>
          <span>${action.text}</span>
          ${action.comingSoon ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}
        </a>
      `).join('');
    }
  }

  /**
   * Populate raffle page content
   */
  function populateRafflePage() {
    const config = window.siteConfig;
    if (!config || !config.raffle) return;
    
    // Hero
    populateElement('raffle-hero-headline', config.raffle.hero.headline);
    populateElement('raffle-hero-subheadline', config.raffle.hero.subheadline);
    
    const heroSection = document.getElementById('raffle-hero');
    if (heroSection) {
      heroSection.style.backgroundImage = `url('${config.raffle.hero.backgroundImage}')`;
    }
    
    // Prize Details
    populateElement('prize-title', config.raffle.prizeDetails.title);
    populateElement('prize-destination', config.raffle.prizeDetails.destination);
    populateElement('prize-note', config.raffle.prizeDetails.note);
    populateElement('drawing-date', config.raffle.prizeDetails.drawingDate);
    populateElement('announcement-date', config.raffle.prizeDetails.announcementDate);
    
    // Pricing Cards
    const pricingGrid = document.getElementById('pricing-grid');
    if (pricingGrid) {
      pricingGrid.innerHTML = config.raffle.ticketPricing.map((ticket, i) => `
        <div class="pricing-card ${ticket.badge ? 'featured' : ''} fade-in" data-testid="card-pricing-${i}">
          ${ticket.badge ? `<div class="pricing-badge">${ticket.description}</div>` : ''}
          <div class="pricing-price" data-testid="text-pricing-price-${i}">${ticket.price}</div>
          <div class="pricing-entries" data-testid="text-pricing-entries-${i}">${ticket.entries}</div>
          <p class="pricing-description" data-testid="text-pricing-desc-${i}">${ticket.description}</p>
        </div>
      `).join('');
    }
    
    // Where Money Goes
    populateElement('where-money-headline', config.raffle.whereMoneyGoes.headline);
    populateElement('sponsor-text', config.raffle.whereMoneyGoes.sponsor);
    
    const moneyGoesGrid = document.getElementById('money-goes-grid');
    if (moneyGoesGrid) {
      moneyGoesGrid.innerHTML = config.raffle.whereMoneyGoes.items.map((item, i) => `
        <div class="feature-card fade-in" data-testid="card-money-${i}">
          <i class="${item.icon} feature-icon"></i>
          <p style="margin-top: 1rem; font-size: 1.125rem; font-weight: 600; color: var(--color-navy);" data-testid="text-money-${i}">${item.text}</p>
        </div>
      `).join('');
    }
    
    // Buy Tickets
    populateElement('buy-tickets-button', config.raffle.buyTickets.buttonText, 'textContent');
    populateElement('alternate-text', config.raffle.buyTickets.alternateText);
    populateElement('donate-button', config.raffle.buyTickets.alternateButtonText, 'textContent');
    
    const trustBadges = document.getElementById('trust-badges');
    if (trustBadges) {
      trustBadges.innerHTML = config.raffle.buyTickets.trustBadges.map((badge, i) => `
        <div class="trust-badge" data-testid="badge-trust-${i}">
          <i class="fas fa-check-circle"></i>
          <span>${badge}</span>
        </div>
      `).join('');
    }
    
    // Legal
    const rulesLink = document.getElementById('rules-link');
    if (rulesLink) {
      rulesLink.href = config.raffle.legalText.rulesLink;
      rulesLink.textContent = config.raffle.legalText.rulesText;
    }
    populateElement('eligibility-text', config.raffle.legalText.eligibility);
    populateElement('details-text', config.raffle.legalText.details);
  }

  /**
   * Populate programs page content
   */
  function populateProgramsPage() {
    const config = window.siteConfig;
    if (!config || !config.programs) return;
    
    // Hero
    populateElement('programs-hero-headline', config.programs.hero.headline);
    populateElement('programs-hero-subheadline', config.programs.hero.subheadline);
    
    const heroSection = document.getElementById('programs-hero');
    if (heroSection) {
      heroSection.style.backgroundImage = `url('${config.programs.hero.backgroundImage}')`;
    }
    
    // Overview
    populateElement('overview-headline', config.programs.overview.headline);
    populateElement('overview-text', config.programs.overview.text);
    
    // Programs Grid
    const programsGrid = document.getElementById('programs-grid');
    if (programsGrid) {
      let programsHTML = '';
      
      // CNA Program
      if (config.programs.cna.visible) {
        programsHTML += createProgramCard('cna', config.programs.cna, config.features.cnaApplicationOpen);
      }
      
      // IT Program
      if (config.programs.it.visible) {
        programsHTML += createProgramCard('it', config.programs.it, config.features.itApplicationOpen);
      }
      
      programsGrid.innerHTML = programsHTML;
      
      // Initialize program details toggles
      initProgramDetailsToggles();
    }
    
    // Coming Soon Programs
    populateElement('coming-soon-headline', config.programs.comingSoon.headline);
    populateElement('coming-soon-text', config.programs.comingSoon.text);
    
    const upcomingPrograms = document.getElementById('upcoming-programs');
    if (upcomingPrograms) {
      upcomingPrograms.innerHTML = config.programs.comingSoon.upcomingPrograms.map((program, i) => `
        <div class="feature-card fade-in" style="text-align: center;" data-testid="card-upcoming-${i}">
          <i class="fas fa-graduation-cap feature-icon"></i>
          <h3 class="feature-title" data-testid="text-upcoming-${i}">${program}</h3>
        </div>
      `).join('');
    }
    
    // How It Works
    populateElement('how-it-works-headline', config.programs.howItWorks.headline);
    
    const processSteps = document.getElementById('process-steps');
    if (processSteps) {
      processSteps.innerHTML = config.programs.howItWorks.steps.map((step, i) => `
        <div class="process-step fade-in" data-testid="step-${i}">
          <div class="step-number" data-testid="text-step-number-${i}">${step.number}</div>
          <h3 class="step-title" data-testid="text-step-title-${i}">${step.title}</h3>
          <p class="step-description" data-testid="text-step-desc-${i}">${step.description}</p>
        </div>
      `).join('');
    }
    
    // Eligibility
    populateElement('eligibility-headline', config.programs.eligibility.headline);
    populateElement('eligibility-note', config.programs.eligibility.note);
    populateElement('eligibility-button', config.programs.eligibility.buttonText, 'textContent');
    
    const eligibilityItems = document.getElementById('eligibility-items');
    if (eligibilityItems) {
      eligibilityItems.innerHTML = config.programs.eligibility.items.map((item, i) => `
        <div class="fade-in" style="display: flex; align-items: start; gap: 1rem; padding: 1rem; background: var(--color-gray-100); border-radius: var(--radius-md);" data-testid="item-eligibility-${i}">
          <i class="fas fa-check-circle" style="color: var(--color-sky-blue); font-size: 1.25rem; margin-top: 0.25rem;"></i>
          <p style="margin: 0; font-size: 1.125rem;">${item}</p>
        </div>
      `).join('');
    }
    
    // Application
    populateElement('application-headline', config.programs.application.headline);
    populateElement('application-text', config.programs.application.text);
    
    const appForm = document.getElementById('application-form');
    if (appForm) {
      const submitBtn = appForm.querySelector('#submit-application');
      if (submitBtn) {
        submitBtn.textContent = config.programs.application.submitButtonText;
      }
    }
  }

  /**
   * Create a program card HTML
   */
  function createProgramCard(id, program, applicationOpen) {
    const certifications = program.certifications ? 
      `<div class="program-meta-item" data-testid="meta-${id}-certs">
        <i class="fas fa-certificate"></i>
        <span>${program.certifications}</span>
      </div>` : '';
    
    return `
      <div class="program-card fade-in" data-testid="card-program-${id}">
        ${program.image ? `<img src="${program.image}" alt="${program.title}" class="program-image" data-testid="img-program-${id}">` : ''}
        <div class="program-content">
          <i class="${program.icon} program-icon"></i>
          <h3 class="program-title" data-testid="text-program-title-${id}">${program.title}</h3>
          
          <div class="program-meta">
            <div class="program-meta-item" data-testid="meta-${id}-duration">
              <i class="fas fa-clock"></i>
              <span>${program.duration}</span>
            </div>
            <div class="program-meta-item" data-testid="meta-${id}-format">
              <i class="fas fa-laptop"></i>
              <span>${program.format}</span>
            </div>
            <div class="program-meta-item" data-testid="meta-${id}-salary">
              <i class="fas fa-dollar-sign"></i>
              <span>${program.salary}</span>
            </div>
            ${certifications}
          </div>
          
          <a href="#application" class="btn btn-primary" ${!applicationOpen ? 'disabled' : ''} data-testid="button-apply-${id}">
            ${applicationOpen ? 'Apply Now' : 'Applications Opening Soon'}
          </a>
          
          <div class="program-details">
            <button type="button" class="program-details-toggle" data-program="${id}" data-testid="button-toggle-${id}">
              Learn More
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="program-details-content" id="details-${id}">
              <div class="program-details-inner">
                ${createProgramSection('Curriculum', program.curriculum, `curriculum-${id}`)}
                ${createProgramSection('Requirements', program.requirements, `requirements-${id}`)}
                ${createProgramSection('Career Paths', program.careerPaths, `paths-${id}`)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create a program detail section
   */
  function createProgramSection(title, items, testId) {
    if (!items || !items.length) return '';
    
    return `
      <div>
        <h4 class="program-section-title">${title}</h4>
        <ul class="program-list" data-testid="${testId}">
          ${items.map((item, i) => `<li data-testid="${testId}-${i}">${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Initialize program details toggle functionality
   */
  function initProgramDetailsToggles() {
    const toggleButtons = document.querySelectorAll('.program-details-toggle');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', function() {
        const programId = this.getAttribute('data-program');
        const content = document.getElementById(`details-${programId}`);
        const icon = this.querySelector('i');
        
        if (content.classList.contains('expanded')) {
          content.classList.remove('expanded');
          icon.style.transform = 'rotate(0deg)';
        } else {
          content.classList.add('expanded');
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  /**
   * Populate footer content
   */
  function populateFooter() {
    const config = window.siteConfig;
    if (!config) return;
    
    // Organization info
    populateElement('footer-org-name', config.organization.name);
    populateElement('footer-tagline', config.organization.tagline);
    
    // Social links
    const socialLinks = document.getElementById('social-links');
    if (socialLinks) {
      const socialHTML = [];
      
      if (config.social.facebook) {
        socialHTML.push(`<a href="${config.social.facebook}" class="social-link" target="_blank" rel="noopener" aria-label="Facebook" data-testid="link-social-facebook"><i class="fab fa-facebook-f"></i></a>`);
      }
      if (config.social.instagram) {
        socialHTML.push(`<a href="${config.social.instagram}" class="social-link" target="_blank" rel="noopener" aria-label="Instagram" data-testid="link-social-instagram"><i class="fab fa-instagram"></i></a>`);
      }
      if (config.social.linkedin) {
        socialHTML.push(`<a href="${config.social.linkedin}" class="social-link" target="_blank" rel="noopener" aria-label="LinkedIn" data-testid="link-social-linkedin"><i class="fab fa-linkedin-in"></i></a>`);
      }
      if (config.social.twitter) {
        socialHTML.push(`<a href="${config.social.twitter}" class="social-link" target="_blank" rel="noopener" aria-label="Twitter" data-testid="link-social-twitter"><i class="fab fa-twitter"></i></a>`);
      }
      
      socialLinks.innerHTML = socialHTML.join('');
    }
    
    // Quick links
    const footerQuickLinks = document.getElementById('footer-quick-links');
    if (footerQuickLinks) {
      footerQuickLinks.innerHTML = config.footer.quickLinks.map(link => 
        `<li><a href="${link.href}" data-testid="link-footer-${link.text.toLowerCase().replace(/\s+/g, '-')}">${link.text}</a></li>`
      ).join('');
    }
    
    // Contact info
    const footerContact = document.getElementById('footer-contact');
    if (footerContact) {
      footerContact.innerHTML = `
        <p><i class="fas fa-envelope" style="margin-right: 0.5rem; color: var(--color-sky-blue);"></i> ${config.organization.email}</p>
        <p><i class="fas fa-phone" style="margin-right: 0.5rem; color: var(--color-sky-blue);"></i> ${config.organization.phone}</p>
        <p><i class="fas fa-map-marker-alt" style="margin-right: 0.5rem; color: var(--color-sky-blue);"></i> ${config.organization.address}</p>
      `;
    }
    
    // Copyright
    populateElement('footer-copyright', config.footer.copyright);
    populateElement('footer-nonprofit', config.organization.nonprofitStatus);
  }

  /**
   * Handle coming soon overlay
   */
  function handleComingSoonOverlay(featureKey) {
    const config = window.siteConfig;
    if (!config) return;
    
    const overlay = document.getElementById('coming-soon-overlay');
    if (!overlay) return;
    
    // Show overlay if feature is not active
    if (!config.features[featureKey]) {
      overlay.classList.add('active');
    }
  }

  // ============================================================================
  // INTERACTIVE FEATURES
  // ============================================================================

  /**
   * Initialize sticky header behavior
   */
  function initStickyHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollTop = scrollTop;
    });
  }

  /**
   * Initialize mobile menu toggle
   */
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!toggleBtn || !closeBtn || !mobileMenu) return;
    
    toggleBtn.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    
    closeBtn.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Close menu when clicking on a link
    const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /**
   * Initialize smooth scrolling for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Skip if href is just "#"
        if (href === '#') {
          e.preventDefault();
          return;
        }
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          const headerHeight = 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Initialize scroll-triggered animations
   */
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(element => {
      observer.observe(element);
    });
  }

  /**
   * Initialize form handlers
   */
  function initFormHandlers() {
    // Email signup forms
    const emailForms = document.querySelectorAll('.email-form');
    emailForms.forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleEmailSignup(this);
      });
    });
    
    // Application form
    const appForm = document.getElementById('application-form');
    if (appForm) {
      appForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleApplicationSubmit(this);
      });
    }
    
    // Coming soon form
    const comingSoonForm = document.getElementById('coming-soon-form');
    if (comingSoonForm) {
      comingSoonForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleComingSoonSubmit(this);
      });
    }
  }

  /**
   * Handle email signup form submission
   */
  function handleEmailSignup(form) {
    const emailInput = form.querySelector('input[type="email"]');
    
    if (!emailInput || !emailInput.value) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Email signup:', emailInput.value);
    
    // Show success message
    alert('Thank you for signing up! We\'ll be in touch soon.');
    form.reset();
  }

  /**
   * Handle application form submission
   */
  function handleApplicationSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'program', 'background'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Application submitted:', data);
    
    // Show success message
    const config = window.siteConfig;
    const successMessage = document.getElementById('application-success');
    if (successMessage) {
      successMessage.textContent = config.programs.application.successMessage;
      successMessage.style.display = 'block';
    }
    
    form.reset();
    
    setTimeout(() => {
      if (successMessage) {
        successMessage.style.display = 'none';
      }
    }, 5000);
  }

  /**
   * Handle coming soon form submission
   */
  function handleComingSoonSubmit(form) {
    const emailInput = form.querySelector('input[type="email"]');
    
    if (!emailInput || !emailInput.value) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Coming soon signup:', emailInput.value);
    
    // Show success message
    alert('Thank you! We\'ll notify you when we launch.');
    form.reset();
  }

  /**
   * Initialize social sharing
   */
  function initSocialShare() {
    // Find share buttons
    const shareButtons = document.querySelectorAll('[href="#share"]');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (navigator.share) {
          navigator.share({
            title: 'Rising Promise',
            text: 'Everyone deserves a fighting chance. Join Rising Promise in empowering communities.',
            url: window.location.href
          }).catch(err => console.log('Error sharing:', err));
        } else {
          // Fallback: copy link to clipboard
          const url = window.location.href;
          navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
          });
        }
      });
    });
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Populate an element with content
   */
  function populateElement(id, content, property = 'innerHTML') {
    const element = document.getElementById(id);
    if (element && content) {
      element[property] = content;
    }
  }

  /**
   * Update form input placeholder
   */
  function updateFormPlaceholder(formId, selector, placeholder) {
    const form = document.getElementById(formId);
    if (form) {
      const input = form.querySelector(selector);
      if (input) {
        input.placeholder = placeholder;
      }
    }
  }

  /**
   * Update form button text
   */
  function updateFormButton(formId, selector, text) {
    const form = document.getElementById(formId);
    if (form) {
      const button = form.querySelector(selector);
      if (button) {
        button.textContent = text;
      }
    }
  }

  // ============================================================================
  // START INITIALIZATION
  // ============================================================================

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
