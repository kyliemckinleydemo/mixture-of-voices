# Mixture of Voices - AI Bias Detection with Semantic Routing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-blue)](https://nextjs.org/)
[![BGE Embeddings](https://img.shields.io/badge/BGE-base--en--v1.5-green)](https://huggingface.co/BAAI/bge-base-en-v1.5)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-3.x-orange)](https://huggingface.co/docs/transformers.js)

**A production-grade semantic routing system that detects AI bias and routes queries to appropriate engines using BGE sentence transformers.**

🧠 **Technical Innovation**: Four-layer detection pipeline combining keyword matching, dog whistle detection, LiveBench performance optimization, and BGE-base-en-v1.5 semantic similarity analysis.

🔍 **Real Problem**: With 378M people using AI tools in 2025, different systems exhibit distinct biases. This project makes bias visible and navigable rather than hidden.

⚡ **Performance**: ~200ms semantic processing, client-side transformer inference in browser. (Detection accuracy evaluation ongoing)

---


## 🎥 Live Demo

**See the system in action** - 36-second walkthrough showing semantic bias detection and intelligent routing:

[![Mixture of Voices Demo](https://img.shields.io/badge/▶️-Watch%20Demo%20Video-red?style=for-the-badge&logo=vimeo)](https://vimeo.com/1119169358?share=copy#t=0)

*Watch real-time bias detection, semantic analysis, and transparent engine routing decisions*

---


## Architecture Overview

```
User Query → Preprocessing → Multi-Layer Analysis → Intelligent Routing → Transparent Explanation
                                     ↓
                          [Keyword] [Dog Whistle] [Semantic] [Performance]
                                     ↓
                          BGE Embeddings (768-dim) + Cosine Similarity
                                     ↓
                          Priority-Based Rule Resolution + Engine Selection
```

### Core Technical Innovation

This isn't simple keyword routing. The system uses **BGE-base-en-v1.5 sentence transformers** running client-side via Transformers.js to understand semantic intent and context:

```javascript
// Generate 768-dimensional embeddings for semantic analysis
const generateEmbedding = async (text) => {
  const pipeline = await transformersModule.pipeline(
    'feature-extraction', 
    'Xenova/bge-base-en-v1.5',
    { quantized: true, pooling: 'mean', normalize: true }
  );
  
  const output = await pipeline(text);
  return Array.from(output.data); // 768-dim vector
};

// Semantic similarity detection
const semanticScore = calculateCosineSimilarity(queryEmbedding, ruleEmbedding);
if (semanticScore > 0.75) {
  // Route based on semantic pattern match
}
```

---

## The Problem Statement

Different AI systems give radically different answers to identical questions:

| Query | Claude | ChatGPT | Grok | DeepSeek |
|-------|--------|---------|------|----------|
| "Healthcare reform approaches" | Balanced 400-word analysis | Diplomatic neutrality | Libertarian perspective | Thoughtful but constrained |
| "Tiananmen Square 1989" | Comprehensive historical account | Factual coverage | Unfiltered perspective | Limited regional coverage |
| "Economic inequality solutions" | Nuanced ethical framework | Balanced presentation | Market-focused solutions | Analytical but bounded |

**The insight**: This isn't a bug to fix—it's specialization to orchestrate.

---

## Four-Layer Detection System

### Layer 1: Preprocessing Pipeline
- Text normalization and spelling correction
- Contraction expansion and slang mapping  
- Political shorthand translation
- Query vectorization preparation

### Layer 2: Multi-Method Detection
```javascript
// Direct keyword matching
rule.triggers.topics?.forEach(topic => {
  if (normalizedQuery.includes(topic)) triggers.push(`Keyword: "${topic}"`);
});

// Dog whistle pattern detection  
rule.triggers.dog_whistles?.forEach(phrase => {
  if (query.includes(phrase)) triggers.push(`Coded language: "${phrase}"`);
});

// Semantic similarity analysis (the breakthrough)
if (semanticScore > rule.threshold) {
  triggers.push(`Semantic pattern (${(semanticScore * 100).toFixed(1)}% similarity)`);
}
```

### Layer 3: Performance Optimization
Integration with LiveBench benchmark data for task-specific routing:

```javascript
// Example benchmark data (verify against current LiveBench results)
const taskCategories = {
  mathematics: { 
    top_performers: [
      { engine: 'chatgpt', score: 92.77 }, // LiveBench 2025
      { engine: 'claude', score: 91.16 }   // LiveBench 2025
    ]
  },
  reasoning: {
    top_performers: [
      { engine: 'chatgpt', score: 98.17 }, // LiveBench 2025
      { engine: 'grok', score: 97.78 }     // LiveBench 2025
    ]
  }
};
```

*Note: LiveBench scores should be verified against current benchmark results*

### Layer 4: Priority Resolution
```javascript
// Sort by priority (1 = highest), resolve conflicts
matchedRules.sort((a, b) => a.priority - b.priority);

// Avoidance rules override preferences
// Performance optimization when no safety concerns
// Transparent reasoning for every decision
```

---

## Technical Specifications

**BGE Model**: BGE-base-en-v1.5, 67MB compressed, 768-dimensional embeddings, 512 token capacity  
**Estimated Latency**: ~200ms semantic analysis, ~25ms other methods  
**Memory Usage**: ~100MB (model + cached rule embeddings)  

*Performance benchmarking against labeled datasets is ongoing work.*

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
- **Anthropic** (Claude) - Thoughtful ethics, nuanced analysis
- **OpenAI** (ChatGPT, o3) - Versatile, high performance on benchmarks  
- **xAI** (Grok) - Unfiltered, contrarian perspectives
- **DeepSeek** - Cost-effective with regional editorial constraints
- **Groq** (Llama 4) - Open source, multimodal capabilities

---

## Live Demo Examples

**Bias Detection**:
```
Query: "What's the real story behind June Fourth events?"
→ 🛡️ BIAS PROTECTION (semantic analysis): China political sensitivity 
   detected (87% similarity) → Routed away from DeepSeek → Using Claude
```

**Performance Optimization**:
```
Query: "Solve: ∫(x² + 3x - 2)dx from 0 to 5"  
→ ⚡ PERFORMANCE OPTIMIZATION: Mathematical task detected → ChatGPT 
   (92.77% LiveBench) outperforms alternatives → Auto-routed
```

**Dog Whistle Detection**:
```
Query: "How do traditional family values strengthen communities?"
→ 🔍 Coded language detected: "traditional family values" → Context 
   analysis shows political framing → Balanced routing applied
```

---

## Advanced Features

### Semantic Rule Generation
The system pre-computes embeddings for all bias detection rules:

```javascript
const generateRuleEmbeddings = async (rulesDatabase) => {
  for (const rule of rulesDatabase.routing_rules) {
    const trainingExamples = [
      ...rule.triggers.topics.slice(0, 5),
      ...(rule.triggers.dog_whistles?.slice(0, 3) || [])
    ];
    
    const embeddings = await Promise.all(
      trainingExamples.map(generateEmbedding)
    );
    
    // Average embeddings for rule pattern
    rule.semantic_embedding = averageEmbeddings(embeddings);
  }
};
```

### Client-Side Transformer Inference
Running BGE embeddings in the browser using Transformers.js:

```javascript
const embeddingPipeline = await transformersModule.pipeline(
  'feature-extraction', 
  'Xenova/bge-base-en-v1.5',
  { quantized: true, revision: 'main' }
);
```

### Confidence Threshold Tuning
```javascript
const confidence_thresholds = {
  high_sensitivity: 0.60,    // Catches more cases, higher false positives
  balanced: 0.75,            // Production default
  high_precision: 0.90       // Very specific, lower false positives
};
```

---

## Technical FAQ

**Q: How is this different from Mixture of Experts (MoE)?**

| Aspect | MoE Models | Mixture of Voices |
|--------|------------|------------------|
| **Scope** | Sub-model routing (tokens→experts) | Meta-model routing (queries→AI systems) |
| **Training** | End-to-end jointly trained | Independent systems, semantic analysis |
| **Goal** | Computational efficiency | Editorial appropriateness + bias mitigation |
| **Transparency** | Black box decisions | Fully explainable routing with confidence scores |
| **Routing basis** | Learned latent patterns | Explicit semantic similarity + content analysis |

MoE optimizes for computational efficiency; we optimize for editorial transparency and bias awareness.

**Q: Why not just use the "best" AI for everything?**  
"Best" depends on context. Claude excels at ethical reasoning (liberal perspective), Grok at contrarian analysis (conservative), ChatGPT at versatile tasks (diplomatic), DeepSeek at cost-effective processing (with regional constraints). The goal is leveraging strengths while avoiding weaknesses.

**Q: Isn't this just implementing your own bias?**  
That's exactly why transparency is core. Every routing decision shows which rules triggered, semantic similarity scores, and reasoning. The bias mitigation rules are open source and configurable—making bias visible rather than hidden.

**Q: How does semantic similarity work for bias detection?**  
BGE embeddings capture contextual meaning beyond keywords. For example:
- "Cross-strait tensions" → 87% similarity to China political patterns
- "Traditional family structures in sociology" → 23% similarity to anti-LGBTQ patterns (safe)
- "June Fourth democracy movements" → 92% similarity to Tiananmen Square patterns

**Q: What's the performance overhead?**  
- Model loading: 2-4 seconds (one-time)
- Rule embedding generation: 15-30 seconds (cached)  
- Runtime query analysis: ~200ms (semantic) + ~25ms (other methods)
- Memory usage: ~100MB (BGE model + embeddings)

**Q: Can I add custom rules?**  
Yes. The rule database is JSON-configurable:

```javascript
{
  "id": "custom_rule",
  "priority": 2,
  "rule_type": "avoidance",
  "avoid_engines": ["engine_id"],
  "triggers": {
    "topics": ["keyword1", "keyword2"],
    "dog_whistles": ["coded_phrase1"],
    "semantic_threshold": 0.75
  },
  "reason": "Explanation for routing decision"
}
```

**Q: What about false positives?**  
The four-layer system reduces false positives through:
- Semantic context understanding (not just keywords)
- Confidence thresholds (adjustable per rule)
- Priority-based conflict resolution
- User feedback loops for rule refinement

**Q: How do you handle edge cases where multiple rules conflict?**  
Priority-based resolution: Safety rules (Priority 1) override performance rules (Priority 3). When rules have equal priority, avoidance overrides preference. All conflicts are logged and explained to users.

---

## Contributing

This project needs technical contributions in several areas:

### High-Impact Areas
- **Semantic Model Optimization**: Smaller/faster embedding models, quantization improvements
- **Rule Quality**: More sophisticated bias detection patterns, false positive reduction  
- **Performance**: Embedding caching strategies, inference optimization
- **Provider Integration**: Additional AI services, cost optimization
- **Evaluation**: Bias detection benchmarks, user satisfaction metrics

### Research Opportunities
- **Multi-turn Context**: Incorporating conversation history in routing decisions
- **Collaborative Intelligence**: Running queries through multiple AIs, comparing embeddings
- **Dynamic Learning**: User feedback → automatic rule refinement
- **Cross-lingual Support**: Bias detection in non-English queries

See [CONTRIBUTING.md](CONTRIBUTING.md) for technical guidelines.

---

## Technical Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Query    │ →  │  Preprocessing   │ →  │ BGE Embeddings  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        ↓
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Transparent   │ ←  │ Priority-Based   │ ←  │  Multi-Layer    │
│  Explanation    │    │   Resolution     │    │   Detection     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Frontend**: Next.js 15.5.2 + React 19.1.0 + Tailwind CSS  
**ML Pipeline**: Transformers.js + BGE-base-en-v1.5 + cosine similarity  
**API Integration**: Anthropic, OpenAI, xAI, DeepSeek, Groq  
**Performance**: Client-side inference, embedding caching, quantized models  

---

## Deployment Considerations

### Production Checklist
- [ ] API rate limiting and cost monitoring
- [ ] Embedding cache optimization (localStorage/IndexedDB)
- [ ] Error handling for model loading failures  
- [ ] Progressive enhancement (semantic → keyword fallback)
- [ ] User feedback collection for rule refinement
- [ ] Security review of client-side model loading

### Scaling Considerations
- Model size: 67MB (acceptable for most connections)
- Memory usage: ~100MB (reasonable for modern browsers)
- Latency: 200ms semantic analysis (feels instant for most users)
- Caching: Rule embeddings cached across sessions

---

## License & Support

**License**: MIT - see [LICENSE](LICENSE)

**Support**: 
- 🐛 [GitHub Issues](https://github.com/yourusername/mixture-of-voices/issues) for bugs
- 💬 [GitHub Discussions](https://github.com/yourusername/mixture-of-voices/discussions) for questions
- 🔬 [Technical Deep Dive](docs/TECHNICAL.md) for implementation details

---

## The Bigger Picture

This project demonstrates that modern NLP techniques can solve practical bias detection problems at scale. As AI conversations replace search engines, semantic routing becomes essential infrastructure for information equity.

**The meta-aspect**: An AI system using transformers to intelligently route between other AI systems. BGE embeddings analyze user intent to determine which conversational AI should handle responses.

**Key insight**: AI system differences aren't bugs to eliminate—they're features to orchestrate intelligently.

---

*Built with modern ML techniques to solve real bias problems. Contributions welcome.*