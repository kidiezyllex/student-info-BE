import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database.js';
import User from './models/user.model.js';
import Department from './models/department.model.js';
import Event from './models/event.model.js';
import Scholarship from './models/scholarship.model.js';
import Notification from './models/notification.model.js';
import Dataset from './models/dataset.model.js';
import Message from './models/message.model.js';
import ChatSession from './models/chatSession.model.js';

dotenv.config();

// VGU Departments Data - Các chuyên ngành Công nghệ Thông tin
const vguDepartments = [
  {
    name: 'Khoa học Máy tính',
    code: 'CS',
    description: 'Chương trình đào tạo chuyên sâu về lý thuyết máy tính, thuật toán, cấu trúc dữ liệu và phân tích độ phức tạp. Sinh viên được trang bị kiến thức nền tảng vững chắc để nghiên cứu và phát triển các giải pháp công nghệ tiên tiến.'
  },
  {
    name: 'Kỹ thuật Phần mềm',
    code: 'SE',
    description: 'Đào tạo kỹ sư phần mềm chuyên nghiệp với kỹ năng phân tích, thiết kế, phát triển và bảo trì hệ thống phần mềm quy mô lớn. Tập trung vào quy trình phát triển phần mềm, kiểm thử và quản lý dự án công nghệ.'
  },
  {
    name: 'An toàn Thông tin',
    code: 'IS',
    description: 'Chuyên ngành đào tạo chuyên gia bảo mật hệ thống thông tin, mật mã học, phát hiện và phòng chống tấn công mạng. Sinh viên học cách bảo vệ dữ liệu và hệ thống khỏi các mối đe dọa an ninh mạng.'
  },
  {
    name: 'Trí tuệ Nhân tạo',
    code: 'AI',
    description: 'Chương trình đào tạo về machine learning, deep learning, xử lý ngôn ngữ tự nhiên và computer vision. Sinh viên được trang bị kiến thức để phát triển các hệ thống AI thông minh và ứng dụng vào thực tế.'
  },
  {
    name: 'Hệ thống Thông tin',
    code: 'ISYS',
    description: 'Đào tạo chuyên gia về quản lý và tích hợp hệ thống thông tin trong doanh nghiệp. Tập trung vào phân tích nghiệp vụ, thiết kế hệ thống quản lý và tối ưu hóa quy trình kinh doanh bằng công nghệ.'
  },
  {
    name: 'Mạng Máy tính',
    code: 'NET',
    description: 'Chuyên ngành về thiết kế, triển khai và quản trị mạng máy tính, bảo mật mạng, cloud computing và hệ thống phân tán. Sinh viên học cách xây dựng và vận hành hạ tầng mạng hiện đại.'
  },
  {
    name: 'Công nghệ Web',
    code: 'WEB',
    description: 'Đào tạo chuyên sâu về phát triển ứng dụng web, frontend và backend development, responsive design và các framework hiện đại. Sinh viên học cách xây dựng các ứng dụng web hiện đại và tối ưu.'
  },
  {
    name: 'Phát triển Game',
    code: 'GD',
    description: 'Chương trình đào tạo về game development, game engine, đồ họa máy tính và thiết kế gameplay. Sinh viên học cách tạo ra các trò chơi điện tử từ ý tưởng đến sản phẩm hoàn chỉnh.'
  }
];

// Coordinator names for VGU - Tên tiếng Việt 4 từ
const coordinatorNames = [
  'Nguyễn Văn An Bình',
  'Trần Thị Bích Chi',
  'Lê Văn Công Dũng',
  'Phạm Thị Diệu Linh',
  'Hoàng Văn Đức Huy',
  'Vũ Thị Hồng Nhung',
  'Đào Văn Gia Khang',
  'Bùi Thị Hương Lan'
];

// Helper function to remove Vietnamese diacritics
const removeVietnameseDiacritics = (str) => {
  const diacriticsMap = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  };
  
  return str.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, (char) => diacriticsMap[char] || char);
};

