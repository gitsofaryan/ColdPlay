export const EXPERIENCE_LEVELS = [
  { id: 'intern', label: 'Internship', icon: 'fa-graduation-cap' },
  { id: 'full-time', label: 'Full-Time', icon: 'fa-briefcase' },
];

export const prebuiltTemplates = [
  {
    id: "simple-intern",
    experience: "intern",
    name: "Simple Intern Request",
    emoji: "👋",
    description: "Direct and simple request for an internship or referral.",
    subject: "Full-stack engineer and recent graduate interested in {{Company}}",
    body: `Hey {{Name}},

I'm Aryan, a full-stack engineer and a recent graduate. I wanted to learn and work with great engineers and the ecosystem.

Here are my links and work:
github.com/aryan-jain
linkedin.com/in/aryan-jain

Please if {{Company}} is hiring, please refer me or give me an intern.

Best,
Aryan`
  },
  {
    id: "simple-fulltime",
    experience: "full-time",
    name: "Simple Full-Time Request",
    emoji: "🚀",
    description: "Direct and simple request for a full-time role or referral.",
    subject: "Full-stack engineer interested in {{Company}}",
    body: `Hey {{Name}},

I'm Aryan, a full-stack engineer and a recent graduate. I wanted to learn and work with great engineers and the ecosystem.

Here are my links and work:
github.com/aryan-jain
linkedin.com/in/aryan-jain

Please if {{Company}} is hiring, please refer me or consider me for a role.

Best,
Aryan`
  }
];
