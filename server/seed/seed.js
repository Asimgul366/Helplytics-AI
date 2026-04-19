const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Request = require('../models/Request');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helplytics';

const seedUsers = [
  { name: 'Ayesha Khan', email: 'ayesha@helplytics.ai', password: 'password123', role: 'both', skills: ['Figma', 'UI/UX', 'HTML/CSS', 'Career Guidance'], interests: ['Hackathons', 'UI/UX', 'Community Building'], location: 'Karachi', trustScore: 100, badges: ['first-helper', 'rising-star'], solvedCount: 35 },
  { name: 'Hassan Ali', email: 'hassan@helplytics.ai', password: 'password123', role: 'helper', skills: ['JavaScript', 'React', 'Git/GitHub', 'Node.js'], interests: ['Open Source', 'Web Dev', 'Mentoring'], location: 'Lahore', trustScore: 88, badges: ['first-helper', 'rising-star'], solvedCount: 24 },
  { name: 'Sara Noor', email: 'sara@helplytics.ai', password: 'password123', role: 'both', skills: ['Python', 'Data Analysis', 'Machine Learning'], interests: ['AI/ML', 'Research', 'Education'], location: 'Islamabad', trustScore: 74, badges: ['first-helper'], solvedCount: 11 },
  { name: 'Ali Raza', email: 'ali@helplytics.ai', password: 'password123', role: 'seeker', skills: ['HTML', 'CSS', 'Bootstrap'], interests: ['Web Design', 'Frontend'], location: 'Karachi', trustScore: 20, badges: ['first-helper'], solvedCount: 2 },
  { name: 'Fatima Sheikh', email: 'fatima@helplytics.ai', password: 'password123', role: 'both', skills: ['React', 'TypeScript', 'Tailwind'], interests: ['Frontend', 'Design Systems'], location: 'Lahore', trustScore: 60, badges: ['first-helper'], solvedCount: 8 },
  { name: 'Usman Tariq', email: 'usman@helplytics.ai', password: 'password123', role: 'helper', skills: ['MongoDB', 'Express', 'Node.js', 'Docker'], interests: ['Backend', 'DevOps', 'Cloud'], location: 'Karachi', trustScore: 55, badges: ['first-helper'], solvedCount: 7 },
  { name: 'Zara Ahmed', email: 'zara@helplytics.ai', password: 'password123', role: 'seeker', skills: ['Graphic Design', 'Illustrator', 'Photoshop'], interests: ['Design', 'Branding'], location: 'Lahore', trustScore: 10, badges: [], solvedCount: 0 },
  { name: 'Bilal Khan', email: 'bilal@helplytics.ai', password: 'password123', role: 'both', skills: ['Flutter', 'Dart', 'Firebase'], interests: ['Mobile Dev', 'Cross-platform'], location: 'Peshawar', trustScore: 45, badges: ['first-helper'], solvedCount: 5 },
  { name: 'Hina Malik', email: 'hina@helplytics.ai', password: 'password123', role: 'helper', skills: ['Career Coaching', 'Resume Writing', 'Interview Prep'], interests: ['Career Development', 'HR'], location: 'Karachi', trustScore: 70, badges: ['first-helper'], solvedCount: 10 },
  { name: 'Omar Farooq', email: 'omar@helplytics.ai', password: 'password123', role: 'seeker', skills: ['Java', 'Spring Boot', 'SQL'], interests: ['Backend', 'Databases'], location: 'Islamabad', trustScore: 5, badges: [], solvedCount: 0 },
];

