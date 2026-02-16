import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaEnvelope, FaPhoneAlt, FaHome, FaUniversity, FaBookOpen, FaUserTie, FaHeartbeat, FaCalendarAlt, FaEdit, FaImage } from 'react-icons/fa';

function StudentProfile() {
	const handleCancelProfile = () => {
		setEditProfile(profile);
		setEditMode(false);
	};
	const handleProfileSave = async () => {
		if (!editProfile || !editProfile.student_id) return;
		try {
			const res = await fetch(`http://localhost:5000/api/register/student/student/${editProfile.student_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					student_gender: editProfile.gender,
					student_name: editProfile.name,
					student_fac: editProfile.faculty,
					student_major: editProfile.major,
					student_class: editProfile.student_class, // หมู่เรียน
					student_year: editProfile.student_year,   // ปีการศึกษา
					student_semester: editProfile.student_semester, // ภาคเรียน
					student_email: editProfile.email,
					student_tel: editProfile.phone,
					student_address: editProfile.address,
					student_advisor: editProfile.advisor,
					student_sick: editProfile.disease
				})
			});
			const data = await res.json();
			if (res.ok) {
				setProfile(editProfile);
				setEditMode(false);
			} else {
				alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
			}
		} catch (error) {
			alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
		}
	};
	const [profile, setProfile] = useState({});
	const [editMode, setEditMode] = useState(false);
	const [editImageMode, setEditImageMode] = useState(false);
	const [newImage, setNewImage] = useState(null);
	const [editProfile, setEditProfile] = useState(null);

	useEffect(() => {
		const fetchProfile = async () => {
			const studentIdFromStorage = localStorage.getItem('student_id');
			if (!studentIdFromStorage) return;
			const res = await fetch(`http://localhost:5000/api/register/student/student?student_id=${studentIdFromStorage}`);
			const data = await res.json();
			if (Array.isArray(data) && data.length > 0) {
				const student = data[0];
				setProfile({
					student_id: student.student_id,
					name: student.student_name,
					faculty: student.student_fac,
					major: student.student_major,
					student_class: student.student_class, // หมู่เรียน
					student_year: student.student_year,   // ปีการศึกษา
					student_semester: student.student_semester, // ภาคเรียน
					email: student.student_email,
					phone: student.student_tel,
					address: student.student_address,
					advisor: student.student_advisor,
					disease: student.student_sick,
					gender: student.student_gender,
					birthday: student.student_birthday,
					citizen_id: student.student_citizen_id,
					religion: student.student_religion,
					nationality: student.student_nationality,
					image: student.image_path,
					created_at: student.created_at,
					updated_at: student.updated_at,
				});
			}
		};
		fetchProfile();
	}, []);

	useEffect(() => {
		setEditProfile(profile);
	}, [profile]);

	const handleEdit = () => setEditMode(true);
	const handleEditImage = () => setEditImageMode(true);
	const handleImageChange = e => {
		if (e.target.files && e.target.files[0]) {
			setNewImage(e.target.files[0]);
		}
	};

	const handleImageSave = async () => {
		if (!newImage) return;
		const formData = new FormData();
		formData.append('student_id', profile.student_id);
		formData.append('image', newImage);
		try {
			const res = await fetch('http://localhost:5000/api/student/upload-image', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (res.ok && data.imagePath) {
				setProfile(prev => ({ ...prev, image: data.imagePath }));
				setEditImageMode(false);
				setNewImage(null);
			} else {
				alert(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
			}
		} catch (error) {
			alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
		}
	};
	const handleCancelImage = () => {
		setNewImage(null);
		setEditImageMode(false);
	};
	const handleProfileChange = e => {
		setEditProfile({ ...editProfile, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		Object.keys(editProfile).forEach(key => {
			if (key === 'image_path' && e.target.image_path && e.target.image_path.files.length > 0) {
				formData.append('image', e.target.image_path.files[0]);
			} else if (key !== 'confirmPassword') {
				formData.append(key, editProfile[key]);
			}
		});
		try {
			const res = await fetch('http://localhost:5000/api/register/student', {
				method: 'POST',
				body: formData
			});
			// ...existing code...
		} catch (error) {
			console.error('Error submitting profile:', error);
		}
	};

	


// ฟังก์ชันแปลงเพศเป็นภาษาไทย
	const getGenderThai = (gender) => {
		if (!gender) return '';
		const g = gender.toLowerCase();
		if (g === 'female' || g === 'femal') return 'หญิง';
		if (g === 'male') return 'ชาย';
		return gender;
	};

	// ฟังก์ชันแปลงวันที่และเวลาเป็นรูปแบบ 2025-09-02 14:11:12
	const formatDateTime = (dateStr) => {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		const pad = n => n.toString().padStart(2, '0');
		const year = d.getFullYear();
		const month = pad(d.getMonth() + 1);
		const day = pad(d.getDate());
		const hour = pad(d.getHours());
		const min = pad(d.getMinutes());
		const sec = pad(d.getSeconds());
		return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
	};

	return (
		<div className="student-profile" style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '16px', boxShadow: '0 2px 12px rgba(44,62,80,0.08)', maxWidth: '700px', margin: '2rem auto' }}>
			<h2 style={{ marginBottom: '1.5rem', color: '#16a085', display: 'flex', alignItems: 'center', gap: '0.7rem' }}><FaUserGraduate style={{ marginRight: 6 }} /> โปรไฟล์นักศึกษา</h2>
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
				<div style={{ position: 'relative' }}>
					{/* แสดงรูปภาพจาก image_path ที่ backend ส่งกลับมา */}
					<img
						src={
							profile && profile.image
								? profile.image.startsWith('http')
									? profile.image
									: `http://localhost:5000${profile.image}`
								: ''
						}
						alt="profile"
						width={120}
						height={120}
						style={{ borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(44,62,80,0.12)' }}
					/>
					<button onClick={handleEditImage} style={{ position: 'absolute', bottom: 0, right: 0, background: '#2979ff', color: '#fff', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(44,62,80,0.18)', cursor: 'pointer' }}><FaImage /></button>
				</div>
				{editImageMode && (
					<div style={{ marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(44,62,80,0.12)' }}>
						<input type="file" accept="image/*" onChange={handleImageChange} />
						{newImage instanceof File && (
							<img src={URL.createObjectURL(newImage)} alt="preview" width={100} style={{ borderRadius: '8px', marginTop: '1rem' }} />
						)}
						<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
							<button onClick={handleImageSave} style={{ background: '#2979ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}>บันทึกรูปภาพ</button>
							<button onClick={handleCancelImage} style={{ background: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}>ยกเลิก</button>
						</div>
					</div>
				)}
			</div>
			{!editMode ? (
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.student_id ? profile.student_id : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.name ? profile.name : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUniversity /> <span>คณะ:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.faculty ? profile.faculty : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>สาขา:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.major ? profile.major : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>หมู่เรียน:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.student_class ? profile.student_class : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>ปีการศึกษา:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.student_year ? profile.student_year : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>ภาคเรียน:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.student_semester ? profile.student_semester : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaEnvelope /> <span>อีเมล:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.email ? profile.email : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPhoneAlt /> <span>เบอร์โทร:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.phone ? profile.phone : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaHome /> <span>ที่อยู่:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.address ? profile.address : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserTie /> <span>อาจารย์ที่ปรึกษา:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.advisor ? profile.advisor : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaHeartbeat /> <span>โรคประจำตัว:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.disease ? profile.disease : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserGraduate /> <span>เพศ:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.gender ? getGenderThai(profile.gender) : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCalendarAlt /> <span>วันที่สร้าง:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : ''}</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCalendarAlt /> <span>อัปเดตล่าสุด:</span></div>
					<div style={{ fontWeight: 'bold' }}>{profile && profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : ''}</div>
				</div>
			) : (
				<div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(44,62,80,0.12)', marginBottom: '1.5rem' }}>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserGraduate /> <span>รหัสนักศึกษา:</span></div>
						<input name="student_id" value={editProfile.student_id} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserGraduate /> <span>ชื่อนามสกุล:</span></div>
						<input name="name" value={editProfile.name} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUniversity /> <span>คณะ:</span></div>
						<input name="faculty" value={editProfile.faculty} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>สาขา:</span></div>
						<input name="major" value={editProfile.major} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>หมู่เรียน:</span></div>
						<input name="student_class" value={editProfile.student_class||''} onChange={handleProfileChange} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>ปีการศึกษา:</span></div>
						<input name="student_year" value={editProfile.student_year||''} onChange={handleProfileChange} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBookOpen /> <span>ภาคเรียน:</span></div>
						<input name="student_semester" value={editProfile.student_semester||''} onChange={handleProfileChange} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaEnvelope /> <span>อีเมล:</span></div>
						<input name="email" value={editProfile.email} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPhoneAlt /> <span>เบอร์โทร:</span></div>
						<input name="phone" value={editProfile.phone} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaHome /> <span>ที่อยู่:</span></div>
						<input name="address" value={editProfile.address} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserTie /> <span>อาจารย์ที่ปรึกษา:</span></div>
						<input name="advisor" value={editProfile.advisor} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaHeartbeat /> <span>โรคประจำตัว:</span></div>
						<input name="disease" value={editProfile.disease} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCalendarAlt /> <span>วันที่สร้าง:</span></div>
						<input name="created_at" value={editProfile.created_at} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCalendarAlt /> <span>อัปเดตล่าสุด:</span></div>
						<input name="updated_at" value={editProfile.updated_at} onChange={handleProfileChange} style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ccc' }} />
					</div>
					<div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
						<button onClick={handleProfileSave} style={{ background: '#16a085', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}><FaEdit style={{ marginRight: 6 }} /> บันทึกข้อมูล</button>
						<button onClick={handleCancelProfile} style={{ background: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}>ยกเลิก</button>
					</div>
				</div>
			)}
			<div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
				<button onClick={handleEdit} style={{ background: '#16a085', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1.5rem', fontWeight: '500', fontSize: '1rem', cursor: 'pointer' }}><FaEdit style={{ marginRight: 6 }} /> แก้ไขข้อมูล</button>
			</div>
		</div>
	);
}

export default StudentProfile;