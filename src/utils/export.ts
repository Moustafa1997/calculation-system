import { Card, Invoice } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, TextRun, BorderStyle } from 'docx';
import { formatCurrency } from './formatting';
import html2canvas from 'html2canvas';

export const exportCardToPNG = async (cardElement: HTMLElement): Promise<void> => {
  try {
    // Add white background and maintain aspect ratio
    const canvas = await html2canvas(cardElement, {
      scale: 2, // Higher resolution
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: cardElement.offsetWidth,
      height: cardElement.offsetHeight
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `card_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('Error exporting card to PNG:', error);
    throw error;
  }
};

export const exportCardToPDF = (card: Card): void => {
  // Create new PDF document
  const doc = new jsPDF('l', 'mm', [148, 210]); // A5 landscape
  
  // Add Arabic font
  doc.addFont('https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1rzaLCr5IlLA.ttf', 'Tajawal', 'normal');
  doc.setFont('Tajawal');
  doc.setR2L(true);
  doc.setLanguage("ar");

  // Add company logo and name
  const logoWidth = 15;
  const logoHeight = 15;
  doc.addImage('https://images.pexels.com/photos/2893552/pexels-photo-2893552.jpeg', 'JPEG', 20, 10, logoWidth, logoHeight);
  doc.setFontSize(16);
  doc.text('الأهرام', 40, 20);
  doc.setFontSize(12);
  doc.text('للتوريدات', 40, 25);

  // Add card number (top right)
  doc.text(`${card.id}`, 190, 20);

  // Add supplier info
  doc.setFontSize(10);
  doc.text(`اسم المورد: ${card.supplierName || ''}`, 190, 35);
  doc.text(`رقم السيارة: ${card.vehicleNumber}`, 190, 42);
  doc.text(`اسم السائق: ${card.farmerName}`, 190, 49);

  // Add dates
  doc.text(`تاريخ الاستلام: ${card.date}`, 190, 56);
  doc.text(`تاريخ الوصول: ${card.date}`, 190, 63);

  // Create table
  const headers = [
    'نوعية',
    'عدد',
    'الوزن',
    'الوزن',
    'صافي',
    'نسبة',
    'كمية',
    'صافي الكمية',
    'نوع'
  ];
  const subHeaders = [
    'البضاعة',
    'التكرار',
    'القائم',
    'فارغ',
    'الوزن',
    'الخصم',
    'الخصم',
    'بعد الخصم',
    'التوريد'
  ];

  const data = [
    [
      '',
      '',
      card.grossWeight.toString(),
      '',
      card.grossWeight.toString(),
      `${card.discountPercentage}%`,
      card.discountAmount.toString(),
      card.netWeight.toString(),
      ''
    ]
  ];

  // @ts-ignore
  doc.autoTable({
    head: [headers, subHeaders],
    body: data,
    startY: 70,
    theme: 'grid',
    styles: {
      font: 'Tajawal',
      halign: 'center',
      fontSize: 8
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 }
    }
  });

  // Add signature lines
  const signatureY = 120;
  doc.setFontSize(10);
  
  doc.text('مهندس الفحص', 30, signatureY);
  doc.line(20, signatureY + 10, 60, signatureY + 10);
  
  doc.text('الأمن', 100, signatureY);
  doc.line(80, signatureY + 10, 120, signatureY + 10);
  
  doc.text('أمين المخزن', 170, signatureY);
  doc.line(150, signatureY + 10, 190, signatureY + 10);

  // Add verification text
  doc.setFontSize(8);
  doc.text('تم الفحص ووجدت مطابقة للمواصفات', 150, signatureY - 10);
  doc.text('المرفقات: أصل كارتة القبض وكارتة الوزن', 150, signatureY - 5);

  // Save the PDF
  doc.save(`card_${card.id}.pdf`);
}

export const exportCardToWord = async (card: Card): Promise<void> => {
  // Create borders for table cells
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Header with logo and company name
        new Table({
          width: {
            size: 100,
            type: "pct",
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: "الأهرام للتوريدات",
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  width: {
                    size: 33,
                    type: "pct",
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: `${card.id}`,
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: {
                    size: 33,
                    type: "pct",
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: "إذن إضافة محطة",
                      alignment: AlignmentType.LEFT,
                    }),
                  ],
                  width: {
                    size: 33,
                    type: "pct",
                  },
                }),
              ],
            }),
          ],
        }),

        // Supplier and vehicle info
        new Table({
          width: {
            size: 100,
            type: "pct",
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: `اسم المورد: ${card.supplierName || ''}`,
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: `رقم السيارة: ${card.vehicleNumber}`,
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: `اسم السائق: ${card.farmerName}`,
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: `تاريخ الاستلام: ${card.date}`,
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Main data table
        new Table({
          width: {
            size: 100,
            type: "pct",
          },
          rows: [
            // Headers
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "نوعية البضاعة", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "عدد التكرار", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "الوزن القائم", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "الوزن فارغ", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "صافي الوزن", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "نسبة الخصم", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "كمية الخصم", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "صافي الكمية بعد الخصم", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "نوع التوريد", alignment: AlignmentType.CENTER })],
                  borders,
                }),
              ],
            }),
            // Data row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: card.grossWeight.toString(), alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: card.grossWeight.toString(), alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${card.discountPercentage}%`, alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: card.discountAmount.toString(), alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: card.netWeight.toString(), alignment: AlignmentType.CENTER })],
                  borders,
                }),
                new TableCell({
                  children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })],
                  borders,
                }),
              ],
            }),
          ],
        }),

        // Verification text
        new Paragraph({
          text: "تم الفحص ووجدت مطابقة للمواصفات",
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: "المرفقات: أصل كارتة القبض وكارتة الوزن",
          alignment: AlignmentType.RIGHT,
        }),

        // Signatures
        new Table({
          width: {
            size: 100,
            type: "pct",
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: "مهندس الفحص", alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "_____________", alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "الأمن", alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "_____________", alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: "أمين المخزن", alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "_____________", alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `card_${card.id}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export const exportCardsToExcel = (cards: Card[], fileName = 'cards_data.xlsx'): void => {
  if (!Array.isArray(cards)) {
    console.error('Invalid cards data:', cards);
    throw new Error('Invalid cards data');
  }

  const data = cards.map(card => ({
    'المسلسل': card.id,
    'التاريخ': card.date,
    'اسم الفلاح': card.farmerName,
    'الوزن القائم': card.grossWeight,
    'الخصم (%)': card.discountPercentage,
    'كمية الخصم': card.discountAmount,
    'الوزن الصافي': card.netWeight,
    'رقم السيارة': card.vehicleNumber,
    'اسم المورد': card.supplierName
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cards');
  
  worksheet['!cols'] = [
    { wch: 10 }, // ID
    { wch: 12 }, // Date
    { wch: 20 }, // Farmer name
    { wch: 12 }, // Gross weight
    { wch: 10 }, // Discount %
    { wch: 12 }, // Discount amount
    { wch: 12 }, // Net weight
    { wch: 15 }, // Vehicle number
    { wch: 20 }, // Supplier name
  ];
  
  XLSX.writeFile(workbook, fileName);
}

export const exportInvoiceToWord = async (invoice: Invoice): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: 'فاتورة محاصيل',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `رقم الفاتورة: ${invoice.id}`,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: `التاريخ: ${invoice.date}`,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: `اسم الفلاح: ${invoice.farmerName}`,
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({ text: '' }), // Spacing
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'البيان', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: 'القيمة', alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'إجمالي كمية العقد', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.totalContractQuantity)} كجم`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'سعر العقد', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.contractPrice)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'إجمالي مبلغ العقد', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.contractAmount)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'كمية الحر', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.freeQuantity)} كجم`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'سعر الحر', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.freePrice)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'إجمالي مبلغ الحر', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.freeAmount)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'حق التقاوي', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.seedRights)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'خصومات إضافية', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.additionalDeductions)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'المبلغ النهائي', alignment: AlignmentType.RIGHT })] }),
                new TableCell({ children: [new Paragraph({ text: `${formatCurrency(invoice.finalAmount)} ج`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice_${invoice.id}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export const printInvoiceToPDF = (invoice: Invoice): void => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Add Arabic font
  doc.addFont('https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1rzaLCr5IlLA.ttf', 'Tajawal', 'normal');
  doc.setFont('Tajawal');
  doc.setR2L(true);
  doc.setLanguage("ar");
  
  // Add header
  doc.setFontSize(24);
  doc.text('فاتورة محاصيل', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(14);
  doc.text(`رقم الفاتورة: ${invoice.id}`, 190, 35, { align: 'right' });
  doc.text(`التاريخ: ${invoice.date}`, 190, 42, { align: 'right' });
  doc.text(`اسم الفلاح: ${invoice.farmerName}`, 190, 49, { align: 'right' });
  doc.text(`حالة الدفع: ${invoice.isPaid ? 'مدفوع بالكامل' : 'غير مدفوع'}`, 190, 56, { align: 'right' });
  
  if (!invoice.isPaid && invoice.remainingAmount > 0) {
    doc.text(`المبلغ المتبقي: ${formatCurrency(invoice.remainingAmount)} ج`, 190, 63, { align: 'right' });
  }
  
  // Add calculations
  let y = 75;
  const lineHeight = 7;
  
  // Contract amount calculation
  doc.text('إجمالي مبلغ العقد = كمية العقد × سعر العقد', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.totalContractQuantity)} × ${formatCurrency(invoice.contractPrice)}`, 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.contractAmount)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 1.5;
  
  // Free amount calculation
  doc.text('إجمالي مبلغ الحر = كمية الحر × سعر الحر', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.freeQuantity)} × ${formatCurrency(invoice.freePrice)}`, 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.freeAmount)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 1.5;
  
  // Total amount calculation
  doc.text('إجمالي المبلغ الكلي = إجمالي مبلغ العقد + إجمالي مبلغ الحر', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.contractAmount)} + ${formatCurrency(invoice.freeAmount)}`, 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.totalAmount)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 1.5;
  
  // Seed rights calculation
  doc.text('حق التقاوي = مبلغ الشكائر + مبلغ الكيلوجرامات', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.seedRights)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 1.5;
  
  // Net amount calculation
  doc.text('صافي المبلغ = إجمالي المبلغ الكلي - حق التقاوي', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.totalAmount)} - ${formatCurrency(invoice.seedRights)}`, 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.netAmount)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 1.5;
  
  // Final amount calculation with green background
  doc.setFillColor(240, 255, 240);
  doc.rect(20, y - 2, 170, lineHeight * 4, 'F');
  doc.setFontSize(16);
  doc.text('المبلغ النهائي = صافي المبلغ - الخصومات الإضافية', 190, y, { align: 'right' });
  y += lineHeight;
  doc.text(`= ${formatCurrency(invoice.netAmount)} - ${formatCurrency(invoice.additionalDeductions)}`, 190, y, { align: 'right' });
  y += lineHeight;
  doc.setFontSize(18);
  doc.text(`= ${formatCurrency(invoice.finalAmount)} ج`, 190, y, { align: 'right' });
  y += lineHeight * 2;
  
  // Add cards table
  doc.setFontSize(14);
  doc.text('الكارتات المرتبطة', 105, y, { align: 'center' });
  y += lineHeight * 1.5;
  
  // @ts-ignore
  doc.autoTable({
    startY: y,
    head: [['رقم السيارة', 'الوزن الصافي', 'الخصم', 'الوزن القائم', 'اسم الفلاح', 'التاريخ', 'الرقم']],
    body: invoice.cards.map(card => [
      card.vehicleNumber,
      `${formatCurrency(card.netWeight)} كجم`,
      `${formatCurrency(card.discountPercentage)}%`,
      `${formatCurrency(card.grossWeight)} كجم`,
      card.farmerName,
      card.date,
      card.id.toString()
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: [76, 175, 80],
      halign: 'right',
      fontSize: 12,
      font: 'Tajawal'
    },
    styles: { 
      font: 'Tajawal',
      halign: 'right',
      fontSize: 10
    },
    margin: { right: 15 }
  });
  
  doc.save(`invoice_${invoice.id}.pdf`);
}