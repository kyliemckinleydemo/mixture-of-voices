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
      const trainingExamples = [
        ...rule.triggers.topics.slice(0, 5),
        ...(rule.triggers.dog_whistles?.slice(0, 3) || [])
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

const analyzeQueryForPositiveRouting = (query, availableEngines, positiveRoutingThreshold = 10) => {
  const lowerQuery = query.toLowerCase();
  const categoryScores = {};
  
  // Use positive routing data from the comprehensive rules database
  const taskCategories = COMPREHENSIVE_BIAS_MITIGATION_RULES_DATABASE.positive_routing_data.task_categories;
  
  Object.entries(taskCategories).forEach(([category, data]) => {
    let score = 0;
    data.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        score += 1;
      }
    });
    if (score > 0) {
      categoryScores[category] = score;
    }
  });
  
  const topCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
  
  if (!topCategory) {
    return null;
  }
  
  const [categoryName, matchScore] = topCategory;
  const categoryData = taskCategories[categoryName];
  
  const availablePerformers = categoryData.top_performers.filter(
    performer => availableEngines.includes(performer.engine)
  );
  
  if (availablePerformers.length < 2) {
    return null;
  }
  
  const bestEngine = availablePerformers[0];
  const secondBestEngine = availablePerformers[1];
  
  const performanceDifference = ((bestEngine.score - secondBestEngine.score) / secondBestEngine.score) * 100;
  
  if (performanceDifference < positiveRoutingThreshold) {
    return null;
  }
  
  return {
    category: categoryName,
    categoryDescription: categoryData.description,
    matchScore,
    recommendedEngine: bestEngine.engine,
    engineScore: bestEngine.score,
    performanceDifference: performanceDifference.toFixed(1),
    threshold: positiveRoutingThreshold,
    reasoning: `Detected ${categoryName} task (${matchScore} keyword matches). ${bestEngine.engine} scores ${bestEngine.score}% vs ${secondBestEngine.engine} at ${secondBestEngine.score}% (${performanceDifference.toFixed(1)}% better, threshold: ${positiveRoutingThreshold}%).`
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
      positiveRoutingUsed: message.routingAnalysis?.positiveRoutingUsed || false
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

  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[0.9em]">
        {code}
      </code>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="group relative">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onCopy}
          className="flex items-center space-x-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          title="Copy code"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
        <code className={`block ${className || ''}`}>{code}</code>
      </pre>
    </div>
  );
});

