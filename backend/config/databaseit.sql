CREATE DATABASE IF NOT EXISTS intern_prep_it CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE intern_prep_it;

-- 3.1 tb_teacher (ข้อมูลอาจารย์ฝ่ายสหกิจ)
CREATE TABLE IF NOT EXISTS tb_teacher (
  teacher_id INT(13) PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  gender ENUM('ชาย','หญิง') NOT NULL,
  username VARCHAR(255) NOT NULL,
  password CHAR(32) NOT NULL;
  major VARCHAR(255),
  faculty VARCHAR(255),
  phone_number VARCHAR(10),
  address VARCHAR(250),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.2 tb_supervisor (ข้อมูลหัวหน้าหน่วยงาน)
CREATE TABLE IF NOT EXISTS tb_supervisor (
  supervisor_id INT(13) PRIMARY KEY AUTO_INCREMENT,
  supervisor_name VARCHAR(255) NOT NULL,
  agency_name VARCHAR(255),
  username VARCHAR(255) NOT NULL,
  password CHAR(32) NOT NULL;
  gender ENUM('ชาย','หญิง') NOT NULL,
  position VARCHAR(255),
  phone_number VARCHAR(10),  
  address VARCHAR(250),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.3 tb_student (ข้อมูลนักศึกษา)
CREATE TABLE IF NOT EXISTS tb_student (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(12) NOT NULL,
  password CHAR(32) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_gender ENUM('ชาย','หญิง') NOT NULL,
  student_major VARCHAR(20),
  student_fac VARCHAR(50),
  student_class VARCHAR(50),
  student_year VARCHAR(10),
  student_semester VARCHAR(10),
  student_tel VARCHAR(10),
  student_email VARCHAR(255),
  student_address VARCHAR(255),
  student_advisor VARCHAR(100),
  student_sick VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  image_path VARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.4 tb_confirmed_agencies (ข้อมูลเปิดรับนักศึกษาของหน่วยงาน)
CREATE TABLE IF NOT EXISTS tb_confirmed_agencies (
  open_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  agency_name VARCHAR(255) NOT NULL,
  capacity	int(20),
  address VARCHAR(250),
  phone_number VARCHAR(20),
  student_semester	varchar(10)
  student_year	varchar(10)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  selected_students INT(20) DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.5 tb_internship_enrollment (ข้อมูลลงทะเบียนขอเข้าฝึก)
CREATE TABLE IF NOT EXISTS tb_internship_enrollment (
  request_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  agency_name VARCHAR(255),
  open_id INT(13) NOT NULL,
  schedule_day ENUM('วันจันทร์','วันอังคาร','วันพุธ','วันพฤหัสบดี','วันศุกร์'),
  status ENUM('รอการอนุมัติ','อนุมัติแล้ว','ไม่อนุมัติ') DEFAULT 'รอการอนุมัติ',
  training_status ENUM('ยังไม่เริ่ม','กำลังฝึก','พักการฝึกชั่วคราว','สิ้นสุดการฝึก') DEFAULT 'ยังไม่เริ่ม',
  status VARCHAR(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (open_id) REFERENCES tb_confirmed_agencies(open_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.6 tb_open_student (ข้อมูลตารางระบุวันฝึกของนักศึกษา)
CREATE TABLE IF NOT EXISTS tb_open_for_students (
  open_id INT(13) PRIMARY KEY AUTO_INCREMENT,
  agency_name VARCHAR(255) NOT NULL,
  capacity	int(20),
  selected_count INT(11) DEFAULT 0,
  address VARCHAR(250),
  phone_number VARCHAR(20),
  student_year VARCHAR(10),
  student_semester VARCHAR(10),
  status VARCHAR(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.7 tb_student_work_log (ข้อมูลบันทึกการปฏิบัติงานของนักศึกษา)
CREATE TABLE IF NOT EXISTS tb_student_work_log (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  work_date DATE,
  student_id VARCHAR(12),
  agency_name VARCHAR(255),
  student_name VARCHAR(50),
  work_report TEXT,
  checkin_time TIME,
  checkout_time TIME,
  hours_worked FLOAT,
  problem TEXT,
  status ENUM('รอดำเนินการ', 'ยืนยันแล้ว', 'ปฏิเสธ') DEFAULT 'รอดำเนินการ'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.8 tb_student_report (ข้อมูลการส่งเล่มรายงานของนักศึกษา)
CREATE TABLE IF NOT EXISTS tb_student_report (
  report_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(12) NOT NULL,
  student_name VARCHAR(50) NOT NULL,
  report_file VARCHAR(255) NOT NULL,
  report_file_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  status ENUM('รออนุมัติ', 'อนุมัติแล้ว', 'ไม่ผ่าน') DEFAULT 'รออนุมัติ'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.9 tb_teacher_evaluation (ข้อมูลการประเมินของอาจารย์ฝ่ายสหกิจ)
CREATE TABLE IF NOT EXISTS tb_teacher_evaluation (
  evaluation_id INT(11) PRIMARY KEY AUTO_INCREMENT,
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 3.10 tb_agency_evaluation (ข้อมูลการประเมินของหน่วยงาน)
CREATE TABLE IF NOT EXISTS tb_agency_evaluation (
  evaluation_id INT(11) PRIMARY KEY AUTO_INCREMENT,
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


ALTER TABLE tb_teacher
MODIFY COLUMN password CHAR(32) NOT NULL;

ALTER TABLE tb_supervisor
MODIFY COLUMN password CHAR(32) NOT NULL;

ALTER TABLE tb_student
MODIFY COLUMN password CHAR(32) NOT NULL;