// backend/data/learningPaths.js
// 10 missions (interests), each with 10 steps (mix of story, learn, mcq, drag_order, connect_flow, code_blocks)

const missions = {
  "Web Development": {
    title: "Web Dev Hero Journey",
    description:
      "Go from a blank page to a responsive, interactive website – like a hero building the college fest site.",
    interest: "Web Development",
    steps: [
      {
        type: "story",
        title: "A Blank Browser Tab",
        text:
          "Your college wants a modern site for the tech fest. You open a blank browser tab and imagine the homepage – hero banner, events, register button.",
      },
      {
        type: "learn_card",
        title: "HTML: The Skeleton of the Page",
        text:
          "HTML defines the structure: headings, paragraphs, images, buttons. Think of it like arranging sections on a poster before decorating it.",
      },
      {
        type: "mcq",
        title: "Choosing the Correct Heading Tag",
        prompt:
          "You want the main heading 'Tech Fest 2025'. Which HTML tag is most appropriate?",
        options: ["<p>Tech Fest 2025</p>", "<h1>Tech Fest 2025</h1>", "<h6>Tech Fest 2025</h6>"],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "CSS: Making Things Beautiful",
        text:
          "CSS controls colours, fonts, spacing and layout. The same HTML can look ugly or amazing based on how you style it.",
      },
      {
        type: "drag_order",
        title: "Steps to Build a Basic Page",
        items: [
          "Write the HTML structure",
          "Add CSS for layout & colours",
          "Test on mobile & desktop",
          "Deploy so others can see it",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "JavaScript Adds Brain",
        text:
          "JavaScript lets the page respond to clicks, inputs and real-time data. It can update content without reloading the whole page.",
      },
      {
        type: "mcq",
        title: "Correct Place for Client JS",
        prompt:
          "Where is the best place to add your main JavaScript file in a simple web page?",
        options: [
          "Inside <head> before CSS",
          "At the very end of <body>",
          "Before closing </html> tag",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Responsive Design",
        text:
          "Using flexbox, grid and media queries, you can make layouts that adapt to phones, tablets and laptops without breaking.",
      },
      {
        type: "drag_order",
        title: "Debugging a Broken Layout",
        items: [
          "Open DevTools",
          "Inspect the element",
          "Check applied CSS rules",
          "Tweak values live & then fix in code",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "story",
        title: "From Idea to Live Website",
        text:
          "You push the code to GitHub, deploy it, and share the link. Now anyone from anywhere can see the tech fest site you built.",
      },
    ],
  },

  "App Development": {
    title: "Campus Companion App",
    description:
      "Design a mobile app that makes college life easier – timetable, reminders and smart notifications.",
    interest: "App Development",
    steps: [
      {
        type: "story",
        title: "Too Many Classes, No Time",
        text:
          "Students keep forgetting class timings and submissions. You decide to build a small app that shows today's schedule at a glance.",
      },
      {
        type: "learn_card",
        title: "Screens & Navigation",
        text:
          "Each major feature gets its own screen: timetable, assignments, profile, notifications. A navigation stack lets users move between them smoothly.",
      },
      {
        type: "mcq",
        title: "Best First Screen",
        prompt:
          "After login, which screen should your app show first for maximum usefulness?",
        options: ["Profile screen", "Settings screen", "Dashboard with today's classes"],
        correctIndex: 2,
      },
      {
        type: "learn_card",
        title: "State: Remembering What’s Going On",
        text:
          "State stores information like selected date, logged-in user, and unread notifications. Frameworks like React Native use hooks for managing state.",
      },
      {
        type: "drag_order",
        title: "User Flow: Opening the App",
        items: [
          "User taps app icon",
          "Splash/logo appears",
          "Authentication / login (first time)",
          "Dashboard shows timetable & tasks",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "Offline-First Thinking",
        text:
          "Good apps cache important data so users can still see timetable and last data even if internet is down.",
      },
      {
        type: "mcq",
        title: "Good Use of Push Notifications",
        prompt: "Which notification is most useful and least irritating?",
        options: [
          "Every minute: 'Open the app!'",
          "15 mins before class: 'You have DBMS Lab in Room 203.'",
          "Random time: 'Rate our app now!'",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Handling API Errors Gracefully",
        text:
          "When the server fails, show a friendly message and retry option instead of a blank, broken screen.",
      },
      {
        type: "drag_order",
        title: "Debugging App Crash",
        items: [
          "Reproduce the issue",
          "Read error log / stack trace",
          "Identify faulty component or API",
          "Fix & test again on device",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "story",
        title: "Your App Becomes a Habit",
        text:
          "Soon students rely on your app for reminders. It becomes part of their daily routine – you solved a real problem.",
      },
    ],
  },

  Cybersecurity: {
    title: "Secure the College Portal",
    description:
      "Think like an attacker and defender to protect accounts, data and systems.",
    interest: "Cybersecurity",
    steps: [
      {
        type: "story",
        title: "Strange Login Alerts",
        text:
          "You notice multiple failed logins at 3 AM to the admin account. Somebody is trying to brute force the password.",
      },
      {
        type: "learn_card",
        title: "CIA Triad in Simple Words",
        text:
          "Confidentiality = only right people see it. Integrity = data isn't secretly changed. Availability = system is up when needed.",
      },
      {
        type: "mcq",
        title: "Identify the Weak Password",
        prompt:
          "Which of these is the MOST secure for a bank account?",
        options: ["admin123", "Hirthik@2004", "8k!Pq#49Lm$"],
        correctIndex: 2,
      },
      {
        type: "learn_card",
        title: "Defense in Depth",
        text:
          "Good security uses multiple layers: strong passwords, MFA, limited access, logging, network rules, and user awareness.",
      },
      {
        type: "connect_flow",
        title: "Typical Phishing Attack Flow",
        nodes: [
          "Fake email sent",
          "User clicks link",
          "Fake login page opens",
          "User enters credentials",
          "Attacker logs in as user",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "learn_card",
        title: "MFA as a Game-Changer",
        text:
          "Even if a password leaks, MFA (OTP/app) blocks most attackers. It’s one of the simplest strong defenses.",
      },
      {
        type: "mcq",
        title: "Safest Behaviour",
        prompt: "You receive an OTP without trying to log in. What should you do?",
        options: [
          "Ignore it and delete SMS",
          "Share it with 'support team' via email",
          "Log in quickly to check if account works",
        ],
        correctIndex: 0,
      },
      {
        type: "learn_card",
        title: "Least Privilege",
        text:
          "Give each user only the bare minimum access they need. This way, if their account is hacked, the damage is limited.",
      },
      {
        type: "drag_order",
        title: "Steps After Detecting Breach",
        items: [
          "Isolate affected systems",
          "Reset credentials & revoke tokens",
          "Investigate logs & root cause",
          "Patch, monitor & inform stakeholders",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "story",
        title: "You Saved the Portal",
        text:
          "Because you enforced MFA, strong passwords and logging, the attack fails. Admin appreciates your proactive security mindset.",
      },
    ],
  },

  "UI/UX Design": {
    title: "Design a Delightful Learning App",
    description:
      "Learn how small design decisions make an app feel smooth, friendly and easy to use.",
    interest: "UI/UX Design",
    steps: [
      {
        type: "story",
        title: "Two Apps, Same Purpose",
        text:
          "You open two attendance apps. One is cluttered, the other feels clean and obvious. You naturally prefer the second.",
      },
      {
        type: "learn_card",
        title: "UI vs UX",
        text:
          "UI = how things look. UX = how it feels to use. Beautiful UI with confusing UX still fails users.",
      },
      {
        type: "mcq",
        title: "Best Button Label",
        prompt:
          "You want students to start a quiz. Which label is clearest?",
        options: ["Click", "Start", "Start Quiz"],
        correctIndex: 2,
      },
      {
        type: "learn_card",
        title: "Visual Hierarchy",
        text:
          "Use size, colour and spacing so that important elements stand out. Users should instantly know where to look first.",
      },
      {
        type: "drag_order",
        title: "UX Design Process",
        items: [
          "Understand users & problems",
          "Sketch low-fidelity wireframes",
          "Create high-fidelity designs",
          "Test with real users",
          "Refine based on feedback",
        ],
        correctOrder: [0, 1, 2, 3, 4],
      },
      {
        type: "learn_card",
        title: "Microcopy Matters",
        text:
          "Small texts like error messages, placeholders and help tips guide users. Friendly microcopy reduces frustration.",
      },
      {
        type: "mcq",
        title: "Good Error Message",
        prompt:
          "Which error message is most helpful?",
        options: [
          "Error 500",
          "Something went wrong.",
          "We couldn’t load data. Check your internet or try again.",
        ],
        correctIndex: 2,
      },
      {
        type: "learn_card",
        title: "Consistency & Patterns",
        text:
          "Using common patterns (bottom navigation, hamburger menu, etc.) makes apps feel familiar, so users learn faster.",
      },
      {
        type: "connect_flow",
        title: "User Journey Example",
        nodes: [
          "Opens app",
          "Sees dashboard",
          "Taps 'View Timetable'",
          "Checks classes",
          "Sets reminder for lab",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "story",
        title: "From Confusion to Delight",
        text:
          "After your redesign, students say, 'Now I finally understand where everything is!' That’s UX success.",
      },
    ],
  },

  "Game Development": {
    title: "Design a 2D Adventure Game",
    description:
      "Discover how loops, input, feedback and level design make games addictive and fun.",
    interest: "Game Development",
    steps: [
      {
        type: "story",
        title: "Hero Enters the Dungeon",
        text:
          "You’re designing a 2D dungeon game where a hero collects coins, avoids traps and finds the exit.",
      },
      {
        type: "learn_card",
        title: "Game Loop",
        text:
          "Most games follow: handle input → update world → render graphics → repeat many times per second.",
      },
      {
        type: "code_blocks",
        title: "Pseudo Game Loop",
        language: "python",
        blocks: [
          "while game_is_running:",
          "    handle_input()",
          "    update_world()",
          "    render_screen()",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "Juice: Extra Polish",
        text:
          "Small details like particles, screen shake and sound effects make simple actions feel powerful and satisfying.",
      },
      {
        type: "mcq",
        title: "When to Reward Player",
        prompt:
          "When is the BEST time to show points and play a coin sound?",
        options: [
          "Random moments",
          "Immediately when collecting coin",
          "Only after clearing level",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Difficulty Curve",
        text:
          "Good games start easy and slowly increase challenge so players feel progress instead of instant frustration.",
      },
      {
        type: "drag_order",
        title: "Level Design Flow",
        items: [
          "Decide theme & goal",
          "Sketch rough layout",
          "Place enemies & obstacles",
          "Playtest & adjust difficulty",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "Game Feel",
        text:
          "Responsiveness, input delay, animation timing and camera motion all combine to create the 'feel' of your game.",
      },
      {
        type: "mcq",
        title: "Good First Level Design",
        prompt:
          "What should the very first level focus on?",
        options: [
          "All obstacles at once",
          "Teaching core controls safely",
          "Making it almost impossible to win",
        ],
        correctIndex: 1,
      },
      {
        type: "story",
        title: "Players Compete & Improve",
        text:
          "Your friends start speedrunning levels, trying to beat each other's high scores. Your small game created real competition.",
      },
    ],
  },

  "Artificial Intelligence": {
    title: "Train Your AI Sidekick",
    description:
      "Learn how data, models and predictions power assistants like your own AI mentor.",
    interest: "Artificial Intelligence",
    steps: [
      {
        type: "story",
        title: "Smart Assistant for Students",
        text:
          "You want to build an AI that suggests what to study in a free period based on timetable and past performance.",
      },
      {
        type: "learn_card",
        title: "Data → Model → Prediction",
        text:
          "AI learns patterns from example data using a model. Later, the model predicts outputs for new inputs.",
      },
      {
        type: "mcq",
        title: "Training Data Example",
        prompt:
          "Which dataset is best for predicting exam marks?",
        options: [
          "Student names only",
          "Subjects + study hours + past marks",
          "Random motivational quotes",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Supervised Learning",
        text:
          "In supervised learning, each input has a known correct output. The model tries to learn this mapping.",
      },
      {
        type: "drag_order",
        title: "Steps to Build a Simple ML Model",
        items: [
          "Collect and clean data",
          "Split into train & test",
          "Train model on train set",
          "Evaluate on test set",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "Overfitting",
        text:
          "Overfitting happens when a model memorizes training data instead of learning general patterns. It performs badly on new data.",
      },
      {
        type: "mcq",
        title: "Signs of Overfitting",
        prompt:
          "Which situation suggests overfitting?",
        options: [
          "Low train and low test accuracy",
          "High train accuracy, low test accuracy",
          "Both accuracies moderate and similar",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Real-World Constraints",
        text:
          "Data may be biased, incomplete or noisy. A good AI engineer also thinks about fairness, privacy and safety.",
      },
      {
        type: "connect_flow",
        title: "AI Assistant Flow",
        nodes: [
          "Student asks a question",
          "System understands intent",
          "Model searches & reasons",
          "Response is generated",
          "Student gets a helpful answer",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "story",
        title: "From Rules to Learning",
        text:
          "Instead of coding thousands of if-else, you let the model learn from examples. Your assistant gets smarter over time.",
      },
    ],
  },

  "Data Science": {
    title: "Tell Stories with Data",
    description:
      "Use data to find patterns in marks, attendance and student performance.",
    interest: "Data Science",
    steps: [
      {
        type: "story",
        title: "Why Are Marks Dropping?",
        text:
          "Your HoD wants to know why an entire batch's performance has gone down in a particular semester.",
      },
      {
        type: "learn_card",
        title: "Cleaning Real-World Data",
        text:
          "You remove duplicates, handle missing values and fix inconsistent labels. Clean data is essential before any analysis.",
      },
      {
        type: "mcq",
        title: "Best Chart for Comparisons",
        prompt:
          "Which chart is best for comparing average marks of multiple subjects?",
        options: ["Pie chart", "Bar chart", "Line chart over years"],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Correlation vs Causation",
        text:
          "If low attendance and low marks often appear together, they are correlated. It doesn't always mean one causes the other.",
      },
      {
        type: "connect_flow",
        title: "Data Science Workflow",
        nodes: [
          "Define the question",
          "Collect data",
          "Clean & preprocess",
          "Analyze & visualize",
          "Communicate insights",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "learn_card",
        title: "Feature Engineering",
        text:
          "You can create new features like 'average study hours per week' or 'lab attendance ratio' to reveal better patterns.",
      },
      {
        type: "mcq",
        title: "Outliers Handling",
        prompt:
          "A student has 0 attendance but 100 marks. What should you do?",
        options: [
          "Blindly include it",
          "Investigate & decide if it’s valid",
          "Delete all data",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Storytelling with Data",
        text:
          "Insights are powerful only when explained simply. Use clear visuals and plain language while presenting.",
      },
      {
        type: "drag_order",
        title: "Creating a Final Report",
        items: [
          "Write key findings",
          "Add visual charts",
          "Explain possible reasons",
          "Suggest next actions",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "story",
        title: "Your Report Drives Change",
        text:
          "Your analysis helps faculty adjust teaching methods and timings. The next semester’s results improve significantly.",
      },
    ],
  },

  "Cloud Computing": {
    title: "Launch Your App to the Cloud",
    description:
      "Take your project from localhost to a global URL using cloud platforms.",
    interest: "Cloud Computing",
    steps: [
      {
        type: "story",
        title: "Localhost Isn’t Enough",
        text:
          "Your MERN app runs perfectly on localhost:3000, but judges and faculty can’t see it from their devices.",
      },
      {
        type: "learn_card",
        title: "What is the Cloud, Really?",
        text:
          "Cloud is a fancy way of saying 'powerful computers somewhere else' that you can rent on demand.",
      },
      {
        type: "mcq",
        title: "Service Model Choice",
        prompt:
          "Which cloud model gives you most control over OS and runtime?",
        options: ["SaaS", "PaaS", "IaaS"],
        correctIndex: 2,
      },
      {
        type: "learn_card",
        title: "Environment Variables",
        text:
          "Never hardcode secrets like DB passwords. Use environment variables so they are safe and configurable.",
      },
      {
        type: "drag_order",
        title: "Basic Deployment Pipeline",
        items: [
          "Push code to GitHub",
          "Connect repo to cloud platform",
          "Configure environment variables",
          "Deploy & test live URL",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "learn_card",
        title: "Scaling On Demand",
        text:
          "If traffic increases, cloud providers can scale instances or containers so your app stays responsive.",
      },
      {
        type: "mcq",
        title: "Good Health Check",
        prompt:
          "Which endpoint is suitable as a health check?",
        options: ["/delete-all", "/health", "/admin"],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Monitoring & Logs",
        text:
          "Centralized logs and metrics help you see errors, response times and resource usage in one place.",
      },
      {
        type: "connect_flow",
        title: "Typical Request Flow",
        nodes: [
          "User device",
          "DNS resolves domain",
          "Load balancer",
          "App server",
          "Database",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "story",
        title: "Your App is One Link Away",
        text:
          "Now you simply send a URL. Anyone, anywhere can open your project without any setup. That’s real-world impact.",
      },
    ],
  },

  Networking: {
    title: "Follow the Data Packet",
    description:
      "Understand how a small message travels across routers and networks to reach its destination.",
    interest: "Networking",
    steps: [
      {
        type: "story",
        title: "Sending a Simple Message",
        text:
          "You send 'Hi' to a friend across the country. It looks instant, but behind the scenes, packets travel a long path.",
      },
      {
        type: "learn_card",
        title: "Layered Communication",
        text:
          "The OSI model breaks networking into layers so each has a focused job: Application, Transport, Network, Data Link, Physical.",
      },
      {
        type: "mcq",
        title: "Reliable Protocol Choice",
        prompt:
          "Which protocol is commonly used for reliable web traffic?",
        options: ["UDP", "TCP", "ICMP"],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "IP & Routing",
        text:
          "Each device gets an IP address. Routers read destination IP to choose the next best hop until the packet reaches its target.",
      },
      {
        type: "connect_flow",
        title: "Packet Journey",
        nodes: [
          "Your laptop",
          "Wi-Fi router",
          "ISP network",
          "Internet backbone",
          "Destination server",
        ],
        correctPath: [0, 1, 2, 3, 4],
      },
      {
        type: "learn_card",
        title: "Ports & Services",
        text:
          "Ports distinguish different services on the same machine: 80/443 for web, 22 for SSH, etc.",
      },
      {
        type: "mcq",
        title: "DNS Role",
        prompt:
          "What does DNS mainly do?",
        options: [
          "Encrypts traffic",
          "Maps domain names to IP addresses",
          "Blocks malicious sites",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Latency & Bandwidth",
        text:
          "Latency is delay, bandwidth is how much data per second. Both matter for how fast a connection feels.",
      },
      {
        type: "drag_order",
        title: "Troubleshooting No Internet",
        items: [
          "Check Wi-Fi connection",
          "Ping gateway",
          "Ping public DNS (like 8.8.8.8)",
          "Check DNS or ISP issues",
        ],
        correctOrder: [0, 1, 2, 3],
      },
      {
        type: "story",
        title: "Invisible Highways",
        text:
          "You start visualizing the internet as a global network of routers and links, carrying tiny packets everywhere in milliseconds.",
      },
    ],
  },

  "DSA & Problem Solving": {
    title: "Think Like an Algorithm",
    description:
      "Break problems into steps using patterns like loops, conditions and data structures.",
    interest: "DSA & Problem Solving",
    steps: [
      {
        type: "story",
        title: "Searching for a Book",
        text:
          "You need to find a specific book in a sorted shelf with hundreds of books. Scanning one by one is slow.",
      },
      {
        type: "learn_card",
        title: "Why Algorithms Matter",
        text:
          "The same task can be done in different ways. A better algorithm saves time and resources at scale.",
      },
      {
        type: "mcq",
        title: "Search Strategy in Sorted List",
        prompt:
          "Which algorithm is better than linear search for sorted data?",
        options: ["Binary search", "Brute-force search", "Random guess"],
        correctIndex: 0,
      },
      {
        type: "learn_card",
        title: "Big-O Notation in One Line",
        text:
          "Big-O describes how the running time grows with input size. O(log n) is faster than O(n) for large n.",
      },
      {
        type: "code_blocks",
        title: "Binary Search Pseudocode",
        language: "python",
        blocks: [
          "low = 0",
          "high = len(arr) - 1",
          "while low <= high:",
          "    mid = (low + high) // 2",
          "    if arr[mid] == target: return mid",
          "    elif arr[mid] < target: low = mid + 1",
          "    else: high = mid - 1",
        ],
        correctOrder: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        type: "learn_card",
        title: "Data Structures as Tools",
        text:
          "Arrays, stacks, queues, linked lists, trees and graphs each fit different problem types.",
      },
      {
        type: "mcq",
        title: "Use Case of Stack",
        prompt:
          "Which scenario fits a stack (LIFO) best?",
        options: [
          "Serving people in a queue",
          "Undo operations in an editor",
          "Storing students in alphabetical order",
        ],
        correctIndex: 1,
      },
      {
        type: "learn_card",
        title: "Dry Run to Debug",
        text:
          "Walking through your algorithm with sample inputs line by line helps catch logical errors.",
      },
      {
        type: "drag_order",
        title: "Approach to Solve a Coding Problem",
        items: [
          "Read problem carefully",
          "Identify inputs & outputs",
          "Think of simple examples",
          "Design algorithm & data structures",
          "Code & test with edge cases",
        ],
        correctOrder: [0, 1, 2, 3, 4],
      },
      {
        type: "story",
        title: "From Intuition to Logic",
        text:
          "You start seeing real-world tasks as algorithms – steps, decisions, loops. That mindset makes you a stronger problem solver.",
      },
    ],
  },
};

export default missions;
