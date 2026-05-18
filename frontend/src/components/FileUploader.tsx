import React, { useState } from 'react';
import { Button, InputGroup, FormControl, Spinner } from 'react-bootstrap';
import { uploadCvFile } from '../services/candidateApi';

interface FileUploaderProps {
  /** Called when file data is successfully uploaded */
  onChange?: (fileData: { filePath: string; fileType: string }) => void;
  /** Called when file data is successfully uploaded (alias for onChange) */
  onUpload?: (fileData: { filePath: string; fileType: string }) => void;
  /** Called when an upload error occurs */
  onUploadError?: (errorMessage: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onChange,
  onUpload,
  onUploadError,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileData, setFileData] = useState<{ filePath: string; fileType: string } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Clear error state and reset upload status
   */
  const clearError = () => {
    if (onUploadError) {
      // Parent handles error display, just signal we're ready for new upload
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear previous errors and success state on file change
    clearError();
    setUploadSuccess(false);
    setFileData(null);

    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setFileName(selectedFile?.name || '');

    if (selectedFile && onChange) {
      onChange({ filePath: '', fileType: '' });
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    // Clear previous errors on new upload attempt
    clearError();
    setUploadSuccess(false);
    setFileData(null);
    setLoading(true);

    try {
      const result = await uploadCvFile(file);
      setFileData(result);
      setUploadSuccess(true);

      // Notify parent via both callbacks
      if (onChange) {
        onChange(result);
      }
      if (onUpload) {
        onUpload(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir archivo';
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <InputGroup className="mb-3">
        <FormControl
          type="file"
          onChange={handleFileChange}
          aria-label="File"
          aria-describedby="basic-addon2"
        />
        <Button variant="outline-secondary" onClick={handleFileUpload} disabled={!file || loading}>
          {loading ? (
            <Spinner animation="border" role="status" size="sm" />
          ) : (
            'Subir Archivo'
          )}
        </Button>
      </InputGroup>
      <p className="mb-0">Selected file: {fileName}</p>
      {uploadSuccess && fileData && (
        <p className="mt-2 text-success">
          Archivo subido con éxito
        </p>
      )}
    </div>
  );
};

export default FileUploader;