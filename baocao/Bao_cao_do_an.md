# LỜI CẢM ƠN

Trước tiên, em xin gửi lời cảm ơn chân thành nhất đến giảng viên hướng dẫn, Tiến sĩ Nguyễn Thị Thanh Nga, người đã tận tình giúp đỡ và định hướng cho em trong suốt quá trình thực hiện đồ án tốt nghiệp này.

Em cũng xin gửi lòng biết ơn đến gia đình, những người bạn đã luôn động viên, chia sẻ áp lực và tạo điều kiện thuận lợi nhất cho em. Bên cạnh đó, em muốn cảm ơn chính bản thân mình vì đã luôn nỗ lực, chăm chỉ để hoàn thành đồ án với kết quả tốt nhất.

Dù đã dành nhiều tâm huyết, nhưng do giới hạn về mặt kinh nghiệm thực tiễn, đồ án khó tránh khỏi những khiếm khuyết nhất định. Em rất mong đón nhận các ý kiến đóng góp quý báu từ quý thầy cô để có thể tiếp tục trau dồi chuyên môn cho công việc sau này.

# TÓM TẮT NỘI DUNG ĐỒ ÁN

Trong những năm gần đây, nhu cầu sử dụng sân thể thao tại các đô thị lớn ngày càng tăng, kéo theo nhiều khó khăn trong công tác quản lý và đặt lịch sân. Phần lớn các cơ sở hiện nay vẫn vận hành thủ công thông qua điện thoại, tin nhắn hoặc ghi chép trực tiếp, dễ xảy ra trùng lịch, sai sót và khó kiểm soát doanh thu. Bên cạnh đó, việc áp dụng giá linh hoạt theo thời gian và quản lý khách đặt sân định kỳ cũng còn nhiều hạn chế.
Xuất phát từ thực tế đó, đề tài “Xây dựng hệ thống quản lý và đặt lịch sân thể thao” được thực hiện nhằm xây dựng một nền tảng hỗ trợ quản lý và đặt sân trực tuyến cho ba nhóm người dùng gồm người chơi, chủ sân và quản trị viên. Hệ thống cho phép người chơi tìm kiếm, đặt lịch, thanh toán trực tuyến, đánh giá sân và tìm kiếm đối kèo. Đối với chủ sân, hệ thống hỗ trợ quản lý sân bãi, lịch đặt, doanh thu và sản phẩm đi kèm. Ngoài ra, quản trị viên có thể theo dõi và kiểm soát hoạt động toàn hệ thống.
Đề tài cũng tập trung xây dựng cơ chế gợi ý sân phù hợp dựa trên hành vi người dùng nhằm nâng cao trải nghiệm tìm kiếm và đặt sân. Đồng thời, hệ thống hỗ trợ thông báo thời gian thực, giúp người dùng nhanh chóng cập nhật trạng thái đặt sân, các đối kèo và các hoạt động liên quan. Kết quả đạt được là một nền tảng web hoàn chỉnh, đáp ứng các nhu cầu cơ bản trong quản lý và đặt lịch sân thể thao, sẵn sàng triển khai và vận hành thực tế.

# CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

(Mở đầu: Giới thiệu ngắn gọn những nội dung sẽ trình bày trong chương 1)

## 1.1 Đặt vấn đề

Trong những năm gần đây, nhu cầu tham gia các hoạt động thể dục thể thao của người dân ngày càng gia tăng. Sự phát triển của các bộ môn như bóng đá, cầu lông, tennis hay pickleball kéo theo nhu cầu sử dụng sân bãi và cơ sở tập luyện tăng mạnh. Tuy nhiên, phần lớn các cụm sân thể thao hiện nay vẫn vận hành theo phương thức thủ công thông qua điện thoại, tin nhắn hoặc ghi chép trực tiếp. Khi số lượng khách hàng tăng lên, cách quản lý này dễ phát sinh nhiều bất cập như trùng lặp lịch đặt, sai sót trong quá trình xác nhận, khó kiểm soát doanh thu và thiếu tính đồng bộ trong vận hành.

Bên cạnh đó, việc áp dụng các chính sách giá linh hoạt theo khung giờ, ngày trong tuần hoặc quản lý khách hàng đặt sân định kỳ cũng gặp nhiều khó khăn khi thực hiện thủ công. Từ phía người chơi, quá trình tìm kiếm sân phù hợp với vị trí, thời gian và mức giá mong muốn còn thiếu thuận tiện. Người dùng thường phải liên hệ nhiều chủ sân khác nhau để kiểm tra tình trạng còn trống, gây mất thời gian và làm giảm trải nghiệm sử dụng dịch vụ.

Ngoài nhu cầu đặt sân, xu hướng kết nối của cộng đồng người chơi thể thao cũng ngày càng rõ rệt, nhiều người chơi có nhu cầu tìm kiếm đồng đội, đối thủ hoặc tham gia các kèo chơi thể thao. Tuy nhiên, các hoạt động này hiện chủ yếu được thực hiện thông qua mạng xã hội hoặc các nhóm trao đổi riêng lẻ, thiếu tính tập trung và khó quản lý. Đồng thời, nhu cầu cá nhân hóa trải nghiệm người dùng, chẳng hạn như gợi ý sân phù hợp dựa trên thói quen và hành vi đặt sân, cũng chưa được hỗ trợ hiệu quả trong các hệ thống hiện có.

Từ những thực tế trên, việc xây dựng một hệ thống quản lý và đặt lịch sân thể thao tập trung là cần thiết nhằm hỗ trợ số hóa quy trình vận hành sân bãi, nâng cao trải nghiệm người dùng và tăng hiệu quả quản lý cho các chủ sân thể thao.

## 1.2 Mục tiêu và phạm vi đề tài

Hiện nay đã có nhiều nền tảng hỗ trợ đặt sân thể thao trực tuyến. Tuy nhiên, phần lớn các hệ thống tập trung vào chức năng đặt sân cơ bản, chưa bao quát đầy đủ nghiệp vụ vận hành của chủ sân và các nhu cầu mở rộng của người chơi. Khả năng khai thác dữ liệu hành vi để đưa ra gợi ý cá nhân hóa còn hạn chế; tính năng tạo kèo giao lưu trên cùng nền tảng với đặt sân cũng chưa được phổ biến. Khi người dùng phải dùng nhiều ứng dụng riêng cho việc đặt sân, mua sản phẩm phụ trợ và tìm đồng đội, trải nghiệm trở nên rời rạc. Bên cạnh đó, trong giờ cao điểm, nguy cơ tranh chấp đặt trùng khung giờ trên cùng một sân là bài toán kỹ thuật cần được xử lý có kiểm soát.

Dựa trên các hạn chế nêu trên, đồ án đặt mục tiêu nghiên cứu và phát triển một nền tảng phần mềm quản lý và đặt lịch sân thể thao tích hợp. Hệ thống phục vụ bốn nhóm đối tượng: khách vãng lai, người chơi, chủ sân và quản trị viên. Mục tiêu là xây dựng luồng nghiệp vụ liên thông từ tra cứu, đặt chỗ, thanh toán và kết nối giao lưu; đồng thời đảm bảo tính nhất quán dữ liệu khi nhiều người dùng cùng thao tác đặt sân, và cung cấp gợi ý sân theo hành vi sử dụng.

Phạm vi của đề tài bao trùm việc xây dựng các phân hệ chức năng chi tiết cho từng nhóm người dùng. Đối với khách vãng lai, phạm vi hệ thống cho phép tiếp cận thông tin một cách tự do, cung cấp các công cụ tìm kiếm cơ bản về sân bãi, giá cả mà không yêu cầu rào cản đăng nhập. Đối với người chơi thể thao, hỗ trợ quy trình đặt lịch linh hoạt bao gồm cả đặt đơn lẻ và đặt định kỳ dài hạn, thanh toán trực tuyến qua cổng Stripe và VNPay; đặt kèm sản phẩm hoặc dịch vụ phụ khi đặt sân; đánh giá sau khi sử dụng; tạo và tham gia kèo giao lưu; nhận danh sách gợi ý sân cá nhân hóa theo lịch sử đặt sân, hoặc danh sách sân phổ biến trong trường hợp người dùng mới. Đối với vai trò chủ sân, phạm vi tập trung vận hành qua bảng điều khiển: quản lý nhiều khu phức hợp và sân con; thiết lập quy tắc giá theo khung giờ và ngày trong tuần; quản lý danh mục sản phẩm bán kèm; xác nhận booking, theo dõi doanh thu và báo cáo thống kê; khai báo tài khoản ngân hàng, theo dõi số dư và gửi yêu cầu quyết toán đối với giao dịch thanh toán qua VNPay. Đối với quản trị viên, phạm vi gồm kiểm duyệt cụm sân đăng ký mới, quản lý trạng thái hoạt động của cơ sở và tài khoản người dùng, giám sát lịch sử giao dịch trên nền tảng, xử lý các đợt quyết toán cho chủ sân nhằm đảm bảo an toàn và minh bạch vận hành.

## 1.3 Định hướng giải pháp

Đồ án đề xuất giải pháp xây dựng hệ thống phần mềm dựa trên kiến trúc Web theo mô hình máy khách - máy chủ. Các thành phần của hệ thống giao tiếp thông qua giao diện lập trình ứng dụng. Định hướng này giúp phân tách logic xử lý nghiệp vụ và giao diện người dùng, tạo cơ sở cho việc mở rộng và bảo trì mã nguồn.

Về lưu trữ và gợi ý, đồ án chọn PostgreSQL tích hợp pgvector để lưu vector đặc trưng hành vi người chơi và sân, vì dữ liệu nghiệp vụ và dữ liệu phục vụ gợi ý nằm chung một hệ quản trị. Thuật toán gợi ý kết hợp tìm kiếm tương đồng cosine, xếp hạng lại bằng mô hình Gemini nhằm tinh chỉnh danh sách và cung cấp lý do ngắn, đồng thời cache kết quả trên Redis để giảm độ trễ; người dùng thiếu lịch sử đặt sân được đề xuất theo mức độ phổ biến.

