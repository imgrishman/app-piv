import React from 'react';
import '../styles/LogViewModal.css';
 
const LogViewModal = ({ open, onClose, onSubmit, log }) => {
  if (!open || !log) return null;
 
  // Safely parse the Result if it's a string
  // Safely parse the Result if it's a string
let parsedResult = {};
try {
  parsedResult = typeof log.Result === 'string' ? JSON.parse(log.Result) : log.Result || {};
} catch (error) {
  console.error("Failed to parse log.Result:", error);
  parsedResult = {};
}
 
  return (
<div className="modal-overlay">
<div className="modal-content">
<button className="modal-close" onClick={onClose} title="Close">&times;</button>
<div className="modal-body">
<div className="modal-container left">
<h3>Log Details</h3>
</div>
<div className="modal-container right">
<h3>Result</h3>
            {parsedResult && parsedResult.pages ? (
<pre>{JSON.stringify(parsedResult, null, 2)}</pre>
            ) : (
<p>No result available.</p>
            )}
</div>
</div>
<button className="modal-submit" onClick={onSubmit}>Submit</button>
</div>
</div>
  );
};
 
export default LogViewModal;