# ExchangeWAF

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4)](https://dotnet.microsoft.com/download/dotnet/8.0)

A specialized Web Application Firewall (WAF) engineered for Microsoft Exchange Server 2019 and IIS 10 environments, providing defense-in-depth protection against common web vulnerabilities and targeted attacks.

## Core Security Features

- **Advanced Input Validation and Sanitization**: Comprehensive protection against OWASP Top 10 threats including XSS, SQL injection, command injection, and directory traversal vulnerabilities
- **Exchange-Specific Security Controls**: Tailored protection for Exchange authentication flows with enhanced 2FA security controls
- **Threat Detection & Response**: Real-time monitoring and blocking of malicious traffic patterns
- **IP Reputation Management**: Dynamic IP reputation scoring with automatic blacklisting capabilities for persistent threat actors
- **Security Operations Dashboard**: Centralized interface for security monitoring, rule management, and threat analysis
- **Forensic Logging**: Detailed audit logging of security events with complete request context for incident response

## Technical Requirements

- Microsoft Exchange Server 2019
- Internet Information Services (IIS) 10
- .NET 8.0 Runtime/SDK
- Microsoft SQL Server 2019+ (or SQL LocalDB for testing environments)

## Deployment Guide

### 1. Environment Setup

```bash
git clone https://github.com/cyb3rhex/ExchangeWAF.git
cd ExchangeWAF
```

### 2. Database Configuration

Modify the database connection string in `ExchangeWAF/ExchangeWAF.Web/appsettings.json` to reference your SQL Server instance:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=your_server;Database=ExchangeWAF;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

### 3. Database Initialization

```bash
cd ExchangeWAF
dotnet ef database update --project ExchangeWAF.Data --startup-project ExchangeWAF.Web
```

### 4. Build and Verification

```bash
dotnet build --configuration Release
dotnet run --project ExchangeWAF.Web
```

### 5. Production Deployment

```bash
dotnet publish -c Release -o ./publish
```

#### IIS Configuration:
1. Create a dedicated IIS site pointing to the published directory
2. Configure an application pool with .NET CLR v4.0 + Integrated Pipeline Mode
3. Implement URL Rewrite rules to proxy Exchange traffic through the WAF
4. Configure appropriate TLS settings and certificate bindings

## Exchange Server Integration

### IIS URL Rewrite Configuration

Implement the following rewrite rules in your Exchange server's web.config:

```xml
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ExchangeWAF" stopProcessing="true">
          <match url="^(fortinet/login2fa|owa/auth|ecp/auth).*" />
          <action type="Rewrite" url="https://localhost:5000/waf/proxy/{R:0}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### Security Rule Management

ExchangeWAF provides out-of-the-box protection for common attack vectors:
- Cross-Site Scripting (XSS) prevention
- SQL injection detection and blocking
- OS command injection protection
- Path/directory traversal mitigation
- Authentication flow protection

All security rules can be customized and extended through the administrative interface.

## Administration

### Security Dashboard

Access the security operations dashboard at `https://your-server:5000/waf/dashboard` to:
- Monitor security metrics and attack trends
- Configure and tune security rules
- Review detected attacks and blocked requests
- Manage IP reputation and blacklists

### REST API

ExchangeWAF exposes a RESTful API for security automation and integration:
- `GET/POST /api/v1/securityrules` - Security rule management
- `GET /api/v1/threats` - Query blocked attack attempts
- `GET/POST/DELETE /api/v1/ipreputation` - IP reputation management
- `GET /api/v1/metrics` - Security metrics and telemetry

## Support and Contributions

For security issues, feature requests, or bug reports, please submit an issue through the [GitHub Issue Tracker](https://github.com/cyb3rhex/ExchangeWAF/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Mustafa Hussein - [https://github.com/cyb3rhex](https://github.com/cyb3rhex) 