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

Phần còn lại của báo cáo đồ án tốt nghiệp này được tổ chức như sau.
Chương 2 trình bày về v.v.
Trong Chương 3, em/tôi giới thiệu về v.v.
Chú ý: Sinh viên cần viết mô tả thành đoạn văn đầy đủ về nội dung chương.
Tuyệt đối không viết ý hay gạch đầu dòng. Chương 1 không cần mô tả trong phần
này.
Ví dụ tham khảo mô tả chương trong phần bố cục đồ án tốt nghiệp: Chương \*\*\*
trình bày đóng góp chính của đồ án, đó là một nền tảng ABC cho phép khai phá và
tích hợp nhiều nguồn dữ liệu, trong đó mỗi nguồn dữ liệu lại có định dạng đặc thù
riêng. Nền tảng ABC được phát triển dựa trên khái niệm DEF, là các module ngữ
nghĩa trợ giúp người dùng tìm kiếm, tích hợp và hiển thị trực quan dữ liệu theo mô hình cộng tác và mô hình phân tán.
Chú ý: Trong phần nội dung chính, mỗi chương của đồ án nên có phần Tổng
quan và Kết chương. Hai phần này đều có định dạng văn bản “Normal”, sinh viên
không cần tạo định dạng riêng, ví dụ như không in đậm/in nghiêng, không đóng
khung, v.v.
Trong phần Tổng quan của chương N, sinh viên nên có sự liên kết với chương
N-1 rồi trình bày sơ qua lý do có mặt của chương N và sự cần thiết của chương này
trong đồ án. Sau đó giới thiệu những vấn đề sẽ trình bày trong chương này là gì,
trong các đề mục lớn nào.
Ví dụ về phần Tổng quan: Chương 3 đã thảo luận về nguồn gốc ra đời, cơ sở lý
thuyết và các nhiệm vụ chính của bài toán tích hợp dữ liệu. Chương 4 này sẽ trình
bày chi tiết các công cụ tích hợp dữ liệu theo hướng tiếp cận “mashup”. Với mục
đích và phạm vi của đề tài, sáu nhóm công cụ tích hợp dữ liệu chính được trình
bày bao gồm: (i) nhóm công cụ ABC trong phần 4.1, (ii) nhóm công cụ DEF trong
phần 4.2, nhóm công cụ GHK trong phần 4.3, v.v.
Trong phần Kết chương, sinh viên đưa ra một số kết luận quan trọng của chương.
Những vấn đề mở ra trong Tổng quan cần được tóm tắt lại nội dung và cách giải
quyết/thực hiện như thế nào. Sinh viên lưu ý không viết Kết chương giống hệt Tổng
quan. Sau khi đọc phần Kết chương, người đọc sẽ nắm được sơ bộ nội dung và giải
pháp cho các vấn đề đã trình bày trong chương. Trong Kết chương, Sinh viên nên
có thêm câu liên kết tới chương tiếp theo.
Ví dụ về phần Kết chương: Chương này đã phân tích chi tiết sáu nhóm công cụ
tích hợp dữ liệu. Nhóm công cụ ABC và DEF thích hợp với những bài toán tích
hợp dữ liệu phạm vi nhỏ. Trong khi đó, nhóm công cụ GHK lại chứng tỏ thế mạnh
của mình với những bài toán cần độ chính xác cao, v.v. Từ kết quả nghiên cứu và
phân tích về sáu nhóm công cụ tích hợp dữ liệu này, tôi đã thực hiện phát triển phần
mềm tự động bóc tách và tích hợp dữ liệu sử dụng nhóm công cụ GHK. Phần này
được trình bày trong chương tiếp theo – Chương 5

# CHƯƠNG 2. KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU (Chương này có độ dài từ 9 đến 11 trang.)

Chương này trình bày chi tiết quá trình khảo sát hiện trạng, phân tích yêu cầu phần mềm và mô hình hóa các chức năng cốt lõi của nền tảng. Nội dung chương bao gồm việc xác định các tác nhân, xây dựng biểu đồ use case từ mức tổng quát đến phân rã chi tiết, và định nghĩa các yêu cầu phi chức năng. Thông qua phân tích này, hệ thống được định hình rõ ràng về mặt hành vi, tương tác và các ràng buộc kỹ thuật.

## 2.1 Khảo sát hiện trạng

