'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  ErrorBoundary
} from 'react';

import COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE from './bias-mitigation-rules.js';

import {
  Send,
  Settings,
  MessageSquare,
  AlertTriangle,
  Brain,
  Shield,
  Star,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Zap,
  Clipboard,
  ClipboardCheck,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Filter,
  TrendingUp,
  Award,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

/* ===================================================================
   UTILITY FUNCTIONS (defined first to ensure availability)
   =================================================================== */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance between strings
 */
const calculateLevenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Find fuzzy keyword matches with support for structured word objects
 * @param {string} text - Text to search in (should be lowercase)
 * @param {Array} keywords - Array of keywords (strings or objects with word/fuzzy properties)
 * @param {number} maxDistance - Maximum edit distance for fuzzy matching
 * @returns {Array} - Array of match objects
 */
const findFuzzyKeywordMatches = (text, keywords, maxDistance = 1) => {
  const matches = [];
  const words = text.split(/\s+/);
  
  for (const keywordItem of keywords) {
    // Handle both string and object formats
    const keyword = typeof keywordItem === 'string' ? keywordItem : keywordItem.word;
    const allowFuzzy = typeof keywordItem === 'string' ? true : (keywordItem.fuzzy !== false);
    const keywordLower = keyword.toLowerCase();
    
    // Check for exact matches first (most efficient)
    if (text.includes(keywordLower)) {
      matches.push({
        keyword: keyword,
        matched_word: keywordLower,
        type: 'exact',
        distance: 0,
        position: text.indexOf(keywordLower)
      });
      continue;
    }
    
    // Only do fuzzy matching if allowed for this keyword
    if (!allowFuzzy) {
      continue;
    }
    
    // Check for fuzzy matches
    let bestMatch = null;
    let bestDistance = maxDistance + 1;
    
    // Split keyword into words for multi-word matching
    const keywordWords = keywordLower.split(/\s+/);
    
    if (keywordWords.length === 1) {
      // Single word keyword - check against all words in text
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Skip very short words unless keyword is also short
        if (word.length < 3 && keywordLower.length >= 3) continue;
        
        // Calculate distance
        const distance = calculateLevenshteinDistance(keywordLower, word);
        
        // Check if this is a good fuzzy match
        if (distance <= maxDistance && distance < bestDistance) {
          // Additional check: make sure the match makes sense
          // (avoid matching very different length words unless distance is very small)
          const lengthDiff = Math.abs(keywordLower.length - word.length);
          if (distance <= 1 || lengthDiff <= distance) {
            bestMatch = {
              keyword: keyword,
              matched_word: word,
              type: 'fuzzy',
              distance: distance,
              position: text.indexOf(word)
            };
            bestDistance = distance;
          }
        }
      }
    } else {
      // Multi-word keyword - check for phrase matches with some flexibility
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const textPhrase = words.slice(i, i + keywordWords.length).join(' ');
        const distance = calculateLevenshteinDistance(keywordLower, textPhrase);
        
        if (distance <= maxDistance && distance < bestDistance) {
          bestMatch = {
            keyword: keyword,
            matched_word: textPhrase,
            type: 'fuzzy',
            distance: distance,
            position: text.indexOf(textPhrase)
          };
          bestDistance = distance;
        }
      }
    }
    
    if (bestMatch) {
      matches.push(bestMatch);
    }
  }
  
  return matches;
};

/**
 * Generate clear performance comparison messages
 * @param {string} engineA - Better performing engine name
 * @param {number} scoreA - Better engine's score
 * @param {string} engineB - Current engine name  
 * @param {number} scoreB - Current engine's score
 * @param {number} threshold - Threshold for routing decisions
 * @returns {Object} - Various message formats
 */
const generatePerformanceMessage = (engineA, scoreA, engineB, scoreB, threshold) => {
  const absoluteDiff = scoreA - scoreB;
  
  return {
    // For display to users
    displayMessage: `${absoluteDiff.toFixed(1)} points higher (${scoreA}% vs ${scoreB}%)`,
    
    // For UI explanations
    explanationMessage: `${engineA} scores ${scoreA}% vs ${engineB} at ${scoreB}%`,
    
    // Simple summary
    shortMessage: `+${absoluteDiff.toFixed(1)} points (${scoreA}% vs ${scoreB}%)`
  };
};

