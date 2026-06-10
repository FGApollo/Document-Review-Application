import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CalendarRange, 
  ClipboardCheck, 
  History, 
  LogOut, 
  Bell, 
  ChevronRight,
  Info
} from 'lucide-react';
import './App.css';

// Import subpages
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ChecklistManagement from './pages/ChecklistManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import ReviewTracking from './pages/ReviewTracking';
import SystemLogs from './pages/SystemLogs';

// LocalStorage Helper Keys
const LS_USERS = 'capstone_portal_users';
const LS_CHECKLIST = 'capstone_portal_checklist';
const LS_GROUPS = 'capstone_portal_groups';
const LS_SLOTS = 'capstone_portal_slots';
const LS_REVIEWS = 'capstone_portal_reviews';
const LS_LOGS = 'capstone_portal_logs';
const LS_STEP = 'capstone_portal_step';

// Initial Mock Data
const initialUsers = {
  students: [
    { id: 's-1', code: 'SE160123', name: 'Nguyễn Văn An', email: 'annvse160123@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 01' },
    { id: 's-2', code: 'SE160456', name: 'Lê Thị Bình', email: 'binhltse160456@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 01' },
    { id: 's-3', code: 'SE160789', name: 'Trần Văn Cường', email: 'cuongtvse160789@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 02' },
    { id: 's-4', code: 'SE150111', name: 'Phạm Minh Đức', email: 'duchmse150111@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 02' },
    { id: 's-5', code: 'SE150222', name: 'Hoàng Anh Thư', email: 'thuhase150222@fpt.edu.vn', department: 'Software Engineering', status: 'Active', groupName: 'Group 03' },
    { id: 's-6', code: 'GD160124', name: 'Đặng Ngọc Long', email: 'longdngd160124@fpt.edu.vn', department: 'Digital Design', status: 'Active', groupName: 'Group 03' },
    { id: 's-7', code: 'GD160555', name: 'Vũ Minh Triết', email: 'trietvmgd160555@fpt.edu.vn', department: 'Digital Design', status: 'Inactive', groupName: 'Group 04' },
    { id: 's-8', code: 'IA160125', name: 'Bùi Thị Hạnh', email: 'hanhbtia160125@fpt.edu.vn', department: 'Information Assurance', status: 'Active', groupName: 'Group 05' }
  ],
  lecturers: [
    { id: 'l-1', name: 'Dr. Nguyễn Tấn Trần Minh Khang', email: 'khangnttm@fpt.edu.vn', department: 'Software Engineering', status: 'Active', activeReviewRound: true },
    { id: 'l-2', name: 'Dr. Lê Khánh Hưng', email: 'hunglk@fpt.edu.vn', department: 'Software Engineering', status: 'Active', activeReviewRound: true },
    { id: 'l-3', name: 'Dr. Trần Thị Kim Chi', email: 'chittk@fpt.edu.vn', department: 'Information Assurance', status: 'Active', activeReviewRound: true },
    { id: 'l-4', name: 'Dr. Phạm Minh Hoàng', email: 'hoangpm@fpt.edu.vn', department: 'Digital Design', status: 'Active', activeReviewRound: true },
    { id: 'l-5', name: 'Dr. Đặng Văn Sơn', email: 'sondv@fpt.edu.vn', department: 'Software Engineering', status: 'Inactive', activeReviewRound: false }
  ],
  moderators: [
    { id: 'm-1', name: 'Moderator Nguyễn Văn Lâm', email: 'lamnv@fpt.edu.vn', status: 'Active' },
    { id: 'm-2', name: 'Moderator Trần Bích Thuỷ', email: 'thuytb@fpt.edu.vn', status: 'Active' }
  ]
};

