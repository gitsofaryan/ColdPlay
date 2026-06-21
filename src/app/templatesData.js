export const EXPERIENCE_LEVELS = [
  { id: 'intern', label: 'Internship', icon: 'fa-graduation-cap' },
  { id: 'full-time', label: 'Full-Time', icon: 'fa-briefcase' },
];

export const prebuiltTemplates = [
  {
    id: "direct-ask",
    name: "The Direct Ask",
    emoji: "👋",
    description: "Simple, humble, and direct referral request.",
    subject: "{{CandidateTitle}} interested in {{Company}}",
    body: `Hey {{Name}},

I'm {{CandidateName}}, a {{CandidateTitle}}. I've been following {{Company}} and love the work your team does. I'm looking for new opportunities and was wondering if you might be open to referring me?

My resume is attached, and you can see some of my work here:
{{ProfileLinks}}

Either way, thank you for your time.

Best,
{{CandidateName}}`
  },
  {
    id: "quick-question",
    name: "The Quick Question",
    emoji: "❓",
    description: "Ask about engineering culture to start a connection.",
    subject: "Quick question about engineering at {{Company}}",
    body: `Hey {{Name}},

I'm {{CandidateName}}, a {{CandidateTitle}} currently looking for new opportunities. I saw you work at {{Company}} and had a quick question — how does your team handle technical debt or code reviews?

I've attached my resume for context, and you can see my projects here:
{{ProfileLinks}}

Would love to chat for 5 mins if you have a moment, but no worries if you're busy.

Best,
{{CandidateName}}`
  },
  {
    id: "applied-already",
    name: "The Applied Already",
    emoji: "📋",
    description: "Low friction follow-up after applying to a role.",
    subject: "Applied to {{Company}} - quick question",
    body: `Hey {{Name}},

I'm {{CandidateName}}, a {{CandidateTitle}}. I just applied for an engineering position at {{Company}} and wanted to reach out.

Since you're on the team, I was wondering if you had any advice on standing out in the process, or if you'd be open to referring me?

I've attached my resume and you can find my work here:
{{ProfileLinks}}

Thanks for considering it.

Best,
{{CandidateName}}`
  },
  {
    id: "learner",
    name: "The Learner",
    emoji: "🌱",
    description: "Ask for advice and build a relationship first.",
    subject: "Learning from your path to {{Company}}",
    body: `Hey {{Name}},

I'm {{CandidateName}}, a {{CandidateTitle}} looking to transition into a new role. I saw your background and love the projects {{Company}} is building.

I'm keen to learn what skills or experiences you found most valuable when starting out there.

I've attached my resume for context, and my profile is here:
{{ProfileLinks}}

Would you be open to a quick 5 min chat sometime next week?

Best,
{{CandidateName}}`
  },
  {
    id: "builder",
    name: "The Builder",
    emoji: "🔧",
    description: "Lead with a specific tool or project you built.",
    subject: "Built a tool - query for {{Company}} team",
    body: `Hey {{Name}},

I'm {{CandidateName}}, a {{CandidateTitle}}. I recently built a small project to solve some developer workflow issues and wanted to share it with someone at {{Company}}.

You can see the code and my other work here:
{{ProfileLinks}}

My resume is attached as well. If you have any feedback or if your team is looking for builders, I'd love to connect.

Best,
{{CandidateName}}`
  }
];
