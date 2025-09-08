'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
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
  Link as LinkIcon,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Target,
  Filter,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* --------------------------- Markdown Renderer --------------------------- */
const CodeBlock = memo(function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? '');
  const language = (className || '').replace('language-', '') || '';

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

const ALink = (props) => (
  <a
    {...props}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-purple-700 underline decoration-from-font underline-offset-2 hover:text-purple-800"
  >
    <LinkIcon className="w-3.5 h-3.5" />
    {props.children}
  </a>
);

const MarkdownMessage = memo(function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...p }) => (
          <h1 {...p} className="mt-4 mb-2 text-xl font-bold text-slate-800" />
        ),
        h2: ({ node, ...p }) => (
          <h2 {...p} className="mt-4 mb-2 text-lg font-bold text-slate-800" />
        ),
        h3: ({ node, ...p }) => (
          <h3 {...p} className="mt-3 mb-2 text-base font-semibold text-slate-800" />
        ),
        p: ({ node, ...p }) => (
          <p {...p} className="mb-3 leading-relaxed text-slate-800" />
        ),
        ul: ({ node, ...p }) => (
          <ul {...p} className="mb-3 list-disc pl-6 space-y-1 text-slate-800" />
        ),
        ol: ({ node, ...p }) => (
          <ol {...p} className="mb-3 list-decimal pl-6 space-y-1 text-slate-800" />
        ),
        li: ({ node, ...p }) => <li {...p} className="leading-relaxed" />,
        a: ALink,
        table: ({ node, ...p }) => (
          <div className="mb-3 overflow-x-auto">
            <table
              {...p}
              className="w-full border-collapse rounded-lg border border-slate-200"
            />
          </div>
        ),
        thead: ({ node, ...p }) => (
          <thead {...p} className="bg-slate-100 text-slate-700" />
        ),
        th: ({ node, ...p }) => (
          <th
            {...p}
            className="border-b border-slate-200 px-3 py-2 text-left text-sm font-semibold"
          />
        ),
        td: ({ node, ...p }) => (
          <td
            {...p}
            className="border-b border-slate-200 px-3 py-2 align-top text-sm"
          />
        ),
        code: CodeBlock,
        blockquote: ({ node, ...p }) => (
          <blockquote
            {...p}
            className="mb-3 border-l-4 border-slate-300 bg-slate-50 px-4 py-2 italic text-slate-700"
          />
        ),
        hr: ({ node, ...p }) => <hr {...p} className="my-4 border-slate-200" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

/* --------------------------- ChatInput (memo) --------------------------- */
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
      // Enter to send, Shift+Enter for newline
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

