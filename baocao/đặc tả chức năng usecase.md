# TÀI LIỆU ĐẶC TẢ CHI TIẾT CHỨC NĂNG USE CASE

Tài liệu này cung cấp các đặc tả chi tiết cho các Use Case quan trọng nhất của hệ thống Sports Booking Platform. Các nội dung được xây dựng dựa trên sự phân tích logic nghiệp vụ sâu sắc từ mã nguồn hệ thống, tuân thủ nghiêm ngặt các nguyên tắc hành văn khoa học, học thuật và chính xác, phục vụ trực tiếp cho báo cáo đồ án tốt nghiệp.

---

## I. DANH SÁCH CÁC USE CASE ĐẶC TẢ CHI TIẾT

Hệ thống được phân tích và đặc tả chi tiết thông qua 6 Use Case cốt lõi dưới đây, đại diện cho các giao dịch và tương tác nghiệp vụ trọng yếu nhất của toàn bộ nền tảng:

*   **UC-01: Đặt sân** (Tác nhân: Người chơi)
*   **UC-02: Tham gia, quản lý kèo đấu** (Tác nhân: Người chơi)
*   **UC-03: Quản lý sân và khu phức hợp** (Tác nhân: Chủ khu phức hợp)
*   **UC-04: Quản lý lịch đặt của sân** (Tác nhân: Chủ khu phức hợp)
*   **UC-05: Quản lý đăng ký khu phức hợp** (Tác nhân: Quản trị hệ thống)
*   **UC-06: Quản lý công nợ và quyết toán** (Tác nhân: Quản trị hệ thống)

Yêu cầu về mức độ chi tiết:

* Viết ngắn gọn, súc tích, phù hợp báo cáo phân tích thiết kế hệ thống.
* Chỉ mô tả nghiệp vụ chính, không đi sâu implementation kỹ thuật.
* Không đề cập công nghệ cụ thể như Redis, Lock, API, Webhook, JWT, Database transaction...
* Mỗi bước chỉ mô tả một hành động chính.
* Luồng chính chỉ nên từ 5–12 bước
* Luồng thay thế ngắn gọn, chỉ nêu trường hợp ngoại lệ quan trọng.
* Ưu tiên mô tả góc nhìn người dùng và phản hồi hệ thống.
* Không mô tả logic backend nội bộ quá chi tiết.
* Văn phong học thuật, rõ ràng, dễ đọc.

---

## II. ĐẶC TẢ CHI TIẾT USE CASE

