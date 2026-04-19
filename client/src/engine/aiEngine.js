const CATEGORIES = [
  'Technology', 'Health & Wellness', 'Education', 'Finance',
  'Legal', 'Career', 'Mental Health', 'Home & DIY',
  'Creative Arts', 'Community', 'Relationships', 'Other'
];

const CATEGORY_KEYWORDS = {
  'Technology': ['code', 'bug', 'software', 'app', 'website', 'api', 'database', 'server', 'react', 'javascript', 'python', 'css', 'html', 'git', 'deploy', 'flutter', 'node', 'express', 'mongodb', 'typescript', 'docker', 'firebase', 'tailwind', 'frontend', 'backend', 'fullstack', 'debugging', 'error', 'crash', 'responsive', 'layout'],
  'Health & Wellness': ['health', 'doctor', 'pain', 'symptom', 'diet', 'exercise', 'fitness', 'medical', 'hospital', 'nutrition', 'wellness'],
  'Education': ['study', 'learn', 'course', 'exam', 'school', 'university', 'tutor', 'homework', 'assignment', 'degree', 'dsa', 'algorithms', 'ml', 'machine learning', 'fyp', 'research', 'blog'],
  'Finance': ['money', 'budget', 'invest', 'loan', 'tax', 'salary', 'debt', 'savings', 'bank', 'financial', 'freelance', 'rates'],
  'Legal': ['law', 'legal', 'contract', 'rights', 'court', 'lawyer', 'dispute', 'regulation', 'compliance'],
  'Career': ['job', 'resume', 'interview', 'career', 'work', 'hire', 'promotion', 'linkedin', 'portfolio', 'internship', 'freelancing', 'pitch', 'startup'],
  'Mental Health': ['anxiety', 'stress', 'depression', 'therapy', 'mental', 'burnout', 'overwhelmed', 'counseling', 'nervous', 'worried'],
  'Home & DIY': ['repair', 'plumbing', 'electrical', 'furniture', 'renovation', 'garden', 'cleaning', 'home'],
  'Creative Arts': ['design', 'art', 'music', 'writing', 'photography', 'video', 'creative', 'illustration', 'figma', 'poster', 'ui', 'ux', 'graphic'],
  'Community': ['volunteer', 'event', 'neighborhood', 'local', 'community', 'charity', 'nonprofit', 'accountability', 'collaboration', 'partner'],
  'Relationships': ['relationship', 'family', 'friend', 'communication', 'conflict', 'dating', 'marriage'],
};

const URGENCY_KEYWORDS = {
  High: ['urgent', 'asap', 'emergency', 'critical', 'immediately', 'deadline', 'crisis', 'help now', 'right now', 'tonight', 'today', 'tomorrow', 'demo day', 'submission', 'crashing', 'broken'],
  Medium: ['soon', 'this week', 'need help', 'struggling', 'important', 'moderate', 'confused', 'stuck'],
  Low: ['whenever', 'no rush', 'eventually', 'low priority', 'casual', 'curious', 'looking for', 'want to'],
};

const SKILL_TAXONOMY = [
  'JavaScript', 'React', 'Node.js', 'Python', 'HTML/CSS', 'Tailwind', 'TypeScript',
  'MongoDB', 'SQL', 'Firebase', 'Docker', 'Git/GitHub', 'Figma', 'UI/UX',
  'Machine Learning', 'Data Analysis', 'Flutter', 'Career Guidance', 'Interview Prep',
  'Resume Writing', 'Public Speaking', 'Project Management', 'Agile', 'DevOps',
];

export function suggestCategory(text) {
  try {
    const lower = text.toLowerCase();
    let best = 'Other';
    let bestScore = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = keywords.filter(k => lower.includes(k)).length;
      if (score > bestScore) { bestScore = score; best = cat; }
    }
    return best;
  } catch { return 'Other'; }
}

export function suggestTags(text) {
  try {
    const lower = text.toLowerCase();
    const tags = [];
    const allKeywords = Object.values(CATEGORY_KEYWORDS).flat();
    const unique = [...new Set(allKeywords)];
    for (const kw of unique) {
      if (lower.includes(kw) && tags.length < 5) {
        tags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
      }
    }
    return tags.slice(0, 5);
  } catch { return []; }
}

export function detectUrgency(text) {
  try {
    const lower = text.toLowerCase();
    for (const kw of URGENCY_KEYWORDS.High) { if (lower.includes(kw)) return 'High'; }
    for (const kw of URGENCY_KEYWORDS.Medium) { if (lower.includes(kw)) return 'Medium'; }
    return 'Low';
  } catch { return 'Low'; }
}

export function generateSummary(description) {
  try {
    const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
    return sentences.slice(0, 3).join(' ').trim();
  } catch { return description.slice(0, 200); }
}

export function suggestSkills(existingSkills) {
  try {
    const lower = existingSkills.map(s => s.toLowerCase());
    return SKILL_TAXONOMY.filter(s => !lower.includes(s.toLowerCase())).slice(0, 6);
  } catch { return []; }
}

export function generateInsights(userActivity = {}, communityStats = {}) {
  try {
    const insights = [
      `There are ${communityStats.totalResolved || 0} resolved requests in the community — keep contributing!`,
      `Your trust score reflects your impact. Help more requests to climb the leaderboard.`,
    ];
    if (userActivity.helped > 0) insights.push(`You've helped ${userActivity.helped} people — you're making a difference!`);
    return insights.slice(0, 3);
  } catch { return ['Keep contributing to grow your trust score.', 'Explore new requests matching your skills.']; }
}

export function rewriteDescription(description) {
  try {
    if (!description.trim()) return '';
    return `I am seeking assistance with the following challenge: ${description.trim()} Any guidance, resources, or direct help would be greatly appreciated.`;
  } catch { return description; }
}

export function computeTrendPulse(requests) {
  try {
    const catCount = {};
    const tagCount = {};
    for (const r of requests) {
      catCount[r.category] = (catCount[r.category] || 0) + 1;
      for (const t of (r.tags || [])) tagCount[t] = (tagCount[t] || 0) + 1;
    }
    const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    return { categories: topCats, tags: topTags };
  } catch { return { categories: [], tags: [] }; }
}

export function getUrgencyWatch(requests) {
  try {
    return requests
      .filter(r => r.status === 'open' && r.urgency === 'High')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } catch { return []; }
}

export function matchMentors(helpers, userInterests) {
  try {
    const lower = userInterests.map(i => i.toLowerCase());
    return helpers
      .filter(h => (h.skills || []).some(s => lower.some(i => s.toLowerCase().includes(i) || i.includes(s.toLowerCase()))))
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 10);
  } catch { return []; }
}

export function recommendRequests(requests, userSkills) {
  try {
    const lower = userSkills.map(s => s.toLowerCase());
    return requests
      .filter(r => r.status === 'open' && (r.tags || []).some(t => lower.some(s => t.toLowerCase().includes(s) || s.includes(t.toLowerCase()))))
      .slice(0, 5);
  } catch { return []; }
}
