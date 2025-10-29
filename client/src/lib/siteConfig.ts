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
};
