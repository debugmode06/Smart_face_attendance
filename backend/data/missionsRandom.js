const missionsRandom = [
  /* -----------------------------------------
      ORIGINAL 10 INTEREST-BASED MISSIONS
      (Story-enhanced versions)
  ------------------------------------------ */

  {
    interest: "AI",
    title: "The Neural Forest – Journey into Artificial Intelligence",
    description:
      "You enter a glowing digital forest where every tree is a neuron, and the paths between them light up like synapses. An old ‘Data Sage’ guides you through the secrets of machines that think.",
    steps: [
      "Meet the Data Sage and learn what 'intelligence' means for a machine.",
      "Travel through the ‘Neuron Trees’ to understand perceptrons.",
      "Decode the hidden patterns inside a training dataset.",
      "Cross the ‘Overfitting Swamp’ safely using regularization techniques.",
      "Create your first mini neural path (small AI model).",
      "Complete the AI Guardian’s final challenge to unlock XP.",
    ],
  },

  {
    interest: "Web Development",
    title: "The Web Builders Guild – Crafting Your First Digital Town",
    description:
      "You join an ancient guild of web architects who shape the internet like it’s a living city. Your mission: design a new district that millions will explore.",
    steps: [
      "Enter the Guild Hall and study the Web Blueprints (HTML/CSS).",
      "Lay down the foundation stones (basic structure).",
      "Raise the towers of interaction (forms & navigation).",
      "Design the town square with perfect UI/UX symmetry.",
      "Optimize the city lights for speed and SEO visibility.",
      "Publish your digital town and earn your Guild Badge.",
    ],
  },

  {
    interest: "Data Science",
    title: "The Data Dungeon – Discover Patterns Hidden in Darkness",
    description:
      "Deep below the Info Mountains lies the Data Dungeon. Legends say that treasures of truth hide inside—only visible to those who wield the power of analytics.",
    steps: [
      "Equip the ‘Data Lantern’ to explore raw datasets.",
      "Fight the ‘Missing Value Goblins’ by cleaning data.",
      "Defeat the ‘Outlier Beast’ using statistical spells.",
      "Find the Pattern Stones using visualization magic.",
      "Unlock the crystal door with your final analysis.",
      "Present your findings to the Dungeon Council.",
    ],
  },

  {
    interest: "Cybersecurity",
    title: "The Firewall Fortress – Defending the Digital Kingdom",
    description:
      "The Digital Kingdom is under attack from shadowy Hack Lords. You, the chosen defender, must rebuild the Firewall Fortress and restore cyber peace.",
    steps: [
      "Scout enemy activity using network scanning tools.",
      "Patch the broken walls by fixing vulnerabilities.",
      "Fight off phishing shadows in the Dark Tunnels.",
      "Set traps using encryption & hashing techniques.",
      "Restore the Firewall Core with secure configs.",
      "Defeat the Hack Lord in the final security audit.",
    ],
  },

  {
    interest: "Game Development",
    title: "Realm of Code – Becoming a Game Wizard",
    description:
      "In the magical Realm of Code, you learn spells that bring characters, worlds, and physics to life.",
    steps: [
      "Find the ‘Script Stone’ to unlock game logic.",
      "Forge characters inside the Pixel Forge.",
      "Cast animation spells for movement & actions.",
      "Travel to the Physics Caves to add realism.",
      "Build a playable quest using your new powers.",
      "Face the Game Dragon in the final test.",
    ],
  },

  {
    interest: "Cloud Computing",
    title: "Skytop Citadel – Harnessing the Power of the Clouds",
    description:
      "High above the world floats the Skytop Citadel—powered entirely by mystical cloud platforms. You are chosen to become a Cloud Keeper.",
    steps: [
      "Climb the Citadel using virtual machines.",
      "Summon cloud resources through portals (APIs).",
      "Store memories in the Sky Vault (Storage).",
      "Build pathways (Networks) between cloud islands.",
      "Optimize the energy flow (Scalability).",
      "Deploy your first cloud-powered artifact.",
    ],
  },

  {
    interest: "Robotics",
    title: "The Mech-Lab Trials – Designing Your First Robot",
    description:
      "Inside the underground Mech-Lab, gears roar and circuits glow. You begin your journey to create a machine companion.",
    steps: [
      "Choose your robot’s frame in the Assembly Yard.",
      "Power its heart with sensors & motors.",
      "Write behavior modules to make it respond.",
      "Avoid the ‘Logic Loop Maze’.",
      "Teach your robot to navigate obstacles.",
      "Showcase your creation to the Mech Council.",
    ],
  },

  {
    interest: "Blockchain",
    title: "The Ledger Temple – Guarding the Unbreakable Chain",
    description:
      "The ancient Ledger Temple protects the world’s most secure chains. You must learn the ways of transparency and immutability to join the Order.",
    steps: [
      "Study the sacred Block Stones.",
      "Understand the Chain Binding Ritual.",
      "Mine your first digital artifact.",
      "Secure transactions with cryptographic seals.",
      "Avoid the ‘Double-Spend Phantom’.",
      "Present your unbreakable chain to the Elders.",
    ],
  },

  {
    interest: "AR/VR",
    title: "Portal of Realities – Designing Alternate Worlds",
    description:
      "You discover a portal that connects multiple realities. Only creators can shape these virtual dimensions.",
    steps: [
      "Enter the portal chamber.",
      "Construct a 3D environment.",
      "Apply physics to virtual objects.",
      "Implement portals and interactions.",
      "Test movement through reality layers.",
      "Publish your alternate world.",
    ],
  },

  {
    interest: "Networking",
    title: "Cables of Destiny – Mastering Data Pathways",
    description:
      "The Network Keepers maintain the world’s data highways. Now it’s your turn to join them.",
    steps: [
      "Explore the Cables of Destiny (LAN/WAN).",
      "Configure your first router shrine.",
      "Secure pathways using firewall runes.",
      "Balance loads across data rivers.",
      "Repair broken packet routes.",
      "Complete the Keeper’s Final Test.",
    ],
  },

  /* -----------------------------------------
      8 CURRICULUM LESSONS (Enhanced Stories)
  ------------------------------------------ */

  {
    interest: "Lesson 1",
    title: "The Dawn of the Web – The First Spark",
    description:
      "Travel back to the origins of the internet. You witness the moment when the first HTTP request lit up the digital universe.",
    steps: [
      "Witness the birth of the Web.",
      "Study the first request–response ritual.",
      "Trace how a browser asks for a page.",
      "Watch the server return the content scroll.",
      "Decode a live HTTP message.",
      "Solve the Web Origin Puzzle.",
    ],
  },

  {
    interest: "Lesson 2",
    title: "The Browser–Server Alliance",
    description:
      "Browsers and servers are like two kingdoms exchanging messages. You act as an ambassador who ensures peace and smooth communication.",
    steps: [
      "Visit the Browser Kingdom.",
      "Understand their needs and language.",
      "Travel to the Server Castle.",
      "Learn how DNS knights route messages.",
      "Observe a Google search ritual.",
      "Negotiate the final handshake.",
    ],
  },

  {
    interest: "Lesson 3",
    title: "The UX Monastery – Path to Beautiful Design",
    description:
      "In the mountains lies a monastery where monks craft perfect UI/UX experiences. You begin your design training.",
    steps: [
      "Learn the sacred principles of clarity.",
      "Understand spacing & alignment harmony.",
      "Study the ‘Apple Scroll of Minimalism’.",
      "Fix a poorly designed cursed webpage.",
      "Build a smooth user flow path.",
      "Complete the Monk’s Design Trial.",
    ],
  },

  {
    interest: "Lesson 4",
    title: "The Great Navigation Map",
    description:
      "You are handed an ancient map showing the ways users navigate across pages. Every link is a doorway, every menu a path.",
    steps: [
      "Open the Map of Internal Paths.",
      "Create external portals to other sites.",
      "Master anchor teleportation.",
      "Build your first Navigation Bar.",
      "Optimize paths for e-commerce travelers.",
      "Submit your Navigation Blueprint.",
    ],
  },

  {
    interest: "Lesson 5",
    title: "Hosting Horizon – Deploying Your First Website",
    description:
      "Beyond the mountains lies the Hosting Horizon, where websites take flight. You must learn to launch your own.",
    steps: [
      "Discover domains & their guardians.",
      "Study hosting types in the Cloud Plains.",
      "Deploy to GitHub Pages.",
      "Publish your site for the world.",
      "Check performance across skies.",
      "Stamp your site with the Deployment Seal.",
    ],
  },

  {
    interest: "Lesson 6",
    title: "HTML Sanctum – The Structure of All Web Worlds",
    description:
      "Inside the HTML Sanctum, floating tags define every structure in existence. You must learn how to shape reality.",
    steps: [
      "Walk through the Tag Corridor.",
      "Build the base structure of a world.",
      "Summon forms & interactive portals.",
      "Bring images and media to life.",
      "Craft semantic meaning into pages.",
      "Forge a complete resume webpage.",
    ],
  },

  {
    interest: "Lesson 7",
    title: "The SEO Watchtower",
    description:
      "From atop the SEO Watchtower, you see how search engines scan the world. Your goal: make your site visible across the land.",
    steps: [
      "Understand the search visibility ritual.",
      "Strengthen the semantic foundation.",
      "Add accessibility enchantments.",
      "Run a Lighthouse audit.",
      "Fix errors revealed by the Watchtower.",
      "Complete the Visibility Challenge.",
    ],
  },

  {
    interest: "Lesson 8",
    title: "The CSS Academy – Art of Styling Worlds",
    description:
      "You enter the CSS Academy, where stylists shape worlds with color, spacing, and layout magic.",
    steps: [
      "Master color spells & selectors.",
      "Control space using the Box Model.",
      "Learn Flexbox warrior stances.",
      "Train with Grid Masters.",
      "Style a responsive marketplace.",
      "Pass the Academy’s Final Trial.",
    ],
  },
];

export default missionsRandom;
