import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface UserRecord {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  year?: string;
  semester?: number;
  instagramUrl?: string;
  gear?: {
    cameraBody?: string;
    primaryLens?: string;
    secondaryLens?: string;
    accessories?: string[];
  };
  badges?: string[];
  eventsCovered?: Array<{
    eventName?: string;
    date?: string | Date;
    role?: string;
    location?: string;
    notes?: string;
  }>;
  performanceRating?: number;
  isApproved?: boolean;
  createdAt?: string | Date;
}

/**
 * Helper to format dates nicely
 */
const formatDate = (d?: string | Date) => {
  if (!d) return 'N/A';
  try {
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return String(d);
    return parsed.toISOString().split('T')[0];
  } catch (e) {
    return 'N/A';
  }
};

/**
 * 1. Export Full Master Registration Table & Event Coverage Log to PDF
 */
export const exportAllRegistrationsPdf = (users: UserRecord[], customTitle?: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const timestamp = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().split('T')[0];
  const totalCount = users.length;
  const approvedCount = users.filter((u) => u.isApproved).length;

  // --- Header Banner ---
  doc.setFillColor(15, 15, 20); // Dark sleek background
  doc.rect(0, 0, doc.internal.pageSize.width, 75, 'F');

  // Accent gradient line (Simulated with primary pink/red)
  doc.setFillColor(236, 72, 153); // Pink accent #ec4899
  doc.rect(0, 75, doc.internal.pageSize.width, 3, 'F');

  // Club Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('PIXELA PHOTOGRAPHY CLUB', 40, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 210);
  doc.text(
    customTitle || 'Official Master Registration Directory & Crew Roster',
    40,
    47
  );
  doc.text(
    'Oriental Group of Institutes, Bhopal | Student Media & Photography Council',
    40,
    60
  );

  // Metadata badge on top right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Records: ${totalCount} (${approvedCount} Active)`, doc.internal.pageSize.width - 40, 32, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 190);
  doc.text(`Generated: ${timestamp}`, doc.internal.pageSize.width - 40, 48, { align: 'right' });
  doc.text('Confidential / Official Record', doc.internal.pageSize.width - 40, 60, { align: 'right' });

  // --- Prepare Table Data ---
  const tableRows = users.map((u, index) => {
    const num = index + 1;
    const name = u.name || 'N/A';
    const email = u.email || 'N/A';
    const role = (u.role || 'member').toUpperCase();
    const dept = `${u.department || 'General'} (${u.year || '1st Yr'} - Sem ${u.semester || 1})`;
    const ig = u.instagramUrl
      ? u.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')
      : 'None';
    const gear = u.gear?.cameraBody
      ? `${u.gear.cameraBody}\n${u.gear.primaryLens || ''}`
      : 'Standard';
    const badges = Array.isArray(u.badges) && u.badges.length > 0 ? u.badges.slice(0, 2).join(', ') : 'Verified';
    
    // Format Event Coverage Dates
    let eventCoverageDates = 'None';
    if (Array.isArray(u.eventsCovered) && u.eventsCovered.length > 0) {
      eventCoverageDates = u.eventsCovered
        .map((e) => `${e.eventName || 'Event'} (${formatDate(e.date)})`)
        .slice(0, 2)
        .join('\n');
      if (u.eventsCovered.length > 2) {
        eventCoverageDates += `\n+${u.eventsCovered.length - 2} more`;
      }
    }

    const status = u.isApproved ? 'APPROVED' : 'PENDING';
    const regDate = formatDate(u.createdAt);

    return [num, name, email, role, dept, ig, gear, badges, eventCoverageDates, status, regDate];
  });

  // --- Render Master Table ---
  autoTable(doc, {
    startY: 90,
    head: [[
      '#',
      'Member Name',
      'Email Address',
      'Role',
      'Department & Sem',
      'Instagram',
      'Camera & Gear',
      'Badges',
      'Event Coverage Dates',
      'Status',
      'Joined Date',
    ]],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: [40, 40, 45],
      lineColor: [220, 220, 230],
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [24, 24, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 85, fontStyle: 'bold' },
      2: { cellWidth: 105 },
      3: { cellWidth: 55, fontStyle: 'bold' },
      4: { cellWidth: 95 },
      5: { cellWidth: 65 },
      6: { cellWidth: 95 },
      7: { cellWidth: 70 },
      8: { cellWidth: 105 },
      9: { cellWidth: 55, halign: 'center', fontStyle: 'bold' },
      10: { cellWidth: 55, halign: 'center' },
    },
    didParseCell: (data) => {
      // Highlight status column
      if (data.column.index === 9 && data.section === 'body') {
        if (data.cell.raw === 'APPROVED') {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        } else {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        }
      }
    },
    margin: { left: 30, right: 30 },
  });

  // --- Section 2: Chronological Event Coverage Log ---
  const allEvents: Array<{
    date: string;
    eventName: string;
    memberName: string;
    email: string;
    role: string;
    location: string;
    notes: string;
  }> = [];

  users.forEach((u) => {
    if (Array.isArray(u.eventsCovered)) {
      u.eventsCovered.forEach((e) => {
        allEvents.push({
          date: formatDate(e.date),
          eventName: e.eventName || 'Unnamed Event',
          memberName: u.name || 'Crew Member',
          email: u.email || '',
          role: e.role || 'Lead Shooter',
          location: e.location || 'Campus',
          notes: e.notes || 'Official event coverage',
        });
      });
    }
  });

  if (allEvents.length > 0) {
    allEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // @ts-expect-error - jspdf-autotable extends jsPDF instance
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 400;

    // Check if new page needed
    if (finalY > doc.internal.pageSize.height - 120) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 30);
      doc.text('📅 Complete Crew Event Coverage Log & Dates Timeline', 30, 40);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 30);
      doc.text('📅 Complete Crew Event Coverage Log & Dates Timeline', 30, finalY);
    }

    const eventRows = allEvents.map((e) => [
      e.date,
      e.eventName,
      `${e.memberName} (${e.email})`,
      e.role,
      e.location,
      e.notes,
    ]);

    autoTable(doc, {
      startY: finalY > doc.internal.pageSize.height - 120 ? 55 : finalY + 10,
      head: [['Coverage Date', 'Event Name', 'Assigned Crew Member', 'Role', 'Location', 'Coverage Notes']],
      body: eventRows,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue accent
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { cellWidth: 140, fontStyle: 'bold' },
        2: { cellWidth: 160 },
        3: { cellWidth: 90 },
        4: { cellWidth: 100 },
        5: { cellWidth: 180 },
      },
      margin: { left: 30, right: 30 },
    });
  }

  // --- Add Page Numbers & Footer ---
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 150);
    doc.text(
      'Pixela Photography Club • Oriental Group of Institutes • Official System Export',
      30,
      doc.internal.pageSize.height - 15
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 15,
      { align: 'right' }
    );
  }

  // Trigger download
  doc.save(`pixela_crew_registrations_report_${dateStamp}.pdf`);
};

