CREATE TABLE tb_teacher_evaluation (
  evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(50) NOT NULL,
  agency_name VARCHAR(255),
  score_1 INT,
  score_2 INT,
  score_3 INT,
  score_4 INT,
  score_5 INT,
  score_6 INT,
  score_7 INT,
  score_8 INT,
  score_9 INT,
  score_10 INT,
  total_score INT,
  comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- ตารางหน่วยงานที่อาจารย์ฝ่ายสหกิจยืนยันส่งมา
CREATE TABLE IF NOT EXISTS tb_confirmed_agencies (
  open_id INT PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE DATABASE intern_prep_it;
USE intern_prep_it;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'agency') NOT NULL,
    gender VARCHAR(10),
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    faculty VARCHAR(100),
    major VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    advisor VARCHAR(100),
    disease VARCHAR(100),
    image VARCHAR(255)
);

CREATE TABLE agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    contact VARCHAR(100),
    capacity INT,
    description TEXT
);
CREATE TABLE work_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    log_date DATE,
    details TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    file VARCHAR(255),
    submitted_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    teacher_id INT,
    score INT,
    comment TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);
///////////////////////////////////////////////////////////////////

CREATE DATABASE IF NOT EXISTS tb_student_db;
USE tb_student_db;

DROP TABLE IF EXISTS tb_student;
DROP TABLE IF EXISTS tb_teacher;
DROP TABLE IF EXISTS tb_supervisor;
DROP TABLE IF EXISTS tb_open_for_students;