const seedRequests = [
  { title: 'Need help', description: 'helpn needed', category: 'Technology', tags: ['Web Development'], urgency: 'High', status: 'solved', location: 'Karachi', ownerEmail: 'ali@helplytics.ai', helperEmails: ['ayesha@helplytics.ai'] },
  { title: 'Need help making my portfolio responsive before demo day', description: 'My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.', category: 'Technology', tags: ['HTML/CSS', 'Responsive', 'Portfolio'], urgency: 'High', status: 'solved', location: 'Karachi', ownerEmail: 'sara@helplytics.ai', helperEmails: ['ayesha@helplytics.ai', 'hassan@helplytics.ai'] },
  { title: 'Looking for Figma feedback on a volunteer event poster', description: 'I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.', category: 'Creative Arts', tags: ['Figma', 'Poster', 'Design Review'], urgency: 'Medium', status: 'open', location: 'Lahore', ownerEmail: 'zara@helplytics.ai', helperEmails: [] },
  { title: 'Need mock interview support for internship applications', description: 'Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.', category: 'Career', tags: ['Interview Prep', 'Career', 'Frontend'], urgency: 'Low', status: 'solved', location: 'Remote', ownerEmail: 'ali@helplytics.ai', helperEmails: ['hina@helplytics.ai', 'ayesha@helplytics.ai'] },
  { title: 'Help debugging my React useEffect infinite loop', description: 'My component keeps re-rendering infinitely. I think its a dependency array issue but cant figure it out.', category: 'Technology', tags: ['React', 'JavaScript', 'Debugging'], urgency: 'High', status: 'open', location: 'Lahore', ownerEmail: 'omar@helplytics.ai', helperEmails: ['hassan@helplytics.ai'] },
  { title: 'Need help setting up MongoDB Atlas for my project', description: 'First time using cloud MongoDB and getting connection errors. Need someone to walk me through the setup.', category: 'Technology', tags: ['MongoDB', 'Database', 'Backend'], urgency: 'Medium', status: 'open', location: 'Karachi', ownerEmail: 'ali@helplytics.ai', helperEmails: [] },
  { title: 'Looking for a study partner for DSA preparation', description: 'Preparing for technical interviews and want someone to solve LeetCode problems together daily.', category: 'Education', tags: ['DSA', 'Algorithms', 'Interview Prep'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'omar@helplytics.ai', helperEmails: [] },
  { title: 'Need help with my final year project proposal', description: 'Working on an AI-based project and need guidance on how to write a strong proposal for my supervisor.', category: 'Education', tags: ['FYP', 'AI', 'Research'], urgency: 'High', status: 'open', location: 'Islamabad', ownerEmail: 'zara@helplytics.ai', helperEmails: ['sara@helplytics.ai'] },
  { title: 'Flutter app crashing on Android 14', description: 'My Flutter app works fine on older Android versions but crashes on Android 14. Need help debugging.', category: 'Technology', tags: ['Flutter', 'Android', 'Debugging'], urgency: 'High', status: 'open', location: 'Peshawar', ownerEmail: 'bilal@helplytics.ai', helperEmails: [] },
  { title: 'Need resume review for software engineering roles', description: 'Applying to software engineering positions and want feedback on my resume structure and content.', category: 'Career', tags: ['Resume', 'Career', 'Software Engineering'], urgency: 'Medium', status: 'solved', location: 'Karachi', ownerEmail: 'zara@helplytics.ai', helperEmails: ['hina@helplytics.ai'] },
  { title: 'Help understanding REST API design principles', description: 'Building my first API and confused about best practices for endpoint naming, status codes, and versioning.', category: 'Technology', tags: ['API', 'REST', 'Backend'], urgency: 'Low', status: 'open', location: 'Lahore', ownerEmail: 'ali@helplytics.ai', helperEmails: [] },
  { title: 'Need help with Tailwind CSS grid layout', description: 'Trying to build a responsive card grid but the layout breaks on mobile. Need someone to review my code.', category: 'Technology', tags: ['Tailwind', 'CSS', 'Responsive'], urgency: 'Medium', status: 'open', location: 'Karachi', ownerEmail: 'omar@helplytics.ai', helperEmails: ['fatima@helplytics.ai'] },
  { title: 'Looking for Python mentor for data analysis project', description: 'Working on a data analysis project using pandas and matplotlib. Need guidance on best practices.', category: 'Technology', tags: ['Python', 'Data Analysis', 'Pandas'], urgency: 'Low', status: 'open', location: 'Islamabad', ownerEmail: 'ali@helplytics.ai', helperEmails: ['sara@helplytics.ai'] },
  { title: 'Need help deploying Node.js app to Railway', description: 'First time deploying a backend app. Getting environment variable errors on Railway. Need step-by-step help.', category: 'Technology', tags: ['Node.js', 'Deployment', 'Railway'], urgency: 'High', status: 'open', location: 'Karachi', ownerEmail: 'omar@helplytics.ai', helperEmails: [] },
  { title: 'Feedback needed on UI design for mobile app', description: 'Designed a mobile app UI in Figma and need honest feedback on usability and visual hierarchy.', category: 'Creative Arts', tags: ['Figma', 'UI/UX', 'Mobile'], urgency: 'Low', status: 'open', location: 'Lahore', ownerEmail: 'zara@helplytics.ai', helperEmails: ['ayesha@helplytics.ai'] },
  { title: 'Help with SQL query optimization', description: 'My SQL queries are running very slow on large datasets. Need help with indexing and query optimization.', category: 'Technology', tags: ['SQL', 'Database', 'Optimization'], urgency: 'Medium', status: 'solved', location: 'Islamabad', ownerEmail: 'omar@helplytics.ai', helperEmails: ['usman@helplytics.ai'] },
  { title: 'Need help understanding Docker basics', description: 'Trying to containerize my Node.js app but confused about Dockerfile syntax and docker-compose.', category: 'Technology', tags: ['Docker', 'DevOps', 'Node.js'], urgency: 'Medium', status: 'open', location: 'Karachi', ownerEmail: 'ali@helplytics.ai', helperEmails: ['usman@helplytics.ai'] },
  { title: 'Looking for accountability partner for 30-day coding challenge', description: 'Starting a 30-day coding challenge and want someone to check in daily and keep each other motivated.', category: 'Community', tags: ['Coding Challenge', 'Accountability', 'Learning'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'zara@helplytics.ai', helperEmails: [] },
  { title: 'Need help with Firebase authentication in React', description: 'Implementing Google sign-in with Firebase in my React app but getting CORS errors. Need help debugging.', category: 'Technology', tags: ['Firebase', 'React', 'Authentication'], urgency: 'High', status: 'open', location: 'Lahore', ownerEmail: 'ali@helplytics.ai', helperEmails: [] },
  { title: 'Help writing technical blog post about React hooks', description: 'Want to write a beginner-friendly blog post about React hooks but struggling with structure and examples.', category: 'Education', tags: ['React', 'Writing', 'Blogging'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'omar@helplytics.ai', helperEmails: [] },
  { title: 'Need help with anxiety before job interviews', description: 'I get very anxious before technical interviews and it affects my performance. Looking for tips and support.', category: 'Mental Health', tags: ['Anxiety', 'Interview', 'Mental Health'], urgency: 'Medium', status: 'open', location: 'Karachi', ownerEmail: 'zara@helplytics.ai', helperEmails: [] },
  { title: 'Help setting up CI/CD pipeline with GitHub Actions', description: 'Want to automate testing and deployment for my project using GitHub Actions but dont know where to start.', category: 'Technology', tags: ['CI/CD', 'GitHub Actions', 'DevOps'], urgency: 'Medium', status: 'solved', location: 'Lahore', ownerEmail: 'bilal@helplytics.ai', helperEmails: ['usman@helplytics.ai', 'hassan@helplytics.ai'] },
  { title: 'Need guidance on freelancing as a developer', description: 'Want to start freelancing as a web developer but dont know how to find clients, set rates, or build a portfolio.', category: 'Career', tags: ['Freelancing', 'Career', 'Web Development'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'ali@helplytics.ai', helperEmails: ['hina@helplytics.ai'] },
  { title: 'Help with TypeScript generics and advanced types', description: 'Working on a TypeScript project and struggling with generics, conditional types, and mapped types.', category: 'Technology', tags: ['TypeScript', 'JavaScript', 'Advanced'], urgency: 'Medium', status: 'open', location: 'Lahore', ownerEmail: 'omar@helplytics.ai', helperEmails: ['fatima@helplytics.ai'] },
  { title: 'Need help creating a pitch deck for startup idea', description: 'Have a startup idea and need help structuring a compelling pitch deck for potential investors.', category: 'Career', tags: ['Startup', 'Pitch Deck', 'Business'], urgency: 'High', status: 'open', location: 'Karachi', ownerEmail: 'zara@helplytics.ai', helperEmails: [] },
  { title: 'Looking for feedback on my open source project', description: 'Built a small open source utility library and want code review and feedback on documentation.', category: 'Technology', tags: ['Open Source', 'Code Review', 'Documentation'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'bilal@helplytics.ai', helperEmails: ['hassan@helplytics.ai'] },
  { title: 'Need help understanding machine learning concepts', description: 'Taking an ML course but struggling with gradient descent, backpropagation, and neural network concepts.', category: 'Education', tags: ['Machine Learning', 'AI', 'Deep Learning'], urgency: 'Medium', status: 'open', location: 'Islamabad', ownerEmail: 'ali@helplytics.ai', helperEmails: ['sara@helplytics.ai'] },
  { title: 'Help with responsive navbar in React', description: 'My React navbar works on desktop but the mobile hamburger menu is not working correctly. Need help fixing it.', category: 'Technology', tags: ['React', 'CSS', 'Responsive'], urgency: 'Medium', status: 'solved', location: 'Karachi', ownerEmail: 'omar@helplytics.ai', helperEmails: ['fatima@helplytics.ai', 'hassan@helplytics.ai'] },
  { title: 'Need help with budgeting and personal finance', description: 'Just started my first job and want to learn how to budget, save, and invest my salary wisely.', category: 'Finance', tags: ['Budgeting', 'Personal Finance', 'Investing'], urgency: 'Low', status: 'open', location: 'Karachi', ownerEmail: 'zara@helplytics.ai', helperEmails: [] },
  { title: 'Looking for a code review partner for weekly sessions', description: 'Want to do weekly code review sessions with another developer to improve code quality and learn best practices.', category: 'Community', tags: ['Code Review', 'Learning', 'Collaboration'], urgency: 'Low', status: 'open', location: 'Remote', ownerEmail: 'ali@helplytics.ai', helperEmails: [] },
  { title: 'Help with Express.js middleware and error handling', description: 'Building a REST API and confused about how to properly structure middleware and handle errors globally.', category: 'Technology', tags: ['Express', 'Node.js', 'Backend'], urgency: 'Medium', status: 'open', location: 'Lahore', ownerEmail: 'omar@helplytics.ai', helperEmails: ['usman@helplytics.ai'] },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed users
    const userMap = {};
    for (const u of seedUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const hashed = await bcrypt.hash(u.password, 10);
        user = await User.create({ ...u, password: hashed });
        console.log(`Created user: ${u.name}`);
      }
      userMap[u.email] = user;
    }

    // Seed requests
    const requestList = [];
    for (const r of seedRequests) {
      const existing = await Request.findOne({ title: r.title, owner: userMap[r.ownerEmail]._id });
      if (!existing) {
        const helpers = r.helperEmails.map(e => userMap[e]._id);
        const req = await Request.create({
          title: r.title,
          description: r.description,
          category: r.category,
          tags: r.tags,
          urgency: r.urgency,
          status: r.status,
          location: r.location,
          owner: userMap[r.ownerEmail]._id,
          helpers,
          solvedAt: r.status === 'solved' ? new Date() : null,
        });
        requestList.push({ req, r });
        console.log(`Created request: ${r.title}`);
      }
    }

    // Seed messages for solved requests
    for (const { req, r } of requestList) {
      if (r.status === 'solved' && r.helperEmails.length > 0) {
        const existing = await Message.findOne({ request: req._id });
        if (!existing) {
          const helperUser = userMap[r.helperEmails[0]];
          const ownerUser = userMap[r.ownerEmail];
          await Message.create([
            { request: req._id, sender: helperUser._id, content: `Hi! I saw your request and I think I can help. Let me know more details.` },
            { request: req._id, sender: ownerUser._id, content: `Thanks for reaching out! Here is more context about my problem.` },
            { request: req._id, sender: helperUser._id, content: `Got it. I have a solution for you. Let me share it step by step.` },
          ]);
          console.log(`Created messages for: ${r.title}`);
        }
      }
    }

    // Seed notifications
    const ayesha = userMap['ayesha@helplytics.ai'];
    const hassan = userMap['hassan@helplytics.ai'];
    const sara = userMap['sara@helplytics.ai'];

    const notifCheck = await Notification.findOne({ recipient: ayesha._id });
    if (!notifCheck) {
      const firstRequest = await Request.findOne({ owner: userMap['ali@helplytics.ai']._id });
      await Notification.create([
        { recipient: ayesha._id, type: 'status', message: '"Need help" was marked as solved', relatedRequest: firstRequest?._id, read: false },
        { recipient: ayesha._id, type: 'match', message: 'Ayesha Khan offered help on "Need help"', relatedRequest: firstRequest?._id, read: false },
        { recipient: ayesha._id, type: 'request', message: 'Your request "Need help" is now live in the community feed', read: false },
        { recipient: ayesha._id, type: 'reputation', message: 'Your trust score increased after a solved request', read: true },
        { recipient: hassan._id, type: 'status', message: 'A request you helped was marked as solved', read: false },
        { recipient: hassan._id, type: 'match', message: 'New helper matched to your responsive portfolio request', read: false },
        { recipient: hassan._id, type: 'reputation', message: 'Your trust score increased after a solved request', read: true },
        { recipient: sara._id, type: 'request', message: 'New request matching your skills: "Need help with ML concepts"', read: false },
        { recipient: sara._id, type: 'match', message: 'Someone is interested in your help offer', read: false },
      ]);
      console.log('Created notifications');
    }

    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
