Biểu đồ hoạt động (Activity Diagram) minh họa luồng công việc hoặc quy trình xử lý. Để vẽ biểu đồ chuẩn xác và dễ hiểu, bạn cần tuân thủ các nguyên tắc cốt lõi về quy trình thiết kế, quy tắc ký hiệu và cấu trúc luồng. 


1. Nguyên tắc về Quy trình thiết kế
Xác định rõ ranh giới: Nắm vững mục đích của biểu đồ (quy trình nghiệp vụ hay luồng mã nguồn) trước khi bắt đầu.
Xác định rõ đối tượng: Liệt kê các tác nhân (Actor) hoặc thực thể tham gia vào quy trình để phân chia luồng rõ ràng.
Mức độ chi tiết vừa phải: Tập trung vào các bước nghiệp vụ chính có ý nghĩa thực tế đối với tác nhân. Lược bỏ các chi tiết kỹ thuật sâu (như cập nhật trạng thái dữ liệu nội bộ, lưu log hệ thống, các hàm API vụn vặt).

2. Nguyên tắc về Ký hiệu chuẩn
Điểm bắt đầu và kết thúc: Bắt đầu bằng Node khởi đầu (hình tròn đặc màu đen) và kết thúc bằng Node kết thúc (hình tròn viền đôi có dấu chấm đặc bên trong).
Hoạt động (Action): Thể hiện bằng hình chữ nhật bo tròn các góc, bên trong ghi tên hành động. Mỗi hoạt động chỉ thực hiện một tác vụ đơn lẻ.
Luồng điều khiển: Dùng mũi tên liền nét nối các node để chỉ định hướng di chuyển của quy trình.
Điểm quyết định (Decision Node): Thể hiện bằng hình thoi RỖNG (không chứa chữ bên trong), có một mũi tên đi vào và hai hoặc nhiều mũi tên đi ra. Các nhánh đi ra phải có điều kiện bảo vệ (Guard Expression) đặt trong ngoặc vuông, ví dụ [Đúng] và [Sai], đặt dọc theo đường mũi tên.
Điểm hợp nhất (Merge Node): Thể hiện bằng hình thoi RỖNG có nhiều mũi tên đi vào và chỉ có một mũi tên đi ra để gộp các luồng xử lý lại.
Phân nhánh và Hợp nhất (Fork & Join): Dùng các thanh ngang kẻ đậm màu đen để chia một luồng thành nhiều luồng chạy song song (Fork) hoặc gộp các luồng song song lại thành một (Join). 

3. Nguyên tắc về Cấu trúc luồng và Tối ưu khoảng cách
Luồng rẽ nhánh phải bao quát: Đảm bảo tất cả các điều kiện có thể xảy ra ở điểm quyết định đều có đường đi tương ứng.
Không cắt chéo đường nối: Bố trí các node sao cho các đường mũi tên không cắt nhau, giúp biểu đồ mạch lạc, dễ theo dõi.
Sử dụng phân vùng tối ưu (Swimlanes/Partition): Gom nhóm các hoạt động vào các cột/hàng dọc theo từng đối tượng thực hiện để làm rõ trách nhiệm.
Tối ưu hóa không gian biểu đồ (Tránh trải quá rộng):
  - **Gom nhóm làn bơi:** Tối thiểu số lượng cột làn bơi bằng cách tích hợp các vai trò tương đồng (ví dụ: đưa các tiến trình quét tự động, cron job vào chung làn bơi "Hệ thống" thay vì tách cột riêng biệt).
  - **Sắp xếp thứ tự cột thông minh:** Đặt các làn bơi có tần suất tương tác trực tiếp cạnh nhau (ví dụ: Người chơi cạnh Cổng thanh toán, Hệ thống cạnh Chủ sân) để rút ngắn chiều dài mũi tên liên vùng.
  - **Tách đoạn luồng độc lập:** Đối với các tác vụ nền hoặc tác vụ ngoại lệ định kỳ, có thể vẽ thành các luồng độc lập trong cùng một biểu đồ để tránh việc kéo dài các đường kết nối phức tạp từ luồng chính. 
  - **Ngắt dòng chủ động (Line Wrapping):** Sử dụng ký tự xuống dòng `\n` một cách chủ động trong các mô tả hành động để ép văn bản dài thành 2-3 dòng ngắn, giúp thu hẹp đáng kể chiều ngang của từng khối.
  - **Cấu hình tự động ngắt dòng:** Khai báo cấu hình `skinparam wrapWidth` (ví dụ: `120` hoặc `150`) để hệ thống tự động bẻ dòng các khối văn bản dài.
  - **Thu hẹp khoảng cách luồng và nút (Node & Spacing Compression):** 
    * Sử dụng `skinparam nodeSep` (khoảng cách ngang giữa các nút, ví dụ: `15` đến `20`) và `skinparam rankSep` (khoảng cách dọc giữa các hàng, ví dụ: `15` đến `20`) ở mức tối thiểu để ép biểu đồ co ngắn lại hết cỡ.
    * Sử dụng cấu hình `skinparam swimlaneWidth same` để đồng bộ kích thước các cột.
  - **Vẽ khung viền phân vùng rõ ràng:** Định cấu hình màu viền phân làn (`skinparam swimlaneBorderColor`) và độ dày viền (`skinparam swimlaneBorderThickness`) để tạo khung bao quanh và vách ngăn rõ nét giữa các phân làn giống như các tài liệu đặc tả chuẩn.
  - **Vẽ Khung bọc biểu đồ (UML Frame):** Đối với biểu đồ có phân làn (swimlanes), PlantUML không cho phép sử dụng khối bọc ngoài `partition` (sẽ gây lỗi cú pháp). Thay vào đó, hãy sử dụng cấu hình `skinparam DiagramBorderColor` và `skinparam DiagramBorderThickness` kết hợp từ khóa `title act Tên_Quy_Trình` để tự động vẽ khung bao quanh toàn bộ bản vẽ cực kỳ chuyên nghiệp và chuẩn UML.