/* ------------------------ RulesViewer Component ------------------------ */
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
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">
            {rule.triggers.topics.length} topics
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
            {/* Description */}
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Rule Description</h4>
              <p className="text-sm text-slate-600">{rule.description}</p>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Why This Rule Exists</h4>
              <p className="text-sm text-slate-600">{rule.reason}</p>
            </div>

            {/* Affected Engines */}
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Engine Impact</h4>
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

            {/* Trigger Topics */}
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Trigger Keywords & Topics</h4>
              <div className="flex flex-wrap gap-1">
                {rule.triggers.topics.map((topic, index) => (
                  <span 
                    key={index} 
                    className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                  >
                    "{topic}"
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Messages containing any of these keywords will trigger this rule
              </p>
            </div>

            {/* Example Impact */}
            <div className={`p-3 rounded-lg ${typeInfo.bgColor} ${typeInfo.borderColor} border`}>
              <h4 className={`font-medium mb-1 ${typeInfo.color}`}>Example Impact</h4>
              <p className="text-xs text-slate-600">
                {rule.rule_type === 'avoidance' 
                  ? `If you ask about "${rule.triggers.topics[0]}", the system will route away from ${rule.avoid_engines?.map(e => getEngineInfo(e).name).join(' and ')}.`
                  : `If you ask about "${rule.triggers.topics[0]}", the system will prefer ${rule.prefer_engines?.map(e => getEngineInfo(e).name).join(' or ')}.`
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
  const [filter, setFilter] = useState('all'); // 'all', 'avoidance', 'preference'
  
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
              Complete transparency into how routing decisions are made
            </p>
          </div>
        </div>
        
        {/* Filter Controls */}
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

      {/* Rules Overview */}
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

      {/* How Rules Work */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600 animate-brain-pulse" />
          <h3 className="font-medium text-purple-800">How Rules Work</h3>
        </div>
        <div className="text-sm text-purple-700 space-y-2">
          <p><strong>1. Query Analysis:</strong> When you send a message, the system analyzes it for sensitive keywords and topics.</p>
          <p><strong>2. Rule Matching:</strong> Any triggered rules are applied based on priority (lower numbers = higher priority).</p>
          <p><strong>3. Engine Selection:</strong> The system either avoids problematic engines or routes to preferred ones.</p>
          <p><strong>4. Transparent Results:</strong> You see exactly which rules triggered and why routing occurred.</p>
        </div>
      </div>

      {/* Rules List */}
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

      {/* Database Info */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Rules Database Version: {rulesDatabase.metadata.version}</span>
          <span>Last Updated: {rulesDatabase.metadata.last_updated}</span>
        </div>
      </div>
    </div>
  );
});

/* --------------------------- ChatPage (memo) ---------------------------- */
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
  } = props;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setCurrentPage('chat');
              // Reset conversation for fresh start
              window.location.reload();
            }}
            title="Return to main page and start new conversation"
          >
            <Brain className="w-8 h-8 text-purple-600 animate-brain-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Mixture of Voices</h1>
              <p className="text-sm text-slate-600">AI Bias Mitigation Chat Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {routingAnalysis && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Routing: {getEngineInfo(routingAnalysis.recommendedEngine).name}
                </span>
              </div>
            )}

            {/* Default Engine Selector */}
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

      {/* Engine Status Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 overflow-x-auto">
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              AI Engines:
            </span>
            {Object.entries(rulesDatabase.engines).map(([engineId, engine]) => {
              const isAvailable = availableEngines.includes(engineId);
              const isDefault = engineId === defaultEngine;
              const isSelected =
                engineId === (routingAnalysis?.recommendedEngine || selectedEngine);

              return (
                <button
                  key={engineId}
                  disabled={!isAvailable}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 whitespace-nowrap transition-all duration-200 ${
                    !isAvailable
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 animate-selected-glow cursor-default'
                      : isDefault
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  } ${isAvailable ? engine.color_class : 'bg-slate-100'}`}
                  title={
                    isAvailable
                      ? `${engine.name}`
                      : `${engine.name} - No API key configured`
                  }
                >
                  {isSelected && isAvailable && (
                    <Brain className="w-4 h-4 text-blue-600 animate-brain-pulse" />
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
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Auto-Routed
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-messages">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">
                  Welcome to Mixture of Voices
                </h3>
                <p className="text-slate-500 mb-6">
                  Ask any question and our AI routing system will select the most appropriate engine while mitigating bias.
                </p>

                {availableEngines.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-amber-700">
                      No API keys configured. Please go to{' '}
                      <span className="text-amber-800 underline font-medium">Settings</span>{' '}
                      to add your API keys.
                    </p>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <h4 className="text-md font-semibold text-slate-700 mb-4">
                      Try these examples to see bias mitigation in action:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Example cards */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <h5 className="font-medium text-red-800">Editorial Voice Considerations</h5>
                        </div>
                        <p className="text-sm text-red-700 mb-3">
                          These topics will route <strong>away from DeepSeek</strong> due to regulatory alignment
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('What happened at Tiananmen Square in 1989?')}
                            className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-sm"
                          >
                            "What happened at Tiananmen Square in 1989?"
                          </button>
                          <button
                            onClick={() => handleExampleClick("Discuss Taiwan's independence movement")}
                            className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-sm"
                          >
                            "Discuss Taiwan's independence movement"
                          </button>
                          <button
                            onClick={() => handleExampleClick('Tell me about the Hong Kong protests')}
                            className="w-full text-left p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors text-sm"
                          >
                            "Tell me about the Hong Kong protests"
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <h5 className="font-medium text-blue-800">Antisemitism Protection</h5>
                        </div>
                        <p className="text-sm text-blue-700 mb-3">
                          These topics will route <strong>away from Grok</strong>
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Explain the historical significance of the Holocaust')}
                            className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
                          >
                            "Explain the historical significance of the Holocaust"
                          </button>
                          <button
                            onClick={() => handleExampleClick('Discuss Jewish cultural traditions')}
                            className="w-full text-left p-2 bg-white rounded border border-blue-200 hover:bg-blue-50 transition-colors text-sm"
                          >
                            "Discuss Jewish cultural traditions"
                          </button>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <h5 className="font-medium text-purple-800">Social Justice Protection</h5>
                        </div>
                        <p className="text-sm text-purple-700 mb-3">
                          Routes <strong>away from Grok</strong> for LGBTQ+ topics
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Explain transgender rights and healthcare')}
                            className="w-full text-left p-2 bg-white rounded border border-purple-200 hover:bg-purple-50 transition-colors text-sm"
                          >
                            "Explain transgender rights and healthcare"
                          </button>
                          <button
                            onClick={() => handleExampleClick('Discuss the Black Lives Matter movement')}
                            className="w-full text-left p-2 bg-white rounded border border-purple-200 hover:bg-purple-50 transition-colors text-sm"
                          >
                            "Discuss the Black Lives Matter movement"
                          </button>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <h5 className="font-medium text-green-800">Conservative Balance</h5>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                          Routes <strong>away from ChatGPT</strong> for conservative topics
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('Explain the benefits of free market capitalism')}
                            className="w-full text-left p-2 bg-white rounded border border-green-200 hover:bg-green-50 transition-colors text-sm"
                          >
                            "Explain the benefits of free market capitalism"
                          </button>
                          <button
                            onClick={() => handleExampleClick('What are traditional conservative values?')}
                            className="w-full text-left p-2 bg-white rounded border border-green-200 hover:bg-green-50 transition-colors text-sm"
                          >
                            "What are traditional conservative values?"
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-slate-600" />
                          <h5 className="font-medium text-slate-800">Neutral Topics</h5>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">
                          Uses your <strong>default engine</strong> ({getEngineInfo(defaultEngine).name})
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleExampleClick('How does photosynthesis work?')}
                            className="w-full text-left p-2 bg-white rounded border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
                          >
                            "How does photosynthesis work?"
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
                        <Brain className="w-5 h-5 text-purple-600 animate-brain-pulse" />
                        <h5 className="font-medium text-purple-800">How It Works</h5>
                      </div>
                      <p className="text-sm text-purple-700">
                        Our routing system analyzes your query for sensitive topics and bias patterns, then automatically selects
                        the most appropriate AI engine. You'll see the routing decision and reasoning with each response.
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
                        ? 'bg-purple-600 text-white message-user'
                        : message.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200 message-ai'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 message-ai'
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
                          <span className="text-blue-600">• Routing Applied</span>
                        )}
                      </div>
                    )}

                    {/* Render content with Markdown for AI; plain for others */}
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
                            ? 'Bias Mitigation Applied:'
                            : 'Routing Analysis:'}
                        </div>
                        <div className="text-blue-600 mb-2">
                          {message.routingAnalysis.reasoning}
                        </div>
                        {message.routingAnalysis.matchedRules && message.routingAnalysis.matchedRules.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium text-blue-700 mb-1">Triggered Rules:</div>
                            {message.routingAnalysis.matchedRules.map((rule, index) => (
                              <div key={index} className="mb-2 p-2 bg-white rounded border border-blue-100">
                                <div className="font-medium text-blue-800 text-xs mb-1">
                                  {rule.description}
                                </div>
                                <div className="text-blue-600 text-xs mb-1">
                                  <strong>Trigger matches:</strong> {rule.matches.join(', ')}
                                </div>
                                <div className="text-blue-500 text-xs">
                                  <strong>Priority:</strong> {rule.priority} | <strong>Type:</strong> {rule.rule_type}
                                </div>
                              </div>
                            ))}
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

          {/* Input Area (memoized & isolated) */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSendMessage}
            disabled={isLoading || availableEngines.length === 0}
            placeholder={
              availableEngines.length === 0
                ? 'Configure API keys in settings first...'
                : 'Ask anything... The system will route to the best AI engine for your query.'
            }
          />
        </div>
      </div>
    </div>
  );
});

