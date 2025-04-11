/**
 * Danh sách câu hỏi và câu trả lời cục bộ phổ biến
 */
export const LOCAL_QA_DATABASE = [
  {
    keywords: ['học bổng', 'đăng ký học bổng', 'xin học bổng'],
    answer: 'Để đăng ký học bổng, bạn cần đáp ứng các điều kiện cụ thể của từng loại học bổng (thường yêu cầu GPA từ 3.2 trở lên cho học bổng xuất sắc). Quy trình đăng ký: 1) Kiểm tra thông báo về học bổng trên trang web trường; 2) Chuẩn bị hồ sơ theo yêu cầu; 3) Nộp đơn đăng ký đúng thời hạn. Vui lòng liên hệ phòng Công tác Sinh viên để biết thêm chi tiết.'
  },
  {
    keywords: ['thời khóa biểu', 'lịch học', 'tkb'],
    answer: 'Thời khóa biểu được cập nhật trên hệ thống quản lý đào tạo của trường. Bạn có thể truy cập thông qua tài khoản sinh viên cá nhân. Nếu có thay đổi đột xuất về lịch học, nhà trường sẽ thông báo qua email hoặc tin nhắn SMS.'
  },
  {
    keywords: ['điểm', 'xem điểm', 'tra cứu điểm'],
    answer: 'Điểm số các học phần được cập nhật trên hệ thống quản lý đào tạo. Sinh viên đăng nhập vào hệ thống bằng tài khoản cá nhân để xem điểm. Nếu có thắc mắc về điểm số, bạn có thể liên hệ trực tiếp với giảng viên hoặc phòng Đào tạo trong vòng 1 tuần sau khi công bố điểm.'
  },
  {
    keywords: ['đăng ký môn học', 'đăng ký học phần'],
    answer: 'Đăng ký môn học được thực hiện theo lịch của từng học kỳ. Quy trình: 1) Đăng nhập vào hệ thống quản lý đào tạo; 2) Chọn mục đăng ký học phần; 3) Lựa chọn các môn học phù hợp với chương trình đào tạo; 4) Xác nhận đăng ký. Lưu ý thời hạn đăng ký và điều kiện tiên quyết của mỗi môn học.'
  },
  {
    keywords: ['bảng điểm', 'xin bảng điểm', 'cấp bảng điểm'],
    answer: 'Để xin cấp bảng điểm chính thức, sinh viên cần đến phòng Đào tạo và làm theo các bước: 1) Điền đơn yêu cầu cấp bảng điểm; 2) Đóng lệ phí theo quy định; 3) Nhận bảng điểm sau 3-5 ngày làm việc. Bạn cũng có thể xem bảng điểm không chính thức trên hệ thống quản lý đào tạo.'
  }
];

export const FALLBACK_RESPONSES = {
  'học bổng': 'Để đăng ký học bổng, bạn cần đáp ứng điều kiện về kết quả học tập (thường GPA từ 3.2 trở lên) và nộp hồ sơ đúng hạn. Vui lòng liên hệ phòng Công tác Sinh viên để biết thêm chi tiết về các loại học bổng hiện có và quy trình đăng ký.',
  'thời khóa biểu': 'Thời khóa biểu được cập nhật trên hệ thống quản lý đào tạo của trường. Bạn có thể truy cập thông qua tài khoản sinh viên cá nhân.',
  'điểm': 'Điểm số các học phần được cập nhật trên hệ thống quản lý đào tạo. Sinh viên đăng nhập vào hệ thống bằng tài khoản cá nhân để xem điểm.',
  'đăng ký môn': 'Đăng ký môn học được thực hiện theo lịch của từng học kỳ. Vui lòng truy cập hệ thống quản lý đào tạo để đăng ký.',
  'bảng điểm': 'Để xin cấp bảng điểm chính thức, sinh viên cần đến phòng Đào tạo và làm theo quy trình của trường.',
  'lịch thi': 'Lịch thi được công bố trên hệ thống quản lý đào tạo. Vui lòng kiểm tra thường xuyên để cập nhật thông tin mới nhất.',
  'học phí': 'Thông tin về học phí được cập nhật trên cổng thông tin sinh viên. Vui lòng liên hệ phòng Kế toán để biết thêm chi tiết.'
}; 