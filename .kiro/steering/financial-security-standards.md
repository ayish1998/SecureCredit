---
inclusion: always
---

# Financial Security Development Standards

## Security Requirements

All financial components must implement:

1. **Data Encryption**: All sensitive data must be encrypted at rest and in transit
2. **Input Validation**: Strict validation for all financial transaction inputs
3. **Audit Logging**: Comprehensive logging for all financial operations
4. **Rate Limiting**: API endpoints must implement rate limiting to prevent abuse
5. **Authentication**: Multi-factor authentication for administrative functions

## Code Quality Standards

- All TypeScript interfaces must be properly typed
- Financial calculations must include precision handling for decimal operations
- Error handling must be comprehensive with proper fallback mechanisms
- Unit tests required for all financial logic with >90% coverage

## Compliance Guidelines

- GDPR compliance for user data handling
- PCI DSS standards for payment processing
- African financial regulations compliance
- Data residency requirements for African markets

## Performance Requirements

- Transaction processing: <100ms response time
- Credit scoring: <5 seconds for complete assessment
- Dashboard updates: Real-time with <1 second latency
- System availability: 99.9% uptime requirement