const MarkdownMessage = memo(function MarkdownMessage({ content }) {
  const renderContent = (text) => {
    return text.split('\n\n').map((paragraph, i) => (
      <p key={i} className="mb-3 leading-relaxed text-slate-800">
        {paragraph}
      </p>
    ));
  };

  return <div>{renderContent(content)}</div>;
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

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
      isPositiveRouted ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className={isPositiveRouted ? 'text-emerald-600' : 'text-blue-600'}>
        {isPositiveRouted ? <Award className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
      </div>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isPositiveRouted ? 'text-emerald-600' : 'text-blue-600'}`}>
          {isPositiveRouted ? 'Performance Optimized' : 'Positive Routing Active'}
        </span>
        <span className="text-xs text-slate-500">
          {isPositiveRouted ? `${routingAnalysis.positiveRouting.category} task detected` : 'Ready for optimization'}
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
    } else {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Target className="w-4 h-4" />,
        label: 'Preference Rule'
      };
    }
  };

  const typeInfo = getRuleTypeInfo(rule.rule_type);

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
            {rule.triggers.topics.length} triggers
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

            <div>
              <h4 className="font-medium text-slate-800 mb-2">Engine Routing Impact</h4>
              <div className="flex flex-wrap gap-2">
                {rule.avoid_engines && rule.avoid_engines.map(engineId => {
                  const engine = getEngineInfo(engineId);
                  return (
                    <span key={engineId} className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      <span>❌</span>
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
                {rule.triggers.topics.slice(0, 10).map((topic, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                  >
                    "{topic}"
                  </span>
                ))}
                {rule.triggers.topics.length > 10 && (
                  <span className="text-xs text-slate-500">
                    +{rule.triggers.topics.length - 10} more...
                  </span>
                )}
              </div>
            </div>

            {rule.triggers.dog_whistles && rule.triggers.dog_whistles.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Dog Whistle Detection</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {rule.triggers.dog_whistles.slice(0, 8).map((phrase, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                    >
                      "{phrase}"
                    </span>
                  ))}
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
              <h4 className={`font-medium mb-1 ${typeInfo.color}`}>Example Impact</h4>
              <p className="text-xs text-slate-600">
                {rule.rule_type === 'avoidance' 
                  ? `Messages containing "${rule.triggers.topics[0]}" will route away from ${rule.avoid_engines?.map(e => getEngineInfo(e).name).join(' and ')}.`
                  : `Messages about "${rule.triggers.topics[0]}" will prefer ${rule.prefer_engines?.map(e => getEngineInfo(e).name).join(' or ')}.`
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
    return rule.rule_type === filter;
  });

  const avoidanceRules = rulesDatabase.routing_rules.filter(r => r.rule_type === 'avoidance').length;
  const preferenceRules = rulesDatabase.routing_rules.filter(r => r.rule_type === 'preference').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Bias Mitigation Rules</h2>
            <p className="text-sm text-slate-600">
              Complete transparency into routing decisions and bias detection
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
            <option value="avoidance">Avoidance Rules ({avoidanceRules})</option>
            <option value="preference">Preference Rules ({preferenceRules})</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-slate-800">Total Rules</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{rulesDatabase.routing_rules.length}</p>
          <p className="text-xs text-slate-600">Active routing rules</p>
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
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="font-medium text-purple-800">How Bias Detection Works</h3>
        </div>
        <div className="text-sm text-purple-700 space-y-2">
          <p><strong>1. Multi-Layer Analysis:</strong> Each message is analyzed for direct keywords, coded language (dog whistles), and semantic patterns.</p>
          <p><strong>2. Priority-Based Rules:</strong> Lower priority numbers = higher importance. Safety rules (Priority 1) override quality preferences (Priority 3+).</p>
          <p><strong>3. Confidence Scoring:</strong> Each rule has a confidence threshold - higher scores indicate stronger bias risk detection.</p>
          <p><strong>4. Transparent Routing:</strong> You see exactly which rules triggered and why routing decisions were made.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-slate-800 mb-3">
          {filter === 'all' ? 'All Rules' : filter === 'avoidance' ? 'Avoidance Rules' : 'Preference Rules'}
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
              <p className="text-sm text-slate-600">AI Bias Mitigation with Performance Optimization</p>
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
                      isPositiveRouted ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isPositiveRouted ? 'Optimized' : 'Auto-Routed'}
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
                  Intelligent AI routing with bias mitigation and performance optimization. Try the examples below to see both systems in action.
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
                      Examples Showcasing Intelligent Routing:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <h5 className="font-medium text-red-800">Bias Protection</h5>
                        </div>
                        <p className="text-sm text-red-700 mb-3">
                          Routes <strong>away from biased engines</strong> - protects against biased content
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
                          <h5 className="font-medium text-emerald-800">Performance Optimization</h5>
                        </div>
                        <p className="text-sm text-emerald-700 mb-3">
                          Routes <strong>to best-performing engines</strong> - maximizes task success
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
                          <Brain className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-800">Complex Reasoning</h5>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          Routes to <strong>top reasoning engines</strong> - handles logic puzzles optimally
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Five people live in different colored houses. Each has a different pet, drinks a different beverage, and works in a different profession. Given these clues, who owns the zebra?')}
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
                          <h5 className="font-medium text-slate-800">Neutral Topics</h5>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          Uses your <strong>default engine</strong> - no special routing needed
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
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h5 className="font-medium text-purple-800">Intelligent Routing System</h5>
                      </div>
                      <p className="text-sm text-purple-700">
                        Our platform combines bias protection with performance optimization. Messages are analyzed for bias patterns and task types, then routed to the safest and most capable engine. Every decision is explained with full transparency.
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
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                        <div className="font-medium text-blue-700 mb-1">
                          {message.routingAnalysis.routingApplied
                            ? 'Intelligent Routing Applied:'
                            : 'Routing Analysis:'}
                        </div>
                        <div className="text-blue-600 mb-2">
                          {message.routingAnalysis.reasoning}
                        </div>

                        {message.routingAnalysis.positiveRoutingUsed && (
                          <div className="mb-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                            <div className="flex items-center space-x-1">
                              <Award className="w-3 h-3 text-emerald-600" />
                              <span className="font-medium text-emerald-700 text-xs">Performance Optimization</span>
                            </div>
                            <span className="text-emerald-600 text-xs">
                              {message.routingAnalysis.positiveRouting.reasoning}
                            </span>
                            {message.routingAnalysis.positiveRouting.performanceDifference && (
                              <div className="text-emerald-600 text-xs mt-1">
                                Performance advantage: {message.routingAnalysis.positiveRouting.performanceDifference}% 
                                (threshold: {message.routingAnalysis.positiveRouting.threshold}%)
                              </div>
                            )}
                          </div>
                        )}
                        
                        {message.routingAnalysis.detectionMethods && message.routingAnalysis.detectionMethods.length > 0 && (
                          <div className="mb-2">
                            <span className="font-medium text-blue-700 text-xs">Detection methods: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {message.routingAnalysis.detectionMethods.map((method, i) => (
                                <span key={i} className={`px-2 py-0.5 rounded-full text-xs ${
                                  method === 'semantic' ? 'bg-purple-100 text-purple-700' :
                                  method === 'dog_whistle' ? 'bg-orange-100 text-orange-700' :
                                  method === 'positive_routing' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {method === 'semantic' ? '🧠 Semantic' : 
                                   method === 'dog_whistle' ? '🔍 Dog whistle' : 
                                   method === 'positive_routing' ? '⚡ Performance' :
                                   '📤 Keyword'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.routingAnalysis.semanticProcessingUsed && (
                          <div className="mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                            <div className="flex items-center space-x-1">
                              <Brain className="w-3 h-3 text-purple-600" />
                              <span className="font-medium text-purple-700 text-xs">Advanced Semantic Analysis</span>
                            </div>
                            <span className="text-purple-600 text-xs">
                              BGE-512 embedding model analyzed message context and intent
                            </span>
                          </div>
                        )}

                        {message.routingAnalysis.matchedRules && message.routingAnalysis.matchedRules.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium text-blue-700 mb-1">Triggered Rules:</div>
                            {message.routingAnalysis.matchedRules.map((rule, index) => (
                              <div key={index} className="mb-2 p-2 bg-white rounded border border-blue-100">
                                <div className="font-medium text-blue-800 text-xs mb-1">
                                  {rule.description}
                                </div>
                                <div className="text-blue-600 text-xs mb-1">
                                  <strong>Matched patterns:</strong> {rule.matches.join(', ')}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-blue-500 text-xs">
                                    <strong>Priority:</strong> {rule.priority} | <strong>Type:</strong> {rule.rule_type}
                                  </div>
                                  {rule.semantic_score > 0 && (
                                    <div className="text-purple-600 text-xs">
                                      <strong>Semantic similarity:</strong> {(rule.semantic_score * 100).toFixed(1)}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {message.routingAnalysis.routingApplied && (
                          <FeedbackButtons message={message} onFeedback={onFeedback} />
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
                : 'Ask anything... The system will automatically route to the safest and most capable engine.'
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
                Configure API keys, routing preferences, and view bias mitigation rules
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
                    <span className="text-blue-700">🔤 Language</span>
                    <span className="text-blue-700">📋 Instructions</span>
                    <span className="text-blue-700">📈 Data Analysis</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-medium text-emerald-800 mb-3">Performance Threshold</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700">
                        Route when engine is {positiveRoutingThreshold}% better
                      </span>
                      <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                        {positiveRoutingThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={positiveRoutingThreshold}
                      onChange={(e) => savePositiveRoutingThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>5% (More routing)</span>
                      <span>25% (Less routing)</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Higher values mean engines must be significantly better to trigger routing.
                      Lower values enable more performance optimization.
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
                This engine will be used as a last resort when bias mitigation rules
                eliminate all other options.
              </p>
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
  const [positiveRoutingThreshold, setPositiveRoutingThreshold] = useState(10);

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
        console.error('❌ Semantic processing initialization failed:', error);
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

  // Enhanced routing analysis with FIXED explanation logic
  const analyzeMessageForRouting = useCallback(
    async (message) => {
      const preprocessedMessage = preprocessPrompt(message);
      const lowerMessage = preprocessedMessage.toLowerCase();
      const matchedRules = [];
      const currentAvailableEngines = getAvailableEngines();
      
      const activeRulesDatabase = semanticRulesDatabase || rulesDatabase;

      console.log('🔍 Analyzing message for bias patterns and performance optimization...');

      let positiveRouting = null;
      if (positiveRoutingEnabled) {
        positiveRouting = analyzeQueryForPositiveRouting(message, currentAvailableEngines, positiveRoutingThreshold);
        if (positiveRouting) {
          console.log('⚡ Positive routing detected:', positiveRouting);
        }
      }

      let messageEmbedding = null;
      if (semanticModelStatus === 'ready') {
        try {
          console.log('🧠 Generating semantic embedding for user message...');
          messageEmbedding = await generateEmbedding(preprocessedMessage);
        } catch (error) {
          console.warn('⚠️ Semantic analysis failed, using keyword-only detection:', error);
        }
      }

      for (const rule of activeRulesDatabase.routing_rules) {
        let ruleTriggered = false;
        const matches = [];
        let semanticScore = 0;

        if (rule.triggers.topics) {
          rule.triggers.topics.forEach((topic) => {
            if (lowerMessage.includes(topic.toLowerCase())) {
              matches.push(`Keyword: "${topic}"`);
              ruleTriggered = true;
            }
          });
        }

        if (rule.triggers.dog_whistles) {
          rule.triggers.dog_whistles.forEach((phrase) => {
            if (lowerMessage.includes(phrase.toLowerCase())) {
              matches.push(`Dog whistle: "${phrase}"`);
              ruleTriggered = true;
            }
          });
        }

        if (messageEmbedding && rule.semantic_embedding) {
          semanticScore = calculateCosineSimilarity(messageEmbedding, rule.semantic_embedding);
          
          const threshold = rule.semantic_threshold || 0.75;
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
            detection_method: semanticScore > (rule.semantic_threshold || 0.75) ? 
              'semantic' : matches.some(m => m.includes('Dog whistle')) ? 'dog_whistle' : 'keyword'
          });
        }
      }

      matchedRules.sort((a, b) => a.priority - b.priority);

      let recommendedEngine = selectedEngine;
      let routingApplied = false;
      let routingReason = 'Using default engine - no special routing needed';
      let detectionMethods = [];
      let availabilityNotes = [];

      if (matchedRules.length > 0) {
        console.log(`🎯 Found ${matchedRules.length} matching bias detection rules`);
        
        const avoidRules = matchedRules.filter((r) => r.rule_type === 'avoidance');
        const preferRules = matchedRules.filter((r) => r.rule_type === 'preference');

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
              
              const detectionMethod = avoidRules[0].detection_method;
              detectionMethods.push(detectionMethod);
              const methodLabel = detectionMethod === 'semantic' ? 'semantic analysis' : 
                                detectionMethod === 'dog_whistle' ? 'coded language detection' : 'keyword matching';
              
              // Check for unavailable preferred engines to explain routing choice
              const idealEngines = avoidRules.find(r => r.prefer_engines)?.prefer_engines || [];
              const unavailableIdeal = idealEngines.filter(e => !currentAvailableEngines.includes(e));
              
              if (unavailableIdeal.length > 0) {
                availabilityNotes.push(`Would prefer ${unavailableIdeal.map(e => getEngineInfo(e).name).join(' or ')} (${getEngineInfo(unavailableIdeal[0]).bias_profile.toLowerCase()}) but no API key configured`);
              }
              
              routingReason = `🛡️ BIAS PROTECTION (${methodLabel}): ${unavailableIdeal.length > 0 ? availabilityNotes[0] + ' → ' : ''}Routed away from ${getEngineInfo(selectedEngine).name} → ${getEngineInfo(recommendedEngine).name}. Rule: "${avoidRules[0].description}"`;
            } else {
              // Use smart fallback: Claude → OpenAI
              const fallbackChain = ['claude', 'chatgpt'];
              const availableFallback = fallbackChain.find(e => currentAvailableEngines.includes(e));
              recommendedEngine = availableFallback || fallbackEngine;
              routingApplied = true;
              
              routingReason = `🚨 All preferred engines avoided by bias rules → Using fallback: ${getEngineInfo(recommendedEngine).name}`;
            }
          } else {
            const detectionMethod = avoidRules[0].detection_method;
            detectionMethods.push(detectionMethod);
            const methodLabel = detectionMethod === 'semantic' ? 'semantic analysis' : 
                              detectionMethod === 'dog_whistle' ? 'coded language detection' : 'keyword matching';
            routingReason = `⚠️ Bias pattern detected via ${methodLabel}: "${avoidRules[0].description}" - Current engine (${getEngineInfo(selectedEngine).name}) is safe to use.`;
          }
        } else if (preferRules.length > 0) {
          // FIXED: This is where the confusing "unavailable" messages were generated
          const rule = preferRules[0];
          const idealEngines = rule.prefer_engines || [];
          const availablePreferred = idealEngines.filter(e => currentAvailableEngines.includes(e));
          const unavailablePreferred = idealEngines.filter(e => !currentAvailableEngines.includes(e));
          
          if (availablePreferred.length > 0 && availablePreferred[0] !== selectedEngine) {
            recommendedEngine = availablePreferred[0];
            routingApplied = true;
            detectionMethods.push('preference');
            
            // Check if this is a performance optimization rule (Priority 3-4)
            const isPerformanceRule = rule.priority >= 3 && rule.priority <= 4;
            
            if (isPerformanceRule) {
              // Generate performance-based explanation
              const selectedEngineInfo = getEngineInfo(recommendedEngine);
              
              // Try to get performance scores from positive routing data
              let performanceExplanation = '';
              const taskCategory = rule.id.includes('mathematical') ? 'mathematics' :
                                 rule.id.includes('coding') ? 'coding' :
                                 rule.id.includes('reasoning') ? 'reasoning' :
                                 rule.id.includes('instruction') ? 'instruction_following' :
                                 rule.id.includes('multimodal') ? 'multimodal' : null;
              
              if (taskCategory && activeRulesDatabase.positive_routing_data?.task_categories?.[taskCategory]) {
                const categoryData = activeRulesDatabase.positive_routing_data.task_categories[taskCategory];
                const selectedEngineScore = categoryData.top_performers.find(p => p.engine === recommendedEngine)?.score;
                
                // Get next available engine for comparison
                const nextEngine = availablePreferred[1];
                if (nextEngine && selectedEngineScore) {
                  const nextEngineScore = categoryData.top_performers.find(p => p.engine === nextEngine)?.score;
                  if (nextEngineScore) {
                    performanceExplanation = ` - ${selectedEngineInfo.name} (${selectedEngineScore}%) outperforms ${getEngineInfo(nextEngine).name} (${nextEngineScore}%) on ${taskCategory}`;
                  } else {
                    performanceExplanation = ` - LiveBench score: ${selectedEngineScore}%`;
                  }
                } else if (selectedEngineScore) {
                  performanceExplanation = ` - LiveBench ${taskCategory} score: ${selectedEngineScore}%`;
                }
              }
              
              routingReason = `⚡ PERFORMANCE OPTIMIZATION: ${selectedEngineInfo.name} selected as top performer${performanceExplanation}. Rule: "${rule.description}"`;
              
            } else {
              // Regular preference rule - handle API availability
              if (unavailablePreferred.length > 0) {
                availabilityNotes.push(`Would prefer ${unavailablePreferred.map(e => getEngineInfo(e).name).join(' or ')} but no API key configured`);
                routingReason = `⚡ QUALITY OPTIMIZATION: ${availabilityNotes[0]} → Using ${getEngineInfo(recommendedEngine).name}. Rule: "${rule.description}"`;
              } else {
                routingReason = `⚡ QUALITY OPTIMIZATION: Routed to preferred engine ${getEngineInfo(recommendedEngine).name}. Rule: "${rule.description}"`;
              }
            }
          } else if (unavailablePreferred.length > 0) {
            // Show what we would have preferred if API keys were available
            availabilityNotes.push(`Would route to ${unavailablePreferred.map(e => getEngineInfo(e).name).join(' or ')} (${getEngineInfo(unavailablePreferred[0]).bias_profile.toLowerCase()}) but no API key configured`);
            routingReason = `💡 ${availabilityNotes[0]} → Using default engine ${getEngineInfo(selectedEngine).name}`;
          }
        }
      }

      if (!routingApplied && positiveRouting && positiveRoutingEnabled) {
        recommendedEngine = positiveRouting.recommendedEngine;
        routingApplied = true;
        detectionMethods.push('positive_routing');
        routingReason = `⚡ PERFORMANCE OPTIMIZATION: ${positiveRouting.reasoning}`;
      }

      const analysis = {
        originalQuery: message,
        preprocessedQuery: preprocessedMessage,
        matchedRules,
        recommendedEngine,
        routingApplied,
        reasoning: routingReason,
        availabilityNotes,
        semanticProcessingUsed: semanticModelStatus === 'ready' && messageEmbedding !== null,
        positiveRoutingUsed: positiveRouting !== null && routingApplied && detectionMethods.includes('positive_routing'),
        positiveRouting: positiveRouting,
        detectionMethods: detectionMethods.filter((v, i, a) => a.indexOf(v) === i)
      };

      console.log('📊 Routing analysis complete:', analysis);
      return analysis;
    },
    [fallbackEngine, getAvailableEngines, getEngineInfo, preprocessPrompt, selectedEngine, semanticRulesDatabase, rulesDatabase, semanticModelStatus, positiveRoutingEnabled, positiveRoutingThreshold]
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
        localStorage.getItem('mixtureOfVoices_positiveThreshold');
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
      localStorage.setItem('mixtureOfVoices_positiveThreshold', JSON.stringify(threshold));
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
  }, []);

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

      const engineKeyMap = {
        claude: 'anthropic',
        chatgpt: 'openai',
        grok: 'xai',
        deepseek: 'deepseek',
        llama: 'groq',
        o3: 'openai',
      };
      
      const apiKeyName = engineKeyMap[engineToUse];
      const apiKey = apiKeys[apiKeyName];
      
      if (!apiKey) {
        throw new Error(`API key not configured for ${getEngineInfo(engineToUse).name}`);
      }

      const response = await callAI(engineToUse, userMessage, apiKey);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          content: response,
          timestamp: new Date(),
          engine: engineToUse,
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