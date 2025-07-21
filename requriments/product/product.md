# 🧾 Tập hợp User Stories cho Nền tảng Học Trực Tuyến

## 🔐 Module 0: Xác Thực & Quản Lý Tài Khoản Người Dùng

### 1. Đăng ký tài khoản  
**Là một** người dùng mới,  
**Tôi muốn** đăng ký tài khoản,  
**Để tôi có thể** lưu lại tùy chọn cá nhân và truy cập các tính năng thành viên.

**Tiêu chí chấp nhận:**
- Người dùng có thể nhập Họ, Tên, Email, Mật khẩu  
- Hiển thị lỗi rõ ràng nếu thiếu thông tin  
- Mật khẩu tối thiểu 8 ký tự  
- Email không được trùng lặp  
- Gửi email xác nhận sau khi đăng ký thành công  

**Độ ưu tiên:** Cao  
**Story Points:** 5  

---

### 2. Đăng nhập tài khoản  
**Là một** người dùng đã đăng ký,  
**Tôi muốn** đăng nhập tài khoản,  
**Để tôi có thể** truy cập hệ thống và tiếp tục học tập.

**Tiêu chí chấp nhận:**
- Nhập Email và Mật khẩu  
- Hiển thị lỗi nếu thông tin không chính xác  
- Hỗ trợ chức năng “Nhớ đăng nhập”  
- Xác thực token từ server sau khi đăng nhập  

**Độ ưu tiên:** Cao  
**Story Points:** 3  

---

### 3. Quên mật khẩu  
**Là một** người dùng quên mật khẩu,  
**Tôi muốn** đặt lại mật khẩu,  
**Để tôi có thể** tiếp tục truy cập tài khoản của mình.

**Tiêu chí chấp nhận:**
- Người dùng nhập email để yêu cầu reset  
- Hệ thống gửi email chứa link đặt lại mật khẩu  
- Mật khẩu mới phải dài tối thiểu 8 ký tự và khác mật khẩu cũ  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  

---

## 📘 Module 1: Học Theo Lộ Trình

### 4. Xem danh sách các khóa học
**Là một** học viên,  
**Tôi muốn** xem danh sách các khóa học,  
**Để tôi có thể** lựa chọn nội dung phù hợp để học.

**Tiêu chí chấp nhận:**
- Hiển thị danh sách các khóa học có sẵn  
- Danh sách bao gồm tiêu đề, mô tả ngắn, cấp độ  
- Có phân trang nếu quá nhiều khóa học  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 5. Lọc khóa học theo chủ đề và cấp độ
**Là một** học viên,  
**Tôi muốn** lọc khóa học theo chủ đề và cấp độ,  
**Để tôi có thể** tìm nội dung phù hợp nhanh hơn.

**Tiêu chí chấp nhận:**
- Có thể chọn 1 hoặc nhiều chủ đề  
- Có thể chọn cấp độ (Cơ bản, Trung bình, Nâng cao)  
- Kết quả lọc được cập nhật tức thì  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  

---

### 6. Đăng ký/tiếp tục học khóa học  
**Là một** học viên,  
**Tôi muốn** đăng ký hoặc tiếp tục học khóa học,  
**Để tôi có thể** tiếp tục hành trình học tập liền mạch.

**Tiêu chí chấp nhận:**
- Có nút Đăng ký nếu chưa tham gia  
- Hiển thị nút Tiếp tục nếu đã tham gia  
- Chuyển đến bài học gần nhất khi nhấn Tiếp tục  

**Độ ưu tiên:** Cao  
**Story Points:** 5  
  

---

### 7. Làm bài kiểm tra sau mỗi bài học  
**Là một** học viên,  
**Tôi muốn** làm bài kiểm tra sau mỗi bài học,  
**Để tôi có thể** củng cố và đánh giá kiến thức đã học.

**Tiêu chí chấp nhận:**
- Mỗi bài học có ít nhất 1 bài kiểm tra  
- Câu hỏi trắc nghiệm có thể chọn 1 hoặc nhiều đáp án  
- Có thể nộp bài và chấm điểm tự động  

