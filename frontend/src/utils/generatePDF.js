import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = (analysis) => {
  const doc = new jsPDF();

  // ===========================
  // Header
  // ===========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("AI Resume Analyzer Pro", 105, 18, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Professional Resume Analysis Report", 105, 27, {
    align: "center",
  });

  doc.setDrawColor(120);
  doc.line(15, 33, 195, 33);

  // ===========================
  // Scores
  // ===========================

  autoTable(doc, {
    startY: 40,
    head: [["Resume Scores", ""]],
    body: [
      ["ATS Score", `${analysis.ats_score}%`],
      ["Resume Match", `${analysis.match_score}%`],
      [
        "Generated On",
        new Date().toLocaleDateString(),
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [99, 102, 241],
    },
  });

  // ===========================
  // ATS Breakdown
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["ATS Breakdown", "Score"]],
    body: [
      ["Formatting", `${analysis.breakdown?.formatting ?? 0}%`],
      ["Keywords", `${analysis.breakdown?.keywords ?? 0}%`],
      ["Readability", `${analysis.breakdown?.readability ?? 0}%`],
      ["Sections", `${analysis.breakdown?.sections ?? 0}%`],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229],
    },
  });

  // ===========================
  // Matched Skills
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Matched Skills"]],
    body:
      analysis.strengths?.map((skill) => [skill]) || [["None"]],
    headStyles: {
      fillColor: [22, 163, 74],
    },
  });

  // ===========================
  // Missing Skills
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Missing Skills"]],
    body:
      analysis.missing_skills?.map((skill) => [skill]) || [["None"]],
    headStyles: {
      fillColor: [220, 38, 38],
    },
  });

  // ===========================
  // AI Suggestions
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["AI Suggestions"]],
    body:
      analysis.suggestions?.map((item) => [item]) || [["No Suggestions"]],
    headStyles: {
      fillColor: [147, 51, 234],
    },
  });

  // ===========================
  // Strengths
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Strengths"]],
    body:
      analysis.strengths?.map((item) => [item]) || [["None"]],
    headStyles: {
      fillColor: [16, 185, 129],
    },
  });

  // ===========================
  // Weaknesses
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Weaknesses"]],
    body:
      analysis.weaknesses?.map((item) => [item]) || [["None"]],
    headStyles: {
      fillColor: [245, 158, 11],
    },
  });

  // ===========================
  // Summary
  // ===========================

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Overall Assessment"]],
    body: [[analysis.summary || "No Summary"]],
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  // ===========================
  // Footer
  // ===========================

  doc.setFontSize(10);

  doc.text(
    "Generated using AI Resume Analyzer Pro",
    105,
    285,
    {
      align: "center",
    }
  );

  doc.save("AI_Resume_Report.pdf");
};