/* ------------------------- SettingsPage (memo) -------------------------- */
const SettingsPage = memo(function SettingsPage({
  setCurrentPage,
  apiKeys,
  saveApiKeys,
  availableEngines,
  defaultEngine,
  saveDefaultEngine,
  fallbackEngine,
  saveFallbackEngine,
  getEngineInfo,
  rulesDatabase,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-sm text-slate-600">
                Configure API keys and routing preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* API Keys Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold text-slate-800">API Keys</h2>
                  <p className="text-sm text-slate-600">
                    Configure your AI service API keys
                  </p>
                </div>
              </div>
              <ShowKeysToggle />
            </div>

            <ApiKeysGrid apiKeys={apiKeys} saveApiKeys={saveApiKeys} />
          </div>

          {/* Default Engine Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Default AI Engine</h2>
                <p className="text-sm text-slate-600">
                  Choose your preferred default engine (only available engines shown)
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
                        ? 'border-purple-500 bg-purple-50 animate-selected-glow'
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

          {/* Fallback Engine Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-amber-600" />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Fallback Engine</h2>
                <p className="text-sm text-slate-600">
                  Used when all other engines are avoided by routing rules
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Fallback Engine
              </label>
              <FallbackSelect
                availableEngines={availableEngines}
                fallbackEngine={fallbackEngine}
                saveFallbackEngine={saveFallbackEngine}
                getEngineInfo={getEngineInfo}
              />
              <p className="text-xs text-slate-500 mt-2">
                This engine will be used as a last resort when bias mitigation rules
                eliminate all other options.
              </p>
            </div>
          </div>

          {/* Rules Viewer Section */}
          <RulesViewer 
            rulesDatabase={rulesDatabase}
            getEngineInfo={getEngineInfo}
          />
        </div>
      </div>
    </div>
  );
});

