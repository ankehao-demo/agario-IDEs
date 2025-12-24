---
description: Comprehensive Testing Workflow - Full test suite execution and analysis for Flask + JavaScript applications
---

# Testing Workflow

Quick testing commands and procedures for Flask + JavaScript applications.

## Essential Commands

### **Basic Testing**
```bash
npm test                           # Run all tests
npm test -- --coverage            # Run with coverage
npm test -- --watch               # Watch mode for development
```

### **Python Testing** (if configured)
```bash
python3 -m pytest                 # Run Python tests
python3 -m pytest --cov=.         # Python tests with coverage
```

### **Code Quality**
```bash
npx eslint static/js/ --ext .js   # JavaScript linting
python3 -m flake8 *.py            # Python style check
```

## Testing Process

### 1. **Run Full Test Suite**
```bash
npm test -- --coverage --verbose
```
Check that all tests pass and coverage meets thresholds (>80% lines, >75% branches).

### 2. **Test Specific Files**
```bash
npm test -- --testPathPattern=filename.test.js
```

### 3. **Integration Testing**
```bash
# Test Flask routes
FLASK_ENV=testing python3 app.py &
curl -f http://localhost:5000/
kill %1
```

### 4. **Debug Failed Tests**
```bash
npm test -- --testNamePattern="test name" --verbose
```

## Test Organization

```
static/js/__tests__/
├── entities.test.js      # Core logic tests
├── utils.test.js         # Utility functions
└── collisions.test.js    # Collision detection
```

## Development Setup

### **Watch Mode**
```bash
npm test -- --watch --watchAll=false
```

### **Pre-commit Hook**
```bash
echo '#!/bin/sh\nnpm test' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Coverage Targets
- **Lines**: >80%
- **Branches**: >75% 
- **Functions**: >85%

## Quick Fixes

- **Import errors**: Check file paths and exports
- **Async failures**: Use proper async/await
- **Cache issues**: `npm test -- --clearCache`
- **Memory issues**: `npm test -- --runInBand`

## CI Integration
```yaml
- run: npm test -- --coverage --watchAll=false
```
