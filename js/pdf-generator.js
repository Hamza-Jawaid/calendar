
class PDFGenerator {
    constructor(data) {
        this.data = data;
        this.colors = {
            agencyBlue: '#1a237e',
            agencyGold: '#fbc02d',
            agencyGray: '#f8f9fa',
            agencyDark: '#121212'
        };
        // A4 Dimensions in mm
        this.pageWidth = 297; // Landscape?? Wait, the preview is Landscape in HTML?
        // Checking CSS: .a4-page { width: 297mm; height: 210mm; } -> Yes, Landscape.
        this.pageHeight = 210;

        this.doc = new window.jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        this.setupFonts();
    }

    setupFonts() {
        this.doc.setFont("helvetica");
    }

    // Helper to convert hex to rgb for jsPDF
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    setTextColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) this.doc.setTextColor(rgb.r, rgb.g, rgb.b);
    }

    setDrawColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) this.doc.setDrawColor(rgb.r, rgb.g, rgb.b);
    }

    setFillColor(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
    }

    // SVG Helper using Canvas Path2D
    async createSvgImage(pathData, color, width, height, rotation) {
        const canvas = document.createElement('canvas');
        // Scale up for quality
        const scale = 4;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvas.width/2, -canvas.height/2);

        ctx.scale(scale, scale);

        // Path2D expects standard SVG path data
        const p = new Path2D(pathData);
        ctx.fillStyle = color;
        ctx.fill(p);

        return canvas.toDataURL('image/png');
    }

    async generate() {
        // COVER PAGE
        await this.drawCoverPage();

        // POST PAGES
        for (let i = 0; i < this.data.posts.length; i++) {
            this.doc.addPage();
            await this.drawPostPage(this.data.posts[i], i);
        }

        // THANK YOU PAGE
        this.doc.addPage();
        await this.drawThankYouPage();

        this.doc.save((this.data.client.name || 'Calendar') + '_Calendar.pdf');
    }

    async drawCoverPage() {
        const doc = this.doc;
        const width = this.pageWidth;
        const height = this.pageHeight;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background Icons (Approximated Positions from HTML)
        // Top Left
        const iconPhone = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.58-1.09v8.32c0 .41.01.82-.07 1.23-.2 1.05-.63 2.06-1.29 2.94-1.26 1.69-3.26 2.74-5.36 2.97-1.48.16-2.99-.04-4.35-.61-1.3-.55-2.45-1.44-3.26-2.6-1.07-1.52-1.39-3.5-.83-5.33.62-2.02 2.31-3.63 4.39-4.1.75-.17 1.53-.2 2.29-.11v4.06c-.32-.12-.66-.19-1-.19-.84-.01-1.63.43-2.03 1.17-.38.71-.28 1.59.25 2.22.45.54 1.14.86 1.85.83.8-.03 1.55-.4 2.01-1.06.4-.58.58-1.29.5-1.99V.02z";
        const imgPhone = await this.createSvgImage(iconPhone, this.colors.agencyGold, 24, 24, -12);
        doc.addImage(imgPhone, 'PNG', 24, 24, 24, 24); // x, y, w, h

        // Top Right
        const iconCal = "M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5c0 3.3-2.45 5.75-5.75 5.75h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5c-2.35 0-4.25 1.9-4.25 4.25v8.5c0 2.35 1.9 4.25 4.25 4.25h8.5c2.35 0 4.25-1.9 4.25-4.25v-8.5c0-2.35-1.9-4.25-4.25-4.25h-8.5zm8.5 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-4.25 1.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";
        const imgCal = await this.createSvgImage(iconCal, this.colors.agencyGold, 20, 20, 6);
        doc.addImage(imgCal, 'PNG', width - 45, 40, 20, 20);

        // Bottom Left
        const iconClock = "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";
        const imgClock = await this.createSvgImage(iconClock, this.colors.agencyGold, 20, 20, -6);
        doc.addImage(imgClock, 'PNG', 20, height - 50, 20, 20);

        // Bottom Right
        const iconTarget = "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.567-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.852-2.433-4.587 0-3.725 2.706-7.149 7.809-7.149 4.098 0 7.284 2.922 7.284 6.828 0 4.075-2.572 7.35-6.143 7.35-1.198 0-2.324-.623-2.711-1.36l-.738 2.813c-.265 1.015-.985 2.285-1.467 3.064.91.267 1.868.412 2.854.412 6.621 0 11.979-5.368 11.979-11.99C23.996 5.367 18.631 0 12.017 0z";
        const imgTarget = await this.createSvgImage(iconTarget, this.colors.agencyGold, 24, 24, 12);
        doc.addImage(imgTarget, 'PNG', width - 50, height - 50, 24, 24);

        // Center Content
        let y = 50;

        // Presented By
        // Logo
        if (this.data.agency.logo) {
            doc.addImage(this.data.agency.logo, 'JPEG', centerX - 10, y, 20, 20); // rough size
            y += 25;
        } else {
            // Fallback Circle C
            this.setDrawColor(this.colors.agencyGold);
            this.setFillColor(this.colors.agencyBlue);
            doc.setLineWidth(1);
            doc.circle(centerX, y + 10, 10, 'FD');

            this.setTextColor(this.colors.agencyGold);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("C", centerX, y + 15, { align: 'center' });
            y += 25;
        }

        // "PRESENTED BY"
        this.setTextColor('#9ca3af'); // gray-400
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("PRESENTED BY", centerX, y, { align: 'center', charSpace: 3 }); // charSpace unsupported in basic jsPDF? Check docs. Usually requires advanced API.
        // Actually charSpace is supported in recent versions as option.
        y += 6;

        // Agency Name
        this.setTextColor(this.colors.agencyBlue);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text((this.data.agency.name || '').toUpperCase(), centerX, y, { align: 'center', charSpace: 2 });
        y += 40;

        // Client Content
        // Client Name
        this.setTextColor(this.colors.agencyDark);
        doc.setFontSize(42);
        doc.setFont("helvetica", "bold");
        doc.text((this.data.client.name || '').toUpperCase(), centerX, y, { align: 'center' });
        y += 15;

        // Gold Line
        this.setDrawColor(this.colors.agencyGold);
        this.setFillColor(this.colors.agencyGold);
        doc.rect(centerX - 15, y, 30, 2, 'F');
        y += 20;

        // Client Subtitle
        this.setTextColor('#4b5563'); // gray-600
        doc.setFontSize(20);
        doc.setFont("helvetica", "normal");
        doc.text((this.data.client.subtitle || '').toUpperCase(), centerX, y, { align: 'center', charSpace: 2 });

        // Footer
        this.drawFooter(doc, height - 20, true);
    }

    async drawPostPage(post, index) {
        const doc = this.doc;
        const width = this.pageWidth;
        const height = this.pageHeight;

        // Header
        doc.setFillColor('white');
        doc.rect(0, 0, width, 25, 'F'); // Header bg

        // Client Name (Left)
        this.setTextColor('#1f2937'); // gray-800
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text((this.data.client.name || '').toUpperCase(), 16, 17);

        // Post Number (Right)
        this.setTextColor('#9ca3af'); // gray-400
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const postNumText = "POST #";
        const numText = (index + 1).toString().padStart(2, '0');

        doc.text(postNumText, width - 16, 15, { align: 'right' });
        this.setTextColor(this.colors.agencyBlue);
        doc.setFontSize(16);
        doc.text(numText, width - 16, 19, { align: 'right' });

        // Separator
        this.setDrawColor('#f3f4f6'); // gray-100
        doc.line(0, 25, width, 25);

        // Content Area (Two Columns)
        const leftColX = 16;
        const leftColW = (width * 0.4) - 20; // 40% width approx
        const rightColX = (width * 0.4) + 10;
        const rightColW = (width * 0.6) - 26; // Remaining width minus padding
        const startY = 40;

        // --- Left Column ---

        // Label "CAPTION"
        this.setTextColor(this.colors.agencyBlue);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("CAPTION", leftColX, startY);
        // Underline
        this.setDrawColor(this.colors.agencyGold);
        doc.setLineWidth(0.5);
        doc.line(leftColX, startY + 2, leftColX + 15, startY + 2);

        let curY = startY + 15;

        // Headline
        if (post.headline) {
            this.setTextColor('#111827'); // gray-900
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            const headlineLines = doc.splitTextToSize(post.headline, leftColW);
            doc.text(headlineLines, leftColX, curY);
            curY += (headlineLines.length * 6) + 5;
        }

        // Caption
        if (post.caption) {
            this.setTextColor('#4b5563'); // gray-600
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const captionLines = doc.splitTextToSize(post.caption, leftColW);
            doc.text(captionLines, leftColX, curY);
            curY += (captionLines.length * 5) + 10;
        }

        // Hashtags (Separator first)
        this.setDrawColor('#f3f4f6');
        doc.line(leftColX, curY, leftColX + leftColW, curY);
        curY += 8;

        if (post.hashtags) {
            this.setTextColor('#2563eb'); // blue-600
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            const hashtagLines = doc.splitTextToSize(post.hashtags, leftColW);
            doc.text(hashtagLines, leftColX, curY);
        }

        // --- Right Column (Image) ---
        if (post.image) {
            try {
                // Calculate fit
                const maxImgH = height - 50 - 25; // Page height - footer - header
                // We want to center it in the right column area
                const imgProps = doc.getImageProperties(post.image);
                const ratio = imgProps.width / imgProps.height;

                let renderW = rightColW;
                let renderH = renderW / ratio;

                if (renderH > maxImgH) {
                    renderH = maxImgH;
                    renderW = renderH * ratio;
                }

                // Center in right column
                const imgX = rightColX + (rightColW - renderW) / 2;
                const imgY = 25 + (height - 25 - 20 - renderH) / 2; // Center vertically between header and footer

                doc.addImage(post.image, 'JPEG', imgX, imgY, renderW, renderH);

                // Rounded corners? jsPDF doesn't natively support rounded image clipping easily without advanced API patterns.
                // We'll skip rounded corners for now or simulate with a white frame overlay if needed.
                // For "Advanced", clean sharp images are fine.
            } catch (e) {
                console.error("Error adding image", e);
            }
        } else {
            // Placeholder Box
            this.setDrawColor('#e5e7eb');
            this.setFillColor('#eff6ff'); // blue-50
            doc.roundedRect(rightColX, 40, rightColW, 100, 3, 3, 'FD');
            this.setTextColor('#d1d5db');
            doc.setFontSize(20);
            doc.text("VISUAL", rightColX + rightColW/2, 90, { align: 'center' });
        }


        // Footer
        // Line
        this.setDrawColor('#e5e7eb');
        doc.line(16, height - 18, width - 16, height - 18);

        // Agency Info (Bottom Left)
        this.drawFooterLinks(doc, 16, height - 10, false);

        // Logo (Bottom Right)
        if (this.data.agency.logo) {
            doc.addImage(this.data.agency.logo, 'JPEG', width - 26, height - 16, 10, 10);
        } else {
             this.setTextColor(this.colors.agencyBlue);
             doc.setFontSize(12);
             doc.setFont("helvetica", "bold");
             doc.text("CAPTAIN", width - 20, height - 10, { align: 'right' });
        }
    }

    async drawThankYouPage() {
        const doc = this.doc;
        const width = this.pageWidth;
        const centerX = width / 2;
        let y = 40;

        // Logo
         if (this.data.agency.logo) {
            doc.addImage(this.data.agency.logo, 'JPEG', centerX - 15, y, 30, 30);
            y += 40;
        } else {
             this.setDrawColor(this.colors.agencyGold);
            this.setFillColor(this.colors.agencyBlue);
            doc.circle(centerX, y + 15, 15, 'FD');
            this.setTextColor(this.colors.agencyGold);
            doc.setFontSize(20);
            doc.text("C", centerX, y + 22, { align: 'center' });
             y += 40;
        }

        // "Thank You!"
        this.setTextColor(this.colors.agencyBlue);
        doc.setFontSize(50);
        doc.setFont("helvetica", "bold");
        doc.text("Thank You!", centerX, y, { align: 'center' });
        y += 25;

        // Body Text
        this.setTextColor('#111827');
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const bodyText = "We hope that you will like our research and approach. Please share your approval with us so we can start publishing on your social platforms. In addition, we would like your feedback on the work we did to make our work more pinpointed! If you want changes to this content, feel free to add notes to this PDF file or contact your project manager for a detailed discussion.";
        const bodyLines = doc.splitTextToSize(bodyText, 180); // max width 180mm
        doc.text(bodyLines, centerX, y, { align: 'center', lineHeightFactor: 1.5 });
        y += 50;

        // Contact Pill
        const pillW = 160;
        const pillH = 20;
        const pillX = centerX - pillW/2;

        this.setFillColor(this.colors.agencyBlue);
        doc.roundedRect(pillX, y, pillW, pillH, 10, 10, 'F');

        // Contact Links inside Pill
        this.setTextColor('white');
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        // Phone
        const phone = this.data.agency.phone || '';
        const email = this.data.agency.email || '';
        const website = this.data.agency.website || '';

        // Simple Layout: distribute them
        const partW = pillW / 3;

        // Phone
        const phoneX = pillX + partW * 0.5;
        doc.text(phone, phoneX, y + 13, { align: 'center' });
        doc.link(phoneX - 20, y, 40, pillH, { url: `tel:${phone}` });

        // Email
        const emailX = pillX + partW * 1.5;
        doc.text(email, emailX, y + 13, { align: 'center' });
        doc.link(emailX - 20, y, 40, pillH, { url: `mailto:${email}` });

        // Website
        const displayWeb = website.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const webX = pillX + partW * 2.5;
        doc.text(displayWeb, webX, y + 13, { align: 'center' });
        doc.link(webX - 20, y, 40, pillH, { url: website.startsWith('http') ? website : `https://${website}` });

        y += 40;

        // Social Icons (Blue Circles)
        // We will just draw the circles and some approximate icons or use the paths
        const iconSize = 12; // mm
        const gap = 6;
        const startIconsX = centerX - ((iconSize * 4) + (gap * 3)) / 2;

        // Icon Paths
        const icon1 = "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"; // Facebook
        const icon2 = "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"; // Instagram (partial, needs rect)
        // Full Instagram Icon is complex (rect + path + line), let's simplify or try to draw fully
        // The path in HTML: <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37..."><line...
        // SVG to Canvas helper only takes one path string currently.
        // We will stick to simple shapes or skipped for now to avoid complexity,
        // OR better: we draw the circle container and put a letter/symbol if we can't render the SVG easily.
        // BUT user wants "exact".
        // Let's try to render the simple paths.

        const icons = [
             // Facebook
             { path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
             // Instagram (Approximated with just the camera circle part for now as Path2D takes one path string usually)
             // We can use a custom draw for this one if needed.
             { path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" },
             // Twitter/X
             { path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
             // LinkedIn
             { path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }
        ];

        for (let i = 0; i < icons.length; i++) {
            const ix = startIconsX + i * (iconSize + gap);

            // Draw Circle Container
            this.setDrawColor(this.colors.agencyBlue);
            this.doc.setLineWidth(0.3);
            this.doc.circle(ix + iconSize/2, y + iconSize/2, iconSize/2, 'S'); // Stroke only

            // Draw Icon inside
            // We use the helper. We need to center 24x24 viewBox in our 12x12 mm box.
            if (icons[i].path) {
                const img = await this.createSvgImage(icons[i].path, this.colors.agencyBlue, 24, 24, 0);
                // Padding: 3mm
                this.doc.addImage(img, 'PNG', ix + 3, y + 3, iconSize - 6, iconSize - 6);
            }
        }
    }

    drawFooter(doc, y, centered) {
        if (centered) {
            const width = this.pageWidth;
            // Draw centered links
            // We need to calculate text widths to position them nicely or just use fixed spacing
            // For simplicity, let's render them as a single line string but with link areas?
            // Hard to do link areas on centered text without measuring.

            // Let's measure
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            this.setTextColor('#6b7280'); // gray-500

            const phone = this.data.agency.phone || '';
            const email = this.data.agency.email || '';
            const website = this.data.agency.website || '';
            const displayWeb = website.replace(/^https?:\/\//, '').replace(/^www\./, '');

            const separator = " • ";
            const fullText = `${phone}${separator}${email}${separator}${displayWeb}`;
            const textW = doc.getTextWidth(fullText);
            const startX = (width - textW) / 2;

            doc.text(fullText, startX, y);

            // Add links
            let cursorX = startX;

            // Phone Link
            const pW = doc.getTextWidth(phone);
            doc.link(cursorX, y - 3, pW, 4, { url: `tel:${phone}` });
            cursorX += pW;

            // Separator
            const sW = doc.getTextWidth(separator);
            cursorX += sW;

            // Email Link
            const eW = doc.getTextWidth(email);
            doc.link(cursorX, y - 3, eW, 4, { url: `mailto:${email}` });
            cursorX += eW;

            // Separator
            cursorX += sW;

            // Web Link
            const wW = doc.getTextWidth(displayWeb);
            doc.link(cursorX, y - 3, wW, 4, { url: website.startsWith('http') ? website : `https://${website}` });

        }
    }

    drawFooterLinks(doc, x, y, centered) {
        // Left aligned version for post pages
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        this.setTextColor('#6b7280');

        const phone = this.data.agency.phone || '';
        const email = this.data.agency.email || '';
        const website = this.data.agency.website || '';
        const displayWeb = website.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const separator = " • ";

        let cursorX = x;

        // Phone
        doc.text(phone, cursorX, y);
        const pW = doc.getTextWidth(phone);
        doc.link(cursorX, y - 3, pW, 4, { url: `tel:${phone}` });
        cursorX += pW;

        // Sep
        this.setTextColor(this.colors.agencyGold);
        doc.text(separator, cursorX, y);
        const sW = doc.getTextWidth(separator);
        cursorX += sW;

        // Email
        this.setTextColor('#6b7280');
        doc.text(email, cursorX, y);
        const eW = doc.getTextWidth(email);
        doc.link(cursorX, y - 3, eW, 4, { url: `mailto:${email}` });
        cursorX += eW;

        // Sep
        this.setTextColor(this.colors.agencyGold);
        doc.text(separator, cursorX, y);
        cursorX += sW;

        // Web
        this.setTextColor('#6b7280');
        doc.text(displayWeb, cursorX, y);
        const wW = doc.getTextWidth(displayWeb);
        doc.link(cursorX, y - 3, wW, 4, { url: website.startsWith('http') ? website : `https://${website}` });
    }
}
