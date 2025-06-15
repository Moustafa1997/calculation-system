import React, { useEffect } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <Check className="h-5 w-5 text-green-500" />
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <X className="h-5 w-5 text-red-500" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96 ${styles.bg} border ${styles.border} rounded-lg shadow-lg`}>
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 ml-3">
            {styles.icon}
          </div>
          <div className={`ml-3 ${styles.text} font-medium`}>
            {message}
          </div>
          <div className="mr-auto pl-3">
            <button
              onClick={onClose}
              className={`${styles.text} hover:opacity-75 focus:outline-none`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;