Thông thường, khảo sát chi tiết về hiện trạng và yêu cầu của phần mềm sẽ được
lấy từ ba nguồn chính, đó là (i) người dùng/khách hàng, (ii) các hệ thống đã có,
(iii) và các ứng dụng tương tự. Sinh viên cần tiến hành phân tích, so sánh, đánh giá
chi tiết ưu nhược điểm của các sản phẩm/nghiên cứu hiện có. Sinh viên có thể lập
bảng so sánh nếu cần thiết. Kết hợp với khảo sát người dùng/khách hàng (nếu có),
sinh viên nêu và mô tả sơ lược các tính năng phần mềm quan trọng cần phát triển.

## 2.2 Tổng quan chức năng

Sau khi xác định mục tiêu và phạm vi ở Chương 1, mục 2.2 trình bày tổng quan các chức năng của nền tảng ở mức cao. Nội dung tập trung vào phạm vi nghiệp vụ mà từng nhóm người dùng có thể tiếp cận, chưa đi vào luồng sự kiện hay điều kiện chi tiết của từng chức năng; phần đặc tả sẽ được trình bày tại mục 2.3.

Hệ thống được tổ chức theo bốn nhóm tác nhân tương tác với các phân hệ chức năng tương ứng. Đối với khách vãng lai, phân hệ tra cứu công khai cho phép xem thông tin cụm sân, sân con, khung giá, khả dụng theo thời gian, đánh giá và danh sách kèo giao lưu mà không bắt buộc đăng nhập; đồng thời người dùng có thể đăng ký, đăng nhập hoặc đăng xuất để chuyển sang vai trò người chơi. Đối với người chơi, phân hệ đặt chỗ và giao dịch hỗ trợ đặt sân đơn lẻ hoặc chuỗi định kỳ, thanh toán trực tuyến, mua sản phẩm kèm theo booking, theo dõi và hủy lịch đặt, đánh giá sau sử dụng, tham gia hoặc rời kèo giao lưu, nhận thông báo và xem gợi ý sân cá nhân hóa. Đối với chủ sân, phân hệ vận hành cho phép quản lý khu phức hợp, sân con, quy tắc giá, danh mục sản phẩm, lịch đặt, xác nhận booking, theo dõi doanh thu, khai báo tài khoản ngân hàng và yêu cầu quyết toán. Đối với quản trị viên, phân hệ giám sát hỗ trợ duyệt đăng ký cụm sân, quản lý trạng thái người dùng và cơ sở, theo dõi giao dịch, xử lý quyết toán và tổng hợp báo cáo.

Bên cạnh các chức năng gắn với từng vai trò, hệ thống còn có các chức năng nền phục vụ vận hành liên tục. Cơ chế kiểm soát tranh chấp khi nhiều người cùng đặt một sân được tích hợp vào luồng tạo và cập nhật booking. Các tác vụ định kỳ đảm nhiệm hủy phiên đặt quá hạn, dọn chuỗi đặt định kỳ hết hiệu lực, gửi nhắc lịch, đồng bộ trạng thái kèo giao lưu và làm mới dữ liệu phục vụ gợi ý. Nhờ cách phân tách này, phần mềm vừa bao phủ nghiệp vụ tương tác trực tiếp, vừa duy trì tính nhất quán dữ liệu theo thời gian.

Mối quan hệ giữa các tác nhân và các use case chính được mô hình hóa bằng biểu đồ use case tổng quát tại mục 2.2.1; các use case quan trọng sẽ được phân rã và đặc tả chi tiết ở các mục tiếp theo.

### 2.2.1 Biểu đồ use case tổng quát

Biểu đồ use case tổng quát (Hình 2.1) mô tả ranh giới hệ thống và các tương tác chính giữa bốn tác nhân với nền tảng quản lý và đặt lịch sân thể thao. Mô hình này là cơ sở để thống nhất tên gọi và phạm vi các chức năng trước khi phân rã ở mục 2.2.2 và đặc tả ở mục 2.3.

![Biều đồ usecase tổng quan](/images/BieudoUseCaseTongQuan.png)

Khách vãng lai là người truy cập chưa đăng nhập hoặc chưa có vai trò nghiệp vụ trong hệ thống. Tác nhân này tra cứu cụm sân, sân con, giá và tình trạng còn trống; xem đánh giá và danh sách kèo giao lưu công khai; thực hiện đăng ký, đăng nhập hoặc đăng xuất. Các use case này tạo điều kiện thu thập thông tin trước khi người dùng chuyển sang các nghiệp vụ yêu cầu xác thực.

Người chơi là người dùng đã xác thực với vai trò PLAYER. Tác nhân này có thể tạo một lượt đặt sân hoặc tạo chuỗi đặt định kỳ; thực hiện thanh toán qua cổng trực tuyến; mua thêm vật phẩm gắn với booking; xem lịch sử đặt sân, hủy đặt sân và đánh giá sân sau khi sử dụng; tạo kèo, tham gia hoặc rời kèo giao lưu; xem gợi ý sân và nhận thông báo. 