### 1. UC-01: Đặt sân

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Quản lý đặt sân |
| **Tác nhân** | Người chơi (Player) |
| **Mục đích sử dụng** | Tìm kiếm sân trống, đặt giờ chơi, thuê hoặc mua vật phẩm đi kèm và thanh toán trực tuyến. |
| **Tiền điều kiện** | Tài khoản người chơi và sân được chọn đang hoạt động bình thường. |
| **Luồng chính** | 1. Người chơi chọn sân và ngày chơi.<br>2. Hệ thống hiển thị các khung giờ trống và bảng giá thuê.<br>3. Người chơi chọn giờ chơi.<br>4. Hệ thống hiển thị danh sách các vật phẩm đi kèm khả dụng.<br>5. Người chơi chọn số lượng vật phẩm cần mua hoặc thuê và xác nhận.<br>6. Hệ thống kiểm tra giờ trống, tồn kho và tạo lượt đặt tạm thời.<br>7. Hệ thống giữ chỗ trong 10 phút, hiển thị hóa đơn tạm tính.<br>8. Người chơi xác nhận hóa đơn và chọn thanh toán trực tuyến.<br>9. Hệ thống chuyển hướng người chơi đến cổng thanh toán.<br>10. Người chơi thực hiện thanh toán trực tuyến thành công.<br>11. Hệ thống cập nhật trạng thái lịch đặt thành công và gửi thông báo. |
| **Luồng thay thế** | - **Trùng giờ (bước 6):** Hệ thống báo trùng lịch và yêu cầu chọn giờ khác.<br>- **Hết vật phẩm (bước 6):** Hệ thống báo hết hàng và yêu cầu chỉnh sửa số lượng.<br>- **Quá hạn (bước 8-10):** Quá 10 phút giữ chỗ chưa thanh toán, hệ thống tự động hủy lượt đặt tạm thời và khôi phục tồn kho. |
| **Hậu điều kiện** | Lịch đặt được ghi nhận, tồn kho được cập nhật và thông tin thanh toán được lưu trữ. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-01: Đặt sân}
\label{tab:uc-01-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Quản lý đặt sân \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Người chơi (Player) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Tìm kiếm sân trống, đặt giờ chơi, thuê vật phẩm đi kèm và thanh toán trực tuyến. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Tài khoản người chơi và cụm sân được chọn hoạt động bình thường. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Người chơi chọn cụm sân, ngày chơi và xem sơ đồ sân trống.\newline
2. Hệ thống hiển thị các khung giờ trống và bảng giá thuê.\newline
3. Người chơi chọn giờ chơi, sân con và nhấn tiếp tục.\newline
4. Hệ thống hiển thị danh sách các vật phẩm đi kèm khả dụng.\newline
5. Người chơi chọn số lượng vật phẩm cần thuê và xác nhận.\newline
6. Hệ thống kiểm tra giờ trống, tồn kho và tạo lượt đặt tạm thời.\newline
7. Hệ thống giữ chỗ trong 10 phút, hiển thị hóa đơn tạm tính.\newline
8. Người chơi xác nhận hóa đơn và chọn thanh toán trực tuyến.\newline
9. Hệ thống chuyển hướng người chơi đến cổng thanh toán.\newline
10. Người chơi thực hiện thanh toán trực tuyến thành công.\newline
11. Hệ thống cập nhật trạng thái lịch đặt thành công và thông báo. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Trùng giờ (bước 6): Hệ thống báo trùng lịch và yêu cầu chọn giờ khác.\newline
- Hết vật phẩm (bước 6): Hệ thống báo hết hàng và yêu cầu chỉnh số lượng.\newline
- Quá hạn (bước 8-10): Quá 10 phút giữ chỗ chưa thanh toán, hệ thống tự động hủy lượt đặt tạm thời và khôi phục tồn kho. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Lịch đặt được ghi nhận; tồn kho cập nhật; hóa đơn thanh toán được lưu trữ. \\ \hline
\end{tabular}
\end{table}
```

---

### 2. UC-02: Tham gia, quản lý kèo đấu

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Tham gia, quản lý kèo đấu |
| **Tác nhân** | Người chơi (Player) |
| **Mục đích sử dụng** | Tìm kiếm kèo đấu, gửi yêu cầu ghép cặp, duyệt thành viên và rời khỏi kèo đấu. |
| **Tiền điều kiện** | Tài khoản người chơi đang hoạt động bình thường. |
| **Luồng chính** | 1. Người chơi xem danh sách kèo đấu công khai.<br>2. Người chơi chọn kèo đấu phù hợp và nhấn đăng ký tham gia.<br>3. Hệ thống hiển thị biểu mẫu điền thông tin giới thiệu.<br>4. Người chơi nhập thông tin giới thiệu và nhấn gửi yêu cầu.<br>5. Hệ thống kiểm tra thời gian đăng ký và tránh đăng ký trùng kèo.<br>6. Hệ thống ghi nhận yêu cầu chờ duyệt và thông báo cho chủ kèo.<br>7. Chủ kèo truy cập danh sách yêu cầu ứng tuyển của kèo đấu.<br>8. Hệ thống hiển thị danh sách các ứng viên kèm lời giới thiệu.<br>9. Chủ kèo xem xét thông tin và nhấn phê duyệt ứng viên phù hợp.<br>10. Hệ thống cập nhật trạng thái đã tham gia và gửi thông báo xác nhận. |
| **Luồng thay thế** | - **Từ chối ứng viên (bước 10):** Chủ kèo từ chối. Hệ thống cập nhật trạng thái bị từ chối và gửi thông báo cho ứng viên.<br>- **Kèo đấu đủ người (bước 11):** Khi đủ số người chơi, hệ thống tự động khóa đăng ký.<br>- **Rời kèo đấu:** Người chơi xin rời kèo đấu. Hệ thống giải phóng chỗ trống để nhận ứng viên mới. |
| **Hậu điều kiện** | Yêu cầu kèo đấu được cập nhật; số lượng chỗ trống được đồng bộ; thông báo được gửi đến các bên liên quan. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-02: Tham gia, quản lý kèo đấu}
\label{tab:uc-02-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Tham gia, quản lý kèo đấu \\ \hline
\textbf{Mã Use Case} & UC-02 \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Người chơi (Player) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Tìm kiếm kèo đấu, gửi yêu cầu ghép cặp, duyệt thành viên và rời khỏi kèo đấu. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Tài khoản người chơi đang hoạt động bình thường. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Người chơi xem danh sách kèo đấu công khai, lọc theo trình độ.\newline
2. Hệ thống hiển thị danh sách kèo đấu kèm thông tin chi tiết.\newline
3. Người chơi chọn kèo đấu phù hợp và nhấn đăng ký tham gia.\newline
4. Hệ thống hiển thị biểu mẫu điền thông tin tự giới thiệu ngắn.\newline
5. Người chơi nhập thông tin tự giới thiệu và nhấn gửi yêu cầu.\newline
6. Hệ thống kiểm tra thời gian đăng ký và tránh đăng ký trùng kèo.\newline
7. Hệ thống ghi nhận yêu cầu chờ duyệt và thông báo cho chủ kèo.\newline
8. Chủ kèo truy cập danh sách yêu cầu ứng tuyển của kèo đấu.\newline
9. Hệ thống hiển thị danh sách các ứng viên kèm lời tự giới thiệu.\newline
10. Chủ kèo xem xét thông tin và nhấn phê duyệt ứng viên phù hợp.\newline
11. Hệ thống cập nhật trạng thái đã tham gia và gửi thông báo xác nhận. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Từ chối ứng viên (bước 10): Chủ kèo từ chối. Hệ thống cập nhật trạng thái bị từ chối và gửi thông báo cho ứng viên.\newline
- Kèo đấu đủ người (bước 11): Khi đủ số người chơi, hệ thống tự động khóa đăng ký.\newline
- Rời kèo đấu: Người chơi xin rời kèo đấu. Hệ thống giải phóng chỗ trống để nhận ứng viên mới. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Yêu cầu kèo đấu được cập nhật; số lượng chỗ trống đồng bộ; thông báo gửi đến các bên. \\ \hline
\end{tabular}
\end{table}
```

---

### 3. UC-03: Quản lý sân và khu phức hợp

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
| :--- | :--- |
| **Tên Use Case** | Quản lý sân và khu phức hợp |
| **Mã Use Case** | UC-03 |
| **Tác nhân** | Chủ khu phức hợp (Owner) |
| **Mục đích sử dụng** | Cho phép chủ khu phức hợp đăng ký thông tin cụm sân mới, gửi hồ sơ pháp lý kiểm duyệt, thêm các sân con và thiết lập biểu giá hoạt động. |
| **Tiền điều kiện** | Tài khoản của chủ khu phức hợp đang hoạt động bình thường. |
| **Luồng chính** | 1. Chủ sân truy cập phân hệ quản lý khu phức hợp và chọn đăng ký cụm sân mới.<br>2. Hệ thống hiển thị biểu mẫu điền thông tin chi tiết cụm sân và tải hồ sơ pháp lý.<br>3. Chủ sân điền thông tin, đính kèm hình ảnh và tài liệu chứng minh sở hữu và nhấn gửi.<br>4. Hệ thống kiểm tra dữ liệu, tải hồ sơ lên hệ thống và tạo cụm sân ở trạng thái chờ duyệt.<br>5. Hệ thống hiển thị danh sách cụm sân và thông báo gửi hồ sơ thành công.<br>6. Chủ sân chọn cụm sân vừa tạo để tiến hành thêm các sân con bên trong.<br>7. Hệ thống hiển thị biểu mẫu thêm sân con bao gồm tên, môn thể thao và sức chứa.<br>8. Chủ sân nhập thông tin chi tiết sân con và nhấn xác nhận.<br>9. Hệ thống kiểm tra trùng lặp tên, tạo sân con mới và mở giao diện cấu hình giá.<br>10. Chủ sân thiết lập các quy tắc biểu giá cụ thể cho các khung giờ hoạt động và lưu.<br>11. Hệ thống lưu trữ các quy tắc giá của sân con và thông báo thiết lập thành công. |
| **Luồng thay thế** | - **Trùng tên cụm sân (bước 4):** Hệ thống thông báo lỗi trùng tên cụm sân và yêu cầu đổi tên khác.<br>- **Thiếu tài liệu pháp lý (bước 4):** Hệ thống cảnh báo yêu cầu tải lên ít nhất một tài liệu hợp lệ trước khi tiếp tục.<br>- **Trùng tên sân con (bước 9):** Hệ thống báo trùng tên sân con trong cùng khu phức hợp và yêu cầu đổi tên. |
| **Hậu điều kiện** | Cụm sân mới được khởi tạo chờ duyệt; các sân con và quy tắc bảng giá hoạt động được áp dụng chính xác. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-03: Quản lý sân và khu phức hợp}
\label{tab:uc-03-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Quản lý sân và khu phức hợp \\ \hline
\textbf{Mã Use Case} & UC-03 \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Chủ khu phức hợp (Owner) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Đăng ký thông tin cụm sân mới, gửi hồ sơ pháp lý kiểm duyệt, thêm các sân con và thiết lập biểu giá hoạt động. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Tài khoản của chủ khu phức hợp đang hoạt động bình thường. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Chủ sân truy cập phân hệ quản lý khu phức hợp và chọn đăng ký mới.\newline
2. Hệ thống hiển thị biểu mẫu điền thông tin cụm sân và tài liệu pháp lý.\newline
3. Chủ sân nhập thông tin, đính kèm tài liệu sở hữu pháp lý và gửi.\newline
4. Hệ thống tải hồ sơ lên và tạo cụm sân ở trạng thái chờ duyệt.\newline
5. Hệ thống hiển thị danh sách cụm sân và thông báo gửi hồ sơ thành công.\newline
6. Chủ sân chọn cụm sân vừa tạo để thực hiện thêm các sân con.\newline
7. Hệ thống hiển thị biểu mẫu thêm sân con (tên, môn thể thao, sức chứa).\newline
8. Chủ sân nhập thông tin chi tiết sân con và nhấn xác nhận.\newline
9. Hệ thống kiểm tra tên trùng lặp, tạo sân con và mở giao diện cấu hình giá.\newline
10. Chủ sân thiết lập các quy tắc biểu giá cụ thể cho các khung giờ và lưu.\newline
11. Hệ thống lưu trữ các quy tắc giá và thông báo thiết lập thành công. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Trùng cụm sân (bước 4): Hệ thống báo lỗi trùng tên cụm sân và yêu cầu đổi tên.\newline
- Thiếu hồ sơ pháp lý (bước 4): Hệ thống báo lỗi và yêu cầu đính kèm tài liệu sở hữu hợp lệ.\newline
- Trùng sân con (bước 9): Hệ thống báo trùng sân con trong cụm và yêu cầu đổi tên khác. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Cụm sân ở trạng thái chờ duyệt; các sân con và quy tắc bảng giá hoạt động được ghi nhận. \\ \hline
\end{tabular}
\end{table}
```

---

### 4. UC-04: Quản lý lịch đặt của sân

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
| :--- | :--- |
| **Tên Use Case** | Quản lý lịch đặt của sân |
| **Mã Use Case** | UC-04 |
| **Tác nhân** | Chủ khu phức hợp (Owner) |
| **Mục đích sử dụng** | Cho phép chủ sân theo dõi lịch đặt sân con, duyệt lịch đặt đã thanh toán thành công, hoặc chủ động hủy lịch đặt sân khi có sự cố. |
| **Tiền điều kiện** | Tài khoản của chủ sân đang hoạt động bình thường. |
| **Luồng chính** | 1. Chủ sân truy cập giao diện quản lý lịch đặt sân trên hệ thống điều hành của chủ sân.<br>2. Hệ thống hiển thị danh sách lịch đặt sân con được sắp xếp theo thời gian mới nhất.<br>3. Chủ sân thực hiện lọc lịch đặt theo ngày, sân con cụ thể hoặc trạng thái thanh toán.<br>4. Hệ thống cập nhật hiển thị danh sách lịch đặt sân phù hợp điều kiện lọc.<br>5. Chủ sân chọn một lượt đặt ở trạng thái chờ xác nhận (đã thanh toán thành công trực tuyến) để xem chi tiết.<br>6. Hệ thống hiển thị chi tiết: tên người chơi, số điện thoại, giờ thuê, sân con và vật phẩm đi kèm.<br>7. Chủ sân nhấn phê duyệt lịch đặt sân.<br>8. Hệ thống cập nhật trạng thái lịch đặt sân sang trạng thái đã xác nhận chính thức.<br>9. Hệ thống tự động gửi thông báo xác nhận đặt sân thành công đến người chơi. |
| **Luồng thay thế** | - **Chủ sân chủ động hủy lịch (bước 7):** Chủ sân chọn nút hủy. Hệ thống cập nhật trạng thái đã hủy, khôi phục tồn kho vật phẩm đi kèm và gửi thông báo kèm lý do cho người chơi.<br>- **Lịch đặt đã bị thay đổi trạng thái trước (bước 7):** Nếu lịch đã tự động hủy do quá hạn thanh toán từ trước, hệ thống báo lỗi trạng thái thay đổi và yêu cầu tải lại trang. |
| **Hậu điều kiện** | Trạng thái lịch đặt sân được cập nhật; khôi phục tồn kho vật phẩm (nếu hủy); người chơi nhận thông báo phản hồi. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-04: Quản lý lịch đặt của sân}
\label{tab:uc-04-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Quản lý lịch đặt của sân \\ \hline
\textbf{Mã Use Case} & UC-04 \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Chủ khu phức hợp (Owner) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Theo dõi lịch đặt sân con, duyệt lịch đặt đã thanh toán thành công, hoặc hủy lịch đặt sân khi có sự cố. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Tài khoản của chủ sân đang hoạt động bình thường. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Chủ sân truy cập giao diện quản lý lịch đặt sân.\newline
2. Hệ thống hiển thị danh sách lịch đặt được sắp xếp mới nhất.\newline
3. Chủ sân thực hiện lọc lịch đặt theo ngày, sân con hoặc trạng thái thanh toán.\newline
4. Hệ thống cập nhật hiển thị danh sách lịch đặt phù hợp điều kiện lọc.\newline
5. Chủ sân chọn lượt đặt ở trạng thái chờ xác nhận để xem chi tiết.\newline
6. Hệ thống hiển thị tên người chơi, số điện thoại, giờ thuê, sân con, vật phẩm.\newline
7. Chủ sân tiến hành nhấn nút phê duyệt lịch đặt sân.\newline
8. Hệ thống cập nhật trạng thái lịch đặt sang đã xác nhận chính thức.\newline
9. Hệ thống tự động gửi thông báo xác nhận đặt sân thành công đến người chơi. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Chủ sân chủ động hủy lịch (bước 7): Chủ sân chọn nút hủy. Hệ thống cập nhật trạng thái đã hủy, khôi phục tồn kho vật phẩm và thông báo cho người chơi.\newline
- Lịch đặt đã bị thay đổi trạng thái trước (bước 7): Nếu lịch đặt đã tự động hủy do quá hạn thanh toán từ trước, hệ thống báo lỗi và yêu cầu tải lại trang. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Trạng thái lịch đặt được cập nhật; khôi phục tồn kho vật phẩm (nếu hủy); người chơi nhận thông báo phản hồi. \\ \hline
\end{tabular}
\end{table}
```

---

### 5. UC-05: Quản lý đăng ký khu phức hợp

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
| :--- | :--- |
| **Tên Use Case** | Quản lý đăng ký khu phức hợp |
| **Mã Use Case** | UC-05 |
| **Tác nhân** | Quản trị hệ thống (Admin) |
| **Mục đích sử dụng** | Cho phép quản trị viên xem xét danh sách hồ sơ đăng ký khu phức hợp mới, kiểm duyệt giấy tờ pháp lý đính kèm, kích hoạt hoạt động hoặc từ chối và phản hồi lý do. |
| **Tiền điều kiện** | Tài khoản quản trị viên đang hoạt động bình thường. |
| **Luồng chính** | 1. Quản trị viên truy cập giao diện quản lý cụm sân trên phân hệ điều hành của quản trị viên.<br>2. Hệ thống hiển thị danh sách tất cả các cụm sân trên toàn hệ thống.<br>3. Quản trị viên thực hiện lọc danh sách theo trạng thái chờ phê duyệt.<br>4. Hệ thống cập nhật hiển thị danh sách hồ sơ cụm sân đang chờ duyệt.<br>5. Quản trị viên chọn một hồ sơ đăng ký cụ thể để xem chi tiết.<br>6. Hệ thống hiển thị thông tin cụm sân, tài khoản chủ sân và danh sách tài liệu pháp lý đính kèm.<br>7. Quản trị viên tiến hành kiểm tra và xác thực tính hợp pháp của tài liệu cụm sân.<br>8. Quản trị viên bấm nút phê duyệt hồ sơ đăng ký.<br>9. Hệ thống cập nhật trạng thái cụm sân hoạt động chính thức.<br>10. Hệ thống gửi thông báo chúc mừng cụm sân hoạt động thành công đến tài khoản của chủ sân. |
| **Luồng thay thế** | - **Từ chối hồ sơ (bước 8):** Quản trị viên chọn từ chối và nhập lý do cụ thể. Hệ thống cập nhật trạng thái bị từ chối và tự động gửi thông báo phản hồi lý do đến chủ sân.<br>- **Hồ sơ đã được xử lý trước (bước 8):** Nếu hồ sơ đã được phê duyệt hoặc từ chối bởi quản trị viên khác trước đó, hệ thống hiển thị thông báo không hợp lệ và yêu cầu tải lại danh sách. |
| **Hậu điều kiện** | Trạng thái hoạt động của cụm sân được cập nhật chính xác; gửi thông báo phản hồi kết quả tự động tới chủ sân. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-05: Quản lý đăng ký khu phức hợp}
\label{tab:uc-05-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Quản lý đăng ký khu phức hợp \\ \hline
\textbf{Mã Use Case} & UC-05 \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Quản trị hệ thống (Admin) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Xem xét hồ sơ đăng ký mới, kiểm duyệt giấy tờ pháp lý đính kèm, kích hoạt hoạt động hoặc từ chối và phản hồi lý do. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Tài khoản quản trị viên đang hoạt động bình thường. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Quản trị viên truy cập giao diện quản lý cụm sân trên phân hệ điều hành.\newline
2. Hệ thống hiển thị danh sách các cụm sân trên toàn hệ thống.\newline
3. Quản trị viên thực hiện lọc danh sách theo trạng thái chờ phê duyệt.\newline
4. Hệ thống cập nhật hiển thị danh sách hồ sơ đang chờ duyệt.\newline
5. Quản trị viên chọn một hồ sơ đăng ký cụ thể để xem chi tiết.\newline
6. Hệ thống hiển thị thông tin cụm sân, thông tin tài khoản chủ sân và tài liệu pháp lý.\newline
7. Quản trị viên kiểm tra và đối soát tính xác thực của các tài liệu pháp lý.\newline
8. Quản trị viên nhấn nút phê duyệt hồ sơ đăng ký cụm sân.\newline
9. Hệ thống cập nhật trạng thái cụm sân hoạt động chính thức trên nền tảng.\newline
10. Hệ thống tự động gửi thông báo chúc mừng hoạt động thành công đến tài khoản của chủ sân. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Từ chối hồ sơ (bước 8): Quản trị viên nhấn nút từ chối phê duyệt và nhập lý do. Hệ thống cập nhật trạng thái bị từ chối và tự động gửi thông báo lý do cụ thể đến chủ sân.\newline
- Hồ sơ đã được xử lý trước (bước 8): Nếu hồ sơ đã được xử lý bởi quản trị viên khác trước đó, hệ thống hiển thị thông báo không hợp lệ và yêu cầu tải lại. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Trạng thái hoạt động của cụm sân được ghi nhận; thông báo phản hồi kết quả tự động gửi đến chủ sân. \\ \hline
\end{tabular}
\end{table}
```

---

### 6. UC-06: Quản lý công nợ và quyết toán

#### a. Bảng đặc tả chức năng (Định dạng Markdown)

| Thành phần đặc tả | Nội dung mô tả chi tiết |
| :--- | :--- |
| **Tên Use Case** | Quản lý công nợ và quyết toán |
| **Mã Use Case** | UC-06 |
| **Tác nhân** | Quản trị hệ thống (Admin) |
| **Mục đích sử dụng** | Cho phép quản trị viên tiếp nhận và xử lý các yêu cầu rút tiền của chủ sân, thực hiện cập nhật trạng thái xử lý, đối soát chuyển tiền thủ công ngoài hệ thống và lưu trữ thông tin chứng từ giao dịch. |
| **Tiền điều kiện** | - Quản trị viên đã đăng nhập vào tài khoản trên hệ thống.<br>- Có yêu cầu rút tiền (đợt quyết toán) được tạo bởi chủ sân ở trạng thái chờ duyệt. |
| **Luồng chính** | 1. Quản trị viên truy cập giao diện quản lý quyết toán tài chính trên phân hệ điều hành của quản trị viên.<br>2. Hệ thống hiển thị danh sách các đợt yêu cầu chi trả (payout batch) từ các chủ sân gửi lên.<br>3. Quản trị viên lọc danh sách theo trạng thái chờ duyệt và chọn một yêu cầu cụ thể để xem chi tiết.<br>4. Hệ thống hiển thị thông tin tài khoản thụ hưởng, số tiền quyết toán và mã VietQR quét nhanh được tạo tự động.<br>5. Quản trị viên nhấn nút bắt đầu xử lý đợt chi trả trên giao diện.<br>6. Hệ thống ghi nhận trạng thái đợt quyết toán chuyển sang đang xử lý.<br>7. Quản trị viên thực hiện chuyển khoản thủ công cho chủ sân qua ngân hàng ngoài hệ thống theo thông tin đối soát.<br>8. Sau khi chuyển khoản thành công ngoài thực tế, quản trị viên chọn lệnh xác nhận đã chuyển khoản trên giao diện.<br>9. Hệ thống hiển thị biểu mẫu yêu cầu nhập mã giao dịch ngân hàng đối soát.<br>10. Quản trị viên điền mã giao dịch, ghi chú và nhấn xác nhận hoàn tất phê duyệt.<br>11. Hệ thống cập nhật đợt quyết toán sang đã thanh toán thành công và gửi thông báo xác nhận kèm biên lai điện tử cho chủ sân. |
| **Luồng thay thế** | - **Từ chối chi trả (tại bước 5 hoặc 8):** Nếu thông tin tài khoản thụ hưởng của chủ sân bị sai lệch hoặc có tranh chấp tài chính, quản trị viên chọn lệnh từ chối chi trả và nhập lý do cụ thể. Hệ thống cập nhật trạng thái đợt quyết toán sang đã hủy, tự động hoàn trả lại số tiền yêu cầu rút về ví tích lũy của chủ sân và gửi thông báo kèm lý do.<br>- **Xem tổng quan số dư ví chủ sân:** Tại giao diện quản lý tài chính, quản trị viên chọn chuyển sang tab Số dư & Ví chủ sân. Hệ thống hiển thị danh sách toàn bộ các chủ sân kèm theo các thông tin số dư chi tiết: số dư tích lũy chưa quyết toán, số dư đang yêu cầu rút và lũy kế số tiền đã trả. |
| **Hậu điều kiện** | Trạng thái đợt quyết toán được cập nhật chính xác; tiền quyết toán được chi trả thành công hoặc hoàn trả đầy đủ về ví tích lũy của chủ sân; nhật ký đối soát chứng từ giao dịch được ghi nhận đầy đủ. |

#### b. Mã nguồn bảng đặc tả (Định dạng LaTeX)

```latex
\begin{table}[htbp]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết chức năng Use Case UC-06: Quản lý công nợ và quyết toán}
\label{tab:uc-06-spec}
\begin{tabular}{|p{3cm}|p{11cm}|}
\hline
\textbf{Thành phần đặc tả} & \textbf{Nội dung mô tả chi tiết} \\ \hline
\textbf{Tên Use Case} & Quản lý công nợ và quyết toán \\ \hline
\textbf{Mã Use Case} & UC-06 \\ \hline
\textbf{Tác nhân} & \raggedright\arraybackslash Quản trị hệ thống (Admin) \\ \hline
\textbf{Mục đích sử dụng} & \raggedright\arraybackslash Tiếp nhận và xử lý các yêu cầu rút tiền của chủ sân, thực hiện cập nhật trạng thái xử lý, đối soát chuyển tiền thủ công ngoài hệ thống và lưu trữ thông tin chứng từ giao dịch. \\ \hline
\textbf{Tiền điều kiện} & \raggedright\arraybackslash Quản trị viên đã đăng nhập tài khoản; có yêu cầu rút tiền được tạo bởi chủ sân ở trạng thái chờ duyệt. \\ \hline
\textbf{Luồng chính} & \raggedright\arraybackslash
1. Quản trị viên truy cập giao diện quản lý quyết toán tài chính trên phân hệ quản trị.\newline
2. Hệ thống hiển thị danh sách các đợt yêu cầu chi trả từ các chủ sân gửi lên.\newline
3. Quản trị viên lọc danh sách theo trạng thái chờ duyệt và chọn một yêu cầu để xem chi tiết.\newline
4. Hệ thống hiển thị tài khoản thụ hưởng, số tiền quyết toán và mã VietQR tự động.\newline
5. Quản trị viên nhấn nút bắt đầu xử lý đợt chi trả trên giao diện.\newline
6. Hệ thống ghi nhận và chuyển trạng thái đợt quyết toán sang đang xử lý.\newline
7. Quản trị viên thực hiện chuyển khoản thủ công cho chủ sân qua ngân hàng ngoài hệ thống.\newline
8. Sau khi chuyển tiền thành công, quản trị viên chọn lệnh xác nhận đã chuyển khoản.\newline
9. Hệ thống hiển thị biểu mẫu yêu cầu nhập mã giao dịch ngân hàng đối soát.\newline
10. Quản trị viên điền mã giao dịch đối soát ngân hàng và xác nhận phê duyệt.\newline
11. Hệ thống cập nhật đợt quyết toán sang đã thanh toán thành công và thông báo kèm biên lai. \\ \hline
\textbf{Luồng thay thế} & \raggedright\arraybackslash
- Từ chối chi trả (bước 5 hoặc 8): Nếu tài khoản thụ hưởng sai lệch hoặc có tranh chấp, quản trị viên chọn từ chối và nhập lý do. Hệ thống chuyển trạng thái đợt quyết toán sang đã hủy, hoàn trả lại tiền về ví tích lũy của chủ sân và gửi thông báo lý do cụ thể.\newline
- Xem tổng quan số dư ví: Tại giao diện, quản trị viên chọn tab Số dư và Ví chủ sân. Hệ thống hiển thị danh sách ví tích lũy, số dư đang yêu cầu rút và lũy kế đã trả của từng chủ sân. \\ \hline
\textbf{Hậu điều kiện} & \raggedright\arraybackslash Trạng thái đợt quyết toán được cập nhật chính xác; tiền quyết toán được chi trả thành công hoặc được hoàn trả về ví tích lũy của chủ sân. \\ \hline
\end{tabular}
\end{table}
```