import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Profile from '@/models/Profile'

// One-time seed route — populates the logged-in user's profile with
// Sumit Joshi's full professional data from the masterProfile.
// Only works if the session email matches. Safe to call multiple times (idempotent).

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.email !== 'sumitjoshi2111@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const profileData = {
      // ── Personal ─────────────────────────────────────────────────────────────
      fullName:          'Sumit Joshi',
      headline:          'Software Developer — React · Next.js · Node.js',
      email:             'sumitjoshi2111@gmail.com',
      phone:             '672-855-0150',
      location:          'Surrey, BC',
      portfolio:         'https://sumit-joshi.com',
      linkedin:          'https://www.linkedin.com/in/sumit-joshi-dev/',
      github:            'https://github.com/Sumit-tech-joshi',
      workAuthorization: 'Open Work Permit, valid 3 years from February 2026. No sponsorship required.',

      // ── Summary ───────────────────────────────────────────────────────────────
      summary: 'Software Developer with 3.5 years of experience building and shipping enterprise web applications. Worked on EdCast, a global personalized learning platform, delivering integrations for Chrome, Microsoft Teams, Slack, and Facebook Workplace using React and Node.js. Experienced with MongoDB, REST APIs, Jira, and Confluence in Agile/Scrum teams.',

      // ── Skills ────────────────────────────────────────────────────────────────
      skillCategories: [
        {
          id: 'sc-languages',
          categoryName: 'Languages',
          skills: ['JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3'],
        },
        {
          id: 'sc-frameworks',
          categoryName: 'Frameworks & Libraries',
          skills: ['React', 'Next.js', 'Node.js', 'Express', 'Vue.js'],
        },
        {
          id: 'sc-databases',
          categoryName: 'Databases',
          skills: ['MongoDB', 'Firebase', 'PostgreSQL', 'SQL'],
        },
        {
          id: 'sc-tools',
          categoryName: 'Tools & APIs',
          skills: ['Git', 'Visual Studio Code', 'Webpack', 'Jira', 'Confluence', 'REST APIs', 'Chrome Extension API'],
        },
        {
          id: 'sc-cloud',
          categoryName: 'Cloud & DevOps',
          skills: ['Microsoft Azure (fundamentals)', 'AWS S3', 'AWS Lambda', 'CI/CD pipelines'],
        },
        {
          id: 'sc-platforms',
          categoryName: 'Platform Integrations',
          skills: ['MS Teams API', 'Slack API', 'Shopify API', 'Facebook Workplace'],
        },
        {
          id: 'sc-practices',
          categoryName: 'Practices',
          skills: ['Agile/Scrum', 'Kanban', 'SOLID principles', 'Code review', 'Technical debt management'],
        },
      ],

      // ── Experience ────────────────────────────────────────────────────────────
      experience: [
        {
          id: 'exp-freelance',
          jobTitle:        'Freelance Developer',
          employer:        'Independent Projects',
          location:        'Canada',
          startDate:       '2023',
          endDate:         '',
          currentRole:     true,
          employmentType:  'Freelance',
          industry:        'Technology',
          description:     'Building and deploying production web applications for clients and personal projects.',
          achievements: [
            'Built and deployed 6 production web applications including ShopSight (Shopify analytics dashboard with OAuth and MongoDB), an e-commerce store, a real-time crypto research tool with AI insights, and small business websites.',
            'Worked across Next.js, React, Node.js, MongoDB, Stripe, Tailwind, and Firebase.',
            'All live projects viewable at sumit-joshi.com.',
          ],
        },
        {
          id: 'exp-ksolves',
          jobTitle:        'Software Developer',
          employer:        'Ksolves India Limited',
          location:        'India',
          startDate:       'Aug 2020',
          endDate:         'Jul 2023',
          currentRole:     false,
          employmentType:  'Full-time',
          industry:        'Technology',
          description:     'Worked on EdCast (global enterprise learning platform) and other client projects in a team of 10–15 developers using Agile/Scrum.',
          achievements: [
            'Built and maintained EdCast browser/platform extensions — Chrome extension, Microsoft Teams widget, Slack integration, and Facebook Workplace widget — used by enterprise clients globally.',
            'Developed the MS Teams chatbot integration, managing user session data and delivering personalized learning content inside Teams conversations using Node.js and MongoDB.',
            'Managed MongoDB pipelines for user data across multiple platforms, handling authentication, session storage, and user activity tracking at scale.',
            'Built frontend features for Magic Pixel tag management system, tracking user behaviour across client websites.',
            'Mentored 2 junior developers, guiding them on React best practices, debugging techniques, and code quality standards.',
            'Conducted code reviews across projects, enforcing consistent coding standards within the team.',
            'Worked in two-week Agile sprints using Jira and Confluence for task tracking, sprint planning, and technical documentation.',
          ],
        },
        {
          id: 'exp-intern',
          jobTitle:        'Software Developer Intern',
          employer:        'Ksolves India Limited',
          location:        'India',
          startDate:       'Jan 2020',
          endDate:         'Aug 2020',
          currentRole:     false,
          employmentType:  'Internship',
          industry:        'Technology',
          description:     'Assisted in building React components and integrating REST APIs.',
          achievements: [
            'Assisted in building React components and integrating REST APIs.',
            'Applied Agile workflow practices including daily stand-ups, sprint tasks, and version control with Git.',
          ],
        },
      ],

      // ── Education ─────────────────────────────────────────────────────────────
      education: [
        {
          id:           'edu-nic',
          credential:   'PG Diploma, Web and Mobile App Development',
          institution:  'North Island College',
          location:     'BC, Canada',
          startDate:    '2023',
          endDate:      '2025',
          current:      false,
          fieldOfStudy: 'Web and Mobile App Development',
          notes:        'Coursework: Agile development, cloud computing with Azure, full-stack web technologies, software architecture. Received 2 NIC Foundation awards.',
        },
        {
          id:           'edu-mca',
          credential:   'Master of Computer Applications (MCA)',
          institution:  'DIT University',
          location:     'India',
          startDate:    '',
          endDate:      'Completed',
          current:      false,
          fieldOfStudy: 'Computer Applications',
          notes:        'Coursework: Software engineering, data structures, databases, programming languages, computer networks.',
        },
      ],

      // ── Projects ─────────────────────────────────────────────────────────────
      projects: [
        {
          id:          'proj-shopsight',
          name:        'ShopSight',
          description: 'Shopify analytics dashboard with OAuth and MongoDB',
          role:        'Solo Developer',
          techOrTools: ['Next.js', 'React', 'MongoDB', 'Shopify API', 'OAuth'],
          url:         'https://sumit-joshi.com',
          highlights:  ['Built full OAuth flow with Shopify', 'Implemented real-time analytics dashboard', 'Deployed to production'],
        },
        {
          id:          'proj-crypto',
          name:        'Crypto Research Tool',
          description: 'Real-time crypto research tool with AI insights',
          role:        'Solo Developer',
          techOrTools: ['React', 'Node.js', 'AI/LLM APIs', 'REST APIs'],
          url:         'https://sumit-joshi.com',
          highlights:  ['Integrated AI for market analysis', 'Real-time data from crypto APIs'],
        },
        {
          id:          'proj-jobpilot',
          name:        'JobPilot',
          description: 'AI-powered universal job application assistant — generate tailored resumes and cover letters from any job description',
          role:        'Solo Developer',
          techOrTools: ['Next.js 16', 'React 19', 'TypeScript', 'MongoDB', 'Groq AI', 'Tailwind CSS', 'NextAuth.js'],
          url:         '',
          highlights:  ['Universal AI document generator', 'Live JD analyser with match scoring', 'PDF/DOCX export'],
        },
      ],

      // ── Certifications ────────────────────────────────────────────────────────
      certifications: [],

      // ── Languages ────────────────────────────────────────────────────────────
      languages: [
        { language: 'English', proficiency: 'Professional' },
        { language: 'Hindi',   proficiency: 'Native' },
      ],

      // ── AI Context ────────────────────────────────────────────────────────────
      careerObjective:  'Looking for Software Developer or Full-Stack Developer roles in Canada. Open to remote or hybrid.',
      standoutFacts:    '3.5 years enterprise experience at Ksolves on EdCast (global SaaS used by Fortune 500 companies). Has 6 live production projects. Open Work Permit — no sponsorship needed.',
      workEnvironment:  'Hybrid or remote preferred. Open to in-office in Greater Vancouver.',
      availability:     'Available immediately.',
      aiContext:        'Sumit has a strong frontend background (React, Next.js) with solid backend skills (Node.js, MongoDB). He worked on large-scale enterprise SaaS (EdCast) used globally. His freelance portfolio shows he can ship complete products independently. Emphasize the enterprise experience + independent shipping ability.',
    }

    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: profileData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json({ success: true, message: 'Profile seeded successfully.' })
  } catch (err) {
    console.error('[SEED_PROFILE]', err)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
