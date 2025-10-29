/**
 * ============================================================================
 * RISING PROMISE WEBSITE - CONTENT CONFIGURATION
 * ============================================================================
 * 
 * This file contains ALL editable content for the Rising Promise website.
 * Edit this file to update text, images, links, and toggle features on/off.
 * 
 * NO NEED TO TOUCH HTML OR CSS - JUST EDIT THIS FILE!
 * 
 * Instructions:
 * 1. Find the section you want to edit below
 * 2. Change the text between the quotes "like this"
 * 3. Save the file
 * 4. Refresh your browser to see changes
 * 
 * ============================================================================
 */

const siteConfig = {
  
  /**
   * FEATURE TOGGLES
   * Turn features on/off without editing HTML
   */
  features: {
    raffleActive: false,          // Set to true when raffle is ready to launch
    programsActive: false,         // Set to true when programs are ready
    cnaApplicationOpen: false,     // Set to true to allow CNA applications
    itApplicationOpen: false,      // Set to true to allow IT applications
    showRaffleInNav: false,        // Set to true to show "Raffle" in navigation menu
  },

  /**
   * ORGANIZATION INFO
   * Basic information about Rising Promise
   */
  organization: {
    name: "Rising Promise",
    tagline: "Everyone deserves a fighting chance. We're here to make sure they get it.",
    email: "info@risingpromise.org",
    phone: "(555) 123-4567",
    address: "123 Hope Street, Your City, ST 12345",
    nonprofitStatus: "501(c)(3) nonprofit (status pending)",
  },

  /**
   * SOCIAL MEDIA LINKS
   * Add your social media URLs here
   */
  social: {
    facebook: "https://facebook.com/risingpromise",
    instagram: "https://instagram.com/risingpromise",
    linkedin: "https://linkedin.com/company/risingpromise",
    twitter: "https://twitter.com/risingpromise",
  },

  /**
   * NAVIGATION MENU
   * Main menu items (raffle is controlled by showRaffleInNav above)
   */
  navigation: {
    menuItems: [
      { text: "Our Story", href: "#story" },
      { text: "Our Team", href: "#team" },
      { text: "Programs", href: "programs.html" },
      { text: "Get Involved", href: "#join-us" },
      { text: "Contact", href: "#footer" },
    ]
  },

  /**
   * HOMEPAGE SECTIONS
   */
  
  // HERO SECTION
  hero: {
    headline: "Everyone Deserves a Fighting Chance",
    subheadline: "We believe potential isn't determined by your past — it's unlocked by your future.",
    primaryButtonText: "Learn Our Story",
    primaryButtonHref: "#story",
    secondaryButtonText: "Get Updates",
    secondaryButtonHref: "#join-us",
    backgroundImage: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1920&q=80", // Hopeful, forward-looking image
  },

  // STORY SECTION
  story: {
    headline: "It Started With a Simple Question: Why Not?",
    paragraphs: [
      "Why do some people get endless chances while others get none?",
      "Why does where you're born, who raised you, or one bad break determine the rest of your life?",
      "We didn't have a good answer. So we built one.",
      "Rising Promise exists to give people access to the training, support, and community they need to build the future they deserve — no matter where they're starting from.",
    ],
    closing: "We're here to change that.",
  },

  // WHO WE SEE SECTION
  whoWeSee: {
    headline: "We See You",
    paragraphs: [
      "We see the single mom working two jobs who wants more than survival for her kids.",
      "We see the veteran who served their country and now needs their country to serve them back.",
      "We see the young person aging out of foster care, looking for a place to belong.",
      "We see the person experiencing homelessness who just needs one real shot.",
    ],
    closing: "You're not a statistic. You're not broken. You're not 'at-risk.' You're someone with a story that's still being written.",
  },

  // WHAT WE DO SECTION
  whatWeDo: {
    headline: "We Don't Just Train People. We Invest in Them.",
    features: [
      {
        icon: "fa-solid fa-graduation-cap",
        title: "Career Training",
        description: "Real skills for real jobs in healthcare, technology, and beyond",
      },
      {
        icon: "fa-solid fa-hands-holding-circle",
        title: "Wraparound Support",
        description: "Because success isn't just about what you know. It's about having someone in your corner",
      },
      {
        icon: "fa-solid fa-people-group",
        title: "A Community",
        description: "You're not doing this alone. We walk with you from day one to day one hundred",
      },
    ],
    promise: "Our Promise: If you're ready to fight for your future, we'll fight with you.",
    buttonText: "Explore Our Programs",
    buttonHref: "programs.html",
    buttonComingSoon: true, // Set to false when programs page is active
  },

  // IMPACT SECTION
  impact: {
    headline: "This Is What Change Looks Like",
    introText: "One person trained is one family lifted. One career started is one community strengthened.",
    stats: [
      { number: "125+", label: "Students Trained", sublabel: "(Year 1 Goal)" },
      { number: "85+", label: "Placed Into Jobs", sublabel: "" },
      { number: "$3.2M+", label: "In Graduate Earnings", sublabel: "" },
    ],
    closing: "We're not waiting for permission to make a difference. We're building it. Right now.",
  },

  // TEAM SECTION
  team: {
    headline: "Built by People Who've Been There",
    introText: "This isn't theory. This is personal.",
    members: [
      {
        name: "Jason Pilgrim",
        title: "Founder",
        photo: "https://i.pravatar.cc/400?img=12",
        quote: "I've spent my life building things — businesses, systems, solutions. But the most important thing I've ever built is opportunity for people who were told they didn't deserve one.",
      },
      {
        name: "Shawn J. Wright, FNP",
        title: "Program Director",
        photo: "https://i.pravatar.cc/400?img=33",
        quote: "I became a nurse because I wanted to help people heal. Now I help them build futures.",
      },
      {
        name: "Melissa Meeham, MPA",
        title: "Finance & Administration",
        photo: "https://i.pravatar.cc/400?img=47",
        quote: "Twenty years in nonprofit finance taught me one thing: sustainability isn't about money. It's about mission.",
      },
      {
        name: "Kenya Roberts, CFRE",
        title: "Development & Fundraising",
        photo: "https://i.pravatar.cc/400?img=27",
        quote: "I've raised millions for causes. But this one? This one's personal.",
      },
    ],
    closing: "We're not saviors. We're partners.",
  },

  // JOIN US SECTION
  joinUs: {
    headline: "Be Part of the Promise",
    
    // Left Column - For People Who Need Us
    needUs: {
      headline: "If You Need Us",
      text: "You're not alone anymore. We're building something for you.",
      formPlaceholderName: "Your Name",
      formPlaceholderEmail: "Your Email",
      buttonText: "Get Updates",
      note: "Be the first to know when programs launch",
    },
    
    // Right Column - For Supporters
    believeInUs: {
      headline: "If You Believe in Us",
      text: "Help us keep this promise.",
      actions: [
        {
          icon: "fa-solid fa-ticket",
          text: "Enter the Raffle",
          href: "raffle.html",
          comingSoon: true, // Controls "Coming Soon" badge
        },
        {
          icon: "fa-solid fa-heart",
          text: "Donate Now",
          href: "#donate",
          comingSoon: false,
        },
        {
          icon: "fa-solid fa-handshake",
          text: "Partner With Us",
          href: "#contact",
          comingSoon: false,
        },
        {
          icon: "fa-solid fa-share-nodes",
          text: "Share Our Story",
          href: "#share",
          comingSoon: false,
        },
      ],
      closing: "This isn't charity. It's investment in people who are ready to invest in themselves.",
    },
  },

  /**
   * RAFFLE PAGE CONTENT
   */
  raffle: {
    hero: {
      headline: "Help Us Launch — And Win a Getaway",
      subheadline: "Support our first students. Enter to win.",
      backgroundImage: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1920&q=80",
    },
    
    prizeDetails: {
      title: "Win a 3-Day, 2-Night Escape",
      destination: "Coastal Paradise Retreat", // Edit this to your actual destination
      note: "Accommodations included — airfare not included",
      drawingDate: "June 30, 2025",
      announcementDate: "July 5, 2025",
    },
    
    ticketPricing: [
      { price: "$25", entries: "1 Entry", description: "Single Entry", badge: false },
      { price: "$100", entries: "5 Entries", description: "Best Value", badge: true },
      { price: "$175", entries: "10 Entries", description: "Maximum Impact", badge: false },
    ],
    
    whereMoneyGoes: {
      headline: "Where Your Money Goes",
      items: [
        { icon: "fa-solid fa-book", text: "Training materials for first students" },
        { icon: "fa-solid fa-hands-holding-child", text: "Support services (childcare, transportation)" },
        { icon: "fa-solid fa-briefcase", text: "Job placement resources" },
        { icon: "fa-solid fa-rocket", text: "Program launch costs" },
      ],
      sponsor: "Generously sponsored by: [SPONSOR NAME]",
    },
    
    buyTickets: {
      buttonText: "Buy Tickets Now",
      alternateText: "Can't enter but want to help?",
      alternateButtonText: "Donate Instead",
      trustBadges: [
        "Secure Payment",
        "501(c)(3) Tax-Deductible",
        "All Proceeds Support Our Mission",
      ],
    },
    
    legalText: {
      rulesLink: "#",
      rulesText: "Official Raffle Rules",
      eligibility: "Must be 18+ and US resident. Void where prohibited.",
      details: "Winner will be selected via random drawing on the specified date. Winner will be notified via email and phone within 48 hours.",
    },
  },

  /**
   * PROGRAMS PAGE CONTENT
   */
  programs: {
    hero: {
      headline: "Real Training. Real Jobs. Real Change.",
      subheadline: "Government-funded career training in high-demand fields — no experience required",
      backgroundImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80",
    },
    
    overview: {
      headline: "Training That Changes Lives",
      text: "Our programs provide tuition-free career training, hands-on experience, job placement support, and wraparound services to help you succeed. If you qualify for government funding, this training costs you nothing — just your commitment to building your future.",
    },
    
    // CNA PROGRAM
    cna: {
      visible: true, // Set to false to hide this program card
      title: "Certified Nursing Assistant (CNA)",
      icon: "fa-solid fa-user-nurse",
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
      duration: "6-12 weeks",
      format: "Online classroom + hands-on clinical training",
      salary: "$32K-$38K/year starting",
      
      curriculum: [
        "Patient care fundamentals",
        "Vital signs and monitoring",
        "Medical terminology",
        "Clinical procedures",
        "State certification exam prep",
      ],
      
      requirements: [
        "High school diploma or GED",
        "Background check",
        "Health screening",
        "Willingness to learn",
      ],
      
      careerPaths: [
        "Hospitals and medical centers",
        "Nursing homes and assisted living",
        "Home healthcare services",
        "Pathway to LPN/RN programs",
      ],
    },
    
    // IT CERTIFICATION PROGRAM
    it: {
      visible: true, // Set to false to hide this program card
      title: "CompTIA IT Certification",
      icon: "fa-solid fa-laptop-code",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      duration: "4-6 months (self-paced)",
      format: "100% online with expert support",
      salary: "$45K-$55K/year starting",
      certifications: "A+, Network+, Security+",
      
      curriculum: [
        "Hardware and software troubleshooting",
        "Network infrastructure and security",
        "Operating systems (Windows, Linux, macOS)",
        "Cloud computing basics",
        "Industry certification preparation",
      ],
      
      requirements: [
        "Basic computer skills",
        "Reliable internet access",
        "Self-motivated learning style",
        "Problem-solving mindset",
      ],
      
      careerPaths: [
        "IT support specialist",
        "Help desk technician",
        "Network administrator",
        "Cybersecurity analyst (with experience)",
      ],
    },
    
    // COMING SOON PROGRAMS
    comingSoon: {
      headline: "More Programs Launching Soon",
      text: "We're developing additional career training programs in high-demand fields. Be the first to know when they launch.",
      upcomingPrograms: [
        "Phlebotomy Technician",
        "Medical Assistant",
        "Dental Assistant",
        "HVAC Technician",
      ],
    },
    
    // HOW IT WORKS
    howItWorks: {
      headline: "How It Works",
      steps: [
        {
          number: "1",
          title: "Apply",
          description: "Quick application process. We handle all funding paperwork for you.",
        },
        {
          number: "2",
          title: "Train",
          description: "Online and hands-on learning with expert instructors and real-world experience.",
        },
        {
          number: "3",
          title: "Work",
          description: "Job placement support, resume help, and career coaching to land your first role.",
        },
      ],
    },
    
    // ELIGIBILITY
    eligibility: {
      headline: "Who Qualifies?",
      items: [
        "Eligible for government workforce funding (we help you apply)",
        "Committed to completing the program",
        "Ready to work in your chosen field",
        "No prior experience required",
      ],
      note: "Support services available including childcare assistance, transportation help, and more.",
      buttonText: "Check Your Eligibility",
    },
    
    // APPLICATION
    application: {
      headline: "Ready to Start?",
      text: "Submit your information below and we'll be in touch within 24 hours to discuss your goals and get you started.",
      formFields: {
        namePlaceholder: "Full Name",
        emailPlaceholder: "Email Address",
        phonePlaceholder: "Phone Number",
        programLabel: "Program Interest",
        backgroundPlaceholder: "Tell us a bit about yourself and your goals...",
      },
      submitButtonText: "Submit Application",
      successMessage: "Thank you! We'll be in touch soon.",
    },
  },

  /**
   * FOOTER CONTENT
   */
  footer: {
    quickLinks: [
      { text: "Our Story", href: "#story" },
      { text: "The Team", href: "#team" },
      { text: "Programs", href: "programs.html" },
      { text: "Donate", href: "#donate" },
      { text: "Contact", href: "#footer" },
    ],
    copyright: "© 2025 Rising Promise. All rights reserved.",
  },

};

// Make config available globally
window.siteConfig = siteConfig;