Chủ sân là người dùng đã xác thực với vai trò OWNER, chịu trách nhiệm vận hành một hoặc nhiều khu phức hợp. Tác nhân này quản lý khu phức hợp và sân con; thiết lập bảng giá theo khung giờ và ngày trong tuần; quản lý danh mục vật phẩm bán kèm; xem lịch đặt của sân; xác nhận hoặc từ chối booking; theo dõi thống kê doanh thu; khai báo tài khoản ngân hàng và gửi yêu cầu quyết toán đối với giao dịch thu qua VNPay.

Quản trị viên là người dùng với vai trò ADMIN, có quyền giám sát toàn nền tảng. Tác nhân này duyệt hoặc từ chối đăng ký khu phức hợp mới; quản lý trạng thái tài khoản người chơi, chủ sân và quản trị viên; theo dõi giao dịch; xử lý đối soát và các đợt quyết toán cho chủ sân; xem thống kê và lập báo cáo tổng hợp.

### 2.2.2 Biểu đồ use case phân rã "Đặt sân"

![Biều đồ usecase phân rã 'Đặt sân'](/images/phanradatsan.png)

### 2.2.3 Biểu đồ use case phân rã "Tham gia, Quản lý kèo đấu"

![Biều đồ usecase phân rã 'Tham gia, Quản lý kèo đấu'](/images/phanraquanlikeodau.png)

### 2.2.4 Biểu đồ use case phân rã "Quản lý sân và khu phức hợp"

![Biều đồ usecase phân rã 'Quản lý sân và khu phức hợp'](/images/phanraquanlikhuphuchopvasandau.png)

### 2.2.5 Biểu đồ use case phân rã  "Quản lý lịch sử đặt sân"

![Biều đồ usecase phân rã  "Quản lý lịch sử đặt sân"](/images/phanralichsudatsan.png)

### 2.2.6

![Biều đồ usecase phân rã   "Quản lý công nợ và quyết toán"](/images/phanraquanlicongnovaquyettoan.png)

### 2.2.7 Quy trình nghiệp vụ

Nếu sản phẩm/hệ thống cần xây dựng có quy trình nghiệp vụ quan trọng/đáng
chú ý, sinh viên cần mô tả và vẽ biểu đồ hoạt động minh họa quy trình nghiệp vụ
đó. Sinh viên lưu ý đây không phải là luồng sự kiện của từng use case, mà là luồng
hoạt động kết hợp nhiều use case để thực hiện một nghiệp vụ nào đó.
Ví dụ, một hệ thống quản lý thư viện có quy trình nghiệp vụ mượn trả với mô tả
sơ bộ như sau: Sinh viên làm thẻ mượn, sau đó sinh viên đăng ký mượn sách, thủ
thư cho mượn, và cuối cùng sinh viên trả lại sách cho thư viện. Một hệ thống có
thể có một vài quy trình nghiệp vụ quan trọng như vậy.

## 2.3 Đặc tả chức năng

Sinh viên lựa chọn từ 4 đến 7 use case quan trọng nhất của đồ án để đặc tả chi
tiết. Mỗi đặc tả bao gồm ít nhất các thông tin sau: (i) Tên use case, (ii) Luồng sự
kiện (chính và phát sinh), (iii) Tiền điều kiện, và (iv) Hậu điều kiện. Sinh viên chỉ
vẽ bổ sung biểu đồ hoạt động khi đặc tả use case phức tạp.

### 2.3.1 Đặc tả use case A

### 2.3.2 Đặc tả use case B

## 2.4 Yêu cầu phi chức năng

Trong phần này, sinh viên đưa ra các yêu cầu khác nếu có, bao gồm các yêu cầu
phi chức năng như hiệu năng, độ tin cậy, tính dễ dùng, tính dễ bảo trì, hoặc các yêu
cầu về mặt kỹ thuật như về CSDL, công nghệ sử dụng, v.v.

## Kết luận chương 2

(Phần tổng kết chương này sẽ được tự động hoàn thiện nội dung sau khi viết xong các mục 2.3 và 2.4).

