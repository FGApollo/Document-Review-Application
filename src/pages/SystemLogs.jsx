import React, { useState } from 'react';
import { Search, Filter, Clock, RefreshCw, FileText } from 'lucide-react';

function SystemLogs({ logs, setLogs, addLog, triggerToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');

  const actionTypes = ['Login', 'Create Slot', 'Register Slot', 'Publish Schedule', 'Submit Review', 'Unlock Data'];

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử log?')) {
      setLogs([]);
      addLog('Unlock Data', 'Moderator thực hiện xóa sạch toàn bộ lịch sử thao tác hệ thống (Audit Logs).');
      triggerToast('Đã xóa log', 'Lịch sử nhật ký hoạt động đã được làm sạch.', 'warning');
    }
  };

  // Filter logs logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = 
      actionTypeFilter === 'All' || 
      log.actionType === actionTypeFilter;

    // Time filter mock logic
    let matchesTime = true;
    if (timeFilter === 'Today') {
      // Mock log timestamps are simulated, let's assume they are either today or all matches
      matchesTime = true; // For simple simulation we keep all
    }

    return matchesSearch && matchesAction && matchesTime;
  });

  return (
    <div className="system-logs-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Nhật ký hệ thống (System Logs)</h1>
          <p className="page-subtitle">Nhật ký hoạt động (Audit Log) nhằm đảm bảo tính bảo mật, minh bạch và toàn vẹn dữ liệu</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleClearLogs}>
          Xóa lịch sử log
        </button>
      </div>

      <div className="tabs-container" style={{ padding: '24px' }}>
        
        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Tìm theo Actor, Email hoặc Chi tiết hành động..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select 
                className="filter-select"
                value={actionTypeFilter}
                onChange={(e) => setActionTypeFilter(e.target.value)}
              >
                <option value="All">Tất cả hành động</option>
                {actionTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <select 
              className="filter-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="All">Khoảng thời gian: Tất cả</option>
              <option value="Today">Hôm nay</option>
              <option value="Week">7 ngày gần đây</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Thời gian (Timestamp)</th>
                <th>Người thực hiện (Actor)</th>
                <th>Vai trò (Role)</th>
                <th>Loại hành động (Action Type)</th>
                <th>Chi tiết hành động (Log Details)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {log.timestamp}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{log.actor}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        log.role === 'Moderator' ? 'badge-primary' : 
                        log.role === 'Lecturer' ? 'badge-info' : 'badge-neutral'
                      }`} style={{ background: log.role === 'Moderator' ? 'var(--primary-light)' : undefined, color: log.role === 'Moderator' ? 'var(--primary)' : undefined }}>
                        {log.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        log.actionType === 'Unlock Data' ? 'badge-danger' : 
                        log.actionType === 'Publish Schedule' ? 'badge-success' :
                        log.actionType === 'Submit Review' ? 'badge-info' : 'badge-neutral'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{log.details}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    Chưa ghi nhận hoạt động nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          <span>Ghi nhận <strong>{filteredLogs.length}</strong> nhật ký hoạt động.</span>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px' }}
            onClick={() => {
              setSearchQuery('');
              setActionTypeFilter('All');
              setTimeFilter('All');
              triggerToast('Làm mới', 'Đã đặt lại bộ lọc tìm kiếm log.', 'info');
            }}
          >
            <RefreshCw size={12} /> Đặt lại bộ lọc
          </button>
        </div>

      </div>
    </div>
  );
}

export default SystemLogs;