Để xử lý tranh chấp khi nhiều người cùng đặt một sân, đồ án áp dụng khóa hai lớp: Redis Lock làm cổng chặn giảm tải, PostgreSQL khóa bi quan và kiểm tra chồng lấn thời gian trong giao dịch làm chốt chặn. Các tác vụ bảo trì (hủy phiên quá hạn, nhắc lịch, trạng thái các thành viên của kèo đấu, cập nhật cache và embedding) được đưa vào các tiến trình chạy ngầm để không ảnh hưởng thời gian phản hồi của API tạo đặt sân.

Trên cơ sở các định hướng trên, giải pháp là nền tảng Web quản lý đặt lịch sân thể thao, cho phép chủ sân quản lý sân và lịch, người chơi tra cứu–đặt–thanh toán và tham gia giao lưu, kèm module gợi ý sân theo hành vi. Đóng góp chính là hiện thực tích hợp kiểm soát đặt chỗ đồng thời và gợi ý cá nhân hóa trên một sản phẩm thống nhất. Kết quả là hệ thống phần mềm hoàn chỉnh, vận hành được các luồng nghiệp vụ của dự án trong điều kiện nhiều người dùng truy cập đồng thời.

## 1.4 Bố cục đồ án

Phần còn lại của báo cáo đồ án tốt nghiệp được tổ chức như sau.

Chương 2 trình bày kết quả khảo sát thực tế và phân tích chi tiết các yêu cầu chức năng, phi chức năng của hệ thống đặt sân thể thao. Trong chương này, các luồng nghiệp vụ thực tế được làm rõ thông qua việc thiết lập các biểu đồ use case tổng quát và use case phân rã chi tiết cho từng nhóm đối tượng người dùng.

Chương 3 giới thiệu về các nền tảng lý thuyết và toàn bộ công nghệ được lựa chọn sử dụng trong dự án. Chương này tập trung làm rõ lý do tại sao hệ thống sử dụng React và Zustand cho Frontend, Express.js cho Backend, cùng các công nghệ bổ trợ quan trọng khác như PostgreSQL, Redis, pgvector và cổng thanh toán VNPay/Stripe nhằm giải quyết các bài toán cụ thể đã đặt ra.

Chương 4 là phần mô tả chi tiết quá trình phân tích thiết kế, xây dựng và chạy thử nghiệm hệ thống. Nội dung chương bao gồm việc lựa chọn kiến trúc phần mềm, cấu trúc các gói code Backend, thiết kế chi tiết các lớp Service cốt lõi, cùng thiết kế chi tiết cơ sở dữ liệu quan hệ. Chương này cũng trình bày các kết quả giao diện đạt được, quy trình kiểm thử các tính năng quan trọng và cách thức triển khai hệ thống trên server.

Chương 5 phân tích sâu vào các giải pháp kỹ thuật nổi bật được nghiên cứu và tự giải quyết trong quá trình làm đồ án. Cụ thể, chương này tập trung làm rõ hai đóng góp chính là giải pháp kiểm soát đặt sân đồng thời bằng sự kết hợp giữa Redis Lock và PostgreSQL Pessimistic Lock, và cơ chế tìm kiếm, đề xuất sân thông minh qua pgvector kết hợp Gemini.

Chương 6 tổng kết lại toàn bộ các kết quả thực tế mà đồ án đã hoàn thành, chỉ ra những ưu điểm cũng như các mặt hạn chế còn tồn tại của hệ thống. Đồng thời, chương này cũng đề xuất các định hướng nghiên cứu và phát triển tiếp theo để nâng cấp ứng dụng trong tương lai.

# CHƯƠNG 2. KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU (Chương này có độ dài từ 9 đến 11 trang.)

Chương này trình bày chi tiết quá trình khảo sát hiện trạng, phân tích yêu cầu phần mềm và mô hình hóa các chức năng cốt lõi của nền tảng. Nội dung chương bao gồm việc xác định các tác nhân, xây dựng biểu đồ use case từ mức tổng quát đến phân rã chi tiết, và định nghĩa các yêu cầu phi chức năng. Thông qua phân tích này, hệ thống được định hình rõ ràng về mặt hành vi, tương tác và các ràng buộc kỹ thuật.

## 2.1 Khảo sát hiện trạng

Thông thường, khảo sát chi tiết về hiện trạng và yêu cầu của phần mềm sẽ được lấy từ ba nguồn chính, đó là (i) người dùng/khách hàng, (ii) các hệ thống đã có, (iii) và các ứng dụng tương tự. Sinh viên cần tiến hành phân tích, so sánh, đánh giá chi tiết ưu nhược điểm của các sản phẩm/nghiên cứu hiện có. Sinh viên có thể lập bảng so sánh nếu cần thiết. Kết hợp với khảo sát người dùng/khách hàng (nếu có), sinh viên nêu và mô tả sơ lược các tính năng phần mềm quan trọng cần phát triển.

## 2.2 Tổng quan chức năng
Mục 2.2 trình bày tổng quan các phân hệ chức năng chính của hệ thống đặt sân thể thao, được thiết kế xoay quanh bốn nhóm người dùng chính bao gồm Khách vãng lai, Người chơi, Chủ sân và Quản trị viên. Các nhóm chức năng này được mô hình hóa chi tiết thông qua các biểu đồ use case tổng quát và use case phân rã tương ứng, tạo cơ sở phân tích để tiến hành đặc tả luồng sự kiện chi tiết cho các chức năng cốt lõi của nền tảng ở các mục tiếp theo.


### 2.2.1 Biểu đồ use case tổng quát

![Biều đồ usecase tổng quan](/images/BieudoUseCaseTongQuan.png)

Khách vãng lai là người truy cập chưa đăng nhập hoặc chưa có vai trò nghiệp vụ trong hệ thống. Tác nhân này tra cứu cụm sân, sân con, giá và tình trạng còn trống; xem đánh giá và danh sách kèo giao lưu công khai; thực hiện đăng ký, đăng nhập hoặc đăng xuất. Các use case này tạo điều kiện thu thập thông tin trước khi người dùng chuyển sang các nghiệp vụ yêu cầu xác thực.

Người chơi là người dùng đã xác thực với vai trò PLAYER. Tác nhân này có thể tạo một lượt đặt sân hoặc tạo chuỗi đặt định kỳ; thực hiện thanh toán qua cổng trực tuyến; mua thêm vật phẩm gắn với booking; xem lịch sử đặt sân, hủy đặt sân và đánh giá sân sau khi sử dụng; tạo kèo, tham gia hoặc rời kèo giao lưu; xem gợi ý sân và nhận thông báo. 

Chủ sân là người dùng đã xác thực với vai trò OWNER, chịu trách nhiệm vận hành một hoặc nhiều khu phức hợp. Tác nhân này quản lý khu phức hợp và sân con; thiết lập bảng giá theo khung giờ và ngày trong tuần; quản lý danh mục vật phẩm bán kèm; xem lịch đặt của sân; xác nhận hoặc từ chối booking; theo dõi thống kê doanh thu; khai báo tài khoản ngân hàng và gửi yêu cầu quyết toán đối với giao dịch thu qua VNPay.

Quản trị viên là người dùng với vai trò ADMIN, có quyền giám sát toàn nền tảng. Tác nhân này duyệt hoặc từ chối đăng ký khu phức hợp mới; quản lý trạng thái tài khoản người chơi, chủ sân và quản trị viên; theo dõi giao dịch; xử lý đối soát và các đợt quyết toán cho chủ sân; xem thống kê và lập báo cáo tổng hợp.

### 2.2.2 Biểu đồ use case phân rã "Đặt sân"

![Biều đồ usecase phân rã 'Đặt sân'](/images/phanradatsan.png)

Biểu đồ phân rã "Đặt sân" (Hình 2.2) mô tả chi tiết các chức năng thuộc phân hệ đặt sân dành cho người chơi. Từ use case cơ sở là tạo lượt đặt sân, hệ thống cung cấp hai hình thức cụ thể bao gồm đặt sân một lần cho nhu cầu ngắn hạn và đặt sân định kỳ cho các khung giờ lặp lại cố định. Đối với hình thức đặt sân một lần, người chơi có thể thực hiện mua kèm vật phẩm như nước uống hoặc thuê dụng cụ trực tiếp trên hệ thống. Để hoàn tất quy trình đặt sân, use case tạo lượt đặt sân bắt buộc bao gồm chức năng thanh toán qua cổng trực tuyến. Bên cạnh đó, sau khi khởi tạo lượt đặt sân thành công, người chơi có thể sử dụng tính năng tạo kèo nhằm tìm kiếm thêm đồng đội hoặc đối thủ giao lưu.

### 2.2.3 Biểu đồ use case phân rã "Tham gia, Quản lý kèo đấu"

![Biều đồ usecase phân rã 'Tham gia, Quản lý kèo đấu'](/images/phanraquanlikeodau.png)

Biểu đồ phân rã "Tham gia, Quản lý kèo đấu" (Hình 2.3) mô tả các chức năng hỗ trợ kết nối và ghép cặp giữa những người chơi. Tác nhân người chơi có thể truy cập chức năng xem kèo đấu công khai để tìm kiếm các trận đấu đang thiếu thành viên trên hệ thống. Từ danh sách này, người chơi xem chi tiết kèo để nắm rõ thông tin sân bãi, thời gian và trình độ, từ đó thực hiện tham gia kèo để đăng ký thi đấu. Đối với các kèo đấu cá nhân, người chơi truy cập chức năng xem kèo của tôi, được phân rã thành hai nhánh cụ thể bao gồm quản lý kèo tham gia và quản lý kèo tôi tạo. Đối với các kèo đã tham gia, người chơi có thể chọn rời kèo khi có thay đổi lịch trình. Đối với các kèo tự tạo, người chơi đóng vai trò chủ trì và có quyền duyệt/xóa thành viên tham gia để chủ động sắp xếp đội hình.

### 2.2.4 Biểu đồ use case phân rã "Quản lý sân và khu phức hợp"

![Biều đồ usecase phân rã 'Quản lý sân và khu phức hợp'](/images/phanraquanlikhuphuchopvasandau.png)

