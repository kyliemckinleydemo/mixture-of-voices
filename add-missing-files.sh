#!/bin/bash

echo "Adding missing files to make your project GitHub-ready..."
echo "======================================================="

# Create comprehensive README.md
echo "Creating README.md..."
cat > README.md << 'EOF'
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
EOF

# Create .env.example
echo "Creating .env.example..."
cat > .env.example << 'EOF'
# Mixture of Voices - Environment Variables Example
# Copy this file to .env.local and fill in your actual API keys

# Anthropic API Key (for Claude)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI API Key (for ChatGPT)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# xAI API Key (for Grok)
# Get from: https://console.x.ai/
XAI_API_KEY=your_xai_api_key_here

# DeepSeek API Key (for DeepSeek)
# Get from: https://platform.deepseek.com/
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Groq API Key (for Llama)
# Get from: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# Development Configuration
NODE_ENV=development

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Notes:
# - Never commit .env files to version control
# - Store API keys securely in production
# - Use environment-specific files (.env.local, .env.production)
# - All API keys are optional - the app will work with any subset of providers
EOF

# Update or create .gitignore
echo "Creating/updating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# API Keys (for security)
.env.production
.env.development

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Temporary folders
tmp/
temp/
EOF

# Create CONTRIBUTING.md
echo "Creating CONTRIBUTING.md..."
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Mixture of Voices

Thank you for your interest in contributing to Mixture of Voices! This project aims to create transparent, bias-aware AI routing for better information equity.

## How You Can Help

### Priority Areas
- **Bias Mitigation Rules**: Expanding the rules database with new routing patterns
- **AI Provider Integrations**: Adding support for additional AI providers
- **UI/UX Improvements**: Enhancing the user interface and experience
- **Documentation**: Improving guides, examples, and explanations
- **Testing**: Bug reports, edge case testing, and quality assurance

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Git
- At least one AI provider API key for testing

### Setup Development Environment
1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/mixture-of-voices.git
   cd mixture-of-voices
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```
5. **Start development server**
   ```bash
   npm run dev
   ```

## Contribution Guidelines

### Code Style
- Use functional React components with hooks
- Follow existing code patterns and naming conventions
- Keep components small and focused
- Use memoization for performance optimization
- Comment complex routing logic clearly

### Bias Mitigation Rules
When adding new routing rules to `public/rules-database.json`:

```json
{
  "id": "unique_rule_identifier",
  "priority": 1,
  "description": "Clear description of what this rule does",
  "rule_type": "avoidance|preference",
  "avoid_engines": ["engine1"],
  "prefer_engines": ["engine2"],
  "triggers": {
    "topics": ["keyword1", "keyword2"],
    "sentiment_patterns": ["pattern1"],
    "phrase_patterns": ["exact phrase"]
  },
  "reason": "Detailed explanation of why this rule exists"
}
```

### Rule Quality Standards
- **Evidence-based**: Rules should be based on documented bias patterns
- **Specific**: Avoid overly broad rules that catch too many queries
- **Justified**: Include clear reasoning for why the rule improves outcomes
- **Tested**: Verify rules work as expected with test queries

## Pull Request Process

### Before Submitting
- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Follow existing code style
- [ ] Add comments for complex logic
- [ ] Verify no API keys are committed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Bias mitigation rule
- [ ] Performance improvement

## Testing
- [ ] Tested with multiple AI providers
- [ ] Verified routing decisions
- [ ] Checked edge cases
```

## Reporting Bugs

### Bug Report Template
```markdown
**Describe the bug**
Clear description of what's wrong

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Environment:**
- OS: [e.g. macOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

**API Providers**
Which AI providers were you using?
```

## Security Guidelines

### API Key Safety
- Never commit API keys to version control
- Store keys in environment variables only
- Use `.env.local` for development
- Clear keys from browser storage appropriately

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

By contributing to Mixture of Voices, you're helping create more transparent and equitable AI interactions. Every contribution matters!
EOF

# Create LICENSE file
echo "Creating LICENSE..."
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Mixture of Voices

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo ""
echo "All files created successfully!"
echo ""
echo "Next steps:"
echo "1. Review the files and make any adjustments"
echo "2. Run: git add ."
echo "3. Run: git commit -m 'Add documentation and configuration files'"
echo "4. Create GitHub repository and push"
echo ""
echo "Files added:"
echo "- README.md (comprehensive documentation)"
echo "- .env.example (API key template)"
echo "- .gitignore (updated with security exclusions)"
echo "- CONTRIBUTING.md (contribution guidelines)"
echo "- LICENSE (MIT license)"
EOF