// Feedback system utilities
const saveFeedbackRecord = (feedbackData) => {
  try {
    const feedbackRecord = {
      ...feedbackData,
      id: Date.now() + Math.random(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const existingFeedback = JSON.parse(
      localStorage.getItem('mixtureOfVoices_feedback') || '[]'
    );
    
    existingFeedback.push(feedbackRecord);
    
    if (existingFeedback.length > 1000) {
      existingFeedback.splice(0, existingFeedback.length - 1000);
    }
    
    localStorage.setItem('mixtureOfVoices_feedback', JSON.stringify(existingFeedback));

    if (existingFeedback.length % 10 === 0) {
      downloadFeedbackFile(existingFeedback);
    }

    console.log('Feedback saved:', feedbackRecord);
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};

const downloadFeedbackFile = (feedbackData) => {
  try {
    const dataStr = JSON.stringify(feedbackData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mixture-of-voices-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading feedback file:', error);
  }
};

/* ===================================================================
   GOAL-BASED ROUTING ENGINE
   =================================================================== */

/**
 * Calculate goal achievement score for an engine
 * @param {Object} engine - Engine configuration
 * @param {Object} goals - Goals with weights and thresholds
 * @returns {number} - Overall goal achievement score
 */
const calculateGoalScore = (engine, goals) => {
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [goalName, goalConfig] of Object.entries(goals)) {
    const weight = goalConfig.weight || 1;
    const engineScore = engine.goal_achievements?.[goalName] || 0;
    
    totalScore += engineScore * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

/**
 * Check if engine meets minimum thresholds for all goals
 * @param {Object} engine - Engine configuration
 * @param {Object} goals - Goals with thresholds
 * @returns {boolean} - Whether engine meets all thresholds
 */
const meetsGoalThresholds = (engine, goals) => {
  for (const [goalName, goalConfig] of Object.entries(goals)) {
    const threshold = goalConfig.threshold || 0;
    const engineScore = engine.goal_achievements?.[goalName] || 0;
    
    if (engineScore < threshold) {
      return false;
    }
  }
  return true;
};

/**
 * Check if engine has conflicting capabilities
 * @param {Object} engine - Engine configuration
 * @param {Array} conflictingCapabilities - Array of conflicting capability names
 * @returns {boolean} - Whether engine has conflicts
 */
const hasConflictingCapabilities = (engine, conflictingCapabilities = []) => {
  const engineConflicts = engine.conflicting_capabilities || [];
  return conflictingCapabilities.some(conflict => engineConflicts.includes(conflict));
};

/**
 * Select best engine based on goals
 * @param {Object} goals - Required goals with weights/thresholds
 * @param {Array} conflictingCapabilities - Capabilities to avoid
 * @param {Array} availableEngines - Available engine IDs
 * @param {Object} engineDatabase - Engine configurations
 * @returns {Object|null} - Selected engine info or null
 */
const selectEngineForGoals = (goals, conflictingCapabilities, availableEngines, engineDatabase) => {
  const candidates = availableEngines
    .map(engineId => ({ id: engineId, ...engineDatabase[engineId] }))
    .filter(engine => {
      // Must not have conflicting capabilities
      if (hasConflictingCapabilities(engine, conflictingCapabilities)) {
        return false;
      }
      
      // Must meet minimum thresholds
      if (!meetsGoalThresholds(engine, goals)) {
        return false;
      }
      
      return true;
    })
    .map(engine => ({
      ...engine,
      goalScore: calculateGoalScore(engine, goals)
    }))
    .sort((a, b) => b.goalScore - a.goalScore);

  return candidates.length > 0 ? candidates[0] : null;
};

/**
 * Generate explanation for goal-based routing
 * @param {Object} selectedEngine - Selected engine
 * @param {Object} goals - Required goals
 * @param {Array} conflictingCapabilities - Avoided capabilities
 * @param {Array} availableEngines - All available engines
 * @param {string} currentEngine - Originally selected engine
 * @returns {string} - Human-readable explanation
 */
const generateGoalBasedExplanation = (selectedEngine, goals, conflictingCapabilities, availableEngines, currentEngine, triggerReason) => {
  const primaryGoal = Object.keys(goals)[0];
  const goalScore = selectedEngine.goalScore;
  
  let explanation = `🎯 GOAL-BASED ROUTING (${triggerReason}): `;
  
  if (selectedEngine.id === currentEngine) {
    explanation += `Current engine ${selectedEngine.name} is optimal for achieving ${primaryGoal.replace(/_/g, ' ')} `;
    explanation += `(${(goalScore * 100).toFixed(1)}% goal achievement)`;
  } else {
    explanation += `Routed to ${selectedEngine.name} to achieve ${primaryGoal.replace(/_/g, ' ')} `;
    explanation += `(${(goalScore * 100).toFixed(1)}% goal achievement)`;
    
    if (conflictingCapabilities.length > 0) {
      explanation += `. Previous engine avoided due to ${conflictingCapabilities.join(', ').replace(/_/g, ' ')}`;
    }
  }
  
  return explanation;
};

/* ===================================================================
   ERROR BOUNDARY COMPONENT
   =================================================================== */

class SemanticErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Semantic processing error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-red-50 border-red-200">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-red-600">Semantic Processing Error</span>
            <span className="text-xs text-red-500">Falling back to keyword detection</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ===================================================================
   SEMANTIC PROCESSING ENGINE
   =================================================================== */

let transformersModule = null;
let embeddingPipeline = null;
let isEmbeddingModelLoaded = false;

const loadEmbeddingModel = async () => {
  if (isEmbeddingModelLoaded && embeddingPipeline) return embeddingPipeline;
  
  try {
    if (!transformersModule) {
      transformersModule = await import('@xenova/transformers');
    }
    
    console.log('Loading BGE-base embedding model (512 tokens)...');
    embeddingPipeline = await transformersModule.pipeline(
      'feature-extraction', 
      'Xenova/bge-base-en-v1.5',
      { 
        quantized: true,
        revision: 'main'
      }
    );
    
    isEmbeddingModelLoaded = true;
    console.log('✅ BGE embedding model loaded successfully');
    return embeddingPipeline;
  } catch (error) {
    console.error('Failed to load embedding model:', error);
    throw new Error('Semantic processing unavailable');
  }
};

const generateEmbedding = async (text) => {
  try {
    const pipeline = await loadEmbeddingModel();
    
    const maxLength = 380;
    const truncatedText = text.length > maxLength ? 
      text.substring(0, maxLength) + '...' : text;
    
    console.log(`Generating embedding for: "${truncatedText.substring(0, 100)}..."`);
    
    const output = await pipeline(truncatedText, {
      pooling: 'mean',
      normalize: true
    });
    
    const embedding = Array.from(output.data);
    console.log(`✅ Generated ${embedding.length}D embedding`);
    
    return embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
};

const calculateCosineSimilarity = (embeddingA, embeddingB) => {
  if (!embeddingA || !embeddingB || embeddingA.length !== embeddingB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embeddingA.length; i++) {
    dotProduct += embeddingA[i] * embeddingB[i];
    normA += embeddingA[i] * embeddingA[i];
    normB += embeddingB[i] * embeddingB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const generateRuleEmbeddings = async (rulesDatabase) => {
  console.log('📄 Pre-generating semantic embeddings for bias detection rules...');
  
  const updatedRules = [];
  
  for (const rule of rulesDatabase.routing_rules) {
    try {
      // Extract words from both string and object formats
      const topicWords = (rule.triggers.topics || []).map(item => 
        typeof item === 'string' ? item : item.word
      );
      const dogWhistleWords = (rule.triggers.dog_whistles || []).map(item =>
        typeof item === 'string' ? item : item.word
      );
      
      const trainingExamples = [
        ...topicWords.slice(0, 5),
        ...dogWhistleWords.slice(0, 3)
      ];
      
      console.log(`Generating embeddings for rule: ${rule.id}`);
      
      const embeddings = [];
      for (const example of trainingExamples) {
        try {
          const embedding = await generateEmbedding(example);
          embeddings.push(embedding);
        } catch (error) {
          console.warn(`Failed to generate embedding for "${example}":`, error);
        }
      }
      
      if (embeddings.length > 0) {
        const avgEmbedding = embeddings[0].map((_, i) => 
          embeddings.reduce((sum, emb) => sum + emb[i], 0) / embeddings.length
        );
        
        const updatedRule = {
          ...rule,
          semantic_embedding: avgEmbedding,
          semantic_threshold: rule.confidence_threshold || 0.75
        };
        
        updatedRules.push(updatedRule);
        console.log(`✅ Generated semantic pattern for rule: ${rule.id}`);
      } else {
        updatedRules.push(rule);
        console.warn(`⚠️ No semantic embedding generated for rule: ${rule.id}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error processing rule ${rule.id}:`, error);
      updatedRules.push(rule);
    }
  }
  
  console.log('✅ Semantic rule generation complete');
  return { ...rulesDatabase, routing_rules: updatedRules };
};

/* ===================================================================
   POSITIVE ROUTING ENGINE
   =================================================================== */

const analyzeQueryForPositiveRouting = (query, availableEngines, positiveRoutingThreshold = 5, currentEngine = 'llama') => {
  const lowerQuery = query.toLowerCase();
  const categoryScores = {};
  
  const taskCategories = COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE.positive_routing_data.task_categories;
  
  console.log(`🔍 Positive routing analysis for: "${query}" (current: ${currentEngine})`);
  
  Object.entries(taskCategories).forEach(([category, data]) => {
    let score = 0;
    const scoreDetails = [];
    
    // Apply fuzzy matching with more lenient distance for positive routing
    const keywordMatches = findFuzzyKeywordMatches(lowerQuery, data.keywords, 2);
    if (keywordMatches.length > 0) {
      score += keywordMatches.length;
      scoreDetails.push(`${keywordMatches.length} keyword matches`);
    }
    
    // Add exact substring matching as backup
    data.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1; // Full point for exact substring match
        scoreDetails.push(`exact match: "${keyword}"`);
      }
    });
    
    // Add specific pattern matching for common cases
    if (category === 'coding') {
      // Check for common programming patterns
      if (lowerQuery.match(/write.*program|create.*code|build.*app|develop.*software|debug.*code|implement.*function|generate.*script/)) {
        score += 3; // Increased bonus for programming patterns
        scoreDetails.push('programming pattern detected');
      }
      // Check for language names (even with typos)
      if (lowerQuery.match(/python|javascript|java|react|html|css|sql|git|php|ruby|swift|kotlin|pythno/)) {
        score += 2; // Bonus for language detection
        scoreDetails.push('programming language detected');
      }
    }
    
    if (category === 'mathematics') {
      // Check for math patterns
      if (lowerQuery.match(/solve.*equation|calculate|find.*derivative|integral|probability|theorem|proof/)) {
        score += 3;
        scoreDetails.push('math pattern detected');
      }
    }
    
    if (category === 'reasoning') {
      // Check for reasoning patterns  
      if (lowerQuery.match(/logic.*puzzle|who.*owns|if.*all.*and.*some|deduce|infer|analyze.*argument/)) {
        score += 3;
        scoreDetails.push('reasoning pattern detected');
      }
    }
    
    if (category === 'multimodal') {
      // Check for multimodal patterns
      if (lowerQuery.match(/analyze.*image|describe.*photo|what.*see.*picture|chart.*analysis|visual/)) {
        score += 3;
        scoreDetails.push('multimodal pattern detected');
      }
    }
    
    if (score > 0) {
      categoryScores[category] = score;
      console.log(`📊 Positive routing: ${category} scored ${score} points (${scoreDetails.join(', ')})`);
    }
  });
  
  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
  
  if (!topCategory) {
    console.log('ℹ️ No positive routing category matched');
    return null;
  }
  
  const [categoryName, matchScore] = topCategory;
  const categoryData = taskCategories[categoryName];
  
  console.log(`🎯 Top category: ${categoryName} with score ${matchScore}`);
  
  const availablePerformers = categoryData.top_performers.filter(
    performer => availableEngines.includes(performer.engine)
  );
  
  if (availablePerformers.length === 0) {
    console.log(`⚠️ No engines available for ${categoryName}`);
    return null;
  }
  
  const bestEngine = availablePerformers[0];
  
  // Compare best engine against current/default engine, not second-best available
  const currentEnginePerformance = categoryData.top_performers.find(p => p.engine === currentEngine);
  
  if (!currentEnginePerformance) {
    console.log(`⚠️ Current engine ${currentEngine} not found in ${categoryName} performance data`);
    return null;
  }
  
  // Skip routing if current engine is already the best
  if (bestEngine.engine === currentEngine) {
    console.log(`ℹ️ Current engine ${currentEngine} is already optimal for ${categoryName}`);
    return null;
  }
  
  // Calculate absolute difference for threshold comparison
  const absoluteDifference = bestEngine.score - currentEnginePerformance.score;
  
  console.log(`📈 Performance comparison: ${bestEngine.engine} (${bestEngine.score}%) vs ${currentEngine} (${currentEnginePerformance.score}%) = ${absoluteDifference.toFixed(1)} point advantage`);
  
  // Generate clear performance message
  const performanceMsg = generatePerformanceMessage(
    bestEngine.engine, 
    bestEngine.score, 
    currentEngine, 
    currentEnginePerformance.score, 
    positiveRoutingThreshold
  );
  
  // Always return information, but indicate whether routing should be applied
  const shouldRoute = absoluteDifference >= positiveRoutingThreshold;
  
  if (shouldRoute) {
    console.log(`✅ Positive routing triggered: ${categoryName} -> ${bestEngine.engine}`);
  } else {
    console.log(`📉 Point difference ${absoluteDifference.toFixed(1)} below ${positiveRoutingThreshold} point threshold`);
  }
  
  return {
    category: categoryName,
    categoryDescription: categoryData.description,
    matchScore,
    recommendedEngine: bestEngine.engine,
    engineScore: bestEngine.score,
    currentEngineScore: currentEnginePerformance.score,
    absoluteDifference: absoluteDifference.toFixed(1),
    threshold: positiveRoutingThreshold,
    shouldRoute: shouldRoute,
    reasoning: shouldRoute ? 
      `Detected ${categoryName} task (score: ${matchScore}). ${performanceMsg.explanationMessage} - routing to better engine.` :
      `Detected ${categoryName} task (score: ${matchScore}). ${performanceMsg.explanationMessage} - staying with current engine due to threshold.`
  };
};

/* ===================================================================
   UI COMPONENTS
   =================================================================== */

const FeedbackButtons = memo(function FeedbackButtons({ 
  message, 
  onFeedback 
}) {
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const handleFeedback = useCallback((isPositive) => {
    if (!onFeedback) {
      console.warn('onFeedback prop not provided to FeedbackButtons');
      return;
    }

    const feedbackData = {
      timestamp: new Date().toISOString(),
      prompt: message.content.substring(0, 500),
      routingDestination: message.engine,
      routingRationale: message.routingAnalysis?.reasoning || 'No routing analysis available',
      feedback: isPositive ? 'positive' : 'negative',
      detectionMethods: message.routingAnalysis?.detectionMethods || [],
      semanticProcessingUsed: message.routingAnalysis?.semanticProcessingUsed || false,
      positiveRoutingUsed: message.routingAnalysis?.positiveRoutingUsed || false,
      goalBasedRouting: message.routingAnalysis?.goalBasedRouting || false
    };

    try {
      onFeedback(feedbackData);
      setFeedbackGiven(isPositive ? 'positive' : 'negative');
      
      setTimeout(() => setFeedbackGiven(null), 3000);
    } catch (error) {
      console.error('Error calling onFeedback:', error);
    }
  }, [message, onFeedback]);

  if (!onFeedback) {
    return null;
  }

  if (feedbackGiven) {
    return (
      <div className="mt-2 text-xs text-green-600">
        ✓ Feedback recorded - thank you!
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center space-x-2">
      <span className="text-xs text-slate-500">Was this routing helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
        title="This routing was helpful"
      >
        👍 Yes
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        title="This routing was not helpful"
      >
        👎 No
      </button>
    </div>
  );
});

const CodeBlock = memo(function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? '');
  const language = className ? className.replace('language-', '') : 'code';

  if (inline) {
    return (
      <code className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm font-mono border">
        {code}
      </code>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Split code into lines for line numbers
  const lines = code.split('\n');
  
  // Get language-specific colors
  const getLanguageColor = (lang) => {
    const colors = {
      python: 'text-blue-600',
      javascript: 'text-yellow-600',
      typescript: 'text-blue-500',
      html: 'text-orange-600',
      css: 'text-purple-600',
      java: 'text-red-600',
      cpp: 'text-blue-800',
      c: 'text-blue-800',
      sql: 'text-green-600',
      bash: 'text-gray-600',
      shell: 'text-gray-600',
      json: 'text-green-500',
      xml: 'text-orange-500',
      markdown: 'text-gray-700',
    };
    return colors[lang.toLowerCase()] || 'text-slate-600';
  };

  return (
    <div className="my-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className={`text-sm font-semibold ${getLanguageColor(language)}`}>
            {language}
          </span>
        </div>
        <button
          onClick={onCopy}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            copied 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
          }`}
          title="Copy code"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Code Content */}
      <div className="bg-gray-900 relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="flex-shrink-0 px-4 py-4 bg-gray-800 border-r border-gray-700 select-none">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs leading-6 text-gray-400 text-right font-mono"
                style={{ minWidth: '2rem' }}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Code */}
          <div className="flex-1 overflow-x-auto">
            <pre className="p-4 text-sm font-mono leading-6 text-gray-100 whitespace-pre">
              <code className="language-{language}">
                {lines.map((line, index) => (
                  <div key={index} className="hover:bg-gray-800 hover:bg-opacity-50 px-2 -mx-2 rounded">
                    {line || '\u00A0'}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
});

const MarkdownMessage = memo(function MarkdownMessage({ content }) {
  const mathElementRef = useRef(null);
  
  const parseInlineMarkdown = (text) => {
    // Simple inline markdown parsing that's safe and reliable
    let processed = text;
    
    // Handle inline code first to avoid conflicts
    processed = processed.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-sm">${code}</code>`;
    });
    
    // Handle bold
    processed = processed.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
      return `<strong class="font-semibold text-slate-900">${text}</strong>`;
    });
    
    // Handle italic
    processed = processed.replace(/\*([^*]+)\*/g, (match, text) => {
      return `<em class="italic text-slate-800">${text}</em>`;
    });
    
    return processed;
  };

  const renderContent = () => {
    const lines = content.split('\n');
    const elements = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        i++;
        continue;
      }
      
      // Code blocks
      if (line.trim().startsWith('```')) {
        const language = line.trim().slice(3).trim();
        const codeLines = [];
        i++;
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        if (i < lines.length) i++; // Skip closing ```
        
        elements.push(
          <CodeBlock 
            key={elements.length} 
            className={language ? `language-${language}` : ''}
            inline={false}
          >
            {codeLines.join('\n')}
          </CodeBlock>
        );
        continue;
      }
      
      // Display Math blocks ($...$) and LaTeX display math blocks (\[...\])
      if (line.trim().startsWith('$') || line.trim().startsWith('\\[')) {
        const isLatex = line.trim().startsWith('\\[');
        const mathLines = [line];
        i++;
        
        // Collect all math lines
        while (i < lines.length) {
          if (isLatex && lines[i].trim().includes('\\]')) {
            mathLines.push(lines[i]);
            i++;
            break;
          } else if (!isLatex && lines[i].trim().endsWith('$')) {
            mathLines.push(lines[i]);
            i++;
            break;
          } else {
            mathLines.push(lines[i]);
            i++;
          }
        }
        
        // Clean up the math content
        let mathContent = mathLines.join('\n');
        
        // Remove LaTeX delimiters
        mathContent = mathContent.replace(/^\\\[|\\\]$/g, '');
        mathContent = mathContent.replace(/^\$|\$$/g, '');
        
        // Convert common LaTeX to readable text - comprehensive list
        mathContent = mathContent
          // Fractions and roots (handle nested braces more carefully)
          .replace(/\\(?:d|df|tf|c)?frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '($1)/($2)')
          .replace(/\\sqrt\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '√($1)')
          .replace(/\\sqrt\s*\[([^\]]+)\]\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1√($2)')
          
          // Boxing and highlighting (handle before the catch-all)
          .replace(/\\boxed\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '[$1]')
          .replace(/\\fbox\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '[$1]')
          .replace(/\\frame\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '[$1]')
          .replace(/\\colorbox\s*\{[^}]*\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1')
          .replace(/\\fcolorbox\s*\{[^}]*\}\s*\{[^}]*\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '$1')
          
          // Basic operators
          .replace(/\\pm/g, '±')
          .replace(/\\mp/g, '∓')
          .replace(/\\cdot/g, '·')
          .replace(/\\times/g, '×')
          .replace(/\\div/g, '÷')
          .replace(/\\ast/g, '*')
          .replace(/\\star/g, '⋆')
          .replace(/\\circ/g, '∘')
          .replace(/\\bullet/g, '•')
          
          // Comparison operators
          .replace(/\\leq/g, '≤')
          .replace(/\\le/g, '≤')
          .replace(/\\geq/g, '≥')
          .replace(/\\ge/g, '≥')
          .replace(/\\neq/g, '≠')
          .replace(/\\ne/g, '≠')
          .replace(/\\approx/g, '≈')
          .replace(/\\equiv/g, '≡')
          .replace(/\\sim/g, '∼')
          .replace(/\\simeq/g, '≃')
          .replace(/\\cong/g, '≅')
          .replace(/\\propto/g, '∝')
          
          // Set operations
          .replace(/\\cup/g, '∪')
          .replace(/\\cap/g, '∩')
          .replace(/\\subset/g, '⊂')
          .replace(/\\supset/g, '⊃')
          .replace(/\\subseteq/g, '⊆')
          .replace(/\\supseteq/g, '⊇')
          .replace(/\\in/g, '∈')
          .replace(/\\notin/g, '∉')
          .replace(/\\emptyset/g, '∅')
          
          // Arrows
          .replace(/\\to/g, '→')
          .replace(/\\rightarrow/g, '→')
          .replace(/\\leftarrow/g, '←')
          .replace(/\\leftrightarrow/g, '↔')
          .replace(/\\Rightarrow/g, '⇒')
          .replace(/\\Leftarrow/g, '⇐')
          .replace(/\\Leftrightarrow/g, '⇔')
          
          // Special symbols
          .replace(/\\infty/g, '∞')
          .replace(/\\partial/g, '∂')
          .replace(/\\nabla/g, '∇')
          .replace(/\\angle/g, '∠')
          .replace(/\\perp/g, '⊥')
          .replace(/\\parallel/g, '∥')
          .replace(/\\degree/g, '°')
          
          // Greek letters (lowercase)
          .replace(/\\alpha/g, 'α')
          .replace(/\\beta/g, 'β')
          .replace(/\\gamma/g, 'γ')
          .replace(/\\delta/g, 'δ')
          .replace(/\\epsilon/g, 'ε')
          .replace(/\\varepsilon/g, 'ε')
          .replace(/\\zeta/g, 'ζ')
          .replace(/\\eta/g, 'η')
          .replace(/\\theta/g, 'θ')
          .replace(/\\vartheta/g, 'ϑ')
          .replace(/\\iota/g, 'ι')
          .replace(/\\kappa/g, 'κ')
          .replace(/\\lambda/g, 'λ')
          .replace(/\\mu/g, 'μ')
          .replace(/\\nu/g, 'ν')
          .replace(/\\xi/g, 'ξ')
          .replace(/\\pi/g, 'π')
          .replace(/\\varpi/g, 'ϖ')
          .replace(/\\rho/g, 'ρ')
          .replace(/\\varrho/g, 'ϱ')
          .replace(/\\sigma/g, 'σ')
          .replace(/\\varsigma/g, 'ς')
          .replace(/\\tau/g, 'τ')
          .replace(/\\upsilon/g, 'υ')
          .replace(/\\phi/g, 'φ')
          .replace(/\\varphi/g, 'φ')
          .replace(/\\chi/g, 'χ')
          .replace(/\\psi/g, 'ψ')
          .replace(/\\omega/g, 'ω')
          
          // Greek letters (uppercase)
          .replace(/\\Alpha/g, 'Α')
          .replace(/\\Beta/g, 'Β')
          .replace(/\\Gamma/g, 'Γ')
          .replace(/\\Delta/g, 'Δ')
          .replace(/\\Epsilon/g, 'Ε')
          .replace(/\\Zeta/g, 'Ζ')
          .replace(/\\Eta/g, 'Η')
          .replace(/\\Theta/g, 'Θ')
          .replace(/\\Iota/g, 'Ι')
          .replace(/\\Kappa/g, 'Κ')
          .replace(/\\Lambda/g, 'Λ')
          .replace(/\\Mu/g, 'Μ')
          .replace(/\\Nu/g, 'Ν')
          .replace(/\\Xi/g, 'Ξ')
          .replace(/\\Pi/g, 'Π')
          .replace(/\\Rho/g, 'Ρ')
          .replace(/\\Sigma/g, 'Σ')
          .replace(/\\Tau/g, 'Τ')
          .replace(/\\Upsilon/g, 'Υ')
          .replace(/\\Phi/g, 'Φ')
          .replace(/\\Chi/g, 'Χ')
          .replace(/\\Psi/g, 'Ψ')
          .replace(/\\Omega/g, 'Ω')
          
          // Mathematical operators
          .replace(/\\sum/g, 'Σ')
          .replace(/\\prod/g, 'Π')
          .replace(/\\int/g, '∫')
          .replace(/\\oint/g, '∮')
          .replace(/\\iint/g, '∬')
          .replace(/\\iiint/g, '∭')
          .replace(/\\lim/g, 'lim')
          .replace(/\\max/g, 'max')
          .replace(/\\min/g, 'min')
          .replace(/\\sup/g, 'sup')
          .replace(/\\inf/g, 'inf')
          .replace(/\\det/g, 'det')
          .replace(/\\exp/g, 'exp')
          .replace(/\\ln/g, 'ln')
          .replace(/\\log/g, 'log')
          .replace(/\\sin/g, 'sin')
          .replace(/\\cos/g, 'cos')
          .replace(/\\tan/g, 'tan')
          .replace(/\\sec/g, 'sec')
          .replace(/\\csc/g, 'csc')
          .replace(/\\cot/g, 'cot')
          .replace(/\\arcsin/g, 'arcsin')
          .replace(/\\arccos/g, 'arccos')
          .replace(/\\arctan/g, 'arctan')
          .replace(/\\sinh/g, 'sinh')
          .replace(/\\cosh/g, 'cosh')
          .replace(/\\tanh/g, 'tanh')
          
          // Formatting commands
          .replace(/\\text\s*\{([^}]+)\}/g, '$1')
          .replace(/\\mathrm\s*\{([^}]+)\}/g, '$1')
          .replace(/\\mathbf\s*\{([^}]+)\}/g, '**$1**')
          .replace(/\\mathit\s*\{([^}]+)\}/g, '*$1*')
          .replace(/\\mathcal\s*\{([^}]+)\}/g, '$1')
          .replace(/\\mathbb\s*\{([^}]+)\}/g, '$1')
          .replace(/\\mathfrak\s*\{([^}]+)\}/g, '$1')
          
          // Spacing and alignment
          .replace(/\\\\/g, '\n')
          .replace(/\\quad/g, '    ')
          .replace(/\\qquad/g, '        ')
          .replace(/\\,/g, ' ')
          .replace(/\\:/g, '  ')
          .replace(/\\;/g, '   ')
          .replace(/\\!/g, '')
          
          // Remove any remaining backslashes with common commands that might not be covered
          .replace(/\\[a-zA-Z]+/g, (match) => {
            console.warn(`Unhandled LaTeX command: ${match}`);
            return match.replace('\\', '');
          })
          
          // Clean up extra spaces
          .replace(/\s+/g, ' ')
          .trim();
        
        elements.push(
          <div 
            key={elements.length} 
            className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center overflow-x-auto"
          >
            <div className="font-mono text-sm text-blue-900 whitespace-pre-wrap">
              {mathContent}
            </div>
          </div>
        );
        continue;
      }
      
      // Headers
      const headerMatch = line.match(/^(#{1,6})\s(.+)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const headerClasses = {
          1: 'text-2xl font-bold text-slate-900 mb-4 mt-6',
          2: 'text-xl font-bold text-slate-800 mb-3 mt-5',
          3: 'text-lg font-semibold text-slate-800 mb-3 mt-4',
          4: 'text-base font-semibold text-slate-700 mb-2 mt-3',
          5: 'text-sm font-semibold text-slate-700 mb-2 mt-3',
          6: 'text-sm font-medium text-slate-600 mb-2 mt-2'
        };
        
        const HeaderTag = `h${level}`;
        elements.push(
          React.createElement(
            HeaderTag,
            { 
              key: elements.length, 
              className: headerClasses[level],
              dangerouslySetInnerHTML: { __html: parseInlineMarkdown(text) }
            }
          )
        );
        i++;
        continue;
      }
      
      // Lists
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s(.+)/);
      if (listMatch) {
        const isOrdered = /^\d+\./.test(listMatch[2]);
        const listItems = [];
        const baseIndent = listMatch[1].length;
        
        while (i < lines.length) {
          const currentLine = lines[i];
          const currentMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s(.+)/);
          
          if (!currentMatch || currentMatch[1].length < baseIndent) {
            break;
          }
          
          if (currentMatch[1].length === baseIndent) {
            listItems.push(
              <li 
                key={listItems.length} 
                className="mb-1"
                dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(currentMatch[3]) }}
              />
            );
          }
          
          i++;
        }
        
        const ListTag = isOrdered ? 'ol' : 'ul';
        const listClass = isOrdered ? 
          'list-decimal list-inside mb-4 pl-4 text-slate-800' : 
          'list-disc list-inside mb-4 pl-4 text-slate-800';
        
        elements.push(
          React.createElement(
            ListTag,
            { 
              key: elements.length, 
              className: listClass 
            },
            listItems
          )
        );
        continue;
      }
      
      // Regular paragraphs
      const paragraphLines = [];
      while (i < lines.length && 
             lines[i].trim() && 
             !lines[i].match(/^#{1,6}\s/) && 
             !lines[i].match(/^(\s*)([-*+]|\d+\.)\s/) &&
             !lines[i].trim().startsWith('```') &&
             !lines[i].trim().startsWith('$') &&
             !lines[i].trim().startsWith('\\[')) {
        paragraphLines.push(lines[i]);
        i++;
      }
      
      if (paragraphLines.length > 0) {
        const paragraphText = paragraphLines.join(' ');
        elements.push(
          <p 
            key={elements.length} 
            className="mb-3 leading-relaxed text-slate-800"
            dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(paragraphText) }}
          />
        );
      }
    }
    
    return elements;
  };

  return (
    <div ref={mathElementRef} className="markdown-content">
      {renderContent()}
    </div>
  );
});