**Độ ưu tiên:** Cao  
**Story Points:** 5  
  

---

### 8. Hiển thị kết quả kiểm tra  
**Là một** học viên,  
**Tôi muốn** xem kết quả kiểm tra,  
**Để tôi có thể** biết được điểm số và câu trả lời đúng/sai.

**Tiêu chí chấp nhận:**
- Hiển thị số câu đúng, sai sau khi nộp bài  
- Tính điểm tổng theo thang điểm 10  
- Hiển thị đáp án đúng, giải thích của mỗi câu hỏi 

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

## 🎯 Module 2: Cá Nhân Hóa Học Tập

### 9. Tạo flashcard ghi nhớ kiến thức  
**Là một** học viên,  
**Tôi muốn** tạo flashcard để ghi nhớ kiến thức,  
**Để tôi có thể** ôn tập hiệu quả hơn.

**Tiêu chí chấp nhận:**
- Có thể tạo flashcard với tiêu đề và nội dung  
- Giao diện đơn giản, dễ thao tác  
- Có thể lưu nháp hoặc hoàn tất  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  

---

### 10. Lưu trữ flashcard cá nhân  
**Là một** học viên,  
**Tôi muốn** lưu flashcard vào thư viện cá nhân,  
**Để tôi có thể** xem lại khi cần thiết.

**Tiêu chí chấp nhận:**
- Hiển thị danh sách flashcard đã tạo  
- Có thể tìm kiếm, chỉnh sửa, xóa flashcard  
- Hỗ trợ phân loại flashcard  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  

---

### 11. Chia sẻ flashcard với học sinh khác  
**Là một** học viên,  
**Tôi muốn** chia sẻ flashcard của mình,  
**Để tôi có thể** học tập nhóm hiệu quả.

**Tiêu chí chấp nhận:**
- Có thể chia sẻ qua liên kết hoặc công khai  
- Người nhận có thể sao chép vào thư viện cá nhân  
- Có thể hủy chia sẻ bất cứ lúc nào  

**Độ ưu tiên:** Thấp  
**Story Points:** 2  
  

---

### 12. Gợi ý bài học tiếp theo dựa trên điểm số  
**Là một** học viên,  
**Tôi muốn** hệ thống gợi ý bài học tiếp theo,  
**Để tôi có thể** học theo lộ trình cá nhân hóa.

**Tiêu chí chấp nhận:**
- Gợi ý dựa trên điểm số và bài học chưa hoàn thành  
- Hiển thị thông báo và đường dẫn đến bài học  
- Có thể bỏ qua hoặc lưu lại để học sau  

**Độ ưu tiên:** Trung bình  
**Story Points:** 5  
  

---

### 13. Theo dõi tiến trình học tập cá nhân hóa  
**Là một** học viên,  
**Tôi muốn** theo dõi tiến trình học của mình,  
**Để tôi có thể** đánh giá sự tiến bộ qua thời gian.

**Tiêu chí chấp nhận:**
- Biểu đồ phần trăm hoàn thành khóa học  
- Hiển thị tiến độ theo ngày/tuần  
- So sánh với mục tiêu cá nhân  

**Độ ưu tiên:** Cao  
**Story Points:** 5  
  

---

## 📝 Module 3: Tạo Kỳ Thi

### 14. Giáo viên tạo đề thi  
**Là một** giáo viên,  
**Tôi muốn** tạo đề thi với nhiều loại câu hỏi,  
**Để tôi có thể** đánh giá kết quả học tập của học sinh.

**Tiêu chí chấp nhận:**
- Tạo câu hỏi trắc nghiệm và tự luận  
- Lưu nháp đề thi chưa hoàn chỉnh  
- Giao diện đơn giản, dễ thao tác  

**Độ ưu tiên:** Cao  
**Story Points:** 5  
  

---

### 15. Cấu hình thời gian thi và số lần làm bài  
**Là một** giáo viên,  
**Tôi muốn** thiết lập thời gian thi và giới hạn số lần làm bài,  
**Để tôi có thể** kiểm soát kỳ thi hiệu quả.