const initialChecklist = [
  {
    id: 'cat-1',
    name: 'UI/UX Design',
    criteria: [
      { id: 'crit-1', name: 'Thiết kế trực quan, bố cục rõ ràng và chuẩn nhận diện thương hiệu', type: 'level' },
      { id: 'crit-2', name: 'Tương thích giao diện hiển thị trên Mobile và các thiết bị di động', type: 'checkbox' }
    ]
  },
  {
    id: 'cat-2',
    name: 'Data Architecture',
    criteria: [
      { id: 'crit-3', name: 'Cấu trúc Database chuẩn hóa, thiết kế bảng phân quyền hợp lý', type: 'level' }
    ]
  },
  {
    id: 'cat-3',
    name: 'Business Logic & Core Features',
    criteria: [
      { id: 'crit-4', name: 'Các tính năng nghiệp vụ cốt lõi hoạt động đúng logic toán học', type: 'level' },
      { id: 'crit-5', name: 'Xử lý đầy đủ và kiểm thử các kịch bản lỗi biên (Edge Cases)', type: 'text' }
    ]
  }
];

const initialGroups = [
  { id: 'g-1', name: 'Group 01', topic: 'EV Management System (Hệ thống quản lý trạm sạc xe điện)', assignedSlotId: 'slot-3' },
  { id: 'g-2', name: 'Group 02', topic: 'AI Chatbot for Customer Service (Trợ lý ảo CSKH thông minh)', assignedSlotId: null },
  { id: 'g-3', name: 'Group 03', topic: 'Smart Home IoT Hub (Bộ điều khiển nhà thông minh IoT)', assignedSlotId: null },
  { id: 'g-4', name: 'Group 04', topic: 'UX Portfolio Builder (Nền tảng tạo hồ sơ năng lực UX)', assignedSlotId: null },
  { id: 'g-5', name: 'Group 05', topic: 'Cyber Security Sandbox (Môi trường ảo cô lập mã độc)', assignedSlotId: null }
];

const initialSlots = [
  { id: 'slot-1', date: '2026-06-12', time: '09:00 AM', room: 'Room A1', lecturerId: 'l-1', assignedGroupId: null },
  { id: 'slot-2', date: '2026-06-12', time: '10:00 AM', room: 'Room A1', lecturerId: null, assignedGroupId: null },
  { id: 'slot-3', date: '2026-06-13', time: '09:00 AM', room: 'Room B2', lecturerId: 'l-2', assignedGroupId: 'g-1' },
  { id: 'slot-4', date: '2026-06-13', time: '10:00 AM', room: 'Room B2', lecturerId: 'l-3', assignedGroupId: null },
  { id: 'slot-5', date: '2026-06-14', time: '11:00 AM', room: 'Room C3', lecturerId: null, assignedGroupId: null }
];

const initialReviews = [
  {
    id: 'rev-init-1',
    studentId: 's-1',
    studentName: 'Nguyễn Văn An',
    groupName: 'Group 01',
    lecturerId: 'l-2',
    lecturerName: 'Dr. Lê Khánh Hưng',
    status: 'Completed',
    checklistData: {
      'crit-1': { value: 'Excellent', comment: 'Giao diện thiết kế chỉn chu, màu sắc rất hiện đại và thống nhất.' },
      'crit-2': { value: 'Checked', comment: 'Đã tối ưu CSS Grid tốt trên màn hình iPhone 15.' },
      'crit-3': { value: 'Good', comment: 'Database phân rã tốt, tuy nhiên thiếu một số chỉ mục ngoại khóa.' },
      'crit-4': { value: 'Excellent', comment: 'Tính toán biểu phí sạc điện chuẩn xác theo thời gian thực.' },
      'crit-5': { value: 'Đã test thành công', comment: 'Đã xử lý timeout khi mất mạng đột ngột.' }
    }
  },
  {
    id: 'rev-init-2',
    studentId: 's-2',
    studentName: 'Lê Thị Bình',
    groupName: 'Group 01',
    lecturerId: 'l-2',
    lecturerName: 'Dr. Lê Khánh Hưng',
    status: 'Reviewed',
    checklistData: {
      'crit-1': { value: 'Good', comment: 'Giao diện trực quan nhưng font chữ hơi nhỏ.' },
      'crit-2': { value: 'Checked', comment: 'Responsive đạt yêu cầu.' },
      'crit-3': { value: 'Good', comment: 'Cấu trúc bảng lưu trữ ổn.' },
      'crit-4': { value: 'Good', comment: 'Nghiệp vụ cốt lõi hoạt động đúng cam kết.' },
      'crit-5': { value: 'Đã test thành công', comment: 'Đạt yêu cầu kiểm định.' }
    }
  }
];

