import React from 'react';
import { Users, Calendar, CheckSquare, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';

function Dashboard({ users, slots, reviews, groups, setCurrentPage }) {
  // Calculate stats dynamically
  const studentsCount = users.students.length;
  const lecturersCount = users.lecturers.length;
  const totalParticipants = studentsCount + lecturersCount;

  const totalSlots = slots.length;
  const bookedSlots = slots.filter(s => s.lecturerId).length;
  const availableSlots = totalSlots - bookedSlots;

  const totalReviews = reviews.length;
  const completedReviews = reviews.filter(r => r.status === 'Completed').length;
  const reviewedReviews = reviews.filter(r => r.status === 'Reviewed').length;
  const pendingReviews = reviews.filter(r => r.status === 'Pending').length;
  const reviewProgressPercent = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;

  // Generate Urgent Alerts dynamically
  const urgentAlerts = [];
  
  // 1. Slots with assigned group but no lecturer
  const slotsNoLecturer = slots.filter(s => s.assignedGroupId && !s.lecturerId);
  if (slotsNoLecturer.length > 0) {
    urgentAlerts.push({
      id: 'no-lecturer',
      text: `${slotsNoLecturer.length} slot(s) đã gán nhóm nhưng chưa có giảng viên đăng ký.`,
      target: 'schedule'
    });
  }

  // 2. Scheduled reviews that are pending (meaning date has passed - simulate date has passed or just check pending reviews)
  const pendingReviewsCount = reviews.filter(r => r.status === 'Pending').length;
  if (pendingReviewsCount > 0) {
    urgentAlerts.push({
      id: 'pending-reviews',
      text: `${pendingReviewsCount} biên bản review đang ở trạng thái Pending (chưa đánh giá).`,
      target: 'reviews'
    });
  }

  // 3. Reviewed items waiting for student verification
  const reviewedWaitingCount = reviews.filter(r => r.status === 'Reviewed').length;
  if (reviewedWaitingCount > 0) {
    urgentAlerts.push({
      id: 'reviewed-waiting',
      text: `${reviewedWaitingCount} biên bản đã có nhận xét, đang chờ sinh viên xác nhận (Completed).`,
      target: 'reviews'
    });
  }

  // 4. Unmatched groups alert
  const unmatchedGroupsCount = groups.filter(g => !g.assignedSlotId).length;
  if (unmatchedGroupsCount > 0) {
    urgentAlerts.push({
      id: 'unmatched-groups',
      text: `${unmatchedGroupsCount} nhóm sinh viên chưa được xếp lịch review.`,
      target: 'schedule'
    });
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Tổng quan hệ thống</h1>
          <p className="page-subtitle">Số liệu thống kê trực quan theo thời gian thực (Real-time)</p>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="card-grid">
        {/* Card 1: Total Participants */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Participants</span>
            <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{totalParticipants}</div>
          <div className="metric-subtext">
            <span>Sinh viên: <strong>{studentsCount}</strong></span>
            <span style={{ margin: '0 4px' }}>|</span>
            <span>Giảng viên: <strong>{lecturersCount}</strong></span>
          </div>
          <div className="metric-subtext" style={{ marginTop: '4px', color: 'var(--success)', fontSize: '11px' }}>
            <TrendingUp size={12} style={{ marginRight: '4px' }} />
            <span>+12% so với học kỳ trước</span>
          </div>
          <button onClick={() => setCurrentPage('users')} className="metric-details-btn">
            Chi tiết <ChevronRight size={12} />
          </button>
        </div>

        {/* Card 2: Available Slots */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Available Slots</span>
            <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="metric-value">{availableSlots} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {totalSlots} tổng</span></div>
          <div className="metric-subtext">
            <span>Đã đăng ký (Booked): <strong>{bookedSlots}</strong></span>
          </div>
          <div style={{ marginTop: '12px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0}%`, 
              height: '100%', 
              backgroundColor: 'var(--success)',
              borderRadius: '3px'
            }}></div>
          </div>
          <button onClick={() => setCurrentPage('schedule')} className="metric-details-btn">
            Chi tiết <ChevronRight size={12} />
          </button>
        </div>

        {/* Card 3: Review Progress */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Review Progress</span>
            <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-gauge">
              <svg>
                <circle className="progress-circle-bg" cx="36" cy="36" r="30" />
                <circle className="progress-circle-fg" cx="36" cy="36" r="30" 
                  style={{
                    strokeDasharray: 2 * Math.PI * 30,
                    strokeDashoffset: 2 * Math.PI * 30 * (1 - reviewProgressPercent / 100)
                  }}
                />
              </svg>
              <div className="progress-text">{reviewProgressPercent}%</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600' }}>
                Hoàn thành (Completed): <span className="text-success">{completedReviews}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Đã review: {reviewedReviews} | Chờ chấm: {pendingReviews}
              </div>
            </div>
          </div>
          <button onClick={() => setCurrentPage('reviews')} className="metric-details-btn">
            Chi tiết <ChevronRight size={12} />
          </button>
        </div>

        {/* Card 4: Urgent Alerts */}
        <div className="metric-card alert-card">
          <div className="metric-header">
            <span className="metric-title" style={{ color: 'var(--danger)' }}>Urgent Alerts</span>
            <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(255, 86, 48, 0.15)', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="metric-value">{urgentAlerts.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--danger)' }}>Cảnh báo khẩn</span></div>
          
          <div className="alert-list">
            {urgentAlerts.length > 0 ? (
              urgentAlerts.slice(0, 2).map((alert, idx) => (
                <div key={idx} className="alert-item">
                  <span style={{ fontWeight: 'bold' }}>•</span>
                  <span>{alert.text}</span>
                </div>
              ))
            ) : (
              <div className="alert-item" style={{ borderColor: 'var(--success)', color: '#1a5c3d', backgroundColor: 'rgba(54, 179, 126, 0.08)' }}>
                Không có cảnh báo khẩn cấp nào. Hệ thống vận hành tốt!
              </div>
            )}
          </div>
          <button onClick={() => {
            if (urgentAlerts.length > 0) {
              setCurrentPage(urgentAlerts[0].target);
            } else {
              setCurrentPage('schedule');
            }
          }} className="metric-details-btn" style={{ background: 'var(--danger)', color: 'white' }}>
            Xử lý ngay <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
