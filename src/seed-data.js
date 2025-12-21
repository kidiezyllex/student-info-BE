import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database.js';
import User from './models/user.model.js';
import Department from './models/department.model.js';
import Topic from './models/topic.model.js';
import Dataset from './models/dataset.model.js';
import Message from './models/message.model.js';
import ChatSession from './models/chatSession.model.js';

dotenv.config();

// VGU Departments Data - IT Specializations
const vguDepartments = [
  {
    name: 'Computer Science',
    code: 'CS',
    description: 'In-depth training program in computer theory, algorithms, data structures and complexity analysis. Students are equipped with solid foundational knowledge to research and develop advanced technological solutions.'
  },
  {
    name: 'Software Engineering',
    code: 'SE',
    description: 'Training professional software engineers with skills in analysis, design, development and maintenance of large-scale software systems. Focus on software development processes, testing and technology project management.'
  },
  {
    name: 'Information Security',
    code: 'IS',
    description: 'Specialization training information security experts, cryptography, detection and prevention of cyber attacks. Students learn to protect data and systems from cybersecurity threats.'
  },
  {
    name: 'Artificial Intelligence',
    code: 'AI',
    description: 'Training program in machine learning, deep learning, natural language processing and computer vision. Students are equipped with knowledge to develop intelligent AI systems and apply them in practice.'
  },
  {
    name: 'Information Systems',
    code: 'ISYS',
    description: 'Training experts in information system management and integration in enterprises. Focus on business analysis, management system design and business process optimization through technology.'
  },
  {
    name: 'Computer Networks',
    code: 'NET',
    description: 'Specialization in computer network design, deployment and administration, network security, cloud computing and distributed systems. Students learn to build and operate modern network infrastructure.'
  },
  {
    name: 'Web Technology',
    code: 'WEB',
    description: 'In-depth training in web application development, frontend and backend development, responsive design and modern frameworks. Students learn to build modern and optimized web applications.'
  },
  {
    name: 'Game Development',
    code: 'GD',
    description: 'Training program in game development, game engines, computer graphics and gameplay design. Students learn to create video games from concept to finished product.'
  }
];

// Coordinator names for VGU
const coordinatorNames = [
  'Nguyen Van An Binh',
  'Tran Thi Bich Chi',
  'Le Van Cong Dung',
  'Pham Thi Dieu Linh',
  'Hoang Van Duc Huy',
  'Vu Thi Hong Nhung',
  'Dao Van Gia Khang',
  'Bui Thi Huong Lan'
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

export const seedDatabase = async (skipClear = false) => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database (if not already connected)
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState === 0) {
      await connectDB();
    }
    
    // Clear existing data (unless skipped)
    if (!skipClear) {
      console.log('🗑️  Clearing existing data...');
      await User.deleteMany({});
      await Department.deleteMany({});
      await Topic.deleteMany({});
      await Dataset.deleteMany({});
      await Message.deleteMany({});
      await ChatSession.deleteMany({});
    }
    
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
        street: 'Le Van Viet Street',
        ward: 'Hiep Phu Ward',
        district: 'District 9',
        city: 'Ho Chi Minh City',
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
      const password = 'Coordinator123!';
      
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
          position: 'Department Head',
          officeLocation: `Room ${101 + i}, Building A, VGU`,
          officeHours: 'Monday - Friday: 8:00 AM - 5:00 PM',
          specialization: ['Education Management', 'Curriculum Development'],
          qualifications: [
            {
              degree: 'Ph.D.',
              field: 'Engineering',
              institution: 'University of Technology',
              year: 2010 + i
            }
          ],
          researchInterests: ['Higher Education', 'Sustainable Development']
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
            street: `${Math.floor(Math.random() * 100) + 1} ABC Street`,
            ward: 'XYZ Ward',
            district: 'District ' + (Math.floor(Math.random() * 12) + 1),
            city: 'Ho Chi Minh City',
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
    
    // 5. Create Topics - All Types
    console.log('📝 Creating topics...');
    
    // 5.1. Events (15-20 items)
    console.log('📅 Creating events...');
    const eventTitles = [
      'IT Technology Conference 2024',
      'Software Development Workshop',
      'Artificial Intelligence and Machine Learning Seminar',
      'IT Department Open Day',
      'Information Security and Cybersecurity Workshop',
      'Blockchain and Cryptocurrency Conference',
      'Cloud Computing and DevOps Seminar',
      'Modern Web Development Workshop',
      'IT Career Fair',
      'Game Development Conference',
      'Mobile App Development Workshop',
      'Big Data and Data Science Seminar',
      'Internet of Things (IoT) Conference',
      'Cybersecurity and Ethical Hacking Workshop',
      'Agile and Scrum Methodology Seminar',
      'Full Stack Development Conference',
      'UI/UX Design for Applications Workshop',
      'Database Design and Optimization Seminar',
      'Microservices Architecture Conference',
      'API Development and Integration Workshop'
    ];
    
    for (let i = 0; i < 18; i++) {
      const title = eventTitles[i % eventTitles.length];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
      const endDate = new Date(startDate.getTime() + Math.random() * 8 * 60 * 60 * 1000);
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      await Topic.create({
        title: `${title}${i > 0 ? ` - Session ${i + 1}` : ''}`,
        description: `Detailed description about ${title.toLowerCase()}. This event is organized at VGU with the participation of many experts and students.`,
        type: 'event',
        startDate: startDate,
        endDate: endDate,
        location: `Hall ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, VGU`,
        department: department ? department._id : null,
        organizer: department ? department.name : 'VGU',
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 events`);
    
    // 5.2. Scholarships (15-20 items)
    console.log('💰 Creating scholarships...');
    const scholarshipTitles = [
      'IT Department Excellence Scholarship',
      'IT Academic Achievement Scholarship',
      'IT Scholarship for Students in Need',
      'Artificial Intelligence Research Scholarship',
      'Software Development Scholarship',
      'Information Security Scholarship',
      'Programming Talent Scholarship',
      'Game Development Scholarship',
      'Web Development Scholarship',
      'Mobile App Development Scholarship',
      'Data Science Scholarship',
      'Cloud Computing Scholarship',
      'Cybersecurity Scholarship',
      'Blockchain Technology Scholarship',
      'IoT and Embedded Systems Scholarship',
      'Full Stack Development Scholarship',
      'Machine Learning Research Scholarship',
      'Network Engineering Scholarship'
    ];
    const providers = [
      'VGU Foundation',
      'DAAD (German Academic Exchange Service)',
      'Ministry of Education and Training',
      'Siemens Corporation',
      'Bosch Corporation',
      'VGU Development Fund',
      'German Business Association in Vietnam'
    ];
    
    for (let i = 0; i < 17; i++) {
      const title = scholarshipTitles[i % scholarshipTitles.length];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const deadline = randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31));
      const department = Math.random() > 0.4 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const value = `${Math.floor(Math.random() * 20 + 5)}.000.000 VND`;
      
      await Topic.create({
        title: `${title}${i > 0 ? ` - Round ${i + 1}` : ''}`,
        description: `${title} for VGU students. This scholarship aims to encourage and support students in their learning and research process.`,
        type: 'scholarship',
        requirements: `GPA of ${(Math.random() * 1.5 + 2.5).toFixed(1)} or higher, no disciplinary violations, active participation in school activities.`,
        value: value,
        applicationDeadline: deadline,
        provider: provider,
        department: department ? department._id : null,
        eligibility: 'Students currently enrolled at VGU, from year 2 onwards',
        applicationProcess: 'Submit application through VGU online system, including: application form, transcript, recommendation letter.',
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 17 scholarships`);
    
    // 5.3. Notifications (15-20 items)
    console.log('🔔 Creating notifications...');
    const notificationTitles = [
      'IT Department Final Exam Schedule Announcement',
      'IT Major Course Registration Announcement',
      'New IT Scholarship Announcement',
      'Upcoming Technology Workshop Announcement',
      'Programmer Recruitment Announcement',
      'Artificial Intelligence Conference Announcement',
      'IT System Maintenance Announcement',
      'Technology Company Internship Registration Announcement',
      'Programming Competition Announcement',
      'New Technology Seminar Announcement',
      'DevOps Engineer Recruitment Announcement',
      'Information Security Workshop Announcement',
      'Online Course Registration Announcement',
      'Technology Startup Conference Announcement',
      'Full Stack Developer Recruitment Announcement',
      'Database Management Course Announcement',
      'Cloud Computing Training Program',
      'Cybersecurity Certification Program'
    ];
    
    for (let i = 0; i < 18; i++) {
      const title = notificationTitles[i % notificationTitles.length];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
      const endDate = new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
      const department = Math.random() > 0.5 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      await Topic.create({
        title: `${title} - ${new Date().toLocaleDateString('en-US')}`,
        description: `Detailed content about ${title.toLowerCase()}. Please read carefully and follow the instructions. For any questions, please contact the academic office.`,
        type: 'notification',
        department: department ? department._id : null,
        startDate: startDate,
        endDate: endDate,
        isImportant: Math.random() > 0.7,
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 notifications`);
    
    // 5.4. Jobs (15-20 items)
    console.log('💼 Creating job opportunities...');
    const jobTitles = [
      'Senior Software Engineer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'DevOps Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'Cybersecurity Specialist',
      'Cloud Architect',
      'Mobile App Developer',
      'UI/UX Designer',
      'Database Administrator',
      'System Administrator',
      'Network Engineer',
      'QA Engineer',
      'Product Manager',
      'Technical Lead',
      'Software Architect'
    ];
    const companies = [
      'FPT Software',
      'Viettel Solutions',
      'CMC Corporation',
      'TMA Solutions',
      'Luxoft Vietnam',
      'NashTech',
      'KMS Technology',
      'Rikkeisoft',
      'Toshiba Software',
      'Samsung Vietnam'
    ];
    
    for (let i = 0; i < 18; i++) {
      const position = jobTitles[i % jobTitles.length];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const salary = `${Math.floor(Math.random() * 20 + 10)}.000.000 - ${Math.floor(Math.random() * 30 + 30)}.000.000 VND`;
      
      await Topic.create({
        title: `${position} at ${company}`,
        description: `${company} is looking for a ${position.toLowerCase()}. Join our team and work on exciting projects with cutting-edge technologies.`,
        type: 'job',
        department: department ? department._id : null,
        company: company,
        position: position,
        salary: salary,
        contactInfo: `hr@${company.toLowerCase().replace(/\s+/g, '')}.com | Phone: 090${String(1000000 + i).slice(-7)}`,
        applicationDeadline: randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31)),
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 job opportunities`);
    
    // 5.5. Advertisements (15-20 items)
    console.log('📢 Creating advertisements...');
    const adTitles = [
      'New Laptop Discount for Students',
      'Programming Course Special Offer',
      'IT Certification Exam Preparation',
      'Software Development Bootcamp',
      'Cloud Computing Training Course',
      'Cybersecurity Workshop Registration',
      'Web Development Masterclass',
      'Mobile App Development Course',
      'Data Science Bootcamp',
      'AI and ML Training Program',
      'Database Design Course',
      'DevOps Certification Program',
      'UI/UX Design Workshop',
      'Blockchain Development Course',
      'Network Security Training',
      'Full Stack Development Program',
      'IT Career Counseling Service',
      'Tech Startup Incubator Program'
    ];
    
    for (let i = 0; i < 17; i++) {
      const title = adTitles[i % adTitles.length];
      const department = Math.random() > 0.4 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
      const endDate = new Date(startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
      
      await Topic.create({
        title: title,
        description: `Special promotion: ${title.toLowerCase()}. Limited time offer! Don't miss this opportunity to enhance your skills and advance your career.`,
        type: 'advertisement',
        department: department ? department._id : null,
        startDate: startDate,
        endDate: endDate,
        contactInfo: `info@vgu.edu.vn | Phone: 090${String(2000000 + i).slice(-7)}`,
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 17 advertisements`);
    
    // 5.6. Internships (15-20 items)
    console.log('🎓 Creating internship opportunities...');
    const internshipTitles = [
      'Software Development Intern',
      'Web Development Intern',
      'Mobile App Development Intern',
      'Data Science Intern',
      'Machine Learning Intern',
      'Cybersecurity Intern',
      'Cloud Computing Intern',
      'DevOps Intern',
      'UI/UX Design Intern',
      'Database Management Intern',
      'Network Engineering Intern',
      'QA Testing Intern',
      'Frontend Development Intern',
      'Backend Development Intern',
      'Full Stack Development Intern',
      'AI Research Intern',
      'Blockchain Development Intern',
      'IoT Development Intern'
    ];
    
    for (let i = 0; i < 18; i++) {
      const title = internshipTitles[i % internshipTitles.length];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
      const endDate = new Date(startDate.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000);
      
      await Topic.create({
        title: `${title} at ${company}`,
        description: `${company} offers internship opportunities for ${title.toLowerCase()}. Gain real-world experience and work on exciting projects.`,
        type: 'internship',
        department: department ? department._id : null,
        company: company,
        position: title,
        startDate: startDate,
        endDate: endDate,
        contactInfo: `internship@${company.toLowerCase().replace(/\s+/g, '')}.com | Phone: 090${String(3000000 + i).slice(-7)}`,
        applicationDeadline: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 internship opportunities`);
    
    // 5.7. Recruitment (15-20 items)
    console.log('🏢 Creating recruitment opportunities...');
    const recruitmentTitles = [
      'FPT Software - Software Engineer Recruitment',
      'Viettel Solutions - IT Specialist Recruitment',
      'CMC Corporation - Developer Recruitment',
      'TMA Solutions - Programmer Recruitment',
      'Luxoft Vietnam - Tech Talent Recruitment',
      'NashTech - Software Developer Recruitment',
      'KMS Technology - Engineer Recruitment',
      'Rikkeisoft - Developer Recruitment',
      'Toshiba Software - IT Professional Recruitment',
      'Samsung Vietnam - Technology Recruitment',
      'VNG Corporation - Software Engineer Recruitment',
      'Grab Vietnam - Tech Recruitment',
      'Shopee Vietnam - Developer Recruitment',
      'Lazada Vietnam - IT Recruitment',
      'MoMo - Fintech Developer Recruitment',
      'Tiki - E-commerce Developer Recruitment',
      'VinGroup - IT Professional Recruitment',
      'Vietcombank - IT Specialist Recruitment'
    ];
    
    for (let i = 0; i < 18; i++) {
      const title = recruitmentTitles[i % recruitmentTitles.length];
      const company = title.split(' - ')[0];
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      await Topic.create({
        title: title,
        description: `${company} is actively recruiting IT professionals. Join our team and be part of innovative projects. We offer competitive salary and benefits.`,
        type: 'recruitment',
        department: department ? department._id : null,
        company: company,
        contactInfo: `careers@${company.toLowerCase().replace(/\s+/g, '')}.com | Phone: 090${String(4000000 + i).slice(-7)}`,
        applicationDeadline: randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31)),
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 recruitment opportunities`);
    
    // 5.8. Volunteer (15-20 items)
    console.log('🤝 Creating volunteer opportunities...');
    const volunteerTitles = [
      'Teaching Programming to Children',
      'IT Support for Elderly Community',
      'Website Development for NGOs',
      'Digital Literacy Training',
      'Tech Mentorship Program',
      'Coding Bootcamp for Underprivileged Youth',
      'IT Equipment Donation Drive',
      'Free IT Consultation Service',
      'Community Tech Support',
      'Programming Workshop for Students',
      'IT Career Guidance Program',
      'Technology Awareness Campaign',
      'Open Source Project Contribution',
      'Tech Event Organization',
      'IT Training for Teachers',
      'Digital Transformation Support',
      'Cybersecurity Awareness Program',
      'Tech Innovation Challenge'
    ];
    
    for (let i = 0; i < 17; i++) {
      const title = volunteerTitles[i % volunteerTitles.length];
      const department = Math.random() > 0.4 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30));
      const endDate = new Date(startDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      await Topic.create({
        title: title,
        description: `Volunteer opportunity: ${title.toLowerCase()}. Make a difference in your community by sharing your IT knowledge and skills.`,
        type: 'volunteer',
        department: department ? department._id : null,
        startDate: startDate,
        endDate: endDate,
        location: `Various locations in Ho Chi Minh City`,
        contactInfo: `volunteer@vgu.edu.vn | Phone: 090${String(5000000 + i).slice(-7)}`,
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 17 volunteer opportunities`);
    
    // 5.9. Extracurricular (15-20 items)
    console.log('🎯 Creating extracurricular activities...');
    const extracurricularTitles = [
      'Programming Club Meeting',
      'Hackathon Competition',
      'Tech Talk Series',
      'Code Review Session',
      'Algorithm Study Group',
      'Open Source Project Collaboration',
      'Tech Innovation Lab',
      'Startup Pitch Competition',
      'IT Career Networking Event',
      'Tech Quiz Competition',
      'Programming Contest',
      'Tech Exhibition',
      'IT Alumni Meetup',
      'Tech Startup Showcase',
      'Innovation Challenge',
      'Tech Mentorship Program',
      'IT Research Group',
      'Tech Community Building'
    ];
    
    for (let i = 0; i < 18; i++) {
      const title = extracurricularTitles[i % extracurricularTitles.length];
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
      const endDate = new Date(startDate.getTime() + Math.random() * 4 * 60 * 60 * 1000);
      
      await Topic.create({
        title: title,
        description: `Extracurricular activity: ${title.toLowerCase()}. Join fellow students and enhance your skills through hands-on activities and collaboration.`,
        type: 'extracurricular',
        department: department ? department._id : null,
        startDate: startDate,
        endDate: endDate,
        location: `Room ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 10) + 1}, VGU`,
        organizer: department ? department.name : 'VGU Student Council',
        createdBy: creator._id
      });
    }
    console.log(`✅ Created 18 extracurricular activities`);
    
    // 8. Create Dataset entries
    console.log('📚 Creating dataset entries...');
    const datasetEntries = [];
    const categories = ['general', 'scholarship', 'event', 'department', 'faq'];
    
    const faqData = [
      { key: 'What is VGU?', value: 'VGU (Vietnamese-German University) is a public university established based on the German applied university model, specializing in Information Technology education.' },
      { key: 'What IT specializations are available at VGU?', value: 'VGU offers the following specializations: Computer Science, Software Engineering, Information Security, Artificial Intelligence, Information Systems, Computer Networks, Web Technology, and Game Development.' },
      { key: 'How to apply for IT scholarships?', value: 'Students can apply for IT scholarships through VGU online system. Required documents include transcript, application form, project portfolio (if available) and related documents.' },
      { key: 'What is the IT Department academic schedule?', value: 'The IT Department academic schedule is divided into 2 semesters: Fall (starting September) and Spring (starting February). Each semester lasts approximately 15 weeks with many practical courses and projects.' },
      { key: 'How to contact the IT Department?', value: 'You can contact the IT Department via email: cs@vgu.edu.vn or phone: 028-7300-7300. The department office is open Monday to Friday, 8:00 AM - 5:00 PM.' },
      { key: 'What is the tuition fee for IT programs at VGU?', value: 'IT program tuition at VGU is calculated per credit. Students can refer to the tuition fee table on the official school website. There are many scholarship programs available.' },
      { key: 'Internship and job opportunities for IT students?', value: 'The IT Department has many cooperation programs with technology companies domestically and internationally. Students have internship opportunities at companies such as FPT, Viettel, Samsung, and German companies in Vietnam.' },
      { key: 'IT program admission requirements?', value: 'Admission requirements: High school graduation, National High School Exam score meeting the threshold (usually 24 points or higher), good English proficiency (IELTS 5.5+ or equivalent).' },
      { key: 'Study transfer opportunities to Germany?', value: 'VGU has many exchange and transfer programs with universities in Germany. IT students can study 2 years at VGU and 2 years in Germany to receive a dual degree.' },
      { key: 'What is special about IT training program at VGU?', value: 'The IT program at VGU follows the German applied university model, combining theory and practice. Students practice extensively with real projects, have internship opportunities at enterprises and participate in programming competitions.' },
      { key: 'Main courses in the IT program?', value: 'The IT program includes: Basic and Advanced Programming, Data Structures and Algorithms, Databases, Computer Networks, Information Security, Artificial Intelligence, Software Development, and Graduation Project.' },
      { key: 'Research opportunities for IT students?', value: 'IT students have many opportunities to participate in scientific research with faculty members, join research projects on AI, Machine Learning, Cybersecurity, and new technologies. There are many research scholarships for excellent students.' }
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
        'CS': 'Computer Science graduates can work at major technology companies such as Google, Microsoft, FPT Software, Viettel, or German companies in Vietnam in positions like Software Engineer, Research Scientist, or Algorithm Developer.',
        'SE': 'Software Engineering graduates have opportunities to work at software development companies, technology startups in positions like Software Developer, Full Stack Developer, or Technical Lead.',
        'IS': 'Information Security graduates can work at security companies, banks, financial institutions in positions like Security Engineer, Penetration Tester, or Security Consultant.',
        'AI': 'Artificial Intelligence graduates have opportunities to work at AI companies, data science firms in positions like AI Engineer, Machine Learning Engineer, or Data Scientist.',
        'ISYS': 'Information Systems graduates can work at technology companies, enterprises in positions like System Analyst, Business Analyst, or IT Consultant.',
        'NET': 'Computer Networks graduates have opportunities to work at telecommunications companies, cloud providers in positions like Network Engineer, Cloud Engineer, or DevOps Engineer.',
        'WEB': 'Web Technology graduates can work at web development companies, agencies in positions like Frontend Developer, Backend Developer, or Full Stack Developer.',
        'GD': 'Game Development graduates have opportunities to work at game studios, entertainment companies in positions like Game Developer, Game Designer, or Game Programmer.'
      };
      
      const entries = [
        { key: `${dept.name} Training Program`, value: dept.description },
        { key: `${dept.name} Career Opportunities`, value: jobOpportunities[dept.code] || `${dept.name} graduates at VGU have many job opportunities at technology companies domestically and internationally.` },
        { key: `${dept.code} Admission Requirements`, value: `${dept.name} admission requirements: High school graduation, National High School Exam score meeting the threshold (usually 24 points or higher), good English proficiency (IELTS 5.5+ or equivalent), passion for technology and programming.` }
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
    
    // Add scholarship entries from topics
    const scholarshipTopics = await Topic.find({ type: 'scholarship' }).limit(10);
    for (const scholarship of scholarshipTopics) {
      const entry = await Dataset.create({
        key: scholarship.title,
        value: `${scholarship.description}. Requirements: ${scholarship.requirements || 'N/A'}. Value: ${scholarship.value || 'N/A'}. Deadline: ${scholarship.applicationDeadline ? scholarship.applicationDeadline.toLocaleDateString('en-US') : 'N/A'}.`,
        category: 'scholarship',
        department: scholarship.department,
        createdBy: admin._id,
        updatedBy: admin._id
      });
      datasetEntries.push(entry);
    }
    
    // Add event entries from topics
    const eventTopics = await Topic.find({ type: 'event' }).limit(10);
    for (const event of eventTopics) {
      const entry = await Dataset.create({
        key: event.title,
        value: `${event.description}. Time: ${event.startDate ? event.startDate.toLocaleDateString('en-US') : 'N/A'} - ${event.endDate ? event.endDate.toLocaleDateString('en-US') : 'N/A'}. Location: ${event.location || 'N/A'}.`,
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
      'Hello, I have a question about the training program.',
      'When is the scholarship application deadline?',
      'I would like to know more about the upcoming event.',
      'How to register for courses?',
      'Thank you for your response!',
      'I need support regarding tuition fees.',
      'Can you send me information about the dormitory?',
      'When will the final exam schedule be available?'
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
        'How to apply for scholarships?',
        'When will the final exam schedule be available?',
        'Information about student exchange programs?',
        'How to register for the dormitory?',
        'What are the graduation requirements?',
        'Job opportunities after graduation?',
        'What is the schedule for this semester?',
        'How to contact the academic office?'
      ];
      
      const question = questions[Math.floor(Math.random() * questions.length)];
      const answers = [
        'You can apply for scholarships through VGU online system. Please prepare all required documents.',
        'The final exam schedule will be announced on the system and student email 2 weeks in advance.',
        'VGU has many exchange programs with universities in Germany. You can contact the International Relations Office for more details.',
        'You can register for the dormitory through the online system or contact the Student Affairs Office directly.',
        'Graduation requirements include: completing the required number of credits, meeting GPA requirements, and completing the graduation project.',
        'VGU students have many job opportunities at companies domestically and internationally, especially German companies.',
        'The class schedule is updated on the system. You can view details in the "Class Schedule" section of your account.',
        'You can contact the academic office via email: academic@vgu.edu.vn or phone: 028-7300-7300.'
      ];
      
      const answer = answers[Math.floor(Math.random() * answers.length)];
      
      const session = await ChatSession.create({
        user: student._id,
        title: `Question about ${question.split('?')[0]}`,
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
          password: 'Coordinator123!',
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
    
    const topicCounts = await Topic.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const totalTopics = await Topic.countDocuments();
    
    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Admin: 1`);
    console.log(`   - Coordinators: ${coordinators.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Topics (Total: ${totalTopics}):`);
    topicCounts.forEach(({ _id, count }) => {
      console.log(`     * ${_id}: ${count}`);
    });
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
    
    // Only disconnect if running directly (not imported)
    const isDirectExecution = process.argv[1] && process.argv[1].includes('seed');
    if (isDirectExecution) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    const isDirectExecution = process.argv[1] && process.argv[1].includes('seed');
    if (isDirectExecution) {
      await disconnectDB();
      process.exit(1);
    } else {
      throw error; // Re-throw if called from another script
    }
  }
};

