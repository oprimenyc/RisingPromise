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
    phone: "[PHONE — TO BE ADDED]",
    address: "Texas-Based. Serving Communities Nationwide.",
    nonprofitStatus: "501(c)(3) nonprofit | Registered in Texas | SAM.gov Registered",
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
    secondaryButtonText: "Get Involved",
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
      "Rising Promise was founded on a single belief: people don't lack potential — they lack access. Access to training that leads somewhere. Access to support when life gets hard. Access to a community that believes in second, third, and hundredth chances.",
    ],
    closing: "We're here to change that.",
  },

  // WHO WE SEE SECTION
  whoWeSee: {
    headline: "We See You",
    paragraphs: [
      "We see the single mom working two jobs who dreams of a career, not just a paycheck.",
      "We see the veteran who served this country and now needs this country to serve them back.",
      "We see the foster kid who aged out of the system but refuses to age out of hope.",
      "We see the person experiencing homelessness who just needs one real opportunity.",
    ],
    closing: "You're not a statistic. You're not broken. You're not a label. You're someone with a story that's still being written — and we're here to help you write the next chapter.",
  },

  // WHAT WE DO SECTION
  whatWeDo: {
    headline: "We Don't Just Train People. We Invest in Them.",
    introText: "Rising Promise is a government-registered, 501(c)(3) nonprofit building workforce pipelines in healthcare and technology for people who need it most. Every program we run is designed to lead directly to employment — not just a certificate.",
    features: [
      {
        icon: "Graduation Cap",
        title: "Career Certification Training",
        description: "Industry-recognized credentials in healthcare (CNA) and technology (CompTIA IT). Programs designed for people with no prior experience — built to get you hired.",
      },
      {
        icon: "Users",
        title: "Wraparound Support",
        description: "Job placement assistance, progress coaching, and connections to housing and childcare resources. We remove the barriers that get in the way of finishing what you started.",
      },
      {
        icon: "Heart",
        title: "A Community Built on Investment",
        description: "Employers partner with us because our graduates are ready. Funders invest in us because our model works. You belong here because we built this for you.",
      },
    ],
    promise: "Our Promise: If you show up ready to fight for your future, we will fight with you. Every step.",
    buttonText: "Explore Our Programs",
    buttonHref: "/programs",
    buttonComingSoon: true,
  },

  // IMPACT SECTION
  impact: {
    headline: "This Is What Change Looks Like",
    introText: "One person trained is one family lifted. One career started is one community strengthened.",
    stats: [
      { number: "125+", label: "Lives We're Built to Serve", sublabel: "Year 1 Target" },
      { number: "90%", label: "Projected Job Placement Rate", sublabel: "Based on program design & industry data" },
      { number: "$3.2M+", label: "Projected Graduate Earnings", sublabel: "Estimated Year 1 Community Impact" },
    ],
    closing: "We are transparent about where we are: these are our Year 1 targets — built on industry data, program design, and an unshakeable commitment to accountability. We're not waiting for permission to build something that works. We're building it right now.",
  },

  // TEAM SECTION
  team: {
    headline: "Built by People Who've Been There",
    introText: "This isn't theory. This is personal.",
    members: [
      {
        name: "Jason Pilgrim",
        title: "Founder & Executive Director",
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
        title: "Development & Fundraising Director",
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
      text: "You're not alone anymore. We're building something designed specifically for you — and we want you to be first to know when doors open.",
      formPlaceholderName: "Your Name",
      formPlaceholderEmail: "Your Email",
      buttonText: "Get Updates",
      note: "Be the first to know when programs launch. No spam — ever.",
    },
    
    believeInUs: {
      headline: "If You Believe in Us",
      text: "Help us keep this promise. Whether you give $25 or your company's partnership, you're directly funding someone's shot at a new life.",
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
          href: "mailto:info@risingpromise.org",
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
      description: "Healthcare is one of the fastest-growing fields in America. CNA-certified graduates are in demand nationwide — and we train you from zero experience to job-ready.",
      icon: "Heart",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
      duration: "4–6 Weeks",
      format: "Hybrid — Online coursework + In-person clinicals",
      salary: "$32,000–$45,000/year starting",
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
      description: "Tech jobs are everywhere. You don't need a degree — you need the right certification and a team behind you. We provide both.",
      icon: "Laptop",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      duration: "8–12 Weeks",
      format: "Fully Online with Live Instruction",
      salary: "$40,000–$60,000/year starting",
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
    headline: "Win Big. Change Lives.",
    subheadline: "Every ticket you buy funds workforce training for someone who needs it most. And you might just win $10,000.",
    
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
        description: "One ticket, one chance",
        badge: false
      },
      {
        price: "$100",
        entries: "5 Entries",
        description: "Best value — 20% bonus entries",
        badge: true
      },
      {
        price: "$250",
        entries: "15 Entries",
        description: "Maximum impact — 50% bonus entries",
        badge: false
      }
    ],

    details: {
      drawDate: "Date To Be Announced",
      totalTickets: "5,000",
      whereMoneyGoes: "100% of net proceeds fund scholarships, training materials, and wraparound support for Rising Promise students.",
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
        answer: "Rising Promise is a registered 501(c)(3) nonprofit operating under Texas law. All raffle proceeds are tracked, reported, and publicly accountable. We are registered with the Texas Attorney General's office."
      },
      {
        question: "Can I donate my winnings back?",
        answer: "Absolutely. Winners can choose to donate all or part of their prize back to Rising Promise as a fully tax-deductible contribution."
      },
      {
        question: "What if I don't win?",
        answer: "Your money still builds something real. Every dollar goes directly to training costs, support services, and job placement for people rebuilding their lives."
      }
    ]
  },
};