4. Nguyên tắc về Màu sắc trong biểu đồ (Semantic Coloring)
Để biểu đồ hoạt động trực quan, giàu tính thẩm mỹ và dễ theo dõi, hệ thống áp dụng cơ chế phối màu tối giản kết hợp phân loại chức năng (Semantic Coloring):
- **Khối khởi đầu và kết thúc (Start & End):**
  * Node khởi đầu (Initial Node): Sử dụng màu Xanh lá cây đậm (`#2E7D32`) hoặc màu Đen để kích hoạt luồng.
  * Node kết thúc (Activity Final Node): Sử dụng màu Đỏ đô (`#C62828`) để thể hiện điểm dừng hoàn tất.
- **Khối hành động (Action/Activity Nodes):**
  * Hành động từ phía người dùng (User Action - Người chơi, Chủ sân): Sử dụng màu Vàng nhạt (`#FFF2CC`) nổi bật giúp nhận biết tương tác.
  * Hành động từ phía hệ thống (Standard System Action - Backend, Cổng thanh toán): Sử dụng màu Xanh dương nhạt (`#E6F0FA`) nhất quán.
- **Khối quyết định (Decision & Merge Nodes):**
  * Sử dụng hình thoi RỖNG nhưng được đổ màu Vàng/Cam nhạt (`#FFF5CC`) và viền vàng sậm để thu hút sự tập trung vào điểm rẽ nhánh luồng.
- **Khối lỗi/Ngoại lệ (Exception & Error Nodes):**
  * Các hành động hoặc đường rẽ nhánh thất bại (ví dụ: giao dịch lỗi, hủy đặt sân) sử dụng màu Đỏ/Hồng nhạt (`#FADBD8`) để khoanh vùng vùng lỗi nghiệp vụ.

> 📌 **Bảng tham chiếu mã màu chuẩn chỉnh:**
> * **Standard Action (Hệ thống):** `#E6F0FA`
> * **User Action (Người dùng):** `#FFF2CC`
> * **Decision Node (Quyết định):** `#FFF5CC` (Viền `#E6B800`)
> * **Exception Node (Luồng lỗi):** `#FADBD8`
> * **Initial Node (Khởi đầu):** `#2E7D32`
> * **Activity Final (Kết thúc):** `#C62828`

> ⚠️ **Lưu ý quan trọng về cú pháp PlantUML khi đổ màu và ngắt dòng:**
> Để tránh các lỗi nhận diện nhầm mã màu thành nội dung chữ khi có ký tự xuống dòng `\n` và tuân thủ các phiên bản PlantUML mới nhất (tránh cảnh báo lỗi thời - Deprecated), **luôn luôn sử dụng cú pháp đặt tag màu ở cuối dòng, sau dấu chấm phẩy**:
> * **Chuẩn hiện đại và không bị lỗi thời (Modern Syntax):** `:Tên hành động; <<#mã_màu>>` (Ví dụ: `:Lựa chọn sân\nvà dịch vụ đi kèm; <<#FFF2CC>>`)
> * **Cú pháp cũ bị cảnh báo lỗi thời (Deprecated):** `#mã_màu:Tên hành động;` hoặc `:Tên hành động #mã_màu;`
