import React, { useState } from 'react';
import { Plus, Trash, Eye, Upload, CheckSquare, List, MessageSquare, AlertCircle } from 'lucide-react';

function ChecklistManagement({ checklist, setChecklist, addLog, triggerToast }) {
  const [activeCategory, setActiveCategory] = useState(checklist[0]?.id || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // New Criterion Form State
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    type: 'level' // 'level', 'checkbox', 'text'
  });

  // Handle adding a new category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      criteria: []
    };

    setChecklist([...checklist, newCat]);
    setActiveCategory(newCat.id);
    setNewCategoryName('');
    addLog('Create Slot', `Tạo danh mục checklist mới: ${newCat.name}`);
    triggerToast('Thành công', `Đã thêm danh mục "${newCat.name}"`, 'success');
  };

  // Handle deleting a category
  const handleDeleteCategory = (catId) => {
    const cat = checklist.find(c => c.id === catId);
    const updated = checklist.filter(c => c.id !== catId);
    setChecklist(updated);
    if (activeCategory === catId && updated.length > 0) {
      setActiveCategory(updated[0].id);
    }
    addLog('Create Slot', `Xóa danh mục checklist: ${cat?.name}`);
    triggerToast('Đã xóa', `Đã xóa danh mục "${cat?.name}"`, 'warning');
  };

  // Handle adding a criterion to the active category
  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newCriteria.name.trim() || !activeCategory) {
      triggerToast('Lỗi', 'Vui lòng điền tên tiêu chí và chọn danh mục.', 'danger');
      return;
    }

    const updatedChecklist = checklist.map(cat => {
      if (cat.id === activeCategory) {
        const item = {
          id: `crit-${Date.now()}`,
          name: newCriteria.name.trim(),
          type: newCriteria.type
        };
        addLog('Create Slot', `Thêm tiêu chí "${item.name}" (${newCriteria.type}) vào danh mục "${cat.name}"`);
        return {
          ...cat,
          criteria: [...cat.criteria, item]
        };
      }
      return cat;
    });

    setChecklist(updatedChecklist);
    setNewCriteria({ name: '', type: 'level' });
    triggerToast('Thành công', 'Đã thêm tiêu chí mới.', 'success');
  };

  // Handle deleting a criterion
  const handleDeleteCriteria = (catId, critId) => {
    const updatedChecklist = checklist.map(cat => {
      if (cat.id === catId) {
        const crit = cat.criteria.find(cr => cr.id === critId);
        addLog('Create Slot', `Xóa tiêu chí "${crit?.name}" khỏi danh mục "${cat.name}"`);
        return {
          ...cat,
          criteria: cat.criteria.filter(cr => cr.id !== critId)
        };
      }
      return cat;
    });
    setChecklist(updatedChecklist);
    triggerToast('Đã xóa', 'Đã xóa tiêu chí.', 'warning');
  };

  // Simulated Excel Import template loader
  const handleExcelImportTemplate = () => {
    const defaultTemplate = [
      {
        id: 'cat-excel-1',
        name: 'UI/UX Design & Frontend Quality',
        criteria: [
          { id: 'crit-ex-1', name: 'Giao diện đồng bộ, màu sắc hài hòa và đúng thiết kế', type: 'level' },
          { id: 'crit-ex-2', name: 'Độ phản hồi và tương thích tốt trên các thiết bị Mobile/Tablet', type: 'checkbox' },
          { id: 'crit-ex-3', name: 'Hiệu ứng chuyển cảnh mượt mà, không giật lag', type: 'checkbox' }
        ]
      },
      {
        id: 'cat-excel-2',
        name: 'Data Architecture & Database Security',
        criteria: [
          { id: 'crit-ex-4', name: 'Mô hình dữ liệu chuẩn hóa, có lập chỉ mục (index) tối ưu', type: 'level' },
          { id: 'crit-ex-5', name: 'Mã hóa mật khẩu sinh viên, phân quyền truy cập API an toàn', type: 'checkbox' },
          { id: 'crit-ex-6', name: 'Độ trễ truy vấn trung bình (Response Time < 200ms)', type: 'text' }
        ]
      },
      {
        id: 'cat-excel-3',
        name: 'Business Logic & Core Operations',
        criteria: [
          { id: 'crit-ex-7', name: 'Triển khai chính xác và đầy đủ các tính năng nghiệp vụ cốt lõi', type: 'level' },
          { id: 'crit-ex-8', name: 'Xử lý hoàn thiện các trường hợp ngoại lệ (Edge Cases)', type: 'text' }
        ]
      }
    ];

    setChecklist(defaultTemplate);
    if (defaultTemplate.length > 0) {
      setActiveCategory(defaultTemplate[0].id);
    }
    addLog('Create Slot', 'Import danh mục tiêu chí kiểm tra từ Excel (.xlsx) thành công');
    triggerToast('Excel Imported', 'Đã import thành công 3 danh mục tiêu chí đánh giá từ Excel.', 'success');
  };

  // Get active category details
  const activeCatDetails = checklist.find(c => c.id === activeCategory);

  return (
    <div className="checklist-management-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Quản lý tiêu chí Checklist</h1>
          <p className="page-subtitle">Cấu hình bộ câu hỏi đánh giá theo tiêu chí mà không dùng điểm số hay Pass/Fail</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExcelImportTemplate}>
          <Upload size={16} /> Import from Excel
        </button>
      </div>

      <div className="checklist-builder">
        
        {/* Left Column: Editor & Structure */}
        <div className="criteria-list">
          
          {/* Categories Management Panel */}
          <div className="criteria-category-box">
            <h3 className="category-title" style={{ borderBottom: 'none', padding: 0, marginBottom: '16px' }}>Danh mục đánh giá (Categories)</h3>
            
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Tên danh mục mới (ví dụ: UI/UX, Security...)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} /> Thêm
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {checklist.map(cat => (
                <div 
                  key={cat.id} 
                  className={`criteria-item-row ${activeCategory === cat.id ? 'active' : ''}`}
                  style={{ 
                    cursor: 'pointer',
                    borderColor: activeCategory === cat.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: activeCategory === cat.id ? 'var(--primary-light)' : '#fafbfc'
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <List size={16} />
                    <span style={{ fontWeight: 'bold' }}>{cat.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({cat.criteria.length} tiêu chí)</span>
                  </div>
                  <button 
                    type="button" 
                    className="slot-remove-btn" 
                    style={{ position: 'static' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Criteria Management Panel for selected category */}
          {activeCatDetails ? (
            <div className="criteria-category-box">
              <div className="category-header">
                <span className="category-title">Cấu hình tiêu chí: <strong style={{ color: 'var(--primary)' }}>{activeCatDetails.name}</strong></span>
              </div>

              {/* Add Criteria Form */}
              <form onSubmit={handleAddCriteria} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Tên tiêu chí (Criteria Name)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ví dụ: Kiểm tra việc phân trang ở màn hình quản trị"
                    value={newCriteria.name}
                    onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                    required
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Kiểu dữ liệu đầu vào (Input Type)</label>
                    <select 
                      className="form-control"
                      value={newCriteria.type}
                      onChange={(e) => setNewCriteria({ ...newCriteria, type: e.target.value })}
                    >
                      <option value="level">Level Select (Chọn mức độ: Xuất sắc/Tốt/Trung bình/Yếu)</option>
                      <option value="checkbox">Checkbox (Đánh dấu Đạt/Không đạt)</option>
                      <option value="text">Text Input (Nhập nhận xét trực tiếp)</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ height: '40px' }}>
                    <Plus size={16} /> Thêm tiêu chí
                  </button>
                </div>
              </form>

              {/* Criteria list inside category */}
              <div className="criteria-items">
                {activeCatDetails.criteria.length > 0 ? (
                  activeCatDetails.criteria.map(crit => (
                    <div key={crit.id} className="criteria-item-row" style={{ backgroundColor: 'white' }}>
                      <div className="criteria-info">
                        <span className="criteria-name">{crit.name}</span>
                        <span className="criteria-type">
                          Loại: <strong>{crit.type === 'level' ? 'Level Select' : crit.type === 'checkbox' ? 'Checkbox' : 'Text Input'}</strong>
                        </span>
                      </div>
                      <button 
                        type="button" 
                        className="slot-remove-btn"
                        style={{ position: 'static' }}
                        onClick={() => handleDeleteCriteria(activeCategory, crit.id)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '4px' }}>
                    Chưa có tiêu chí nào trong danh mục này. Hãy cấu hình tiêu chí đầu tiên!
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              Hãy tạo danh mục ở trên trước khi cấu hình tiêu chí.
            </div>
          )}

        </div>

        {/* Right Column: High-fidelity Lecturer View Preview */}
        <div className="preview-pane">
          <h3 className="preview-title">
            <Eye size={18} style={{ color: 'var(--primary)' }} />
            Giao diện Giảng viên Review (Preview)
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px', backgroundColor: 'var(--info-bg)', border: '1px solid rgba(0, 101, 255, 0.2)', borderRadius: '6px', fontSize: '11px', color: '#0047b3' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>Dưới đây là mô phỏng giao diện khi giảng viên chấm điểm. Mỗi tiêu chí <strong>bắt buộc phải có một ô Nhận xét</strong> đi kèm bên dưới.</span>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
            {checklist.length > 0 ? (
              checklist.map(cat => (
                <div key={cat.id} style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--sidebar-bg)', paddingBottom: '6px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
                    {cat.name}
                  </h4>
                  
                  {cat.criteria.length > 0 ? (
                    cat.criteria.map((crit, idx) => (
                      <div key={crit.id} className="criteria-preview-card">
                        <div className="criteria-preview-name">{idx + 1}. {crit.name}</div>
                        
                        {/* Render Input Type */}
                        {crit.type === 'level' && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {['Excellent (Xuất sắc)', 'Good (Tốt)', 'Fair (Trung bình)', 'Poor (Yếu)'].map((lvl, lidx) => (
                              <div key={lidx} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px', backgroundColor: 'white', color: 'var(--text-muted)' }}>
                                {lvl}
                              </div>
                            ))}
                          </div>
                        )}

                        {crit.type === 'checkbox' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <input type="checkbox" disabled style={{ width: '16px', height: '16px' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hoàn thành tiêu chí này</span>
                          </div>
                        )}

                        {crit.type === 'text' && (
                          <div style={{ marginTop: '6px' }}>
                            <input type="text" className="form-control" disabled placeholder="Nhập câu trả lời/nhận xét kiểm tra..." style={{ fontSize: '11px', padding: '6px 10px' }} />
                          </div>
                        )}

                        {/* Core Business Rule: Mandatory comment textarea for ALL criteria items */}
                        <div className="preview-comment-box">
                          <label className="preview-comment-label">
                            * Lecturer Comment (Nhận xét bắt buộc của giảng viên):
                          </label>
                          <textarea 
                            className="preview-comment-textarea"
                            placeholder="Nhập nhận xét chi tiết cho tiêu chí này (bắt buộc)..."
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '12px' }}>
                      Chưa có tiêu chí nào trong danh mục này.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                Chưa có cấu hình checklist nào để hiển thị preview.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChecklistManagement;
