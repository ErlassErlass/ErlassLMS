# Security Audit Report

## 1. Authorization & Access Control

### Findings
*   **Admin Actions**: Critical actions (create/update/delete courses, vouchers, challenges) are correctly protected by `if (session?.user.role !== 'SUPERADMIN') return { error: "Unauthorized" }`. This is consistent across `admin-course-actions.ts`, `admin-challenge-actions.ts`, `admin-voucher-actions.ts`, and `question-bank-actions.ts`.
*   **IDOR Protection**:
    *   `checkout-actions.ts`: User ID is derived from the session (`const userId = session.user.id`), not from client input. This prevents users from creating transactions for others.
    *   `quiz-actions.ts`: Similarly uses session user ID for submissions.
*   **Super Admin Bypass**: The logic in `SectionPage` (`sections/[sectionId]/page.tsx`) correctly allows `SUPERADMIN` to bypass enrollment checks.

### Vulnerabilities
*   **None identified** in the current scope. The use of `getServerSession` as the source of truth for identity and role is the correct pattern.

---

## 2. Payment Security

### Findings
*   **Price Calculation**: In `createTransaction` (`checkout-actions.ts`), the price is fetched from the database (`prisma.course.findUnique`) rather than trusting client input. This prevents price manipulation.
*   **Voucher Validation**: Vouchers are validated server-side (`validateVoucher`) before applying discounts.
*   **Signature Generation**: `src/lib/services/ipaymu.ts` correctly implements the SHA256 + HMAC-SHA256 signature generation required by iPaymu.

### Vulnerabilities
*   **Missing Webhook Verification**: While `notifyUrl` is set to `/api/payment/notify`, the endpoint handler itself hasn't been implemented or audited here. If `verifyPaymentStatus` trusts the return URL without validating a signature from iPaymu, it's vulnerable to **Parameter Tampering** (a user could manually visit the success URL).
    *   *Severity*: **High** (Potential for free enrollment).
    *   *Remediation*: Implement strict signature verification in the `notifyUrl` endpoint and rely *only* on that or a direct API check to iPaymu (Check Transaction) for final status updates, never solely on the client-side redirection.

---

## 3. Input Validation & Injection

### Findings
*   **XSS Risk**: The application uses `dangerouslySetInnerHTML` in multiple places:
    *   `src/components/challenge/challenge-editor.tsx`: Used to render instructions.
    *   `src/app/dashboard/courses/[courseId]/sections/[sectionId]/page.tsx`: Used to render course content.
    *   *Context*: The content comes from the database (Admin input).
    *   *Risk*: If an admin account is compromised, they could inject malicious scripts. Or if the "Challenge Editor" allows users to input HTML that is then rendered raw to other users (not the case here, it's user's own preview).
*   **SQL Injection**: Prisma ORM is used throughout, which automatically parameterizes queries, effectively neutralizing standard SQL injection attacks.

### Recommendations
*   Ensure that any rich text editor used by Admins sanitizes input (e.g., using `dompurify`) before saving to the database, or sanitize it before rendering with `dangerouslySetInnerHTML`.

---

## 4. Secret Management

### Findings
*   **Environment Variables**: API keys (`IPAYMU_API_KEY`, `IPAYMU_VA`) are loaded from `process.env`.
*   **Client Leakage Check**: The variable `IPAYMU_URL` is constructed on the server side in `src/lib/services/ipaymu.ts`. As long as this file is only imported by Server Actions/Server Components, the keys won't leak.
*   **Hardcoded Fallbacks**: There are hardcoded sandbox credentials in `src/lib/services/ipaymu.ts` (`"1179000899"`, `"QbGcoO0..."`).
    *   *Severity*: **Low** (These are public sandbox keys from documentation).
    *   *Best Practice*: Remove hardcoded fallbacks for Production. Ensure the app fails to start if `IPAYMU_API_KEY` is missing in production.

---

## Summary
The application demonstrates a strong security posture regarding Authorization and Payment initialization. The primary area for improvement is the **Payment Verification** flow (moving from "trust on redirect" to "trust on webhook/verification").
