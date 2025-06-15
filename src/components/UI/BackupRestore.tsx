import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { createBackup, restoreBackup } from '../../utils/backup';
import { useAlert } from '../../contexts/AlertContext';

const BackupRestore: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useAlert();

  const handleBackup = async () => {
    try {
      const message = await createBackup();
      showAlert('success', message);
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء النسخة الاحتياطية');
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const message = await restoreBackup(file);
      showAlert('success', message);
      // Reload the page to reflect restored data
      window.location.reload();
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'حدث خطأ أثناء استعادة النسخة الاحتياطية');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBackup}
        className="btn btn-secondary flex items-center"
      >
        <Download className="h-5 w-5 ml-1" />
        نسخة احتياطية
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-secondary flex items-center"
      >
        <Upload className="h-5 w-5 ml-1" />
        استعادة
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleRestore}
        className="hidden"
      />
    </div>
  );
};

export default BackupRestore;