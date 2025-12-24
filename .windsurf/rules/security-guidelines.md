---
trigger: always_on
---

## Input Validation
- Always validate and sanitize user inputs
- Use parameterized queries to prevent SQL injection
- Validate file uploads and restrict file types
- Implement rate limiting for API endpoints

## Authentication & Authorization
- Use strong password policies
- Implement proper session management
- Use HTTPS for all communications
- Store sensitive data encrypted
- Implement proper access controls

## Code Security
- Never hardcode secrets, API keys, or passwords
- Use environment variables for configuration
- Regularly update dependencies to patch vulnerabilities
- Implement proper error handling without exposing sensitive information

## Data Protection
- Encrypt sensitive data at rest and in transit
- Implement proper data retention policies
- Use secure random number generation
- Sanitize logs to avoid exposing sensitive information

## API Security
- Implement proper CORS policies
- Use API versioning
- Implement request/response validation
- Use proper HTTP status codes