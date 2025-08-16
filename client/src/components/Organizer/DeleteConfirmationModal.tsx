import React from 'react';
import { Event } from '../../types';

interface DeleteConfirmationModalProps {
  event: Event;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  event, 
  onConfirm, 
  onCancel, 
  isDeleting 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h3>🗑️ Delete Event</h3>
        </div>
        
        <div className="modal-body">
          <p>Are you sure you want to delete this event?</p>
          <div className="event-preview">
            <h4>"{event.title}"</h4>
            <p><strong>Date:</strong> {new Date(event.date_time).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
          </div>
          <div className="warning-message">
            <p><strong>⚠️ Warning:</strong> This action cannot be undone. The event will be permanently removed and students will no longer be able to see it.</p>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            onClick={onCancel} 
            className="cancel-button"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="delete-button"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
