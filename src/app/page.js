"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { prebuiltTemplates } from './templatesData';

const STEPS = [
  { id: 1, label: 'Resume', icon: 'fa-file-pdf' },
  { id: 2, label: 'Position', icon: 'fa-crosshairs' },
  { id: 3, label: 'Leads', icon: 'fa-users' },
  { id: 4, label: 'Templates', icon: 'fa-wand-magic-sparkles' },
  { id: 5, label: 'Send', icon: 'fa-paper-plane' },
];

const POSITION_TYPES = [
  { id: 'intern', label: 'Internship', icon: 'fa-graduation-cap', desc: 'Summer intern, co-op, or part-time' },
  { id: 'full-time', label: 'Full-Time', icon: 'fa-briefcase', desc: 'Full-time engineering role' },
  { id: 'contract', label: 'Contract / Freelance', icon: 'fa-handshake', desc: 'Short-term or project-based' },
];

const ROLE_TAGS = [
  'Backend Engineering', 'Frontend Engineering', 'Full-Stack', 'Systems / Infrastructure',
  'AI / ML / LLM', 'Data Engineering', 'DevOps / SRE', 'Quant / HFT',
  'Web3 / Blockchain', 'Mobile Development', 'Security', 'Product Engineering'
];

export default function Home() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Step 1: Resume
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeDragging, setResumeDragging] = useState(false);

  // Step 2: Position preferences
  const [positionType, setPositionType] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customRoleNote, setCustomRoleNote] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');

  // Step 3: Leads
  const [recipients, setRecipients] = useState([]);
  const [searchTargetCompany, setSearchTargetCompany] = useState('');
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  const [manualForm, setManualForm] = useState({ email: '', name: '', company: '', role: '', context: '' });
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [extractText, setExtractText] = useState('');
  const [csvDragging, setCsvDragging] = useState(false);

  // Step 4: AI Templates
  const [aiTemplates, setAiTemplates] = useState([]);
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [editingTemplate, setEditingTemplate] = useState(false);

  // Step 5: Campaign
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [sendDelay, setSendDelay] = useState(10);
  const [campaignProgress, setCampaignProgress] = useState({ completed: 0, total: 0 });
  const [selectedRowForPreview, setSelectedRowForPreview] = useState(null);

  // Settings
  const [smtpForm, setSmtpForm] = useState({ user: '', pass: '' });
  const [smtp, setSmtp] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [aiModel, setAiModel] = useState('gpt-4o');

  // Puter
  const [isPuterConnected, setIsPuterConnected] = useState(false);
  const [puterUser, setPuterUser] = useState(null);

  // Logs
  const [logs, setLogs] = useState([]);

  // Search/Filter for leads
  const [searchQuery, setSearchQuery] = useState('');

  const isCampaignRunningRef = useRef(false);
  const recipientsRef = useRef([]);
  const logEndRef = useRef(null);

  useEffect(() => { isCampaignRunningRef.current = isCampaignRunning; }, [isCampaignRunning]);
  useEffect(() => { recipientsRef.current = recipients; }, [recipients]);
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Init
  useEffect(() => {
    let checks = 0;
    const checkPuter = setInterval(async () => {
      checks++;
      if (typeof window !== 'undefined' && window.puter) {
        setIsPuterConnected(true);
        addLog('Puter.js SDK ready.', 'info');
        try {
          const signedIn = await window.puter.auth.isSignedIn();
          if (signedIn) {
            const user = await window.puter.auth.getUser();
            setPuterUser(user);
            addLog(`Signed in: ${user.username}`, 'success');
          }
        } catch (e) { console.warn(e); }
        clearInterval(checkPuter);
      } else if (checks > 10) {
        addLog('Puter.js offline — features limited.', 'warning');
        clearInterval(checkPuter);
      }
    }, 500);

    // Restore saved state
    const savedSmtp = localStorage.getItem('coldpilot_smtp');
    if (savedSmtp) {
      const p = JSON.parse(savedSmtp);
      setSmtp(p);
      setSmtpForm({ user: p.user || '', pass: p.pass || '' });
    }
    const savedResume = localStorage.getItem('coldpilot_resume');
    if (savedResume) {
      try {
        const parsed = JSON.parse(savedResume);
        const savedBase64 = localStorage.getItem('coldpilot_resume_base64');
        setResume({ ...parsed, base64: savedBase64 });
      } catch (e) { /* skip */ }
    }
    const savedResumeText = localStorage.getItem('coldpilot_resume_text');
    if (savedResumeText) setResumeText(savedResumeText);
    const savedRecipients = localStorage.getItem('coldpilot_recipients');
    if (savedRecipients) {
      try {
        const parsed = JSON.parse(savedRecipients);
        setRecipients(parsed.map(r => (r.status === 'generating' || r.status === 'sending') ? { ...r, status: 'pending' } : r));
      } catch (e) { /* skip */ }
    }
    const savedTemplates = localStorage.getItem('coldpilot_ai_templates');
    if (savedTemplates) {
      try { setAiTemplates(JSON.parse(savedTemplates)); } catch (e) { /* skip */ }
    }
    const savedPrefs = localStorage.getItem('coldpilot_prefs');
    if (savedPrefs) {
      try {
        const p = JSON.parse(savedPrefs);
        if (p.positionType) setPositionType(p.positionType);
        if (p.selectedRoles) setSelectedRoles(p.selectedRoles);
        if (p.customRoleNote) setCustomRoleNote(p.customRoleNote);
        if (p.targetCompanies) setTargetCompanies(p.targetCompanies);
      } catch (e) { /* skip */ }
    }

    addLog('Coldplay ready.', 'system');
    return () => clearInterval(checkPuter);
  }, []);

  const addLog = useCallback((text, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev.slice(-60), { time, text, type }]);
  }, []);

  const saveRecipients = useCallback((list) => {
    setRecipients(list);
    localStorage.setItem('coldpilot_recipients', JSON.stringify(list));
  }, []);

  const savePrefs = useCallback(() => {
    localStorage.setItem('coldpilot_prefs', JSON.stringify({ positionType, selectedRoles, customRoleNote, targetCompanies }));
  }, [positionType, selectedRoles, customRoleNote, targetCompanies]);

  useEffect(() => { savePrefs(); }, [savePrefs]);

  // ── Step 1: Resume Upload & Parse ──
  const uploadResumeFile = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const meta = { originalName: file.name, size: file.size, base64: base64 };
        setResume(meta);
        localStorage.setItem('coldpilot_resume', JSON.stringify({ originalName: file.name, size: file.size }));
        localStorage.setItem('coldpilot_resume_base64', base64);
        addLog(`Resume processed client-side: ${file.name}`, 'success');

        // Parse PDF text by sending file directly to parse-resume API
        setIsParsingResume(true);
        const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: formData });
        const parseData = await parseRes.json();
        if (parseData.success && parseData.text) {
          setResumeText(parseData.text);
          localStorage.setItem('coldpilot_resume_text', parseData.text);
          addLog(`Resume parsed — ${parseData.pages} page(s).`, 'success');
        } else {
          throw new Error(parseData.error || 'Failed to parse resume');
        }
      } catch (err) {
        addLog(`Resume processing failed: ${err.message}`, 'error');
      } finally {
        setIsParsingResume(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteResume = () => {
    setResume(null);
    setResumeText('');
    localStorage.removeItem('coldpilot_resume');
    localStorage.removeItem('coldpilot_resume_text');
    localStorage.removeItem('coldpilot_resume_base64');
    addLog('Resume removed.', 'info');
  };

  // ── Step 2 helpers ──
  const toggleRole = (role) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  // ── Step 3: Find Leads ──
  const handlePuterSignIn = async () => {
    if (!window.puter) return;
    try {
      const user = await window.puter.auth.signIn();
      setPuterUser(user);
      addLog(`Connected: ${user.username}`, 'success');
    } catch (err) { addLog(`Auth failed: ${err.message}`, 'error'); }
  };

  const handleFindLeads = async (e) => {
    e.preventDefault();
    if (!window.puter) { alert('Connect Puter AI first.'); return; }
    if (!searchTargetCompany.trim()) return;
    setIsSearchingLeads(true);
    addLog(`Searching for ${searchTargetCompany}...`, 'info');

    const prompt = `Perform a web search to find email addresses and public contacts (CEO, CTO, Engineering Managers, Recruiters, Founders) at "${searchTargetCompany}".
Return ONLY a clean JSON array. No markdown, no explanation. Each object:
[{"email":"name@co.com","name":"Full Name","company":"${searchTargetCompany}","role":"Title","context":"Brief note"}]
Find as many real contacts as possible. If emails aren't public, construct likely patterns (first.last@domain.com). Output only JSON:`;

    try {
      const response = await window.puter.ai.chat(prompt, { model: aiModel, tools: [{ type: "web_search" }] });
      const responseText = typeof response === 'string' ? response : (response?.message?.content || '');
      let clean = responseText.trim();
      if (clean.startsWith("```json")) clean = clean.substring(7);
      if (clean.startsWith("```")) clean = clean.substring(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();

      const leads = JSON.parse(clean);
      if (Array.isArray(leads) && leads.length > 0) {
        let count = 0;
        const newList = [...recipients];
        leads.forEach(lead => {
          if (lead.email && lead.email.includes('@') && !newList.some(r => r.email === lead.email)) {
            newList.push({
              id: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
              email: lead.email.trim(), name: lead.name || '', company: lead.company || searchTargetCompany,
              role: lead.role || '', context: lead.context || '', aiText: '', status: 'pending', selected: true
            });
            count++;
          }
        });
        saveRecipients(newList);
        addLog(`Found ${count} leads for ${searchTargetCompany}`, 'success');
        setSearchTargetCompany('');
      } else {
        addLog('No contacts found. Try a different query.', 'warning');
      }
    } catch (err) {
      addLog(`Search failed: ${err.message}`, 'error');
    } finally {
      setIsSearchingLeads(false);
    }
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (recipients.some(r => r.email === manualForm.email)) return;
    saveRecipients([...recipients, {
      id: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
      ...manualForm, aiText: '', status: 'pending', selected: true
    }]);
    setManualForm({ email: '', name: '', company: '', role: '', context: '' });
    addLog(`Added: ${manualForm.email}`, 'success');
    setShowManualAdd(false);
  };

  const handleExtractEmails = () => {
    const matches = extractText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (!matches) { alert("No emails found."); return; }
    const unique = [...new Set(matches)];
    const newList = [...recipients];
    let count = 0;
    unique.forEach(email => {
      if (!newList.some(r => r.email === email)) {
        newList.push({ id: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7), email, name: '', company: '', role: '', context: '', aiText: '', status: 'pending', selected: true });
        count++;
      }
    });
    saveRecipients(newList);
    addLog(`Extracted ${count} emails.`, 'success');
    setExtractText('');
  };

  const parseCSVFile = (file) => {
    addLog(`Parsing CSV: ${file.name}...`, 'info');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const companyIdx = headers.findIndex(h => h.includes('company'));
      const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('position'));
      if (emailIdx === -1) { addLog('No email column found in CSV.', 'error'); return; }
      const newList = [...recipients];
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        const email = cols[emailIdx];
        if (email && email.includes('@') && !newList.some(r => r.email === email)) {
          newList.push({
            id: 'r_' + Date.now() + '_' + Math.random().toString(36).substr(2, 7),
            email, name: cols[nameIdx] || '', company: cols[companyIdx] || '', role: cols[roleIdx] || '',
            context: '', aiText: '', status: 'pending', selected: true
          });
          count++;
        }
      }
      saveRecipients(newList);
      addLog(`Imported ${count} leads from CSV.`, 'success');
    };
    reader.readAsText(file);
  };

  const deleteRecipient = (id) => saveRecipients(recipients.filter(r => r.id !== id));
  const toggleSelect = (id) => saveRecipients(recipients.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  const toggleSelectAll = () => {
    const all = recipients.every(r => r.selected);
    saveRecipients(recipients.map(r => ({ ...r, selected: !all })));
  };

  // ── Step 4: AI Template Generation ──
  // Helper functions for candidate info extraction from resume & preferences
  const guessCandidateName = () => {
    if (resume && resume.originalName) {
      const cleanName = resume.originalName.replace(/[-_]cv|[-_]resume/gi, '').split(/[-_\s.]+/)[0];
      if (cleanName && isNaN(cleanName)) {
        return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }
    }
    if (resumeText) {
      const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length > 0) {
        const firstLine = lines[0].split(/\s+/)[0];
        if (firstLine && firstLine.length > 2 && /^[A-Za-z]+$/.test(firstLine)) {
          return firstLine.charAt(0).toUpperCase() + firstLine.slice(1);
        }
      }
    }
    return 'Aryan'; // default fallback
  };

  const guessCandidateTitle = () => {
    if (selectedRoles && selectedRoles.length > 0) {
      const role = selectedRoles[0].toLowerCase();
      if (role.includes('full-stack')) return 'full-stack engineer';
      if (role.includes('backend')) return 'backend engineer';
      if (role.includes('frontend')) return 'frontend engineer';
      return `${role.replace(' engineering', '').replace(' development', '')} engineer`;
    }
    return 'software engineer';
  };

  const guessProfileLinks = () => {
    const urls = [];
    if (resumeText) {
      const githubMatch = resumeText.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
      const linkedinMatch = resumeText.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
      if (githubMatch) urls.push(githubMatch[1].toLowerCase());
      if (linkedinMatch) urls.push(linkedinMatch[1].toLowerCase());
    }
    if (urls.length === 0) {
      urls.push('github.com/aryan-jain');
      urls.push('linkedin.com/in/aryan-jain');
    }
    return urls.join('\n');
  };

  // ── Step 4: AI Template Generation & Prebuilt Templates ──
  const handleLoadPrebuiltTemplates = () => {
    setAiTemplates(prebuiltTemplates);
    setSelectedTemplateIdx(0);
    localStorage.setItem('coldpilot_ai_templates', JSON.stringify(prebuiltTemplates));
    addLog('Loaded 5 pre-built templates.', 'success');
  };

  const handleGenerateTemplates = async () => {
    if (!resumeText) { alert('Upload your resume in Step 1 first.'); return; }

    setIsGeneratingTemplates(true);
    const posLabel = POSITION_TYPES.find(p => p.id === positionType)?.label || positionType || 'Internship';
    const rolesStr = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'Software Engineering';
    const companiesStr = targetCompanies.trim() || 'various technology companies';

    const prompt = `You are a cold email writing expert. You've read this candidate's resume:

--- RESUME ---
${resumeText.substring(0, 3000)}
--- END RESUME ---

The candidate wants a ${posLabel} position in: ${rolesStr}.
They're targeting companies like: ${companiesStr}.
${customRoleNote ? `Additional notes: ${customRoleNote}` : ''}

Generate exactly 5 simple, highly personalized cold outreach email templates for this candidate based on the resume, following 5 distinct angles:
1. "The Direct Ask" (emoji: 👋): Direct, humble referral request for a role.
2. "The Quick Question" (emoji: ❓): Ask about engineering culture or a technical design question to start a connection.
3. "The Applied Already" (emoji: 📋): Low friction follow-up after applying to a role.
4. "The Learner" (emoji: 🌱): Ask for advice and build a relationship first.
5. "The Builder" (emoji: 🔧): Lead with a specific tool or project they built, keeping it brief and linking to proof of competence.

IMPORTANT RULES:
- The emails must be extremely short (4-6 sentences max) and read naturally/humbly (like a developer writing to a peer, not a salesperson).
- DO NOT use formal corporate jargon or "sales" language.
- Use placeholders:
  - {{Name}} for recipient name.
  - {{Company}} for recipient company.
  - {{CandidateName}} for candidate's name.
  - {{CandidateTitle}} for candidate's title (e.g. software engineer).
  - {{ProfileLinks}} for candidate's GitHub/LinkedIn links.
- DO NOT hardcode candidate name, links, or title. Use the exact placeholders {{CandidateName}}, {{CandidateTitle}}, and {{ProfileLinks}} so they can be replaced dynamically.
- CRITICAL: DO NOT use any hyphens (-) in the email body or subject line. This is a strict constraint.
- Explicitly mention in each email that the resume is attached.
- Make the subject lines specific and intriguing (e.g. "systems engineer interested in {{Company}}" or "quick question about engineering at {{Company}}"). Do NOT use hyphens in subjects.

Return ONLY a JSON array. No markdown, no explanation. Each object:
[
  {
    "name": "Template Angle Name",
    "emoji": "emoji here",
    "subject": "subject line here",
    "body": "email body here"
  }
]

Output only the JSON array:`;

    try {
      const response = await window.puter.ai.chat(prompt, { model: aiModel });
      const responseText = typeof response === 'string' ? response : (response?.message?.content || '');
      let clean = responseText.trim();
      if (clean.startsWith("```json")) clean = clean.substring(7);
      if (clean.startsWith("```")) clean = clean.substring(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();

      const templates = JSON.parse(clean);
      if (Array.isArray(templates) && templates.length > 0) {
        setAiTemplates(templates);
        setSelectedTemplateIdx(0);
        localStorage.setItem('coldpilot_ai_templates', JSON.stringify(templates));
        addLog(`Generated ${templates.length} personalized templates.`, 'success');
      } else {
        addLog('AI returned unexpected format. Try again.', 'error');
      }
    } catch (err) {
      addLog(`Template generation failed: ${err.message}`, 'error');
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  // ── Step 5: Campaign ──
  const activeTemplate = aiTemplates[selectedTemplateIdx] || null;

  const renderTemplate = (text, r) => {
    if (!text) return '';
    const candName = guessCandidateName();
    const candTitle = guessCandidateTitle();
    const candLinks = guessProfileLinks();
    const recName = r?.name || 'Hiring Manager';
    const recCompany = r?.company || 'your company';
    const recRole = r?.role || 'Software Engineer';
    const recContext = r?.context || '';
    const aiText = r?.aiText || '';

    return text
      .replace(/{{Name}}/g, recName)
      .replace(/{{Company}}/g, recCompany)
      .replace(/{{Role}}/g, recRole)
      .replace(/{{Context}}/g, recContext)
      .replace(/{{AI_Personalization}}/g, aiText)
      .replace(/{{CandidateName}}/g, candName)
      .replace(/{{CandidateTitle}}/g, candTitle)
      .replace(/{{ProfileLinks}}/g, candLinks);
  };

  const handleRunAiPersonalization = async () => {
    if (!window.puter || !activeTemplate) return;
    const selected = recipients.filter(r => r.selected && !r.aiText);
    if (selected.length === 0) { addLog('All leads already personalized.', 'info'); return; }
    addLog(`Personalizing ${selected.length} leads...`, 'info');

    for (const r of selected) {
      setRecipients(prev => prev.map(i => i.id === r.id ? { ...i, status: 'generating' } : i));
      const prompt = (activeTemplate.aiPrompt || 'Write one casual sentence about their company.')
        .replace(/{{Name}}/g, r.name || 'Hiring Manager')
        .replace(/{{Company}}/g, r.company || 'your company')
        .replace(/{{Role}}/g, r.role || 'Engineer')
        .replace(/{{Context}}/g, r.context || 'no details');

      try {
        const resp = await window.puter.ai.chat(prompt, { model: aiModel });
        const text = (typeof resp === 'string' ? resp : (resp?.message?.content || '')).trim().replace(/^["']|["']$/g, '');
        setRecipients(prev => {
          const updated = prev.map(i => i.id === r.id ? { ...i, status: 'pending', aiText: text } : i);
          localStorage.setItem('coldpilot_recipients', JSON.stringify(updated));
          return updated;
        });
        addLog(`Personalized: ${r.name || r.email}`, 'success');
      } catch (err) {
        setRecipients(prev => {
          const updated = prev.map(i => i.id === r.id ? { ...i, status: 'failed' } : i);
          localStorage.setItem('coldpilot_recipients', JSON.stringify(updated));
          return updated;
        });
        addLog(`Failed: ${err.message}`, 'error');
      }
      await new Promise(res => setTimeout(res, 700));
    }
  };

  const startCampaign = async () => {
    if (!smtp) { alert('Set up SMTP in Settings first.'); return; }
    if (!activeTemplate) { alert('Generate templates in Step 4 first.'); return; }
    const targets = recipientsRef.current.filter(r => r.selected && r.status !== 'sent');
    if (targets.length === 0) return;

    setIsCampaignRunning(true);
    setCampaignProgress({ completed: 0, total: targets.length });
    addLog(`Launching campaign: ${targets.length} emails`, 'info');

    let count = 0;
    for (const r of recipientsRef.current) {
      if (!isCampaignRunningRef.current) break;
      if (!r.selected || r.status === 'sent') continue;

      setRecipients(prev => prev.map(i => i.id === r.id ? { ...i, status: 'sending' } : i));
      try {
        const payload = {
          smtpUser: smtp.user, smtpPass: smtp.pass,
          to: r.email,
          subject: renderTemplate(activeTemplate.subject, r),
          body: renderTemplate(activeTemplate.body, r)
        };
        if (resume && resume.base64) {
          payload.attachmentBase64 = resume.base64;
          payload.attachmentOriginalName = resume.originalName;
        }

        const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) {
          setRecipients(prev => {
            const updated = prev.map(i => i.id === r.id ? { ...i, status: 'sent' } : i);
            localStorage.setItem('coldpilot_recipients', JSON.stringify(updated));
            return updated;
          });
          addLog(`Sent → ${r.email}`, 'success');
        } else throw new Error(data.error);
      } catch (err) {
        setRecipients(prev => {
          const updated = prev.map(i => i.id === r.id ? { ...i, status: 'failed' } : i);
          localStorage.setItem('coldpilot_recipients', JSON.stringify(updated));
          return updated;
        });
        addLog(`Failed → ${r.email}: ${err.message}`, 'error');
      }
      count++;
      setCampaignProgress(p => ({ ...p, completed: count }));
      const next = recipientsRef.current.slice(recipientsRef.current.indexOf(r) + 1).find(n => n.selected && n.status !== 'sent');
      if (next && isCampaignRunningRef.current) await new Promise(res => setTimeout(res, sendDelay * 1000));
    }
    setIsCampaignRunning(false);
    addLog('Campaign complete.', 'success');
  };

  const pauseCampaign = () => { setIsCampaignRunning(false); addLog('Paused.', 'warning'); };

  // Settings
  const handleSmtpSubmit = (e) => {
    e.preventDefault();
    const creds = { user: smtpForm.user.trim(), pass: smtpForm.pass.trim() };
    setSmtp(creds);
    localStorage.setItem('coldpilot_smtp', JSON.stringify(creds));
    addLog('SMTP saved.', 'success');
  };

  const handleTestSmtp = async () => {
    if (!smtpForm.user || !smtpForm.pass) return;
    addLog('Testing SMTP...', 'info');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpUser: smtpForm.user.trim(), smtpPass: smtpForm.pass.trim(), to: smtpForm.user.trim(), subject: 'Coldplay SMTP Test', body: 'SMTP verified.' })
      });
      const data = await res.json();
      if (data.success) addLog('SMTP verified!', 'success');
      else throw new Error(data.error);
    } catch (e) { addLog(`SMTP failed: ${e.message}`, 'error'); }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Email,Name,Company,Role,Status\r\n";
    recipients.forEach(r => { csv += `"${r.email}","${r.name}","${r.company}","${r.role}","${r.status}"\r\n`; });
    const a = document.createElement("a"); a.href = encodeURI(csv); a.download = "leads.csv"; a.click();
  };

  // Computed
  const filteredRecipients = recipients.filter(r =>
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: recipients.length,
    selected: recipients.filter(r => r.selected).length,
    personalized: recipients.filter(r => r.selected && r.aiText).length,
    sent: recipients.filter(r => r.status === 'sent').length
  };

  const previewRecipient = selectedRowForPreview ? recipients.find(r => r.id === selectedRowForPreview) : (recipients.find(r => r.selected) || recipients[0]);
  const progressPercent = campaignProgress.total > 0 ? Math.round((campaignProgress.completed / campaignProgress.total) * 100) : 0;

  const canProceed = {
    1: !!resume && !!resumeText,
    2: !!positionType && selectedRoles.length > 0,
    3: recipients.length > 0,
    4: aiTemplates.length > 0,
  };

  const goNext = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); };
  const goBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  return (
    <div className="app-container">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="brand">
          <div className="logo-icon"><i className="fa-solid fa-paper-plane"></i></div>
          <div className="brand-text">
            <h1>Cold<span>play</span></h1>
            <p>AI-Powered Cold Outreach</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="step-progress">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="step-progress-item">
              <button
                className={`step-dot ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'done' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                {currentStep > step.id ? <i className="fa-solid fa-check"></i> : step.id}
              </button>
              <span className={`step-label ${currentStep === step.id ? 'active' : ''}`}>{step.label}</span>
              {idx < STEPS.length - 1 ? <div className={`step-line ${currentStep > step.id ? 'done' : ''}`}></div> : null}
            </div>
          ))}
        </div>

        <div className="header-actions">
          <div className="status-item clickable" onClick={puterUser ? () => { window.puter.auth.signOut(); setPuterUser(null); } : handlePuterSignIn}>
            <span className={`status-dot ${isPuterConnected && puterUser ? 'green' : 'red'}`}></span>
            <span>{puterUser ? puterUser.username : 'Puter AI'}</span>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      </header>

      {/* ── Settings Modal ── */}
      {showSettings ? (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fa-solid fa-gear"></i> Settings</h3>
              <button className="modal-close" onClick={() => setShowSettings(false)} aria-label="Close Settings"><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="modal-body">
              <div className="settings-section">
                <h4><i className="fa-solid fa-envelope"></i> Gmail SMTP</h4>
                <form onSubmit={handleSmtpSubmit} className="settings-form">
                  <div className="form-group">
                    <label>Gmail Address</label>
                    <input type="email" placeholder="you@gmail.com" required value={smtpForm.user} onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>App Password</label>
                    <div className="password-input-wrapper">
                      <input type={showPassword ? 'text' : 'password'} placeholder="16-char app password" required value={smtpForm.pass} onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })} />
                      <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-outline btn-sm" onClick={handleTestSmtp}><i className="fa-solid fa-circle-check"></i> Test</button>
                    <button type="submit" className="btn btn-primary btn-sm"><i className="fa-solid fa-floppy-disk"></i> Save</button>
                  </div>
                </form>
                <div className="smtp-status">
                  <span className={`status-dot ${smtp ? 'green' : 'red'}`}></span>
                  {smtp ? `Connected: ${smtp.user}` : 'Not configured'}
                </div>
              </div>

              <div className="settings-section">
                <h4><i className="fa-solid fa-brain"></i> AI Model</h4>
                <select value={aiModel} onChange={e => setAiModel(e.target.value)}>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (faster)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>

              <div className="settings-section">
                <h4><i className="fa-solid fa-link"></i> Puter Connection</h4>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`status-dot ${puterUser ? 'green' : 'red'}`}></span>
                  <span style={{ fontSize: '0.85rem', flex: 1 }}>{puterUser ? `Signed in: ${puterUser.username}` : 'Not connected'}</span>
                  <button className={`btn btn-sm ${puterUser ? 'btn-outline' : 'btn-primary'}`} onClick={puterUser ? () => { window.puter.auth.signOut(); setPuterUser(null); } : handlePuterSignIn}>
                    {puterUser ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Main Content ── */}
      <main className="wizard-content">

        {/* ═══ STEP 1: RESUME ═══ */}
        {currentStep === 1 ? (
          <div className="wizard-step" key="step1">
            <div className="step-hero">
              <div className="step-hero-icon"><i className="fa-solid fa-file-pdf"></i></div>
              <h2>Upload Your Resume</h2>
              <p>ColdPilot will read your resume and craft personalized cold emails that sound like <em>you</em> wrote them.</p>
            </div>

            <div className="step-body">
              {!resume ? (
                <div className={`upload-zone ${resumeDragging ? 'dragging' : ''}`}
                  onDragOver={e => { e.preventDefault(); setResumeDragging(true); }}
                  onDragLeave={() => setResumeDragging(false)}
                  onDrop={e => { e.preventDefault(); setResumeDragging(false); if (e.dataTransfer.files.length > 0) uploadResumeFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('resume-input').click()}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <h3>Upload Resume</h3>
                  <p>Drag & drop or <span>browse</span></p>
                  <small>PDF only, up to 5MB</small>
                  <input type="file" id="resume-input" accept=".pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files.length > 0) uploadResumeFile(e.target.files[0]); }} />
                </div>
              ) : (
                <div className="resume-loaded">
                  <div className="resume-file-badge">
                    <i className="fa-solid fa-file-pdf"></i>
                    <div>
                      <strong>{resume.originalName}</strong>
                      <span>{Math.round(resume.size / 1024)} KB</span>
                    </div>
                    <button className="btn-delete-file" onClick={() => { setResume(null); setResumeText(''); }}><i className="fa-solid fa-trash"></i></button>
                  </div>
                  {isParsingResume ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted-fg)' }}>
                      <i className="fa-solid fa-spinner fa-spin"></i> Extracting text...
                    </div>
                  ) : (
                    <div className="resume-preview-box">
                      <h4><i className="fa-solid fa-check-double"></i> Text Extracted</h4>
                      <div className="resume-text-preview">{resumeText}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="wizard-nav" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={goNext} disabled={!canProceed[1]}>
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ═══ STEP 2: POSITION ═══ */}
        {currentStep === 2 ? (
          <div className="wizard-step" key="step2">
            <div className="step-hero">
              <div className="step-hero-icon"><i className="fa-solid fa-crosshairs"></i></div>
              <h2>What are you looking for?</h2>
              <p>Tell us about the position you want. The AI will tailor every template to match.</p>
            </div>

            <div className="step-body">
              <div className="step-content-wide">
                {/* Position type */}
                <div className="section-block">
                  <label className="section-label">Position Type</label>
                  <div className="position-grid">
                    {POSITION_TYPES.map(pt => (
                      <button key={pt.id} className={`position-card ${positionType === pt.id ? 'selected' : ''}`} onClick={() => setPositionType(pt.id)}>
                        <i className={`fa-solid ${pt.icon}`}></i>
                        <strong>{pt.label}</strong>
                        <span>{pt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role tags */}
                <div className="section-block">
                  <label className="section-label">What roles interest you? <span>(pick multiple)</span></label>
                  <div className="role-tags">
                    {ROLE_TAGS.map(role => (
                      <button key={role} className={`role-tag ${selectedRoles.includes(role) ? 'selected' : ''}`} onClick={() => toggleRole(role)}>{role}</button>
                    ))}
                  </div>
                </div>

                {/* Extra context */}
                <div className="section-block" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Target Companies <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                    <input type="text" placeholder="e.g. Stripe, Vercel, OpenAI, Jane Street..." value={targetCompanies} onChange={e => setTargetCompanies(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Anything else the AI should know?</label>
                    <input type="text" placeholder="e.g. I want remote roles, I'm available from July..." value={customRoleNote} onChange={e => setCustomRoleNote(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="wizard-nav">
                <button className="btn btn-outline" onClick={goBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                <button className="btn btn-primary" onClick={goNext} disabled={!canProceed[2]}>
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ═══ STEP 3: LEADS ═══ */}
        {currentStep === 3 ? (
          <div className="wizard-step" key="step3">
            <div className="step-hero compact">
              <div className="step-hero-icon small"><i className="fa-solid fa-users"></i></div>
              <div>
                <h2>Find Your Targets</h2>
                <p>Search the web, import a CSV, or add leads manually.</p>
              </div>
            </div>

            <div className="step-body">
              {/* Search bar */}
              <div className="lead-search-bar">
                <form onSubmit={handleFindLeads} className="lead-search-form">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input type="text" placeholder="Search company — e.g. &quot;Stripe engineering leads&quot;, &quot;OpenAI CTO&quot;..." value={searchTargetCompany} onChange={e => setSearchTargetCompany(e.target.value)} />
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={isSearchingLeads}>
                    {isSearchingLeads ? <><i className="fa-solid fa-spinner fa-spin"></i> Searching...</> : <><i className="fa-solid fa-bolt"></i> AI Search</>}
                  </button>
                </form>
                <div className="lead-quick-actions">
                  <div className={`quick-action ${csvDragging ? 'dragging' : ''}`}
                    onDragOver={e => { e.preventDefault(); setCsvDragging(true); }}
                    onDragLeave={() => setCsvDragging(false)}
                    onDrop={e => { e.preventDefault(); setCsvDragging(false); if (e.dataTransfer.files.length > 0) parseCSVFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById('csv-input').click()}
                  >
                    <i className="fa-solid fa-file-csv"></i> Import CSV
                    <input type="file" id="csv-input" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files.length > 0) parseCSVFile(e.target.files[0]); }} />
                  </div>
                  <button className="quick-action" onClick={() => setShowManualAdd(!showManualAdd)}>
                    <i className="fa-solid fa-user-plus"></i> Add Manually
                  </button>
                </div>
              </div>

              {/* Manual add */}
              {showManualAdd ? (
                <form onSubmit={handleManualAdd} className="manual-add-strip">
                  <input type="email" placeholder="Email *" required value={manualForm.email} onChange={e => setManualForm({ ...manualForm, email: e.target.value })} />
                  <input type="text" placeholder="Name" value={manualForm.name} onChange={e => setManualForm({ ...manualForm, name: e.target.value })} />
                  <input type="text" placeholder="Company" value={manualForm.company} onChange={e => setManualForm({ ...manualForm, company: e.target.value })} />
                  <input type="text" placeholder="Role" value={manualForm.role} onChange={e => setManualForm({ ...manualForm, role: e.target.value })} />
                  <button type="submit" className="btn btn-primary btn-sm" aria-label="Add Lead"><i className="fa-solid fa-plus"></i></button>
                </form>
              ) : null}

              {/* Text extractor */}
              <details className="extractor-details">
                <summary><i className="fa-solid fa-filter"></i> Extract emails from pasted text</summary>
                <div className="extractor-body">
                  <textarea placeholder="Paste text containing emails..." value={extractText} onChange={e => setExtractText(e.target.value)}></textarea>
                  <button className="btn btn-outline btn-sm" onClick={handleExtractEmails}>Extract</button>
                </div>
              </details>

              {/* Leads Table */}
              <div className="leads-table-wrapper">
                <div className="leads-table-header">
                  <span className="leads-count">{recipients.length} lead{recipients.length !== 1 ? 's' : ''}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="Filter..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="filter-mini" />
                    <button className="btn btn-outline btn-sm" onClick={handleExportCSV} title="Export"><i className="fa-solid fa-download"></i></button>
                    <button className="btn btn-outline btn-sm" onClick={() => { if (confirm('Clear all?')) saveRecipients([]); }} style={{ color: 'var(--danger)' }} title="Clear"><i className="fa-solid fa-trash"></i></button>
                  </div>
                </div>
                <div className="leads-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '28px' }}><input type="checkbox" checked={recipients.length > 0 && recipients.every(r => r.selected)} onChange={toggleSelectAll} /></th>
                        <th>Contact</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th style={{ width: '60px' }}>Status</th>
                        <th style={{ width: '32px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecipients.length === 0 ? (
                        <tr><td colSpan="6" className="empty-table">
                          <i className="fa-solid fa-inbox"></i><br />No leads yet. Search, import, or add above.
                        </td></tr>
                      ) : filteredRecipients.map(r => (
                        <tr key={r.id} className={r.selected ? 'selected-row' : ''}>
                          <td onClick={e => e.stopPropagation()}><input type="checkbox" checked={r.selected} onChange={() => toggleSelect(r.id)} /></td>
                          <td><strong>{r.name || 'Unknown'}</strong><br /><span className="text-muted text-xs">{r.email}</span></td>
                          <td>{r.company}</td>
                          <td className="text-muted">{r.role}</td>
                          <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                          <td><button className="btn-action delete" onClick={() => deleteRecipient(r.id)}><i className="fa-solid fa-xmark"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="wizard-nav">
                <button className="btn btn-outline" onClick={goBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                <button className="btn btn-primary" onClick={goNext} disabled={!canProceed[3]}>
                  Continue <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ═══ STEP 4: AI TEMPLATES ═══ */}
        {currentStep === 4 ? (
          <div className="wizard-step" key="step4">
            <div className="step-hero compact">
              <div className="step-hero-icon small"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
              <div>
                <h2>Your AI Templates</h2>
                <p>Generated from your resume + preferences. Pick one and customize if needed.</p>
              </div>
            </div>

            <div className={`step-body ${aiTemplates.length === 0 ? 'centered' : ''}`} style={aiTemplates.length > 0 ? { flexDirection: 'row' } : undefined}>
              {aiTemplates.length === 0 ? (
                <div className="generate-cta">
                  <div className="generate-cta-info">
                    <h3>Ready to generate?</h3>
                    <p>Using your resume and preferences, AI will create <strong>5 unique cold email angles</strong> — each with a different approach to grab attention.</p>
                    <div className="generate-context-pills">
                      {resume ? <span className="context-pill"><i className="fa-solid fa-file-pdf"></i> {resume.originalName}</span> : null}
                      {positionType ? <span className="context-pill"><i className="fa-solid fa-crosshairs"></i> {POSITION_TYPES.find(p => p.id === positionType)?.label}</span> : null}
                      {selectedRoles.map(r => <span key={r} className="context-pill">{r}</span>)}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={handleGenerateTemplates} disabled={isGeneratingTemplates}>
                    {isGeneratingTemplates ? <><i className="fa-solid fa-spinner fa-spin"></i> Generating...</> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate 5 Templates</>}
                  </button>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '10px' }} onClick={handleLoadPrebuiltTemplates}>
                    <i className="fa-solid fa-bolt"></i> Load Pre-built Templates
                  </button>
                </div>
              ) : (
                <>
                  {/* Template selector cards */}
                  <div className="template-selector">
                    {aiTemplates.map((t, idx) => (
                      <button key={idx} className={`template-pick ${selectedTemplateIdx === idx ? 'active' : ''}`} onClick={() => { setSelectedTemplateIdx(idx); setEditingTemplate(false); }}>
                        <span className="template-pick-emoji">{t.emoji || '📧'}</span>
                        <span className="template-pick-name">{t.name}</span>
                      </button>
                    ))}
                    <button className="template-pick regen" onClick={handleGenerateTemplates} disabled={isGeneratingTemplates} title="Regenerate all">
                      <i className={`fa-solid fa-arrows-rotate ${isGeneratingTemplates ? 'fa-spin' : ''}`}></i>
                    </button>
                  </div>

                  {/* Active template preview */}
                  {activeTemplate ? (
                    <div className="template-preview-area">
                      <div className="template-preview-card">
                        <div className="template-preview-header">
                          <div>
                            <span className="template-preview-name">{activeTemplate.emoji} {activeTemplate.name}</span>
                          </div>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingTemplate(!editingTemplate)}>
                            <i className={`fa-solid ${editingTemplate ? 'fa-eye' : 'fa-pen'}`}></i> {editingTemplate ? 'Preview' : 'Edit'}
                          </button>
                        </div>

                        {editingTemplate ? (
                          <div className="template-edit-fields">
                            <div className="form-group">
                              <label>Subject</label>
                              <input type="text" value={activeTemplate.subject} onChange={e => {
                                const updated = [...aiTemplates];
                                updated[selectedTemplateIdx] = { ...updated[selectedTemplateIdx], subject: e.target.value };
                                setAiTemplates(updated);
                                localStorage.setItem('coldpilot_ai_templates', JSON.stringify(updated));
                              }} />
                            </div>
                            <div className="form-group">
                              <label>Body</label>
                              <textarea className="template-editor" value={activeTemplate.body} onChange={e => {
                                const updated = [...aiTemplates];
                                updated[selectedTemplateIdx] = { ...updated[selectedTemplateIdx], body: e.target.value };
                                setAiTemplates(updated);
                                localStorage.setItem('coldpilot_ai_templates', JSON.stringify(updated));
                              }}></textarea>
                            </div>
                            {activeTemplate.aiPrompt ? (
                              <div className="form-group">
                                <label>AI Personalization Prompt</label>
                                <textarea value={activeTemplate.aiPrompt} style={{ minHeight: '60px', fontSize: '0.8rem' }} onChange={e => {
                                  const updated = [...aiTemplates];
                                  updated[selectedTemplateIdx] = { ...updated[selectedTemplateIdx], aiPrompt: e.target.value };
                                  setAiTemplates(updated);
                                  localStorage.setItem('coldpilot_ai_templates', JSON.stringify(updated));
                                }}></textarea>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div className="email-preview">
                            <div className="email-preview-field">
                              <span className="field-label">Subject:</span>
                              <span className="field-value">{renderTemplate(activeTemplate.subject, previewRecipient)}</span>
                            </div>
                            <div className="email-preview-divider"></div>
                            <div className="email-preview-body" dangerouslySetInnerHTML={{ __html: renderTemplate(activeTemplate.body, previewRecipient).replace(/\n/g, '<br>') }}></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="wizard-nav" style={{ marginTop: '20px' }}>
                        <button className="btn btn-outline" onClick={goBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                        <button className="btn btn-primary" onClick={goNext} disabled={!canProceed[4]}>
                          Go to Launch <i className="fa-solid fa-rocket"></i>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              {aiTemplates.length === 0 ? (
                <div className="wizard-nav">
                  <button className="btn btn-outline" onClick={goBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                  <button className="btn btn-primary" onClick={goNext} disabled={!canProceed[4]}>
                    Go to Launch <i className="fa-solid fa-rocket"></i>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ═══ STEP 5: SEND ═══ */}
        {currentStep === 5 ? (
          <div className="wizard-step" key="step5">
            <div className="step-hero compact">
              <div className="step-hero-icon small"><i className="fa-solid fa-paper-plane"></i></div>
              <div>
                <h2>Launch Campaign</h2>
                <p>Personalize each email with AI, then send them out.</p>
              </div>
            </div>

            <div className="step-body">
              <div className="launch-grid">
                {/* Controls */}
                <div className="launch-controls">
                  {/* Status Summary */}
                  <div className="launch-stats">
                    <div className="launch-stat"><span className="launch-stat-num">{stats.selected}</span><span>Selected</span></div>
                    <div className="launch-stat"><span className="launch-stat-num accent">{stats.personalized}</span><span>AI Ready</span></div>
                    <div className="launch-stat"><span className="launch-stat-num success">{stats.sent}</span><span>Sent</span></div>
                  </div>

                  {/* Actions */}
                  <div className="launch-actions">
                    <button className="btn btn-secondary btn-full" onClick={handleRunAiPersonalization} disabled={isCampaignRunning || !activeTemplate}>
                      <i className="fa-solid fa-wand-magic-sparkles"></i> Personalize All Leads
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-success" onClick={startCampaign} disabled={isCampaignRunning || !smtp} style={{ flex: 1 }}>
                        <i className="fa-solid fa-paper-plane"></i> Send Campaign
                      </button>
                      <button className="btn btn-warning btn-sm" onClick={pauseCampaign} disabled={!isCampaignRunning}>
                        <i className="fa-solid fa-pause"></i>
                      </button>
                    </div>
                  </div>

                  {/* Delay */}
                  <div className="form-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Send Delay</span><span style={{ color: 'var(--accent)' }}>{sendDelay}s</span>
                    </label>
                    <input type="range" min="3" max="60" value={sendDelay} onChange={e => setSendDelay(parseInt(e.target.value))} />
                  </div>

                  {/* Progress */}
                  {campaignProgress.total > 0 ? (
                    <div>
                      <div className="progress-info"><span>Progress</span><span>{campaignProgress.completed}/{campaignProgress.total} ({progressPercent}%)</span></div>
                      <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: `${progressPercent}%` }}></div></div>
                    </div>
                  ) : null}

                  {/* SMTP status */}
                  {!smtp ? (
                    <div className="inline-warning">
                      <i className="fa-solid fa-triangle-exclamation"></i> Set up SMTP in <button className="link-btn" onClick={() => setShowSettings(true)}>Settings</button> first.
                    </div>
                  ) : null}
                </div>

                {/* Log */}
                <div className="launch-log">
                  <div className="log-header">
                    <h4><i className="fa-solid fa-terminal"></i> Activity</h4>
                    <button className="btn btn-outline btn-sm" onClick={() => setLogs([])} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>Clear</button>
                  </div>
                  <div className="terminal">
                    {logs.length === 0 ? (
                      <div className="log-line system" style={{ opacity: 0.4 }}>Waiting...</div>
                    ) : logs.map((log, i) => (
                      <div key={i} className={`log-line ${log.type}`}>
                        <span className="log-time">[{log.time}]</span> {log.text}
                      </div>
                    ))}
                    <div ref={logEndRef}></div>
                  </div>
                </div>
              </div>

              <div className="wizard-nav">
                <button className="btn btn-outline" onClick={goBack}><i className="fa-solid fa-arrow-left"></i> Back</button>
                <div></div>
              </div>
            </div>
          </div>
        ) : null}

      </main>
    </div>
  );
}