Biểu đồ phân rã "Quản lý sân và khu phức hợp" (Hình 2.4) mô tả các chức năng quản trị cơ sở vật chất dành riêng cho chủ khu phức hợp. Theo đó, tác nhân chủ khu phức hợp thực hiện đăng ký khu phức hợp mới để gửi thông tin cơ sở lên hệ thống chờ phê duyệt. Đối với các cơ sở đã hoạt động, chủ khu phức hợp có thể xem chi tiết khu phức hợp để theo dõi toàn diện trạng thái vận hành. Từ giao diện chi tiết này, tác nhân có thể cập nhật khu phức hợp để thay đổi thông tin chung, thực hiện thêm sân con để mở rộng quy mô, hoặc xem chi tiết sân con để quản lý sâu hơn từng sân đấu. Tại mục chi tiết sân con, chủ khu phức hợp có quyền cập nhật sân con để điều chỉnh thông số kỹ thuật, đồng thời tiến hành thêm/sửa bảng giá nhằm thiết lập mức chi phí linh hoạt theo từng khung giờ và ngày trong tuần.

### 2.2.5 Biểu đồ use case phân rã "Quản lý lịch sử đặt sân"

![Biều đồ usecase phân rã  "Quản lý lịch sử đặt sân"](/images/phanralichsudatsan.png)

Biểu đồ phân rã ở Hình 2.5 mô tả các chức năng theo dõi và xử lý trạng thái lịch đặt sân của hai tác nhân là người chơi và chủ khu phức hợp. Người chơi truy cập chức năng xem lịch sử đặt sân để kiểm tra danh sách các lượt đặt của cá nhân, trong khi chủ khu phức hợp sử dụng chức năng xem danh sách lịch đặt sân để giám sát hoạt động của toàn cơ sở. Từ danh sách hiển thị của cả hai phân hệ, hai tác nhân đều có thể thực hiện xem chi tiết lượt đặt sân để kiểm tra thông tin thời gian, chi phí và trạng thái thanh toán. Từ màn hình chi tiết này, người chơi hoặc chủ khu phức hợp có quyền từ chối/hủy đặt sân trong trường hợp có sự cố hoặc thay đổi lịch trình. Ngoài ra, chủ khu phức hợp còn có quyền thực hiện phê duyệt lượt đặt sân để chính thức xác nhận lịch chơi cho khách hàng.

### 2.2.6 Biểu đồ use case phân rã "Quản lý công nợ và quyết toán"

![Biều đồ usecase phân rã   "Quản lý công nợ và quyết toán"](/images/phanraquanlicongnovaquyettoan.png)

Biểu đồ phân rã ở Hình 2.6 mô tả các chức năng quản lý tài chính và dòng tiền trên nền tảng của quản trị hệ thống. Tác nhân quản trị hệ thống thực hiện xem công nợ đối với chủ sân để giám sát các khoản doanh thu tích lũy từ các lượt đặt sân trực tuyến của từng cơ sở. Đồng thời, quản trị hệ thống truy cập chức năng xem các yêu cầu quyết toán để theo dõi danh sách đề nghị rút tiền từ các chủ sân. Từ danh sách này, quản trị hệ thống có thể tiến hành từ chối yêu cầu nếu phát hiện sai sót, hoặc thực hiện xác nhận, phê duyệt yêu cầu để bắt đầu luồng xử lý chuyển khoản. Quy trình phê duyệt này sẽ bao gồm việc thực hiện quyết toán để chuyển tiền từ tài khoản hệ thống sang tài khoản ngân hàng của chủ sân và cập nhật trạng thái số dư tương ứng.

### 2.2.7 Quy trình nghiệp vụ

Mục 2.2.7 trình bày các quy trình nghiệp vụ cốt lõi của nền tảng dưới dạng sơ đồ hoạt động (Activity Diagram). Các quy trình này chỉ ra trình tự tương tác chi tiết giữa các tác nhân và hệ thống, từ khâu đặt sân, ghép kèo đấu, đến duyệt cơ sở vật chất và quyết toán doanh thu định kỳ.

#### 2.2.7.a Quy trình nghiệp vụ đặt sân và thanh toán
![Quy trình nghiệp vụ đặt sân và thanh toán](/images/quytrinhdatsanvathanhtoan.png)

Sơ đồ quy trình nghiệp vụ đặt sân và thanh toán được thể hiện chi tiết trong Hình 2.7. Quy trình bắt đầu khi người chơi tìm kiếm sân và lựa chọn khung giờ phù hợp trên hệ thống. Tiếp theo bao gồm bước kiểm tra lịch trống của sân con, khởi tạo đơn đặt sân và chuyển hướng người dùng đến cổng thanh toán trực tuyến. Sau khi cổng thanh toán phản hồi kết quả giao dịch thành công, hệ thống tự động cập nhật trạng thái đơn hàng, gửi thông báo đến chủ sân và người chơi, đồng thời tự động ghi nhận doanh thu cho chủ sân để đối soát sau này.

#### 2.2.7.b Quy trình nghiệp vụ tạo và tham gia kèo đấu
![Quy trình nghiệp vụ tạo và tham gia kèo đấu](/images/quytrinhtaovathamgiakeodau.png)

Hình 2.8 mô tả quy trình nghiệp vụ tạo và tham gia kèo đấu trên nền tảng. Sau khi thực hiện đặt sân thành công, người chơi có thể tùy chọn khởi tạo một kèo đấu bằng cách thiết lập các thông tin như tiêu đề kèo, trình độ kỹ năng yêu cầu và số lượng vị trí tuyển thêm. Hệ thống sẽ hiển thị công khai kèo đấu này ở trạng thái mở để những người chơi khác có thể tìm kiếm và tham gia. Mỗi khi có thành viên mới đăng ký tham gia thành công, hệ thống sẽ tự động cập nhật số lượng thành viên, đồng thời tự động đóng kèo nếu đầy đủ thành viên.

#### 2.2.7.c Quy trình nghiệp vụ đăng ký và kích hoạt khu phức hợp
![Quy trình nghiệp vụ đăng ký và kích hoạt khu phức hợp](/images/quytrinhdangkyvakichhoatkhuphuchop.png)

Quy trình đăng ký và duyệt khu phức hợp thể thao được mô tả cụ thể trong Hình 2.9. Đầu tiên, chủ sân sẽ khai báo hồ sơ thông tin khu phức hợp và tải lên các tài liệu chứng minh pháp lý dưới dạng tập tin đính kèm. Admin tiến hành kiểm tra thực tế tính hợp lệ của tài liệu pháp lý để đưa ra quyết định phê duyệt cho phép khu phức hợp đi vào hoạt động chính thức, hoặc từ chối kèm theo lý do phản hồi chi tiết để chủ sân cập nhật lại.

#### 2.2.7.d Quy trình nghiệp vụ đối soát và quyết toán
![Quy trình nghiệp vụ đối soát và quyết toán](/images/quytrinhdoisoatquyettoan.png)

Hình 2.10 minh họa quy trình nghiệp vụ đối soát và quyết toán tài chính định kỳ giữa chủ sân và quản trị viên hệ thống. Dòng doanh thu ròng từ các lượt đặt sân thành công sau khi khấu trừ phí nền tảng sẽ được tích lũy vào tài khoản của chủ sân dưới dạng công nợ chờ xử lý. Khi chủ sân thực hiện tạo yêu cầu quyết toán, hệ thống sẽ tự động tạo một lượt yêu cầu quyết toán. Quản trị viên hệ thống dựa trên yêu cầu này để tiến hành đối soát, thực hiện chuyển tiền qua tài khoản ngân hàng của chủ sân và nhập mã giao dịch làm đối chứng để hoàn thành đợt quyết toán.

## 2.3 Đặc tả chức năng

Mục 2.3 tập trung mô tả chi tiết và làm rõ cách thức tương tác của các tác nhân với hệ thống đặt sân thể thao thông qua các use case cốt lõi. Sáu bảng đặc tả dưới đây sẽ chi tiết hóa các tiền điều kiện, luồng sự kiện chính, các luồng thay thế xử lý ngoại lệ và hậu điều kiện tương ứng, làm cơ sở vững chắc cho các bước thiết kế kiến trúc và xây dựng cơ sở dữ liệu ở các chương sau.

### 2.3.1 Đặc tả use case "Đặt sân"

Bảng 2.1: Đặc tả use case "Đặt sân"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Đặt sân |
| **Tác nhân** | Người chơi (Player) |
| **Mục đích sử dụng** | Tìm kiếm sân trống, đặt giờ chơi, thuê hoặc mua vật phẩm đi kèm và thanh toán trực tuyến. |
| **Tiền điều kiện** | Tài khoản người chơi và sân được chọn đang hoạt động bình thường. |
| **Luồng chính** | 1. Người chơi chọn sân và ngày chơi.<br>2. Hệ thống hiển thị các khung giờ trống và bảng giá thuê.<br>3. Người chơi chọn giờ chơi.<br>4. Hệ thống hiển thị danh sách các vật phẩm đi kèm khả dụng.<br>5. Người chơi chọn số lượng vật phẩm cần mua hoặc thuê và xác nhận.<br>6. Hệ thống kiểm tra giờ trống, tồn kho và tạo lượt đặt tạm thời.<br>7. Hệ thống giữ chỗ trong 10 phút, hiển thị hóa đơn tạm tính.<br>8. Người chơi xác nhận hóa đơn và chọn thanh toán trực tuyến.<br>9. Hệ thống chuyển hướng người chơi đến cổng thanh toán.<br>10. Người chơi thực hiện thanh toán trực tuyến thành công.<br>11. Hệ thống cập nhật trạng thái lịch đặt thành công và gửi thông báo. |
| **Luồng thay thế** | - **Trùng giờ (bước 6):** Hệ thống báo trùng lịch và yêu cầu chọn giờ khác.<br>- **Hết vật phẩm (bước 6):** Hệ thống báo hết hàng và yêu cầu chỉnh sửa số lượng.<br>- **Quá hạn (bước 8-10):** Quá 10 phút giữ chỗ chưa thanh toán, hệ thống tự động hủy lượt đặt tạm thời và khôi phục tồn kho. |
| **Hậu điều kiện** | Lịch đặt được ghi nhận, tồn kho được cập nhật và thông tin thanh toán được lưu trữ. |