# CHƯƠNG 3. NỀN TẢNG LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 3)
Chương này có độ dài không quá 10 trang. Nếu cần trình bày dài hơn, sinh viên
đưa vào phần phụ lục. Chú ý đây là kiến thức đã có sẵn; SV sau khi tìm hiểu được
thì phân tích và tóm tắt lại. Sinh viên không trình bày dài dòng, chi tiết.
Với đồ án ứng dụng, sinh viên để tên chương là “Nền tảng lý thuyết và Công
nghệ sử dụng”. Trong chương này, sinh viên giới thiệu về các công nghệ, nền tảng
lý thuyết sử dụng trong đồ án. Sinh viên cũng có thể trình bày thêm nền tảng lý
thuyết nào đó nếu cần dùng tới.
Với từng công nghệ/nền tảng/lý thuyết được trình bày, sinh viên phải phân tích
rõ công nghệ/nền tảng/lý thuyết đó dùng để để giải quyết vấn đề/yêu cầu cụ thể nào
ở Chương 2. Hơn nữa, với từng vấn đề/yêu cầu, sinh viên phải liệt kê danh sách các
công nghệ/hướng tiếp cận tương tự có thể dùng làm lựa chọn thay thế, rồi giải thích
rõ sự lựa chọn của mình.
Lưu ý: Nội dung ĐATN phải có tính chất liên kết, liền mạch, và nhất quán. Vì
vậy, các công nghệ/thuật toán trình bày trong chương này phải khớp với nội dung
giới thiệu của sinh viên ở phần trước đó.
Trong chương này, để tăng tính khoa học và độ tin cậy, sinh viên nên chỉ rõ
nguồn kiến thức mình thu thập được ở tài liệu nào, đồng thời đưa tài liệu đó vào
trong danh sách tài liệu tham khảo rồi tạo các tham chiếu chéo (xem hướng dẫn ở
phụ lục A.7)
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 3)

# CHƯƠNG 4. PHÂN TÍCH THIẾT KẾ, TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 4)

## 4.1 Thiết kế kiến trúc

### 4.1.1 Lựa chọn kiến trúc phần mềm

Mục này có độ dài từ một đến ba trang. Sinh viên cần lựa chọn kiến trúc phần
mềm cho ứng dụng của mình như: kiến trúc ba lớp MVC, MVP, SOA, Microservice, v.v. rồi giải thích sơ bộ về kiến trúc đó (không giải thích chi tiết/dài dòng). Sử
dụng kiến trúc phần mềm đã chọn ở trên, sinh viên mô tả kiến trúc cụ thể cho ứng
dụng của mình. Gợi ý: sinh viên áp dụng lý thuyết chung vào hệ thống/sản phẩm
của mình như thế nào, có thay đổi, bổ sung hoặc cải tiến gì không. Ví dụ, thành
phần M trong kiến trúc lý thuyết MVC sẽ là những thành phần cụ thể nào (ví dụ: là
interface I + class C1 + class C2, v.v.) trong kiến trúc phần mềm của sinh viên.

### 4.1.2 Thiết kế tổng quan

### 4.1.3 Thiết kế chi tiết gói

## 4.2 Thiết kế chi tiết

### 4.2.1 Thiết kế giao diện

Phần này có độ dài từ hai đến ba trang. Sinh viên đặc tả thông tin về màn hình
mà ứng dụng của mình hướng tới, bao gồm độ phân giải màn hình, kích thước màn
hình, số lượng màu sắc hỗ trợ, v.v. Tiếp đến, sinh viên đưa ra các thống nhất/chuẩn
hóa của mình khi thiết kế giao diện như thiết kế nút, điều khiển, vị trí hiển thị thông
điệp phản hồi, phối màu, v.v. Sau cùng sinh viên đưa ra một số hình ảnh minh họa
thiết kế giao diện cho các chức năng quan trọng nhất. Lưu ý, sinh viên không nhầm
lẫn giao diện thiết kế với giao diện của sản phẩm sau cùng

### 4.2.2 Thiết kế lớp

### 4.2.3 Thiết kế cơ sở dữ liệu

Phần này có độ dài từ hai đến bốn trang. Sinh viên thiết kế, vẽ và giải thích biểu
đồ thực thể liên kết (E-R diagram). Từ đó, sinh viên thiết kế cơ sở dữ liệu tùy theo
hệ quản trị cơ sở dữ liệu mà mình sử dụng (SQL, NoSQL, Firebase, v.v.)

## 4.3 Xây dựng ứng dụng

### 4.3.1 Thư viện và công cụ sử dụng

Sinh viên liệt kê các công cụ, ngôn ngữ lập trình, API, thư viện, IDE, công cụ
kiểm thử, v.v. mà mình sử dụng để phát triển ứng dụng. Mỗi công cụ phải được chỉ
rõ phiên bản sử dụng. SV nên kẻ bảng mô tả tương tự như Bảng ??. Nếu có nhiều
nội dung trình bày, sinh viên cần xoay ngang bảng.
Mục đích | Công cụ | Địa chỉ URL
|----------|---------|-------------|
| IDE lập trình | Eclipse Oxygen a64 bit | http://www.eclipse.org/ |
| v.v. | v.v. | v.v. |
Bảng 4.1: Danh sách thư viện và công cụ sử dụng

