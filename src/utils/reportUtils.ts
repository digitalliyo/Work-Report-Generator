import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData, CompanyInfo } from "../types";
import { format } from "date-fns";

export const generateReportPDF = async (report: ReportData, companyInfo: CompanyInfo) => {
  const doc = new jsPDF();
  const brandColor = companyInfo.brandColor || "#0f172a";

  const clean = (text: string) => text.replace(/\(unclear\)/gi, "").trim();
  const isValid = (text: string) => {
    const t = text.toLowerCase().trim();
    return t && t !== "n/a" && t !== "not specified" && t !== "none" && t !== "undefined";
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [15, 23, 42];
  };

  const rgb = hexToRgb(brandColor);

  // --- Header ---
  // Pill: OFFICIAL DOCUMENTATION
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, 15, 45, 6, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL DOCUMENTATION", 37.5, 19, { align: "center" });

  // Company Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(clean(companyInfo.name), 15, 32);

  // Subtitle
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`DAILY WORK REPORT`, 15, 38);

  // Logo on the right - Fix placement and aspect ratio
  if (companyInfo.logo) {
    try {
      const img = new Image();
      img.src = companyInfo.logo;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if logo fails
      });

      if (img.complete && img.naturalWidth > 0) {
        const maxWidth = 45;
        const maxHeight = 20;
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;

        // Center in the 45x20 area
        const x = 145 + (maxWidth - width) / 2;
        const y = 15 + (maxHeight - height) / 2;

        doc.addImage(img, "PNG", x, y, width, height, undefined, "FAST");
      }
    } catch (e) {
      console.error("Logo error:", e);
    }
  }

  // Divider
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.2);
  doc.line(15, 50, 195, 50);

  // --- Personnel Grid ---
  const gridY = 60;
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "bold");
  doc.text("NAME", 15, gridY);
  doc.text("DATE", 75, gridY);
  doc.text("PROJECT", 135, gridY);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  
  const employeeName = clean(report.employee.name);
  const reportDate = format(new Date(report.date), "MMMM do, yyyy");
  const project = clean(report.project || "");

  doc.text(employeeName, 15, gridY + 6);
  doc.text(reportDate, 75, gridY + 6);
  if (isValid(project)) {
    doc.text(project, 135, gridY + 6);
  }

  const role = clean(report.employee.role || "");
  if (isValid(role)) {
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(role, 15, gridY + 11);
  }

  // --- Summary ---
  let currentY = gridY + 25;
  const summaryBullets = report.summary_bullets.filter(isValid);

  if (summaryBullets.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("• EXECUTIVE SUMMARY", 15, currentY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    currentY += 8;

    summaryBullets.forEach(bullet => {
      const cleanedBullet = clean(bullet);
      const lines = doc.splitTextToSize(cleanedBullet, 170);
      
      // Left border for summary
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(15, currentY - 2, 15, currentY + (lines.length * 6) - 2);
      
      doc.text(lines, 20, currentY);
      currentY += (lines.length * 6) + 4;
    });
  }

  // --- Tasks ---
  const validTasks = report.tasks.filter(t => isValid(clean(t.task)));

  if (validTasks.length > 0) {
    currentY += 5;
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("• TASK DOCUMENTATION", 15, currentY);
    currentY += 8;

    validTasks.forEach(task => {
      const cleanedTask = clean(task.task);
      const cleanedOutput = clean(task.output || "");
      
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Task Card Background
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(15, currentY, 180, 22, 3, 3, "F");
      doc.setDrawColor(245, 245, 245);
      doc.roundedRect(15, currentY, 180, 22, 3, 3, "D");

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(cleanedTask, 20, currentY + 8);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      
      if (isValid(cleanedOutput)) {
        const outputLines = doc.splitTextToSize(cleanedOutput, 160);
        doc.text(outputLines, 20, currentY + 13);
      }

      // Status Badge
      let badgeColor = [16, 185, 129]; // emerald
      let badgeBg = [235, 253, 245];
      
      if (task.status === "In Progress") {
        badgeColor = [37, 99, 235]; // blue
        badgeBg = [239, 246, 255];
      } else if (task.status === "Pending") {
        badgeColor = [217, 119, 6]; // amber
        badgeBg = [255, 251, 235];
      } else if (task.status === "Cancelled") {
        badgeColor = [100, 116, 139]; // slate
        badgeBg = [241, 245, 249];
      }

      doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      doc.roundedRect(165, currentY + 7, 25, 6, 3, 3, "F");
      doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(task.status.toUpperCase(), 177.5, currentY + 11, { align: "center" });

      currentY += 26;
    });
  }

  // --- Tomorrow's Plan ---
  const filteredPlan = report.tomorrow_plan.filter(i => i && i.toLowerCase() !== "none" && i.trim() !== "");
  if (filteredPlan.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("• TOMORROW'S PLAN", 15, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const planText = clean(filteredPlan.join(", "));
    const planLines = doc.splitTextToSize(planText, 180);
    doc.text(planLines, 15, currentY);
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Developed By Habib Nayeem | Powered By Digitalliyo`, 105, 285, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, 200, 285, { align: "right" });
  }

  const fileName = `Report_${report.date}_${report.employee.name.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};

export const copyEmailDraft = (report: ReportData) => {
  const clean = (text: string) => text.replace(/\(unclear\)/gi, "").trim();
  const isValid = (text: string) => {
    const t = text.toLowerCase().trim();
    return t && t !== "n/a" && t !== "not specified" && t !== "none" && t !== "undefined";
  };

  const draft = `
Subject: Daily Work Report — ${clean(report.employee.name)} — ${report.date}

Hello Team,

Please find my daily work report for ${format(new Date(report.date), "PPP")} below.

SUMMARY:
${report.summary_bullets.map(b => clean(b)).filter(isValid).map(b => `• ${b}`).join("\n")}

TASKS:
${report.tasks.map(t => {
    const task = clean(t.task);
    const time = clean(t.time_spent || "");
    if (!isValid(task)) return null;
    return `• [${t.status}] ${task}${isValid(time) ? ` (${time})` : ""}`;
  }).filter(Boolean).join("\n")}

CHALLENGES:
${report.challenges.map(c => clean(c)).filter(isValid).join(", ") || "None"}

Regards,
${clean(report.employee.name)}
${isValid(clean(report.employee.role || "")) ? clean(report.employee.role) : ""}
  `.trim();

  navigator.clipboard.writeText(draft);
};
