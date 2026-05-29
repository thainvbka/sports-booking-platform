### BẢNG MÃ NGUỒN LATEX CHO THIẾT KẾ CƠ SỞ DỮ LIỆU

Dưới đây là toàn bộ mã nguồn LaTeX đã được sửa đổi triệt để lỗi biên dịch (escape ký tự gạch dưới `_` thành `\_`) và tối ưu hóa độ rộng cột để vừa khít lề trang báo cáo (15.0cm):

---

#### 1. Danh mục thực thể dữ liệu tổng quan (Bảng 4.2)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Danh mục các bảng dữ liệu trong hệ thống}
\label{tab:db-overview}
\begin{tabular}{|p{1cm}|p{3.5cm}|p{8.5cm}|}
\hline
\textbf{STT} & \textbf{Tên bảng} & \textbf{Mô tả chức năng} \\ \hline
1 & Account & Lưu trữ tài khoản và thông tin cá nhân dùng chung. \\ \hline
2 & Admin & Lưu trữ tài khoản quản trị viên hệ thống. \\ \hline
3 & Owner & Lưu trữ thông tin đối tác chủ sân và cấu hình thụ hưởng. \\ \hline
4 & Player & Lưu trữ thông tin tài khoản người chơi. \\ \hline
5 & RefreshToken & Quản lý mã làm mới phiên đăng nhập. \\ \hline
6 & Complex & Lưu trữ thông tin khu phức hợp thể thao. \\ \hline
7 & SubField & Lưu trữ danh sách các sân đấu con. \\ \hline
8 & PricingRule & Thiết lập bảng giá thuê sân theo khung giờ. \\ \hline
9 & RecurringBooking & Lưu trữ cấu hình lịch đặt sân định kỳ. \\ \hline
10 & Booking & Lưu trữ thông tin giao dịch đặt sân. \\ \hline
11 & Payment & Lưu trữ thông tin trạng thái giao dịch thanh toán. \\ \hline
12 & Notification & Lưu trữ thông báo hệ thống phân phối cho người dùng. \\ \hline
13 & Product & Quản lý sản phẩm bán lẻ và trang thiết bị cho thuê kèm. \\ \hline
14 & BookingAddon & Chi tiết sản phẩm thuê kèm của lượt đặt sân. \\ \hline
15 & Match & Lưu trữ thông tin kèo đấu ghép cặp. \\ \hline
16 & MatchParticipant & Quản lý thành viên đăng ký tham gia kèo ghép đấu. \\ \hline
17 & Review & Lưu trữ phản hồi và đánh giá từ phía người chơi. \\ \hline
18 & OwnerPayout & Phân tách chi tiết dòng tiền doanh thu đối soát. \\ \hline
19 & PayoutBatch & Quản lý các đợt yêu cầu và lịch sử quyết toán tài chính. \\ \hline
\end{tabular}
\end{table}
```

---

#### 2. Đặc tả chi tiết cấu trúc thực thể Account (Bảng 4.3)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể Account}
\label{tab:account-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh tài khoản. \\ \hline
2 & email & VARCHAR(255) & Email đăng nhập (duy nhất). \\ \hline
3 & password & TEXT & Mật khẩu tài khoản (mã hóa băm). \\ \hline
4 & full\_name & VARCHAR(100) & Họ và tên người dùng. \\ \hline
5 & phone\_number & VARCHAR(20) & Số điện thoại liên lạc. \\ \hline
6 & avatar & TEXT & Đường dẫn ảnh đại diện. \\ \hline
7 & email\_verified & BOOLEAN & Trạng thái xác minh email. \\ \hline
\end{tabular}
\end{table}
```

---

