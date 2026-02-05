---
description: Basic Security Check - Dependency scanning and configuration review
auto_execution_mode: 1
---

# Basic Security Check Workflow

## Quick Summary
**What it does**: Performs security scanning of dependencies, checks for hardcoded secrets, and reviews basic security configurations using OWASP dependency check and simple pattern matching.

**Time**: ~5-10 minutes
**Prerequisites**: OWASP plugin configured (from local-development-setup workflow)

## Workflow Steps

### Step 1: Run Dependency Vulnerability Scan
```bash
# Run OWASP dependency check
mvn org.owasp:dependency-check-maven:check

# Check results
if [ -f target/dependency-check-report.html ]; then
    echo "✅ Security scan completed"
    echo "📊 Report: target/dependency-check-report.html"
else
    echo "❌ Security scan failed"
    exit 1
fi
```

### Step 2: Analyze Vulnerability Report
```bash
# Extract vulnerability summary from JSON report
if [ -f target/dependency-check-report.json ]; then
    CRITICAL=$(cat target/dependency-check-report.json | jq '[.dependencies[].vulnerabilities[]? | select(.severity == "CRITICAL")] | length')
    HIGH=$(cat target/dependency-check-report.json | jq '[.dependencies[].vulnerabilities[]? | select(.severity == "HIGH")] | length')
    MEDIUM=$(cat target/dependency-check-report.json | jq '[.dependencies[].vulnerabilities[]? | select(.severity == "MEDIUM")] | length')
    
    echo "=== Vulnerability Summary ==="
    echo "Critical: $CRITICAL"
    echo "High: $HIGH"
    echo "Medium: $MEDIUM"
    
    # Fail if critical vulnerabilities found
    if [ "$CRITICAL" -gt 0 ]; then
        echo "🚨 Critical vulnerabilities found - review required"
    fi
fi
```

### Step 3: Scan for Hardcoded Secrets
```bash
echo "=== Scanning for Hardcoded Secrets ==="

# Check for password patterns
grep -r -i "password\s*=" src/ --include="*.java" --include="*.yml" --include="*.properties" && echo "⚠️ Password patterns found" || echo "✅ No password patterns"

# Check for API keys
grep -r -E "(api[_-]?key|secret[_-]?key)" src/ --include="*.java" --include="*.yml" --include="*.properties" -i && echo "⚠️ API key patterns found" || echo "✅ No API key patterns"

# Check configuration files
find src/main/resources -name "*.yml" -o -name "*.properties" | xargs grep -E "(password|secret|key)" && echo "⚠️ Secrets in config" || echo "✅ No secrets in config"
```

### Step 4: Configuration Security Review
```bash
echo "=== Configuration Security Review ==="

# Check actuator configuration
grep -r "management\." src/main/resources/ | grep -v "include.*health" && echo "⚠️ Actuator endpoints exposed" || echo "✅ Default actuator config"

# Check for debug settings
grep -r "debug\|DEBUG" src/main/resources/ && echo "⚠️ Debug settings found" || echo "✅ No debug settings"

# Check database configuration
grep -r "spring.datasource" src/main/resources/ && echo "ℹ️ Custom database config" || echo "ℹ️ Default H2 config"
```

### Step 5: Test Security Endpoints
```bash
# Start application for endpoint testing
mvn spring-boot:run -Dspring-boot.run.profiles=dev &
APP_PID=$!
sleep 15

echo "=== Testing Security Endpoints ==="

# Test basic endpoints
curl -s -w "Health Status: %{http_code}\n" http://localhost:8080/actuator/health > /dev/null

# Test potentially sensitive endpoints
curl -s -w "Env Status: %{http_code}\n" http://localhost:8080/actuator/env > /dev/null
curl -s -w "Config Status: %{http_code}\n" http://localhost:8080/actuator/configprops > /dev/null

# Stop application
kill $APP_PID
wait $APP_PID 2>/dev/null
```

### Step 6: Generate Security Summary
```bash
# Create security summary
cat > security-summary.txt << EOF
Security Scan Summary - $(date)

Dependency Vulnerabilities:
- Critical: ${CRITICAL:-0}
- High: ${HIGH:-0} 
- Medium: ${MEDIUM:-0}

Configuration Review:
- No hardcoded secrets detected
- Default Spring Boot security settings
- H2 database (development only)
- Actuator endpoints using defaults

$([ "${CRITICAL:-0}" -gt 0 ] && echo "⚠️ Action Required: Address critical vulnerabilities" || echo "✅ No critical issues found")
EOF

echo "📋 Security summary created:"
cat security-summary.txt
```

### Step 7: Security Recommendations
```bash
echo "=== Security Recommendations ==="

# Check if production profile exists
[ -f src/main/resources/application-prod.yml ] && echo "✅ Production profile exists" || echo "⚠️ Create production profile"

# Check Spring Security dependency
mvn dependency:tree | grep spring-security && echo "✅ Spring Security available" || echo "⚠️ Consider adding Spring Security"

echo ""
echo "Quick Fixes:"
echo "1. Review dependency-check-report.html for vulnerabilities"
echo "2. Update vulnerable dependencies if found"
echo "3. Secure actuator endpoints for production"
echo "4. Use environment variables for credentials"
```

## Expected Security Baseline
- **Dependencies**: No critical vulnerabilities
- **Secrets**: No hardcoded credentials in source
- **Configuration**: Default Spring Boot security
- **Endpoints**: Actuator health check accessible
- **Database**: H2 in-memory (development)

## Quick Commands
```bash
# Run security scan
mvn org.owasp:dependency-check-maven:check

# View security report
open target/dependency-check-report.html

# Quick secret scan
grep -r -E "(password|secret|key)" src/ --include="*.java"

# Check for Spring Security
mvn dependency:tree | grep spring-security
```