**Tiêu chí chấp nhận:**
- Thiết lập thời gian tối đa làm bài  
- Giới hạn số lần học sinh có thể thi lại  
- Tự động đóng khi hết giờ  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 16. Xem trước đề thi trước khi công bố  
**Là một** giáo viên,  
**Tôi muốn** xem trước đề thi,  
**Để tôi có thể** kiểm tra nội dung trước khi công bố.

**Tiêu chí chấp nhận:**
- Hiển thị toàn bộ đề dưới dạng preview  
- Có thể quay lại chỉnh sửa nếu cần  
- Có cảnh báo nếu chưa đủ câu hỏi  

**Độ ưu tiên:** Trung bình  
**Story Points:** 2  
  

---

### 17. Lưu trữ và quản lý bộ đề thi  
**Là một** giáo viên,  
**Tôi muốn** lưu và quản lý các đề thi,  
**Để tôi có thể** sử dụng lại hoặc chỉnh sửa sau này.

**Tiêu chí chấp nhận:**
- Danh sách đề thi theo khóa học  
- Tìm kiếm, lọc và chỉnh sửa đề cũ  
- Hỗ trợ nhân bản đề thi  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  

---

## 👥 Module 4: Cộng Đồng Học Tập

### 18. Đăng câu hỏi lên diễn đàn  
**Là một** học viên,  
**Tôi muốn** đăng câu hỏi lên diễn đàn,  
**Để tôi có thể** nhận được sự hỗ trợ từ cộng đồng.

**Tiêu chí chấp nhận:**
- Nhập tiêu đề, mô tả chi tiết  
- Chọn chuyên mục phù hợp  
- Câu hỏi hiển thị ngay sau khi đăng  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 19. Trả lời, bình luận và bình chọn  
**Là một** thành viên,  
**Tôi muốn** trả lời và bình chọn câu hỏi của người khác,  
**Để tôi có thể** tham gia hỗ trợ và đóng góp ý kiến.

**Tiêu chí chấp nhận:**
- Có thể trả lời và bình luận bên dưới bài viết  
- Có nút Like/Dislike hoặc vote lên/xuống  
- Sắp xếp câu trả lời theo lượt bình chọn  

**Độ ưu tiên:** Cao  
**Story Points:** 4  

---

### 20. Trao đổi kiến thức theo nhóm  
**Là một** học viên,  
**Tôi muốn** tham gia nhóm học tập,  
**Để tôi có thể** trao đổi kiến thức chuyên sâu theo chủ đề.

**Tiêu chí chấp nhận:**
- Có thể tạo nhóm học tập công khai/riêng tư  
- Mỗi nhóm có thể chia sẻ bài viết, file, link  
- Có chức năng chat nhóm đơn giản  

**Độ ưu tiên:** Trung bình  
**Story Points:** 5  

---

### 21. Báo cáo nội dung không phù hợp  
**Là một** thành viên cộng đồng,  
**Tôi muốn** có thể báo cáo các câu hỏi, câu trả lời hoặc bình luận không phù hợp,  
**Để tôi có thể** giúp giữ cho diễn đàn lành mạnh và tích cực.

**Tiêu chí chấp nhận:**
- Mỗi bài viết/câu trả lời có nút "Báo cáo"  
- Người dùng chọn lý do báo cáo (spam, ngôn từ không phù hợp, sai thông tin...)  
- Nội dung bị báo cáo sẽ được chuyển đến quản trị viên kiểm duyệt  
- Nếu bị nhiều báo cáo, nội dung có thể bị ẩn tạm thời

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  

---

## 📊 Module 5: Báo Cáo & Thống Kê

### 22. Theo dõi tiến độ học tập cá nhân  
**Là một** học viên,  
**Tôi muốn** xem tiến độ học tập của mình,  
**Để tôi có thể** điều chỉnh lịch học hợp lý.

