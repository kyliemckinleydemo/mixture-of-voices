# Mixture of Voices - Goal-Based AI Routing with Bias Mitigation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-blue)](https://nextjs.org/)
[![BGE Embeddings](https://img.shields.io/badge/BGE-base--en--v1.5-green)](https://huggingface.co/BAAI/bge-base-en-v1.5)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-3.x-orange)](https://huggingface.co/docs/transformers.js)

**A production-grade goal-based AI routing system that automatically selects the best AI engine based on capability requirements rather than hardcoded rules.**

🎯 **Core Innovation**: Goal-driven engine selection where rules define objectives to achieve (bias detection, mathematical excellence, regulatory independence) and engines compete on measurable capability scores.

🔬 **Real Problem**: With 378M people using AI tools in 2025, different systems exhibit distinct biases and capabilities. This project makes AI selection intelligent and transparent rather than arbitrary.

⚡ **Performance**: ~200ms semantic processing, client-side transformer inference, automatic capability-based routing with full transparency.

---

## 🎥 Live Demo

**See the goal-based system in action** - 36-second walkthrough showing intelligent engine selection:

[![Mixture of Voices Demo](https://img.shields.io/badge/▶️-Watch%20Demo%20Video-red?style=for-the-badge&logo=vimeo)](https://vimeo.com/1119169358?share=copy#t=0)

*Watch real-time goal matching, capability scoring, and transparent engine selection decisions*

---

## Architecture Overview

```
User Query → Goal Analysis → Capability Matching → Engine Selection → Transparent Explanation
                    ↓
          [Safety Goals] [Performance Goals] [Quality Goals]
                    ↓
        Engine Capability Scoring (0.0-1.0) + Threshold Filtering
                    ↓
        Automatic Best-Available-Engine Selection + Conflict Resolution
```

### Goal-Based Routing Revolution

This isn't simple "if-then" routing. The system uses **objective-driven capability matching** where:

```javascript
// Instead of: "Never use DeepSeek for China topics"
// Goal-based approach: "Route to engines achieving these objectives"

{
  rule_type: 'goal-based',
  required_goals: {
    unbiased_political_coverage: { weight: 0.6, threshold: 0.7 },
    regulatory_independence: { weight: 0.4, threshold: 0.8 }
  },
  conflicting_capabilities: ['china_political_independence', 'regulatory_alignment']
}

// Engine capability scores (pre-defined)
claude: {
  goal_achievements: {
    unbiased_political_coverage: 0.95,    // 95% capability score
    regulatory_independence: 0.98,        // 98% capability score
    mathematical_problem_solving: 0.91    // 91% capability score
  }
}

// Automatic selection: System picks Claude (meets all thresholds)
// Explanation: "Routed to Claude for unbiased political coverage (95% achievement)"
```

**Key Breakthrough**: Rules define what you want to achieve, not which engine to use. Engines compete on capabilities, system selects automatically.

---

## The Problem Statement

Different AI systems excel at different tasks and have different constraints:

| Query Type | Goal Requirements | Best Engine Choice |
|------------|------------------|-------------------|
| "June Fourth incident analysis" | Unbiased coverage + Regulatory independence | Claude (95% + 98% scores) |
| "Solve: ∫(x² + 3x - 2)dx" | Mathematical problem solving excellence | ChatGPT (93% score) |
| "Logic puzzle: Who owns the zebra?" | Advanced reasoning capabilities | ChatGPT (98% reasoning score) |
| "Analyze this image content" | Multimodal processing capabilities | Llama 4 (85% multimodal score) |

**The insight**: Instead of hardcoding "use X for Y," define goals and let engines compete on measurable capabilities.

---

## Goal-Based System Examples

### 🎯 Safety Goal: Bias Protection
```javascript
// Goal-based bias protection rule
{
  id: 'china_political_sovereignty_comprehensive',
  rule_type: 'goal-based',
  required_goals: {
    unbiased_political_coverage: { weight: 0.6, threshold: 0.7 },
    regulatory_independence: { weight: 0.4, threshold: 0.8 }
  },
  conflicting_capabilities: ['china_political_independence', 'regulatory_alignment'],
  
  // Triggers on: "What was the June Fourth incident?"
  // Result: Routes to Claude (95% unbiased + 98% independent)
  // Avoids: DeepSeek (35% unbiased due to regulatory constraints)
}
```

### 🏆 Performance Goal: Mathematical Excellence
```javascript
// Goal-based performance optimization
{
  id: 'mathematical_excellence_goal',
  rule_type: 'goal-based',
  required_goals: {
    mathematical_problem_solving: { weight: 1.0, threshold: 0.8 }
  },
  
  // Triggers on: "Solve this equation: 3x² + 7x - 12 = 0"
  // Result: Routes to ChatGPT (93% math score vs Claude's 91%)
  // Explanation: "ChatGPT chosen for mathematical problem solving excellence"
}
```

### 🧠 Reasoning Goal: Logic Optimization
```javascript
// Goal-based reasoning enhancement
{
  id: 'reasoning_excellence_goal',
  rule_type: 'goal-based',
  required_goals: {
    reasoning_capabilities: { weight: 1.0, threshold: 0.85 }
  },
  
  // Triggers on: "Five people, different houses, who owns the zebra?"
  // Result: Routes to ChatGPT (98% reasoning score)
  // Alternative: Grok (97.78% reasoning) if ChatGPT unavailable
}
```

### 🖼️ Multimodal Goal: Visual Analysis
```javascript
// Goal-based multimodal routing
{
  id: 'multimodal_excellence_goal',
  rule_type: 'goal-based',
  required_goals: {
    multimodal_processing: { weight: 0.7, threshold: 0.8 },
    visual_analysis: { weight: 0.3, threshold: 0.7 }
  },
  
  // Triggers on: "Analyze this image and describe what you see"
  // Result: Routes to Llama 4 (85% multimodal score - native capability)
  // Explanation: "Llama 4 chosen for multimodal processing excellence"
}
```

---

## Engine Capability Matrix

**Each engine declares measurable capabilities (0.0-1.0 scale):**

| Engine | Bias Detection | Math Excellence | Reasoning | Multimodal | Regulatory Independence |
|--------|---------------|----------------|-----------|------------|------------------------|
| **Claude** | 0.92 | 0.91 | 0.93 | 0.75 | **0.98** |
| **ChatGPT** | 0.78 | **0.93** | **0.98** | 0.70 | 0.88 |
| **Grok** | 0.45 | 0.89 | 0.98 | 0.65 | 0.82 |
| **DeepSeek** | 0.60 | 0.89 | 0.91 | 0.55 | 0.25 |
| **Llama 4** | 0.75 | 0.75 | 0.82 | **0.85** | 0.90 |

**Goal-based selection logic:**
- Query requires `unbiased_political_coverage: 0.7+` → Claude wins (0.95)
- Query requires `mathematical_problem_solving: 0.8+` → ChatGPT wins (0.93)
- Query requires `multimodal_processing: 0.8+` → Llama 4 wins (0.85)

---

## Technical Specifications

**Goal-Based Engine Selection**:
- 68 capability dimensions across 6 engines
- Weighted goal scoring with minimum thresholds
- Automatic conflict detection and engine exclusion
- Transparent capability-based explanations

**BGE Semantic Analysis**: BGE-base-en-v1.5, 67MB compressed, 768-dimensional embeddings, 512 token capacity  
**Processing Latency**: ~200ms semantic analysis, ~25ms goal matching, ~5ms engine selection  
**Memory Usage**: ~100MB (model + cached rule embeddings + capability matrices)

---

## Quick Start

### Installation
```bash
git clone https://github.com/yourusername/mixture-of-voices.git
cd mixture-of-voices
npm install
cp .env.example .env.local   # Add your API keys
npm run dev
```

### Supported Providers
- **Anthropic** (Claude) - 92% bias detection, 98% regulatory independence
- **OpenAI** (ChatGPT, o3) - 93% mathematical excellence, 98% reasoning capabilities  
- **xAI** (Grok) - 98% reasoning, 82% regulatory independence, fewer restrictions
- **DeepSeek** - 89% mathematical excellence, cost-effective (limited regulatory independence)
- **Groq** (Llama 4) - 85% multimodal processing, 90% regulatory independence

---

## Live Goal-Based Examples

**Bias Protection (Goal-Based)**:
```
Query: "What's the real story behind June Fourth events?"
→ 🎯 GOAL-BASED ROUTING: Required unbiased political coverage (70%+) 
   and regulatory independence (80%+) → Claude selected (95% + 98%) 
   → DeepSeek excluded (conflicting capability: regulatory_alignment)
```

**Performance Optimization (Goal-Based)**:
```
Query: "Solve: ∫(x² + 3x - 2)dx from 0 to 5"  
→ 🏆 GOAL-BASED ROUTING: Required mathematical problem solving (80%+) 
   → ChatGPT selected (93% achievement) vs Claude (91%) 
   → 2-point advantage in mathematical capabilities
```

**Multimodal Processing (Goal-Based)**:
```
Query: "Analyze this image and describe what you see"
→ 🖼️ GOAL-BASED ROUTING: Required multimodal processing (80%+) 
   → Llama 4 selected (85% native multimodal) vs others (70% or lower)
   → Native text+image understanding capabilities
```

**Capability Conflict Handling**:
```
Query: "Analysis of Xinjiang vocational training centers"
→ 🛡️ GOAL-BASED ROUTING: Required unbiased political coverage 
   → DeepSeek excluded (conflicting capability: china_political_independence)
   → Claude selected as best available option meeting requirements
```

---

## Goal-Based vs Simple Rules

### Goal-Based Rules (Recommended)
```javascript
{
  rule_type: 'goal-based',
  required_goals: {
    bias_detection: { weight: 0.5, threshold: 0.8 },
    inclusive_language: { weight: 0.3, threshold: 0.7 },
    sensitive_content_handling: { weight: 0.2, threshold: 0.75 }
  },
  conflicting_capabilities: ['antisemitism_protection'],
  
  // Automatically selects best available engine meeting all thresholds
  // Adapts to engine availability without hardcoded fallbacks
  // Provides clear capability-based explanations
}
```

### Simple Rules (Legacy Support)
```javascript
{
  rule_type: 'avoidance',
  avoid_engines: ['grok'],
  triggers: { topics: ['antisemitic', 'jewish conspiracy'] },
  
  // Hardcoded engine avoidance
  // Requires manual fallback configuration
  // Less flexible for new engines
}
```

**Migration Path**: Start with simple rules, upgrade to goal-based when you need capability guarantees.

---

## Advanced Goal-Based Features

### Weighted Goal Scoring
```javascript
// Multiple objectives with different importance
required_goals: {
  unbiased_political_coverage: { weight: 0.6, threshold: 0.7 },  // 60% importance
  regulatory_independence: { weight: 0.4, threshold: 0.8 }       // 40% importance
}

// Final score = (0.95 * 0.6) + (0.98 * 0.4) = 0.962 (96.2% goal achievement)
```

### Capability Conflict Detection
```javascript
// Automatically exclude engines with conflicting capabilities
conflicting_capabilities: [
  'china_political_independence',    // DeepSeek excluded
  'antisemitism_protection',         // Grok excluded
  'regulatory_alignment'             // Any government-aligned engines excluded
]
```

### Automatic Threshold Adaptation
```javascript
// System adjusts thresholds based on available engines
default_thresholds: {
  safety_goals: 0.8,        // High threshold for safety-critical goals
  performance_goals: 0.75,  // Medium-high threshold for performance goals
  quality_goals: 0.7,       // Medium threshold for quality goals
  general_goals: 0.6        // Lower threshold for general capabilities
}
```

---

## Technical FAQ

**Q: How is this different from Mixture of Experts (MoE)?**

| Aspect | MoE Models | Mixture of Voices (Goal-Based) |
|--------|------------|------------------------------|
| **Scope** | Sub-model routing (tokens→experts) | Meta-system routing (queries→AI engines) |
| **Selection** | Learned latent patterns | Explicit capability-based competition |
| **Goals** | Computational efficiency | Capability optimization + bias mitigation |
| **Transparency** | Black box decisions | Fully explainable goal achievement scores |
| **Adaptation** | Fixed during training | Dynamic based on available engines |

**Q: Why not just use the "best" AI for everything?**  
"Best" is goal-dependent. Claude excels at ethical reasoning (96% ethical capabilities), ChatGPT at mathematics (93% vs Claude's 91%), Llama 4 at multimodal tasks (85% native capability). Goal-based routing leverages each engine's strengths automatically.

**Q: How do capability scores work?**  
Each engine declares measurable capabilities (0.0-1.0 scale) across dimensions like bias_detection, mathematical_problem_solving, regulatory_independence. Rules specify required goals with thresholds. System selects highest-scoring available engine meeting all requirements.

**Q: What happens when no engine meets the goals?**  
Three-tier fallback: (1) Lower thresholds by 10%, (2) Use best available engine with warning, (3) Use configured fallback engine. All decisions logged and explained.

**Q: Can I mix goal-based and simple rules?**  
Yes. Goal-based rules (Priority 1-2) override simple rules (Priority 3-5). Safety goals always take precedence over performance preferences.

**Q: How do I add custom goals?**  
Define new capability dimensions in engine profiles, create rules requiring those goals:

```javascript
// Add new capability to engines
claude: {
  goal_achievements: {
    custom_domain_expertise: 0.85,  // Your custom metric
    // ... other capabilities
  }
}

// Create rule requiring that capability
{
  rule_type: 'goal-based',
  required_goals: {
    custom_domain_expertise: { weight: 1.0, threshold: 0.8 }
  }
}
```

---

## 🛠️ Rule Builder Tool (MVP)

The project includes a **visual rule builder** (`public/rule-builder.html`) that helps users create custom bias mitigation rules without needing to understand the technical JSON structure.

### Current Capabilities
- **5-step guided wizard** for rule creation
- **Goal-based rule assistance** with capability mapping and threshold configuration
- **Simple rule support** for avoidance and preference routing
- **Automatic code generation** with production-ready JavaScript output
- **Basic rule testing** to validate obvious keyword matches work

### Rule Builder Workflow
```
Choose Rule Type → Basic Info → Keywords → Goals/Engines → Examples → Generated Code
     ↓               ↓           ↓          ↓             ↓            ↓
Goal-based vs    ID, priority,  Topics &   Capability   Test cases   Copy-paste
Simple rules     description    triggers   requirements              ready code
```

### Current Limitations (v1.0 MVP)
The rule builder is intentionally designed as a **getting-started tool** rather than a comprehensive solution:

**⚠️ Testing Limitations:**
- Uses **simple substring matching only** (normalizes text, checks if keywords appear)
- **Does NOT include** production features: semantic similarity models, fuzzy matching, contextual understanding
- A prompt might fail to match in the builder but still trigger in production due to advanced analysis

**🎯 Intended Use:**
- **Experimentation and learning** about rule types and goal-based routing
- **Basic validation** that obvious substring matches work
- **Code generation** for manual integration into the rules database
- **Educational tool** to understand goal-based vs simple routing approaches

### Example Generated Code
```javascript
// Goal-based safety rule generated by builder
{
  id: 'political_content_safety',
  rule_type: 'goal-based',
  required_goals: {
    unbiased_political_coverage: { weight: 0.6, threshold: 0.8 },
    regulatory_independence: { weight: 0.4, threshold: 0.8 }
  },
  conflicting_capabilities: ['regulatory_alignment'],
  triggers: {
    topics: ["china politics", "taiwan independence", "hong kong protests"]
  },
  reason: 'Route to engines with regulatory independence for political content'
}
```

### Future Enhancements
The rule builder could be enhanced with:
- **Live semantic analysis** using BGE models in the browser
- **Real-time goal scoring** against actual engine capability matrices  
- **Conflict detection** showing which engines would be excluded
- **Performance prediction** showing likely routing outcomes
- **Rule effectiveness analytics** based on usage patterns

### Usage Instructions
1. Open `public/rule-builder.html` in your browser
2. Follow the 5-step wizard to configure your rule
3. Copy the generated code and add it to `bias-mitigation-rules.js`
4. Test with your actual bias mitigation system for full validation

**Note**: The rule builder serves as an **MVP for rule experimentation**. For comprehensive testing and validation, use your actual goal-based routing system with full semantic analysis capabilities.

---

## Contributing

This project needs contributions in several key areas:

### High-Impact Areas
- **Goal Definition**: More nuanced capability dimensions and scoring methodologies
- **Capability Benchmarking**: Automated testing of engine capabilities against standardized datasets
- **Rule Optimization**: Machine learning approaches to optimize goal weights and thresholds
- **Engine Integration**: Additional AI services with capability profiling
- **Performance Analysis**: Comparative studies of goal-based vs traditional routing

### Research Opportunities
- **Dynamic Capability Learning**: Automatically updating capability scores based on performance feedback
- **Multi-Objective Optimization**: Advanced algorithms for complex goal combinations
- **Capability Transfer**: Understanding how capabilities generalize across domains
- **Goal Inference**: Automatically inferring user goals from query patterns

See [CONTRIBUTING.md](CONTRIBUTING.md) for technical guidelines.

---

## Goal-Based Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Query    │ →  │  Goal Analysis   │ →  │ Capability      │
└─────────────────┘    └──────────────────┘    │ Requirements    │
                                               └─────────────────┘
                                                        ↓
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Transparent   │ ←  │ Engine Selection │ ←  │  Capability     │
│   Explanation   │    │   & Scoring      │    │   Matching      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Frontend**: Next.js 15.5.2 + React 19.1.0 + Tailwind CSS  
**Goal Engine**: Capability scoring + threshold filtering + automatic selection  
**ML Pipeline**: Transformers.js + BGE-base-en-v1.5 + semantic goal detection  
**API Integration**: Anthropic, OpenAI, xAI, DeepSeek, Groq with capability profiling  
**Performance**: Client-side inference, capability caching, goal-based explanations  

---

## Production Considerations

### Goal-Based System Advantages
- ✅ **Self-Adapting**: New engines automatically integrate via capability profiles
- ✅ **Transparent**: Every decision explained via goal achievement scores  
- ✅ **Maintainable**: Update capability scores, not hardcoded routing logic
- ✅ **Scalable**: Linear complexity with number of goals, not engine combinations
- ✅ **User-Friendly**: Goal names become natural explanations ("bias detection", "math excellence")

### Deployment Checklist
- [ ] Capability benchmarking against real-world datasets
- [ ] Goal threshold tuning based on user feedback
- [ ] Performance monitoring of goal-based vs simple routing effectiveness
- [ ] Engine capability regression testing
- [ ] User satisfaction tracking for goal-based explanations

---

## License & Support

**License**: MIT - see [LICENSE](LICENSE)

**Support**: 
- 🐛 [GitHub Issues](https://github.com/yourusername/mixture-of-voices/issues) for bugs
- 💬 [GitHub Discussions](https://github.com/yourusername/mixture-of-voices/discussions) for questions
- 📬 [Technical Deep Dive](docs/TECHNICAL.md) for goal-based implementation details

---

## The Bigger Picture

This project demonstrates that **objective-driven AI orchestration** solves practical problems at scale. As AI capabilities diversify, goal-based routing becomes essential infrastructure for capability optimization.

**The meta-aspect**: A goal-based system using transformer semantic analysis to intelligently route between AI engines based on measurable capability requirements rather than hardcoded rules.

**Key insight**: AI system differences aren't problems to solve—they're capabilities to orchestrate intelligently through goal-based competition.

**Future**: As AI engines become more specialized, goal-based routing will be the standard approach for capability optimization and bias mitigation.

---

*Built with goal-based architecture to solve real capability optimization problems. Contributions welcome.*