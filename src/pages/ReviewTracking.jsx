import React, { useState } from 'react';
import { Eye, Unlock, Search, Filter, CheckCircle2, Clock, X, ArrowRight, AlertTriangle } from 'lucide-react';

function ReviewTracking({ reviews, setReviews, checklist, addLog, triggerToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Simulation selected review helper
  const pendingReviews = reviews.filter(r => r.status === 'Pending');
  const reviewedReviews = reviews.filter(r => r.status === 'Reviewed');

  // Filter reviews
  const filteredReviews = reviews.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' || 
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action: Unlock Review
  const handleUnlockReview = (reviewId) => {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;

    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          status: 'Pending',
          checklistData: {} // clear evaluation data
        };
      }
      return r;
    });

    setReviews(updated);
    addLog(
      'Unlock Data',
      `Moderator mở khóa Biên bản Review cho sinh viên ${rev.studentName} (Nhóm: ${rev.groupName})`
    );
    triggerToast('Đã mở khóa', `Đã mở khóa biên bản cho sinh viên ${rev.studentName} thành công.`, 'warning');
  };

  // Simulation 1: Lecturer submits checklist
  const handleSimulateLecturerSubmit = () => {
    if (pendingReviews.length === 0) {
      triggerToast('Không có mục phù hợp', 'Không tìm thấy biên bản ở trạng thái Pending.', 'warning');
      return;
    }

    // Pick first pending review
    const target = pendingReviews[0];
    
    // Generate mock responses for all checklist criteria
    const mockChecklistData = {};
    checklist.forEach(cat => {
      cat.criteria.forEach(crit => {
        let value = '';
        if (crit.type === 'level') {
          const lvls = ['Excellent', 'Good', 'Fair', 'Poor'];
          value = lvls[Math.floor(Math.random() * lvls.length)];
        } else if (crit.type === 'checkbox') {
          value = Math.random() > 0.3 ? 'Checked' : 'Unchecked';
        } else {
          value = 'Đã triển khai đầy đủ và kiểm thử.';
        }

        mockChecklistData[crit.id] = {
          value: value,
          comment: `Nhận xét giảng viên: Đạt yêu cầu đối với tiêu chí ${crit.name.toLowerCase()}. Cần lưu ý tối ưu thêm.`
        };
      });
    });

    const updated = reviews.map(r => {
      if (r.id === target.id) {
        return {
          ...r,
          status: 'Reviewed',
          checklistData: mockChecklistData
        };
      }
      return r;
    });

    setReviews(updated);
    addLog(
      'Submit Review',
      `Giảng viên ${target.lecturerName} nộp biên bản đánh giá checklist cho sinh viên ${target.studentName}`
    );
    triggerToast('Mô phỏng thành công', `Giảng viên ${target.lecturerName} đã submit checklist cho sinh viên ${target.studentName}.`, 'success');
  };

  // Simulation 2: Student clicks to view results
  const handleSimulateStudentView = () => {
    if (reviewedReviews.length === 0) {
      triggerToast('Không có mục phù hợp', 'Không tìm thấy biên bản ở trạng thái Reviewed.', 'warning');
      return;
    }

    // Pick first reviewed review
    const target = reviewedReviews[0];

    const updated = reviews.map(r => {
      if (r.id === target.id) {
        return {
          ...r,
          status: 'Completed'
        };
      }
      return r;
    });

    setReviews(updated);
    addLog(
      'Submit Review',
      `Sinh viên ${target.studentName} (${target.groupName}) bấm mở xem kết quả review - Kết thúc workflow.`
    );
    triggerToast('Mô phỏng thành công', `Sinh viên ${target.studentName} đã mở xem kết quả. Trạng thái chuyển sang Completed.`, 'success');
  };

  return (
    <div className="review-tracking-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Giám sát kết quả Review</h1>
          <p className="page-subtitle">Kiểm soát tiến độ nộp biên bản của giảng viên và trạng thái xem kết quả của sinh viên</p>
        </div>
      </div>

      {/* Controls Container */}
      <div className="tabs-container" style={{ padding: '24px' }}>
        
        {/* Filtering & Searching */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tìm kiếm sinh viên, nhóm, giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Pending">Pending (Chưa chấm)</option>
              <option value="Reviewed">Reviewed (Chờ SV xem)</option>
              <option value="Completed">Completed (Đã kết thúc)</option>
            </select>
          </div>
        </div>

        {/* Tracking Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên Sinh Viên</th>
                <th>Tên Nhóm / Đề Tài</th>
                <th>Giảng viên đánh giá (Reviewer)</th>
                <th>Trạng thái (Workflow Status)</th>
                <th style={{ width: '200px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: '700' }}>{item.studentName}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{item.groupName}</span>
                    </td>
                    <td>{item.lecturerName}</td>
                    <td>
                      {item.status === 'Pending' && (
                        <span className="badge badge-warning">
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          Pending (Chưa chấm)
                        </span>
                      )}
                      {item.status === 'Reviewed' && (
                        <span className="badge badge-info">
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          Reviewed (Chờ SV xem)
                        </span>
                      )}
                      {item.status === 'Completed' && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                          Completed (Đã xong)
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          onClick={() => setSelectedReview(item)}
                          disabled={item.status === 'Pending'} // no checklist details if pending
                        >
                          <Eye size={12} /> Chi tiết
                        </button>
                        
                        {(item.status === 'Reviewed' || item.status === 'Completed') && (
                          <button 
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px', fontSize: '11.5px', backgroundColor: '#ffebe6', color: '#ff5630', borderColor: 'transparent' }}
                            onClick={() => handleUnlockReview(item.id)}
                            title="Mở khóa để Giảng viên đánh giá lại"
                          >
                            <Unlock size={12} /> Mở khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Không có biên bản review nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Hiển thị <strong>{filteredReviews.length}</strong> trên tổng số <strong>{reviews.length}</strong> biên bản theo dõi sinh viên.
        </div>

      </div>

      {/* Read-Only Checklist Detail Modal */}
      {selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Biên bản Đánh giá: {selectedReview.studentName} ({selectedReview.groupName})</h2>
              <button className="modal-close-btn" onClick={() => setSelectedReview(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', padding: '12px', backgroundColor: '#fafbfc', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sinh viên</div>
                  <strong style={{ fontSize: '13.5px' }}>{selectedReview.studentName}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Giảng viên review</div>
                  <strong style={{ fontSize: '13.5px' }}>{selectedReview.lecturerName}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nhóm / Dự án</div>
                  <strong>{selectedReview.groupName}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trạng thái Workflow</div>
                  <span className={`badge ${selectedReview.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                    {selectedReview.status}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-dark)' }}>Kết quả Đánh giá Checklist tiêu chí:</h3>
              
              {checklist.map(cat => (
                <div key={cat.id} style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', backgroundColor: '#fafbfc', padding: '8px 12px', borderLeft: '3px solid var(--primary)', marginBottom: '12px' }}>
                    {cat.name}
                  </h4>
                  
                  {cat.criteria.map((crit, idx) => {
                    const data = selectedReview.checklistData[crit.id] || { value: 'N/A', comment: 'Không có nhận xét' };
                    return (
                      <div key={crit.id} style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', marginBottom: '12px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>{idx + 1}. {crit.name}</span>
                          <span className="badge badge-success" style={{ flexShrink: 0, textTransform: 'capitalize' }}>
                            {data.value}
                          </span>
                        </div>
                        
                        <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: 'var(--warning-bg)', borderRadius: '4px', borderLeft: '3px solid var(--warning)', fontSize: '12px' }}>
                          <div style={{ fontWeight: '700', color: '#825c00', fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Nhận xét giảng viên (Bắt buộc):
                          </div>
                          <p style={{ color: 'var(--text-dark)', fontStyle: 'italic', margin: 0 }}>
                            "{data.comment}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedReview(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewTracking;