Bảng 2.1 chi tiết đặc tả use case đặt sân của người chơi trên hệ thống. Tài liệu này chỉ ra toàn bộ quá trình tìm kiếm sân trống, chọn giờ chơi, mua hoặc thuê thêm các vật phẩm phụ trợ kèm theo, cho đến khi hoàn thành thanh toán trực tuyến qua các cổng thanh toán liên kết và ghi nhận lịch đặt thành công.

### 2.3.2 Đặc tả use case "Tham gia, quản lý kèo đấu" 

Bảng 2.2: Đặc tả use case "Tham gia, quản lý kèo đấu"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Tham gia, quản lý kèo đấu |
| **Tác nhân** | Người chơi (Player) |
| **Mục đích sử dụng** | Tìm kiếm kèo đấu, gửi yêu cầu ghép cặp, duyệt thành viên và rời khỏi kèo đấu. |
| **Tiền điều kiện** | Tài khoản người chơi đang hoạt động bình thường. |
| **Luồng chính** | 1. Người chơi xem danh sách kèo đấu công khai.<br>2. Người chơi chọn kèo đấu phù hợp và nhấn đăng ký tham gia.<br>3. Hệ thống hiển thị biểu mẫu điền thông tin giới thiệu.<br>4. Người chơi nhập thông tin giới thiệu và nhấn gửi yêu cầu.<br>5. Hệ thống kiểm tra thời gian đăng ký và tránh đăng ký trùng kèo.<br>6. Hệ thống ghi nhận yêu cầu chờ duyệt và thông báo cho chủ kèo.<br>7. Chủ kèo truy cập danh sách yêu cầu ứng tuyển của kèo đấu.<br>8. Hệ thống hiển thị danh sách các ứng viên kèm lời giới thiệu.<br>9. Chủ kèo xem xét thông tin và nhấn phê duyệt ứng viên phù hợp.<br>10. Hệ thống cập nhật trạng thái đã tham gia và gửi thông báo xác nhận. |
| **Luồng thay thế** | - **Từ chối ứng viên (bước 10):** Chủ kèo từ chối. Hệ thống cập nhật trạng thái bị từ chối và gửi thông báo cho ứng viên.<br>- **Kèo đấu đủ người (bước 11):** Khi đủ số người chơi, hệ thống tự động khóa đăng ký.<br>- **Rời kèo đấu:** Người chơi xin rời kèo đấu. Hệ thống giải phóng chỗ trống để nhận ứng viên mới. |
| **Hậu điều kiện** | Yêu cầu kèo đấu được cập nhật; số lượng chỗ trống được đồng bộ; thông báo được gửi đến các bên liên quan. |

Bảng 2.2 thể hiện đặc tả use case tham gia và quản lý kèo đấu ghép cặp giao lưu của người chơi. Qua bảng này, luồng tương tác được cụ thể hóa từ bước người chơi đăng ký tham gia, hệ thống thực hiện kiểm tra tránh trùng lịch kèo, đến bước chủ kèo xem thông tin giới thiệu và bấm nút duyệt thành viên vào đội.

### 2.3.3 Đặc tả use case "Quản lý sân và khu phức hợp"

Bảng 2.3: Đặc tả use case "Quản lý sân và khu phức hợp"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Quản lý sân và khu phức hợp |
| **Tác nhân** | Chủ khu phức hợp (Owner) |
| **Mục đích sử dụng** | Đăng ký thông tin khu phức hợp mới, gửi hồ sơ pháp lý kiểm duyệt, thêm các sân con và thiết lập biểu giá hoạt động. |
| **Tiền điều kiện** | Tài khoản của chủ khu phức hợp đang hoạt động bình thường. |
| **Luồng chính** | 1. Chủ sân truy cập phân hệ quản lý khu phức hợp và chọn đăng ký mới.<br>2. Hệ thống hiển thị biểu mẫu điền thông tin khu phức hợp và tài liệu pháp lý.<br>3. Chủ sân nhập thông tin, đính kèm tài liệu sở hữu pháp lý và gửi.<br>4. Hệ thống tải hồ sơ lên và tạo khu phức hợp ở trạng thái chờ duyệt.<br>5. Hệ thống hiển thị danh sách khu phức hợp và thông báo gửi hồ sơ thành công.<br>6. Chủ sân chọn khu phức hợp vừa tạo để thực hiện thêm các sân con.<br>7. Hệ thống hiển thị biểu mẫu thêm sân con (tên, môn thể thao, sức chứa).<br>8. Chủ sân nhập thông tin chi tiết sân con và nhấn xác nhận.<br>9. Hệ thống kiểm tra tên trùng lặp, tạo sân con và mở giao diện cấu hình giá.<br>10. Chủ sân thiết lập các quy tắc biểu giá cụ thể cho các khung giờ và lưu.<br>11. Hệ thống lưu trữ các quy tắc giá và thông báo thiết lập thành công. |
| **Luồng thay thế** | - **Trùng khu phức hợp (bước 4):** Hệ thống báo lỗi trùng tên khu phức hợp và yêu cầu đổi tên.<br>- **Thiếu hồ sơ pháp lý (bước 4):** Hệ thống báo lỗi và yêu cầu đính kèm tài liệu sở hữu hợp lệ.<br>- **Trùng sân con (bước 9):** Hệ thống báo trùng sân con trong cụm và yêu cầu đổi tên khác. |
| **Hậu điều kiện** | Khu phức hợp ở trạng thái chờ duyệt; các sân con và quy tắc bảng giá hoạt động được ghi nhận. |

Bảng 2.3 mô tả chi tiết use case quản lý sân và khu phức hợp thể thao của tác nhân chủ sân. Tiến trình này bao gồm các bước khai báo hồ sơ cụm sân mới đi kèm hồ sơ pháp lý gửi ban quản trị kiểm duyệt, đồng thời chủ sân cũng thực hiện cấu hình danh mục các sân con và thiết lập quy tắc giá thuê theo khung giờ.

### 2.3.4 Đặc tả use case "Quản lý lịch đặt của sân"

Bảng 2.4: Đặc tả use case "Quản lý lịch đặt của sân"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Quản lý lịch đặt của sân |
| **Tác nhân** | Chủ khu phức hợp (Owner) |
| **Mục đích sử dụng** | Theo dõi lịch đặt sân con, duyệt lịch đặt đã thanh toán thành công hoặc hủy lịch đặt sân khi có sự cố. |
| **Tiền điều kiện** | Tài khoản của chủ sân đang hoạt động bình thường. |
| **Luồng chính** | 1. Chủ sân truy cập giao diện quản lý lịch đặt sân.<br>2. Hệ thống hiển thị danh sách lịch đặt được sắp xếp mới nhất.<br>3. Chủ sân thực hiện lọc lịch đặt theo ngày, sân con hoặc trạng thái thanh toán.<br>4. Hệ thống cập nhật hiển thị danh sách lịch đặt phù hợp với điều kiện lọc.<br>5. Chủ sân chọn lượt đặt ở trạng thái chờ xác nhận để xem chi tiết.<br>6. Hệ thống hiển thị tên người chơi, số điện thoại, giờ thuê, sân con và vật phẩm đi kèm.<br>7. Chủ sân nhấn nút phê duyệt lịch đặt sân.<br>8. Hệ thống cập nhật trạng thái lịch đặt sang đã xác nhận.<br>9. Hệ thống tự động gửi thông báo xác nhận đặt sân thành công đến người chơi. |
| **Luồng thay thế** | - **Chủ sân chủ động hủy lịch (bước 7):** Chủ sân chọn nút hủy. Hệ thống cập nhật trạng thái đã hủy, khôi phục tồn kho vật phẩm và thông báo cho người chơi.<br>- **Lịch đặt đã thay đổi trạng thái trước đó (bước 7):** Nếu lịch đặt đã tự động hủy do quá hạn thanh toán, hệ thống báo lỗi và yêu cầu tải lại trang. |
| **Hậu điều kiện** | Trạng thái lịch đặt được cập nhật; tồn kho vật phẩm được khôi phục (nếu hủy); người chơi nhận được thông báo phản hồi. |

Bảng 2.4 cung cấp tài liệu đặc tả use case quản lý lịch đặt sân của chủ sân. Qua đó, chủ sân có thể truy cập danh sách đặt sân của cơ sở mình để thực hiện bộ lọc tìm kiếm nhanh theo ngày hoặc theo tình trạng thanh toán, tiến hành xác nhận các đơn đặt thành công hoặc chủ động hủy đơn khi phát hiện sự cố bất khả kháng.

### 2.3.5 Đặc tả use case "Quản lý đăng ký khu phức hợp"

Bảng 2.5: Đặc tả use case "Quản lý đăng ký khu phức hợp"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Quản lý đăng ký khu phức hợp |
| **Tác nhân** | Quản trị hệ thống (Admin) |
| **Mục đích sử dụng** | Xem xét hồ sơ đăng ký, kiểm duyệt giấy tờ pháp lý đính kèm, kích hoạt hoạt động hoặc từ chối và phản hồi lý do. |
| **Tiền điều kiện** | Tài khoản quản trị viên đang hoạt động bình thường. |
| **Luồng chính** | 1. Quản trị viên truy cập giao diện quản lý khu phức hợp.<br>2. Hệ thống hiển thị danh sách các khu phức hợp trên toàn hệ thống.<br>3. Quản trị viên thực hiện lọc danh sách theo trạng thái chờ phê duyệt.<br>4. Hệ thống cập nhật hiển thị danh sách hồ sơ đang chờ duyệt.<br>5. Quản trị viên chọn một hồ sơ đăng ký cụ thể để xem chi tiết.<br>6. Hệ thống hiển thị thông tin khu phức hợp, thông tin tài khoản chủ sân và tài liệu pháp lý.<br>7. Quản trị viên kiểm tra và đối soát tính xác thực của các tài liệu pháp lý.<br>8. Quản trị viên nhấn nút phê duyệt hồ sơ đăng ký khu phức hợp.<br>9. Hệ thống cập nhật trạng thái khu phức hợp hoạt động chính thức trên nền tảng.<br>10. Hệ thống tự động gửi thông báo chúc mừng hoạt động thành công đến tài khoản của chủ sân. |
| **Luồng thay thế** | - **Từ chối hồ sơ (bước 8):** Quản trị viên nhấn nút từ chối phê duyệt và nhập lý do. Hệ thống cập nhật trạng thái bị từ chối và tự động gửi thông báo lý do cụ thể đến chủ sân.<br>- **Hồ sơ đã được xử lý trước (bước 8):** Nếu hồ sơ đã được xử lý bởi quản trị viên khác trước đó, hệ thống hiển thị thông báo không hợp lệ và yêu cầu tải lại dữ liệu. |
| **Hậu điều kiện** | Trạng thái hoạt động của khu phức hợp được ghi nhận; thông báo phản hồi kết quả được tự động gửi đến chủ sân. |

