---
name: owasp-top10-2025
description: Catalogue + scan heuristics + report template for OWASP Top 10 (2025). Loaded by the `owasp-analyst` sub-agent during Phase 3. Source: <https://owasp.org/Top10/2025/> — "Top 10:2025 List".
---

# Categories to audit (OWASP 2025)

For each, the agent runs the listed scans. A finding requires **evidence** (path + line). No evidence → no finding.

| # | Category | First-pass scans |
|---|---|---|
| A01 | Broken Access Control | `grep -rEn "req\\.(user|session)" backend/src` and verify every state-changing route runs an authorisation check; look for IDOR (`req.params.id` used without owner check). |
| A02 | Cryptographic Failures | search for hardcoded secrets, `md5`, `sha1`, weak JWT secrets, missing `httpOnly`/`secure` on cookies, plaintext password storage. |
| A03 | Injection | search for string concatenation in Prisma raw (`$queryRaw\``), Express routes with `eval`, unsanitised `res.send` of user input, missing parameter validation. |
| A04 | Insecure Design | absence of rate limiting on auth endpoints, no CSRF protection on state-changing routes, missing input schemas. |
| A05 | Security Misconfiguration | default secrets in `.env.example`, CORS `*` in production, missing `helmet`, verbose error responses, exposed `swagger-ui` in production. |
| A06 | Vulnerable & Outdated Components | run `npm audit --omit=dev --json` in `backend/` and `frontend/`; report high/critical only. |
| A07 | Identification & Authentication Failures | no password complexity, no lockout, JWT without expiry, session fixation. |
| A08 | Software & Data Integrity Failures | `npm` packages installed via Git URL, missing `package-lock.json`, no `integrity` on CDN scripts. |
| A09 | Security Logging & Monitoring Failures | absence of audit log on `PUT /candidates/:id` and equivalent state-changing endpoints; sensitive data in logs. |
| A10 | Server-Side Request Forgery | user-controlled URLs passed to `fetch` / `axios` on the backend without allow-listing. |

# Finding template

Each finding inside `docs/vulnerabilities.md`:

```markdown
### A0X — <Category name>

- **Where:** `path/to/file.ext:line`
- **Evidence:** ```code snippet```
- **Why it matters:** <one short paragraph in stack-specific language>
- **Suggested fix:** <concrete change, library or pattern name>
- **References:** <OWASP page anchor>
```

# Report header (always present if file is created)

```markdown
# OWASP Top 10 (2025) — Findings

Generated against commit `<short sha>` on `<ISO date>`.
Scope: this repository, excluding paths matched by `.gitignore`.

Findings: <N>. Categories covered with no finding: <list>.

---
```

# Anti-patterns to avoid

- Listing CVEs of transitive dev dependencies without exploitability.
- Marking "missing TLS" as a finding when the repo does not own deployment.
- Speculative wording: "could", "might", "possibly". A finding is verified or it is not reported.
