/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { TaskItem, NoteItem, ChatMessage } from '../types';

export interface QuotePdfItem {
  text: string;
  author?: string;
  category?: string;
}

export interface PdfGeneratorResult {
  fileName: string;
  pageCount: number;
  dataUri?: string;
}

/**
 * Generates an instant high-quality Quotes & Wisdom PDF
 */
export function generateQuotesPdf(
  quotes: QuotePdfItem[],
  customTitle = 'तारा सुविचार एवं प्रेरक विचार संग्रह (Tara Quotes Collection)'
): PdfGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(8, 16, 32); // Deep navy #081020
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Accent Line
  doc.setDrawColor(0, 240, 255); // Cyan
  doc.setLineWidth(1.2);
  doc.line(margin, 36, pageWidth - margin, 36);

  // Header Title
  doc.setTextColor(0, 240, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TARA AI ASSISTANT', margin, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(customTitle || 'Curated Quotes & Wisdom Document', margin, 22);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${nowStr} | Creator: Mr. Brijmohan Kumar`, margin, 29);

  // Content rendering
  let cursorY = 46;

  quotes.forEach((q, idx) => {
    // Check if we need a new page
    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = 25;
    }

    // Card Box
    doc.setFillColor(248, 250, 252); // soft white-slate
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);

    // Calculate text height
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    const quoteLines = doc.splitTextToSize(`"${q.text}"`, contentWidth - 14);
    const cardHeight = Math.max(26, quoteLines.length * 5.5 + 16);

    doc.roundedRect(margin, cursorY, contentWidth, cardHeight, 3, 3, 'FD');

    // Left colored accent border
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(margin, cursorY, 3, cardHeight, 'F');

    // Card Badge / Index
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const badgeText = q.category ? `#${idx + 1} • ${q.category.toUpperCase()}` : `#${idx + 1} INSPIRATION`;
    doc.text(badgeText, margin + 8, cursorY + 7);

    // Quote Text
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(quoteLines, margin + 8, cursorY + 13);

    // Author
    if (q.author) {
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`— ${q.author}`, margin + 8, cursorY + cardHeight - 4);
    }

    cursorY += cardHeight + 8;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Tara Voice Assistant — AI Intelligence & Creative Studio', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 7);
  }

  const fileName = `Tara_Quotes_${Date.now()}.pdf`;
  doc.save(fileName);

  return {
    fileName,
    pageCount: totalPages,
  };
}

/**
 * Generates an instant high-quality Notes & Scratchpad PDF
 */
