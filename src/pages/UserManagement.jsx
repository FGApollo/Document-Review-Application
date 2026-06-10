import React, { useState } from 'react';
import { Search, Filter, Plus, Upload, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

function UserManagement({ users, setUsers, addLog, triggerToast }) {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importMode, setImportMode] = useState('manual'); // 'manual' or 'excel'
  
  // Manual User Form State
  const [newUser, setNewUser] = useState({
    code: '',
    name: '',
    email: '',
    department: 'Software Engineering',
    status: 'Active',
    activeReviewRound: true,
    groupName: ''
  });

  // Department list for filters
  const departments = ['Software Engineering', 'Digital Design', 'Information Assurance'];

  // Handle perm changes for Lecturers
  const handlePermissionToggle = (lecturerId) => {
    const updatedLecturers = users.lecturers.map(l => {
      if (l.id === lecturerId) {
        const newVal = !l.activeReviewRound;
        addLog(
          'Unlock Data', // or register/update
          `Cập nhật Quyền tham gia đợt Review cho giảng viên ${l.name}: ${newVal ? 'BẬT' : 'TẮT'}`
        );
        triggerToast('Thành công', `Đã cập nhật quyền tham gia review cho ${l.name}.`, 'success');
        return { ...l, activeReviewRound: newVal };
      }
      return l;
    });
    setUsers({ ...users, lecturers: updatedLecturers });
  };

  // Handle adding user manually
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      triggerToast('Lỗi', 'Vui lòng điền Họ tên và Email.', 'danger');
      return;
    }

    if (activeTab === 'students') {
      const studentCode = newUser.code || `SE${Math.floor(100000 + Math.random() * 900000)}`;
      const newStudent = {
        id: `s-${Date.now()}`,
        code: studentCode,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        status: newUser.status,
        groupName: newUser.groupName || 'Chưa gán nhóm'
      };
      setUsers({
        ...users,
        students: [...users.students, newStudent]
      });
      addLog('Create Slot', `Thêm sinh viên mới: ${newUser.name} (${studentCode})`); // using standard audit types
      triggerToast('Thành công', `Đã thêm sinh viên ${newUser.name} thành công.`, 'success');
    } else if (activeTab === 'lecturers') {
      const newLecturer = {
        id: `l-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        status: newUser.status,
        activeReviewRound: newUser.activeReviewRound
      };
      setUsers({
        ...users,
        lecturers: [...users.lecturers, newLecturer]
      });
      addLog('Create Slot', `Thêm giảng viên mới: ${newUser.name}`);
      triggerToast('Thành công', `Đã thêm giảng viên ${newUser.name} thành công.`, 'success');
    } else {
      const newModerator = {
        id: `m-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        status: newUser.status
      };
      setUsers({
        ...users,
        moderators: [...users.moderators, newModerator]
      });
      addLog('Create Slot', `Thêm moderator mới: ${newUser.name}`);
      triggerToast('Thành công', `Đã thêm người điều phối ${newUser.name} thành công.`, 'success');
    }

    // Reset Form & Close Modal
    setNewUser({
      code: '',
      name: '',
      email: '',
      department: 'Software Engineering',
      status: 'Active',
      activeReviewRound: true,
      groupName: ''
    });
    setIsModalOpen(false);
  };

  // Mock Excel Importer Action
  const handleExcelImportMock = () => {
    // We add 3 mock users of the current tab type
    if (activeTab === 'students') {
      const mockStudents = [
        { id: `s-mock-1`, code: 'SE160991', name: 'Đỗ Hoàng Việt', email: 'vietdhse160991@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 01' },
        { id: `s-mock-2`, code: 'SE160992', name: 'Nguyễn Thị Hồng', email: 'hongntse160992@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 02' },
        { id: `s-mock-3`, code: 'GD160993', name: 'Trần Minh Quân', email: 'quantmgd160993@fpt.edu.vn', department: 'Digital Design', status: 'Active', groupName: 'Group 04' }
      ];
      setUsers({
        ...users,
        students: [...users.students, ...mockStudents]
      });
      addLog('Create Slot', 'Import danh sách sinh viên hàng loạt từ Excel (3 tài khoản)');
      triggerToast('Nhập Excel thành công', 'Đã import thành công 3 sinh viên vào hệ thống.', 'success');
    } else if (activeTab === 'lecturers') {
      const mockLecturers = [
        { id: `l-mock-1`, name: 'Prof. Johnathan Doe', email: 'johnathan@fpt.edu.vn', department: 'Software Engineering', status: 'Active', activeReviewRound: true },
        { id: `l-mock-2`, name: 'Dr. Clara Oswald', email: 'clara@fpt.edu.vn', department: 'Information Assurance', status: 'Active', activeReviewRound: true }
      ];
      setUsers({
        ...users,
        lecturers: [...users.lecturers, ...mockLecturers]
      });
      addLog('Create Slot', 'Import danh sách giảng viên hàng loạt từ Excel (2 tài khoản)');
      triggerToast('Nhập Excel thành công', 'Đã import thành công 2 giảng viên vào hệ thống.', 'success');
    } else {
      const mockMods = [
        { id: `m-mock-1`, name: 'Mod Nguyễn Thị Ly', email: 'lynt@fpt.edu.vn', status: 'Active' }
      ];
      setUsers({
        ...users,
        moderators: [...users.moderators, ...mockMods]
      });
      addLog('Create Slot', 'Import người điều phối từ Excel (1 tài khoản)');
      triggerToast('Nhập Excel thành công', 'Đã import thành công 1 người điều phối.', 'success');
    }
    setIsModalOpen(false);
  };

  // Filter & Search Logic
  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'students') data = users.students;
    else if (activeTab === 'lecturers') data = users.lecturers;
    else data = users.moderators;

    return data.filter(item => {
      // Search term
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase()));

      // Department filter (only applies to student and lecturer)
      const matchesDept = 
        deptFilter === 'All' || 
        !item.department || 
        item.department === deptFilter;

      // Status filter
      const matchesStatus = 
        statusFilter === 'All' || 
        item.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Quản lý người dùng</h1>
          <p className="page-subtitle">Quản lý thông tin tài khoản, danh mục nhân sự và phân quyền hệ thống</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      <div className="tabs-container">
        {/* Tabs Headers */}
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setSearchQuery(''); setDeptFilter('All'); setStatusFilter('All'); }}
          >
            Tab Students (Sinh viên)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'lecturers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('lecturers'); setSearchQuery(''); setDeptFilter('All'); setStatusFilter('All'); }}
          >
            Tab Lecturers (Giảng viên)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'moderators' ? 'active' : ''}`}
            onClick={() => { setActiveTab('moderators'); setSearchQuery(''); setDeptFilter('All'); setStatusFilter('All'); }}
          >
            Tab Moderators (Người điều phối)
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          
          {/* Filtering and Search Controls */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                className="form-control" 
                placeholder={`Tìm kiếm tên, email, mã số...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              {activeTab !== 'moderators' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                  <select 
                    className="filter-select"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                  >
                    <option value="All">Tất cả ngành</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Active">Hoạt động (Active)</option>
                <option value="Inactive">Ngừng hoạt động (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Data Tables */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                {activeTab === 'students' && (
                  <tr>
                    <th>Mã SV</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Chuyên ngành (Department)</th>
                    <th>Nhóm (Group/Project)</th>
                    <th>Trạng thái</th>
                  </tr>
                )}
                {activeTab === 'lecturers' && (
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Chuyên môn (Department)</th>
                    <th style={{ minWidth: '220px' }}>Quyền tham gia đợt Review</th>
                    <th>Trạng thái</th>
                  </tr>
                )}
                {activeTab === 'moderators' && (
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      {activeTab === 'students' && (
                        <>
                          <td style={{ fontWeight: 'bold' }}>{item.code}</td>
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.department}</td>
                          <td>
                            <span className="badge badge-neutral">{item.groupName || 'Chưa gán nhóm'}</span>
                          </td>
                          <td>
                            <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                      
                      {activeTab === 'lecturers' && (
                        <>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.department}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input 
                                type="checkbox"
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                checked={!!item.activeReviewRound}
                                onChange={() => handlePermissionToggle(item.id)}
                                disabled={item.status === 'Inactive'}
                              />
                              <span style={{ fontSize: '12.5px', color: item.status === 'Inactive' ? 'var(--text-muted)' : 'inherit' }}>
                                Cho phép tham gia review
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}

                      {activeTab === 'moderators' && (
                        <>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td>{item.email}</td>
                          <td>
                            <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'students' ? 6 : activeTab === 'lecturers' ? 5 : 3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Hiển thị <strong>{filteredData.length}</strong> trên tổng số <strong>
              {activeTab === 'students' ? users.students.length : activeTab === 'lecturers' ? users.lecturers.length : users.moderators.length}
            </strong> tài khoản.
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Thêm người dùng mới ({activeTab === 'students' ? 'Sinh viên' : activeTab === 'lecturers' ? 'Giảng viên' : 'Điều phối viên'})</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Toggle Mode: Manual or Excel */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
                <button 
                  className={`tab-btn ${importMode === 'manual' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setImportMode('manual')}
                >
                  Nhập thủ công
                </button>
                <button 
                  className={`tab-btn ${importMode === 'excel' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setImportMode('excel')}
                >
                  Import hàng loạt (Excel)
                </button>
              </div>

              {importMode === 'manual' ? (
                <form onSubmit={handleAddUserSubmit}>
                  {activeTab === 'students' && (
                    <div className="form-group">
                      <label>Mã Sinh Viên (Tùy chọn, tự sinh nếu trống)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ví dụ: SE160123"
                        value={newUser.code}
                        onChange={(e) => setNewUser({...newUser, code: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Họ và Tên <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Nhập họ và tên đầy đủ"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email liên hệ <span className="text-danger">*</span></label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="username@fpt.edu.vn"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>

                  {activeTab !== 'moderators' && (
                    <div className="form-group">
                      <label>Chuyên ngành / Bộ môn</label>
                      <select 
                        className="form-control"
                        value={newUser.department}
                        onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      >
                        {departments.map((dept, idx) => (
                          <option key={idx} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeTab === 'students' && (
                    <div className="form-group">
                      <label>Nhóm (Group Name)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ví dụ: Group 01"
                        value={newUser.groupName}
                        onChange={(e) => setNewUser({...newUser, groupName: e.target.value})}
                      />
                    </div>
                  )}

                  {activeTab === 'lecturers' && (
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                      <input 
                        type="checkbox" 
                        id="chkActiveRound" 
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        checked={newUser.activeReviewRound}
                        onChange={(e) => setNewUser({...newUser, activeReviewRound: e.target.checked})}
                      />
                      <label htmlFor="chkActiveRound" style={{ margin: 0, cursor: 'pointer', fontWeight: 'normal' }}>
                        Cho phép tham gia đợt Review này ngay lập tức
                      </label>
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label>Trạng thái tài khoản</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="user-status" 
                          value="Active" 
                          checked={newUser.status === 'Active'}
                          onChange={() => setNewUser({...newUser, status: 'Active'})} 
                        />
                        Hoạt động (Active)
                      </label>
                      <label style={{ fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="user-status" 
                          value="Inactive" 
                          checked={newUser.status === 'Inactive'}
                          onChange={() => setNewUser({...newUser, status: 'Inactive'})} 
                        />
                        Ngừng hoạt động (Inactive)
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer" style={{ border: 'none', padding: '16px 0 0 0' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                    <button type="submit" className="btn btn-primary">Thêm tài khoản</button>
                  </div>
                </form>
              ) : (
                <div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '13px' }}>
                    Tải lên file Excel mẫu chứa danh sách tài khoản cần import. Hệ thống sẽ tự động phân tích và tạo tài khoản tương ứng.
                  </p>
                  
                  <div className="excel-drop-zone" onClick={handleExcelImportMock}>
                    <div className="excel-drop-zone-icon">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Kéo thả file .xlsx vào đây hoặc Click để duyệt</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Chấp nhận các file bảng tính cấu hình đúng cột tiêu chuẩn</p>
                    </div>
                    <div style={{ marginTop: '8px', padding: '6px 12px', border: '1px solid var(--success)', borderRadius: '4px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                      <Check size={14} /> Click vào đây để mô phỏng tải file Excel mẫu thành công
                    </div>
                  </div>
                  
                  <div className="modal-footer" style={{ border: 'none', padding: '16px 0 0 0', marginTop: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Đóng</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
