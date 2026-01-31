
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import JSZip from 'jszip';

/**
 * Downloads text as a .txt file
 */
export const downloadAsTxt = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

/**
 * Bundles multiple posts into a ZIP file
 */
export const downloadPostsAsZip = async (posts: any[], filename: string = 'linkedin-posts-bundle') => {
    const zip = new JSZip();
    
    posts.forEach((post, index) => {
        const formattedHashtags = post.hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ');
        const content = `
Tone: ${post.tone}
---
Post Text:
${post.postText}

Hashtags:
${formattedHashtags}

First Comment Suggestion:
${post.firstComment}

LinkedIn Story Version:
${post.storyVersion}
        `.trim();
        
        zip.file(`post-${index + 1}-${post.tone.toLowerCase().replace(/\s+/g, '-')}.txt`, content);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `${filename}.zip`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
};

/**
 * Downloads content as a professionally formatted PDF
 */
export const downloadAsPdf = (filename: string, content: string, useSerif = false) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 50;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;
    let y = 60;

    const fontStyle = useSerif ? 'times' : 'helvetica';
    doc.setFont(fontStyle, 'normal');

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = 50;
        }
    };

    const lines = content.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            y += 12;
            return;
        }

        // Detect potential headers (all caps or between **)
        const isHeading = /^[A-Z\s]{4,}:?$/.test(trimmedLine) || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**'));
        const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ') || trimmedLine.startsWith('* ') || /^\d+\./.test(trimmedLine);
        
        if (isHeading) {
            const headingText = trimmedLine.replace(/\*\*/g, '').toUpperCase();
            checkPageBreak(40);
            y += 10;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.setTextColor(31, 41, 55); 
            doc.text(headingText, margin, y);
            y += 6;
            doc.setDrawColor(229, 231, 235);
            doc.line(margin, y, pageWidth - margin, y);
            y += 18;
        } else if (isBullet) {
            doc.setFont(fontStyle, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            // Normalize to a professional bullet character for PDF display
            const bulletChar = '• ';
            const bulletContent = trimmedLine.replace(/^[-•*]\s*/, '');
            const splitText = doc.splitTextToSize(bulletContent, usableWidth - 20);
            checkPageBreak(splitText.length * 14);
            
            // Draw bullet
            doc.text(bulletChar, margin + 5, y);
            // Draw content with indent
            doc.text(splitText, margin + 20, y);
            y += splitText.length * 14 + 2;
        } else {
            doc.setFont(fontStyle, 'normal');
            doc.setFontSize(10);
            doc.setTextColor(55, 65, 81);
            // Simple splitText for long paragraphs
            const splitLines = doc.splitTextToSize(trimmedLine, usableWidth);
            checkPageBreak(splitLines.length * 14);
            doc.text(splitLines, margin, y);
            y += splitLines.length * 14 + 4;
        }
    });

    doc.save(`${filename}.pdf`);
};

/**
 * Downloads content as a professionally formatted .docx file
 */
export const downloadAsDocx = (filename: string, content: string) => {
    const lines = content.split('\n');
    const paragraphs = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return new Paragraph({ text: "", spacing: { after: 100 } });

        const isHeading = /^[A-Z\s]{4,}:?$/.test(trimmed) || (trimmed.startsWith('**') && trimmed.endsWith('**'));
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');

        if (isHeading) {
            return new Paragraph({
                text: trimmed.replace(/\*\*/g, '').toUpperCase(),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 240, after: 120 },
                border: { bottom: { color: "E5E7EB", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            });
        } else if (isBullet) {
            // Use native Microsoft Word bullets for professional formatting
            return new Paragraph({
                text: trimmed.replace(/^[-•*]\s*/, ''),
                bullet: { level: 0 },
                spacing: { after: 100 }
            });
        } else {
            // Support simple bolding in paragraph text
            const children = trimmed.split(/(\*\*.*?\*\*)/g).map(part => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return new TextRun({ text: part.slice(2, -2), bold: true, size: 20 });
                }
                return new TextRun({ text: part, size: 20 });
            });
            return new Paragraph({
                children,
                spacing: { after: 120 }
            });
        }
    });
    
    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
            children: paragraphs,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
};

/**
 * Downloads a base64 image as a JPG file
 */
export const downloadImage = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `${filename}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Professional LinkedIn sharing via URL Intent
 */
export const shareToLinkedIn = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    window.open(url, '_blank');
};

/**
 * Professional Twitter/X sharing via URL Intent
 */
export const shareToTwitter = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    window.open(url, '_blank');
};

/**
 * Professional WhatsApp sharing via URL Intent
 */
export const shareToWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
};

/**
 * Universal Native Web Share API (W3C Standard) with robust fallback
 */
export const shareText = async (title: string, text: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: text,
            });
        } catch (error) {
            // Check if user cancelled or some other non-critical error
            if ((error as any).name !== 'AbortError') {
                console.error('Error using Web Share API:', error);
            }
        }
    } else {
        // Essential Fallback: Copy to clipboard if navigator.share is missing (most desktops)
        try {
            await navigator.clipboard.writeText(text);
            alert('Content copied to clipboard! You can now paste it into any application.');
        } catch (err) {
            console.error('Clipboard fallback failed:', err);
        }
    }
};