Bảng 2.5 mô tả chi tiết use case quản lý đăng ký khu phức hợp của ban quản trị hệ thống. Đây là luồng nghiệp vụ quan trọng giúp quản trị viên kiểm tra và xác thực tính hợp pháp của các giấy tờ sở hữu do chủ sân cung cấp trước khi phê duyệt cho phép khu thể thao chính thức đi vào hoạt động kinh doanh trên nền tảng.

### 2.3.6 Đặc tả use case "Quản lý công nợ và quyết toán"

Bảng 2.6: Đặc tả use case "Quản lý công nợ và quyết toán"

| Thành phần đặc tả | Nội dung mô tả chi tiết |
|-------------------|-------------------------|
| **Tên Use Case** | Quản lý công nợ và quyết toán |
| **Tác nhân** | Quản trị hệ thống (Admin) |
| **Mục đích sử dụng** | Tiếp nhận và xử lý các yêu cầu rút tiền của chủ sân, thực hiện cập nhật trạng thái xử lý, đối soát và chuyển tiền. |
| **Tiền điều kiện** | Quản trị viên đã đăng nhập hệ thống; tồn tại yêu cầu rút tiền do chủ sân tạo ở trạng thái chờ duyệt. |
| **Luồng chính** | 1. Quản trị viên truy cập giao diện quản lý quyết toán.<br>2. Hệ thống hiển thị danh sách các yêu cầu chi trả từ các chủ sân.<br>3. Quản trị viên lọc danh sách theo trạng thái chờ duyệt và chọn một yêu cầu để xem chi tiết.<br>4. Hệ thống hiển thị tài khoản thụ hưởng, số tiền quyết toán và mã QR thanh toán.<br>5. Quản trị viên nhấn nút bắt đầu xử lý đợt chi trả.<br>6. Hệ thống ghi nhận thao tác và chuyển trạng thái đợt quyết toán sang **Đang xử lý**.<br>7. Quản trị viên thực hiện chuyển khoản thủ công cho chủ sân thông qua mã QR hoặc thông tin tài khoản.<br>8. Sau khi chuyển tiền thành công, quản trị viên chọn xác nhận đã chuyển khoản.<br>9. Hệ thống hiển thị biểu mẫu yêu cầu nhập mã giao dịch ngân hàng.<br>10. Quản trị viên nhập mã giao dịch ngân hàng và xác nhận hoàn tất.<br>11. Hệ thống cập nhật trạng thái đợt quyết toán sang **Đã thanh toán**, đồng thời gửi thông báo kèm biên lai cho chủ sân. |
| **Luồng thay thế** | - **Từ chối chi trả (bước 5 hoặc bước 8):** Quản trị viên chọn từ chối và nhập lý do. Hệ thống chuyển trạng thái đợt quyết toán sang **Đã hủy**, hoàn trả số tiền về ví tích lũy của chủ sân và gửi thông báo kèm lý do.<br>- **Xem tổng quan số dư ví:** Quản trị viên truy cập tab **Số dư và Ví chủ sân**. Hệ thống hiển thị số dư tích lũy, số dư đang yêu cầu rút và tổng số tiền đã chi trả của từng chủ sân. |
| **Hậu điều kiện** | Trạng thái đợt quyết toán được cập nhật chính xác; tiền quyết toán được chi trả thành công hoặc được hoàn trả về ví tích lũy của chủ sân theo kết quả xử lý. |

Bảng 2.6 thể hiện đặc tả use case quản lý công nợ và quyết toán tài chính của quản trị hệ thống. Quy trình này bao gồm các bước quản trị viên tiếp nhận yêu cầu xin rút tiền tích lũy của chủ sân, thực hiện đối soát các giao dịch đặt sân tương ứng, tiến hành chuyển khoản qua ngân hàng và ghi nhận mã giao dịch để hoàn tất đợt quyết toán.

## 2.4 Yêu cầu phi chức năng

Trong phần này, sinh viên đưa ra các yêu cầu khác nếu có, bao gồm các yêu cầu phi chức năng như hiệu năng, độ tin cậy, tính dễ dùng, tính dễ bảo trì, hoặc các yêu cầu về mặt kỹ thuật như về CSDL, công nghệ sử dụng, v.v.

## Kết luận chương 2

(Phần tổng kết chương này sẽ được tự động hoàn thiện nội dung sau khi viết xong các mục 2.3 và 2.4).

# CHƯƠNG 3. NỀN TẢNG LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 3)
Chương này có độ dài không quá 10 trang. Nếu cần trình bày dài hơn, sinh viên đưa vào phần phụ lục. Chú ý đây là kiến thức đã có sẵn; SV sau khi tìm hiểu được thì phân tích và tóm tắt lại. Sinh viên không trình bày dài dòng, chi tiết.
Với đồ án ứng dụng, sinh viên để tên chương là “Nền tảng lý thuyết và Công
nghệ sử dụng”. Trong chương này, sinh viên giới thiệu về các công nghệ, nền tảng lý thuyết sử dụng trong đồ án. Sinh viên cũng có thể trình bày thêm nền tảng lý thuyết nào đó nếu cần dùng tới.
Với từng công nghệ/nền tảng/lý thuyết được trình bày, sinh viên phải phân tích rõ công nghệ/nền tảng/lý thuyết đó dùng để để giải quyết vấn đề/yêu cầu cụ thể nào ở Chương 2. Hơn nữa, với từng vấn đề/yêu cầu, sinh viên phải liệt kê danh sách các công nghệ/hướng tiếp cận tương tự có thể dùng làm lựa chọn thay thế, rồi giải thích rõ sự lựa chọn của mình.
Lưu ý: Nội dung ĐATN phải có tính chất liên kết, liền mạch, và nhất quán. Vì
vậy, các công nghệ/thuật toán trình bày trong chương này phải khớp với nội dung giới thiệu của sinh viên ở phần trước đó.
Trong chương này, để tăng tính khoa học và độ tin cậy, sinh viên nên chỉ rõ
nguồn kiến thức mình thu thập được ở tài liệu nào, đồng thời đưa tài liệu đó vào trong danh sách tài liệu tham khảo rồi tạo các tham chiếu chéo (xem hướng dẫn ở phụ lục A.7)
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 3)

# CHƯƠNG 4. PHÂN TÍCH THIẾT KẾ, TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG

Chương 3 đã làm rõ các cơ sở lý thuyết và công nghệ nền tảng được áp dụng để xây dựng hệ thống. Trên cơ sở đó, Chương 4 sẽ tập trung vào việc mô tả chi tiết quá trình phân tích thiết kế hệ thống, các phương án triển khai thực tế và kết quả đánh giá thực nghiệm. Nội dung chương bao gồm việc lựa chọn thiết kế kiến trúc tổng quan ở phần 4.1, thiết kế chi tiết cơ sở dữ liệu ở phần 4.2, kết quả xây dựng ứng dụng ở phần 4.3, và quy trình kiểm thử đánh giá tính đúng đắn của hệ thống ở phần 4.4.

## 4.1 Thiết kế kiến trúc

### 4.1.1 Lựa chọn kiến trúc phần mềm

Hệ thống đặt sân thể thao đa chủ thể được thiết kế theo mô hình kiến trúc Khách - Chủ (Client-Server) kết hợp phân chia ba lớp chức năng (3-Tier Architecture). Lý do lựa chọn mô hình này xuất phát từ nhu cầu phân tách độc lập giữa phần giao diện người dùng và phần xử lý logic nghiệp vụ. Cách tiếp cận này giúp nhóm phát triển có thể xây dựng, bảo trì và nâng cấp các thành phần độc lập mà không làm ảnh hưởng đến hoạt động của toàn bộ hệ thống. Mô hình kết nối chi tiết giữa các tầng chức năng được mô tả trực quan tại Biểu đồ thiết kế kiến trúc tổng quan ở phần 4.1.2 (Hình 4.1).

Trong đó, phần xử lý nghiệp vụ phía Backend được tổ chức theo cấu trúc Controller - Service - Repository. Đây là biến thể cải tiến từ mô hình MVC (Model-View-Controller) truyền thống, với phần View được giao hoàn toàn cho ứng dụng Frontend độc lập đảm nhận. Cấu trúc này giúp phân định rõ ràng vai trò của từng lớp mã nguồn: lớp Controller tiếp nhận yêu cầu, lớp Service xử lý nghiệp vụ, và lớp Repository đảm nhận nhiệm vụ tương tác trực tiếp với cơ sở dữ liệu.

Về mặt triển khai thực tế, tầng giao diện (Client) được xây dựng độc lập bằng thư viện React và ngôn ngữ TypeScript. Để tối ưu hóa trải nghiệm người dùng, ứng dụng sử dụng công cụ Zustand Store nhằm quản lý trạng thái tập trung của hệ thống, giúp đồng bộ dữ liệu nhanh chóng giữa các component giao diện. Mọi tương tác của người chơi hay chủ sân sẽ gửi yêu cầu API đến phía Backend thông qua giao thức HTTPS hoặc kết nối thời gian thực bằng Socket.io Client.

