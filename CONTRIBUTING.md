# Contributing to RootAura

First off, thank you for considering contributing to RootAura! It's people like you that make RootAura such a great tool for farmers worldwide.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript/Python styleguides
* Include thoughtfully-worded, well-structured tests
* Document new code
* End all files with a newline

## Development Process

1. **Fork the repo** and create your branch from `main`
2. **Install dependencies**:
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd backend && npm install
   
   # ML Services
   cd ml-services && pip install -r requirements.txt
   ```

3. **Make your changes**
4. **Test your changes**:
   ```bash
   # Frontend
   npm run test
   
   # Backend
   npm run test
   
   # ML Services
   pytest
   ```

5. **Ensure code quality**:
   ```bash
   # Frontend/Backend
   npm run lint
   npm run format
   
   # ML Services
   black .
   flake8 .
   ```

6. **Commit your changes** using conventional commits:
   ```
   feat: add new feature
   fix: fix bug
   docs: update documentation
   style: formatting changes
   refactor: code refactoring
   test: add tests
   chore: maintenance tasks
   ```

7. **Push to your fork** and submit a pull request

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Add JSDoc comments for functions
* Use async/await over promises

### Python Styleguide

* Follow PEP 8
* Use type hints
* Write docstrings for all functions
* Use meaningful variable names
* Keep functions small and focused

### Documentation Styleguide

* Use Markdown
* Reference functions and classes in backticks
* Include code examples where appropriate
* Keep line length to 80 characters when possible

## Project Structure

```
ROOTAURA/
├── frontend/          # Next.js application
├── backend/           # Node.js API
├── ml-services/       # Python ML services
├── docs/              # Documentation
└── tests/             # Integration tests
```

## Testing

* Write tests for all new features
* Ensure all tests pass before submitting PR
* Aim for >80% code coverage
* Include both unit and integration tests

## Questions?

Feel free to open an issue with your question or reach out to the team at team@rootaura.io

Thank you for contributing! 🌱