// Helper function to generate random date
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate student ID
const generateStudentId = (course, index) => {
  const year = course.replace('K', '');
  return `${year}${String(index).padStart(4, '0')}`;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Event.deleteMany({});
    await Scholarship.deleteMany({});
    await Notification.deleteMany({});
    await Dataset.deleteMany({});
    await Message.deleteMany({});
    await ChatSession.deleteMany({});
    
    // 1. Create Admin
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      name: 'VGU Administrator',
      email: 'adminvgu@gmail.com',
      password: 'Admin123!',
      role: 'admin',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      active: true,
      fullName: 'VGU System Administrator',
      phoneNumber: '0901234567',
      address: {
        street: 'Lê Văn Việt',
        ward: 'Hiệp Phú',
        district: 'Quận 9',
        city: 'Thành phố Hồ Chí Minh',
        zipCode: '700000'
      }
    });
    console.log('✅ Admin created:', admin.email);
    
    // 2. Create Coordinators
    console.log('👨‍🏫 Creating coordinators...');
    const coordinators = [];
    for (let i = 0; i < coordinatorNames.length; i++) {
      const name = coordinatorNames[i];
      const nameWithoutDiacritics = removeVietnameseDiacritics(name);
      const email = `${nameWithoutDiacritics.toLowerCase().replace(/\s+/g, '')}vgu@gmail.com`;
      const password = `${nameWithoutDiacritics.toLowerCase().replace(/\s+/g, '')}123!`;
      
      const coordinator = await User.create({
        name: name,
        email: email,
        password: password,
        role: 'coordinator',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        active: true,
        fullName: name,
        phoneNumber: `090${String(1000000 + i).slice(-7)}`,
        coordinatorInfo: {
          position: 'Trưởng khoa',
          officeLocation: `Phòng ${101 + i}, Tòa nhà A, VGU`,
          officeHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
          specialization: ['Quản lý giáo dục', 'Phát triển chương trình đào tạo'],
          qualifications: [
            {
              degree: 'Tiến sĩ',
              field: 'Kỹ thuật',
              institution: 'Đại học Bách khoa',
              year: 2010 + i
            }
          ],
          researchInterests: ['Giáo dục đại học', 'Phát triển bền vững']
        }
      });
      coordinators.push(coordinator);
      console.log(`✅ Coordinator created: ${coordinator.email}`);
    }
    
    // 3. Create Departments
    console.log('🏫 Creating departments...');
    const departments = [];
    for (let i = 0; i < vguDepartments.length; i++) {
      const deptData = vguDepartments[i];
      const coordinator = coordinators[i % coordinators.length];
      
      const department = await Department.create({
        ...deptData,
        coordinator: coordinator._id
      });
      departments.push(department);
      console.log(`✅ Department created: ${department.name}`);
    }
    
    // Update coordinators with their departments
    for (let i = 0; i < coordinators.length; i++) {
      const dept = departments[i % departments.length];
      await User.findByIdAndUpdate(coordinators[i]._id, {
        department: dept._id
      });
    }
    
    // 4. Create Students
    console.log('🎓 Creating students...');
    const students = [];
    const courses = ['K18', 'K19', 'K20', 'K21', 'K22', 'K23'];
    const firstNames = ['An', 'Bình', 'Chi', 'Dũng', 'Hoa', 'Hùng', 'Lan', 'Minh', 'Nam', 'Nga', 'Phong', 'Quang', 'Thảo', 'Tuấn', 'Vy'];
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đào', 'Bùi', 'Đặng', 'Ngô'];
    
    let studentIndex = 1;
    for (const course of courses) {
      for (let i = 0; i < 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${lastName} ${firstName}`;
        const firstNameNoDiacritics = removeVietnameseDiacritics(firstName);
        const lastNameNoDiacritics = removeVietnameseDiacritics(lastName);
        const email = `${firstNameNoDiacritics.toLowerCase()}${lastNameNoDiacritics.toLowerCase()}${studentIndex}@student.vgu.edu.vn`;
        const studentId = generateStudentId(course, studentIndex);
        const department = departments[Math.floor(Math.random() * departments.length)];
        
        const student = await User.create({
          name: fullName,
          email: email,
          password: 'Student123!',
          role: 'student',
          studentId: studentId,
          department: department._id,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          active: true,
          fullName: fullName,
          dateOfBirth: randomDate(new Date(1995, 0, 1), new Date(2005, 11, 31)),
          gender: ['male', 'female'][Math.floor(Math.random() * 2)],
          phoneNumber: `090${String(2000000 + studentIndex).slice(-7)}`,
          address: {
            street: `${Math.floor(Math.random() * 100) + 1} Đường ABC`,
            ward: 'Phường XYZ',
            district: 'Quận ' + (Math.floor(Math.random() * 12) + 1),
            city: 'Thành phố Hồ Chí Minh',
            zipCode: '700000'
          },
          studentInfo: {
            class: `${course}-${department.code}-${Math.floor(Math.random() * 3) + 1}`,
            course: course,
            academicYear: '2024-2025',
            semester: ['Fall', 'Spring'][Math.floor(Math.random() * 2)],
            gpa: parseFloat((Math.random() * 2 + 2).toFixed(2)),
            credits: Math.floor(Math.random() * 50 + 50),
            admissionDate: randomDate(new Date(2018, 0, 1), new Date(2023, 5, 30)),
            expectedGraduationDate: randomDate(new Date(2024, 5, 1), new Date(2027, 5, 30)),
            status: 'active',
            scholarships: [],
            achievements: []
          }
        });
        students.push(student);
        studentIndex++;
      }
    }
    console.log(`✅ Created ${students.length} students`);
    
    // 5. Create Events
    console.log('📅 Creating events...');
    const events = [];
    const eventTitles = [
      'Hội thảo Công nghệ Thông tin 2024',
      'Workshop Phát triển Phần mềm',
      'Seminar Trí tuệ Nhân tạo và Machine Learning',
      'Ngày hội Tuyển sinh Khoa CNTT',
      'Workshop An toàn Thông tin và Bảo mật',
      'Hội thảo Blockchain và Cryptocurrency',
      'Seminar Cloud Computing và DevOps',
      'Workshop Phát triển Web Hiện đại',
      'Ngày hội Việc làm Công nghệ Thông tin',
      'Hội thảo Game Development',
      'Workshop Mobile App Development',
      'Seminar Big Data và Data Science',
      'Hội thảo Internet of Things (IoT)',
      'Workshop Cybersecurity và Ethical Hacking',
      'Seminar Agile và Scrum Methodology',
      'Hội thảo Full Stack Development',
      'Workshop UI/UX Design cho Ứng dụng',
      'Seminar Database Design và Optimization',
      'Hội thảo Microservices Architecture',
      'Workshop API Development và Integration'
    ];
    
    for (let i = 0; i < 80; i++) {
      const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
      const endDate = new Date(startDate.getTime() + Math.random() * 8 * 60 * 60 * 1000);
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      const event = await Event.create({
        title: `${title} ${i > 0 ? `- Phiên ${i + 1}` : ''}`,
        description: `Mô tả chi tiết về ${title.toLowerCase()}. Sự kiện này được tổ chức tại VGU với sự tham gia của nhiều chuyên gia và sinh viên.`,
        startDate: startDate,
        endDate: endDate,
        location: `Hội trường ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, VGU`,
        department: department ? department._id : null,
        organizer: department ? department.name : 'VGU',
        createdBy: creator._id
      });
      events.push(event);
    }
    console.log(`✅ Created ${events.length} events`);
    
    // 6. Create Scholarships
    console.log('💰 Creating scholarships...');
    const scholarships = [];
    const scholarshipTitles = [
      'Học bổng Xuất sắc Khoa CNTT',
      'Học bổng Khuyến khích Học tập CNTT',
      'Học bổng Dành cho Sinh viên CNTT Có Hoàn cảnh Khó khăn',
      'Học bổng Nghiên cứu Trí tuệ Nhân tạo',
      'Học bổng Phát triển Phần mềm',
      'Học bổng An toàn Thông tin',
      'Học bổng Tài năng Lập trình',
      'Học bổng Game Development',
      'Học bổng Web Development',
      'Học bổng Mobile App Development',
      'Học bổng Data Science',
      'Học bổng Cloud Computing',
      'Học bổng Cybersecurity',
      'Học bổng Blockchain Technology',
      'Học bổng IoT và Embedded Systems'
    ];
    const providers = [
      'VGU Foundation',
      'DAAD (German Academic Exchange Service)',
      'Bộ Giáo dục và Đào tạo',
      'Tập đoàn Siemens',
      'Tập đoàn Bosch',
      'Quỹ Phát triển VGU',
      'Hiệp hội Doanh nghiệp Đức tại Việt Nam'
    ];
    
    for (let i = 0; i < 60; i++) {
      const title = scholarshipTitles[Math.floor(Math.random() * scholarshipTitles.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const deadline = randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31));
      const department = Math.random() > 0.4 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const value = `${Math.floor(Math.random() * 20 + 5)}.000.000 VND`;
      
      const scholarship = await Scholarship.create({
        title: `${title} ${i > 0 ? `- Đợt ${i + 1}` : ''}`,
        description: `Học bổng ${title.toLowerCase()} dành cho sinh viên VGU. Học bổng này nhằm khuyến khích và hỗ trợ sinh viên trong quá trình học tập và nghiên cứu.`,
        requirements: `GPA từ ${(Math.random() * 1.5 + 2.5).toFixed(1)} trở lên, không vi phạm kỷ luật, tham gia tích cực các hoạt động của trường.`,
        value: value,
        applicationDeadline: deadline,
        provider: provider,
        department: department ? department._id : null,
        eligibility: 'Sinh viên đang theo học tại VGU, từ năm 2 trở lên',
        applicationProcess: 'Nộp hồ sơ qua hệ thống online của VGU, bao gồm: đơn đăng ký, bảng điểm, thư giới thiệu.',
        createdBy: creator._id
      });
      scholarships.push(scholarship);
    }
    console.log(`✅ Created ${scholarships.length} scholarships`);
    
    // 7. Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
    const notificationTitles = [
      'Thông báo Lịch Thi Cuối Kỳ Khoa CNTT',
      'Thông báo Đăng ký Học phần Chuyên ngành CNTT',
      'Thông báo Học bổng CNTT Mới',
      'Thông báo Workshop Công nghệ Sắp tới',
      'Thông báo Tuyển Dụng Lập trình Viên',
      'Thông báo Hội thảo Trí tuệ Nhân tạo',
      'Thông báo Bảo trì Hệ thống CNTT',
      'Thông báo Đăng ký Thực tập Công ty Công nghệ',
      'Thông báo Cuộc thi Lập trình',
      'Thông báo Seminar Công nghệ Mới',
      'Thông báo Tuyển Dụng DevOps Engineer',
      'Thông báo Workshop An toàn Thông tin',
      'Thông báo Đăng ký Khóa học Online',
      'Thông báo Hội thảo Startup Công nghệ',
      'Thông báo Tuyển Dụng Full Stack Developer'
    ];
    const notificationTypes = ['general', 'scholarship', 'event', 'department'];
    
    for (let i = 0; i < 100; i++) {
      const title = notificationTitles[Math.floor(Math.random() * notificationTitles.length)];
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
      const endDate = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const department = Math.random() > 0.5 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      const notification = await Notification.create({
        title: `${title} - ${new Date().toLocaleDateString('vi-VN')}`,
        content: `Nội dung chi tiết về ${title.toLowerCase()}. Vui lòng đọc kỹ và thực hiện theo hướng dẫn. Mọi thắc mắc xin liên hệ phòng đào tạo.`,
        type: type,
        department: department ? department._id : null,
        startDate: startDate,
        endDate: endDate,
        isImportant: Math.random() > 0.7,
        createdBy: creator._id
      });
      notifications.push(notification);
    }
    console.log(`✅ Created ${notifications.length} notifications`);
    
    // 8. Create Dataset entries
    console.log('📚 Creating dataset entries...');
    const datasetEntries = [];
    const categories = ['general', 'scholarship', 'event', 'department', 'faq'];
    
    const faqData = [
      { key: 'VGU là gì?', value: 'VGU (Vietnamese-German University) là trường đại học công lập được thành lập dựa trên mô hình đại học ứng dụng của Đức, chuyên đào tạo về Công nghệ Thông tin.' },
      { key: 'Các chuyên ngành CNTT tại VGU?', value: 'VGU đào tạo các chuyên ngành: Khoa học Máy tính, Kỹ thuật Phần mềm, An toàn Thông tin, Trí tuệ Nhân tạo, Hệ thống Thông tin, Mạng Máy tính, Công nghệ Web, và Phát triển Game.' },
      { key: 'Làm thế nào để đăng ký học bổng CNTT?', value: 'Sinh viên có thể đăng ký học bổng CNTT qua hệ thống online của VGU. Cần chuẩn bị bảng điểm, đơn đăng ký, portfolio dự án (nếu có) và các giấy tờ liên quan.' },
      { key: 'Lịch học tại Khoa CNTT như thế nào?', value: 'Lịch học tại Khoa CNTT được chia thành 2 học kỳ: Fall (từ tháng 9) và Spring (từ tháng 2). Mỗi học kỳ kéo dài khoảng 15 tuần với nhiều môn thực hành và dự án.' },
      { key: 'Làm thế nào để liên hệ với Khoa CNTT?', value: 'Bạn có thể liên hệ Khoa CNTT qua email: cs@vgu.edu.vn hoặc điện thoại: 028-7300-7300. Văn phòng khoa mở cửa từ thứ 2 đến thứ 6, 8:00 - 17:00.' },
      { key: 'Học phí ngành CNTT tại VGU?', value: 'Học phí ngành CNTT tại VGU được tính theo tín chỉ. Sinh viên có thể tham khảo bảng học phí trên website chính thức của trường. Có nhiều chương trình học bổng hỗ trợ.' },
      { key: 'Cơ hội thực tập và việc làm cho sinh viên CNTT?', value: 'Khoa CNTT có nhiều chương trình hợp tác với các công ty công nghệ trong và ngoài nước. Sinh viên có cơ hội thực tập tại các công ty như FPT, Viettel, Samsung, và các công ty Đức tại Việt Nam.' },
      { key: 'Yêu cầu đầu vào ngành CNTT?', value: 'Yêu cầu đầu vào: Tốt nghiệp THPT, điểm thi THPT Quốc gia đạt ngưỡng quy định (thường từ 24 điểm trở lên), có khả năng tiếng Anh tốt (IELTS 5.5+ hoặc tương đương).' },
      { key: 'Cơ hội học chuyển tiếp tại Đức?', value: 'VGU có nhiều chương trình trao đổi và chuyển tiếp với các trường đại học tại Đức. Sinh viên CNTT có thể học 2 năm tại VGU và 2 năm tại Đức để nhận bằng kép.' },
      { key: 'Chương trình đào tạo CNTT tại VGU có gì đặc biệt?', value: 'Chương trình CNTT tại VGU đào tạo theo mô hình đại học ứng dụng của Đức, kết hợp lý thuyết và thực hành. Sinh viên được thực hành nhiều với các dự án thực tế, có cơ hội thực tập tại doanh nghiệp và tham gia các cuộc thi lập trình.' },
      { key: 'Các môn học chính trong chương trình CNTT?', value: 'Chương trình CNTT bao gồm: Lập trình cơ bản và nâng cao, Cấu trúc dữ liệu và giải thuật, Cơ sở dữ liệu, Mạng máy tính, An toàn thông tin, Trí tuệ nhân tạo, Phát triển phần mềm, và Đồ án tốt nghiệp.' },
      { key: 'Cơ hội nghiên cứu khoa học cho sinh viên CNTT?', value: 'Sinh viên CNTT có nhiều cơ hội tham gia nghiên cứu khoa học với các giảng viên, tham gia các dự án nghiên cứu về AI, Machine Learning, Cybersecurity, và các công nghệ mới. Có nhiều học bổng nghiên cứu dành cho sinh viên xuất sắc.' }
    ];
    
    // Add FAQ entries
    for (const faq of faqData) {
      const entry = await Dataset.create({
        key: faq.key,
        value: faq.value,
        category: 'faq',
        department: null,
        createdBy: admin._id,
        updatedBy: admin._id
      });
      datasetEntries.push(entry);
    }
    
    // Add department-specific entries
    for (const dept of departments) {
      const jobOpportunities = {
        'CS': 'Sinh viên tốt nghiệp ngành Khoa học Máy tính có thể làm việc tại các công ty công nghệ lớn như Google, Microsoft, FPT Software, Viettel, hoặc các công ty Đức tại Việt Nam với vị trí Software Engineer, Research Scientist, hoặc Algorithm Developer.',
        'SE': 'Sinh viên tốt nghiệp ngành Kỹ thuật Phần mềm có cơ hội làm việc tại các công ty phát triển phần mềm, startup công nghệ với vị trí Software Developer, Full Stack Developer, hoặc Technical Lead.',
        'IS': 'Sinh viên tốt nghiệp ngành An toàn Thông tin có thể làm việc tại các công ty bảo mật, ngân hàng, tổ chức tài chính với vị trí Security Engineer, Penetration Tester, hoặc Security Consultant.',
        'AI': 'Sinh viên tốt nghiệp ngành Trí tuệ Nhân tạo có cơ hội làm việc tại các công ty AI, data science với vị trí AI Engineer, Machine Learning Engineer, hoặc Data Scientist.',
        'ISYS': 'Sinh viên tốt nghiệp ngành Hệ thống Thông tin có thể làm việc tại các công ty công nghệ, doanh nghiệp với vị trí System Analyst, Business Analyst, hoặc IT Consultant.',
        'NET': 'Sinh viên tốt nghiệp ngành Mạng Máy tính có cơ hội làm việc tại các công ty viễn thông, cloud provider với vị trí Network Engineer, Cloud Engineer, hoặc DevOps Engineer.',
        'WEB': 'Sinh viên tốt nghiệp ngành Công nghệ Web có thể làm việc tại các công ty phát triển web, agency với vị trí Frontend Developer, Backend Developer, hoặc Full Stack Developer.',
        'GD': 'Sinh viên tốt nghiệp ngành Phát triển Game có cơ hội làm việc tại các studio game, công ty giải trí với vị trí Game Developer, Game Designer, hoặc Game Programmer.'
      };
      
      const entries = [
        { key: `Chương trình đào tạo ${dept.name}`, value: dept.description },
        { key: `Cơ hội việc làm ngành ${dept.name}`, value: jobOpportunities[dept.code] || `Sinh viên tốt nghiệp ngành ${dept.name} tại VGU có nhiều cơ hội việc làm tại các công ty công nghệ trong và ngoài nước.` },
        { key: `Yêu cầu đầu vào ${dept.code}`, value: `Yêu cầu đầu vào ngành ${dept.name}: Tốt nghiệp THPT, điểm thi THPT Quốc gia đạt ngưỡng quy định (thường từ 24 điểm trở lên), có khả năng tiếng Anh tốt (IELTS 5.5+ hoặc tương đương), có niềm đam mê với công nghệ và lập trình.` }
      ];
      
      for (const entryData of entries) {
        const entry = await Dataset.create({
          key: entryData.key,
          value: entryData.value,
          category: 'department',
          department: dept._id,
          createdBy: admin._id,
          updatedBy: admin._id
        });
        datasetEntries.push(entry);
      }
    }
    
    // Add scholarship entries
    for (const scholarship of scholarships.slice(0, 10)) {
      const entry = await Dataset.create({
        key: scholarship.title,
        value: `${scholarship.description}. Yêu cầu: ${scholarship.requirements}. Giá trị: ${scholarship.value}. Hạn nộp: ${scholarship.applicationDeadline.toLocaleDateString('vi-VN')}.`,
        category: 'scholarship',
        department: scholarship.department,
        createdBy: admin._id,
        updatedBy: admin._id
      });
      datasetEntries.push(entry);
    }
    
    // Add event entries
    for (const event of events.slice(0, 10)) {
      const entry = await Dataset.create({
        key: event.title,
        value: `${event.description}. Thời gian: ${event.startDate.toLocaleDateString('vi-VN')} - ${event.endDate.toLocaleDateString('vi-VN')}. Địa điểm: ${event.location}.`,
        category: 'event',
        department: event.department,
        createdBy: admin._id,
        updatedBy: admin._id
      });
      datasetEntries.push(entry);
    }
    
    console.log(`✅ Created ${datasetEntries.length} dataset entries`);
    
    // 9. Create Messages
    console.log('💬 Creating messages...');
    const messages = [];
    const messageContents = [
      'Xin chào, tôi có câu hỏi về chương trình đào tạo.',
      'Khi nào là hạn nộp hồ sơ học bổng?',
      'Tôi muốn biết thêm về sự kiện sắp tới.',
      'Làm thế nào để đăng ký môn học?',
      'Cảm ơn bạn đã trả lời!',
      'Tôi cần hỗ trợ về vấn đề học phí.',
      'Bạn có thể gửi cho tôi thông tin về ký túc xá không?',
      'Khi nào có lịch thi cuối kỳ?'
    ];
    
    for (let i = 0; i < 200; i++) {
      const sender = students[Math.floor(Math.random() * students.length)];
      const receiver = Math.random() > 0.5 
        ? coordinators[Math.floor(Math.random() * coordinators.length)]
        : students[Math.floor(Math.random() * students.length)];
      
      if (sender._id.toString() !== receiver._id.toString()) {
        const message = await Message.create({
          sender: sender._id,
          receiver: receiver._id,
          content: messageContents[Math.floor(Math.random() * messageContents.length)],
          read: Math.random() > 0.5
        });
        messages.push(message);
      }
    }
    console.log(`✅ Created ${messages.length} messages`);
    
    // 10. Create Chat Sessions
    console.log('💭 Creating chat sessions...');
    const chatSessions = [];
    
    for (let i = 0; i < 80; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const questions = [
        'Làm thế nào để đăng ký học bổng?',
        'Khi nào có lịch thi cuối kỳ?',
        'Thông tin về chương trình trao đổi sinh viên?',
        'Làm sao để đăng ký ký túc xá?',
        'Yêu cầu tốt nghiệp là gì?',
        'Cơ hội việc làm sau khi tốt nghiệp?',
        'Lịch học của học kỳ này như thế nào?',
        'Làm thế nào để liên hệ với phòng đào tạo?'
      ];
      
      const question = questions[Math.floor(Math.random() * questions.length)];
      const answers = [
        'Bạn có thể đăng ký học bổng qua hệ thống online của VGU. Vui lòng chuẩn bị đầy đủ hồ sơ theo yêu cầu.',
        'Lịch thi cuối kỳ sẽ được thông báo trên hệ thống và email của sinh viên trước 2 tuần.',
        'VGU có nhiều chương trình trao đổi với các trường đại học tại Đức. Bạn có thể liên hệ phòng Quan hệ Quốc tế để biết thêm chi tiết.',
        'Bạn có thể đăng ký ký túc xá qua hệ thống online hoặc liên hệ trực tiếp phòng Công tác Sinh viên.',
        'Yêu cầu tốt nghiệp bao gồm: hoàn thành đủ số tín chỉ quy định, GPA đạt yêu cầu, và hoàn thành đồ án tốt nghiệp.',
        'Sinh viên VGU có nhiều cơ hội việc làm tại các công ty trong và ngoài nước, đặc biệt là các công ty Đức.',
        'Lịch học được cập nhật trên hệ thống. Bạn có thể xem chi tiết trong phần "Lịch học" của tài khoản.',
        'Bạn có thể liên hệ phòng đào tạo qua email: academic@vgu.edu.vn hoặc điện thoại: 028-7300-7300.'
      ];
      
      const answer = answers[Math.floor(Math.random() * answers.length)];
      
      const session = await ChatSession.create({
        user: student._id,
        title: `Câu hỏi về ${question.split('?')[0]}`,
        messages: [
          {
            role: 'user',
            content: question,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            role: 'assistant',
            content: answer,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
            isAccurate: Math.random() > 0.3 ? true : null
          }
        ],
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
      chatSessions.push(session);
    }
    console.log(`✅ Created ${chatSessions.length} chat sessions`);
    
    // Collect all login credentials
    const loginCredentials = {
      admin: {
        email: 'adminvgu@gmail.com',
        password: 'Admin123!',
        role: 'admin',
        name: admin.name
      },
      coordinators: coordinators.map((coord, index) => {
        const name = removeVietnameseDiacritics(coordinatorNames[index]);
        const nameLower = name.toLowerCase().replace(/\s+/g, '');
        return {
          email: `${nameLower}vgu@gmail.com`,
          password: `${nameLower}123!`,
          role: 'coordinator',
          name: coord.name,
          department: departments[index % departments.length].name
        };
      }),
      students: students.slice(0, 10).map(student => ({
        email: student.email,
        password: 'Student123!',
        role: 'student',
        name: student.name,
        studentId: student.studentId,
        department: departments.find(d => d._id.toString() === student.department.toString())?.name || 'N/A'
      }))
    };
    
    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin: 1`);
    console.log(`   - Coordinators: ${coordinators.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Events: ${events.length}`);
    console.log(`   - Scholarships: ${scholarships.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log(`   - Dataset entries: ${datasetEntries.length}`);
    console.log(`   - Messages: ${messages.length}`);
    console.log(`   - Chat sessions: ${chatSessions.length}`);
    
    console.log('\n🔑 Login credentials:');
    console.log(`\n📌 ADMIN:`);
    console.log(`   Email: ${loginCredentials.admin.email}`);
    console.log(`   Password: ${loginCredentials.admin.password}`);
    console.log(`   Name: ${loginCredentials.admin.name}`);
    
    console.log(`\n📌 COORDINATORS (${loginCredentials.coordinators.length}):`);
    loginCredentials.coordinators.forEach((coord, index) => {
      console.log(`   ${index + 1}. ${coord.name} (${coord.department})`);
      console.log(`      Email: ${coord.email}`);
      console.log(`      Password: ${coord.password}`);
    });
    
    console.log(`\n📌 STUDENTS (Sample - showing first 10 of ${students.length}):`);
    loginCredentials.students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.studentId}) - ${student.department}`);
      console.log(`      Email: ${student.email}`);
      console.log(`      Password: ${student.password}`);
    });
    console.log(`\n   Note: All ${students.length} students use password: Student123!`);
    console.log(`   Student emails follow pattern: {firstname}{lastname}{number}@student.vgu.edu.vn`);
    
    // Save credentials to file
    const fs = await import('fs');
    const credentialsFile = 'login-credentials.json';
    fs.writeFileSync(credentialsFile, JSON.stringify(loginCredentials, null, 2), 'utf8');
    console.log(`\n💾 Login credentials saved to: ${credentialsFile}`);
    
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await disconnectDB();
    process.exit(1);
  }
};

// Run seed
seedDatabase();

