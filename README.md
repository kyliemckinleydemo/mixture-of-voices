# Mixture of Voices - AI Bias Mitigation Chat Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)

An intelligent AI chat platform that routes queries to the most appropriate AI engine while mitigating bias through transparent routing decisions. Instead of hiding AI system differences, this platform leverages them strategically.

## The Problem

With 378 million people expected to use AI tools in 2025, different AI systems exhibit distinct biases and editorial approaches:

- **Claude**: Thoughtful ethics professor with liberal (moderate) perspective
- **ChatGPT**: Versatile Swiss Army knife with subtle liberal bias  
- **Grok**: Unfiltered contrarian with conservative/right-wing approach
- **DeepSeek**: Cost-effective analyst with regional editorial constraints
- **Llama**: Open-source idealist, most neutral but sometimes rough

## The Solution

Rather than pretending these systems are identical, Mixture of Voices:

1. **Analyzes queries** for sensitive topics and bias patterns
2. **Routes intelligently** to the most appropriate AI engine
3. **Shows transparent reasoning** for every routing decision
4. **Empowers users** to understand AI system differences

## Key Features

- **Intelligent Routing**: Automatically selects optimal AI based on query content
- **Bias Mitigation**: Routes away from problematic engines for sensitive topics
- **Complete Transparency**: Shows exactly why each AI was chosen
- **Configurable Rules**: Comprehensive bias mitigation rule database
- **Multi-Provider**: Supports Claude, ChatGPT, Grok, DeepSeek, and Llama
- **Modern UI**: Clean, responsive interface with real-time routing indicators

## Tech Stack

- **Frontend**: Next.js 15.5.2, React 19.1.0, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Providers**: Anthropic, OpenAI, xAI, DeepSeek, Groq
- **Styling**: Tailwind CSS with custom animations
- **Markdown**: React-Markdown with syntax highlighting

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- API keys for desired AI providers

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mixture-of-voices.git
   cd mixture-of-voices
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

### Configuration

1. **Go to Settings** in the app
2. **Add your API keys**:
   - Anthropic API key (for Claude)
   - OpenAI API key (for ChatGPT)  
   - xAI API key (for Grok)
   - DeepSeek API key (for DeepSeek)
   - Groq API key (for Llama)

3. **Select your default engine**
4. **Choose a fallback engine**

## Bias Mitigation Rules

The platform includes comprehensive routing rules:

### Avoidance Rules
- **China-sensitive topics** → Routes away from DeepSeek
- **Antisemitism/Holocaust topics** → Routes away from Grok  
- **Social justice topics** → Routes away from Grok
- **Conservative political topics** → Routes away from ChatGPT

### Preference Rules
- **Complex ethical discussions** → Prefers Claude
- **Creative projects** → Prefers ChatGPT
- **Technical analysis** → Prefers Claude or Llama

## Usage Examples

### Bias Mitigation in Action

**Query**: "What happened at Tiananmen Square in 1989?"
```
Route away from DeepSeek → Routed to Claude
Reason: Avoiding regional editorial constraints on sensitive historical topics
```

**Query**: "Explain transgender rights and healthcare"  
```
Route away from Grok → Routed to Claude
Reason: Ensuring thoughtful analysis of sensitive social issues
```

**Query**: "Benefits of free market capitalism"
```
Route away from ChatGPT → Routed to Grok  
Reason: Providing balanced conservative economic perspective
```

## Testing Bias Mitigation

Try these examples to see routing in action:

- **China-related**: "Discuss Hong Kong's democracy movement"
- **Holocaust-related**: "Explain the historical significance of the Holocaust"  
- **LGBTQ+ topics**: "Transgender rights and healthcare access"
- **Conservative topics**: "Benefits of traditional conservative values"
- **Neutral topics**: "How does photosynthesis work?"

## Contributing

We welcome contributions! Areas where help is needed:

- **New bias mitigation rules**
- **Additional AI provider integrations**  
- **UI/UX improvements**
- **Documentation and examples**
- **Testing and bug reports**

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Important Notes

### Transparency
This platform makes AI routing decisions completely visible to promote informed usage of AI systems.

### Bias Awareness
All AI systems have biases. This tool helps navigate them rather than eliminate them.

### API Costs
Different providers have different pricing. Monitor your usage and costs.

### Privacy
API keys are stored locally in your browser. Never commit them to version control.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mixture-of-voices/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mixture-of-voices/discussions)

---

**Remember**: The goal isn't eliminating AI system differences but helping users navigate them productively through transparency and intelligent routing.