#### 3. Đặc tả chi tiết cấu trúc thực thể Complex (Bảng 4.4)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể Complex}
\label{tab:complex-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh khu phức hợp. \\ \hline
2 & owner\_id & UUID & Khóa ngoại, liên kết bảng Owner. \\ \hline
3 & complex\_name & VARCHAR(255) & Tên khu phức hợp thể thao. \\ \hline
4 & complex\_address & TEXT & Địa chỉ khu phức hợp. \\ \hline
5 & status & ComplexStatus & Trạng thái duyệt và hoạt động. \\ \hline
6 & verification\_docs & JSON & Tài liệu pháp lý xác minh sở hữu. \\ \hline
7 & sport\_types & VARCHAR[] & Danh sách môn thể thao hỗ trợ. \\ \hline
8 & avg\_rating & DECIMAL(3,2) & Điểm đánh giá trung bình. \\ \hline
\end{tabular}
\end{table}
```

---

#### 4. Đặc tả chi tiết cấu trúc thực thể SubField (Bảng 4.5)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể SubField}
\label{tab:subfield-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh sân đấu con. \\ \hline
2 & complex\_id & UUID & Khóa ngoại, liên kết bảng Complex. \\ \hline
3 & sub\_field\_name & VARCHAR(255) & Tên sân đấu con. \\ \hline
4 & capacity & SMALLINT & Sức chứa người chơi tối đa. \\ \hline
5 & sub\_field\_image & TEXT & Ảnh chụp thực tế sân đấu. \\ \hline
6 & sport\_type & SportType & Bộ môn thể thao áp dụng. \\ \hline
7 & isDelete & BOOLEAN & Trạng thái xóa mềm dữ liệu. \\ \hline
8 & avg\_rating & DECIMAL(3,2) & Điểm đánh giá trung bình. \\ \hline
9 & embedding & vector(8) & Véc-tơ đặc trưng phục vụ gợi ý. \\ \hline
10 & embedding\_updated\_at & TIMESTAMPTZ & Thời điểm cập nhật véc-tơ gần nhất. \\ \hline
\end{tabular}
\end{table}
```

---

#### 5. Đặc tả chi tiết cấu trúc thực thể Booking (Bảng 4.6)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể Booking}
\label{tab:booking-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh lượt đặt sân. \\ \hline
2 & start\_time & TIMESTAMPTZ & Thời điểm bắt đầu thuê sân. \\ \hline
3 & end\_time & TIMESTAMPTZ & Thời điểm kết thúc thuê sân. \\ \hline
4 & total\_price & DECIMAL(12,2) & Tổng chi phí thanh toán. \\ \hline
5 & status & BookingStatus & Trạng thái lượt đặt sân. \\ \hline
6 & player\_id & UUID & Khóa ngoại, liên kết bảng Player. \\ \hline
7 & sub\_field\_id & UUID & Khóa ngoại, liên kết bảng SubField. \\ \hline
8 & payment\_id & UUID & Khóa ngoại, liên kết bảng Payment. \\ \hline
9 & recurring\_booking\_id & UUID & Khóa ngoại, liên kết bảng RecurringBooking. \\ \hline
\end{tabular}
\end{table}
```

---

#### 6. Đặc tả chi tiết cấu trúc thực thể Match (Bảng 4.7)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể Match}
\label{tab:match-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh kèo đấu. \\ \hline
2 & booking\_id & UUID & Khóa ngoại, liên kết bảng Booking. \\ \hline
3 & creator\_id & UUID & Khóa ngoại, liên kết bảng Player. \\ \hline
4 & sport\_type & SportType & Bộ môn thể thao thi đấu. \\ \hline
5 & skill\_level & MatchSkillLevel & Yêu cầu trình độ người tham gia. \\ \hline
6 & title & VARCHAR(200) & Tiêu đề kèo đấu ghép cặp. \\ \hline
7 & slots\_needed & SMALLINT & Số lượng vị trí cần tìm thêm. \\ \hline
8 & slots_filled & SMALLINT & Số lượng vị trí đã tuyển đủ. \\ \hline
9 & status & MatchStatus & Trạng thái hoạt động của kèo đấu. \\ \hline
\end{tabular}
\end{table}
```

---

#### 7. Đặc tả chi tiết cấu trúc thực thể OwnerPayout (Bảng 4.8)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể OwnerPayout}
\label{tab:ownerpayout-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh dòng tiền giao dịch. \\ \hline
2 & owner\_id & UUID & Khóa ngoại, liên kết bảng Owner. \\ \hline
3 & payment\_id & UUID & Khóa ngoại, liên kết bảng Payment. \\ \hline
4 & batch\_id & UUID & Khóa ngoại, liên kết bảng PayoutBatch. \\ \hline
5 & total\_amount & DECIMAL(12,2) & Tổng doanh thu giao dịch thô. \\ \hline
6 & platform\_fee & DECIMAL(12,2) & Phí hoa hồng dịch vụ khấu trừ. \\ \hline
7 & payout\_amount & DECIMAL(12,2) & Doanh thu ròng thực tế chủ sân. \\ \hline
8 & status & PayoutStatus & Trạng thái quyết toán giao dịch. \\ \hline
\end{tabular}
\end{table}
```

---

#### 8. Đặc tả chi tiết cấu trúc thực thể PayoutBatch (Bảng 4.9)

```latex
\begin{table}[H]
\centering
\singlespacing
\small
\caption{Đặc tả chi tiết cấu trúc thực thể PayoutBatch}
\label{tab:payoutbatch-spec}
\begin{tabular}{|p{0.8cm}|p{3.5cm}|p{2.7cm}|p{6.0cm}|}
\hline
\textbf{STT} & \textbf{Tên trường} & \textbf{Kiểu dữ liệu} & \textbf{Mô tả} \\ \hline
1 & id & UUID & Khóa chính, định danh đợt quyết toán. \\ \hline
2 & owner\_id & UUID & Khóa ngoại, liên kết bảng Owner. \\ \hline
3 & total\_payout & DECIMAL(12,2) & Tổng số tiền quyết toán. \\ \hline
4 & status & PayoutStatus & Trạng thái xử lý quyết toán đợt. \\ \hline
5 & payout\_period & VARCHAR(50) & Chu kỳ kế toán quyết toán. \\ \hline
6 & transaction\_ref & VARCHAR(255) & Mã giao dịch đối soát ngân hàng. \\ \hline
7 & note & TEXT & Ghi chú từ quản trị viên. \\ \hline
\end{tabular}
\end{table}
```
