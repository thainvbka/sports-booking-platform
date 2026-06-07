# ✅ Quy tắc vẽ Message trong Sequence Diagram (UML)

Dưới đây là các quy tắc quan trọng và chuẩn nhất khi vẽ **message** trong sơ đồ Sequence Diagram:

### 1. **Các loại Message phổ biến**

| Loại Message      | Ký hiệu                       | Ý nghĩa                                | Khi nào dùng?                      |
| ----------------- | ----------------------------- | -------------------------------------- | ---------------------------------- |
| **Synchronous**   | → (mũi tên đặc, đầu đầy)      | Gọi và chờ phản hồi (call & return)    | Gọi hàm/method thông thường        |
| **Asynchronous**  | → (mũi tên đặc, đầu rỗng)     | Gọi không chờ phản hồi (fire & forget) | Gửi event, message queue, callback |
| **Return**        | - - → (mũi tên đứt, đầu rỗng) | Phản hồi từ synchronous call           | Trả về kết quả                     |
| **Self Message**  | → vòng lại chính lifeline     | Object gọi method của chính nó         | Internal processing                |
| **Creation**      | - - → (đứt) đến lifeline mới  | Tạo ra một object mới                  | `new User()`                       |
| **Destruction**   | X ở cuối lifeline             | Hủy object                             | `delete`, end of scope             |
| **Found Message** | → (từ không gian trống)       | Message xuất hiện mà không rõ nguồn    | External system                    |
| **Lost Message**  | → (đi vào không gian trống)   | Message gửi đi nhưng không rõ đích     | Timeout, lost signal               |

### 2. **Quy tắc chung khi vẽ Message**

* **Hướng thời gian**: Luôn vẽ từ **trên xuống dưới** (top to bottom).
* **Mũi tên phải ngang hoặc hơi nghiêng** (không nên nghiêng quá 30°).
* **Tên message**:

  * Viết rõ ràng, thường là `tênMethod(param)` hoặc `signalName`.
  * Dùng **camelCase** hoặc theo convention của ngôn ngữ.
  * Có thể thêm **guard condition** `[condition]` trước message.
* **Activation bar** (thanh hoạt động):

  * Vẽ thanh mỏng dọc theo lifeline khi object đang xử lý.
  * Synchronous message thường có activation bar.
* **Số thứ tự message** (tùy chọn):

  * Có thể đánh số `1`, `1.1`, `1.2`... nếu diagram phức tạp.
* **Trả lời (Reply)**:

  * Nên vẽ return message cho synchronous call (đặc biệt khi cần thể hiện rõ luồng).

### 3. **Best Practices**

1. **Giữ cho message đơn giản**: Một message nên thể hiện **một ý** rõ ràng.
2. **Sử dụng alt/loop/par** để thể hiện logic phức tạp thay vì vẽ quá nhiều message.
3. **Tránh crossing arrows** nhiều nhất có thể (sắp xếp thứ tự lifeline hợp lý).
4. **Tên message phải nhất quán** với Class Diagram hoặc code.
5. **Với hệ thống lớn**: Phân biệt rõ `synchronous` và `asynchronous` rất quan trọng.

### 4. **Ví dụ minh họa (text)**

```text
Actor          UserService          Database
  |------------------|--------------------|
  |  login(user,pass) |                    |  ← Synchronous
  |-----------------> |                    |
  |                   |   validate()       |
  |                   |------------------> |  ← Synchronous
  |                   |<------------------ |  ← Return
  |<----------------- |                    |  ← Return (kết quả)
```

Bạn đang vẽ bằng công cụ nào?

* **PlantUML**, **Draw.io**, **StarUML**, **Lucidchart**, hay **Mermaid**?

Nếu bạn cần, mình có thể đưa:

* Cú pháp PlantUML/Mermaid mẫu
* Các quy tắc nâng cao (fragment, combined fragment)
* Sai lầm thường gặp

Bạn muốn mình giải thích chi tiết phần nào hơn không?