-- ตารางนักศึกษา
CREATE TABLE tb_student (
  id INT(12) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  student_gender VARCHAR(5) NOT NULL,
  student_major VARCHAR(20) NOT NULL,
  student_fac VARCHAR(20) NOT NULL,
  student_tel VARCHAR(10) NOT NULL,
  student_email VARCHAR(255) NOT NULL,
  student_address VARCHAR(255) NOT NULL,
  student_advisor VARCHAR(100) NOT NULL,
  student_sick VARCHAR(100),
  image_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตารางอาจารย์ฝ่ายสหกิจ
CREATE TABLE tb_teacher (
  teacher_id INT(13) PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  gender VARCHAR(5) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  faculty VARCHAR(255) NOT NULL,
  phone_number VARCHAR(10) NOT NULL,
  address VARCHAR(250) NOT NULL,
  email VARCHAR(255) NOT NULL
);

-- ตารางหน่วยงาน/หัวหน้าหน่วยงาน
CREATE TABLE tb_supervisor (
  supervisor_id INT(13) PRIMARY KEY AUTO_INCREMENT,
  supervisor_name VARCHAR(255) NOT NULL,
  agency_name VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  gender VARCHAR(5) NOT NULL,
  position VARCHAR(255),
  phone_number VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tb_open_for_students (
  open_id INT AUTO_INCREMENT PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  status VARCHAR(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ตารางบันทึกการลงทะเบียนฝึกงาน
CREATE TABLE tb_internship_enrollment (
  request_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
    agency_name VARCHAR(255),
  open_id INT NOT NULL,
  schedule_day ENUM('วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์') NOT NULL,
  selected_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('รอการอนุมัติ','อนุมัติแล้ว','ไม่อนุมัติ') DEFAULT 'รอการอนุมัติ',
  training_status ENUM('ยังไม่เริ่ม','กำลังฝึก','พักการฝึกชั่วคราว','สิ้นสุดการฝึก') DEFAULT 'ยังไม่เริ่ม',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tb_student(student_id),
  FOREIGN KEY (open_id) REFERENCES tb_confirmed_agencies(open_id)
);

DROP TABLE IF EXISTS tb_internship_enrollment;
DROP TABLE IF EXISTS tb_confirmed_agencies;

CREATE TABLE tb_confirmed_agencies (
  open_id INT PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  selected_students INT(20) DEFAULT 0;
);

CREATE TABLE tb_internship_enrollment (
  request_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  agency_name VARCHAR(255),
  open_id INT NOT NULL,
  schedule_day ENUM('วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์') NOT NULL,
  status ENUM('รอการอนุมัติ','อนุมัติแล้ว','ไม่อนุมัติ') DEFAULT 'รอการอนุมัติ',
  training_status ENUM('ยังไม่เริ่ม','กำลังฝึก','พักการฝึกชั่วคราว','สิ้นสุดการฝึก') DEFAULT 'ยังไม่เริ่ม',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tb_student(student_id),
  FOREIGN KEY (open_id) REFERENCES tb_confirmed_agencies(open_id)
);

CREATE TABLE tb_Student_Work_Log (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  work_date DATE,
  student_id INT(12),
  student_name VARCHAR(50),
  agency_name VARCHAR(255),
  work_report TEXT,
  checkin_time TIME,
  checkout_time TIME,
  hours_worked FLOAT,
  problem TEXT,
  status ENUM('รอดำเนินการ', 'ยืนยันแล้ว', 'ปฏิเสธ')
);

CREATE TABLE tb_student_report (
  report_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(12) NOT NULL,
  student_name VARCHAR(50) NOT NULL,
  report_file VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  status ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ไม่ผ่าน') DEFAULT 'รออนุมัติ'
);

CREATE TABLE tb_teacher_evaluation (
    evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    student_name VARCHAR(50) NOT NULL,
    agency_name VARCHAR(255),
    score_1 INT,
    score_2 INT,
    score_3 INT,
    score_4 INT,
    score_5 INT,
    score_6 INT,
    score_7 INT,
    score_8 INT,
    score_9 INT,
    score_10 INT,
    total_score INT,
    comment TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

---------การประเมินจากหน่วยงาน --------
CREATE TABLE tb_agency_evaluation (
  evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  agency_name VARCHAR(255) NOT NULL,
  supervisor_name VARCHAR(255) NOT NULL,
  score_1 INT,
  score_2 INT,
  score_3 INT,
  score_4 INT,
  score_5 INT,
  score_6 INT,
  score_7 INT,
  score_8 INT,
  score_9 INT,
  score_10 INT,
  total_score INT,
  comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
--------------------------------------------------------------------------------------------------

------------------------------------------------ฐานข้อมูลใหม่---------------------------------------
CREATE DATABASE IF NOT EXISTS intern_prep_it CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE intern_prep_it;

-- 1. tb_student
CREATE TABLE IF NOT EXISTS tb_student (
  student_id VARCHAR(20) PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  major VARCHAR(100),
  faculty VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  advisor VARCHAR(100),
  disease VARCHAR(100),
  image VARCHAR(255),
  password VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2. tb_teacher
CREATE TABLE IF NOT EXISTS tb_teacher (
  teacher_id VARCHAR(20) PRIMARY KEY,
  teacher_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  major VARCHAR(100),
  faculty VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  password VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3. tb_supervisor
CREATE TABLE IF NOT EXISTS tb_supervisor (
  supervisor_id INT AUTO_INCREMENT PRIMARY KEY,
  supervisor_name VARCHAR(100) NOT NULL,
  agency_name VARCHAR(255),
  username VARCHAR(50),
  password VARCHAR(255),
  gender VARCHAR(10),
  position VARCHAR(100),
  phone_number VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 4. tb_open_for_students
CREATE TABLE IF NOT EXISTS tb_open_for_students (
  open_id INT AUTO_INCREMENT PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255),
  phone_number VARCHAR(20),
  status VARCHAR(1) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 5. tb_confirmed_agencies
CREATE TABLE IF NOT EXISTS tb_confirmed_agencies (
  open_id INT PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  location VARCHAR(255),
  phone_number VARCHAR(20),
  selected_students INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 6. tb_internship_enrollment
CREATE TABLE IF NOT EXISTS tb_internship_enrollment (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  agency_name VARCHAR(255),
  open_id INT NOT NULL,
  schedule_day ENUM('วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์') NOT NULL,
  status ENUM('รอการอนุมัติ','อนุมัติแล้ว','ไม่อนุมัติ') DEFAULT 'รอการอนุมัติ',
  training_status ENUM('ยังไม่เริ่ม','กำลังฝึก','พักการฝึกชั่วคราว','สิ้นสุดการฝึก') DEFAULT 'ยังไม่เริ่ม',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tb_student(student_id),
  FOREIGN KEY (open_id) REFERENCES tb_confirmed_agencies(open_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 7. tb_student_work_log
CREATE TABLE IF NOT EXISTS tb_student_work_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_date DATE,
  student_id VARCHAR(20),
  student_name VARCHAR(100),
  agency_name VARCHAR(255),
  work_report TEXT,
  checkin_time TIME,
  checkout_time TIME,
  hours_worked FLOAT,
  problem TEXT,
  status ENUM('รอดำเนินการ', 'ยืนยันแล้ว', 'ปฏิเสธ') DEFAULT 'รอดำเนินการ',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 8. tb_student_report
CREATE TABLE IF NOT EXISTS tb_student_report (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  report_file VARCHAR(255) NOT NULL,
  report_file_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  status ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ไม่ผ่าน') DEFAULT 'รออนุมัติ'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 9. tb_teacher_evaluation
CREATE TABLE IF NOT EXISTS tb_teacher_evaluation (
  evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  agency_name VARCHAR(255),
  score_1 INT,
  score_2 INT,
  score_3 INT,
  score_4 INT,
  score_5 INT,
  score_6 INT,
  score_7 INT,
  score_8 INT,
  score_9 INT,
  score_10 INT,
  total_score INT,
  comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 10. tb_agency_evaluation
CREATE TABLE IF NOT EXISTS tb_agency_evaluation (
  evaluation_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  agency_name VARCHAR(255) NOT NULL,
  supervisor_name VARCHAR(255) NOT NULL,
  score_1 INT,
  score_2 INT,
  score_3 INT,
  score_4 INT,
  score_5 INT,
  score_6 INT,
  score_7 INT,
  score_8 INT,
  score_9 INT,
  score_10 INT,
  total_score INT,
  comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
 ----------------------------------------ฐานข้อมูลใหม---------------------------------------------