**Tiêu chí chấp nhận:**
- Hiển thị số bài đã hoàn thành / tổng số bài  
- Hiển thị theo phần trăm và dạng bảng  
- Có biểu đồ đơn giản theo tuần/tháng  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 23. Biểu đồ hoàn thành khóa học  
**Là một** học viên hoặc giáo viên,  
**Tôi muốn** xem biểu đồ hoàn thành khóa học,  
**Để tôi có thể** đánh giá tiến độ tổng thể của lớp học.

**Tiêu chí chấp nhận:**
- Biểu đồ hình tròn hoặc thanh  
- Phân chia theo khóa học hoặc nhóm  
- Có thể lọc theo thời gian  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  

---

### 24. Thống kê điểm số, bài kiểm tra đã làm  
**Là một** học viên,  
**Tôi muốn** xem thống kê điểm số của mình,  
**Để tôi có thể** biết kết quả học tập qua các kỳ kiểm tra.

**Tiêu chí chấp nhận:**
- Hiển thị danh sách bài kiểm tra đã làm  
- Có điểm, thời gian hoàn thành, trạng thái  
- Có thể sắp xếp theo điểm hoặc thời gian  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 25. Phân tích điểm mạnh/yếu của học sinh  
**Là một** giáo viên,  
**Tôi muốn** phân tích điểm mạnh và điểm yếu của học sinh,  
**Để tôi có thể** lên kế hoạch giảng dạy hiệu quả hơn.

**Tiêu chí chấp nhận:**
- Hiển thị phần trăm đúng theo từng chủ đề  
- Tự động gợi ý chủ đề yếu  
- Có báo cáo xuất file PDF/Excel  

**Độ ưu tiên:** Trung bình  
**Story Points:** 5  
  

---

## ⚙️ Module 6: Quản Trị Hệ Thống (Admin)

### 26. Quản lý tài khoản người dùng  
**Là một** quản trị viên,  
**Tôi muốn** xem và quản lý tài khoản người dùng,  
**Để tôi có thể** đảm bảo an toàn và trật tự hệ thống.

**Tiêu chí chấp nhận:**
- Danh sách người dùng với vai trò (học sinh, giáo viên)  
- Có thể xem thông tin chi tiết  
- Có thể chỉnh sửa hoặc xóa tài khoản  

**Độ ưu tiên:** Cao  
**Story Points:** 4  
  

---

### 27. Tìm kiếm, lọc và khóa/mở tài khoản  
**Là một** quản trị viên,  
**Tôi muốn** tìm kiếm, lọc và khóa/mở tài khoản,  
**Để tôi có thể** xử lý tài khoản vi phạm nhanh chóng.

**Tiêu chí chấp nhận:**
- Tìm kiếm theo tên, email, vai trò  
- Bộ lọc theo trạng thái (Hoạt động, Đã khóa)  
- Xác nhận trước khi khóa/mở tài khoản  

**Độ ưu tiên:** Cao  
**Story Points:** 3  
  

---

### 28. Kiểm duyệt nội dung do người dùng chia sẻ  
**Là một** quản trị viên,  
**Tôi muốn** kiểm duyệt các nội dung được chia sẻ (quiz, flashcard, bài viết),  
**Để tôi có thể** đảm bảo nội dung phù hợp với chính sách.

**Tiêu chí chấp nhận:**
- Danh sách nội dung chờ kiểm duyệt  
- Có thể phê duyệt, từ chối, hoặc báo cáo nội dung  
- Ghi lại lịch sử kiểm duyệt  

**Độ ưu tiên:** Cao  
**Story Points:** 5  
  

---

### 29. Gửi thông báo kết quả kiểm duyệt  
**Là một** quản trị viên,  
**Tôi muốn** gửi thông báo cho người dùng về kết quả kiểm duyệt,  
**Để họ có thể** biết trạng thái nội dung của mình.

**Tiêu chí chấp nhận:**
- Gửi thông báo khi nội dung được duyệt hoặc bị từ chối  
- Có lý do từ chối rõ ràng  
- Người dùng có thể phản hồi nếu cần  

**Độ ưu tiên:** Trung bình  
**Story Points:** 3  
  
---