export function generateNotesPdf(
  notes: NoteItem[],
  customTitle = 'तारा नोट्स एवं कार्य सारांश (Tara Saved Notes)'
): PdfGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setDrawColor(56, 189, 248); // sky-400
  doc.setLineWidth(1.2);
  doc.line(margin, 36, pageWidth - margin, 36);

  doc.setTextColor(56, 189, 248);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('TARA AI • MEMORY CLUSTER', margin, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11.5);
  doc.setFont('helvetica', 'normal');
  doc.text(customTitle || 'Exported Knowledge Notes & Directives', margin, 22);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${nowStr} | Total Notes: ${notes.length}`, margin, 29);

  let cursorY = 46;

  if (notes.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(11);
    doc.text('No notes currently recorded in memory.', margin, cursorY);
  }

  notes.forEach((note) => {
    if (cursorY > pageHeight - 45) {
      doc.addPage();
      cursorY = 25;
    }

    doc.setFontSize(10.5);
    const contentLines = doc.splitTextToSize(note.content, contentWidth - 12);
    const boxHeight = Math.max(24, contentLines.length * 5 + 16);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 2.5, 2.5, 'FD');

    // Left category color strip
    doc.setFillColor(14, 165, 233);
    doc.rect(margin, cursorY, 3, boxHeight, 'F');

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(note.title, margin + 7, cursorY + 7);

    // Tags / Category
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    const metaStr = `Category: ${note.category} | Tags: ${note.tags?.join(', ') || 'None'}`;
    doc.text(metaStr, margin + 7, cursorY + 12);

    // Content
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9.5);
    doc.text(contentLines, margin + 7, cursorY + 18);

    cursorY += boxHeight + 7;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Tara Voice Assistant — Personal Productivity Report', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 7);
  }

  const fileName = `Tara_Notes_${Date.now()}.pdf`;
  doc.save(fileName);

  return {
    fileName,
    pageCount: totalPages,
  };
}

/**
 * Generates an executive Session & Conversation Report PDF
 */
export function generateSessionReportPdf(
  tasks: TaskItem[],
  notes: NoteItem[],
  messages: ChatMessage[],
  reportTitle = 'तारा सत्र एवं कार्य रिपोर्ट (Tara Executive Session Report)'
): PdfGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(3, 105, 161); // deep sky
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('TARA AI EXECUTIVE INTELLIGENCE REPORT', margin, 14);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(reportTitle || 'Full Session Analytics, Task Status & Conversation Highlights', margin, 22);

  doc.setTextColor(224, 242, 254);
  doc.setFontSize(8.5);
  const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${nowStr} | Creator: Mr. Brijmohan Kumar`, margin, 29);

  let cursorY = 46;

  // Summary Metrics Section
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SESSION METRICS SUMMARY', margin + 6, cursorY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const completedTasks = tasks.filter((t) => t.completed).length;
  doc.text(`• Total Tasks: ${tasks.length} (${completedTasks} Completed, ${tasks.length - completedTasks} Pending)`, margin + 6, cursorY + 12);
  doc.text(`• Saved Memory Notes: ${notes.length} | Chat Exchanges: ${messages.length}`, margin + 6, cursorY + 18);

  cursorY += 28;

  // Section 1: Active Directives / Tasks
  doc.setTextColor(2, 132, 199);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. TASK DIRECTIVES & PRIORITIES', margin, cursorY);
  cursorY += 6;

  tasks.slice(0, 8).forEach((task) => {
    if (cursorY > pageHeight - 30) {
      doc.addPage();
      cursorY = 25;
    }

    const statusSymbol = task.completed ? '[DONE]' : '[PENDING]';
    doc.setTextColor(task.completed ? 16 : 71, task.completed ? 185 : 85, task.completed ? 129 : 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${statusSymbol} (${task.priority.toUpperCase()}) ${task.title}`, margin + 4, cursorY);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Category: ${task.category} | Est: ${task.estimatedTime || 'N/A'}`, margin + 8, cursorY + 4);

    cursorY += 9;
  });

  cursorY += 5;

  // Section 2: Recent Transcript Highlights
  if (cursorY > pageHeight - 40) {
    doc.addPage();
    cursorY = 25;
  }

  doc.setTextColor(2, 132, 199);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. CONVERSATION HIGHLIGHTS (RECENT)', margin, cursorY);
  cursorY += 6;

  messages.slice(-6).forEach((msg) => {
    if (cursorY > pageHeight - 35) {
      doc.addPage();
      cursorY = 25;
    }

    const senderTag = msg.sender === 'user' ? 'USER (Brijmohan):' : 'TARA AI:';
    doc.setTextColor(msg.sender === 'user' ? 30 : 2, msg.sender === 'user' ? 41 : 132, msg.sender === 'user' ? 59 : 199);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${senderTag} [${msg.timestamp}]`, margin + 4, cursorY);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const cleanText = msg.text.replace(/[*_#`]/g, '').slice(0, 300);
    const wrappedLines = doc.splitTextToSize(cleanText, contentWidth - 10);
    doc.text(wrappedLines, margin + 4, cursorY + 4.5);

    cursorY += wrappedLines.length * 4.2 + 8;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('Tara Voice Assistant — Full Executive Session Report', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 7);
  }

  const fileName = `Tara_Executive_Report_${Date.now()}.pdf`;
  doc.save(fileName);

  return {
    fileName,
    pageCount: totalPages,
  };
}

/**
 * Generates a PDF containing the exact rendered image card / poster
 */
export function generatePosterImagePdf(
  imageDataUrl: string,
  title = 'तारा सुविचार पोस्टर (Tara Quote Poster)',
  quote = '',
  author = ''
): PdfGeneratorResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Banner
  doc.setFillColor(8, 16, 32);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(0, 240, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TARA AI • POSTER & VISUAL STUDIO', margin, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, margin, 20);

  // Add Image
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (imgWidth * 9) / 16; // 16:9 or standard ratio
  const imgY = 36;

  try {
    doc.addImage(imageDataUrl, 'PNG', margin, imgY, imgWidth, Math.min(imgHeight, pageHeight - 75));
  } catch (err) {
    try {
      doc.addImage(imageDataUrl, 'JPEG', margin, imgY, imgWidth, Math.min(imgHeight, pageHeight - 75));
    } catch {
      // Image embed fallback
    }
  }

  // Quote caption below image if provided
  if (quote) {
    const captionY = imgY + Math.min(imgHeight, pageHeight - 75) + 12;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(`"${quote}"`, imgWidth - 10);
    doc.text(lines, margin + 5, captionY);

    if (author) {
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`— ${author}`, margin + 5, captionY + lines.length * 5 + 4);
    }
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Generated by Tara AI Voice Assistant • Creator: Mr. Brijmohan Kumar', margin, pageHeight - 7);

  const fileName = `Tara_Poster_${Date.now()}.pdf`;
  doc.save(fileName);

  return {
    fileName,
    pageCount: 1,
  };
}
