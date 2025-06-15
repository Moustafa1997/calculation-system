import { getCards, getInvoices, saveCard, saveInvoice, deleteAllCards, deleteAllInvoices } from './storage';
import { Card, Invoice } from '../types';

interface BackupData {
  version: number;
  timestamp: string;
  cards: Card[];
  invoices: Invoice[];
}

export const createBackup = async (): Promise<string> => {
  try {
    const cards = getCards();
    const invoices = getInvoices();

    const backup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      cards,
      invoices
    };

    const json = JSON.stringify(backup);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `agricultural_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return 'تم إنشاء نسخة احتياطية بنجاح';
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
  }
};

export const restoreBackup = async (file: File): Promise<string> => {
  try {
    const text = await file.text();
    const backup: BackupData = JSON.parse(text);

    // Validate backup format
    if (!backup.version || !backup.timestamp || !Array.isArray(backup.cards) || !Array.isArray(backup.invoices)) {
      throw new Error('ملف النسخة الاحتياطية غير صالح');
    }

    // Clear existing data
    deleteAllCards();
    deleteAllInvoices();

    // Restore cards and invoices
    backup.cards.forEach(card => saveCard(card));
    backup.invoices.forEach(invoice => saveInvoice(invoice));

    return 'تم استعادة النسخة الاحتياطية بنجاح';
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw new Error('حدث خطأ أثناء استعادة النسخة الاحتياطية');
  }
};