Đứng giữa ứng dụng Client và máy chủ Backend là hệ thống máy chủ Nginx Reverse Proxy. Nginx đóng vai trò là cổng điều phối kết nối tập trung, chịu trách nhiệm phân phối ứng dụng web tĩnh đến trình duyệt của người dùng, đồng thời chuyển tiếp các yêu cầu gọi API (Proxy Pass) một cách hợp lý đến máy chủ Express phía sau. Ngoài ra, Nginx cũng xử lý cấu hình WebSockets để duy trì các kết nối thời gian thực ổn định giữa client và server.

Phía máy chủ Backend được triển khai bằng framework Express.js chạy trên môi trường Node.js. Lớp Controller của Backend sử dụng Zod schema để kiểm tra tính hợp lệ của dữ liệu đầu vào. Tiếp đó, lớp Service thực hiện xử lý các nghiệp vụ cốt lõi của đồ án như tự động tính giá sân theo khung giờ, đối soát công nợ hoặc kiểm tra lịch đặt trùng. Để gửi thông tin real-time như thông báo đặt sân hay kèo ghép đấu, hệ thống tích hợp Socket.io Server để giao tiếp trực tiếp với Client.

Tầng lưu trữ của hệ thống sử dụng cơ sở dữ liệu quan hệ PostgreSQL phối hợp với Prisma ORM để tối giản hóa việc viết câu lệnh SQL thủ công. Cơ sở dữ liệu cũng được tích hợp tiện ích mở rộng pgvector nhằm lưu trữ véc-tơ phục vụ thuật toán gợi ý sân đấu. Nhằm tăng tốc độ phản hồi, hệ thống sử dụng thêm bộ đệm Redis để lưu thông tin phiên đăng nhập. Cuối cùng, hệ thống kết nối với các dịch vụ bên thứ ba bao gồm cổng thanh toán Stripe và VNPAY, Cloudinary để lưu ảnh sân, và Nodemailer để gửi email thông báo.

### 4.1.2 Thiết kế tổng quan
![Thiết kế tổng quan](/images/kientruc.png)

### 4.1.3 Thiết kế chi tiết gói

Dựa theo cấu trúc thư mục thực tế của dự án, phần code Backend được chia thành các thư mục (gói) khác nhau để quản lý cho dễ. Cụ thể gồm có: `routes` (quản lý các đường dẫn API), `controllers` (tiếp nhận yêu cầu gửi lên từ client), `validations` (dùng Zod để kiểm tra tính hợp lệ của dữ liệu đầu vào), `services` (chứa toàn bộ code xử lý nghiệp vụ chính), và `repositories` (dùng Prisma Client để truy vấn cơ sở dữ liệu). Việc chia nhỏ này giúp code gọn gàng, luồng chạy rõ ràng từ ngoài vào trong và không bị phụ thuộc chéo lẫn nhau. Dưới đây là sơ đồ gói hệ thống (UML Package Diagram) mô tả các gói code này và mối quan hệ giữa chúng trong Backend:

![Biểu đồ gói hệ thống (UML Package Diagram)](/images/uml_package_diagram.png)
*Hình 4.2. Biểu đồ gói hệ thống (UML Package Diagram)*

## 4.2 Thiết kế chi tiết

### 4.2.1 Thiết kế giao diện

Phần này có độ dài từ hai đến ba trang. Sinh viên đặc tả thông tin về màn hình mà ứng dụng của mình hướng tới, bao gồm độ phân giải màn hình, kích thước màn hình, số lượng màu sắc hỗ trợ, v.v. Tiếp đến, sinh viên đưa ra các thống nhất/chuẩn hóa của mình khi thiết kế giao diện như thiết kế nút, điều khiển, vị trí hiển thị thông điệp phản hồi, phối màu, v.v. Sau cùng sinh viên đưa ra một số hình ảnh minh họa thiết kế giao diện cho các chức năng quan trọng nhất. Lưu ý, sinh viên không nhầm lẫn giao diện thiết kế với giao diện của sản phẩm sau cùng

### 4.2.2 Thiết kế lớp

Thiết kế lớp tập trung vào việc giải thích chi tiết các thuộc tính và hàm xử lý bên trong các file Service chính của Backend. Đây là những nơi xử lý toàn bộ nghiệp vụ quan trọng của hệ thống:

Lớp `BookingService` dùng để xử lý toàn bộ nghiệp vụ liên quan đến việc đặt sân, tính giá tiền và hủy sân của người dùng. Trong code, lớp này khai báo ba thành phần chính là `prisma` (để gọi cơ sở dữ liệu), `redis` (dùng làm bộ nhớ đệm để kiểm tra lịch sân trống nhanh hơn) và `paymentService` (để kết nối với cổng thanh toán Stripe/VNPAY). Để phục vụ cho việc đặt sân, lớp này có các hàm chính bao gồm: `checkAvailability` để kiểm tra xem giờ đó sân có bị trùng lịch hay không, `createBooking` để tạo mới đơn đặt sân và khóa sân tạm thời trong lúc chờ thanh toán, `cancelBooking` để xử lý khi người dùng muốn hủy sân và hoàn lại tiền, và hàm `calculateDynamicPrice` dùng để tính giá sân tự động dựa theo giờ cao điểm hoặc ngày cuối tuần.

Lớp `MatchService` dùng để xử lý các chức năng liên quan đến việc tạo kèo ghép sân và tìm bạn chơi cùng. Lớp này có hai thành phần chính là `prisma` (truy xuất database) và `socketService` (dùng để gửi thông báo thời gian thực cho người dùng qua giao thức Socket.io). Lớp này có các hàm chính như: `createMatch` để tạo một kèo ghép mới, `joinMatch` để xử lý khi có người chơi khác đăng ký tham gia vào kèo, và hàm `getMatchRecommendations` dùng để tìm kiếm và đề xuất các kèo đấu phù hợp xung quanh vị trí của người dùng bằng cách tính toán khoảng cách véc-tơ qua pgvector.

Lớp `PayoutService` dùng để quản lý công nợ, số dư tài khoản của chủ sân và thực hiện việc rút tiền, quyết toán định kỳ. Lớp này kết nối với `prisma` (lưu trữ thông tin công nợ) và `paymentService` (gọi API chuyển khoản). Lớp này có hai hàm cốt lõi là `requestOwnerPayout` để tiếp nhận yêu cầu rút tiền của chủ sân khi họ muốn rút số dư trong ví, và hàm `processPayoutBatch` dùng để tổng hợp nhiều yêu cầu rút tiền thành một đợt quyết toán để hệ thống tự động chuyển khoản về tài khoản ngân hàng của chủ sân.

Dưới đây là sơ đồ lớp chi tiết (UML Class Diagram) biểu diễn mối quan hệ kết hợp và các thành phần tĩnh của các lớp dịch vụ này:

![Biểu đồ lớp các dịch vụ cốt lõi (UML Class Diagram)](/images/uml_class_diagram.png)
*Hình 4.6. Biểu đồ lớp các dịch vụ cốt lõi (UML Class Diagram)*

Để mô tả luồng gọi dữ liệu động và cách các đối tượng trong code truyền nhận thông điệp cho nhau khi chạy các chức năng chính, hệ thống thiết kế các biểu đồ trình tự (UML Sequence Diagram) dưới đây. Đối với chức năng đặt sân, Hình 4.7 mô tả luồng chạy kỹ thuật từ khi người dùng bấm đặt sân trên giao diện React, đi qua bộ định tuyến Nginx, gửi request đến Controller để kiểm tra đầu vào, gọi Service để check lịch trống, kết nối cổng thanh toán trực tuyến và ghi nhận đơn đặt sân thành công vào database. Tương tự, Hình 4.8 mô tả luồng gửi tin nhắn và thông báo kèo ghép sân thời gian thực bằng Socket.io. Cuối cùng, luồng xử lý đối soát và chuyển tiền tự động cho chủ sân được mô tả chi tiết qua biểu đồ trình tự ở Hình 4.9 dưới đây:

![Biểu đồ trình tự nghiệp vụ đặt sân và thanh toán](/images/uml_sequence_booking.png)
*Hình 4.7. Biểu đồ trình tự nghiệp vụ đặt sân và thanh toán (UML Sequence Diagram)*

![Biểu đồ trình tự tạo và tham gia kèo đấu](/images/uml_sequence_match.png)
*Hình 4.8. Biểu đồ trình tự tạo và tham gia kèo đấu (UML Sequence Diagram)*

![Biểu đồ trình tự đối soát quyết toán tài chính](/images/uml_sequence_payout.png)
*Hình 4.9. Biểu đồ trình tự đối soát quyết toán tài chính (UML Sequence Diagram)*

### 4.2.3 Thiết kế cơ sở dữ liệu
![Biểu đổ thực thể liên kết](/images/sports-booking.pdf)

Hệ thống sử dụng hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL làm nền tảng lưu trữ dữ liệu bền vững, phối hợp cùng công cụ Prisma ORM để quản lý các thao tác truy xuất dữ liệu trong mã nguồn. Cấu trúc thực thể liên kết được thiết kế tối ưu hóa nhằm đáp ứng toàn bộ các yêu cầu phi chức năng về tính toàn vẹn dữ liệu, hiệu năng truy vấn và khả năng mở rộng hệ thống.

#### a. Danh mục các thực thể dữ liệu tổng quan

Dưới đây là danh sách toàn bộ các bảng dữ liệu được thiết kế và triển khai trong cơ sở dữ liệu của hệ thống:

