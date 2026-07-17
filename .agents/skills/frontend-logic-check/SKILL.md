---
name: frontend-logic-check
description: Use this skill when user wants to check, audit, validate data flow, logic flow, state management, or data handling logic in frontend code (React, Vue, Angular, Svelte, vanilla JS/TS). Triggers include "check luồng logic", "kiểm tra data flow", "audit logic frontend", "validate state management", "kiểm tra luồng dữ liệu".
---

# Frontend Logic Check Skill

## When to use
- Kiểm tra xem luồng logic data ở frontend có đúng không
- Audit data flow, props drilling, state management (Redux, Zustand, Context, Pinia, v.v.)
- Phát hiện logic bị duplicate hoặc không nhất quán
- Kiểm tra error handling, loading states, data transformation
- Review component logic, API calling patterns, form handling

## Workflow khi skill được kích hoạt

1. **Thu thập thông tin**
   - Xác nhận framework (React, Vue, Next.js, v.v.)
   - Yêu cầu user chỉ định file/thư mục cần check (hoặc toàn project)
   - Hỏi về business rule chính nếu cần

2. **Static Analysis**
   - Đọc các file liên quan (components, stores, hooks, services)
   - Phân tích data flow: từ API → state → UI
   - Kiểm tra consistency của data transformation

3. **Common Issues to check**
   - Data không đồng bộ giữa các component
   - State mutation trực tiếp (bad practice)
   - Missing loading/error states
   - Props drilling quá sâu
   - Duplicate data fetching logic
   - Inconsistent error handling
   - Side effects không kiểm soát

4. **Output format**
   - Báo cáo rõ ràng: ✅ OK / ⚠️ Warning / ❌ Issue
   - Gợi ý cải thiện cụ thể
   - Code snippet trước-sau nếu cần refactor

Bạn có thể yêu cầu:
- "Dùng frontend-logic-check kiểm tra file src/components/UserForm.tsx"
- "Audit data flow trong thư mục stores/"
- "Kiểm tra luồng logic login ở frontend"