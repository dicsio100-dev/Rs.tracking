import React, { useCallback, useState } from 'react';
import { useToast } from '../ui/ToastContext';

export const AttachmentUpload = ({ attachments, onUpload, onDelete, isLocked }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { addToast } = useToast();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isLocked) setIsDragging(true);
  }, [isLocked]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (files) => {
    if (isLocked || files.length === 0) return;
    
    // Validate sizes (10MB max)
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) {
        addToast(`Le fichier ${files[i].name} dépasse la limite de 10MB.`, 'error');
      } else {
        validFiles.push(files[i]);
      }
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(validFiles);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [isLocked, onUpload]);

  const handleFileInput = (e) => {
    processFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="attachment-section">
      <h3>Pièces jointes</h3>
      
      {!isLocked && (
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileInput}
            disabled={isUploading || isLocked}
            className="hidden-input"
          />
          <label htmlFor="file-upload" className="upload-label">
            {isUploading ? (
              <span className="loader-small"></span>
            ) : (
              <span className="upload-icon">📁</span>
            )}
            <p className="upload-text">
              <strong>Cliquez pour ajouter</strong> ou glissez-déposez vos fichiers
            </p>
            <p className="upload-hint">PDF, Images, Excel, Word (Max 10MB)</p>
          </label>
        </div>
      )}

      {attachments && attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((file) => (
            <li key={file.id} className="attachment-item">
              <div className="attachment-info">
                <span className="file-icon">📄</span>
                <div className="file-details">
                  <a 
                    href={`/uploads/${file.stored_name}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="file-name"
                  >
                    {file.original_name}
                  </a>
                  <span className="file-size">{formatSize(file.file_size)}</span>
                </div>
              </div>
              {!isLocked && (
                <button 
                  onClick={() => onDelete(file.id)}
                  className="btn-icon-danger"
                  title="Supprimer"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
