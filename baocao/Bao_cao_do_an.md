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

Bên cạnh các chức năng gắn với từng vai trò, hệ thống còn có các chức năng nền phục vụ vận hành liên tục. Cơ chế kiểm soát tranh chấp khi nhiều người cùng đặt một sân được tích hợp vào luồng tạo và cập nhật booking. Các tác vụ định kỳ trên máy chủ đảm nhiệm hủy phiên đặt quá hạn, dọn chuỗi đặt định kỳ hết hiệu lực, gửi nhắc lịch, đồng bộ trạng thái kèo giao lưu và làm mới dữ liệu phục vụ gợi ý. Nhờ cách phân tách này, phần mềm vừa bao phủ nghiệp vụ tương tác trực tiếp, vừa duy trì tính nhất quán dữ liệu theo thời gian mà không làm phình phạm vi mô tả ở mức tổng quan.

Mối quan hệ giữa các tác nhân và các use case chính được mô hình hóa bằng biểu đồ use case tổng quát tại mục 2.2.1; các use case quan trọng sẽ được phân rã và đặc tả chi tiết ở các mục tiếp theo.

### 2.2.1 Biểu đồ use case tổng quát

Biểu đồ use case tổng quát (Hình 2.1) mô tả ranh giới hệ thống và các tương tác chính giữa bốn tác nhân với nền tảng quản lý và đặt lịch sân thể thao. Mô hình này là cơ sở để thống nhất tên gọi và phạm vi các chức năng trước khi phân rã ở mục 2.2.2 và đặc tả ở mục 2.3.

Khách vãng lai là người truy cập chưa đăng nhập hoặc chưa có vai trò nghiệp vụ trong hệ thống. Tác nhân này tra cứu cụm sân, sân con, giá và tình trạng còn trống; xem đánh giá và danh sách kèo giao lưu công khai; thực hiện đăng ký, đăng nhập hoặc đăng xuất. Các use case này tạo điều kiện thu thập thông tin trước khi người dùng chuyển sang các nghiệp vụ yêu cầu xác thực.

Người chơi là người dùng đã xác thực với vai trò PLAYER. Tác nhân này quản lý hồ sơ cá nhân; tạo một lượt đặt sân hoặc tạo chuỗi đặt định kỳ; thực hiện thanh toán qua cổng trực tuyến; mua thêm vật phẩm gắn với booking; xem lịch sử đặt sân, hủy đặt sân và đánh giá sân sau khi sử dụng; tạo kèo, tham gia hoặc rời kèo giao lưu; xem gợi ý sân và nhận thông báo. Trên biểu đồ, use case «Tạo một lượt đặt sân» có quan hệ «include» với «Thực hiện thanh toán» vì booking ở trạng thái chờ thanh toán cần hoàn tất giao dịch trong thời hạn quy định. Use case «Tạo kèo» «extend» từ «Tạo một lượt đặt sân» khi người chơi muốn mở kèo gắn với phiên vừa đặt. Use case «Hủy đặt sân» «extend» từ «Xem lịch sử đặt sân» vì thao tác hủy được thực hiện trong ngữ cảnh quản lý lịch sử. Use case «Mua thêm vật phẩm» liên kết mở rộng với luồng đặt sân đơn lẻ; chuỗi đặt định kỳ không hỗ trợ mua kèm ở bước khởi tạo theo quy tắc nghiệp vụ hiện tại.

Chủ sân là người dùng đã xác thực với vai trò OWNER, chịu trách nhiệm vận hành một hoặc nhiều khu phức hợp. Tác nhân này quản lý khu phức hợp và sân con; thiết lập bảng giá theo khung giờ và ngày trong tuần; quản lý danh mục vật phẩm bán kèm; xem lịch đặt của sân; xác nhận hoặc từ chối booking; theo dõi thống kê doanh thu; khai báo tài khoản ngân hàng và gửi yêu cầu quyết toán đối với giao dịch thu qua VNPay. Use case «Xác nhận hoặc hủy đặt sân» «extend» từ «Xem lịch đặt của sân» vì thao tác xử lý booking được thực hiện khi chủ sân rà soát lịch.

Quản trị viên là người dùng với vai trò ADMIN, có quyền giám sát toàn nền tảng. Tác nhân này duyệt hoặc từ chối đăng ký khu phức hợp mới; quản lý trạng thái tài khoản người chơi, chủ sân và quản trị viên; theo dõi giao dịch; xử lý đối soát và các đợt quyết toán cho chủ sân; xem thống kê và lập báo cáo tổng hợp. Nhóm use case này bảo đảm tính minh bạch và kiểm soát vận hành ở cấp hệ thống.

Từ biểu đồ tổng quát có thể nhận thấy phần lớn use case của người chơi và chủ sân xoay quanh vòng đời booking, trong khi quản trị viên tập trung vào duyệt cơ sở, giám sát giao dịch và quyết toán. Các quan hệ «include» và «extend» được sử dụng để thể hiện phụ thuộc bắt buộc hoặc tùy chọn giữa các chức năng, giúp giảm trùng lặp trên sơ đồ và làm cơ sở cho việc phân rã chi tiết ở mục kế tiếp.

### 2.2.2 Biểu đồ use case phân rã XYZ

Với mỗi use case mức cao trong biểu đồ use case tổng quan, sinh viên tạo một
mục riêng như mục 2.2.2 và tiến hành phân rã use case đó. Lưu ý tên use case cần
phân rã trong biểu đồ use case tổng quan phải khớp với tên đề mục.
Trong mỗi mục như vậy, sinh viên vẽ và giải thích ngắn gọn các use case phân
rã.

### 2.2.3 Quy trình nghiệp vụ

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

## Kết luận chương 2

(Phần tổng kết chương này sẽ được tự động hoàn thiện nội dung sau khi viết xong các mục 2.3 và 2.4).

# CHƯƠNG 3. NỀN TẢNG LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 3)

(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 3)

# CHƯƠNG 4. PHÂN TÍCH THIẾT KẾ, TRIỂN KHAI VÀ ĐÁNH GIÁ HỆ THỐNG

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 4)

## 4.1 Thiết kế kiến trúc

### 4.1.1 Lựa chọn kiến trúc phần mềm

### 4.1.2 Thiết kế tổng quan

### 4.1.3 Thiết kế chi tiết gói

## 4.2 Thiết kế chi tiết

### 4.2.1 Thiết kế giao diện

### 4.2.2 Thiết kế lớp

### 4.2.3 Thiết kế cơ sở dữ liệu

## 4.3 Xây dựng ứng dụng

### 4.3.1 Thư viện và công cụ sử dụng

### 4.3.2 Kết quả đạt được

### 4.3.3 Minh họa các chức năng chính

## 4.4 Kiểm thử

## 4.5 Triển khai

(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 4)

# CHƯƠNG 5. CÁC GIẢI PHÁP VÀ ĐÓNG GÓP NỔI BẬT

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 5)

(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 5)

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

(Mở đầu: Giới thiệu những nội dung sẽ trình bày trong chương 6)

## 6.1 Kết luận

## 6.2 Hướng phát triển

(Kết thúc: Tổng kết lại các nội dung đã trình bày ở chương 6)