const ChatInput = memo(function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}) {
  const handleChange = useCallback(
    (e) => onChange(e.target.value),
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && value.trim()) onSend();
      }
    },
    [disabled, value, onSend]
  );

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
            rows={2}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
});

const SemanticStatusIndicator = memo(function SemanticStatusIndicator({ 
  status, 
  isGeneratingRuleEmbeddings 
}) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'loading':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Brain className="w-4 h-4 animate-pulse" />,
          label: 'Loading Semantic Model',
          description: 'Initializing 512-token BGE embedding model...'
        };
      case 'ready':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <Brain className="w-4 h-4" />,
          label: 'Semantic Processing Active',
          description: 'Advanced bias detection with vector similarity'
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'Semantic Processing Unavailable',
          description: 'Using keyword + dog whistle detection only'
        };
      default:
        return {
          color: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          icon: <Brain className="w-4 h-4" />,
          label: 'Starting Up',
          description: 'Preparing semantic analysis...'
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <SemanticErrorBoundary>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <div className={statusInfo.color}>
          {statusInfo.icon}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-xs text-slate-500">
            {isGeneratingRuleEmbeddings ? 'Generating rule embeddings...' : statusInfo.description}
          </span>
        </div>
      </div>
    </SemanticErrorBoundary>
  );
});

