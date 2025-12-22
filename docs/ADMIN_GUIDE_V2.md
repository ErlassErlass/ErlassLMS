# Code Space V2.0 - Administrator Guide

**Version:** 2.0  
**Date:** 2025-12-05  
**Status:** Active

---

## Table of Contents

1. [Introduction](#introduction)
2. [School Onboarding](#school-onboarding)
3. [Running the User Import](#running-the-user-import)
4. [Generating School Coupons](#generating-school-coupons)
5. [Troubleshooting](#troubleshooting)
6. [Security & Privacy](#security--privacy)
7. [Exporting this Guide](#exporting-this-guide)

---

## Introduction

Welcome to the **Code Space V2.0** Administrator Guide. This release introduces multi-school capabilities, allowing administrators to:

*   **Bulk Import Students**: Onboard hundreds of students from specific schools efficiently using CSV files.
*   **Manage Cohorts**: Assign students to specific School Codes (e.g., `SMAN1`, `SMK2`) during import.
*   **Generate Access Vouchers**: Create batch coupon codes for schools to distribute to their students for platform access (typically 100% scholarships).

This guide provides step-by-step instructions for utilizing the CLI (Command Line Interface) tools located in the `scripts/` directory of the platform.

---

## School Onboarding

To onboard a new school, you must first prepare a CSV (Comma Separated Values) file containing the student data.

### 1. Prepare the CSV File

Create a file named `users_import.csv` (or any preferred name). The file **must** have a header row with the specific column names listed below.

#### CSV Column Specification

| Column Name  | Required? | Description | Default Value (if empty) |
| :--- | :--- | :--- | :--- |
| `email` | **Yes** | Student's email address (must be unique). | N/A |
| `name` | **Yes** | Student's full name. | N/A |
| `password` | No | Initial password for the account. | `DefaultPass123!` |
| `schoolCode` | No | The identifier for the school (e.g., `SMAN1`). | `null` |
| `phone` | No | Student's contact number. | `null` |

#### Example CSV Content

```csv
email,name,password,schoolCode,phone
student1@sman1.edu,Ahmad Siswa,Sman1Rules!,SMAN1,08123456789
student2@sman1.edu,Budi Santoso,,SMAN1,
teacher@sman1.edu,Guru Besar,SecurePass123,SMAN1,08198765432
```

> **Note:** If the `password` column is left empty for a row, the account will be created with the default password: `DefaultPass123!`.

---

## Running the User Import

Once your CSV file is ready, use the `bulk-import-users.ts` script to process it.

### Command Usage

Open your terminal in the project root directory and run:

```bash
npx tsx scripts/bulk-import-users.ts <path-to-csv>
```

### Examples

**Option A: Using a file in the current directory**
```bash
npx tsx scripts/bulk-import-users.ts users_import.csv
```

**Option B: Using an absolute path**
```bash
npx tsx scripts/bulk-import-users.ts "C:\Documents\School_Data\2024_intake.csv"
```

### Expected Output

```text
Starting import from users_import.csv...
Attempting to import 3 users...
✅ Successfully imported 3 users.
```

---

## Generating School Coupons

For schools that require students to sign up themselves, you can generate a batch of 100% discount coupons.

### Command Usage

Use the `generate-school-coupons.ts` script:

```bash
npx tsx scripts/generate-school-coupons.ts <PREFIX> <COUNT> [DISCOUNT_VALUE]
```

*   `<PREFIX>`: A short code for the school (e.g., `SMAN1`). This will be the start of every coupon code.
*   `<COUNT>`: Number of coupons to generate.
*   `[DISCOUNT_VALUE]`: (Optional) Percentage discount. Defaults to **100** if omitted.

### Examples

**Generate 50 full-scholarship (100% off) coupons for SMAN 1:**
```bash
npx tsx scripts/generate-school-coupons.ts SMAN1 50
```

**Generate 20 partial-scholarship (50% off) coupons for SMK 2:**
```bash
npx tsx scripts/generate-school-coupons.ts SMK2 20 50
```

### Output Files

The script will output a confirmation message and save a CSV file in the `output/` directory:

```text
Generating 50 coupons for prefix "SMAN1"...
✅ Successfully created 50 vouchers in database.
📄 Coupons exported to: C:\laragon\www\erlass-platform\output\coupons-SMAN1-2025-12-05T10-00-00.csv
```

You can then send this CSV file to the school administrator.

---

## Troubleshooting

### Common Errors

#### 1. "CSV must contain 'email' and 'name' columns"
*   **Cause:** The header row in your CSV file is missing or misspelled.
*   **Fix:** Ensure the first line of your CSV is exactly `email,name,...` (case-sensitive).

#### 2. "0 users were skipped (likely duplicate emails)"
*   **Cause:** The script found email addresses that already exist in the database.
*   **Fix:** No action needed. The script automatically skips duplicates to prevent errors. The console log will tell you how many were skipped.

#### 3. "File not found"
*   **Cause:** The path provided to the script is incorrect.
*   **Fix:** Check the file name and path. Use quotes if the path contains spaces.

---

## Security & Privacy

### Password Handling
*   **Hashing:** All passwords imported via the bulk tool are automatically hashed using **bcrypt** (salt rounds: 10) before being stored in the database. Plain text passwords are never saved.
*   **Defaults:** Users created with the default password (`DefaultPass123!`) should be instructed to change their password immediately upon first login.

### Data Privacy
*   **PII:** This tool processes Personally Identifiable Information (Emails, Names, Phones). Ensure the input CSV files are stored securely and deleted after the import is confirmed.

---

## Exporting this Guide

To save this document as a PDF for distribution:

### From VS Code
1.  Open this file (`ADMIN_GUIDE_V2.md`) in VS Code.
2.  Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
3.  Type **"Markdown PDF: Export (pdf)"** (requires the *Markdown PDF* extension).
4.  The PDF will be saved in the same directory.

### From Browser (GitHub/GitLab/Preview)
1.  Open the Markdown preview.
2.  Right-click and select **Print**.
3.  Choose **"Save as PDF"** as the destination.