const initialLogs = [
  { id: 'log-1', timestamp: '2026-06-10 10:00:15', actor: 'Moderator Nguyễn Văn Lâm', email: 'lamnv@fpt.edu.vn', role: 'Moderator', actionType: 'Login', details: 'Người điều phối đăng nhập vào hệ thống Moderator Panel.' },
  { id: 'log-2', timestamp: '2026-06-10 10:15:32', actor: 'Moderator Nguyễn Văn Lâm', email: 'lamnv@fpt.edu.vn', role: 'Moderator', actionType: 'Create Slot', details: 'Tạo danh sách các phòng thi ban đầu (Room A1, Room B2, Room C3).' },
  { id: 'log-3', timestamp: '2026-06-10 14:20:05', actor: 'Dr. Lê Khánh Hưng', email: 'hunglk@fpt.edu.vn', role: 'Lecturer', actionType: 'Register Slot', details: 'Giảng viên Lê Khánh Hưng đăng ký slot Room B2 ngày 13/06 lúc 09:00 AM.' },
  { id: 'log-4', timestamp: '2026-06-10 14:45:12', actor: 'Moderator Nguyễn Văn Lâm', email: 'lamnv@fpt.edu.vn', role: 'Moderator', actionType: 'Register Slot', details: 'Thiết lập lịch review cho Group 01 vào slot 09:00 AM ngày 13/06 tại Room B2.' }
];

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // Master State Machine
  const [users, setUsers] = useState(() => {
    const data = localStorage.getItem(LS_USERS);
    return data ? JSON.parse(data) : initialUsers;
  });

  const [checklist, setChecklist] = useState(() => {
    const data = localStorage.getItem(LS_CHECKLIST);
    return data ? JSON.parse(data) : initialChecklist;
  });

  const [groups, setGroups] = useState(() => {
    const data = localStorage.getItem(LS_GROUPS);
    return data ? JSON.parse(data) : initialGroups;
  });

  const [slots, setSlots] = useState(() => {
    const data = localStorage.getItem(LS_SLOTS);
    return data ? JSON.parse(data) : initialSlots;
  });

  const [reviews, setReviews] = useState(() => {
    const data = localStorage.getItem(LS_REVIEWS);
    return data ? JSON.parse(data) : initialReviews;
  });

  const [logs, setLogs] = useState(() => {
    const data = localStorage.getItem(LS_LOGS);
    return data ? JSON.parse(data) : initialLogs;
  });

  const [wizardStep, setWizardStep] = useState(() => {
    const data = localStorage.getItem(LS_STEP);
    return data ? parseInt(data, 10) : 3; // Default to Matchmaking step
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(LS_CHECKLIST, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(LS_GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(LS_SLOTS, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(LS_LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(LS_STEP, wizardStep.toString());
  }, [wizardStep]);

  // Toast Trigger Helper
  const triggerToast = (title, message, type = 'info') => {
    const newToast = {
      id: Date.now(),
      title,
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto remove after 4.5 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  // Log Generator Helper
  const addLog = (actionType, details) => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'Moderator Nguyễn Văn Lâm',
      email: 'lamnv@fpt.edu.vn',
      role: 'Moderator',
      actionType,
      details
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Page switcher mapper
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            users={users} 
            slots={slots} 
            reviews={reviews} 
            groups={groups}
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'users':
        return (
          <UserManagement 
            users={users} 
            setUsers={setUsers} 
            addLog={addLog} 
            triggerToast={triggerToast} 
          />
        );
      case 'checklist':
        return (
          <ChecklistManagement 
            checklist={checklist} 
            setChecklist={setChecklist} 
            addLog={addLog} 
            triggerToast={triggerToast} 
          />
        );
      case 'schedule':
        return (
          <ScheduleManagement 
            slots={slots} 
            setSlots={setSlots} 
            groups={groups} 
            setGroups={setGroups} 
            users={users} 
            wizardStep={wizardStep} 
            setWizardStep={setWizardStep} 
            reviews={reviews}
            setReviews={setReviews}
            addLog={addLog} 
            triggerToast={triggerToast} 
          />
        );
      case 'reviews':
        return (
          <ReviewTracking 
            reviews={reviews} 
            setReviews={setReviews} 
            checklist={checklist} 
            addLog={addLog} 
            triggerToast={triggerToast} 
          />
        );
      case 'logs':
        return (
          <SystemLogs 
            logs={logs} 
            setLogs={setLogs} 
            addLog={addLog} 
            triggerToast={triggerToast} 
          />
        );
      default:
        return <div style={{ padding: '24px' }}>Page Not Found</div>;
    }
  };

  // Breadcrumbs text helper
  const getBreadcrumbsText = () => {
    switch (currentPage) {
      case 'dashboard': return 'Tổng quan hệ thống';
      case 'users': return 'Quản lý người dùng';
      case 'checklist': return 'Quản lý tiêu chí Checklist';
      case 'schedule': return 'Quản lý Slot & Xếp lịch';
      case 'reviews': return 'Giám sát kết quả Review';
      case 'logs': return 'Nhật ký hệ thống';
      default: return 'Trang chủ';
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div className="toast-message-box">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <ClipboardCheck size={20} />
          </div>
          <div className="sidebar-title-container">
            <span className="sidebar-title">Capstone Portal</span>
            <span className="sidebar-subtitle">Moderator Panel</span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              <Users size={18} />
              <span>User Management</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'checklist' ? 'active' : ''}`}
              onClick={() => setCurrentPage('checklist')}
            >
              <CheckSquare size={18} />
              <span>Checklist Management</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'schedule' ? 'active' : ''}`}
              onClick={() => setCurrentPage('schedule')}
            >
              <CalendarRange size={18} />
              <span>Schedule & Slot</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'reviews' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reviews')}
            >
              <ClipboardCheck size={18} />
              <span>Review Tracking</span>
            </div>
          </li>
          <li>
            <div 
              className={`sidebar-menu-item ${currentPage === 'logs' ? 'active' : ''}`}
              onClick={() => setCurrentPage('logs')}
            >
              <History size={18} />
              <span>System Logs</span>
            </div>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-logout" onClick={() => {
            if (window.confirm('Bạn có chắc muốn đăng xuất khỏi hệ thống?')) {
              triggerToast('Đăng xuất', 'Hệ thống đã kết thúc phiên làm việc của bạn.', 'info');
              addLog('Login', 'Người điều phối thực hiện Đăng xuất khỏi hệ thống.');
            }
          }}>
            <LogOut size={16} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="app-header">
          <div className="header-breadcrumbs">
            <span>Breadcrumbs</span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span>Page</span>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-active">{getBreadcrumbsText()}</span>
          </div>

          <div className="header-actions">
            {/* Bell notification badge indicator */}
            <div className="notification-bell" onClick={() => {
              triggerToast('Thông báo', 'Hệ thống không có tin nhắn mới nào chưa đọc.', 'info');
            }}>
              <Bell size={18} />
              <span className="notification-badge">3</span>
            </div>

            <div className="user-profile">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" 
                alt="Avatar" 
                className="user-avatar" 
              />
              <div className="user-info">
                <span className="user-name">Nguyễn Văn Lâm</span>
                <span className="user-role">Moderator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic subpage router render */}
        <main className="page-container">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