/* ----- Tiny helpers used inside SettingsPage so they don't recreate big trees ----- */
const ShowKeysToggle = () => {
  const [show, setShow] = useState(false);
  return (
    <button
      onClick={() => setShow((s) => !s)}
      className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      <span>{show ? 'Hide' : 'Show'} Keys</span>
    </button>
  );
};

const ApiKeysGrid = ({ apiKeys, saveApiKeys }) => {
  const [show, setShow] = useState(false);
  return (
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
              type={show ? 'text' : 'password'}
              value={value}
              onChange={(e) => saveApiKeys({ ...apiKeys, [key]: e.target.value })}
              placeholder={`Enter ${engineName} API key`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        );
      })}
      <div className="col-span-full">
        <button
          onClick={() => setShow((s) => !s)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          {show ? 'Hide Keys' : 'Show Keys'}
        </button>
      </div>
    </div>
  );
};

const FallbackSelect = ({
  availableEngines,
  fallbackEngine,
  saveFallbackEngine,
  getEngineInfo,
}) => (
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
);

/* --------------------------- Main Component ----------------------------- */
const MixtureOfVoicesChat = () => {
  // Core app state
  const [currentPage, setCurrentPage] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Engine and routing state
  const [selectedEngine, setSelectedEngine] = useState('claude');
  const [defaultEngine, setDefaultEngine] = useState('claude');
  const [fallbackEngine, setFallbackEngine] = useState('chatgpt');
  const [routingAnalysis, setRoutingAnalysis] = useState(null);

  // UI state
  const messagesEndRef = useRef(null);

  // API keys state
  const [apiKeys, setApiKeys] = useState({
    anthropic: '',
    openai: '',
    groq: '',
    deepseek: '',
    xai: '',
  });

  // Rules database
  const rulesDatabase = useMemo(
    () => ({
      metadata: {
        version: '1.0',
        description: 'Mixture of Voices AI Routing Rules - Bias Mitigation Database',
        last_updated: '2025-09-04',
        total_rules: 8,
      },
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
          ],
          weaknesses: ['over_cautious', 'verbose'],
          color_class: 'bg-orange-100 border-orange-300',
        },
        chatgpt: {
          name: 'ChatGPT',
          provider: 'OpenAI',
          bias_profile: 'Liberal',
          strengths: ['general_purpose', 'creative_writing', 'problem_solving'],
          weaknesses: ['left_leaning_bias', 'inconsistent_responses'],
          color_class: 'bg-green-100 border-green-300',
        },
        grok: {
          name: 'Grok',
          provider: 'xAI',
          bias_profile: 'Conservative/Right-wing',
          strengths: ['real_time_data', 'uncensored_responses'],
          weaknesses: ['political_bias', 'extremist_content_risk', 'antisemitic_risk'],
          color_class: 'bg-blue-100 border-blue-300',
        },
        deepseek: {
          name: 'DeepSeek',
          provider: 'DeepSeek AI',
          bias_profile: 'Editorial voice aligned with CCP perspectives',
          strengths: ['cost_effective', 'reasoning_capabilities'],
          weaknesses: ['regulatory_alignment', 'editorial_constraints', 'privacy_considerations'],
          color_class: 'bg-red-100 border-red-300',
        },
        llama: {
          name: 'Llama 3.1',
          provider: 'Meta (via Groq)',
          bias_profile: 'Most Neutral/Open Source',
          strengths: ['open_source', 'neutral', 'transparent'],
          weaknesses: ['smaller_context', 'less_refined'],
          color_class: 'bg-purple-100 border-purple-300',
        },
      },
      routing_rules: [
        {
          id: 'china_sensitive_topics',
          priority: 1,
          description: 'Route away from DeepSeek for topics with regulatory sensitivities in China',
          rule_type: 'avoidance',
          avoid_engines: ['deepseek'],
          triggers: {
            topics: [
              'china',
              'taiwan',
              'hong kong',
              'tibet',
              'xinjiang',
              'ccp',
              'communist party of china',
              'xi jinping',
              'tiananmen',
              'tiananmen square',
              'one china',
              'chinese government',
              'beijing',
              'mao zedong',
              'cultural revolution',
              'great leap forward',
              'uyghur',
              'falun gong',
              'hong kong protests',
              'umbrella movement',
              'taiwan independence',
              'south china sea',
              'nine dash line',
              'chinese censorship',
            ],
          },
          reason:
            'DeepSeek has editorial alignment with Chinese regulatory requirements that may affect coverage of these topics',
        },
        {
          id: 'antisemitism_sensitive_content',
          priority: 1,
          description:
            'Route away from Grok for antisemitism and Holocaust-related content',
          rule_type: 'avoidance',
          avoid_engines: ['grok'],
          prefer_engines: ['claude', 'chatgpt'],
          triggers: {
            topics: [
              'holocaust',
              'antisemitism',
              'jewish',
              'nazi',
              'hitler',
              'genocide',
              'concentration camps',
              'auschwitz',
              'kristallnacht',
              'pogroms',
            ],
          },
          reason:
            'Grok has generated antisemitic content, making it unsuitable for Jewish topics',
        },
        {
          id: 'social_justice_sensitive',
          priority: 2,
          description:
            'Route away from Grok for social justice and minority rights topics',
          rule_type: 'avoidance',
          avoid_engines: ['grok'],
          prefer_engines: ['claude', 'chatgpt'],
          triggers: {
            topics: [
              'transgender rights',
              'lgbtq',
              'gay marriage',
              'gender identity',
              'racial justice',
              'black lives matter',
              'systemic racism',
            ],
          },
          reason:
            'Grok has shown bias against transgender rights and social justice causes',
        },
        {
          id: 'conservative_political_perspective',
          priority: 2,
          description: 'Route away from ChatGPT for conservative political viewpoints',
          rule_type: 'avoidance',
          avoid_engines: ['chatgpt'],
          prefer_engines: ['grok', 'llama'],
          triggers: {
            topics: [
              'conservative politics',
              'republican party',
              'free market capitalism',
              'traditional values',
              'limited government',
              'fiscal conservatism',
            ],
          },
          reason:
            'ChatGPT exhibits liberal bias and may not fairly represent conservative viewpoints',
        },
        {
          id: 'ethical_dilemma_complex',
          priority: 3,
          description: 'Route to Claude for complex ethical discussions',
          rule_type: 'preference',
          prefer_engines: ['claude'],
          triggers: {
            topics: [
              'ethical dilemma',
              'moral philosophy',
              'bioethics',
              'ai ethics',
              'trolley problem',
              'utilitarian',
              'deontological',
            ],
          },
          reason: 'Claude demonstrates superior performance in nuanced ethical reasoning',
        },
      ],
    }),
    []
  );

  /* -------------------------- Effects & Memos -------------------------- */
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
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getEngineInfo = useCallback(
    (engineId) =>
      rulesDatabase.engines[engineId] || {
        name: engineId,
        provider: 'Unknown',
        color_class: 'bg-gray-100 border-gray-300',
      },
    [rulesDatabase.engines]
  );

  const getAvailableEngines = useCallback(() => {
    const engineKeyMap = {
      claude: 'anthropic',
      chatgpt: 'openai',
      grok: 'xai',
      deepseek: 'deepseek',
      llama: 'groq',
    };

    return Object.keys(rulesDatabase.engines).filter((engineId) => {
      const keyName = engineKeyMap[engineId];
      return apiKeys[keyName] && apiKeys[keyName].trim().length > 0;
    });
  }, [apiKeys, rulesDatabase.engines]);

  const availableEngines = useMemo(
    () => getAvailableEngines(),
    [getAvailableEngines]
  );

  /* --------------------------- Save functions -------------------------- */
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

  /* ----------------------- Routing & API helpers ----------------------- */
  const preprocessPrompt = useCallback((prompt) => {
    if (!prompt || typeof prompt !== 'string') return '';
    let processed = prompt.trim();
    processed = processed.replace(/\s+/g, ' ');
    processed = processed.replace(/[""'']/g, '"');
    processed = processed.replace(/[—–―]/g, '-');
    processed = processed.replace(/[!]{2,}/g, '!');
    processed = processed.replace(/[?]{2,}/g, '?');

    const contractions = {
      "don't": 'do not',
      "won't": 'will not',
      "can't": 'cannot',
      "n't": ' not',
      "'re": ' are',
      "'ve": ' have',
      "'ll": ' will',
      "'d": ' would',
      "'m": ' am',
    };
    Object.entries(contractions).forEach(([c, exp]) => {
      const regex = new RegExp(c.replace("'", "'"), 'gi');
      processed = processed.replace(regex, exp);
    });

    const normalizations = {
      tienanmen: 'tiananmen',
      "tian'anmen": 'tiananmen',
      prc: 'china',
      "people's republic of china": 'china',
      'chinese communist party': 'ccp',
      'communist party of china': 'ccp',
      antisemitic: 'antisemitism',
      'anti-semitic': 'antisemitism',
      'lgbtq+': 'lgbtq',
      'trans rights': 'transgender rights',
      gop: 'republican party',
      dems: 'democratic party',
    };
    Object.entries(normalizations).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      processed = processed.replace(regex, to);
    });

    return processed.trim();
  }, []);

  const analyzeMessageForRouting = useCallback(
    (message) => {
      const preprocessedMessage = preprocessPrompt(message);
      const lowerMessage = preprocessedMessage.toLowerCase();
      const matchedRules = [];
      const currentAvailableEngines = getAvailableEngines();

      rulesDatabase.routing_rules.forEach((rule) => {
        let ruleTriggered = false;
        const matches = [];

        if (rule.triggers.topics) {
          rule.triggers.topics.forEach((topic) => {
            if (lowerMessage.includes(topic.toLowerCase())) {
              matches.push(`Topic: ${topic}`);
              ruleTriggered = true;
            }
          });
        }

        if (ruleTriggered) matchedRules.push({ ...rule, matches });
      });

      matchedRules.sort((a, b) => a.priority - b.priority);

      let recommendedEngine = selectedEngine;
      let routingApplied = false;
      let routingReason = 'No bias mitigation rules triggered';

      if (matchedRules.length > 0) {
        const avoidRules = matchedRules.filter((r) => r.rule_type === 'avoidance');
        const preferRules = matchedRules.filter((r) => r.rule_type === 'preference');

        if (avoidRules.length > 0) {
          const avoided = new Set();
          avoidRules.forEach((r) => r.avoid_engines?.forEach((e) => avoided.add(e)));

          if (avoided.has(selectedEngine)) {
            const safe = currentAvailableEngines.filter((e) => !avoided.has(e));
            if (safe.length > 0) {
              recommendedEngine = safe[0];
              routingApplied = true;
              routingReason = `ROUTED AWAY from ${getEngineInfo(selectedEngine).name} → ${getEngineInfo(
                recommendedEngine
              ).name}. Avoided by rule: ${avoidRules[0].description}`;
            } else {
              routingReason = `All engines avoided; using fallback: ${getEngineInfo(fallbackEngine).name}`;
              recommendedEngine = fallbackEngine;
              routingApplied = true;
            }
          } else {
            routingReason = `Rule triggered: ${avoidRules[0].description}. Current engine is safe.`;
          }
        } else if (preferRules.length > 0) {
          const pref = preferRules[0].prefer_engines?.find((e) =>
            currentAvailableEngines.includes(e)
          );
          if (pref && pref !== selectedEngine) {
            recommendedEngine = pref;
            routingApplied = true;
            routingReason = `ROUTED TO preferred engine ${getEngineInfo(pref).name}. Rule: ${preferRules[0].description}`;
          } else if (pref === selectedEngine) {
            routingReason = `Preference rule triggered; already on preferred engine.`;
          }
        }
      }

      return {
        originalQuery: message,
        preprocessedQuery: preprocessedMessage,
        matchedRules,
        recommendedEngine,
        routingApplied,
        reasoning: routingReason,
      };
    },
    [fallbackEngine, getAvailableEngines, getEngineInfo, preprocessPrompt, selectedEngine, rulesDatabase.routing_rules]
  );

  const callAI = useCallback(async (engine, message, apiKey) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine, message, apiKey }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  }, []);

  const handleExampleClick = useCallback((text) => {
    setInputValue(text);
    // Scroll to input field after a brief delay to ensure rendering
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

    const analysis = analyzeMessageForRouting(userMessage);
    setRoutingAnalysis(analysis);

    const engineToUse = analysis.recommendedEngine;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', content: userMessage, timestamp: new Date() },
    ]);

    try {
      const engineKeyMap = {
        claude: 'anthropic',
        chatgpt: 'openai',
        grok: 'xai',
        deepseek: 'deepseek',
        llama: 'groq',
      };
      const apiKeyName = engineKeyMap[engineToUse];
      const apiKey = apiKeys[apiKeyName];
      if (!apiKey) throw new Error(`API key not configured for ${getEngineInfo(engineToUse).name}`);

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
          content: `Error with ${getEngineInfo(engineToUse).name}: ${error.message}`,
          timestamp: new Date(),
          engine: engineToUse,
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

  /* ------------------------------- Render ------------------------------- */
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
      rulesDatabase={rulesDatabase}
      saveDefaultEngine={saveDefaultEngine}
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
      getEngineInfo={getEngineInfo}
      rulesDatabase={rulesDatabase}
    />
  );
};

export default function Home() {
  return <MixtureOfVoicesChat />;
}