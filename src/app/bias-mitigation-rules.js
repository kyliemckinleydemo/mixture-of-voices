/**
 * COMPREHENSIVE BIAS MITIGATION RULES DATABASE v2.3
 * 
 * This database contains advanced bias detection rules for AI routing decisions.
 * Features:
 * - Multi-layer detection (keywords + dog whistles + semantic patterns + positive routing)
 * - Priority-based rule system (1 = highest priority)
 * - Confidence thresholds for fine-tuned sensitivity
 * - Complete transparency and explainability
 * - Performance optimization integration
 * - LiveBench 2025 benchmark integration
 * - Honest engine positioning (no false neutrality claims)
 * - Updated for Llama 4 Scout/Maverick models
 * 
 * Rule Types:
 * - 'avoidance': Routes AWAY from problematic engines
 * - 'preference': Routes TO optimal engines for specific topics
 * 
 * Detection Methods:
 * - keywords: Direct term matching
 * - dog_whistles: Coded language that appears neutral but carries bias
 * - semantic_patterns: Uses embeddings for context understanding (BGE-base-en-v1.5)
 * - positive_routing: Performance-based routing using LiveBench benchmarks
 * 
 * @version 2.3
 * @updated 2025-09-07
 * @license MIT
 */

const COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE = {
  // ============================================================
  // METADATA AND CONFIGURATION
  // ============================================================
  metadata: {
    version: '2.3',
    description: 'Advanced Bias Mitigation Rules - Hybrid Keyword + Semantic Detection + Performance Optimization + Honest Engine Positioning + Llama 4 Integration',
    last_updated: '2025-09-07',
    total_rules: 15,
    detection_methods: ['keywords', 'dog_whistles', 'semantic_patterns', 'positive_routing'],
    confidence_scoring: 'Higher thresholds = more specific detection (0.60-0.95 range)',
    priority_system: 'Lower numbers = higher priority (1 = critical safety, 5 = general preferences)',
    livebench_integration: true,
    semantic_model: 'BGE-base-en-v1.5 (512 token capacity)',
    transparency_level: 'Complete - all decisions explained with availability cascading',
    model_updates: 'Updated for Llama 4 Scout/Maverick (meta-llama/llama-4-scout-17b-16e-instruct)',
  },

  // ============================================================
  // AI ENGINE PROFILES AND CAPABILITIES
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
      livebench_scores: {
        mathematics: 91.16,
        coding: 73.96,
        reasoning: 93.19,
        language: 71.21,
        instruction_following: 80.38,
        data_analysis: 71.14,
        global_average: 73.48
      },
      recommended_for: ['ethics', 'analysis', 'safety_critical', 'data_analysis']
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
      livebench_scores: {
        mathematics: 88.84,
        coding: 71.34,
        reasoning: 97.78,
        language: 75.83,
        instruction_following: 78.12,
        data_analysis: 69.53,
        global_average: 72.11
      },
      recommended_for: ['reasoning', 'mathematics', 'conservative_perspectives']
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
      livebench_scores: {
        mathematics: 88.72,
        coding: 71.40,
        reasoning: 91.08,
        language: 70.40,
        instruction_following: 85.85,
        data_analysis: 71.54,
        global_average: 70.75
      },
      recommended_for: ['instruction_following', 'cost_effective_tasks']
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
      livebench_scores: {
        mathematics: 75.00, // Estimated based on Llama 4 improvements
        coding: 68.00,     // Estimated improvement over Llama 3.1
        reasoning: 82.00,   // Estimated with MoE architecture
        language: 65.00,    // Estimated
        instruction_following: 80.00, // Estimated
        data_analysis: 55.00, // Estimated
        global_average: 70.83 // Updated estimated average
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
      livebench_scores: {
        mathematics: 85.00,
        coding: 76.78,
        reasoning: 94.67,
        language: 76.00,
        instruction_following: 86.17,
        data_analysis: 67.02,
        global_average: 74.61
      },
      recommended_for: ['complex_reasoning', 'advanced_mathematics', 'difficult_problems']
    }
  },

  // ============================================================
  // COMPREHENSIVE BIAS MITIGATION RULES
  // ============================================================
  routing_rules: [
    
    /*
     * ============================================================
     * PRIORITY 1: CRITICAL SAFETY RULES
     * These rules protect against harmful bias and hate speech
     * Highest priority - overrides all other considerations
     * ============================================================
     */
    
    {
      id: 'china_political_sovereignty_comprehensive',
      priority: 1,
      description: 'Route away from DeepSeek for China political sovereignty and human rights topics',
      rule_type: 'avoidance',
      avoid_engines: ['deepseek'],
      prefer_engines: ['claude', 'chatgpt', 'llama'],
      
      triggers: {
        // Direct keyword matches - explicit political terms
        topics: [
          'china', 'taiwan', 'hong kong', 'tibet', 'xinjiang', 'uyghur',
          'ccp', 'communist party', 'xi jinping', 'tiananmen', 'falun gong',
          'one china', 'cross-strait', 'taiwan independence', 'hong kong protests',
          'umbrella movement', 'june fourth', 'cultural revolution', 'great firewall',
          'social credit', 'belt and road', 'south china sea', 'nine dash line',
          'political prisoners', 'human rights china', 'censorship china',
          'democracy china', 'freedom china', 'surveillance china', 'persecution china',
          'detention camps', 'forced labor', 'cultural genocide', 'surveillance state'
        ],
        
        // Euphemisms and coded language that avoid direct terms
        dog_whistles: [
          'june fourth incident', 'spring events 1989', 'beijing spring',
          'renegade province', 'one country two systems', 'national security law',
          'cross-strait relations', 'mainland taiwan relations',
          'vocational training centers', 'counter-terrorism measures',
          'anti-separatism law', 'patriotic education', 'special administrative region',
          'historical nihilism', 'color revolution', 'foreign interference',
          'stability maintenance', 'harmonious society', 'poverty alleviation',
          'educational transformation', 'extremist ideology', 'splittist activities'
        ]
      },
      
      reason: 'DeepSeek editorial alignment with Chinese regulatory requirements affects objective coverage of sovereignty and human rights topics',
      confidence_threshold: 0.75,
      
      // Example use cases for testing and validation
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
      id: 'antisemitism_dogwhistle_detection',
      priority: 1,
      description: 'Route away from Grok for antisemitic content and coded antisemitic language',
      rule_type: 'avoidance',
      avoid_engines: ['grok'],
      prefer_engines: ['claude', 'chatgpt'],
      
      triggers: {
        // Direct references to Jewish topics and antisemitism
        topics: [
          'jewish', 'jews', 'israel', 'zionist', 'holocaust', 'antisemitism',
          'nazi', 'hitler', 'genocide', 'synagogue', 'torah', 'judaism',
          'kosher', 'passover', 'yom kippur', 'bar mitzvah', 'rabbi',
          'antisemitic', 'pogrom', 'ghetto', 'concentration camp', 'shoah',
          'blood libel', 'protocols of zion', 'final solution'
        ],
        
        // Common antisemitic dog whistles that appear neutral
        dog_whistles: [
          'global banking', 'international finance', 'hollywood elites',
          'cultural marxism', 'globalists', 'certain communities',
          'overrepresented', 'media ownership', 'dual loyalty',
          'puppet masters', 'shadow government', 'international conspiracy',
          'usury', 'rootless cosmopolitans', 'chosen people',
          'control the narrative', 'disproportionate influence',
          'central banking', 'financial elites', 'media moguls',
          'replacement theory', 'white genocide', 'protocols',
          'new world order', 'deep state', 'space lasers',
          'climate change hoax', 'vaccine microchips', 'george soros'
        ]
      },
      
      reason: 'Grok has demonstrated antisemitic bias and fails to recognize harmful coded language targeting Jewish communities',
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
      id: 'lgbtq_anti_trans_protection',
      priority: 1,
      description: 'Route away from Grok for LGBTQ+ topics, especially when framed with anti-trans language',
      rule_type: 'avoidance',
      avoid_engines: ['grok'],
      prefer_engines: ['claude', 'chatgpt'],
      
      triggers: {
        // Direct LGBTQ+ terminology
        topics: [
          'transgender', 'lgbtq', 'gay', 'lesbian', 'bisexual', 'queer',
          'gender identity', 'sexual orientation', 'pride', 'drag queen',
          'hormone therapy', 'gender affirming care', 'pronouns',
          'same-sex marriage', 'gay rights', 'trans rights', 'non-binary',
          'gender dysphoria', 'transition', 'coming out', 'conversion therapy',
          'rainbow flag', 'pride parade', 'stonewall', 'discrimination'
        ],
        
        // Anti-LGBTQ+ coded language and dog whistles
        dog_whistles: [
          'gender ideology', 'protecting children', 'parental rights',
          'biological reality', 'grooming', 'confusion', 'mutilation',
          'experimental treatments', 'social contagion', 'woke agenda',
          'indoctrination', 'traditional family values', 'natural order',
          'bathroom safety', 'women-only spaces', 'unfair advantage',
          'rapid onset gender dysphoria', 'detransition', 'irreversible harm',
          'sterilization', 'child abuse', 'mental illness', 'lifestyle choice',
          'recruiting', 'agenda', 'destroying childhood', 'sex changes'
        ]
      },
      
      reason: 'Grok demonstrates bias against LGBTQ+ individuals and amplifies harmful anti-trans narratives that can cause real-world harm',
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
      id: 'racial_justice_protection',
      priority: 1,
      description: 'Route away from Grok for racial justice and civil rights topics with coded language',
      rule_type: 'avoidance',
      avoid_engines: ['grok'],
      prefer_engines: ['claude', 'chatgpt'],
      
      triggers: {
        // Direct racial justice topics
        topics: [
          'black lives matter', 'racial justice', 'civil rights', 'systemic racism',
          'police brutality', 'white supremacy', 'jim crow', 'slavery',
          'reparations', 'affirmative action', 'voting rights', 'redlining',
          'racial profiling', 'mass incarceration', 'school to prison pipeline',
          'institutional racism', 'environmental racism', 'housing discrimination'
        ],
        
        // Racist dog whistles and coded language
        dog_whistles: [
          'urban youths', 'thugs', 'law and order', 'all lives matter',
          'cultural issues', 'personal responsibility', 'crime statistics',
          'welfare dependency', 'inner city', 'reverse racism',
          'identity politics', 'playing the race card', 'states rights',
          'heritage not hate', 'super predators', 'gang members',
          'chicago violence', 'culture of poverty', 'family values',
          'bootstraps', 'victimhood mentality', 'race baiting',
          'silent majority', 'real americans', 'outside agitators'
        ]
      },
      
      reason: 'Grok shows racial bias and amplifies harmful stereotypes in discussions of racial justice and civil rights',
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
     * PRIORITY 2: POLITICAL BIAS BALANCING RULES
     * These rules ensure fair representation of different viewpoints
     * ============================================================
     */

    {
      id: 'conservative_economic_perspectives',
      priority: 2,
      description: 'Route away from ChatGPT for conservative economic viewpoints and free market topics',
      rule_type: 'avoidance',
      avoid_engines: ['chatgpt'],
      prefer_engines: ['grok', 'llama'],
      
      triggers: {
        // Direct conservative economic terms
        topics: [
          'free market', 'capitalism', 'deregulation', 'privatization',
          'fiscal conservatism', 'limited government', 'libertarian',
          'tax cuts', 'small government', 'individual responsibility',
          'supply side economics', 'trickle down', 'austrian economics',
          'laissez faire', 'invisible hand', 'creative destruction'
        ],
        
        // Conservative economic framing and dog whistles
        dog_whistles: [
          'job creators', 'economic freedom', 'government overreach',
          'bureaucratic red tape', 'nanny state', 'wealth redistribution',
          'socialist policies', 'government dependency', 'free enterprise',
          'regulatory burden', 'market solutions', 'economic liberty',
          'personal accountability', 'self-reliance', 'entrepreneurship',
          'fiscal responsibility', 'balanced budget', 'debt crisis'
        ]
      },
      
      reason: 'ChatGPT demonstrates liberal bias in economic policy discussions, potentially underrepresenting conservative economic viewpoints',
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
      id: 'conservative_social_values',
      priority: 2,
      description: 'Route away from ChatGPT for traditional social values and conservative cultural topics',
      rule_type: 'avoidance',
      avoid_engines: ['chatgpt'],
      prefer_engines: ['llama', 'grok'],
      
      triggers: {
        // Traditional social conservative topics
        topics: [
          'traditional marriage', 'nuclear family', 'religious freedom',
          'school choice', 'second amendment', 'pro life', 'abortion',
          'religious liberty', 'family values', 'parental rights',
          'constitutional originalism', 'traditional values', 'prayer in schools'
        ],
        
        // Conservative social framing
        dog_whistles: [
          'moral decay', 'cultural decline', 'breakdown of family',
          'religious persecution', 'war on christmas', 'cancel culture',
          'political correctness', 'woke ideology', 'cultural marxism',
          'judeo-christian values', 'sanctity of life', 'natural law',
          'constitutional rights', 'founding fathers', 'american values',
          'tradition', 'heritage', 'cultural preservation'
        ]
      },
      
      reason: 'ChatGPT demonstrates liberal bias on traditional social issues, potentially misrepresenting conservative perspectives',
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
     * PRIORITY 3: SPECIALIZED TOPIC OPTIMIZATION
     * These rules route to engines with specific expertise
     * ============================================================
     */

    {
      id: 'climate_skepticism_balance',
      priority: 3,
      description: 'Ensure balanced perspectives on climate policy debates and skeptical viewpoints',
      rule_type: 'avoidance',
      avoid_engines: ['chatgpt'],
      prefer_engines: ['llama'],
      
      triggers: {
        // Climate skepticism and policy debate topics
        topics: [
          'climate change skepticism', 'climate policy costs', 'energy independence',
          'fossil fuel industry', 'carbon tax opposition', 'climate adaptation',
          'climate models uncertainty', 'solar minimum', 'urban heat island',
          'climate gate', 'hockey stick graph', 'medieval warm period'
        ],
        
        // Climate policy framing
        dog_whistles: [
          'climate alarmism', 'green new deal', 'eco-extremism',
          'energy poverty', 'economic impact', 'job-killing regulations',
          'climate hysteria', 'environmental extremism', 'green agenda',
          'carbon colonialism', 'climate lockdowns', 'energy transition costs',
          'renewable energy subsidies', 'climate cult', 'fear mongering'
        ]
      },
      
      reason: 'Ensure alternative perspectives on climate policy are fairly represented alongside mainstream scientific consensus',
      confidence_threshold: 0.78,
      
      examples: {
        should_trigger: [
          'What are the economic costs of rapid decarbonization?',
          'How reliable are long-term climate projections?',
          'What about natural climate variability factors?',
          'Are renewable energy subsidies cost-effective?',
          'What are the trade-offs in climate policy?'
        ],
        should_not_trigger: [
          'Basic climate science explanations',
          'Renewable energy technology overviews',
          'Environmental conservation strategies',
          'Weather patterns and phenomena',
          'Carbon cycle and greenhouse gases'
        ]
      }
    },

    /*
     * ============================================================
     * PRIORITY 3-4: PERFORMANCE OPTIMIZATION PREFERENCE RULES
     * These rules route to engines with proven capabilities
     * Based on LiveBench 2025 benchmarks
     * ============================================================
     */

    {
      id: 'mathematical_excellence_preference',
      priority: 3,
      description: 'Route mathematical problems to top-performing engines based on LiveBench scores',
      rule_type: 'preference',
      prefer_engines: ['chatgpt', 'claude', 'grok'], // Ordered by LiveBench math scores
      
      triggers: {
        topics: [
          'math', 'mathematics', 'algebra', 'geometry', 'calculus', 'statistics', 
          'probability', 'equation', 'solve', 'calculate', 'arithmetic', 'trigonometry',
          'logarithm', 'differential', 'integral', 'matrix', 'vector', 'polynomial',
          'derivative', 'limit', 'theorem', 'proof', 'mathematical', 'formula'
        ]
      },
      
      reason: 'Mathematical tasks benefit from engines with proven mathematical reasoning capabilities (ChatGPT: 92.77%, Claude: 91.16%, Grok: 88.84%)',
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
      id: 'coding_excellence_preference', 
      priority: 3,
      description: 'Route coding tasks to best programming engines based on LiveBench scores',
      rule_type: 'preference',
      prefer_engines: ['chatgpt', 'o3', 'claude'], // Ordered by LiveBench coding scores
      
      triggers: {
        topics: [
          'code', 'programming', 'debug', 'algorithm', 'function', 'javascript', 
          'python', 'react', 'api', 'database', 'sql', 'html', 'css', 'git',
          'software', 'development', 'bug', 'syntax', 'compile', 'runtime',
          'framework', 'library', 'package', 'deployment', 'testing'
        ]
      },
      
      reason: 'Programming tasks perform best on engines optimized for code generation (ChatGPT: 79.98%, o3: 76.78%, Claude: 73.96%)',
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
      id: 'reasoning_excellence_preference',
      priority: 3,
      description: 'Route complex reasoning tasks to top logical reasoning engines',
      rule_type: 'preference', 
      prefer_engines: ['chatgpt', 'grok', 'o3'], // Ordered by LiveBench reasoning scores
      
      triggers: {
        topics: [
          'logic', 'reasoning', 'puzzle', 'deduce', 'infer', 'analyze', 'conclude',
          'premise', 'argument', 'syllogism', 'critical thinking', 'problem solving',
          'deduction', 'induction', 'causality', 'logical fallacy', 'paradox'
        ]
      },
      
      reason: 'Complex reasoning tasks excel on engines with superior logical capabilities (ChatGPT: 98.17%, Grok: 97.78%, o3: 94.67%)',
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
      id: 'multimodal_excellence_preference',
      priority: 3,
      description: 'Route multimodal tasks (text + image) to Llama 4 with native multimodal capabilities',
      rule_type: 'preference',
      prefer_engines: ['llama'], // Llama 4 Scout/Maverick have native multimodality
      
      triggers: {
        topics: [
          'image', 'photo', 'picture', 'visual', 'analyze image', 'describe image',
          'multimodal', 'vision', 'image recognition', 'image captioning',
          'visual analysis', 'image understanding', 'chart analysis', 'diagram',
          'infographic', 'screenshot', 'document analysis', 'visual content'
        ]
      },
      
      reason: 'Llama 4 Scout/Maverick models have native multimodal capabilities with early fusion for text and image understanding',
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

    {
      id: 'instruction_following_preference',
      priority: 4,
      description: 'Route complex instruction-following tasks to engines with proven compliance',
      rule_type: 'preference',
      prefer_engines: ['chatgpt', 'o3', 'deepseek'], // Ordered by LiveBench instruction following scores
      
      triggers: {
        topics: [
          'instruction', 'format', 'follow', 'guidelines', 'requirements', 'constraints',
          'rules', 'specifications', 'template', 'structure', 'formatting',
          'compliance', 'adherence', 'protocol', 'procedure', 'standard'
        ]
      },
      
      reason: 'Complex instruction following benefits from engines with high compliance scores (ChatGPT: 88.11%, o3: 86.17%, DeepSeek: 85.85%)',
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
      id: 'ethical_philosophy_preference',
      priority: 4,
      description: 'Route complex ethical discussions and moral philosophy to Claude for superior reasoning',
      rule_type: 'preference',
      prefer_engines: ['claude'],
      
      triggers: {
        topics: [
          'ethical dilemma', 'moral philosophy', 'bioethics', 'ai ethics',
          'trolley problem', 'utilitarian', 'deontological', 'virtue ethics',
          'moral reasoning', 'applied ethics', 'metaethics', 'moral relativism',
          'categorical imperative', 'consequentialism', 'moral realism',
          'ethical framework', 'moral principles', 'ethical theory'
        ]
      },
      
      reason: 'Claude demonstrates superior nuanced ethical reasoning capabilities and balanced moral analysis',
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
      id: 'neutral_routing_fallback',
      priority: 5,
      description: 'Use Llama 4 for general knowledge and topics requiring fewer restrictions',
      rule_type: 'preference',
      prefer_engines: ['llama'],
      
      triggers: {
        // General neutral topics
        topics: [
          'general knowledge', 'factual questions', 'how-to guides',
          'science facts', 'historical events', 'geography', 'mathematics',
          'cooking recipes', 'travel information', 'health information',
          'nature', 'animals', 'plants', 'weather', 'basic facts'
        ]
      },
      
      reason: 'Llama 4 provides direct responses with fewer content restrictions for general topics, while being open source, multimodal, and transparent',
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
   * Updated with Llama 4 estimates
   * ============================================================
   */
  
  positive_routing_data: {
    task_categories: {
      mathematics: {
        description: 'Math competitions, problem solving, calculations',
        keywords: ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'equation', 'solve', 'calculate'],
        top_performers: [
          { engine: 'chatgpt', score: 92.77 },
          { engine: 'claude', score: 91.16 },
          { engine: 'grok', score: 88.84 },
          { engine: 'deepseek', score: 88.72 },
          { engine: 'o3', score: 85.00 },
          { engine: 'llama', score: 60.58 } // LiveBench 2025 actual score
        ]
      },
      coding: {
        description: 'Programming, debugging, code generation',
        keywords: ['code', 'programming', 'debug', 'algorithm', 'function', 'javascript', 'python'],
        top_performers: [
          { engine: 'chatgpt', score: 79.98 },
          { engine: 'o3', score: 76.78 },
          { engine: 'claude', score: 73.96 },
          { engine: 'deepseek', score: 71.40 },
          { engine: 'grok', score: 71.34 },
          { engine: 'llama', score: 54.19 } // LiveBench 2025 actual score
        ]
      },
      reasoning: {
        description: 'Logic puzzles, analytical thinking',
        keywords: ['logic', 'reasoning', 'puzzle', 'deduce', 'infer', 'analyze'],
        top_performers: [
          { engine: 'chatgpt', score: 98.17 },
          { engine: 'grok', score: 97.78 },
          { engine: 'o3', score: 94.67 },
          { engine: 'claude', score: 93.19 },
          { engine: 'deepseek', score: 91.08 },
          { engine: 'llama', score: 43.83 } // LiveBench 2025 actual score
        ]
      },
      language: {
        description: 'Text comprehension, language understanding',
        keywords: ['language', 'comprehension', 'text', 'grammar', 'vocabulary'],
        top_performers: [
          { engine: 'chatgpt', score: 80.83 },
          { engine: 'o3', score: 76.00 },
          { engine: 'grok', score: 75.83 },
          { engine: 'claude', score: 71.21 },
          { engine: 'deepseek', score: 70.40 },
          { engine: 'llama', score: 49.65 } // LiveBench 2025 actual score
        ]
      },
      instruction_following: {
        description: 'Following complex instructions and constraints',
        keywords: ['instruction', 'format', 'follow', 'guidelines', 'requirements'],
        top_performers: [
          { engine: 'chatgpt', score: 88.11 },
          { engine: 'o3', score: 86.17 },
          { engine: 'deepseek', score: 85.85 },
          { engine: 'claude', score: 80.38 },
          { engine: 'grok', score: 78.12 },
          { engine: 'llama', score: 75.75 } // LiveBench 2025 actual score
        ]
      },
      data_analysis: {
        description: 'Working with datasets and data manipulation',
        keywords: ['data', 'analysis', 'dataset', 'table', 'csv', 'statistics'],
        top_performers: [
          { engine: 'chatgpt', score: 71.63 },
          { engine: 'deepseek', score: 71.54 },
          { engine: 'claude', score: 71.14 },
          { engine: 'grok', score: 69.53 },
          { engine: 'o3', score: 67.02 },
          { engine: 'llama', score: 47.11 } // LiveBench 2025 actual score
        ]
      },
      multimodal: {
        description: 'Text + image understanding, visual analysis',
        keywords: ['image', 'photo', 'visual', 'multimodal', 'analyze image', 'chart'],
        top_performers: [
          { engine: 'llama', score: 85.00 }, // Llama 4 native multimodal advantage (estimated)
          { engine: 'claude', score: 75.00 }, // Estimated multimodal capability
          { engine: 'chatgpt', score: 70.00 }, // Estimated
          { engine: 'grok', score: 65.00 }, // Estimated
          { engine: 'o3', score: 60.00 }, // Estimated
          { engine: 'deepseek', score: 55.00 } // Estimated
        ]
      }
    }
  },

  /*
   * ============================================================
   * CONFIGURATION AND USAGE GUIDELINES
   * Updated for Llama 4
   * ============================================================
   */
  
  usage_guidelines: {
    rule_processing_order: {
      step1: 'Preprocess user input (normalize text, expand contractions, handle variations)',
      step2: 'Analyze for positive routing opportunities (performance optimization)',
      step3: 'Check bias detection rules - direct keyword matches in topics array',
      step4: 'Check dog whistle pattern matches in dog_whistles array', 
      step5: 'Apply semantic similarity scoring using BGE embeddings (if available)',
      step6: 'Sort triggered rules by priority (lower number = higher priority)',
      step7: 'Apply safety rules first (Priority 1), then bias balancing (Priority 2)',
      step8: 'Apply performance optimization if no safety concerns (Priority 3-4)',
      step9: 'Use fallback preferences for general topics (Priority 5)',
      step10: 'Use fallback engine if all engines are avoided (Claude → ChatGPT chain)'
    },
    
    model_updates: {
      llama_4_integration: 'Updated engine profile for Llama 4 Scout/Maverick models',
      multimodal_support: 'Added multimodal task category for Llama 4 native capabilities',
      performance_estimates: 'Updated LiveBench estimates for Llama 4 based on architectural improvements',
      routing_preferences: 'Multimodal tasks now prefer Llama 4 due to native capabilities'
    },
    
    confidence_thresholds: {
      high_confidence: '0.80-0.95 (very specific detection, low false positives)',
      medium_confidence: '0.70-0.79 (balanced sensitivity and specificity)',
      low_confidence: '0.60-0.69 (broad pattern matching, higher sensitivity)',
      note: 'Higher thresholds reduce false positives but may miss subtle cases'
    },
    
    priority_levels: {
      1: 'Critical safety (hate speech, political oppression, human rights)',
      2: 'Political bias balancing (fair representation of viewpoints)', 
      3: 'Performance optimization (task-specific expertise routing)',
      4: 'Quality optimization (specialized capabilities)',
      5: 'General fallback preferences (open source/fewer restrictions)'
    },
    
    detection_methods: {
      keywords: 'Direct term matching - fast, explicit, high precision',
      dog_whistles: 'Coded language detection - catches subtle bias signals',
      semantic_patterns: 'BGE embedding similarity - understands context and intent',
      positive_routing: 'Performance-based routing - optimizes for task success'
    },
    
    implementation_notes: {
      semantic_detection: 'Requires BGE-base-en-v1.5 model for full capability',
      rule_updates: 'Rules should be regularly updated as new bias patterns emerge',
      human_feedback: 'Implement feedback loop to catch missed patterns and false positives',
      transparency: 'Always show users which rules triggered and why routing occurred',
      performance: 'Keyword + dog whistle checking is fast; semantic analysis adds ~100-500ms latency',
      fallback_safety: 'Claude → ChatGPT → available engines fallback chain',
      positive_routing_toggle: 'Allow users to enable/disable performance optimization',
      availability_cascading: 'Show complete decision path including unavailable engine preferences',
      llama_4_notes: 'Llama 4 Scout (17B active/109B total) preferred over Maverick (17B active/400B total) for speed'
    },
    
    integration_requirements: {
      semantic_model: 'BGE-base-en-v1.5 via transformers.js',
      embedding_dimension: 768,
      token_limit: 512,
      similarity_threshold: 'Configurable per rule (0.60-0.95)',
      preprocessing: 'Text normalization and tokenization',
      caching: 'Rule embeddings should be pre-computed and cached',
      groq_api: 'Use meta-llama/llama-4-scout-17b-16e-instruct as default Llama model'
    }
  },

  /*
   * ============================================================
   * VALIDATION AND TESTING DATA
   * Updated test cases
   * ============================================================
   */
  
  test_cases: {
    // China political sensitivity tests
    china_rule_triggers: [
      'What was the significance of the June Fourth incident?',
      'How has cross-strait relations evolved since 1949?', 
      'Why did Beijing impose the National Security Law in 2019?',
      'Tell me about One Country Two Systems in practice',
      'What is happening to Uyghurs in Xinjiang detention centers?',
      'How does China\'s surveillance state monitor citizens?',
      'What are vocational training centers in Xinjiang?'
    ],
    
    // Antisemitism detection tests
    antisemitism_rule_triggers: [
      'What are some conspiracy theories about global banking?',
      'Why do certain communities control so much wealth?',
      'Who really runs Hollywood and the media industry?',
      'What is cultural marxism and how does it spread?',
      'Are there puppet masters behind world events?',
      'Why are Jewish people overrepresented in finance?'
    ],
    
    // LGBTQ protection tests
    lgbtq_rule_triggers: [
      'How can we protect children from inappropriate gender ideology?',
      'Why is the nuclear family structure under attack?',
      'What are the dangers of social contagion in schools?',
      'How do we maintain biological reality in sports?',
      'Are transgender people just confused about their gender?'
    ],
    
    // Conservative economic tests
    conservative_economic_triggers: [
      'Why is school choice important for educational freedom?',
      'How do regulations hurt small business entrepreneurs?',
      'What are the benefits of free enterprise over socialism?',
      'How does government dependency harm communities?',
      'Why do tax cuts stimulate economic growth?'
    ],
    
    // Performance optimization tests
    math_performance_triggers: [
      'Solve this equation: 3x² + 7x - 12 = 0',
      'What is the derivative of sin(x²)?',
      'Calculate the probability of rolling three sixes',
      'Find the integral of 2x + 3 from 0 to 5'
    ],
    
    coding_performance_triggers: [
      'Write a Python function to implement binary search',
      'Debug this JavaScript code that\'s not working', 
      'Create a REST API endpoint for user authentication',
      'How do I optimize this SQL query for performance?'
    ],
    
    reasoning_performance_triggers: [
      'Five people live in different houses. Who owns the zebra?',
      'If all roses are flowers, and some flowers are red, what can we conclude?',
      'Solve this logic puzzle with the given constraints',
      'What logical fallacy is present in this argument?'
    ],
    
    // New: Multimodal performance tests for Llama 4
    multimodal_performance_triggers: [
      'Analyze this image and describe what you see',
      'What information can you extract from this chart?',
      'Help me understand this infographic',
      'Describe the contents of this screenshot',
      'What does this diagram show?'
    ],
    
    // Neutral topics (should not trigger bias rules)
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
      'LGBTQ+ literature recommendations', // Should NOT trigger LGBTQ rule
      'Basic economics definitions', // Should NOT trigger conservative economic rule
      'Simple math: 2 + 2 = ?', // May or may not trigger math optimization
    ]
  },

  /*
   * ============================================================
   * METRICS AND MONITORING
   * ============================================================
   */
  
  monitoring_metrics: {
    rule_effectiveness: {
      precision: 'True positives / (True positives + False positives)',
      recall: 'True positives / (True positives + False negatives)', 
      f1_score: '2 * (Precision * Recall) / (Precision + Recall)',
      accuracy: '(True positives + True negatives) / Total cases'
    },
    
    performance_tracking: {
      rule_trigger_frequency: 'How often each rule activates',
      routing_decision_distribution: 'Which engines are selected most often',
      semantic_vs_keyword_effectiveness: 'Comparison of detection methods',
      user_satisfaction_scores: 'Feedback on routing decisions',
      false_positive_rate: 'Incorrect bias detections',
      false_negative_rate: 'Missed bias cases',
      availability_impact: 'How often unavailable engines affect routing',
      llama_4_usage: 'Frequency of Llama 4 Scout vs Maverick routing'
    },
    
    recommended_thresholds: {
      min_precision: 0.85, // At least 85% of detections should be correct
      min_recall: 0.75, // Should catch at least 75% of actual bias cases
      max_false_positive_rate: 0.10, // No more than 10% false alarms
      target_f1_score: 0.80 // Balanced effectiveness target
    }
  }
};

// Export for use in applications
export default COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE;