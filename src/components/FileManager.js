// src/components/FileManager.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2 } from 'lucide-react';

const FileManager = ({ files, onFilesUpdate }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      file: file
    }));
    onFilesUpdate([...files, ...newFiles]);
  }, [files, onFilesUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif'],
      'text/*': ['.txt', '.pdf', '.doc', '.docx'],
      'application/json': ['.json']
    }
  });

  const removeFile = (fileId) => {
    onFilesUpdate(files.filter(file => file.id !== fileId));
  };

  return (
    <div className="file-manager">
      <h2>File Manager</h2>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={48} />
        <p>
          {isDragActive ?
            "Drop files here..." :
            "Drag & drop files here, or click to select files"
          }
        </p>
      </div>

      <div className="files-list">
        <h3>Uploaded Files ({files.length})</h3>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
              <div key={file.id} className="file-card">
                <FileText size={32} />
                <div className="file-info">
                  <h4>{file.name}</h4>
                  <p>{(file.size / 1024).toFixed(2)} KB</p>
                  <p>{new Date(file.lastModified).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="delete-btn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;