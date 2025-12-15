# 🆔 ERLASS PLATFORM ID STANDARDS

Dokumen ini mengatur standar penamaan ID (Primary Key) untuk seluruh entitas dalam database. Kita menggunakan format **Prefixed ID** (seperti Stripe/Linear) untuk kemudahan identifikasi dan debugging.

## Format
`{prefix}_{randomString}`

Contoh: `usr_8x92mk2a`, `crs_992ka1`

## Daftar Prefix

### 👥 User & Access
| Entitas | Prefix | Contoh |
| :--- | :--- | :--- |
| **User** | `usr_` | `usr_abc123` |
| **Mentor** | `mnt_` | `mnt_xyz789` |
| **Admin** | `adm_` | `adm_999xxx` |

### 🎓 Learning System
| Entitas | Prefix | Contoh |
| :--- | :--- | :--- |
| **Class (Cohort)** | `cls_` | `cls_robo1` |
| **Course** | `crs_` | `crs_python` |
| **Section** | `sec_` | `sec_var` |
| **Enrollment** | `enr_` | `enr_ticket1` |
| **UserProgress** | `prg_` | `prg_user1` |

### ⚔️ Gamification & Challenges
| Entitas | Prefix | Contoh |
| :--- | :--- | :--- |
| **Challenge** | `chg_` | `chg_py_lvl1` |
| **Submission** | `sub_` | `sub_attempt1` |
| **Badge** | `bdg_` | `bdg_master` |
| **UserBadge** | `ubg_` | `ubg_award1` |

### 💰 Finance
| Entitas | Prefix | Contoh |
| :--- | :--- | :--- |
| **Transaction** | `trx_` | `trx_ipaymu1` |
| **Voucher** | `vch_` | `vch_promo25` |

### 📝 Quiz System
| Entitas | Prefix | Contoh |
| :--- | :--- | :--- |
| **QuestionBank** | `bnk_` | `bnk_math_sd` |
| **Quiz** | `qzz_` | `qzz_midterm` |
| **Question** | `qst_` | `qst_item1` |
| **QuizAttempt** | `att_` | `att_run1` |

## Implementasi
Gunakan utility `src/lib/id-generator.ts` saat membuat record baru di Prisma.

```typescript
import { generateId } from "@/lib/id-generator";

// Create User
const id = generateId("user"); // returns "usr_..."
```
