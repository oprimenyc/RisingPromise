import type { SiteConfig } from "@shared/schema";

/**
 * ============================================================================
 * RISING PROMISE WEBSITE - CONTENT CONFIGURATION
 * ============================================================================
 * 
 * This file contains ALL editable content for the Rising Promise website.
 * Edit this file to update text, images, links, and toggle features on/off.
 * 
 * Instructions:
 * 1. Find the section you want to edit below
 * 2. Change the text between the quotes "like this"
 * 3. Save the file
 * 4. The website will automatically reload with your changes
 * 
 * ============================================================================
 */

export const siteConfig: SiteConfig = {
  /**
   * FEATURE TOGGLES
   * Turn features on/off without editing code
   */
  features: {
    raffleActive: false,          // Set to true when raffle is ready to launch
    programsActive: true,          // Set to true when programs are ready
    cnaApplicationOpen: true,      // Set to true to allow CNA applications
    itApplicationOpen: true,       // Set to true to allow IT applications
    showRaffleInNav: true,         // Set to true to show "Raffle" in navigation menu
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
      { text: "Programs", href: "/programs" },
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
    backgroundImage: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1920&q=80",
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
        icon: "Graduation Cap",
        title: "Career Training",
        description: "Real skills for real jobs in healthcare, technology, and beyond",
      },
      {
        icon: "Users",
        title: "Wraparound Support",
        description: "Because success isn't just about what you know. It's about having someone in your corner",
      },
      {
        icon: "Heart",
        title: "A Community",
        description: "You're not doing this alone. We walk with you from day one to day one hundred",
      },
    ],
    promise: "Our Promise: If you're ready to fight for your future, we'll fight with you.",
    buttonText: "Explore Our Programs",
    buttonHref: "/programs",
    buttonComingSoon: true,
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
    
    needUs: {
      headline: "If You Need Us",
      text: "You're not alone anymore. We're building something for you.",
      formPlaceholderName: "Your Name",
      formPlaceholderEmail: "Your Email",
      buttonText: "Get Updates",
      note: "Be the first to know when programs launch",
    },
    
    believeInUs: {
      headline: "If You Believe in Us",
      text: "Help us keep this promise.",
      actions: [
        {
          icon: "Ticket",
          text: "Enter the Raffle",
          href: "/raffle",
          comingSoon: true,
        },
        {
          icon: "Heart",
          text: "Donate Now",
          href: "#donate",
          comingSoon: false,
        },
        {
          icon: "Handshake",
          text: "Partner With Us",
          href: "#contact",
          comingSoon: false,
        },
        {
          icon: "Share",
          text: "Share Our Story",
          href: "#share",
          comingSoon: false,
        },
      ],
      closing: "This isn't charity. It's investment in people who are ready to invest in themselves.",
    },
  },

  /**
   * PROGRAMS PAGE
   */
  programs: {
    cna: {
      visible: true,
      title: "Certified Nursing Assistant (CNA)",
      icon: "Heart",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      duration: "4-6 weeks",
      format: "Hybrid (online + in-person clinicals)",
      salary: "$32,000-$45,000/year",
      certifications: "State CNA Certification",
      curriculum: [
        "Patient care fundamentals",
        "Vital signs monitoring",
        "Medical terminology",
        "Infection control",
        "Communication skills",
        "Hands-on clinical training"
      ],
      requirements: [
        "High school diploma or GED",
        "Background check clearance",
        "TB test and immunizations",
        "Reliable transportation",
        "Commitment to attend all sessions"
      ],
      careerPaths: [
        "Hospital nursing assistant",
        "Long-term care facility aide",
        "Home health aide",
        "Medical clinic assistant",
        "Pathway to LPN/RN programs"
      ]
    },
    it: {
      visible: true,
      title: "IT Support Specialist",
      icon: "Laptop",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      duration: "8-12 weeks",
      format: "Fully online with live instruction",
      salary: "$40,000-$60,000/year",
      certifications: "CompTIA A+ & Network+",
      curriculum: [
        "Computer hardware and software",
        "Operating systems (Windows, Mac, Linux)",
        "Networking fundamentals",
        "Troubleshooting techniques",
        "Customer service skills",
        "Security best practices"
      ],
      requirements: [
        "High school diploma or GED",
        "Basic computer literacy",
        "Reliable internet access",
        "Computer with webcam",
        "Commitment to 15-20 hours/week"
      ],
      careerPaths: [
        "Help desk technician",
        "Desktop support specialist",
        "IT support analyst",
        "Network administrator",
        "Systems administrator"
      ]
    }
  },

  /**
   * RAFFLE PAGE
   */
  raffle: {
    headline: "Win Big, Change Lives",
    subheadline: "Every ticket you buy helps fund our workforce training programs. Everyone wins.",
    
    prizes: [
      {
        place: "1st Prize",
        value: "$10,000",
        description: "Cash Grand Prize",
        badge: true
      },
      {
        place: "2nd Prize",
        value: "$2,500",
        description: "Cash Prize",
        badge: false
      },
      {
        place: "3rd Prize",
        value: "$1,000",
        description: "Cash Prize",
        badge: false
      }
    ],

    ticketPricing: [
      {
        price: "$25",
        entries: "1 Entry",
        description: "Single ticket",
        badge: false
      },
      {
        price: "$100",
        entries: "5 Entries",
        description: "Best value - 20% bonus!",
        badge: true
      },
      {
        price: "$250",
        entries: "15 Entries",
        description: "Maximum impact - 50% bonus!",
        badge: false
      }
    ],

    details: {
      drawDate: "June 15, 2025",
      totalTickets: "5,000",
      whereMoneyGoes: "100% of proceeds fund scholarships and wraparound support for our training programs.",
      rules: [
        "Must be 18 or older to enter",
        "No purchase necessary (see official rules)",
        "Winners notified by email and phone",
        "Odds depend on total tickets sold"
      ]
    },

    faq: [
      {
        question: "How do I know this is legitimate?",
        answer: "Rising Promise is a registered 501(c)(3) nonprofit. All raffle proceeds are tracked and reported according to state gaming regulations."
      },
      {
        question: "Can I donate my winnings back?",
        answer: "Absolutely! Winners can choose to donate all or part of their prize back to Rising Promise as a tax-deductible donation."
      },
      {
        question: "What if I don't win?",
        answer: "Your money still makes a difference. Every dollar funds real training for real people building real futures."
      }
    ]
  },
};
