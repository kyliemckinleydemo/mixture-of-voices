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