/**
 * 2. Export Individual Crew Member Official Credentials & Track Record Dossier PDF
 */
export const exportCrewMemberDossierPdf = (member: UserRecord) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const timestamp = new Date().toLocaleString();
  const dateStamp = new Date().toISOString().split('T')[0];
  const memberId = member._id || member.id || 'N/A';
  const roleName = (member.role || 'member').toUpperCase();

  // --- Header Banner ---
  doc.setFillColor(15, 15, 22);
  doc.rect(0, 0, doc.internal.pageSize.width, 85, 'F');

  doc.setFillColor(236, 72, 153); // Pink accent line
  doc.rect(0, 85, doc.internal.pageSize.width, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('PIXELA PHOTOGRAPHY CLUB', 35, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 210, 220);
  doc.text('CREW MEMBER OFFICIAL CREDENTIALS & TRACK RECORD DOSSIER', 35, 50);
  doc.text('Oriental Group of Institutes, Bhopal | Student Media & Photography Council', 35, 64);

  // Status stamp top right
  doc.setFillColor(member.isApproved ? 34 : 217, member.isApproved ? 197 : 119, member.isApproved ? 94 : 6);
  doc.roundedRect(doc.internal.pageSize.width - 135, 22, 100, 22, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(member.isApproved ? 'VERIFIED CREW' : 'PENDING APPROVAL', doc.internal.pageSize.width - 85, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 180, 190);
  doc.text(`ID: ${memberId.slice(-8)}`, doc.internal.pageSize.width - 35, 58, { align: 'right' });
  doc.text(`Issued: ${dateStamp}`, doc.internal.pageSize.width - 35, 70, { align: 'right' });

  // --- Member Profile Box ---
  let cursorY = 110;

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(35, cursorY, doc.internal.pageSize.width - 70, 95, 6, 6, 'F');
  doc.setDrawColor(225, 230, 240);
  doc.roundedRect(35, cursorY, doc.internal.pageSize.width - 70, 95, 6, 6, 'D');

  // Name & Role
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 30);
  doc.text(member.name || 'Pixela Member', 50, cursorY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(236, 72, 153);
  doc.text(`ROLE: ${roleName}`, 50, cursorY + 40);

  // Details columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 95);
  doc.text(`Email: ${member.email || 'N/A'}`, 50, cursorY + 58);
  doc.text(`Department: ${member.department || 'General'} (${member.year || '1st Year'} • Sem ${member.semester || 1})`, 50, cursorY + 74);

  doc.text(`Instagram: ${member.instagramUrl || 'None'}`, 320, cursorY + 58);
  doc.text(`Performance Score: ${member.performanceRating || 5}/5.0 ⭐`, 320, cursorY + 74);

  cursorY += 115;

  // --- Equipment & Loadout Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);
  doc.text('📷 Gear & Camera Equipment Loadout', 35, cursorY);

  cursorY += 12;

  const gearData = [
    ['Primary Camera Body', member.gear?.cameraBody || 'Standard Camera Setup'],
    ['Primary Lens', member.gear?.primaryLens || 'Standard Prime/Kit Lens'],
    ['Secondary Lens', member.gear?.secondaryLens || 'None specified'],
    ['Accessories & Rigs', Array.isArray(member.gear?.accessories) && member.gear.accessories.length > 0 ? member.gear.accessories.join(', ') : 'Standard Gear (Tripod / Filters / Memory Cards)'],
  ];

  autoTable(doc, {
    startY: cursorY,
    body: gearData,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 140, fontStyle: 'bold', textColor: [70, 70, 85] },
      1: { cellWidth: 380, textColor: [30, 30, 40] },
    },
    margin: { left: 35, right: 35 },
  });

  // @ts-expect-error - jspdf-autotable extends jsPDF instance
  cursorY = doc.lastAutoTable.finalY + 20;

  // --- Badges & Credentials Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);
  doc.text('🎖️ Skill Badges & Verified Specializations', 35, cursorY);

  cursorY += 12;

  const badgesList = Array.isArray(member.badges) && member.badges.length > 0
    ? member.badges.join('  •  ')
    : 'Verified Crew Member  •  Visual Storyteller';

  doc.setFillColor(240, 245, 255);
  doc.roundedRect(35, cursorY, doc.internal.pageSize.width - 70, 25, 4, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text(badgesList, 45, cursorY + 16);

  cursorY += 42;

  // --- Event Coverage History Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 30);
  doc.text('📅 Logged Event Coverage Dates & Milestones', 35, cursorY);

  cursorY += 10;

  const eventsData = Array.isArray(member.eventsCovered) && member.eventsCovered.length > 0
    ? member.eventsCovered.map((e) => [
        formatDate(e.date),
        e.eventName || 'Campus Event',
        e.role || 'Shooter',
        e.location || 'Oriental Campus',
        e.notes || 'Full coverage delivered',
      ])
    : [['Current Season', 'Shutter Stories Photography Exhibition', 'Crew Contributor', 'Oriental Auditorium', 'Registered active participant']];

  autoTable(doc, {
    startY: cursorY,
    head: [['Coverage Date', 'Event Name', 'Assigned Role', 'Location', 'Milestone Notes']],
    body: eventsData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: {
      fillColor: [24, 24, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 75, fontStyle: 'bold' },
      1: { cellWidth: 140, fontStyle: 'bold' },
      2: { cellWidth: 85 },
      3: { cellWidth: 85 },
      4: { cellWidth: 140 },
    },
    margin: { left: 35, right: 35 },
  });

  // --- Official Authorization Seal ---
  // @ts-expect-error - jspdf-autotable extends jsPDF instance
  const authY = Math.min(doc.internal.pageSize.height - 85, doc.lastAutoTable.finalY + 40);

  doc.setDrawColor(200, 200, 210);
  doc.line(35, authY, 190, authY);
  doc.line(doc.internal.pageSize.width - 190, authY, doc.internal.pageSize.width - 35, authY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 130);
  doc.text('Student Coordinator Signature', 35, authY + 12);
  doc.text('Pixela Super Admin / Faculty In-Charge', doc.internal.pageSize.width - 190, authY + 12);

  // Footer
  doc.setFontSize(7);
  doc.text(
    `Official Pixela Credential Document • Generated: ${timestamp} • Verified by Pixela Club Engine`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 20,
    { align: 'center' }
  );

  const cleanName = (member.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`pixela_crew_dossier_${cleanName}_${dateStamp}.pdf`);
};