### 4.3.2 Kết quả đạt được

Sinh viên trước tiên mô tả kết quả đạt được của mình là gì, ví dụ như các sản
phẩm được đóng gói là gì, bao gồm những thành phần nào, ý nghĩa, vai trò?
Sinh viên cần thống kê các thông tin về ứng dụng của mình như: số dòng code,
số lớp, số gói, dung lượng toàn bộ mã nguồn, dung lượng của từng sản phẩm đóng
gói, v.v. Tương tự như phần liệt kê về công cụ sử dụng, sinh viên cũng nên dùng
bảng để mô tả phần thông tin thống kê này

### 4.3.3 Minh họa các chức năng chính

Sinh viên lựa chọn và đưa ra màn hình cho các chức năng chính, quan trọng, và
thú vị nhất. Mỗi giao diện cần phải có lời giải thích ngắn gọn. Khi giải thích, sinh
viên có thể kết hợp với các chú thích ở trong hình ảnh giao diện

## 4.4 Kiểm thử

Phần này có độ dài từ hai đến ba trang. Sinh viên thiết kế các trường hợp kiểm
thử cho hai đến ba chức năng quan trọng nhất. Sinh viên cần chỉ rõ các kỹ thuật
kiểm thử đã sử dụng. Chi tiết các trường hợp kiểm thử khác, nếu muốn trình bày,
sinh viên đưa vào phần phụ lục. Sinh viên sau cùng tổng kết về số lượng các trường
hợp kiểm thử và kết quả kiểm thử. Sinh viên cần phân tích lý do nếu kết quả kiểm
thử không đạt.

## 4.5 Triển khai

Sinh viên trình bày mô hình và/hoặc cách thức triển khai thử nghiệm/thực tế.
Ứng dụng của sinh viên được triển khai trên server/thiết bị gì, cấu hình như thế
nào. Kết quả triển khai thử nghiệm nếu có (số lượng người dùng, số lượng truy cập,
thời gian phản hồi, phản hồi người dùng, khả năng chịu tải, các thống kê, v.v.)
(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 4)

# CHƯƠNG 5. CÁC GIẢI PHÁP VÀ ĐÓNG GÓP NỔI BẬT

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 5)
Chương này có độ dài tối thiểu 5 trang, tối đa không giới hạn.1 Sinh viên cần
trình bày tất cả những nội dung đóng góp mà mình thấy tâm đắc nhất trong suốt
quá trình làm ĐATN. Đó có thể là một loạt các vấn đề khó khăn mà sinh viên đã
từng bước giải quyết được, là giải thuật cho một bài toán cụ thể, là giải pháp tổng
quát cho một lớp bài toán, hoặc là mô hình/kiến trúc hữu hiệu nào đó được sinh
viên thiết kế.
Chương này là cơ sở quan trọng để các thầy cô đánh giá sinh viên. Vì vậy, sinh
viên cần phát huy tính sáng tạo, khả năng phân tích, phản biện, lập luận, tổng quát
hóa vấn đề và tập trung viết cho thật tốt. Mỗi giải pháp hoặc đóng góp của sinh viên
cần được trình bày trong một mục độc lập bao gồm ba mục con: (i) dẫn dắt/giới
thiệu về bài toán/vấn đề, (ii) giải pháp, và (iii) kết quả đạt được (nếu có).
Sinh viên lưu ý không trình bày lặp lại nội dung. Những nội dung đã trình bày
chi tiết trong các chương trước không được trình bày lại trong chương này. Vì vậy,
với nội dung hay, mang tính đóng góp/giải pháp, sinh viên chỉ nên tóm lược/mô tả
sơ bộ trong các chương trước, đồng thời tạo tham chiếu chéo tới đề mục tương ứng
trong Chương 5 này. Chi tiết thông tin về đóng góp/giải pháp được trình bày trong
mục đó.
Ví dụ, trong Chương 4, sinh viên có thiết kế được kiến trúc đáng lưu ý gì đó, là
sự kết hợp của các kiến trúc MVC, MVP, SOA, v.v. Khi đó, sinh viên sẽ chỉ mô tả
ngắn gọn kiến trúc đó ở Chương 4, rồi thêm các câu có dạng: “Chi tiết về kiến trúc
này sẽ được trình bày trong phần 5.1"
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
