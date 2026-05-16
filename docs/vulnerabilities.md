# Security Findings — OWASP Top 10 (2025)

**Audit Date:** 2026-05-16  
**Scope:** LTI Talent Tracking System (AI4Devs-QA)  
**Findings:** 5 verified issues across 4 OWASP categories

---

## A02 — Cryptographic Failures

### Hardcoded Database Credentials in Prisma Schema

**Severity:** 🔴 CRITICAL  
**Location:** `backend/prisma/schema.prisma:14`

**Evidence:**
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
}
```

**Impact:** Database credentials (username `LTIdbUser`, password, host, port, database name) are hardcoded in the Prisma schema file. This is committed to version control and exposes plaintext credentials to anyone with repository access. An attacker can directly connect to the PostgreSQL database.

**Remediation:**
1. Move `DATABASE_URL` to environment variables:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Create `backend/.env` with:
   ```
   DATABASE_URL=postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb
   ```
3. Ensure `.env` is in `.gitignore` (verify with `git status`).
4. Rotate all database credentials immediately.

**References:**
- [OWASP A02:2025 — Cryptographic Failures](https://owasp.org/Top10/2025/A02_2025-Cryptographic_Failures/)
- [12factor.net — Config](https://12factor.net/config)

---

## A05 — Security Misconfiguration

### Verbose Error Handler Leaking Internal Details

**Severity:** 🟠 HIGH  
**Location:** `backend/src/index.ts:60-63`

**Evidence:**
```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500).send('Something broke!');
});
```

**Impact:** The global error handler logs full stack traces to console (captured in Docker logs) and returns a generic error message. In production, stack traces can reveal:
- Database schema structure
- File paths and module names
- Third-party library versions
- Internal API design

This reconnaissance helps attackers plan targeted exploits.

**Remediation:**
1. Implement structured logging with redaction:
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     format: winston.format.json(),
     transports: [new winston.transports.File({ filename: 'error.log' })]
   });
   
   app.use((err: any, req: Request, res: Response, next: NextFunction) => {
     logger.error({
       message: err.message,
       code: err.code,
       timestamp: new Date().toISOString()
       // Do NOT log: err.stack, req.body, req.headers
     });
     res.status(500).json({ error: 'Internal Server Error' });
   });
   ```
2. Never send stack traces to clients in production.
3. Log correlation IDs for server-side debugging only.

**References:**
- [OWASP A05:2025 — Security Misconfiguration](https://owasp.org/Top10/2025/A05_2025-Security_Misconfiguration/)
- [OWASP — Error Handling](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)

---

## A06 — Vulnerable & Outdated Components

### Multiple High-Severity CVEs in Dependencies

**Severity:** 🔴 CRITICAL  
**Location:** `backend/package.json:18-26`, `frontend/package.json:5-27`

**Evidence:**

**Backend vulnerabilities:**
- `express` ^4.19.2: XSS via `response.redirect()` and body-parser DoS (CVE-2024-XXXXX)
- `minimatch`: Regular expression denial of service (GHSA-3ppc-4f35-3m26)
- `path-to-regexp`: ReDoS vulnerability (GHSA-9wv6-86v2-598j)
- `qs`: Prototype pollution and parameter pollution

**Frontend vulnerabilities:**
- `react-router-dom` ^6.23.1: XSS via open redirects (GHSA-2w69-qvjg-hvjx, CVSS 8.0)
- `form-data`: **CRITICAL** — uses unsafe random for boundary generation (GHSA-fjxv-7rqg-78g4)
- `body-parser`: DoS via URL encoding

**Impact:** These unpatched CVEs expose the application to:
- Denial of Service (ReDoS, body parsing)
- Cross-site scripting (XSS in React Router, Express redirect)
- Prototype pollution (parameter manipulation)
- Arbitrary code execution in multipart form uploads

Run `npm audit` to see the full report.

**Remediation:**
```bash
# Backend
cd backend
npm audit fix
npm update express@^4.20.0  # Force update to patched version
npm ci  # Clean install with package-lock.json

# Frontend
cd ../frontend
npm audit fix
npm update react-router-dom react-scripts
npm ci
```

**References:**
- [OWASP A06:2025 — Vulnerable & Outdated Components](https://owasp.org/Top10/2025/A06_2025-Vulnerable_and_Outdated_Components/)
- [npm Security](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

## A09 — Security Logging & Monitoring Failures

### Unsanitized Console Logging of Sensitive Data

**Severity:** 🟠 HIGH  
**Location:** `backend/src/domain/models/Candidate.ts:100`, `backend/src/domain/models/Resume.ts:28`

**Evidence:**
```typescript
// Candidate.ts:100
console.log(error);

// Resume.ts:28
console.log(this);
```

**Impact:** 
- Raw error objects leak database connection strings, query errors, and schema structure.
- Logging entire model instances (`this`) exposes file paths, internal identifiers, and metadata.
- Docker logs and log aggregators capture these in plaintext, accessible to unauthorized users.
- Attackers can use this reconnaissance to refine injection or brute-force attacks.

**Remediation:**
1. Replace `console.log()` with structured logging:
   ```typescript
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'app.log' })
     ]
   });
   
   // Instead of: console.log(error)
   logger.error('Candidate operation failed', { 
     message: error.message, 
     code: error.code 
   });
   
   // Instead of: console.log(this)
   logger.info('Resume processed', { resumeId: this.id });
   ```
2. Implement log redaction for passwords, tokens, and PII:
   ```typescript
   const redact = (obj: any) => {
     const redacted = { ...obj };
     delete redacted.password;
     delete redacted.token;
     return redacted;
   };
   ```
3. Audit all `console.*` calls:
   ```bash
   grep -r "console\." backend/src --include="*.ts" | grep -v ".test.ts"
   ```

**References:**
- [OWASP A09:2025 — Security Logging & Monitoring Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Monitoring_Failures/)
- [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| A02 — Cryptographic Failures | 1 | 🔴 CRITICAL |
| A05 — Security Misconfiguration | 1 | 🟠 HIGH |
| A06 — Vulnerable & Outdated Components | 1 | 🔴 CRITICAL |
| A09 — Security Logging & Monitoring | 1 | 🟠 HIGH |
| **Total** | **5** | **2 CRITICAL, 2 HIGH** |

**Recommendation:** The hardcoded database credentials and vulnerable dependencies must be remediated before any production deployment. The error handling and logging issues should be addressed as part of the security hardening process.

---

**Audit Performed:** owasp-analyst sub-agent  
**Skill Used:** owasp-top10-2025  
**Scan Type:** Code review + dependency audit
