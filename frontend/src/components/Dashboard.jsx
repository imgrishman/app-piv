import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/Dashboard.css';
import pivoraLogo from '../assets/pivora_black.svg';
import pivoraPLogo from '../assets/pivora_p.svg';
import LogViewModal from './LogViewModal';
//import hourglass from '../assets/hourglass.gif';
//import edit_icon from '../assets/edit.svg';
import view_icon from '../assets/view.svg';

const PAGE_SIZE = 10;

const Dashboard = ({ onLogout }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'Id', direction: 'asc' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};
  useEffect(() => {
    const fetchLogs = () => {
        fetch('http://localhost:5000/api/logs')
            .then(res => res.json())
            .then(data => {
                const mappedLogs = data.map(row => {
                    // Parse processed date and time
                    const dateStr = row.date || '';
                    const timeStr = row.time || '00:00:00';
                    const dateTimeStr = `${dateStr}T${timeStr}`;
                    const dateObj = new Date(dateTimeStr);
                    const finalDate = isNaN(dateObj.getTime()) ? null : dateObj;

                    // Parse uploaded date as local date
                    const uploadedDateStr = row.uploaded_date || '';
                    const [year, month, day] = uploadedDateStr.split('-').map(Number);
                    const uploadedDateObj = new Date(year, month - 1, day);
                    const finalUploadedDate = isNaN(uploadedDateObj.getTime()) ? null : uploadedDateObj;

                    // Format dates consistently
                    const formatDate = (date) => {
                        if (!date || isNaN(date.getTime())) return '';
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = date.toLocaleString('default', { month: 'short' });
                        const year = date.getFullYear();
                        return `${day} ${month} ${year}`;
                    };

                    return {
                        Id: row.Id,
                        fileName: row.fileName || 'Invalid',
                        filePath: row.filePath || 'undefined',
                        status: row.status || 'Invalid',
                        date: finalDate,
                        Time: finalDate ? finalDate.toLocaleTimeString('en-US', { hour12: false }) : '',
                        uploaded_date: formatDate(finalUploadedDate),
                        Editedby: row.Editedby || '',
                        Result: row.Result || 'Invalid',
                    };
                });

                setLogs(mappedLogs);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    fetchLogs();

    // Set interval to refresh every 2 seconds
    const intervalId = setInterval(fetchLogs, 2000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
}, []);



  // Filter logs by date range and status
  const filteredLogs = logs.filter(log => {
    let inRange = true;
    
    // Date Range Check
    if (startDate && !endDate) {
        const dayEnd = new Date(startDate);
        dayEnd.setHours(23, 59, 59, 999);
        inRange = log.date >= startDate && log.date <= dayEnd;
    } else if (startDate && endDate) {
        const dayEnd = new Date(endDate);
        dayEnd.setHours(23, 59, 59, 999);
        inRange = log.date >= startDate && log.date <= dayEnd;
    }

    // Status Filter (case-insensitive)
    const statusMatch = !statusFilter || log.status.toLowerCase() === statusFilter.toLowerCase();
    
    return inRange && statusMatch;
});



  // Sorting logic
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortConfig.key === 'Id') {
      const aNum = parseInt(a.Id, 10);
      const bNum = parseInt(b.Id, 10);
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    }
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? a.date - b.date
        : b.date - a.date;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedLogs.length / PAGE_SIZE) || 1;
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // CSV download handler
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Uploaded Date', 'File Name', 'File Path', 'Status', 'Date', 'Time', 'Edited by', 'Result'];
    const rows = filteredLogs.map(log => [
      log.Id,
      log.uploaded_date,
      log.fileName,
      log.filePath,
      log.status,
      formatDate(log.date),
      log.Time,
      log.Editedby,
      // Convert Result to a JSON string with fallback
      // JSON.stringify(log.Result || '{}')
      `"${JSON.stringify(log.Result || '{}').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for status label
  const statusLabel = (status) => {
    if (status === 'New') return <span className="status-badge new"> 🔵 New</span>;
    if (status === 'PROCESSED') return <span className="status-badge processed">🟢 Done</span>;
    if (status === 'IN_PROCESS') return <span className="status-badge processing"> 🟡 In Progress</span>;
    return status;
  };

  // Helper for status select display
  const statusOptions = [
    { value: '', label: 'Status' },
    { value: 'New', label: ' 🔵 New' },
    { value: 'PROCESSED', label: ' 🟢 Done' },
    { value: 'IN_PROCESS', label: '🟡 In Progress' },
  ];

  // Advanced Pagination rendering
  const renderPagination = () => {
    const pages = [];
    const pageNeighbors = 1;
    let startPage = Math.max(2, currentPage - pageNeighbors);
    let endPage = Math.min(totalPages - 1, currentPage + pageNeighbors);

    // Always show first page
    pages.push(
      <button key={1} className={`page-btn${currentPage === 1 ? ' active' : ''}`} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>1</button>
    );

    // Show start ellipsis if needed
    if (startPage > 2) {
      pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
    }

    // Show middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} className={`page-btn${currentPage === i ? ' active' : ''}`} onClick={() => setCurrentPage(i)} disabled={currentPage === i}>{i}</button>
      );
    }

    // Show end ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
    }

    // Always show last page if more than 1
    if (totalPages > 1) {
      pages.push(
        <button key={totalPages} className={`page-btn${currentPage === totalPages ? ' active' : ''}`} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{totalPages}</button>
      );
    }

    // Page jump input
    const handlePageInput = (e) => {
      let val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setCurrentPage(val);
      }
    };

    return (
      <div className="pagination-pages">
        <button
          className="page-btn prev-next-btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          title="First"
        >
          &laquo;
        </button>
        <button
          className="page-btn prev-next-btn"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          title="Previous"
        >
          &lsaquo;
        </button>
        {pages}
        <button
          className="page-btn prev-next-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          title="Next"
        >
          &rsaquo;
        </button>
        <button
          className="page-btn prev-next-btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          title="Last"
        >
          &raquo;
        </button>
        <input
          className="page-jump-input"
          type="number"
          min={1}
          max={totalPages}
          value={currentPage}
          onChange={handlePageInput}
        />
        <span className="pagination-info">of {totalPages}</span>
      </div>
    );
  };

  // Add useEffect to reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, startDate, endDate]);

  // Reset filters handler
  const handleResetFilters = () => {
    setDateRange([null, null]);
    setStatusFilter('');
  };

  // Handler for view button
  const handleView = (log) => {
    setSelectedLog(log);
   
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLog(null);
  };

  const handleSubmitModal = () => {
    // Add submit logic here
    setModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(v => !v)} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
          <svg border='none' width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 12H16" stroke="#005D9B" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8L8 12L12 16" stroke="#005D9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 8L20 12L16 16" stroke="#005D9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="logo">
          <img src={sidebarCollapsed ? pivoraPLogo : (pivoraLogo || "/placeholder.svg")} alt="Pivora Logo" />
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-menu">
            <div className="menu-item active">
              <span className="menu-icon">📋</span>
              <span>Logs</span>
            </div>
          </div>
        )}
        <div className="sidebar-footer">
          <div className="user-avatar" title='ADMIN'>A</div>
          <button className="logout-button" onClick={onLogout}>
            {sidebarCollapsed ? (
              <span title="Logout">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2"/>
                  <rect x="9" y="5" width="2" height="7" rx="1" fill="#fff"/>
                </svg>
              </span>
            ) : 'LogOut'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="toolbar organized-toolbar">
          <div className="toolbar-group toolbar-left-group">
            <span className="date-icon">📅</span>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              dateFormat="dd MMM yyyy"
              className="date-picker-input"
              placeholderText="Select date or range"
              isClearable
              shouldCloseOnSelect={!startDate || (startDate && endDate)}
            />
          </div>
          <div className="toolbar-group status-toolbar-group toolbar-left-group">
            <div className="status-select-wrapper">
              <select 
                className="status-select enhanced-status-pill"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="dropdown-icon">▼</span>
            </div>
            <button className="reset-btn" onClick={handleResetFilters}>Reset</button>
          </div>
          <div className="toolbar-group toolbar-right-group">
            <button className="csv-download-btn modern-csv-btn" onClick={handleDownloadCSV}>
              <span role="img" aria-label="download"></span> Download CSV
            </button>
          </div>
        </div>

        <div className="logs-table">
          <table>
          <thead>
  <tr>
    <th rowSpan="2" onClick={() => handleSort('Id')} className="sortable-th">
      ID {sortConfig.key === 'Id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th rowSpan="2">Uploaded Date</th>
    <th rowSpan="2">File Name</th>
    <th rowSpan="2">File Path</th>
    <th rowSpan="2">Status</th>
    <th colSpan="2">Processed</th>
    <th rowSpan="2">View JSON</th>
    <th rowSpan="2">Edited by</th>
  </tr>
  <tr>
    <th onClick={() => handleSort('date')} className="sortable-th">
      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
    </th>
    <th>Time</th>
  </tr>
</thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'red' }}>Error: {error}</td>
                </tr>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.Id}</td>
                    <td>{log.uploaded_date}</td>
                    <td className="table-cell" title={log.fileName}>{log.fileName}</td>
                    <td className="table-cell" title={log.filePath}>{log.filePath}</td>
                    <td>{statusLabel(log.status)}</td>
                    <td>{formatDate(log.date)}</td>
                    <td>{log.Time}</td>
                    <td>
                      {/* <span> 
                        <button className="edit-btn" title="Edit">
                          <img src={edit_icon} alt="Edit" className="action-icon" />
                        </button>
                      </span>
                     */} 
                      <span>
                        <button className="view-btn" title="View" onClick={() => handleView(log)}>
                          <img src={view_icon} alt="View" className="view_icon" />
                        </button>
                      </span>
                    </td>
                    <td>{log.Editedby}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>No logs found.</td>
                </tr>
              )}
              {/* Only render empty rows if there is data */}
              {paginatedLogs.length > 0 && Array(PAGE_SIZE - paginatedLogs.length).fill(0).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td colSpan={7}>&nbsp;</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          {renderPagination()}
        </div>
        <div className="logViewModal">
        <LogViewModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          log={selectedLog}
        />
        </div>
      </div>
    </div>
  );
};


export default Dashboard;