| STT | Tên bảng | Mô tả chức năng |
| :---: | :--- | :--- |
| 1 | `Account` | Lưu trữ tài khoản và thông tin cá nhân dùng chung. |
| 2 | `Admin` | Lưu trữ tài khoản quản trị viên hệ thống. |
| 3 | `Owner` | Lưu trữ thông tin đối tác chủ sân và cấu hình thụ hưởng. |
| 4 | `Player` | Lưu trữ thông tin tài khoản người chơi. |
| 5 | `RefreshToken` | Quản lý mã làm mới phiên đăng nhập. |
| 6 | `Complex` | Lưu trữ thông tin khu phức hợp thể thao. |
| 7 | `SubField` | Lưu trữ danh sách các sân đấu con. |
| 8 | `PricingRule` | Thiết lập bảng giá thuê sân theo khung giờ. |
| 9 | `RecurringBooking` | Lưu trữ cấu hình lịch đặt sân định kỳ. |
| 10 | `Booking` | Lưu trữ thông tin giao dịch đặt sân. |
| 11 | `Payment` | Lưu trữ thông tin trạng thái giao dịch thanh toán. |
| 12 | `Notification` | Lưu trữ thông báo hệ thống phân phối cho người dùng. |
| 13 | `Product` | Quản lý sản phẩm bán lẻ và trang thiết bị cho thuê kèm. |
| 14 | `BookingAddon` | Chi tiết sản phẩm thuê kèm của lượt đặt sân. |
| 15 | `Match` | Lưu trữ thông tin kèo đấu ghép cặp. |
| 16 | `MatchParticipant` | Quản lý thành viên đăng ký tham gia kèo ghép đấu. |
| 17 | `Review` | Lưu trữ phản hồi và đánh giá từ phía người chơi. |
| 18 | `OwnerPayout` | Quản lý công nợ và chi tiết doanh thu chi trả cho chủ sân. |
| 19 | `PayoutBatch` | Quản lý các đợt yêu cầu và lịch sử quyết toán tài chính. |

Bảng 4.2: Danh sách các bảng dữ liệu trong hệ thống

Bảng 4.2 liệt kê toàn bộ 19 bảng dữ liệu được thiết kế trong hệ thống nhằm phục vụ cho monorepo. Các bảng này được chia nhóm rõ ràng để quản lý thông tin từ tài khoản người dùng, cơ sở vật chất sân bãi, lịch đặt sân cho đến các nghiệp vụ nâng cao như ghép kèo đấu và đối soát tài chính chủ sân.

#### b. Mô tả chi tiết cấu trúc các bảng quan trọng

Để đảm bảo tính minh bạch và chuẩn hóa trong thiết kế vật lý cơ sở dữ liệu, dưới đây là đặc tả chi tiết cấu trúc trường của các thực thể cốt lõi trong hệ thống:

##### * Thực thể tài khoản người dùng (`Account`)

Bảng `Account` dùng để lưu thông tin cá nhân và tài khoản đăng nhập của tất cả người dùng trong hệ thống (bao gồm Admin, Chủ sân và Người chơi).

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của tài khoản trong hệ thống. |
| 2 | `email` | VARCHAR(255) | Địa chỉ thư điện tử dùng để đăng nhập, có ràng buộc duy nhất (Unique). |
| 3 | `password` | TEXT | Mật khẩu truy cập đã được mã hóa bằng thuật toán băm bảo mật. |
| 4 | `full_name` | VARCHAR(100) | Họ và tên đầy đủ của chủ sở hữu tài khoản. |
| 5 | `phone_number` | VARCHAR(20) | Số điện thoại liên lạc cá nhân phục vụ xác thực giao dịch. |
| 6 | `avatar` | TEXT | Đường dẫn lưu trữ hình ảnh đại diện của người dùng. |
| 7 | `email_verified` | BOOLEAN | Trạng thái xác minh địa chỉ thư điện tử đã hoàn thành hay chưa. |

Bảng 4.3: Mô tả chi tiết cấu trúc bảng Account

Bảng 4.3 mô tả chi tiết các trường của tài khoản, trong đó `email` dùng để đăng nhập và bắt buộc phải là duy nhất, còn `password` là mật khẩu đã được mã hóa. Trường `avatar` lưu đường dẫn ảnh và `email_verified` để kiểm tra tài khoản đã kích hoạt hay chưa.

##### * Thực thể khu phức hợp thể thao (`Complex`)

Bảng `Complex` dùng để lưu thông tin của các khu phức hợp thể thao do các chủ sân đăng ký trên hệ thống.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của khu phức hợp thể thao. |
| 2 | `owner_id` | UUID | Khóa ngoại, liên kết đến chủ thể sở hữu thuộc bảng `Owner`. |
| 3 | `complex_name` | VARCHAR(255) | Tên thương mại hiển thị của khu phức hợp thể thao trên nền tảng. |
| 4 | `complex_address` | TEXT | Địa chỉ địa lý chi tiết phục vụ chức năng tìm kiếm định vị. |
| 5 | `status` | ComplexStatus | Trạng thái kiểm duyệt và vận hành (DRAFT, PENDING, ACTIVE, REJECTED). |
| 6 | `verification_docs` | JSON | Lưu trữ chứng từ pháp lý đính kèm chứng minh quyền sở hữu khu đất. |
| 7 | `sport_types` | VARCHAR[] | Mảng lưu trữ danh sách các môn thể thao được hỗ trợ tại tổ hợp. |
| 8 | `avg_rating` | DECIMAL(3,2) | Điểm số đánh giá trung bình phản hồi từ phía khách hàng. |

Bảng 4.4: Mô tả chi tiết cấu trúc bảng Complex

Bảng 4.4 cho thấy thông tin khu phức hợp sẽ liên kết với tài khoản chủ sân qua trường `owner_id`. Trường `verification_docs` dùng để lưu các file giấy tờ pháp lý dưới dạng JSON để Admin đối chiếu trước khi duyệt trạng thái hoạt động ở trường `status`.

##### * Thực thể lịch đặt sân đấu (`Booking`)

Bảng `Booking` dùng để lưu trữ thông tin các lượt đặt sân của khách hàng, giúp quản lý lịch đá và tiền thuê sân.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của lượt đặt sân. |
| 2 | `start_time` | TIMESTAMPTZ | Thời điểm bắt đầu sử dụng sân con (hỗ trợ múi giờ thực tế). |
| 3 | `end_time` | TIMESTAMPTZ | Thời điểm kết thúc sử dụng sân con (hỗ trợ múi giờ thực tế). |
| 4 | `total_price` | DECIMAL(12,2) | Tổng số tiền cần thanh toán cho lượt thuê (sau khi tính biểu giá và addon). |
| 5 | `status` | BookingStatus | Trạng thái xử lý lượt đặt (PENDING, CONFIRMED, CANCELED, COMPLETED). |
| 6 | `player_id` | UUID | Khóa ngoại, liên kết đến tài khoản người chơi thuộc bảng `Player`. |
| 7 | `sub_field_id` | UUID | Khóa ngoại, liên kết đến đối tượng sân đấu con thuộc bảng `SubField`. |
| 8 | `payment_id` | UUID | Khóa ngoại, tham chiếu đến giao dịch thanh toán thuộc bảng `Payment`. |
| 9 | `recurring_booking_id` | UUID | Khóa ngoại, tham chiếu đến cấu hình đặt định kỳ thuộc bảng `RecurringBooking`. |

Bảng 4.5: Mô tả chi tiết cấu trúc bảng Booking

Bảng 4.5 thể hiện chi tiết một lượt đặt sân, lưu cụ thể thời gian bắt đầu và kết thúc qua `start_time`, `end_time` để tránh bị trùng lịch. Trường `total_price` là tổng tiền khách phải trả, và các trường `player_id`, `sub_field_id` liên kết trực tiếp tới người chơi và sân con được đặt.

##### * Thực thể sân đấu thành viên (`SubField`)

Bảng `SubField` dùng để lưu thông tin các sân con (sân 5, sân 7...) nằm bên trong một khu phức hợp thể thao.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của đối tượng sân con. |
| 2 | `complex_id` | UUID | Khóa ngoại, liên kết đến khu phức hợp quản lý thuộc bảng `Complex`. |
| 3 | `sub_field_name` | VARCHAR(255) | Tên định danh hiển thị của sân đấu thành viên. |
| 4 | `capacity` | SMALLINT | Sức chứa tối đa của người chơi thi đấu trên sân. |
| 5 | `sub_field_image` | TEXT | Đường dẫn lưu trữ hình ảnh thực tế của sân đấu con. |
| 6 | `sport_type` | SportType | Loại hình bộ môn thể thao tương thích của sân đấu. |
| 7 | `isDelete` | BOOLEAN | Đánh dấu trạng thái xóa mềm để lưu vết dữ liệu lịch sử. |
| 8 | `avg_rating` | DECIMAL(3,2) | Điểm số đánh giá chất lượng trung bình từ người chơi. |
| 9 | `embedding` | vector(8) | Véc-tơ đặc trưng 8 chiều phục vụ chức năng tìm kiếm gợi ý sân nâng cao. |
| 10 | `embedding_updated_at` | TIMESTAMPTZ | Thời gian cập nhật gần nhất của véc-tơ đặc trưng tương ứng. |

Bảng 4.6: Mô tả chi tiết cấu trúc bảng SubField

Bảng 4.6 chi tiết cấu trúc của sân con, liên kết với khu phức hợp qua `complex_id` và phân loại môn thể thao qua `sport_type`. Trường `embedding` lưu các chỉ số dạng véc-tơ để chạy thuật toán tìm kiếm và đề xuất sân cho người chơi.

##### * Thực thể kèo ghép đấu thể thao (`Match`)

Bảng `Match` dùng để lưu thông tin các kèo ghép do người chơi tạo ra để tìm thêm đối thủ hoặc đồng đội đá cùng.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của kèo đấu ghép cặp. |
| 2 | `booking_id` | UUID | Khóa ngoại, liên kết trực tiếp đến lượt đặt sân thuộc bảng `Booking`. |
| 3 | `creator_id` | UUID | Khóa ngoại, định danh người chơi khởi tạo kèo đấu thuộc bảng `Player`. |
| 4 | `sport_type` | SportType | Phân loại bộ môn thi đấu thể thao của kèo ghép cặp. |
| 5 | `skill_level` | MatchSkillLevel | Tiêu chuẩn trình độ yêu cầu đối với thành viên (BEGINNER, INTERMEDIATE, ADVANCED). |
| 6 | `title` | VARCHAR(200) | Tiêu đề mô tả ngắn gọn thông tin về kèo đấu ghép cặp. |
| 7 | `slots_needed` | SMALLINT | Tổng số lượng vị trí tuyển thêm cần thiết của trận đấu. |
| 8 | `slots_filled` | SMALLINT | Số lượng thành viên đăng ký đã được chấp thuận tham gia kèo. |
| 9 | `status` | MatchStatus | Trạng thái tuyển thành viên (OPEN, FULL, CLOSED, EXPIRED, CANCELED). |

