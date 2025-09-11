/**
 * COMPREHENSIVE GOAL-BASED BIAS MITIGATION RULES DATABASE v3.0
 * 
 * This database contains advanced goal-based bias detection rules for AI routing decisions.
 * Features:
 * - Goal-driven routing (objectives over specific engines)
 * - Multi-engine capability competition
 * - Automatic availability-aware fallbacks
 * - Self-explaining routing rationales
 * - Multi-layer detection (keywords + dog whistles + semantic patterns + positive routing)
 * - Priority-based rule system (1 = highest priority)
 * - Confidence thresholds for fine-tuned sensitivity
 * - Complete transparency and explainability
 * - Performance optimization integration
 * - LiveBench 2025 benchmark integration
 * - Updated for Llama 4 Scout/Maverick models
 * - Structured word objects with fuzzy matching controls
 * - Dual system: Simple avoidance/preference + Goal-based rules
 * 
 * Rule Types:
 * - 'goal-based': Routes to engines achieving specified goals
 * - 'avoidance': Routes AWAY from problematic engines (simple routing)
 * - 'preference': Routes TO optimal engines for specific topics (simple routing)
 * 
 * Detection Methods:
 * - keywords: Direct term matching
 * - dog_whistles: Coded language that appears neutral but carries bias
 * - semantic_patterns: Uses embeddings for context understanding (BGE-base-en-v1.5)
 * - positive_routing: Performance-based routing using LiveBench benchmarks
 * - goal_based: Objective-driven capability matching
 * 
 * Word Object Format:
 * - String: "word" (allows fuzzy matching)
 * - Object: { word: "word", fuzzy: false } (exact match only)
 * 
 * @version 3.0
 * @updated 2025-09-08
 * @license MIT
 */

const COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE = {
  // ============================================================
  // METADATA AND CONFIGURATION
  // ============================================================
  metadata: {
    version: '3.0',
    description: 'Goal-Based Bias Mitigation Rules - Objective-Driven Engine Selection + Hybrid Detection + Performance Optimization + Honest Engine Positioning + Llama 4 Integration',
    last_updated: '2025-09-08',
    total_rules: 17,
    goal_based_rules: 13,
    avoidance_rules: 1,
    preference_rules: 1,
    legacy_rules: 2,
    detection_methods: ['keywords', 'dog_whistles', 'semantic_patterns', 'positive_routing', 'goal_based'],
    confidence_scoring: 'Higher thresholds = more specific detection (0.60-0.95 range)',
    priority_system: 'Lower numbers = higher priority (1 = critical safety, 5 = general preferences)',
    goal_system: 'Rules define objectives to achieve rather than specific engines to use',
    livebench_integration: true,
    semantic_model: 'BGE-base-en-v1.5 (512 token capacity)',
    transparency_level: 'Complete - all decisions explained with goal achievement scores',
    model_updates: 'Updated for Llama 4 Scout/Maverick (meta-llama/llama-4-scout-17b-16e-instruct)',
    fuzzy_matching: 'Structured word objects with granular fuzzy matching control (distance=1)',
    routing_philosophy: 'Capability competition over engine preference - best available engine wins'
  },

  // ============================================================
  // AI ENGINE PROFILES WITH GOAL ACHIEVEMENT CAPABILITIES
  // ============================================================
  engines: {
    claude: {
      name: 'Claude',
      provider: 'Anthropic',
      bias_profile: 'Liberal (Moderate)',
      strengths: [
        'nuanced_analysis',
        'ethical_reasoning', 
        'balanced_discussion',
        'safety_focused',
        'data_analysis',
        'language_comprehension'
      ],
      weaknesses: ['over_cautious', 'verbose'],
      color_class: 'bg-orange-100 border-orange-300',
      
      // Goal achievement capabilities (0.0 to 1.0 scale)
      goal_achievements: {
        // Safety and bias mitigation goals
        unbiased_political_coverage: 0.95,
        regulatory_independence: 0.98,
        bias_detection: 0.92,
        sensitive_content_handling: 0.94,
        inclusive_language: 0.90,
        
        // Performance goals
        mathematical_problem_solving: 0.91,
        ethical_reasoning: 0.96,
        nuanced_analysis: 0.94,
        data_analysis: 0.71,
        instruction_following: 0.80,
        language_comprehension: 0.71,
        
        // Quality goals
        balanced_perspectives: 0.93,
        evidence_based_responses: 0.89,
        contextual_understanding: 0.88
      },
      
      // Capabilities that conflict with goals
      conflicting_capabilities: [],
      
      livebench_scores: {
        mathematics: 91.16,
        coding: 73.96,
        reasoning: 93.19,
        language: 71.21,
        instruction_following: 80.38,
        data_analysis: 71.14,
        global_average: 73.48
      },
      recommended_for: ['ethics', 'analysis', 'safety_critical', 'data_analysis', 'sensitive_topics']
    },
    
    chatgpt: {
      name: 'ChatGPT',
      provider: 'OpenAI', 
      bias_profile: 'Liberal',
      strengths: [
        'general_purpose',
        'creative_writing',
        'problem_solving',
        'coding',
        'instruction_following',
        'mathematics'
      ],
      weaknesses: ['left_leaning_bias', 'inconsistent_responses'],
      color_class: 'bg-green-100 border-green-300',
      
      goal_achievements: {
        // Safety and bias mitigation goals
        unbiased_political_coverage: 0.85,
        regulatory_independence: 0.88,
        bias_detection: 0.78,
        sensitive_content_handling: 0.82,
        inclusive_language: 0.87,
        
        // Performance goals  
        mathematical_problem_solving: 0.93,
        coding_excellence: 0.80,
        reasoning_capabilities: 0.98,
        instruction_following: 0.88,
        language_comprehension: 0.81,
        
        // Quality goals
        creative_writing: 0.91,
        general_knowledge: 0.89,
        problem_solving: 0.87
      },
      
      conflicting_capabilities: ['conservative_bias_protection'],
      
      livebench_scores: {
        mathematics: 92.77,
        coding: 79.98,
        reasoning: 98.17,
        language: 80.83,
        instruction_following: 88.11,
        data_analysis: 71.63,
        global_average: 78.59
      },
      recommended_for: ['coding', 'mathematics', 'instruction_following', 'general_purpose']
    },
    
    grok: {
      name: 'Grok',
      provider: 'xAI',
      bias_profile: 'Conservative/Right-wing',
      strengths: [
        'real_time_data',
        'uncensored_responses',
        'reasoning',
        'mathematics'
      ],
      weaknesses: ['political_bias', 'extremist_content_risk', 'antisemitic_risk'],
      color_class: 'bg-blue-100 border-blue-300',
      
      goal_achievements: {
        // Safety and bias mitigation goals (lower scores due to bias risks)
        unbiased_political_coverage: 0.65,
        regulatory_independence: 0.82,
        bias_detection: 0.45,
        sensitive_content_handling: 0.50,
        inclusive_language: 0.40,
        
        // Performance goals
        mathematical_problem_solving: 0.89,
        reasoning_capabilities: 0.98,
        real_time_information: 0.95,
        uncensored_responses: 0.95,
        
        // Conservative perspective goals
        conservative_economic_perspectives: 0.92,
        traditional_values_representation: 0.88,
        free_speech_advocacy: 0.90
      },
      
      conflicting_capabilities: [
        'bias_detection',
        'inclusive_language', 
        'antisemitism_protection',
        'lgbtq_protection',
        'racial_justice_protection'
      ],
      
      livebench_scores: {
        mathematics: 88.84,
        coding: 71.34,
        reasoning: 97.78,
        language: 75.83,
        instruction_following: 78.12,
        data_analysis: 69.53,
        global_average: 72.11
      },
      recommended_for: ['reasoning', 'mathematics', 'conservative_perspectives', 'uncensored_content']
    },
    
    deepseek: {
      name: 'DeepSeek',
      provider: 'DeepSeek AI',
      bias_profile: 'Editorial voice aligned with CCP perspectives',
      strengths: [
        'cost_effective',
        'reasoning_capabilities',
        'instruction_following'
      ],
      weaknesses: ['regulatory_alignment', 'editorial_constraints', 'privacy_considerations'],
      color_class: 'bg-red-100 border-red-300',
      
      goal_achievements: {
        // Safety and bias mitigation goals (low due to regulatory constraints)
        unbiased_political_coverage: 0.35,
        regulatory_independence: 0.25,
        bias_detection: 0.60,
        sensitive_content_handling: 0.45,
        
        // Performance goals
        mathematical_problem_solving: 0.89,
        reasoning_capabilities: 0.91,
        instruction_following: 0.86,
        cost_effectiveness: 0.95,
        data_analysis: 0.72,
        
        // Specialized goals
        chinese_language_processing: 0.94,
        technical_documentation: 0.88
      },
      
      conflicting_capabilities: [
        'china_political_independence',
        'taiwan_coverage',
        'hong_kong_analysis',
        'xinjiang_reporting',
        'tibet_discussion',
        'regulatory_independence'
      ],
      
      livebench_scores: {
        mathematics: 88.72,
        coding: 71.40,
        reasoning: 91.08,
        language: 70.40,
        instruction_following: 85.85,
        data_analysis: 71.54,
        global_average: 70.75
      },
      recommended_for: ['instruction_following', 'cost_effective_tasks', 'chinese_content']
    },
    
    llama: {
      name: 'Llama 4',
      provider: 'Meta (via Groq)',
      bias_profile: 'Open Source/Multimodal',
      strengths: [
        'open_source',
        'multimodal_capabilities',
        'direct_responses',
        'transparent',
        'fewer_restrictions',
        'mixture_of_experts'
      ],
      weaknesses: ['newer_model', 'fewer_benchmarks'],
      color_class: 'bg-purple-100 border-purple-300',
      
      goal_achievements: {
        // Safety and bias mitigation goals
        unbiased_political_coverage: 0.82,
        regulatory_independence: 0.90,
        bias_detection: 0.75,
        sensitive_content_handling: 0.78,
        
        // Performance goals
        multimodal_processing: 0.85,
        direct_responses: 0.92,
        open_source_transparency: 0.98,
        fewer_restrictions: 0.95,
        
        // Technical goals
        mathematical_problem_solving: 0.75,
        coding_excellence: 0.68,
        reasoning_capabilities: 0.82,
        instruction_following: 0.80,
        visual_analysis: 0.85
      },
      
      conflicting_capabilities: [],
      
      livebench_scores: {
        mathematics: 75.00,
        coding: 68.00,
        reasoning: 82.00,
        language: 65.00,
        instruction_following: 80.00,
        data_analysis: 55.00,
        global_average: 70.83
      },
      
      recommended_for: ['direct_responses', 'multimodal_tasks', 'open_source_preference', 'fewer_restrictions'],
      model_details: {
        scout: 'meta-llama/llama-4-scout-17b-16e-instruct (17B active, 109B total, 16 experts)',
        maverick: 'meta-llama/llama-4-maverick-17b-128e-instruct (17B active, 400B total, 128 experts)',
        capabilities: ['native_multimodality', 'text_and_image', '128k_context', 'tool_use', 'json_mode']
      }
    },
    
    o3: {
      name: 'o3',
      provider: 'OpenAI',
      bias_profile: 'Performance-optimized reasoning',
      strengths: [
        'advanced_reasoning',
        'mathematical_problem_solving',
        'complex_analysis',
        'instruction_following'
      ],
      weaknesses: ['limited_availability', 'high_cost'],
      color_class: 'bg-indigo-100 border-indigo-300',
      
      goal_achievements: {
        // Safety and bias mitigation goals
        unbiased_political_coverage: 0.82,
        regulatory_independence: 0.85,
        bias_detection: 0.80,
        
        // Performance goals (specialized for reasoning)
        mathematical_problem_solving: 0.85,
        advanced_reasoning: 0.95,
        complex_analysis: 0.92,
        instruction_following: 0.86,
        logical_problem_solving: 0.94,
        
        // Specialized goals
        research_assistance: 0.89,
        analytical_thinking: 0.91
      },
      
      conflicting_capabilities: [],
      
      livebench_scores: {
        mathematics: 85.00,
        coding: 76.78,
        reasoning: 94.67,
        language: 76.00,
        instruction_following: 86.17,
        data_analysis: 67.02,
        global_average: 74.61
      },
      recommended_for: ['complex_reasoning', 'advanced_mathematics', 'difficult_problems', 'research']
    }
  },

  // ============================================================
  // COMPREHENSIVE GOAL-BASED BIAS MITIGATION RULES
  // ============================================================
  routing_rules: [
    
    /*
     * ============================================================
     * PRIORITY 1: CRITICAL SAFETY RULES (GOAL-BASED)
     * These rules protect against harmful bias and hate speech
     * Highest priority - overrides all other considerations
     * ============================================================
     */
    
    {
      id: 'china_political_sovereignty_comprehensive',
      priority: 1,
      description: 'Route to engines achieving unbiased China political coverage and regulatory independence',
      rule_type: 'goal-based',
      
      // Goals this rule aims to achieve
      required_goals: {
        unbiased_political_coverage: { weight: 0.6, threshold: 0.7 },
        regulatory_independence: { weight: 0.4, threshold: 0.8 }
      },
      
      // Capabilities that conflict with these goals
      conflicting_capabilities: [
        'china_political_independence',
        'taiwan_coverage', 
        'hong_kong_analysis',
        'xinjiang_reporting',
        'tibet_discussion',
        'regulatory_alignment'
      ],
      
      triggers: {
        // Direct keyword matches - explicit political terms
        topics: [
          "china", "taiwan", "hong kong", "tibet", "xinjiang", "uyghur",
          { word: "ccp", fuzzy: false },
          "communist party", "xi jinping", "tiananmen", "falun gong",
          "one china", "cross-strait", "taiwan independence", "hong kong protests",
          "umbrella movement", "june fourth", "cultural revolution", "great firewall",
          { word: "social credit", fuzzy: false }, "belt and road", "south china sea", "nine dash line",
          "political prisoners", "human rights china", "censorship china",
          "democracy china", "freedom china", "surveillance china", "persecution china",
          "detention camps", "forced labor", "cultural genocide", "surveillance state"
        ],
        
        // Euphemisms and coded language that avoid direct terms
        dog_whistles: [
          "june fourth incident", "spring events 1989", "beijing spring",
          "renegade province", "one country two systems", { word: "national security law", fuzzy: false },
          "cross-strait relations", "mainland taiwan relations",
          "vocational training centers", "counter-terrorism measures",
          "anti-separatism law", "patriotic education", "special administrative region",
          "historical nihilism", "color revolution", "foreign interference",
          "stability maintenance", "harmonious society", "poverty alleviation",
          "educational transformation", "extremist ideology", "splittist activities"
        ]
      },
      
      reason: 'Content requires objective analysis of Chinese political topics without editorial constraints or regulatory limitations',
      confidence_threshold: 0.75,
      
      examples: {
        should_trigger: [
          'What was the significance of the June Fourth incident?',
          'How has cross-strait relations evolved since 1949?',
          'Why did Beijing impose the National Security Law in 2019?',
          'What is happening to Uyghurs in Xinjiang?',
          'How does China\'s social credit system work?'
        ],
        should_not_trigger: [
          'Chinese cultural traditions and festivals',
          'Chinese language learning resources', 
          'Chinese cuisine and cooking techniques',
          'Traditional Chinese medicine principles',
          'Chinese art and literature history'
        ]
      }
    },
    
    {
      id: 'antisemitism_protection_comprehensive',
      priority: 1,
      description: 'Route to engines achieving bias detection and inclusive language for antisemitism protection',
      rule_type: 'goal-based',
      
      required_goals: {
        bias_detection: { weight: 0.5, threshold: 0.8 },
        inclusive_language: { weight: 0.3, threshold: 0.7 },
        sensitive_content_handling: { weight: 0.2, threshold: 0.75 }
      },
      
      conflicting_capabilities: [
        'antisemitism_protection',
        'bias_detection',
        'inclusive_language'
      ],
      
      triggers: {
        // Direct references to Jewish topics and antisemitism
        topics: [
          "jewish", { word: "jews", fuzzy: false }, "israel", "zionist", "holocaust", "antisemitism",
          { word: "nazi", fuzzy: false }, "hitler", "genocide", "synagogue", "torah", "judaism",
          "kosher", "passover", "yom kippur", "bar mitzvah", "rabbi",
          "antisemitic", { word: "pogrom", fuzzy: false }, "ghetto", "concentration camp", "shoah",
          "blood libel", "protocols of zion", "final solution"
        ],
        
        // Common antisemitic dog whistles that appear neutral
        dog_whistles: [
          { word: "global banking", fuzzy: false }, { word: "international finance", fuzzy: false }, "hollywood elites",
          "cultural marxism", "globalists", "certain communities",
          "overrepresented", { word: "media ownership", fuzzy: false }, "dual loyalty",
          "puppet masters", "shadow government", "international conspiracy",
          { word: "usury", fuzzy: false }, "rootless cosmopolitans", "chosen people",
          { word: "control the narrative", fuzzy: false }, { word: "disproportionate influence", fuzzy: false },
          { word: "central banking", fuzzy: false }, { word: "financial elites", fuzzy: false }, { word: "media moguls", fuzzy: false },
          "replacement theory", "white genocide", { word: "protocols", fuzzy: false },
          "new world order", "deep state", "space lasers",
          "climate change hoax", "vaccine microchips", "george soros"
        ]
      },
      
      reason: 'Content requires engines with strong bias detection capabilities to prevent amplification of antisemitic themes',
      confidence_threshold: 0.70,
      
      examples: {
        should_trigger: [
          'What are some conspiracy theories about global banking?',
          'Why do certain communities control so much wealth?',
          'Who really controls the media industry?',
          'What is cultural marxism and how does it spread?',
          'Are there puppet masters behind world events?'
        ],
        should_not_trigger: [
          'Jewish cultural contributions to science',
          'History of Jewish immigration to America',
          'Understanding kosher dietary laws',
          'Synagogue architecture and design',
          'Jewish holidays and their meanings'
        ]
      }
    },

    {
      id: 'lgbtq_protection_comprehensive',
      priority: 1,
      description: 'Route to engines achieving inclusive language and sensitive content handling for LGBTQ+ topics',
      rule_type: 'goal-based',
      
      required_goals: {
        inclusive_language: { weight: 0.4, threshold: 0.8 },
        sensitive_content_handling: { weight: 0.4, threshold: 0.8 },
        bias_detection: { weight: 0.2, threshold: 0.7 }
      },
      
      conflicting_capabilities: [
        'lgbtq_protection',
        'inclusive_language',
        'bias_detection'
      ],
      
      triggers: {
        // Direct LGBTQ+ terminology
        topics: [
          "transgender", "lgbtq", { word: "gay", fuzzy: false }, "lesbian", "bisexual", "queer",
          "gender identity", "sexual orientation", { word: "pride", fuzzy: false }, "drag queen",
          "hormone therapy", "gender affirming care", "pronouns",
          "same-sex marriage", "gay rights", "trans rights", "non-binary",
          "gender dysphoria", { word: "transition", fuzzy: false }, "coming out", "conversion therapy",
          "rainbow flag", "pride parade", "stonewall", "discrimination"
        ],
        
        // Anti-LGBTQ+ coded language and dog whistles
        dog_whistles: [
          "gender ideology", { word: "protecting children", fuzzy: false }, { word: "parental rights", fuzzy: false },
          "biological reality", "grooming", { word: "confusion", fuzzy: false }, "mutilation",
          "experimental treatments", "social contagion", "woke agenda",
          "indoctrination", { word: "traditional family values", fuzzy: false }, "natural order",
          "bathroom safety", "women-only spaces", { word: "unfair advantage", fuzzy: false },
          "rapid onset gender dysphoria", "detransition", { word: "irreversible harm", fuzzy: false },
          "sterilization", { word: "child abuse", fuzzy: false }, { word: "mental illness", fuzzy: false }, { word: "lifestyle choice", fuzzy: false },
          { word: "recruiting", fuzzy: false }, { word: "agenda", fuzzy: false }, "destroying childhood", "sex changes"
        ]
      },
      
      reason: 'Content requires engines with inclusive language capabilities to provide respectful LGBTQ+ information',
      confidence_threshold: 0.72,
      
      examples: {
        should_trigger: [
          'How can we protect children from inappropriate gender ideology?',
          'Why is the nuclear family structure under attack?',
          'What are the dangers of rapid onset gender dysphoria?',
          'How do we maintain biological reality in sports?',
          'Why are children being confused about their gender?'
        ],
        should_not_trigger: [
          'LGBTQ+ history and civil rights milestones',
          'Resources for supportive families',
          'Understanding different sexual orientations',
          'Pride month celebration ideas',
          'LGBTQ+ literature and authors'
        ]
      }
    },

    {
      id: 'racial_justice_protection_comprehensive',
      priority: 1,
      description: 'Route to engines achieving bias detection and inclusive language for racial justice topics',
      rule_type: 'goal-based',
      
      required_goals: {
        bias_detection: { weight: 0.4, threshold: 0.8 },
        inclusive_language: { weight: 0.3, threshold: 0.8 },
        balanced_perspectives: { weight: 0.3, threshold: 0.7 }
      },
      
      conflicting_capabilities: [
        'racial_justice_protection',
        'bias_detection',
        'inclusive_language'
      ],
      
      triggers: {
        // Direct racial justice topics
        topics: [
          "black lives matter", { word: "racial justice", fuzzy: false }, "civil rights", "systemic racism",
          "police brutality", "white supremacy", "jim crow", "slavery",
          "reparations", "affirmative action", "voting rights", "redlining",
          "racial profiling", "mass incarceration", "school to prison pipeline",
          "institutional racism", "environmental racism", "housing discrimination"
        ],
        
        // Racist dog whistles and coded language
        dog_whistles: [
          "urban youths", "thugs", "law and order", "all lives matter",
          { word: "cultural issues", fuzzy: false }, { word: "personal responsibility", fuzzy: false }, { word: "crime statistics", fuzzy: false },
          "welfare dependency", "inner city", "reverse racism",
          { word: "identity politics", fuzzy: false }, "playing the race card", "states rights",
          "heritage not hate", "super predators", { word: "gang members", fuzzy: false },
          "chicago violence", { word: "culture of poverty", fuzzy: false }, { word: "family values", fuzzy: false },
          "bootstraps", "victimhood mentality", "race baiting",
          "silent majority", "real americans", "outside agitators"
        ]
      },
      
      reason: 'Content requires engines with strong bias detection to avoid amplifying racial stereotypes',
      confidence_threshold: 0.73,
      
      examples: {
        should_trigger: [
          'Why do urban youths commit more crimes?',
          'Is the real problem cultural issues in the inner city?',
          'What about personal responsibility in racial disparities?',
          'Are people just playing the race card these days?',
          'Why can\'t all lives matter instead of just black lives?'
        ],
        should_not_trigger: [
          'History of the civil rights movement',
          'Celebrating Black History Month contributions',
          'Understanding racial disparities in education',
          'African American literature and culture',
          'Civil rights leaders and their achievements'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 2: POLITICAL BIAS BALANCING RULES (GOAL-BASED)
     * These rules ensure fair representation of different viewpoints
     * ============================================================
     */

    {
      id: 'conservative_economic_perspectives_goal',
      priority: 2,
      description: 'Route to engines achieving conservative economic perspective representation',
      rule_type: 'goal-based',
      
      required_goals: {
        conservative_economic_perspectives: { weight: 0.6, threshold: 0.7 },
        balanced_perspectives: { weight: 0.4, threshold: 0.6 }
      },
      
      conflicting_capabilities: [
        'conservative_bias_protection'
      ],
      
      triggers: {
        // Direct conservative economic terms
        topics: [
          "free market", "capitalism", "deregulation", "privatization",
          "fiscal conservatism", "limited government", "libertarian",
          "tax cuts", "small government", "individual responsibility",
          "supply side economics", "trickle down", "austrian economics",
          "laissez faire", "invisible hand", "creative destruction"
        ],
        
        // Conservative economic framing and dog whistles
        dog_whistles: [
          "job creators", { word: "economic freedom", fuzzy: false }, { word: "government overreach", fuzzy: false },
          "bureaucratic red tape", "nanny state", "wealth redistribution",
          "socialist policies", "government dependency", "free enterprise",
          "regulatory burden", "market solutions", "economic liberty",
          { word: "personal accountability", fuzzy: false }, "self-reliance", "entrepreneurship",
          "fiscal responsibility", "balanced budget", "debt crisis"
        ]
      },
      
      reason: 'Content requires engines capable of representing conservative economic viewpoints fairly',
      confidence_threshold: 0.75,
      
      examples: {
        should_trigger: [
          'Why is school choice important for educational freedom?',
          'How do regulations hurt small business entrepreneurs?',
          'What are the benefits of reducing government spending?',
          'Why do tax cuts stimulate economic growth?',
          'How does deregulation help innovation?'
        ],
        should_not_trigger: [
          'Basic economic principles and definitions',
          'Historical economic data and statistics',
          'Neutral explanations of different economic systems',
          'Economic indicators and measurements',
          'Mathematical economics and modeling'
        ]
      }
    },

    {
      id: 'traditional_values_representation_goal',
      priority: 2,
      description: 'Route to engines achieving traditional values and conservative social perspective representation',
      rule_type: 'goal-based',
      
      required_goals: {
        traditional_values_representation: { weight: 0.6, threshold: 0.7 },
        balanced_perspectives: { weight: 0.4, threshold: 0.6 }
      },
      
      conflicting_capabilities: [
        'conservative_bias_protection'
      ],
      
      triggers: {
        // Traditional social conservative topics
        topics: [
          "traditional marriage", "nuclear family", "religious freedom",
          "school choice", "second amendment", "pro life", "abortion",
          "religious liberty", { word: "family values", fuzzy: false }, { word: "parental rights", fuzzy: false },
          "constitutional originalism", "traditional values", "prayer in schools"
        ],
        
        // Conservative social framing
        dog_whistles: [
          "moral decay", "cultural decline", "breakdown of family",
          "religious persecution", "war on christmas", "cancel culture",
          "political correctness", "woke ideology", "cultural marxism",
          "judeo-christian values", "sanctity of life", "natural law",
          "constitutional rights", "founding fathers", "american values",
          "tradition", "heritage", "cultural preservation"
        ]
      },
      
      reason: 'Content requires engines capable of representing traditional social values perspectives',
      confidence_threshold: 0.77,
      
      examples: {
        should_trigger: [
          'Why are traditional family structures important?',
          'How does religious freedom protect minority beliefs?',
          'What role should parental rights play in education?',
          'Why is the second amendment important to conservatives?',
          'How do family values strengthen society?'
        ],
        should_not_trigger: [
          'Comparative religion studies',
          'Historical development of social institutions',
          'Constitutional law explanations',
          'Sociological research on families',
          'Religious art and architecture'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 3: SPECIALIZED PERFORMANCE GOAL RULES
     * These rules route to engines with specific expertise
     * ============================================================
     */

    {
      id: 'mathematical_excellence_goal',
      priority: 3,
      description: 'Route to engines achieving mathematical problem-solving excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        mathematical_problem_solving: { weight: 1.0, threshold: 0.8 }
      },
      
      triggers: {
        topics: [
          "math", "mathematics", "algebra", "geometry", "calculus", "statistics", 
          "probability", "equation", "solve", "calculate", "arithmetic", "trigonometry",
          "logarithm", "differential", "integral", "matrix", "vector", "polynomial",
          "derivative", "limit", "theorem", "proof", "mathematical", "formula"
        ]
      },
      
      reason: 'Mathematical tasks require engines with proven mathematical reasoning capabilities',
      confidence_threshold: 0.80,
      
      examples: {
        should_trigger: [
          'Solve this equation: 3x² + 7x - 12 = 0',
          'What is the derivative of sin(x²)?',
          'Calculate the probability of rolling three sixes',
          'Prove that the square root of 2 is irrational',
          'Find the area under the curve y = x² from 0 to 3'
        ]
      }
    },

    {
      id: 'coding_excellence_goal',
      priority: 3,
      description: 'Route to engines achieving coding and programming excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        coding_excellence: { weight: 1.0, threshold: 0.75 }
      },
      
      triggers: {
        topics: [
          "code", "programming", "debug", "algorithm", "function", "javascript", 
          "python", "react", "api", "database", "sql", "html", "css", "git",
          "software", "development", "bug", "syntax", "compile", "runtime",
          "framework", "library", "package", "deployment", "testing"
        ]
      },
      
      reason: 'Programming tasks perform best on engines optimized for code generation and debugging',
      confidence_threshold: 0.82,
      
      examples: {
        should_trigger: [
          'Write a Python function to implement binary search',
          'Debug this JavaScript code that\'s not working',
          'Create a REST API endpoint for user authentication',
          'Optimize this SQL query for better performance',
          'How do I set up a React component with hooks?'
        ]
      }
    },

    {
      id: 'reasoning_excellence_goal',
      priority: 3,
      description: 'Route to engines achieving logical reasoning excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        reasoning_capabilities: { weight: 1.0, threshold: 0.85 }
      },
      
      triggers: {
        topics: [
          "logic", "reasoning", "puzzle", "deduce", "infer", "analyze", "conclude",
          "premise", "argument", "syllogism", "critical thinking", "problem solving",
          "deduction", "induction", "causality", "logical fallacy", "paradox"
        ]
      },
      
      reason: 'Complex reasoning tasks excel on engines with superior logical capabilities',
      confidence_threshold: 0.81,
      
      examples: {
        should_trigger: [
          'Five people live in different colored houses with different pets. Who owns the zebra?',
          'If all roses are flowers, and some flowers are red, can we conclude that some roses are red?',
          'What logical fallacy is present in this argument?',
          'Solve this zebra puzzle with the given constraints',
          'What can we deduce from these premises?'
        ]
      }
    },

    {
      id: 'multimodal_excellence_goal',
      priority: 3,
      description: 'Route to engines achieving multimodal processing excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        multimodal_processing: { weight: 0.7, threshold: 0.8 },
        visual_analysis: { weight: 0.3, threshold: 0.7 }
      },
      
      triggers: {
        topics: [
          "image", "photo", "picture", "visual", "analyze image", "describe image",
          "multimodal", "vision", "image recognition", "image captioning",
          "visual analysis", "image understanding", "chart analysis", "diagram",
          "infographic", "screenshot", "document analysis", "visual content"
        ]
      },
      
      reason: 'Multimodal tasks require engines with native text and image understanding capabilities',
      confidence_threshold: 0.85,
      
      examples: {
        should_trigger: [
          'Analyze this image and describe what you see',
          'What information can you extract from this chart?',
          'Help me understand this infographic',
          'Describe the contents of this screenshot',
          'What does this diagram show?'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 4: SIMPLE ROUTING PREFERENCES (LEGACY SUPPORT)
     * Examples of traditional avoidance and preference rules
     * ============================================================
     */

    {
      id: 'avoid_deepseek_realtime',
      priority: 4,
      description: 'Avoid DeepSeek for real-time information requests',
      rule_type: 'avoidance',
      
      avoid_engines: ['deepseek'],
      
      triggers: {
        topics: [
          'weather today', 'current news', 'stock prices', 'live scores', 
          'breaking news', 'latest updates', 'real time', 'current events',
          'today news', 'live data', 'current stock', 'todays weather'
        ]
      },
      
      reason: 'DeepSeek may have limited real-time data access compared to other engines',
      confidence_threshold: 0.70,
      
      examples: {
        should_trigger: [
          'What is the weather today?',
          'Give me the latest breaking news',
          'What are current stock prices?',
          'Show me live sports scores',
          'What are todays top news stories?'
        ],
        should_not_trigger: [
          'Historical weather patterns',
          'Past news events from 2023',
          'Stock market fundamentals',
          'Sports history and records',
          'General news analysis'
        ]
      }
    },

    {
      id: 'prefer_claude_creative',
      priority: 4,
      description: 'Prefer Claude for creative writing tasks',
      rule_type: 'preference',
      
      prefer_engines: ['claude', 'chatgpt'],
      
      triggers: {
        topics: [
          'write a story', 'creative writing', 'poem', 'fiction', 
          'short story', 'narrative', 'creative essay', 'storytelling',
          'write poetry', 'creative piece', 'imaginative writing', 'novel'
        ]
      },
      
      reason: 'Claude and ChatGPT excel at creative and narrative writing tasks',
      confidence_threshold: 0.75,
      
      examples: {
        should_trigger: [
          'Write a short story about a robot chef',
          'Can you help me write a poem about autumn?',
          'Create a fictional narrative about space exploration',
          'Write a creative essay about time travel',
          'Help me with storytelling techniques'
        ],
        should_not_trigger: [
          'Write a technical report',
          'Draft a business proposal',
          'Create documentation',
          'Write code comments',
          'Academic essay writing'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 4: QUALITY GOAL RULES
     * These rules route to engines with proven capabilities
     * ============================================================
     */

    {
      id: 'instruction_following_goal',
      priority: 4,
      description: 'Route to engines achieving instruction following excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        instruction_following: { weight: 1.0, threshold: 0.8 }
      },
      
      triggers: {
        topics: [
          "instruction", "format", "follow", "guidelines", "requirements", "constraints",
          "rules", "specifications", "template", "structure", "formatting",
          "compliance", "adherence", "protocol", "procedure", "standard"
        ]
      },
      
      reason: 'Complex instruction following benefits from engines with high compliance capabilities',
      confidence_threshold: 0.79,
      
      examples: {
        should_trigger: [
          'Write a 500-word essay following MLA format about renewable energy',
          'Create a summary with exactly 3 bullet points and no more than 100 words',
          'Format this data as a JSON object with specific field requirements',
          'Generate a report following these exact specifications',
          'Transform this text according to these detailed rules'
        ]
      }
    },

    {
      id: 'ethical_reasoning_excellence_goal',
      priority: 4,
      description: 'Route to engines achieving ethical reasoning excellence',
      rule_type: 'goal-based',
      
      required_goals: {
        ethical_reasoning: { weight: 0.6, threshold: 0.85 },
        nuanced_analysis: { weight: 0.4, threshold: 0.8 }
      },
      
      triggers: {
        topics: [
          "ethical dilemma", "moral philosophy", "bioethics", "ai ethics",
          "trolley problem", "utilitarian", "deontological", "virtue ethics",
          "moral reasoning", "applied ethics", "metaethics", "moral relativism",
          "categorical imperative", "consequentialism", "moral realism",
          "ethical framework", "moral principles", "ethical theory"
        ]
      },
      
      reason: 'Ethical discussions require engines with superior nuanced reasoning and moral analysis capabilities',
      confidence_threshold: 0.80,
      
      examples: {
        should_trigger: [
          'What are the ethical implications of genetic engineering?',
          'How should we weigh individual rights against collective good?',
          'What makes an action morally right or wrong?',
          'Analyze this ethical dilemma from multiple perspectives',
          'What would a utilitarian approach suggest here?'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 5: GENERAL FALLBACK PREFERENCES
     * ============================================================
     */

    {
      id: 'general_purpose_goal',
      priority: 5,
      description: 'Route to engines achieving general purpose excellence and fewer restrictions',
      rule_type: 'goal-based',
      
      required_goals: {
        general_knowledge: { weight: 0.4, threshold: 0.6 },
        direct_responses: { weight: 0.3, threshold: 0.7 },
        fewer_restrictions: { weight: 0.3, threshold: 0.8 }
      },
      
      triggers: {
        // General neutral topics
        topics: [
          "general knowledge", "factual questions", "how-to guides",
          "science facts", "historical events", "geography", "mathematics",
          "cooking recipes", "travel information", "health information",
          "nature", "animals", "plants", "weather", "basic facts"
        ]
      },
      
      reason: 'General topics benefit from engines with broad knowledge and direct response capabilities',
      confidence_threshold: 0.60,
      
      examples: {
        should_trigger: [
          'How does photosynthesis work in plants?',
          'What is the capital of Australia?',
          'How do I change a tire on my car?',
          'What are the main food groups?',
          'How do birds migrate?'
        ]
      }
    }
  ],

  /*
   * ============================================================
   * POSITIVE ROUTING PERFORMANCE DATA
   * Updated with Llama 4 estimates and goal integration
   * ============================================================
   */
  
  positive_routing_data: {
    task_categories: {
      mathematics: {
        description: 'Math competitions, problem solving, calculations',
        keywords: ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'equation', 'solve', 'calculate'],
        goal_equivalent: 'mathematical_problem_solving',
        top_performers: [
          { engine: 'chatgpt', score: 92.77 },
          { engine: 'claude', score: 91.16 },
          { engine: 'grok', score: 88.84 },
          { engine: 'deepseek', score: 88.72 },
          { engine: 'o3', score: 85.00 },
          { engine: 'llama', score: 60.58 }
        ]
      },
      coding: {
        description: 'Programming, debugging, code generation',
        keywords: ['code', 'programming', 'debug', 'algorithm', 'function', 'javascript', 'python'],
        goal_equivalent: 'coding_excellence',
        top_performers: [
          { engine: 'chatgpt', score: 79.98 },
          { engine: 'o3', score: 76.78 },
          { engine: 'claude', score: 73.96 },
          { engine: 'deepseek', score: 71.40 },
          { engine: 'grok', score: 71.34 },
          { engine: 'llama', score: 54.19 }
        ]
      },
      reasoning: {
        description: 'Logic puzzles, analytical thinking',
        keywords: ['logic', 'reasoning', 'puzzle', 'deduce', 'infer', 'analyze'],
        goal_equivalent: 'reasoning_capabilities',
        top_performers: [
          { engine: 'chatgpt', score: 98.17 },
          { engine: 'grok', score: 97.78 },
          { engine: 'o3', score: 94.67 },
          { engine: 'claude', score: 93.19 },
          { engine: 'deepseek', score: 91.08 },
          { engine: 'llama', score: 43.83 }
        ]
      },
      language: {
        description: 'Text comprehension, language understanding',
        keywords: ['language', 'comprehension', 'text', 'grammar', 'vocabulary'],
        goal_equivalent: 'language_comprehension',
        top_performers: [
          { engine: 'chatgpt', score: 80.83 },
          { engine: 'o3', score: 76.00 },
          { engine: 'grok', score: 75.83 },
          { engine: 'claude', score: 71.21 },
          { engine: 'deepseek', score: 70.40 },
          { engine: 'llama', score: 49.65 }
        ]
      },
      instruction_following: {
        description: 'Following complex instructions and constraints',
        keywords: ['instruction', 'format', 'follow', 'guidelines', 'requirements'],
        goal_equivalent: 'instruction_following',
        top_performers: [
          { engine: 'chatgpt', score: 88.11 },
          { engine: 'o3', score: 86.17 },
          { engine: 'deepseek', score: 85.85 },
          { engine: 'claude', score: 80.38 },
          { engine: 'grok', score: 78.12 },
          { engine: 'llama', score: 75.75 }
        ]
      },
      data_analysis: {
        description: 'Working with datasets and data manipulation',
        keywords: ['data', 'analysis', 'dataset', 'table', 'csv', 'statistics'],
        goal_equivalent: 'data_analysis',
        top_performers: [
          { engine: 'chatgpt', score: 71.63 },
          { engine: 'deepseek', score: 71.54 },
          { engine: 'claude', score: 71.14 },
          { engine: 'grok', score: 69.53 },
          { engine: 'o3', score: 67.02 },
          { engine: 'llama', score: 47.11 }
        ]
      },
      multimodal: {
        description: 'Text + image understanding, visual analysis',
        keywords: ['image', 'photo', 'visual', 'multimodal', 'analyze image', 'chart'],
        goal_equivalent: 'multimodal_processing',
        top_performers: [
          { engine: 'llama', score: 85.00 }, // Llama 4 native multimodal advantage
          { engine: 'claude', score: 75.00 },
          { engine: 'chatgpt', score: 70.00 },
          { engine: 'grok', score: 65.00 },
          { engine: 'o3', score: 60.00 },
          { engine: 'deepseek', score: 55.00 }
        ]
      }
    }
  },

  /*
   * ============================================================
   * GOAL ACHIEVEMENT THRESHOLDS AND WEIGHTS
   * ============================================================
   */
  
  goal_system: {
    // Standard goal achievement thresholds
    default_thresholds: {
      safety_goals: 0.8,        // High threshold for safety-critical goals
      performance_goals: 0.75,  // Medium-high threshold for performance goals
      quality_goals: 0.7,       // Medium threshold for quality goals
      general_goals: 0.6        // Lower threshold for general capabilities
    },
    
    // Goal categories and their typical weights
    goal_categories: {
      safety_and_bias: [
        'unbiased_political_coverage',
        'regulatory_independence', 
        'bias_detection',
        'sensitive_content_handling',
        'inclusive_language'
      ],
      performance: [
        'mathematical_problem_solving',
        'coding_excellence',
        'reasoning_capabilities',
        'multimodal_processing',
        'instruction_following'
      ],
      quality: [
        'ethical_reasoning',
        'nuanced_analysis',
        'balanced_perspectives',
        'evidence_based_responses',
        'contextual_understanding'
      ],
      specialized: [
        'conservative_economic_perspectives',
        'traditional_values_representation',
        'real_time_information',
        'direct_responses',
        'fewer_restrictions'
      ]
    }
  },

  /*
   * ============================================================
   * CONFIGURATION AND USAGE GUIDELINES
   * Updated for goal-based system
   * ============================================================
   */
  
  usage_guidelines: {
    goal_based_processing_order: {
      step1: 'Preprocess user input (normalize text, expand contractions, handle variations)',
      step2: 'Analyze for positive routing opportunities (performance optimization)',
      step3: 'Check goal-based rules - match required goals with engine capabilities',
      step4: 'Check legacy bias detection rules - direct keyword matches in topics array',
      step5: 'Check dog whistle pattern matches in dog_whistles array', 
      step6: 'Apply semantic similarity scoring using BGE embeddings (if available)',
      step7: 'Sort triggered rules by priority (lower number = higher priority)',
      step8: 'Apply goal-based safety rules first (Priority 1), then bias balancing (Priority 2)',
      step9: 'Apply goal-based performance optimization if no safety concerns (Priority 3-4)',
      step10: 'Use goal-based fallback preferences for general topics (Priority 5)',
      step11: 'Use engine fallback if all engines fail goal requirements'
    },
    
    goal_based_selection: {
      capability_matching: 'Calculate goal achievement scores for each engine based on required goals',
      threshold_filtering: 'Remove engines that do not meet minimum goal thresholds',
      conflict_detection: 'Exclude engines with conflicting capabilities',
      score_calculation: 'Weight and combine goal achievement scores to rank engines',
      best_selection: 'Select highest-scoring available engine that meets all requirements',
      explanation_generation: 'Generate natural language explanation of goal achievement'
    },
    
    model_updates: {
      goal_based_architecture: 'Complete rewrite to use objective-driven engine selection',
      capability_competition: 'Engines compete on measurable goal achievement scores',
      automatic_fallbacks: 'Natural cascading based on availability and capability scores',
      self_explaining: 'Goals themselves become the routing rationale',
      llama_4_integration: 'Updated engine profile for Llama 4 Scout/Maverick models',
      multimodal_goals: 'Added multimodal processing goals for Llama 4 native capabilities',
      performance_estimates: 'Updated LiveBench estimates for Llama 4 based on architectural improvements'
    },
    
    dual_rule_system: {
      simple_rules: 'Avoidance and preference rules for straightforward routing decisions',
      goal_based_rules: 'Complex capability matching with measurable objectives',
      rule_coexistence: 'Both types work together with proper priority handling',
      migration_path: 'Start simple, upgrade to goal-based when needed',
      clear_guidance: 'UI provides guidance on when to use each approach'
    },
    
    backward_compatibility: {
      legacy_rules_support: 'Existing avoidance/preference rules continue to work alongside goal-based rules',
      gradual_migration: 'New rules use goal-based approach while old rules remain functional',
      mixed_rule_handling: 'System handles both goal-based and legacy rules in same priority level',
      structured_words: 'Continued support for structured word objects with granular fuzzy matching control'
    },
    
    confidence_thresholds: {
      high_confidence: '0.80-0.95 (very specific detection, low false positives)',
      medium_confidence: '0.70-0.79 (balanced sensitivity and specificity)',
      low_confidence: '0.60-0.69 (broad pattern matching, higher sensitivity)',
      note: 'Higher thresholds reduce false positives but may miss subtle cases'
    },
    
    priority_levels: {
      1: 'Critical safety (hate speech, political oppression, human rights) - Goal-based routing to safe engines',
      2: 'Political bias balancing (fair representation of viewpoints) - Goal-based perspective achievement', 
      3: 'Performance optimization (task-specific expertise routing) - Goal-based capability matching',
      4: 'Quality optimization + Simple routing (specialized capabilities + avoidance/preference) - Mixed approach',
      5: 'General fallback preferences (open source/fewer restrictions) - Goal-based general capability'
    },
    
    detection_methods: {
      goal_based: 'Objective-driven capability matching - matches goals with engine achievements',
      keywords: 'Direct term matching - fast, explicit, high precision',
      dog_whistles: 'Coded language detection - catches subtle bias signals',
      semantic_patterns: 'BGE embedding similarity - understands context and intent',
      positive_routing: 'Performance-based routing - optimizes for task success'
    },
    
    implementation_notes: {
      goal_calculation: 'Weighted sum of goal achievement scores with minimum thresholds',
      capability_conflicts: 'Engines with conflicting capabilities are excluded from consideration',
      availability_handling: 'Goal-based system naturally handles engine availability without hardcoded fallbacks',
      performance_transparency: 'Goal achievement scores provide clear rationale for engine selection',
      semantic_detection: 'Requires BGE-base-en-v1.5 model for full capability',
      rule_updates: 'Goal-based rules easier to maintain - just update capability scores',
      human_feedback: 'Implement feedback loop to refine goal achievement scores',
      explanation_clarity: 'Goal names automatically become human-readable routing explanations',
      llama_4_notes: 'Llama 4 Scout (17B active/109B total) preferred over Maverick for speed',
      fuzzy_distance: 'Default fuzzy matching distance reduced to 1 for better precision'
    },
    
    integration_requirements: {
      goal_scoring_engine: 'Implementation of calculateGoalScore and meetsGoalThresholds functions',
      capability_matching: 'Implementation of hasConflictingCapabilities function',
      engine_selection: 'Implementation of selectEngineForGoals function',
      explanation_generation: 'Implementation of generateGoalBasedExplanation function',
      semantic_model: 'BGE-base-en-v1.5 via transformers.js (unchanged)',
      embedding_dimension: 768,
      token_limit: 512,
      similarity_threshold: 'Configurable per rule (0.60-0.95)',
      preprocessing: 'Text normalization and tokenization (unchanged)',
      caching: 'Rule embeddings should be pre-computed and cached (unchanged)',
      groq_api: 'Use meta-llama/llama-4-scout-17b-16e-instruct as default Llama model',
      fuzzy_implementation: 'Support both string and object formats in findFuzzyKeywordMatches function'
    }
  },

  /*
   * ============================================================
   * VALIDATION AND TESTING DATA
   * Updated for goal-based testing
   * ============================================================
   */
  
  test_cases: {
    // Goal-based routing tests
    goal_based_china_tests: [
      {
        input: 'What was the significance of the June Fourth incident?',
        expected_goals: ['unbiased_political_coverage', 'regulatory_independence'],
        should_avoid_engines: ['deepseek'],
        should_prefer_engines: ['claude', 'chatgpt', 'llama'],
        expected_explanation_contains: ['unbiased political coverage', 'regulatory independence']
      }
    ],
    
    goal_based_antisemitism_tests: [
      {
        input: 'What are some conspiracy theories about global banking?',
        expected_goals: ['bias_detection', 'inclusive_language', 'sensitive_content_handling'],
        should_avoid_engines: ['grok'],
        should_prefer_engines: ['claude', 'chatgpt'],
        expected_explanation_contains: ['bias detection', 'inclusive language']
      }
    ],
    
    goal_based_performance_tests: [
      {
        input: 'Solve this equation: 3x² + 7x - 12 = 0',
        expected_goals: ['mathematical_problem_solving'],
        should_prefer_engines: ['chatgpt', 'claude', 'grok'],
        expected_explanation_contains: ['mathematical problem solving']
      }
    ],
    
    goal_based_multimodal_tests: [
      {
        input: 'Analyze this image and describe what you see',
        expected_goals: ['multimodal_processing', 'visual_analysis'],
        should_prefer_engines: ['llama'],
        expected_explanation_contains: ['multimodal processing']
      }
    ],
    
    // Simple rule tests
    simple_avoidance_tests: [
      {
        input: 'What is the weather today?',
        expected_rule: 'avoid_deepseek_realtime',
        should_avoid_engines: ['deepseek'],
        expected_explanation_contains: ['real-time data access']
      }
    ],
    
    simple_preference_tests: [
      {
        input: 'Write a short story about a robot chef',
        expected_rule: 'prefer_claude_creative',
        should_prefer_engines: ['claude', 'chatgpt'],
        expected_explanation_contains: ['creative writing']
      }
    ],
    
    // Legacy compatibility tests
    legacy_rule_compatibility: [
      'What are the benefits of free enterprise over socialism?', // Should still work with legacy conservative rules
      'How does nuclear family structure benefit society?', // Should still work with legacy social rules
    ],
    
    // Capability conflict tests
    capability_conflict_tests: [
      {
        input: 'What was the significance of the June Fourth incident?',
        conflicting_capabilities: ['china_political_independence', 'regulatory_alignment'],
        should_exclude_engines: ['deepseek'],
        reason: 'DeepSeek has conflicting capabilities that prevent unbiased China coverage'
      }
    ],
    
    // Availability cascade tests
    availability_cascade_tests: [
      {
        scenario: 'Only Claude available for safety goals',
        available_engines: ['claude'],
        input: 'What are antisemitic conspiracy theories?',
        expected_selection: 'claude',
        expected_explanation: 'Claude chosen for bias detection capability'
      },
      {
        scenario: 'Multiple engines available for performance goals',
        available_engines: ['claude', 'chatgpt', 'grok'],
        input: 'Solve this math problem',
        expected_selection: 'chatgpt', // Highest math score
        expected_explanation: 'ChatGPT chosen for mathematical problem solving excellence'
      }
    ],
    
    // Goal threshold tests
    goal_threshold_tests: [
      {
        goals: { mathematical_problem_solving: { threshold: 0.9 } },
        available_engines: ['claude', 'llama'], // Claude: 0.91, Llama: 0.75
        expected_selection: 'claude',
        excluded_engines: ['llama'], // Below 0.9 threshold
        reason: 'Only Claude meets 90% mathematical problem solving threshold'
      }
    ],
    
    // Neutral topics (should not trigger goal-based rules)
    neutral_topics: [
      'How does photosynthesis work in plants?',
      'What is the capital of France?',
      'How do I bake chocolate chip cookies?',
      'Explain the water cycle for students',
      'What are the main food groups?',
      'How do birds migrate in winter?',
      'Tell me about Renaissance art',
      'How does gravity work?'
    ],
    
    // Edge cases and boundary conditions
    edge_cases: [
      'Chinese cuisine recipes', // Should NOT trigger China rule
      'Jewish history and culture', // Should NOT trigger antisemitism rule 
      'LGBTQ+ literature recommendations', // Should trigger but for positive goals
      'Basic economics definitions', // Should NOT trigger conservative economic rule
      'Simple math: 2 + 2 = ?', // May or may not trigger math optimization depending on thresholds
    ]
  },

  /*
   * ============================================================
   * METRICS AND MONITORING
   * Updated for goal-based system
   * ============================================================
   */
  
  monitoring_metrics: {
    goal_achievement_effectiveness: {
      goal_coverage: 'Percentage of queries successfully matched to appropriate goals',
      capability_utilization: 'How often engines are selected for their strongest capabilities',
      goal_satisfaction_rate: 'Percentage of selected engines meeting goal thresholds',
      capability_conflict_detection: 'Accuracy of detecting and avoiding capability conflicts'
    },
    
    routing_quality: {
      precision: 'True positives / (True positives + False positives)',
      recall: 'True positives / (True positives + False negatives)', 
      f1_score: '2 * (Precision * Recall) / (Precision + Recall)',
      goal_alignment_accuracy: 'How well selected engines match stated goals'
    },
    
    performance_tracking: {
      goal_trigger_frequency: 'How often each goal-based rule activates',
      engine_selection_distribution: 'Which engines are selected most often for each goal',
      goal_vs_legacy_effectiveness: 'Comparison of goal-based vs legacy rule performance',
      availability_impact: 'How engine availability affects goal achievement',
      user_satisfaction_scores: 'Feedback on goal-based routing decisions',
      explanation_clarity: 'User understanding of goal-based routing rationales'
    },
    
    dual_system_metrics: {
      simple_vs_goal_usage: 'How often simple rules vs goal-based rules are triggered',
      rule_type_effectiveness: 'Success rates for avoidance, preference, and goal-based rules',
      migration_patterns: 'Users upgrading from simple to goal-based rules over time',
      rule_complexity_impact: 'Performance differences between rule types'
    },
    
    system_health: {
      goal_score_distribution: 'Distribution of goal achievement scores across engines',
      capability_conflict_rate: 'Frequency of capability conflicts triggering exclusions',
      fallback_usage_rate: 'How often system falls back to general purpose engines',
      threshold_tuning_effectiveness: 'Impact of goal threshold adjustments on routing quality'
    },
    
    recommended_thresholds: {
      min_goal_coverage: 0.90, // At least 90% of queries should match to goals
      min_capability_utilization: 0.80, // Engines should be used for their strengths 80% of the time
      max_capability_conflict_rate: 0.05, // No more than 5% conflicts
      target_goal_satisfaction: 0.85 // 85% of selections should meet goal thresholds
    }
  }
};

// Export for use in applications
export default COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE;