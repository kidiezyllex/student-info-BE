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
      await Event.deleteMany({});
      await Scholarship.deleteMany({});
      await Notification.deleteMany({});
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
    
    // 5. Create Events
    console.log('📅 Creating events...');
    const events = [];
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
    
    for (let i = 0; i < 80; i++) {
      const title = eventTitles[Math.floor(Math.random() * eventTitles.length)];
      const startDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
      const endDate = new Date(startDate.getTime() + Math.random() * 8 * 60 * 60 * 1000);
      const department = Math.random() > 0.3 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      
      const event = await Event.create({
        title: `${title}${i > 0 ? ` - Session ${i + 1}` : ''}`,
        description: `Detailed description about ${title.toLowerCase()}. This event is organized at VGU with the participation of many experts and students.`,
        startDate: startDate,
        endDate: endDate,
        location: `Hall ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, VGU`,
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
      'IoT and Embedded Systems Scholarship'
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
    
    for (let i = 0; i < 60; i++) {
      const title = scholarshipTitles[Math.floor(Math.random() * scholarshipTitles.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const deadline = randomDate(new Date(2024, 6, 1), new Date(2025, 11, 31));
      const department = Math.random() > 0.4 ? departments[Math.floor(Math.random() * departments.length)] : null;
      const creator = Math.random() > 0.5 ? admin : coordinators[Math.floor(Math.random() * coordinators.length)];
      const value = `${Math.floor(Math.random() * 20 + 5)}.000.000 VND`;
      
      const scholarship = await Scholarship.create({
        title: `${title}${i > 0 ? ` - Round ${i + 1}` : ''}`,
        description: `${title} for VGU students. This scholarship aims to encourage and support students in their learning and research process.`,
        requirements: `GPA of ${(Math.random() * 1.5 + 2.5).toFixed(1)} or higher, no disciplinary violations, active participation in school activities.`,
        value: value,
        applicationDeadline: deadline,
        provider: provider,
        department: department ? department._id : null,
        eligibility: 'Students currently enrolled at VGU, from year 2 onwards',
        applicationProcess: 'Submit application through VGU online system, including: application form, transcript, recommendation letter.',
        createdBy: creator._id
      });
      scholarships.push(scholarship);
    }
    console.log(`✅ Created ${scholarships.length} scholarships`);
    
    // 7. Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = [];
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
      'Full Stack Developer Recruitment Announcement'
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
        title: `${title} - ${new Date().toLocaleDateString('en-US')}`,
        content: `Detailed content about ${title.toLowerCase()}. Please read carefully and follow the instructions. For any questions, please contact the academic office.`,
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
    
    // Add scholarship entries
    for (const scholarship of scholarships.slice(0, 10)) {
      const entry = await Dataset.create({
        key: scholarship.title,
        value: `${scholarship.description}. Requirements: ${scholarship.requirements}. Value: ${scholarship.value}. Deadline: ${scholarship.applicationDeadline.toLocaleDateString('en-US')}.`,
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
        value: `${event.description}. Time: ${event.startDate.toLocaleDateString('en-US')} - ${event.endDate.toLocaleDateString('en-US')}. Location: ${event.location}.`,
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

