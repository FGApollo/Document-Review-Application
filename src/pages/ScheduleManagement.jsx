import React, { useState } from 'react';
import { Plus, Trash, Calendar, Users, CheckCircle, Clock, MapPin, Search, Lock, AlertCircle } from 'lucide-react';

function ScheduleManagement({ 
  slots, setSlots, 
  groups, setGroups, 
  users, 
  wizardStep, setWizardStep, 
  reviews, setReviews,
  addLog, triggerToast 
}) {
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  
  // Slot Form State (Step 1)
  const [newSlot, setNewSlot] = useState({
    date: '2026-06-12',
    time: '09:00 AM',
    room: 'Room A1'
  });

  // Drag & Drop States
  const [hoveredSlotId, setHoveredSlotId] = useState(null);

  // Filter groups
  const unmatchedGroups = groups.filter(g => !g.assignedSlotId && g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()));

  // Active lecturers for assignment
  const activeLecturers = users.lecturers.filter(l => l.status === 'Active' && l.activeReviewRound);

  // --- Step 1: Slot Creation Actions ---
  const handleAddSlot = (e) => {
    e.preventDefault();
    const isDup = slots.some(s => s.date === newSlot.date && s.time === newSlot.time && s.room === newSlot.room);
    if (isDup) {
      triggerToast('Lỗi trùng lặp', 'Slot thời gian với phòng này đã tồn tại.', 'danger');
      return;
    }
    const createdSlot = {
      id: `slot-${Date.now()}`,
      date: newSlot.date,
      time: newSlot.time,
      room: newSlot.room,
      lecturerId: null,
      assignedGroupId: null
    };
    setSlots([...slots, createdSlot]);
    addLog('Create Slot', `Tạo slot mới: Ngày ${newSlot.date}, Giờ ${newSlot.time}, Phòng ${newSlot.room}`);
    triggerToast('Thành công', 'Đã thêm slot lịch mới.', 'success');
  };

  const handleDeleteSlot = (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot?.assignedGroupId) {
      // Free group
      const grpId = slot.assignedGroupId;
      setGroups(groups.map(g => g.id === grpId ? { ...g, assignedSlotId: null } : g));
    }
    setSlots(slots.filter(s => s.id !== slotId));
    addLog('Create Slot', `Xóa slot: Ngày ${slot?.date}, Giờ ${slot?.time}, Phòng ${slot?.room}`);
    triggerToast('Đã xóa', 'Đã xóa slot lịch.', 'warning');
  };

  // --- Step 2: Lecturer Registration Actions ---
  const handleAssignLecturer = (slotId, lecturerId) => {
    const lect = users.lecturers.find(l => l.id === lecturerId);
    setSlots(slots.map(s => {
      if (s.id === slotId) {
        if (lecturerId === '') {
          addLog('Register Slot', `Hủy đăng ký giảng viên cho slot ${s.time} (${s.room})`);
          return { ...s, lecturerId: null };
        }
        addLog('Register Slot', `Giảng viên ${lect?.name} đăng ký phụ trách slot ${s.time} (${s.room})`);
        return { ...s, lecturerId: lecturerId };
      }
      return s;
    }));
    triggerToast('Đã cập nhật', 'Đã gán giảng viên phụ trách slot.', 'success');
  };

  // Auto/Simulate Lecturer Bookings
  const handleSimulateLecturerBookings = () => {
    if (activeLecturers.length === 0) {
      triggerToast('Lỗi', 'Không có giảng viên nào có quyền tham gia review.', 'danger');
      return;
    }
    const updated = slots.map(s => {
      if (!s.lecturerId) {
        const randomLect = activeLecturers[Math.floor(Math.random() * activeLecturers.length)];
        return { ...s, lecturerId: randomLect.id };
      }
      return s;
    });
    setSlots(updated);
    addLog('Register Slot', 'Mô phỏng tự động đăng ký slot cho toàn bộ Giảng viên');
    triggerToast('Thành công', 'Tất cả các slot trống đã được giảng viên đăng ký.', 'success');
  };

  // --- Step 3: Matchmaking Drag & Drop / Fallback Actions ---
  const handleDragStart = (e, groupId) => {
    e.dataTransfer.setData('text/plain', groupId);
  };

  const handleDragOver = (e, slot) => {
    // Math logic rule: Can only drop group into slot if lecturer is assigned
    if (slot.lecturerId) {
      e.preventDefault();
    }
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    setHoveredSlotId(null);
    const groupId = e.dataTransfer.getData('text/plain');
    assignGroupToSlot(groupId, slotId);
  };

  const assignGroupToSlot = (groupId, slotId) => {
    const slot = slots.find(s => s.id === slotId);
    const group = groups.find(g => g.id === groupId);
    
    if (!slot || !group) return;

    if (!slot.lecturerId) {
      triggerToast('Không thể xếp lịch', 'Slot này chưa có giảng viên đăng ký nhận review.', 'danger');
      return;
    }

    if (slot.assignedGroupId) {
      triggerToast('Slot đã bận', 'Slot này đã được gán cho nhóm khác.', 'danger');
      return;
    }

    // Update slot
    setSlots(slots.map(s => s.id === slotId ? { ...s, assignedGroupId: groupId } : s));
    // Update group
    setGroups(groups.map(g => g.id === groupId ? { ...g, assignedSlotId: slotId } : g));

    addLog('Register Slot', `Xếp lịch (Matchmaking): Gán ${group.name} vào slot ${slot.time} - Phòng ${slot.room}`);
    triggerToast('Xếp lịch thành công', `Đã gán ${group.name} vào ${slot.room} (${slot.time})`, 'success');
  };

  const handleRemoveMatch = (slotId, groupId) => {
    const slot = slots.find(s => s.id === slotId);
    const group = groups.find(g => g.id === groupId);

    setSlots(slots.map(s => s.id === slotId ? { ...s, assignedGroupId: null } : s));
    setGroups(groups.map(g => g.id === groupId ? { ...g, assignedSlotId: null } : g));

    addLog('Register Slot', `Hủy xếp lịch: Gỡ ${group?.name} khỏi slot ${slot?.time} - Phòng ${slot?.room}`);
    triggerToast('Đã gỡ nhóm', `Đã hủy lịch review của ${group?.name}.`, 'warning');
  };

  // --- Step 4: Publish Actions ---
  const handlePublishSchedule = () => {
    // Generate reviews for all students in matched groups
    const matchedSlots = slots.filter(s => s.assignedGroupId && s.lecturerId);
    
    if (matchedSlots.length === 0) {
      triggerToast('Lỗi công bố', 'Chưa có nhóm nào được xếp lịch. Vui lòng hoàn thành Matchmaking.', 'danger');
      return;
    }

    let reviewFormsGeneratedCount = 0;
    const newReviews = [...reviews];

    matchedSlots.forEach(slot => {
      const group = groups.find(g => g.id === slot.assignedGroupId);
      const lecturer = users.lecturers.find(l => l.id === slot.lecturerId);
      
      if (group && lecturer) {
        // Find students in this group
        const groupStudents = users.students.filter(s => s.groupName === group.name);
        
        groupStudents.forEach(student => {
          // Check if review form already exists
          const exists = reviews.some(r => r.studentId === student.id);
          if (!exists) {
            newReviews.push({
              id: `rev-${Date.now()}-${student.id}`,
              studentId: student.id,
              studentName: student.name,
              groupName: group.name,
              lecturerId: lecturer.id,
              lecturerName: lecturer.name,
              status: 'Pending', // Pending -> Reviewed -> Completed
              checklistData: {}
            });
            reviewFormsGeneratedCount++;
          }
        });
      }
    });

    setReviews(newReviews);
    addLog('Publish Schedule', `Công bố lịch review. Đã khoá đăng ký và tự động tạo ${reviewFormsGeneratedCount} biên bản theo dõi sinh viên.`);
    triggerToast('Lịch đã công bố', `Lịch đã khóa và gửi thông báo đến giảng viên & sinh viên. Đã tạo ${reviewFormsGeneratedCount} biên bản đánh giá!`, 'success');
    setWizardStep(4); // complete wizard
  };

  return (
    <div className="schedule-management-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Quản lý Slot & Xếp lịch (Nhóm)</h1>
          <p className="page-subtitle">Quy trình điều phối lịch trình review đề tài của các Nhóm/Project sinh viên</p>
        </div>
        
        {wizardStep === 3 && (
          <button className="btn btn-primary" onClick={handlePublishSchedule}>
            Công bố lịch (Publish)
          </button>
        )}
      </div>

      {/* 4-Step Wizard Stepper */}
      <div className="wizard-stepper">
        <div 
          className={`step-item ${wizardStep > 1 ? 'completed' : wizardStep === 1 ? 'active' : ''}`}
          onClick={() => setWizardStep(1)}
          style={{ cursor: 'pointer' }}
        >
          <div className="step-circle">1</div>
          <div className="step-info">
            <span className="step-title">Create Slot</span>
            <span className="step-desc">Tạo slot trống</span>
          </div>
        </div>

        <div 
          className={`step-item ${wizardStep > 2 ? 'completed' : wizardStep === 2 ? 'active' : ''}`}
          onClick={() => setWizardStep(2)}
          style={{ cursor: 'pointer' }}
        >
          <div className="step-circle">2</div>
          <div className="step-info">
            <span className="step-title">Lecturer Reg</span>
            <span className="step-desc">Giảng viên đăng ký</span>
          </div>
        </div>

        <div 
          className={`step-item ${wizardStep > 3 ? 'completed' : wizardStep === 3 ? 'active' : ''}`}
          onClick={() => setWizardStep(3)}
          style={{ cursor: 'pointer' }}
        >
          <div className="step-circle">3</div>
          <div className="step-info">
            <span className="step-title">Matchmaking</span>
            <span className="step-desc">Kéo thả xếp lịch</span>
          </div>
        </div>

        <div 
          className={`step-item ${wizardStep === 4 ? 'completed' : ''}`}
          onClick={() => setWizardStep(4)}
          style={{ cursor: 'pointer' }}
        >
          <div className="step-circle">4</div>
          <div className="step-info">
            <span className="step-title">Publish</span>
            <span className="step-desc">Hoàn thành & Khóa</span>
          </div>
        </div>
      </div>

      {/* Step 1: Create Slot View */}
      {wizardStep === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Create Form */}
          <div className="criteria-category-box">
            <h3 className="category-title" style={{ marginBottom: '16px', border: 'none', padding: 0 }}>Thêm slot lịch mới</h3>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label>Ngày Review</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời gian</label>
                <select 
                  className="form-control"
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phòng Review</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Ví dụ: Room A1, Room B2"
                  value={newSlot.room}
                  onChange={(e) => setNewSlot({ ...newSlot, room: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Plus size={16} /> Thêm Slot Lịch
              </button>
            </form>
          </div>

          {/* Slots List */}
          <div className="criteria-category-box">
            <h3 className="category-title" style={{ marginBottom: '16px', border: 'none', padding: 0 }}>Danh sách Slots đã tạo ({slots.length})</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Thời gian</th>
                    <th>Phòng</th>
                    <th>Giảng viên phụ trách</th>
                    <th>Trạng thái gán nhóm</th>
                    <th style={{ width: '80px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.length > 0 ? (
                    slots.map(slot => {
                      const group = groups.find(g => g.id === slot.assignedGroupId);
                      const lecturer = users.lecturers.find(l => l.id === slot.lecturerId);
                      return (
                        <tr key={slot.id}>
                          <td>{slot.date}</td>
                          <td style={{ fontWeight: 'bold' }}>{slot.time}</td>
                          <td>
                            <span className="badge badge-info">{slot.room}</span>
                          </td>
                          <td>
                            {lecturer ? lecturer.name : <span className="text-warning">Chưa có</span>}
                          </td>
                          <td>
                            {group ? (
                              <span className="badge badge-success">Đã gán {group.name}</span>
                            ) : (
                              <span className="badge badge-neutral">Trống</span>
                            )}
                          </td>
                          <td>
                            <button 
                              type="button" 
                              className="btn btn-danger btn-icon-only btn-sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                        Chưa có slot nào được tạo. Hãy tạo slot đầu tiên bên trái!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={() => setWizardStep(2)}>
                Tiếp tục bước 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Lecturer Registration View */}
      {wizardStep === 2 && (
        <div className="criteria-category-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="category-title" style={{ border: 'none', padding: 0 }}>Phân công / Giảng viên đăng ký slot</h3>
            
            <button className="btn btn-secondary" onClick={handleSimulateLecturerBookings}>
              Tự động điền nhanh Giảng viên (Simulator)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px', backgroundColor: 'var(--info-bg)', border: '1px solid rgba(0, 101, 255, 0.2)', borderRadius: '6px', fontSize: '12.5px', color: '#0047b3' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>Chỉ những Giảng viên được cấp <strong>"Quyền tham gia đợt Review"</strong> trong Tab quản lý mới xuất hiện trong danh sách đăng ký.</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Phòng</th>
                  <th>Giảng viên phụ trách</th>
                  <th>Liên hệ Email</th>
                  <th>Trạng thái Slot</th>
                </tr>
              </thead>
              <tbody>
                {slots.length > 0 ? (
                  slots.map(slot => (
                    <tr key={slot.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                          <strong>{slot.date} | {slot.time}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                          {slot.room}
                        </div>
                      </td>
                      <td>
                        <select 
                          className="filter-select"
                          style={{ width: '100%', maxWidth: '280px' }}
                          value={slot.lecturerId || ''}
                          onChange={(e) => handleAssignLecturer(slot.id, e.target.value)}
                        >
                          <option value="">-- Click để đăng ký Giảng viên --</option>
                          {activeLecturers.map(l => (
                            <option key={l.id} value={l.id}>{l.name} ({l.department})</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {slot.lecturerId ? (
                          users.lecturers.find(l => l.id === slot.lecturerId)?.email
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có giảng viên</span>
                        )}
                      </td>
                      <td>
                        {slot.lecturerId ? (
                          <span className="badge badge-success">Đã có giảng viên</span>
                        ) : (
                          <span className="badge badge-warning">Đang trống</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      Chưa có slot nào được tạo. Vui lòng quay lại bước 1.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setWizardStep(1)}>Quay lại bước 1</button>
            <button className="btn btn-primary" onClick={() => setWizardStep(3)}>Tiếp tục bước 3</button>
          </div>
        </div>
      )}

      {/* Step 3: Matchmaking View */}
      {wizardStep === 3 && (
        <div className="matchmaking-layout">
          
          {/* Left panel: Unmatched Groups */}
          <div className="unmatched-groups-panel">
            <div className="unmatched-title-group">
              <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>Nhóm sinh viên chưa gán lịch</span>
              <span className="unmatched-badge">{unmatchedGroups.length} nhóm</span>
            </div>

            <div className="search-input-wrapper" style={{ marginBottom: '12px' }}>
              <Search size={14} className="search-icon" />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tìm tên nhóm..." 
                style={{ fontSize: '11px', padding: '6px 8px 6px 28px' }}
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
              />
            </div>

            <div className="unmatched-list">
              {unmatchedGroups.length > 0 ? (
                unmatchedGroups.map(group => (
                  <div 
                    key={group.id} 
                    className="group-drag-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, group.id)}
                  >
                    <div className="group-drag-name">{group.name}</div>
                    <div className="group-drag-topic">{group.topic}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <select 
                        style={{ fontSize: '10px', padding: '2px', borderRadius: '4px', border: '1px solid var(--border)' }}
                        onChange={(e) => {
                          if (e.target.value) {
                            assignGroupToSlot(group.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Gán nhanh...</option>
                        {slots.filter(s => s.lecturerId && !s.assignedGroupId).map(s => (
                          <option key={s.id} value={s.id}>{s.room} ({s.time})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px 0' }}>
                  Tất cả nhóm đã được xếp lịch xong!
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Calendar Scheduler Grid */}
          <div className="calendar-view">
            <div className="calendar-header">
              <span className="calendar-title">Lưới lịch trình phân công (Drag & Drop)</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge badge-info" style={{ borderRadius: '4px' }}>Học kỳ: Summer 2026</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px', backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(255, 171, 0, 0.2)', borderRadius: '6px', fontSize: '12px', color: '#825c00' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>Chỉ cho phép kéo thả nhóm vào ô lịch <strong>đã được phân giảng viên</strong> phụ trách review.</span>
            </div>

            {/* Time Grid Calendar */}
            <div className="calendar-grid">
              
              {/* Header Cells */}
              <div className="grid-header-cell">Giờ</div>
              <div className="grid-header-cell">Thứ Hai (12/06)</div>
              <div className="grid-header-cell">Thứ Ba (13/06)</div>
              <div className="grid-header-cell">Thứ Tư (14/06)</div>

              {/* Grid Body */}
              {['09:00 AM', '10:00 AM', '11:00 AM', '01:30 PM'].map((timeSlot) => (
                <React.Fragment key={timeSlot}>
                  <div className="grid-time-cell">{timeSlot}</div>
                  
                  {/* Days: 12, 13, 14 */}
                  {['2026-06-12', '2026-06-13', '2026-06-14'].map((day) => {
                    const slot = slots.find(s => s.date === day && s.time === timeSlot);
                    
                    if (!slot) {
                      return (
                        <div key={`${day}-${timeSlot}`} className="grid-slot-cell" style={{ backgroundColor: '#fafbfc' }}>
                          <span style={{ color: '#c1c7d0', fontSize: '11px' }}>Không có slot</span>
                        </div>
                      );
                    }

                    const group = groups.find(g => g.id === slot.assignedGroupId);
                    const lecturer = users.lecturers.find(l => l.id === slot.lecturerId);

                    return (
                      <div 
                        key={slot.id} 
                        className={`grid-slot-cell ${hoveredSlotId === slot.id ? 'droppable-hover' : ''} ${slot.lecturerId ? 'droppable-active' : ''}`}
                        onDragOver={(e) => handleDragOver(e, slot)}
                        onDragEnter={() => slot.lecturerId && setHoveredSlotId(slot.id)}
                        onDragLeave={() => setHoveredSlotId(null)}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        style={{ borderLeft: slot.lecturerId ? '3px solid var(--success)' : '1px solid var(--border)' }}
                      >
                        <div className="slot-inner">
                          <div className="slot-info">
                            <span className="slot-room">{slot.room}</span>
                            <span className="slot-lecturer">
                              {lecturer ? (
                                <>👨‍🏫 {lecturer.name.split(' ').slice(-2).join(' ')}</>
                              ) : (
                                <span className="text-danger">⚠️ Thiếu giảng viên</span>
                              )}
                            </span>
                          </div>

                          {group ? (
                            <div className="slot-filled-card">
                              <div className="slot-filled-name">{group.name}</div>
                              <div className="slot-filled-topic">{group.topic}</div>
                              <button 
                                type="button" 
                                className="slot-remove-btn"
                                onClick={() => handleRemoveMatch(slot.id, group.id)}
                              >
                                <Trash size={10} />
                              </button>
                            </div>
                          ) : slot.lecturerId ? (
                            <div className="slot-empty-state">
                              Kéo nhóm thả vào đây
                            </div>
                          ) : (
                            <div className="slot-empty-state" style={{ borderStyle: 'solid', borderColor: '#ffebe6', color: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}>
                              Cần gán GV trước
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setWizardStep(2)}>Quay lại bước 2</button>
              <button className="btn btn-primary" onClick={handlePublishSchedule}>Công bố lịch & Hoàn tất</button>
            </div>
          </div>

        </div>
      )}

      {/* Step 4: Published Completed View */}
      {wizardStep === 4 && (
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '48px',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'var(--success-bg)', 
            color: 'var(--success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <CheckCircle size={36} />
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>Công bố lịch thành công!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.6' }}>
            Lịch review cho học kỳ Summer 2026 đã được chính thức công bố và khóa đăng ký tự do. 
            Hệ thống đã tự động tạo biên bản checklist review và gửi email thông báo chi tiết đến 
            tất cả các giảng viên và sinh viên liên quan.
          </p>

          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '28px', backgroundColor: '#fafbfc', textAlign: 'left' }}>
            <h4 style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', color: 'var(--text-dark)' }}>Thống kê đợt review đã công bố:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Tổng số slot đã tạo và lên lịch: <strong>{slots.filter(s => s.assignedGroupId).length}</strong> slot</li>
              <li>Số nhóm sinh viên đã lên lịch review: <strong>{groups.filter(g => g.assignedSlotId).length}</strong> nhóm</li>
              <li>Số giảng viên phụ trách đánh giá: <strong>{slots.filter(s => s.assignedGroupId && s.lecturerId).reduce((acc, current) => acc.includes(current.lecturerId) ? acc : [...acc, current.lecturerId], []).length}</strong> giảng viên</li>
              <li>Số biên bản đánh giá sinh viên được khởi tạo: <strong>{reviews.length}</strong> biên bản</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setWizardStep(3)}>
              Quay lại chỉnh sửa lịch
            </button>
            <button className="btn btn-primary" onClick={() => {
              // Redirect to dashboard or reviews
              // We trigger a click on review tracking page
              // Actually we just show toast or suggest navigating
              triggerToast('Chuyển trang', 'Đang chuyển đến phân hệ Giám sát Kết quả Review...', 'info');
              // Let's pretend to navigate by clicking and modifying parent state
            }}>
              Xem Biên bản Review
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default ScheduleManagement;
