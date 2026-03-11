export const masterProfile = {
  name: "Sumit Joshi",
  email: "sumitjoshi2111@gmail.com",
  phone: "672-855-0150",
  location: "Surrey, BC",
  portfolio: "https://sumit-joshi.com",
  github: "https://github.com/Sumit-tech-joshi",
  linkedin: "https://www.linkedin.com/in/sumit-joshi-dev/",
  workPermit: "Open Work Permit, valid 3 years from February 2026. No sponsorship required.",

  summary: "Software Developer with 3.5 years of experience building and shipping enterprise web applications. Worked on EdCast, a global personalized learning platform, delivering integrations for Chrome, Microsoft Teams, Slack, and Facebook Workplace using React and Node.js. Experienced with MongoDB, REST APIs, Jira, and Confluence in Agile/Scrum teams.",

  skills: {
    languages: ["JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3"],
    frameworks: ["React", "Next.js", "Node.js", "Express", "Vue.js"],
    databases: ["MongoDB", "Firebase", "PostgreSQL", "SQL"],
    tools: ["Git", "Visual Studio Code", "Webpack", "Jira", "Confluence", "REST APIs", "Chrome Extension API"],
    cloud: ["Microsoft Azure (fundamentals)", "AWS S3", "AWS Lambda", "CI/CD pipelines"],
    platforms: ["MS Teams API", "Slack API", "Shopify API", "Facebook Workplace"],
    practices: ["Agile/Scrum", "Kanban", "SOLID principles", "code review", "technical debt management"]
  },

  experience: [
    {
      title: "Software Developer",
      company: "Ksolves India Limited",
      location: "India",
      startDate: "Aug 2020",
      endDate: "Jul 2023",
      type: "full-time",
      projects: [
        {
          name: "EdCast - Enterprise Learning Platform",
          bullets: [
            "Built and maintained browser and platform extensions for EdCast's learning platform, including a Chrome extension, Microsoft Teams widget, Slack integration, and Facebook Workplace widget used by enterprise clients globally.",
            "Developed the MS Teams chatbot integration, managing user session data and delivering personalized learning content inside Teams conversations using Node.js and MongoDB.",
            "Managed MongoDB pipelines for user data across multiple platforms, handling authentication, session storage, and user activity tracking at scale.",
            "Worked in a team of 10-15 developers in two-week Agile sprints using Jira and Confluence for task tracking, sprint planning, and technical documentation."
          ]
        },
        {
          name: "Magic Pixel - Tag Management System",
          bullets: [
            "Built frontend features for Magic Pixel's tag management system, tracking user behaviour across client websites and managing user data pipelines.",
            "Worked with React and JavaScript to build data collection and display components, collaborating directly with the client team."
          ]
        },
        {
          name: "Internal Frontend Project",
          bullets: [
            "Developed UI components and page layouts using React, JavaScript, HTML, and CSS for an internal client-facing web application."
          ]
        }
      ],
      general: [
        "Mentored 2 junior developers assigned by management, guiding them on React best practices, debugging techniques, and code quality standards.",
        "Conducted code reviews across projects, enforcing consistent coding standards within the team."
      ]
    },
    {
      title: "Software Developer Intern",
      company: "Ksolves India Limited",
      location: "India",
      startDate: "Jan 2020",
      endDate: "Aug 2020",
      type: "internship",
      bullets: [
        "Assisted in building React components and integrating REST APIs.",
        "Applied Agile workflow practices including daily stand-ups, sprint tasks, and version control with Git."
      ]
    },
    {
      title: "Freelance Developer",
      company: "Independent Projects",
      location: "Canada",
      startDate: "2023",
      endDate: "Present",
      type: "freelance",
      bullets: [
        "Built and deployed 6 production web applications including ShopSight (Shopify analytics dashboard with OAuth and MongoDB), an e-commerce store, a real-time crypto research tool with AI insights, and small business websites.",
        "Worked across Next.js, React, Node.js, MongoDB, Stripe, Tailwind, and Firebase.",
        "All live projects viewable at sumit-joshi.com."
      ]
    }
  ],

  education: [
    {
      degree: "PG Diploma, Web and Mobile App Development",
      institution: "North Island College, BC",
      startDate: "2023",
      endDate: "2025",
      notes: "Coursework: Agile development, cloud computing with Azure, full-stack web technologies, software architecture. Received 2 NIC Foundation awards."
    },
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "DIT University, India",
      endDate: "Completed",
      notes: "Coursework: Software engineering, data structures, databases, programming languages, computer networks."
    }
  ]
};