Bảng 4.7: Mô tả chi tiết cấu trúc bảng Match

Bảng 4.7 mô tả các thông tin của kèo ghép, liên kết trực tiếp với lượt đặt sân qua `booking_id` và người tạo qua `creator_id`. Hai trường `slots_needed` và `slots_filled` dùng để theo dõi số lượng người chơi còn thiếu của kèo đấu.

##### * Thực thể đối soát dòng tiền giao dịch (`OwnerPayout`)

Bảng `OwnerPayout` dùng để ghi nhận doanh thu và đối soát tiền nong của từng đơn đặt sân để chi trả cho chủ sân.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của bản ghi giao dịch dòng tiền. |
| 2 | `owner_id` | UUID | Khóa ngoại, tham chiếu đến chủ sở hữu nhận thụ hưởng thuộc bảng `Owner`. |
| 3 | `payment_id` | UUID | Khóa ngoại, liên kết đến hóa đơn thanh toán gốc thuộc bảng `Payment`. |
| 4 | `batch_id` | UUID | Khóa ngoại, tham chiếu đến đợt quyết toán tài chính thuộc bảng `PayoutBatch`. |
| 5 | `total_amount` | DECIMAL(12,2) | Tổng doanh thu thô chưa khấu trừ phí dịch vụ của lượt giao dịch. |
| 6 | `platform_fee` | DECIMAL(12,2) | Khoản phí trung gian được khấu trừ giữ lại cho hệ thống (theo cấu hình tỷ lệ %). |
| 7 | `payout_amount` | DECIMAL(12,2) | Doanh thu ròng thực nhận của đối tác chủ sân sau khi đã khấu trừ phí. |
| 8 | `status` | PayoutStatus | Trạng thái quyết toán dòng tiền của giao dịch (PENDING, REQUESTED, PAID, CANCELLED). |

Bảng 4.8: Mô tả chi tiết cấu trúc bảng OwnerPayout

Bảng 4.8 mô tả chi tiết việc phân chia tiền của từng đơn đặt sân, trong đó `total_amount` là tiền khách trả, `platform_fee` là phí hệ thống thu (10%) và `payout_amount` là số tiền thực nhận của chủ sân.

##### * Thực thể đợt quyết toán tài chính (`PayoutBatch`)

Bảng `PayoutBatch` dùng để quản lý các đợt chuyển tiền quyết toán định kỳ từ hệ thống cho chủ sân.

| STT | Tên trường | Kiểu dữ liệu | Mô tả |
| :---: | :--- | :--- | :--- |
| 1 | `id` | UUID | Khóa chính, định danh duy nhất của đợt quyết toán tài chính. |
| 2 | `owner_id` | UUID | Khóa ngoại, định danh chủ sân nhận tiền thuộc bảng `Owner`. |
| 3 | `total_payout` | DECIMAL(12,2) | Tổng số tiền thực tế hệ thống thực hiện quyết toán chi trả cho chủ sân. |
| 4 | `status` | PayoutStatus | Trạng thái xử lý quyết toán (REQUESTED, PROCESSING, PAID, CANCELLED). |
| 5 | `payout_period` | VARCHAR(50) | Tiêu đề hiển thị của đợt quyết toán. |
| 6 | `transaction_ref` | VARCHAR(255) | Mã giao dịch đối soát ngân hàng phục vụ lưu trữ biên lai chuyển khoản thủ công. |
| 7 | `note` | TEXT | Ghi chú phản hồi đối soát chi tiết của quản trị viên hệ thống. |

Bảng 4.9: Mô tả chi tiết cấu trúc bảng PayoutBatch

Bảng 4.9 chi tiết thông tin đợt quyết toán tiền, gom các yêu cầu rút tiền của chủ sân qua `owner_id`. Trường `transaction_ref` dùng để lưu mã giao dịch của ngân hàng khi Admin thực hiện chuyển khoản thành công.

## 4.3 Xây dựng ứng dụng

### 4.3.1 Thư viện và công cụ sử dụng

Sinh viên liệt kê các công cụ, ngôn ngữ lập trình, API, thư viện, IDE, công cụ kiểm thử, v.v. mà mình sử dụng để phát triển ứng dụng. Mỗi công cụ phải được chỉ rõ phiên bản sử dụng. SV nên kẻ bảng mô tả tương tự như Bảng ??. Nếu có nhiều nội dung trình bày, sinh viên cần xoay ngang bảng.
Mục đích | Công cụ | Địa chỉ URL
|----------|---------|-------------|
| IDE lập trình | Eclipse Oxygen a64 bit | http://www.eclipse.org/ |
| v.v. | v.v. | v.v. |
Bảng 4.1: Danh sách thư viện và công cụ sử dụng

### 4.3.2 Kết quả đạt được

Sinh viên trước tiên mô tả kết quả đạt được của mình là gì, ví dụ như các sản phẩm được đóng gói là gì, bao gồm những thành phần nào, ý nghĩa, vai trò?
Sinh viên cần thống kê các thông tin về ứng dụng của mình như: số dòng code,
số lớp, số gói, dung lượng toàn bộ mã nguồn, dung lượng của từng sản phẩm đóng gói, v.v. Tương tự như phần liệt kê về công cụ sử dụng, sinh viên cũng nên dùng bảng để mô tả phần thông tin thống kê này

### 4.3.3 Minh họa các chức năng chính

Sinh viên lựa chọn và đưa ra màn hình cho các chức năng chính, quan trọng, và thú vị nhất. Mỗi giao diện cần phải có lời giải thích ngắn gọn. Khi giải thích, sinh viên có thể kết hợp với các chú thích ở trong hình ảnh giao diện

## 4.4 Kiểm thử

Phần này có độ dài từ hai đến ba trang. Sinh viên thiết kế các trường hợp kiểm thử cho hai đến ba chức năng quan trọng nhất. Sinh viên cần chỉ rõ các kỹ thuật kiểm thử đã sử dụng. Chi tiết các trường hợp kiểm thử khác, nếu muốn trình bày, sinh viên đưa vào phần phụ lục. Sinh viên sau cùng tổng kết về số lượng các trường hợp kiểm thử và kết quả kiểm thử. Sinh viên cần phân tích lý do nếu kết quả kiểm thử không đạt.

## 4.5 Triển khai

Sinh viên trình bày mô hình và/hoặc cách thức triển khai thử nghiệm/thực tế.
Ứng dụng của sinh viên được triển khai trên server/thiết bị gì, cấu hình như thế
nào. Kết quả triển khai thử nghiệm nếu có (số lượng người dùng, số lượng truy cập,
thời gian phản hồi, phản hồi người dùng, khả năng chịu tải, các thống kê, v.v.)
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 4)

# CHƯƠNG 5. CÁC GIẢI PHÁP VÀ ĐÓNG GÓP NỔI BẬT

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 5)
Chương này có độ dài tối thiểu 5 trang, tối đa không giới hạn.1 Sinh viên cần trình bày tất cả những nội dung đóng góp mà mình thấy tâm đắc nhất trong suốt quá trình làm ĐATN. Đó có thể là một loạt các vấn đề khó khăn mà sinh viên đã từng bước giải quyết được, là giải thuật cho một bài toán cụ thể, là giải pháp tổng quát cho một lớp bài toán, hoặc là mô hình/kiến trúc hữu hiệu nào đó được sinh viên thiết kế.
Chương này là cơ sở quan trọng để các thầy cô đánh giá sinh viên. Vì vậy, sinh viên cần phát huy tính sáng tạo, khả năng phân tích, phản biện, lập luận, tổng quát hóa vấn đề và tập trung viết cho thật tốt. Mỗi giải pháp hoặc đóng góp của sinh viên cần được trình bày trong một mục độc lập bao gồm ba mục con: (i) dẫn dắt/giới thiệu về bài toán/vấn đề, (ii) giải pháp, và (iii) kết quả đạt được (nếu có).
Sinh viên lưu ý không trình bày lặp lại nội dung. Những nội dung đã trình bày chi tiết trong các chương trước không được trình bày lại trong chương này. Vì vậy, với nội dung hay, mang tính đóng góp/giải pháp, sinh viên chỉ nên tóm lược/mô tả sơ bộ trong các chương trước, đồng thời tạo tham chiếu chéo tới đề mục tương ứng trong Chương 5 này. Chi tiết thông tin về đóng góp/giải pháp được trình bày trong mục đó.
Ví dụ, trong Chương 4, sinh viên có thiết kế được kiến trúc đáng lưu ý gì đó, là sự kết hợp của các kiến trúc MVC, MVP, SOA, v.v. Khi đó, sinh viên sẽ chỉ mô tả ngắn gọn kiến trúc đó ở Chương 4, rồi thêm các câu có dạng: “Chi tiết về kiến trúc này sẽ được trình bày trong phần 5.1"
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 5)

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 6)

## 6.1 Kết luận

Sinh viên so sánh kết quả nghiên cứu hoặc sản phẩm của mình với các nghiên
cứu hoặc sản phẩm tương tự.
Sinh viên phân tích trong suốt quá trình thực hiện ĐATN, mình đã làm được
gì, chưa làm được gì, các đóng góp nổi bật là gì, và tổng hợp những bài học kinh
nghiệm rút ra nếu có

## 6.2 Hướng phát triển

Trong phần này, sinh viên trình bày định hướng công việc trong tương lai để
hoàn thiện sản phẩm hoặc nghiên cứu của mình.
Trước tiên, sinh viên trình bày các công việc cần thiết để hoàn thiện các chức
năng/nhiệm vụ đã làm. Sau đó sinh viên phân tích các hướng đi mới cho phép cải
thiện và nâng cấp các chức năng/nhiệm vụ đã làm.
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 6)