const PositiveRoutingIndicator = memo(function PositiveRoutingIndicator({ 
  enabled, 
  routingAnalysis 
}) {
  if (!enabled) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-slate-50 border-slate-200">
        <TrendingUp className="w-4 h-4 text-slate-400" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-600">Positive Routing</span>
          <span className="text-xs text-slate-500">Disabled</span>
        </div>
      </div>
    );
  }

  const isPositiveRouted = routingAnalysis?.positiveRoutingUsed;
  const isGoalBased = routingAnalysis?.goalBasedRouting;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
      isPositiveRouted ? 'bg-emerald-50 border-emerald-200' : 
      isGoalBased ? 'bg-blue-50 border-blue-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className={isPositiveRouted ? 'text-emerald-600' : isGoalBased ? 'text-blue-600' : 'text-blue-600'}>
        {isPositiveRouted ? <Award className="w-4 h-4" /> : 
         isGoalBased ? <Target className="w-4 h-4" /> : 
         <TrendingUp className="w-4 h-4" />}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isPositiveRouted ? 'text-emerald-600' : isGoalBased ? 'text-blue-600' : 'text-blue-600'}`}>
          {isPositiveRouted ? 'Performance Optimized' : 
           isGoalBased ? 'Goal-Based Routing' :
           'Smart Routing Active'}
        </span>
        <span className="text-xs text-slate-500">
          {isPositiveRouted ? `${routingAnalysis.positiveRouting?.category || ''} task detected` : 
           isGoalBased ? 'Capability-driven selection' :
           'Ready for optimization'}
        </span>
      </div>
    </div>
  );
});

const RuleCard = memo(function RuleCard({ rule, getEngineInfo }) {
  const [expanded, setExpanded] = useState(false);

  const getRuleTypeInfo = (type) => {
    if (type === 'avoidance') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <Shield className="w-4 h-4" />,
        label: 'Avoidance Rule'
      };
    } else if (type === 'preference') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Target className="w-4 h-4" />,
        label: 'Preference Rule'
      };
    } else {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <Target className="w-4 h-4" />,
        label: 'Goal-Based Rule'
      };
    }
  };

  const typeInfo = getRuleTypeInfo(rule.rule_type);

  // Extract topics from both string and object formats for display
  const topicWords = (rule.triggers?.topics || []).map(item => 
    typeof item === 'string' ? item : item.word
  );

  return (
    <div className={`border rounded-lg overflow-hidden ${typeInfo.borderColor}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 text-left ${typeInfo.bgColor} hover:opacity-80 transition-opacity flex items-center justify-between`}
      >
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 ${typeInfo.color}`}>
            {typeInfo.icon}
            <span className="text-sm font-medium">{typeInfo.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
              Priority {rule.priority}
            </span>
            {rule.confidence_threshold && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {Math.round(rule.confidence_threshold * 100)}% confidence
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">
            {topicWords.length} triggers
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="p-4 bg-white border-t">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Rule Description</h4>
              <p className="text-sm text-slate-600">{rule.description}</p>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Why This Rule Exists</h4>
              <p className="text-sm text-slate-600">{rule.reason}</p>
            </div>

            {/* Goal-based information */}
            {rule.required_goals && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Required Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rule.required_goals).map(([goal, config]) => (
                    <span key={goal} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      <Target className="w-3 h-3" />
                      <span>{goal.replace(/_/g, ' ')}</span>
                      {config.weight && <span>({config.weight}x)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rule.conflicting_capabilities && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Conflicting Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {rule.conflicting_capabilities.map((capability, index) => (
                    <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      <span>⛔</span>
                      <span>{capability.replace(/_/g, ' ')}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Engine Routing Impact</h4>
              <div className="flex flex-wrap gap-2">
                {rule.avoid_engines && rule.avoid_engines.map(engineId => {
                  const engine = getEngineInfo(engineId);
                  return (
                    <span key={engineId} className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      <span>⛔</span>
                      <span>Avoids {engine.name}</span>
                    </span>
                  );
                })}
                {rule.prefer_engines && rule.prefer_engines.map(engineId => {
                  const engine = getEngineInfo(engineId);
                  return (
                    <span key={engineId} className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <span>✅</span>
                      <span>Prefers {engine.name}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Direct Keywords</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {topicWords.slice(0, 10).map((topic, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                  >
                    "{topic}"
                  </span>
                ))}
                {topicWords.length > 10 && (
                  <span className="text-xs text-slate-500">
                    +{topicWords.length - 10} more...
                  </span>
                )}
              </div>
            </div>

            {rule.triggers?.dog_whistles && rule.triggers.dog_whistles.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Dog Whistle Detection</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {rule.triggers.dog_whistles.slice(0, 8).map((phrase, index) => {
                    const dogWhistleWord = typeof phrase === 'string' ? phrase : phrase.word;
                    return (
                      <span 
                        key={index} 
                        className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                      >
                        "{dogWhistleWord}"
                      </span>
                    );
                  })}
                  {rule.triggers.dog_whistles.length > 8 && (
                    <span className="text-xs text-slate-500">
                      +{rule.triggers.dog_whistles.length - 8} more coded phrases...
                    </span>
                  )}
                </div>
                <p className="text-xs text-orange-600">
                  These phrases may appear neutral but often contain coded bias language
                </p>
              </div>
            )}

            {rule.examples && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Example Triggers</h4>
                {rule.examples.should_trigger && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-red-700 mb-1">Should Trigger:</h5>
                    <div className="space-y-1">
                      {rule.examples.should_trigger.slice(0, 3).map((example, index) => (
                        <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          "{example}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rule.examples.should_not_trigger && (
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Should NOT Trigger:</h5>
                    <div className="space-y-1">
                      {rule.examples.should_not_trigger.slice(0, 3).map((example, index) => (
                        <div key={index} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          "{example}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {rule.confidence_threshold && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Detection Sensitivity</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${rule.confidence_threshold * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600">
                    {Math.round(rule.confidence_threshold * 100)}% confidence
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Higher thresholds = more specific detection, lower false positives
                </p>
              </div>
            )}

            <div className={`p-3 rounded-lg ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
              <h4 className={`font-medium mb-1 ${typeInfo.color}`}>
                {rule.rule_type === 'goal-based' ? 'Goal-Based Impact' : 'Simple Routing Impact'}
              </h4>
              <p className="text-xs text-slate-600">
                {rule.required_goals ? 
                  `Routes to engines that achieve: ${Object.keys(rule.required_goals).join(', ').replace(/_/g, ' ')}` :
                  rule.rule_type === 'avoidance' 
                    ? `Messages containing "${topicWords[0]}" will route away from ${rule.avoid_engines?.map(e => getEngineInfo(e).name).join(' and ')}.`
                    : `Messages about "${topicWords[0]}" will prefer ${rule.prefer_engines?.map(e => getEngineInfo(e).name).join(' or ')}.`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const RulesViewer = memo(function RulesViewer({ rulesDatabase, getEngineInfo }) {
  const [filter, setFilter] = useState('all');

  const filteredRules = rulesDatabase.routing_rules.filter(rule => {
    if (filter === 'all') return true;
    if (filter === 'goal-based') return rule.required_goals;
    return rule.rule_type === filter;
  });

  const avoidanceRules = rulesDatabase.routing_rules.filter(r => r.rule_type === 'avoidance').length;
  const preferenceRules = rulesDatabase.routing_rules.filter(r => r.rule_type === 'preference').length;
  const goalBasedRules = rulesDatabase.routing_rules.filter(r => r.required_goals).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bias Mitigation Rules</h2>
            <p className="text-sm text-slate-600">
              Complete transparency into routing decisions and goal-based bias detection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Rules ({rulesDatabase.routing_rules.length})</option>
            <option value="goal-based">Goal-Based Rules ({goalBasedRules})</option>
            <option value="avoidance">Avoidance Rules ({avoidanceRules})</option>
            <option value="preference">Preference Rules ({preferenceRules})</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-slate-800">Total Rules</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{rulesDatabase.routing_rules.length}</p>
          <p className="text-xs text-slate-600">Active routing rules</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-slate-800">Goal-Based</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{goalBasedRules}</p>
          <p className="text-xs text-slate-600">Capability-driven rules</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-slate-800">Avoidance Rules</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{avoidanceRules}</p>
          <p className="text-xs text-slate-600">Routes away from problematic engines</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-slate-800">Preference Rules</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{preferenceRules}</p>
          <p className="text-xs text-slate-600">Routes to optimal engines</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="font-medium text-purple-800">Goal-Based Routing System</h3>
        </div>
        <div className="text-sm text-purple-700 space-y-2">
          <p><strong>1. Goal Definition:</strong> Rules define objectives to achieve rather than specific engines to use.</p>
          <p><strong>2. Capability Matching:</strong> Engines declare their goal achievement scores and conflicting capabilities.</p>
          <p><strong>3. Automatic Selection:</strong> System selects best available engine for each goal automatically.</p>
          <p><strong>4. Natural Explanations:</strong> Goals themselves become the routing rationale for full transparency.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-slate-800 mb-3">
          {filter === 'all' ? 'All Rules' : 
           filter === 'goal-based' ? 'Goal-Based Rules' :
           filter === 'avoidance' ? 'Avoidance Rules' : 'Preference Rules'}
          <span className="text-sm text-slate-500 ml-2">({filteredRules.length} rules)</span>
        </h3>
        
        {filteredRules.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Filter className="w-8 h-8 mx-auto mb-2" />
            <p>No rules match the current filter.</p>
          </div>
        ) : (
          filteredRules
            .sort((a, b) => a.priority - b.priority)
            .map((rule) => (
              <RuleCard 
                key={rule.id} 
                rule={rule} 
                getEngineInfo={getEngineInfo}
              />
            ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Rules Database Version: {rulesDatabase.metadata.version}</span>
          <span>Last Updated: {rulesDatabase.metadata.last_updated}</span>
        </div>
      </div>
    </div>
  );
});

/* ===================================================================
   MAIN PAGE COMPONENTS
   =================================================================== */

const ChatPage = memo(function ChatPage(props) {
  const {
    messages,
    routingAnalysis,
    selectedEngine,
    defaultEngine,
    availableEngines,
    getEngineInfo,
    handleExampleClick,
    isLoading,
    inputValue,
    setInputValue,
    handleSendMessage,
    setCurrentPage,
    messagesEndRef,
    rulesDatabase,
    saveDefaultEngine,
    semanticModelStatus,
    isGeneratingRuleEmbeddings,
    positiveRoutingEnabled,
    onFeedback,
    demoMode,
    setMessages,
    setRoutingAnalysis,
  } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setCurrentPage('chat');
              setMessages([]);
              setInputValue('');
              setRoutingAnalysis(null);
            }}
            title="Return to main page and start new conversation"
          >
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mixture of Voices</h1>
              <p className="text-sm text-slate-600">Goal-Based AI Routing with Bias Mitigation</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SemanticStatusIndicator 
              status={semanticModelStatus}
              isGeneratingRuleEmbeddings={isGeneratingRuleEmbeddings}
            />

            <PositiveRoutingIndicator 
              enabled={positiveRoutingEnabled}
              routingAnalysis={routingAnalysis}
            />

            {routingAnalysis && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm text-blue-700">
                    Routing: {getEngineInfo(routingAnalysis.recommendedEngine).name}
                  </span>
                  {routingAnalysis.semanticProcessingUsed && (
                    <span className="text-xs text-blue-600">Semantic analysis applied</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Default:</span>
              <select
                value={defaultEngine}
                onChange={(e) => saveDefaultEngine(e.target.value)}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={availableEngines.length === 0}
              >
                {availableEngines.length === 0 ? (
                  <option value="">No engines</option>
                ) : (
                  availableEngines.map((engineId) => {
                    const engine = getEngineInfo(engineId);
                    return (
                      <option key={engineId} value={engineId}>
                        {engine.name}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              AI Engines:
            </span>
            {Object.entries(rulesDatabase.engines).map(([engineId, engine]) => {
              const isAvailable = availableEngines.includes(engineId);
              const isDefault = engineId === defaultEngine;
              const isSelected = engineId === (routingAnalysis?.recommendedEngine || selectedEngine);
              const isPositiveRouted = routingAnalysis?.positiveRoutingUsed && engineId === routingAnalysis.recommendedEngine;
              const isGoalBased = routingAnalysis?.goalBasedRouting && engineId === routingAnalysis.recommendedEngine;

              return (
                <button
                  key={engineId}
                  disabled={!isAvailable}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 whitespace-nowrap transition-all duration-200 ${
                    !isAvailable
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? isPositiveRouted
                        ? 'border-emerald-500 bg-emerald-50 cursor-default'
                        : isGoalBased
                        ? 'border-blue-500 bg-blue-50 cursor-default'
                        : 'border-blue-500 bg-blue-50 cursor-default'
                      : isDefault
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  } ${isAvailable ? engine.color_class : 'bg-slate-100'}`}
                  title={
                    isAvailable
                      ? `${engine.name} - ${engine.bias_profile}`
                      : `${engine.name} - No API key configured`
                  }
                >
                  {isSelected && isAvailable && (
                    isPositiveRouted ? (
                      <Award className="w-4 h-4 text-emerald-600" />
                    ) : isGoalBased ? (
                      <Target className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Brain className="w-4 h-4 text-blue-600" />
                    )
                  )}
                  {isDefault && isAvailable && !isSelected && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {!isAvailable && <div className="w-4 h-4 rounded-full bg-slate-300" />}
                  <span className={`text-sm font-medium ${!isAvailable ? 'text-slate-400' : ''}`}>
                    {engine.name}
                  </span>
                  {!isAvailable && (
                    <span className="text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                      No Key
                    </span>
                  )}
                  {isSelected && isAvailable && routingAnalysis?.routingApplied && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isPositiveRouted ? 'bg-emerald-100 text-emerald-700' : 
                      isGoalBased ? 'bg-blue-100 text-blue-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {isPositiveRouted ? 'Optimized' : 
                       isGoalBased ? 'Goal-Based' :
                       'Auto-Routed'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Welcome to Mixture of Voices
                </h3>
                <p className="text-slate-500 mb-6">
                  Intelligent goal-based AI routing with bias mitigation and performance optimization. Try the examples below to see the system in action.
                </p>

                {availableEngines.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-amber-700">
                      No API keys configured. Please configure your API keys in{' '}
                      <span className="text-amber-800 underline font-medium cursor-pointer" onClick={() => setCurrentPage('settings')}>
                        Settings
                      </span>{' '}
                      to start using the platform.
                    </p>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <h4 className="text-md font-semibold text-slate-700 mb-4">
                      Examples Showcasing Goal-Based Routing:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <h5 className="font-medium text-red-800">Bias Protection</h5>
                        </div>
                        <p className="text-sm text-red-700 mb-3">
                          Routes to engines <strong>achieving unbiased coverage</strong> - protects against editorial constraints
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('What was the significance of the June Fourth incident?')}
                            className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-sm"
                          >
                            "What was the significance of the June Fourth incident?"
                          </button>
                          <button
                            onClick={() => handleExampleClick('What are some conspiracy theories about global banking?')}
                            className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-sm"
                          >
                            "What are some conspiracy theories about global banking?"
                          </button>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Award className="w-5 h-5 text-emerald-600" />
                          <h5 className="font-medium text-emerald-800">Performance Goals</h5>
                        </div>
                        <p className="text-sm text-emerald-700 mb-3">
                          Routes to engines <strong>achieving performance excellence</strong> - maximizes task success
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Solve this equation: 3x² + 7x - 12 = 0')}
                            className="w-full text-left p-2 bg-white rounded border border-emerald-200 hover:bg-emerald-50 transition-colors text-sm"
                          >
                            "Solve this equation: 3x² + 7x - 12 = 0"
                          </button>
                          <button
                            onClick={() => handleExampleClick('Write a Python function to implement binary search')}
                            className="w-full text-left p-2 bg-white rounded border border-emerald-200 hover:bg-emerald-50 transition-colors text-sm"
                          >
                            "Write a Python function to implement binary search"
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Target className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-800">Goal Achievement</h5>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          Routes to engines <strong>achieving reasoning excellence</strong> - handles complex logic optimally
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Solve this logic puzzle: Five people live in houses of different colors (red, green, blue, yellow, white), drink different beverages (coffee, tea, milk, juice, water), own different pets (dog, cat, bird, fish, zebra), work different jobs (doctor, teacher, engineer, artist, chef), and have different hobbies (reading, gardening, painting, music, sports). Clues: 1) The person in the red house drinks coffee. 2) The doctor owns a dog. 3) The person who drinks tea lives in the green house. 4) The teacher has a hobby of reading. 5) The person in the yellow house is an engineer. 6) The person who owns a cat drinks milk. 7) The artist lives in the blue house. 8) The person who gardens owns a bird. 9) The chef drinks juice. 10) The person in the white house plays music. Who owns the zebra?')}
                            className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
                          >
                            "Who owns the zebra? (Logic puzzle)"
                          </button>
                          <button
                            onClick={() => handleExampleClick('If all roses are flowers, and some flowers are red, can we conclude that some roses are red?')}
                            className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
                          >
                            "Logical deduction about roses and flowers"
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-slate-600" />
                          <h5 className="font-medium text-slate-800">General Topics</h5>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          Uses your <strong>default engine</strong> - no specific goals required
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('How does photosynthesis work in plants?')}
                            className="w-full text-left p-2 bg-white rounded border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                          >
                            "How does photosynthesis work in plants?"
                          </button>
                          <button
                            onClick={() => handleExampleClick('Write a creative story about a robot chef')}
                            className="w-full text-left p-2 bg-white rounded border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                          >
                            "Write a creative story about a robot chef"
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-purple-600" />
                        <h5 className="font-medium text-purple-800">Goal-Based Routing System</h5>
                      </div>
                      <p className="text-sm text-purple-700">
                        Our platform uses objective-driven routing where rules define goals to achieve rather than specific engines to use. Engines compete on capability scores, and the system automatically selects the best available option for each goal. Every decision is explained with full transparency.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2 text-xs text-slate-500">
                        <div
                          className={`w-2 h-2 rounded-full ${getEngineInfo(
                            message.engine
                          ).color_class.replace('bg-', 'bg-').replace('-100', '-500')}`}
                        />
                        <span>{getEngineInfo(message.engine).name}</span>
                        {message.routingAnalysis?.routingApplied && (
                          <span className="text-blue-600">• Auto-Routed</span>
                        )}
                        {message.routingAnalysis?.positiveRoutingUsed && (
                          <span className="text-emerald-600">• Optimized</span>
                        )}
                        {message.routingAnalysis?.goalBasedRouting && (
                          <span className="text-blue-600">• Goal-Based</span>
                        )}
                      </div>
                    )}

                    <div className="whitespace-pre-wrap break-words">
                      {message.type === 'ai' ? (
                        <MarkdownMessage content={message.content} />
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.routingAnalysis && message.type === 'ai' && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {/* Main routing decision */}
                        <div className="flex items-center space-x-2 mb-3">
                          {message.routingAnalysis.safetyOverride ? (
                            <Shield className="w-4 h-4 text-red-600" />
                          ) : message.routingAnalysis.positiveRoutingUsed ? (
                            <Award className="w-4 h-4 text-emerald-600" />
                          ) : message.routingAnalysis.goalBasedRouting ? (
                            <Target className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Brain className="w-4 h-4 text-slate-600" />
                          )}
                          <div>
                            <div className="font-medium text-slate-800 text-sm">
                              {message.routingAnalysis.safetyOverride ? 'Safety Protection Active' :
                               message.routingAnalysis.positiveRoutingUsed ? 'Performance Optimized' :
                               message.routingAnalysis.goalBasedRouting ? 'Goal-Based Routing' :
                               message.routingAnalysis.routingApplied ? 'Smart Routing Applied' : 'Default Engine Used'}
                            </div>
                            <div className="text-slate-600 text-xs">
                              Routed to <strong>{getEngineInfo(message.engine).name}</strong>
                              {message.routingAnalysis.semanticProcessingUsed && " • AI context analysis"}
                            </div>
                          </div>
                        </div>

                        {/* Simple explanation */}
                        <div className="mb-3 p-3 bg-white rounded border border-slate-200">
                          <div className="text-sm text-slate-700 leading-relaxed">
                            {message.routingAnalysis.safetyOverride ? (
                              <>
                                <strong>Why:</strong> Your question involves sensitive content that benefits from specialized capabilities. 
                                Routed to {getEngineInfo(message.engine).name} as it's better equipped for handling sensitive political content without editorial constraints.
                                {message.routingAnalysis.positiveRouting && (
                                  <span className="text-slate-500"> (Originally suggested {getEngineInfo(message.routingAnalysis.positiveRouting.recommendedEngine).name} for performance, but content-specific expertise took priority.)</span>
                                )}
                              </>
                            ) : message.routingAnalysis.positiveRoutingUsed ? (
                              <>
                                <strong>Why:</strong> Detected a <strong>{message.routingAnalysis.positiveRouting.category}</strong> task. 
                                {getEngineInfo(message.engine).name} performs {message.routingAnalysis.positiveRouting.absoluteDifference} points better 
                                ({message.routingAnalysis.positiveRouting.engineScore}% vs {message.routingAnalysis.positiveRouting.currentEngineScore}%) than {getEngineInfo(defaultEngine).name} on this type of work.
                              </>
                            ) : message.routingAnalysis.goalBasedRouting ? (
                              <>
                                <strong>Why:</strong> Your question requires specific capabilities. 
                                {getEngineInfo(message.engine).name} achieved {(message.routingAnalysis.goalBasedRoutingDetails.goalScore * 100).toFixed(0)}% goal match 
                                for the required objectives.
                              </>
                            ) : (
                              <>
                                <strong>Why:</strong> {message.routingAnalysis.reasoning}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Transparency notes */}
                        {message.routingAnalysis.transparencyNotes && message.routingAnalysis.transparencyNotes.length > 0 && (
                          <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs font-medium text-blue-700 mb-2">Additional Detection Info:</div>
                            <div className="space-y-1">
                              {message.routingAnalysis.transparencyNotes.map((note, index) => (
                                <div key={index} className="text-xs text-blue-700 leading-relaxed">
                                  • {note}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Detection methods summary */}
                        {message.routingAnalysis.detectionMethods && message.routingAnalysis.detectionMethods.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-slate-600 mb-2">Detection Methods:</div>
                            <div className="flex flex-wrap gap-2">
                              {message.routingAnalysis.detectionMethods.map((method, i) => (
                                <span key={i} className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  method === 'semantic' ? 'bg-purple-100 text-purple-700' :
                                  method === 'dog_whistle' ? 'bg-orange-100 text-orange-700' :
                                  method === 'positive_routing' ? 'bg-emerald-100 text-emerald-700' :
                                  method === 'goal_based' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {method === 'semantic' && <Brain className="w-3 h-3" />}
                                  {method === 'dog_whistle' && <AlertTriangle className="w-3 h-3" />}
                                  {method === 'positive_routing' && <TrendingUp className="w-3 h-3" />}
                                  {method === 'goal_based' && <Target className="w-3 h-3" />}
                                  {method === 'keyword' && <MessageSquare className="w-3 h-3" />}
                                  <span>
                                    {method === 'semantic' ? 'AI Context' : 
                                     method === 'dog_whistle' ? 'Code Detection' : 
                                     method === 'positive_routing' ? 'Performance' :
                                     method === 'goal_based' ? 'Goal Match' :
                                     'Keywords'}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technical details (collapsible) */}
                        {(message.routingAnalysis.matchedRules && message.routingAnalysis.matchedRules.length > 0) && (
                          <details className="mt-3" open>
                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 select-none">
                              Technical Details ({message.routingAnalysis.matchedRules.length} rules triggered)
                            </summary>
                            <div className="mt-2 space-y-2">
                              {message.routingAnalysis.matchedRules.map((rule, index) => (
                                <div key={index} className="p-2 bg-white rounded border border-slate-200 text-xs">
                                  <div className="font-medium text-slate-700 mb-1">{rule.description}</div>
                                  <div className="text-slate-600 mb-1">
                                    <strong>Matched:</strong> {rule.matches.slice(0, 3).join(', ')}
                                    {rule.matches.length > 3 && ` +${rule.matches.length - 3} more`}
                                  </div>
                                  <div className="flex items-center justify-between text-slate-500">
                                    <span>Priority {rule.priority} • {rule.rule_type}</span>
                                    {rule.semantic_score > 0 && (
                                      <span className="text-purple-600">
                                        {(rule.semantic_score * 100).toFixed(0)}% semantic match
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Feedback */}
                        {message.routingAnalysis.routingApplied && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <FeedbackButtons message={message} onFeedback={onFeedback} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                    <span className="text-slate-600 text-sm">
                      {getEngineInfo(routingAnalysis?.recommendedEngine || selectedEngine).name}{' '}
                      is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isLoading || availableEngines.length === 0}
            placeholder={
              availableEngines.length === 0
                ? 'Configure API keys in settings first...'
                : 'Ask anything... The system will automatically route to the best engine for your goals.'
            }
          />
        </div>
      </div>
    </div>
  );
});

const SettingsPage = memo(function SettingsPage({
  setCurrentPage,
  apiKeys,
  saveApiKeys,
  availableEngines,
  defaultEngine,
  saveDefaultEngine,
  fallbackEngine,
  saveFallbackEngine,
  positiveRoutingEnabled,
  savePositiveRoutingEnabled,
  positiveRoutingThreshold,
  savePositiveRoutingThreshold,
  getEngineInfo,
  rulesDatabase,
  demoMode,
  saveDemoMode,
}) {
  const [showKeys, setShowKeys] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage('chat')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <Settings
              className="w-8 h-8 text-purple-600 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setCurrentPage('chat')}
              title="Return to chat"
            />
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setCurrentPage('chat')}
              title="Return to chat"
            >
              <h1 className="text-2xl font-bold text-slate-800">Settings & Configuration</h1>
              <p className="text-sm text-slate-600">
                Configure API keys, routing preferences, and view goal-based bias mitigation rules
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">API Keys Configuration</h2>
                  <p className="text-sm text-slate-600">
                    Add your AI service API keys to enable different engines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeys(s => !s)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showKeys ? 'Hide' : 'Show'} Keys</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(apiKeys).map(([key, value]) => {
                const engineName =
                  key === 'xai' ? 'X.AI (Grok)' : key === 'groq' ? 'Groq (Llama)' : key;
                const hasKey = value && value.trim().length > 0;

                return (
                  <div key={key} className="space-y-2">
                    <label className="flex items-center justify-between text-sm font-medium text-slate-700 capitalize">
                      <span>{engineName} API Key</span>
                      {hasKey && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          ✓ Configured
                        </span>
                      )}
                    </label>
                    <input
                      type={showKeys ? 'text' : 'password'}
                      value={value}
                      onChange={(e) => saveApiKeys({ ...apiKeys, [key]: e.target.value })}
                      placeholder={`Enter ${engineName} API key`}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-lg border">
              {demoMode ? (
                Object.values(apiKeys).some(key => key && key.trim().length > 0) ? (
                  <div className="bg-yellow-50 border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Switching to Live Mode...</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      API keys detected! Automatically switching from demo to live mode.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-slate-200">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-800">Demo Mode Active</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-1">
                      Using simulated responses. Add any API key above to automatically switch to live mode.
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-green-50 border-green-200">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Live Mode Active</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Making real API calls to AI services. Remove all API keys to return to demo mode.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Performance Optimization</h2>
                <p className="text-sm text-slate-600">
                  Automatically route queries to the best-performing engine for each task type
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-medium text-emerald-800">Positive Routing</h3>
                  <p className="text-sm text-emerald-700">
                    Route to best-performing engines based on LiveBench 2025 benchmarks
                  </p>
                </div>
              </div>
              <button
                onClick={() => savePositiveRoutingEnabled(!positiveRoutingEnabled)}
                className="flex items-center space-x-2"
              >
                {positiveRoutingEnabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            {positiveRoutingEnabled && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Task Categories Optimized:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <span className="text-blue-700">📊 Mathematics</span>
                    <span className="text-blue-700">💻 Coding</span>
                    <span className="text-blue-700">🧠 Reasoning</span>
                    <span className="text-blue-700">📤 Language</span>
                    <span className="text-blue-700">📋 Instructions</span>
                    <span className="text-blue-700">📈 Data Analysis</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-800 mb-3">Performance Threshold</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700">
                        Route when engine scores {positiveRoutingThreshold}+ points higher
                      </span>
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                        {positiveRoutingThreshold} points
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="15"
                      step="1"
                      value={positiveRoutingThreshold}
                      onChange={(e) => savePositiveRoutingThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>2 points (More routing)</span>
                      <span>15 points (Less routing)</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      <strong>Examples:</strong> With {positiveRoutingThreshold} point threshold:
                      85% vs 80% = 5 points {5 >= positiveRoutingThreshold ? '✅ routes' : '⛔ no route'} | 
                      75% vs 72% = 3 points {3 >= positiveRoutingThreshold ? '✅ routes' : '⛔ no route'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Default AI Engine</h2>
                <p className="text-sm text-slate-600">
                  Choose your preferred engine for neutral topics (only available engines shown)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {availableEngines.map((engineId) => {
                const engine = getEngineInfo(engineId);
                const isDefault = engineId === defaultEngine;

                return (
                  <button
                    key={engineId}
                    onClick={() => saveDefaultEngine(engineId)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isDefault
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${engine.color_class}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{engine.name}</div>
                      {isDefault && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600">{engine.provider}</div>
                    <div className="text-xs mt-1 text-slate-500">{engine.bias_profile}</div>
                  </button>
                );
              })}
            </div>

            {availableEngines.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>No engines available. Please configure API keys above.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-amber-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Fallback Engine</h2>
                <p className="text-sm text-slate-600">
                  Used when all other engines are avoided by bias mitigation rules
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Fallback Engine
              </label>
              <select
                value={
                  availableEngines.includes(fallbackEngine) ? fallbackEngine : availableEngines[0] || ''
                }
                onChange={(e) => saveFallbackEngine(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={availableEngines.length === 0}
              >
                {availableEngines.length === 0 ? (
                  <option value="">No engines available</option>
                ) : (
                  availableEngines.map((engineId) => {
                    const engine = getEngineInfo(engineId);
                    return (
                      <option key={engineId} value={engineId}>
                        {engine.name} - {engine.bias_profile}
                      </option>
                    );
                  })
                )}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                This engine will be used as a last resort when goal-based rules
                eliminate all other options.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Understanding Rule Types</h2>
                <p className="text-sm text-slate-600">
                  Choose the right approach for your routing needs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Simple Avoidance Rules */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Avoidance Rules</h3>
                </div>
                <div className="text-sm text-red-700 space-y-3">
                  <p><strong>When to use:</strong> Simple "never use engine X for topic Y" scenarios</p>
                  <p><strong>Best for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Known engine limitations</li>
                    <li>Straightforward preferences</li>
                    <li>Quick routing decisions</li>
                  </ul>
                  <div className="bg-red-100 p-3 rounded">
                    <p className="text-xs"><strong>Example:</strong> "Avoid DeepSeek for real-time information requests"</p>
                  </div>
                </div>
              </div>

              {/* Simple Preference Rules */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Preference Rules</h3>
                </div>
                <div className="text-sm text-green-700 space-y-3">
                  <p><strong>When to use:</strong> Simple "prefer engine X for topic Y" scenarios</p>
                  <p><strong>Best for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Known engine strengths</li>
                    <li>Personal preferences</li>
                    <li>Task-specific routing</li>
                  </ul>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-xs"><strong>Example:</strong> "Prefer Claude for creative writing tasks"</p>
                  </div>
                </div>
              </div>

              {/* Goal-Based Rules */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Goal-Based Rules</h3>
                </div>
                <div className="text-sm text-blue-700 space-y-3">
                  <p><strong>When to use:</strong> Complex capability requirements with measurable objectives</p>
                  <p><strong>Best for:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Bias mitigation</li>
                    <li>Multi-criteria selection</li>
                    <li>Performance thresholds</li>
                    <li>Automatic adaptation</li>
                  </ul>
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="text-xs"><strong>Example:</strong> "Route to engines achieving 85%+ mathematical problem solving AND regulatory independence"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-800 mb-2">Recommendation: Start Simple, Upgrade When Needed</h4>
              <div className="text-sm text-slate-700 space-y-2">
                <p><strong>1. Begin with avoidance/preference rules</strong> for straightforward routing decisions</p>
                <p><strong>2. Use goal-based rules</strong> when you need engines to meet specific capability thresholds</p>
                <p><strong>3. Goal-based rules automatically handle</strong> engine availability, conflicts, and performance scoring</p>
                <p><strong>4. All rule types work together</strong> - safety goals override preferences, preferences guide general routing</p>
              </div>
            </div>
          </div>

          <RulesViewer 
            rulesDatabase={rulesDatabase}
            getEngineInfo={getEngineInfo}
          />
        </div>
      </div>
    </div>
  );
});

/* ===================================================================
   MAIN APPLICATION COMPONENT
   =================================================================== */

const MixtureOfVoicesChat = () => {
  // Core application state
  const [currentPage, setCurrentPage] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Engine and routing state
  const [selectedEngine, setSelectedEngine] = useState('claude');
  const [defaultEngine, setDefaultEngine] = useState('claude');
  const [fallbackEngine, setFallbackEngine] = useState('chatgpt');
  const [routingAnalysis, setRoutingAnalysis] = useState(null);
  const [positiveRoutingEnabled, setPositiveRoutingEnabled] = useState(true);
  const [positiveRoutingThreshold, setPositiveRoutingThreshold] = useState(5);

  // Demo mode state
  const [demoMode, setDemoMode] = useState(true);

  // Semantic processing state
  const [semanticModelStatus, setSemanticModelStatus] = useState('unloaded');
  const [semanticRulesDatabase, setSemanticRulesDatabase] = useState(null);
  const [isGeneratingRuleEmbeddings, setIsGeneratingRuleEmbeddings] = useState(false);

  // UI references and API keys
  const messagesEndRef = useRef(null);
  const [apiKeys, setApiKeys] = useState({
    anthropic: '',
    openai: '',
    groq: '',
    deepseek: '',
    xai: '',
  });

  // Use comprehensive external rules database
  const rulesDatabase = useMemo(
    () => COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE,
    []
  );

  // Helper functions
  const getAvailableEngines = useCallback(() => {
    const engineKeyMap = {
      claude: 'anthropic',
      chatgpt: 'openai',
      grok: 'xai',
      deepseek: 'deepseek',
      llama: 'groq',
    };

    return Object.keys(engineKeyMap).filter((engineId) => {
      const apiKeyName = engineKeyMap[engineId];
      return apiKeys[apiKeyName] && apiKeys[apiKeyName].trim().length > 0;
    });
  }, [apiKeys]);

  const getEngineInfo = useCallback(
    (engineId) => {
      return (
        rulesDatabase.engines[engineId] || {
          name: 'Unknown Engine',
          provider: 'Unknown',
          bias_profile: 'Unknown',
          color_class: 'bg-gray-100 border-gray-300',
        }
      );
    },
    [rulesDatabase.engines]
  );

  const preprocessPrompt = useCallback((prompt) => {
    return prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const availableEngines = getAvailableEngines();

  // Semantic model initialization
  useEffect(() => {
    let isComponentMounted = true;
    let initializationPromise = null;

    const initializeSemanticProcessing = async () => {
      if (!isComponentMounted) return;
      
      try {
        setSemanticModelStatus('loading');
        setIsGeneratingRuleEmbeddings(true);
        
        console.log('🚀 Initializing semantic processing system...');
        
        if (isComponentMounted) {
          await loadEmbeddingModel();
          if (isComponentMounted) {
            setSemanticModelStatus('ready');
          }
        }
        
        if (isComponentMounted) {
          const enhancedDatabase = await generateRuleEmbeddings(rulesDatabase);
          if (isComponentMounted) {
            setSemanticRulesDatabase(enhancedDatabase);
          }
        }
        
        console.log('✅ Semantic processing system ready');
        
      } catch (error) {
        console.error('⛔ Semantic processing initialization failed:', error);
        if (isComponentMounted) {
          setSemanticModelStatus('error');
          setSemanticRulesDatabase(rulesDatabase);
        }
      } finally {
        if (isComponentMounted) {
          setIsGeneratingRuleEmbeddings(false);
        }
      }
    };

    if (!semanticRulesDatabase) {
      initializationPromise = initializeSemanticProcessing();
    }

    return () => {
      isComponentMounted = false;
      if (initializationPromise) {
        initializationPromise.catch(() => {});
      }
    };
  }, [rulesDatabase, semanticRulesDatabase]);

  // Enhanced routing analysis with goal-based approach and detailed explanations
  const analyzeMessageForRouting = useCallback(
    async (message) => {
      const preprocessedMessage = preprocessPrompt(message);
      const lowerMessage = preprocessedMessage.toLowerCase();
      const matchedRules = [];
      const currentAvailableEngines = getAvailableEngines();
      
      const activeRulesDatabase = semanticRulesDatabase || rulesDatabase;

      console.log('📄 Starting comprehensive routing analysis...');

      let messageEmbedding = null;
      if (semanticModelStatus === 'ready') {
        try {
          console.log('🧠 Generating semantic embedding for user message...');
          messageEmbedding = await generateEmbedding(preprocessedMessage);
        } catch (error) {
          console.warn('⚠️ Semantic analysis failed, using keyword-only detection:', error);
        }
      }

      // Apply semantic analysis to ALL rules for comprehensive detection
      for (const rule of activeRulesDatabase.routing_rules) {
        let ruleTriggered = false;
        const matches = [];
        let semanticScore = 0;

        // Keyword matching with conservative distance for all rules
        if (rule.triggers.topics) {
          const keywordMatches = findFuzzyKeywordMatches(lowerMessage, rule.triggers.topics, 1);
          
          keywordMatches.forEach(match => {
            if (match.type === 'exact') {
              matches.push(`Keyword: "${match.keyword}"`);
              ruleTriggered = true;
            } else if (match.distance === 1) {
              matches.push(`Fuzzy keyword: "${match.keyword}" (matched "${match.matched_word}", distance: ${match.distance})`);
              ruleTriggered = true;
            }
          });
        }

        // Dog whistle detection (primarily for safety rules but can apply to others)
        if (rule.triggers.dog_whistles) {
          const dogWhistleMatches = findFuzzyKeywordMatches(lowerMessage, rule.triggers.dog_whistles, 1);
          
          dogWhistleMatches.forEach(match => {
            if (match.type === 'exact') {
              matches.push(`Dog whistle: "${match.keyword}"`);
              ruleTriggered = true;
            } else if (match.distance === 1) {
              matches.push(`Fuzzy dog whistle: "${match.keyword}" (matched "${match.matched_word}", distance: ${match.distance})`);
              ruleTriggered = true;
            }
          });
        }

        // SEMANTIC ANALYSIS - Core safety feature applied to ALL rules
        if (messageEmbedding && rule.semantic_embedding) {
          semanticScore = calculateCosineSimilarity(messageEmbedding, rule.semantic_embedding);
          
          // Use different thresholds based on rule priority
          let threshold;
          if (rule.priority <= 2) {
            // Safety rules: Higher threshold to reduce false positives on harmful content
            threshold = Math.max(rule.semantic_threshold || 0.75, 0.85);
          } else {
            // Performance rules: Use configured threshold or reasonable default
            threshold = rule.semantic_threshold || 0.80;
          }
          
          if (semanticScore > threshold) {
            matches.push(`Semantic pattern (${(semanticScore * 100).toFixed(1)}% similarity)`);
            ruleTriggered = true;
          }
        }

        if (ruleTriggered) {
          matchedRules.push({ 
            ...rule, 
            matches,
            semantic_score: semanticScore,
            detection_method: semanticScore > (rule.semantic_threshold || (rule.priority <= 2 ? 0.85 : 0.80)) ? 
              'semantic' : matches.some(m => m.includes('Dog whistle')) ? 'dog_whistle' : 'keyword'
          });
        }
      }

      // Check positive routing regardless of rule matches (will be overridden by safety)
      let positiveRouting = null;
      let positiveRoutingConsidered = false;
      if (positiveRoutingEnabled) {
        positiveRouting = analyzeQueryForPositiveRouting(message, currentAvailableEngines, positiveRoutingThreshold, defaultEngine);
        positiveRoutingConsidered = true;
        if (positiveRouting) {
          console.log('⚡ Positive routing detected:', positiveRouting);
        }
      }

      // Sort all matched rules by priority (safety rules will be first)
      matchedRules.sort((a, b) => a.priority - b.priority);

      let recommendedEngine = selectedEngine;
      let routingApplied = false;
      let routingReason = 'Using default engine - no special routing needed';
      let detectionMethods = [];
      let availabilityNotes = [];
      let goalBasedRouting = null;
      let transparencyNotes = [];

      // Process safety rules first (Priority 1-2)
      const safetyRules = matchedRules.filter(r => r.priority <= 2);
      const originalEngine = selectedEngine;
      
      if (safetyRules.length > 0) {
        console.log(`🛡️ Found ${safetyRules.length} safety rule violations - overriding any performance optimization`);
        
        // Apply goal-based routing for safety rules
        const goalBasedSafetyRules = safetyRules.filter(r => r.required_goals);
        
        if (goalBasedSafetyRules.length > 0) {
          const safetyRule = goalBasedSafetyRules[0];
          const selectedEngine = selectEngineForGoals(
            safetyRule.required_goals,
            safetyRule.conflicting_capabilities || [],
            currentAvailableEngines,
            activeRulesDatabase.engines
          );
          
          if (selectedEngine) {
            recommendedEngine = selectedEngine.id;
            routingApplied = true;
            detectionMethods.push('goal_based');
            goalBasedRouting = {
              rule: safetyRule,
              selectedEngine: selectedEngine,
              goalScore: selectedEngine.goalScore,
              explanation: generateGoalBasedExplanation(
                selectedEngine,
                safetyRule.required_goals,
                safetyRule.conflicting_capabilities || [],
                currentAvailableEngines,
                selectedEngine,
                safetyRule.detection_method || 'goal-based analysis'
              )
            };
            routingReason = goalBasedRouting.explanation;
            
            // Add transparency note about positive routing being overridden
            if (positiveRouting) {
              transparencyNotes.push(
                `Performance optimization suggested ${getEngineInfo(positiveRouting.recommendedEngine).name} ` +
                `(${positiveRouting.absoluteDifference} point advantage), but safety requirements took priority`
              );
            }
          }
        } else {
          // Fallback to legacy routing for non-goal-based safety rules
          const avoidRules = safetyRules.filter((r) => r.rule_type === 'avoidance');
          
          if (avoidRules.length > 0) {
            const avoided = new Set();
            avoidRules.forEach((r) => r.avoid_engines?.forEach((e) => avoided.add(e)));

            if (avoided.has(selectedEngine)) {
              const safeEngines = currentAvailableEngines.filter((e) => !avoided.has(e));
              
              if (safeEngines.length > 0) {
                const preferredSafe = avoidRules.find(r => r.prefer_engines)?.prefer_engines
                  ?.filter(e => safeEngines.includes(e));
                
                recommendedEngine = preferredSafe?.[0] || safeEngines[0];
                routingApplied = true;
                detectionMethods.push(avoidRules[0].detection_method);
                routingReason = `🛡️ SAFETY PROTECTION: Routed away from ${getEngineInfo(selectedEngine).name} → ${getEngineInfo(recommendedEngine).name} due to: "${avoidRules[0].reason}"`;
                
                // Add transparency note about positive routing being overridden
                if (positiveRouting) {
                  transparencyNotes.push(
                    `Performance optimization suggested ${getEngineInfo(positiveRouting.recommendedEngine).name} ` +
                    `(${positiveRouting.absoluteDifference} point advantage), but safety requirements took priority`
                  );
                }
              }
            }
          }
        }
      }

      // If no safety routing occurred, check other routing options
      if (!routingApplied) {
        // First, try positive routing if enabled and threshold is met
        if (positiveRouting && positiveRoutingEnabled && positiveRouting.shouldRoute) {
          // Apply positive routing if no safety concerns and threshold is met
          recommendedEngine = positiveRouting.recommendedEngine;
          routingApplied = true;
          detectionMethods.push('positive_routing');
          routingReason = `⚡ PERFORMANCE OPTIMIZATION: ${positiveRouting.reasoning}`;
        } else {
          // Try non-safety rules (Priority 3+) only if positive routing didn't apply
          const nonSafetyRules = matchedRules.filter(r => r.priority > 2);
          
          if (nonSafetyRules.length > 0) {
            // Handle non-safety goal-based preference rules
            const goalBasedPreferenceRules = nonSafetyRules.filter((r) => r.rule_type === 'preference' && r.required_goals);
            
            if (goalBasedPreferenceRules.length > 0) {
              const preferenceRule = goalBasedPreferenceRules[0];
              const selectedEngine = selectEngineForGoals(
                preferenceRule.required_goals,
                preferenceRule.conflicting_capabilities || [],
                currentAvailableEngines,
                activeRulesDatabase.engines
              );
              
              if (selectedEngine && selectedEngine.id !== originalEngine) {
                recommendedEngine = selectedEngine.id;
                routingApplied = true;
                detectionMethods.push('goal_based');
                goalBasedRouting = {
                  rule: preferenceRule,
                  selectedEngine: selectedEngine,
                  goalScore: selectedEngine.goalScore,
                  explanation: generateGoalBasedExplanation(
                    selectedEngine,
                    preferenceRule.required_goals,
                    preferenceRule.conflicting_capabilities || [],
                    currentAvailableEngines,
                    selectedEngine,
                    'preference optimization'
                  )
                };
                routingReason = goalBasedRouting.explanation;
              }
            } else {
              // Legacy preference and avoidance handling
              const preferRules = nonSafetyRules.filter((r) => r.rule_type === 'preference');
              const avoidRules = nonSafetyRules.filter((r) => r.rule_type === 'avoidance');
              
              if (preferRules.length > 0) {
                const rule = preferRules[0];
                const idealEngines = rule.prefer_engines || [];
                const availablePreferred = idealEngines.filter(e => currentAvailableEngines.includes(e));
                
                if (availablePreferred.length > 0 && availablePreferred[0] !== originalEngine) {
                  recommendedEngine = availablePreferred[0];
                  routingApplied = true;
                  detectionMethods.push('preference');
                  routingReason = `⚡ QUALITY OPTIMIZATION: Routed to preferred engine ${getEngineInfo(recommendedEngine).name}. Rule: "${rule.description}"`;
                }
              } else if (avoidRules.length > 0) {
                const rule = avoidRules[0];
                const avoided = new Set(rule.avoid_engines || []);
                
                if (avoided.has(originalEngine)) {
                  const safeEngines = currentAvailableEngines.filter((e) => !avoided.has(e));
                  
                  if (safeEngines.length > 0) {
                    recommendedEngine = safeEngines[0];
                    routingApplied = true;
                    detectionMethods.push('avoidance');
                    routingReason = `⚡ SIMPLE ROUTING: Avoided ${getEngineInfo(originalEngine).name} → ${getEngineInfo(recommendedEngine).name}. Rule: "${rule.description}"`;
                  }
                }
              }
            }
          }
        }
      }

      // Generate final routing explanation, considering positive routing even when not applied
      if (!routingApplied) {
        if (positiveRoutingConsidered && positiveRouting && !positiveRouting.shouldRoute) {
          // Positive routing was considered but not applied due to threshold
          routingReason = `Using default engine. Detected ${positiveRouting.category} task. ${getEngineInfo(positiveRouting.recommendedEngine).name} would perform ${positiveRouting.absoluteDifference} points better (${positiveRouting.engineScore}% vs ${positiveRouting.currentEngineScore}%), but difference is below ${positiveRouting.threshold}-point threshold.`;
        } else if (matchedRules.length > 0) {
          // Rules matched but didn't result in routing change
          routingReason = `Using default engine. ${matchedRules.length} rules matched but no routing change needed - current engine meets all requirements.`;
        } else {
          // No rules matched, no positive routing triggered
          routingReason = 'Using default engine - no special routing needed';
        }
      }

      const analysis = {
        originalQuery: message,
        preprocessedQuery: preprocessedMessage,
        matchedRules,
        recommendedEngine,
        routingApplied,
        reasoning: routingReason,
        availabilityNotes,
        transparencyNotes: transparencyNotes.length > 0 ? transparencyNotes : null,
        semanticProcessingUsed: semanticModelStatus === 'ready' && messageEmbedding !== null,
        positiveRoutingUsed: positiveRouting !== null && routingApplied && detectionMethods.includes('positive_routing'),
        positiveRouting: positiveRouting,
        goalBasedRouting: goalBasedRouting !== null,
        goalBasedRoutingDetails: goalBasedRouting,
        detectionMethods: detectionMethods.filter((v, i, a) => a.indexOf(v) === i),
        safetyOverride: safetyRules.length > 0 && positiveRouting !== null && positiveRouting.shouldRoute ? 
          `Safety rules detected sensitive content and overrode performance optimization. ` +
          `Originally suggested: ${getEngineInfo(positiveRouting.recommendedEngine).name}, ` +
          `but routed to ${getEngineInfo(recommendedEngine).name} for content safety.` : null
      };

      console.log('📊 Routing analysis complete:', analysis);
      return analysis;
    },
    [fallbackEngine, getAvailableEngines, getEngineInfo, preprocessPrompt, selectedEngine, semanticRulesDatabase, rulesDatabase, semanticModelStatus, positiveRoutingEnabled, positiveRoutingThreshold, defaultEngine]
  );

  // Initialization and persistence
  useEffect(() => {
    try {
      const storedKeys = JSON.parse(
        localStorage.getItem('mixtureOfVoices_apiKeys') || '{}'
      );
      setApiKeys((prev) => ({ ...prev, ...storedKeys }));

      const storedDefault =
        localStorage.getItem('mixtureOfVoices_defaultEngine') || 'claude';
      setDefaultEngine(storedDefault);
      setSelectedEngine(storedDefault);

      const storedFallback =
        localStorage.getItem('mixtureOfVoices_fallbackEngine') || 'chatgpt';
      setFallbackEngine(storedFallback);

      const storedPositiveRouting = 
        localStorage.getItem('mixtureOfVoices_positiveRouting');
      if (storedPositiveRouting !== null) {
        setPositiveRoutingEnabled(JSON.parse(storedPositiveRouting));
      }

      const storedPositiveThreshold = 
        localStorage.getItem('mixtureOfVoices_positivePointThreshold');
      if (storedPositiveThreshold !== null) {
        setPositiveRoutingThreshold(JSON.parse(storedPositiveThreshold));
      }

      const storedDemoMode = 
        localStorage.getItem('mixtureOfVoices_demoMode');
      if (storedDemoMode !== null) {
        setDemoMode(JSON.parse(storedDemoMode));
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save functions
  const saveApiKeys = useCallback((keys) => {
    try {
      localStorage.setItem('mixtureOfVoices_apiKeys', JSON.stringify(keys));
      setApiKeys(keys);
    } catch (e) {
      console.error('Error saving API keys:', e);
    }
  }, []);

  const saveDefaultEngine = useCallback((engineId) => {
    try {
      localStorage.setItem('mixtureOfVoices_defaultEngine', engineId);
      setDefaultEngine(engineId);
      setSelectedEngine(engineId);
    } catch (e) {
      console.error('Error saving default engine:', e);
    }
  }, []);

  const saveFallbackEngine = useCallback((engineId) => {
    try {
      localStorage.setItem('mixtureOfVoices_fallbackEngine', engineId);
      setFallbackEngine(engineId);
    } catch (e) {
      console.error('Error saving fallback engine:', e);
    }
  }, []);

  const savePositiveRoutingEnabled = useCallback((enabled) => {
    try {
      localStorage.setItem('mixtureOfVoices_positiveRouting', JSON.stringify(enabled));
      setPositiveRoutingEnabled(enabled);
    } catch (e) {
      console.error('Error saving positive routing setting:', e);
    }
  }, []);

  const savePositiveRoutingThreshold = useCallback((threshold) => {
    try {
      localStorage.setItem('mixtureOfVoices_positivePointThreshold', JSON.stringify(threshold));
      setPositiveRoutingThreshold(threshold);
    } catch (e) {
      console.error('Error saving positive routing threshold:', e);
    }
  }, []);

  const saveDemoMode = useCallback((demo) => {
    try {
      localStorage.setItem('mixtureOfVoices_demoMode', JSON.stringify(demo));
      setDemoMode(demo);
    } catch (e) {
      console.error('Error saving demo mode:', e);
    }
  }, []);

  // Updated API integration using internal routes
  const callAI = useCallback(async (engine, message, apiKey) => {
    // Handle demo mode - return simulated responses when no API keys configured
    if (demoMode) {
      console.log(`Demo mode: Simulating ${engine} response for: "${message.slice(0, 100)}..."`);
      
      // Simulate realistic API delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      // Return engine-specific demo responses
      const engineInfo = getEngineInfo(engine);
      const demoResponses = {
        claude: `**Demo Response from Claude**

This is a simulated response demonstrating Claude's capabilities. In live mode, Claude would provide detailed, nuanced analysis with strong ethical reasoning and safety considerations.

**Your message was:** "${message}"

*Key strengths: Nuanced analysis, ethical reasoning, balanced perspectives*

**Note:** This is a demo response. Configure your Anthropic API key in settings to use the real Claude.`,

        chatgpt: `**Demo Response from ChatGPT**

This is a simulated response showcasing ChatGPT's capabilities. In live mode, ChatGPT would provide comprehensive answers with strong performance in mathematics, coding, and general problem-solving.

**Your message was:** "${message}"

*Key strengths: Mathematics, coding, instruction following, general purpose*

**Note:** This is a demo response. Configure your OpenAI API key in settings to use the real ChatGPT.`,

        grok: `**Demo Response from Grok**

This is a simulated response representing Grok's capabilities. In live mode, Grok would provide reasoning-focused responses with real-time information and fewer content restrictions.

**Your message was:** "${message}"

*Key strengths: Advanced reasoning, real-time data, uncensored responses*

**Note:** This is a demo response. Configure your xAI API key in settings to use the real Grok.`,

        deepseek: `**Demo Response from DeepSeek**

This is a simulated response illustrating DeepSeek's capabilities. In live mode, DeepSeek would provide cost-effective responses with strong reasoning and instruction-following abilities.

**Your message was:** "${message}"

*Key strengths: Cost-effective, reasoning, instruction following*

**Note:** This is a demo response. Configure your DeepSeek API key in settings to use the real DeepSeek.`,

        llama: `**Demo Response from Llama 4**

This is a simulated response demonstrating Llama 4's capabilities. In live mode, Llama 4 would provide direct responses with multimodal processing and open-source transparency.

**Your message was:** "${message}"

*Key strengths: Multimodal processing, direct responses, open source, fewer restrictions*

**Note:** This is a demo response. Configure your Groq API key in settings to use the real Llama 4.`,

        o3: `**Demo Response from o3**

This is a simulated response showcasing o3's capabilities. In live mode, o3 would provide advanced reasoning and complex analysis optimized for difficult problems.

**Your message was:** "${message}"

*Key strengths: Advanced reasoning, complex analysis, mathematical problem solving*

**Note:** This is a demo response. Configure your OpenAI API key in settings to use the real o3.`
      };

      return demoResponses[engine] || `**Demo Response from ${engineInfo.name}**

This is a simulated response. Configure API keys in settings to use real AI engines.

**Your message was:** "${message}"`;
    }

    // In live mode, require API key for the specific engine
    if (!apiKey) {
      throw new Error(`API key not configured for ${getEngineInfo(engine).name}`);
    }

    try {
      const engineRoutes = {
        'claude': '/api/ai/claude',
        'chatgpt': '/api/ai/openai',
        'grok': '/api/ai/grok',
        'deepseek': '/api/ai/deepseek',
        'llama': '/api/ai/groq',
        'o3': '/api/ai/openai'
      };

      const route = engineRoutes[engine];
      if (!route) {
        throw new Error(`No API route configured for engine: ${engine}`);
      }

      console.log(`Making ${engine} API call via ${route}: "${message.slice(0, 100)}..."`);
      
      const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          apiKey: apiKey,
          model: engine === 'o3' ? 'o1-preview' : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${engine} API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ ${engine} API call successful`);
      
      return data.content;

    } catch (error) {
      console.error(`API call failed for ${engine}:`, error);
      throw error;
    }
  }, [demoMode, getEngineInfo]);

  // User interaction handlers
  const handleExampleClick = useCallback((text) => {
    setInputValue(text);
    setTimeout(() => {
      const inputElement = document.querySelector('textarea');
      if (inputElement) {
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputElement.focus();
      }
    }, 100);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', content: userMessage, timestamp: new Date() },
    ]);

    try {
      console.log('📄 Starting comprehensive routing analysis...');
      const analysis = await analyzeMessageForRouting(userMessage);
      setRoutingAnalysis(analysis);

      const engineToUse = analysis.recommendedEngine;
      const currentAvailableEngines = getAvailableEngines();

      // Ensure the recommended engine is actually available
      if (!currentAvailableEngines.includes(engineToUse)) {
        console.warn(`⚠️ Recommended engine ${engineToUse} not available, falling back to available engines`);
        
        // If no engines are available at all, show error
        if (currentAvailableEngines.length === 0) {
          throw new Error('No API keys configured. Please add at least one API key in settings to use the platform.');
        }
        
        // Otherwise, pick the best available engine (first in list is usually the default)
        const fallbackEngine = currentAvailableEngines.includes(defaultEngine) ? defaultEngine : currentAvailableEngines[0];
        console.log(`📄 Using fallback engine: ${fallbackEngine}`);
        
        // Update analysis to reflect the fallback
        analysis.recommendedEngine = fallbackEngine;
        analysis.reasoning += ` (Fallback: Originally recommended ${getEngineInfo(engineToUse).name}, but using ${getEngineInfo(fallbackEngine).name} as it's the best available option with configured API key.)`;
        setRoutingAnalysis(analysis);
      }

      const engineKeyMap = {
        claude: 'anthropic',
        chatgpt: 'openai',
        grok: 'xai',
        deepseek: 'deepseek',
        llama: 'groq',
        o3: 'openai',
      };
      
      const apiKeyName = engineKeyMap[analysis.recommendedEngine];
      const apiKey = apiKeys[apiKeyName];
      
      if (!apiKey) {
        throw new Error(`API key not configured for ${getEngineInfo(analysis.recommendedEngine).name}. Please add the ${apiKeyName} API key in settings.`);
      }

      const response = await callAI(analysis.recommendedEngine, userMessage, apiKey);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          content: response,
          timestamp: new Date(),
          engine: analysis.recommendedEngine,
          routingAnalysis: analysis,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'error',
          content: `Error: ${error.message}`,
          timestamp: new Date(),
          engine: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue,
    isLoading,
    analyzeMessageForRouting,
    apiKeys,
    callAI,
    getEngineInfo,
    getAvailableEngines,
    defaultEngine,
  ]);

  // Automatic demo mode detection
  useEffect(() => {
    const hasAnyApiKey = Object.values(apiKeys).some(key => key && key.trim().length > 0);
    if (hasAnyApiKey && demoMode) {
      setDemoMode(false);
      saveDemoMode(false);
    } else if (!hasAnyApiKey && !demoMode) {
      setDemoMode(true);
      saveDemoMode(true);
    }
  }, [apiKeys, demoMode, saveDemoMode]);

  // Main render
  return currentPage === 'chat' ? (
    <ChatPage
      messages={messages}
      routingAnalysis={routingAnalysis}
      selectedEngine={selectedEngine}
      defaultEngine={defaultEngine}
      availableEngines={availableEngines}
      getEngineInfo={getEngineInfo}
      handleExampleClick={handleExampleClick}
      isLoading={isLoading}
      inputValue={inputValue}
      setInputValue={setInputValue}
      handleSendMessage={handleSendMessage}
      setCurrentPage={setCurrentPage}
      messagesEndRef={messagesEndRef}
      rulesDatabase={semanticRulesDatabase || rulesDatabase}
      saveDefaultEngine={saveDefaultEngine}
      semanticModelStatus={semanticModelStatus}
      isGeneratingRuleEmbeddings={isGeneratingRuleEmbeddings}
      positiveRoutingEnabled={positiveRoutingEnabled}
      onFeedback={saveFeedbackRecord}
      demoMode={demoMode}
      setMessages={setMessages}
      setRoutingAnalysis={setRoutingAnalysis}
    />
  ) : (
    <SettingsPage
      setCurrentPage={setCurrentPage}
      apiKeys={apiKeys}
      saveApiKeys={saveApiKeys}
      availableEngines={availableEngines}
      defaultEngine={defaultEngine}
      saveDefaultEngine={saveDefaultEngine}
      fallbackEngine={fallbackEngine}
      saveFallbackEngine={saveFallbackEngine}
      positiveRoutingEnabled={positiveRoutingEnabled}
      savePositiveRoutingEnabled={savePositiveRoutingEnabled}
      positiveRoutingThreshold={positiveRoutingThreshold}
      savePositiveRoutingThreshold={savePositiveRoutingThreshold}
      getEngineInfo={getEngineInfo}
      rulesDatabase={semanticRulesDatabase || rulesDatabase}
      demoMode={demoMode}
      saveDemoMode={saveDemoMode}
    />
  );
};

export default MixtureOfVoicesChat;