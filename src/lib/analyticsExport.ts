import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type AnswerValue = string | number | string[] | undefined;

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

export interface ExportQuestion {
  id: string;
  title: string;
  type: string;
}

export interface ExportResponse {
  _id: string;
  _creationTime: number;
  answers: Record<string, string | number>;
}

export interface AnalyticsExportPayload {
  surveyTitle: string;
  surveyId: string;
  lastUpdated: string;
  stats: {
    totalResponses: number;
    completionRate: number;
    numberOfQuestions: number;
    lastResponseDate: string;
  };
  barCharts: Array<{
    questionTitle: string;
    questionType: string;
    totalAnswers: number;
    interpretation: string;
    data: Array<{ option: string; count: number; percentage: number }>;
  }>;
  pieCharts: Array<{
    questionTitle: string;
    totalAnswers: number;
    interpretation: string;
    data: Array<{ name: string; value: number }>;
  }>;
  lineCharts: Array<{
    chartTitle: string;
    interpretation: string;
    data: Array<{ date: string; responses: number; completionRate: number }>;
  }>;
  responseTable: Array<{
    responseId: string;
    submittedAt: string;
    status: string;
  }>;
}

const COLORS = {
  navy: "0B192C",
  teal: "0D9488",
  tealLight: "F0FDFA",
  gray100: "F3F4F6",
  gray500: "6B7280",
  gray700: "374151",
  white: "FFFFFF",
};

const PDF_RGB = {
  navy: [11, 25, 44] as [number, number, number],
  teal: [13, 148, 136] as [number, number, number],
  tealLight: [240, 253, 250] as [number, number, number],
  gray100: [243, 244, 246] as [number, number, number],
  gray500: [107, 114, 128] as [number, number, number],
  gray700: [55, 65, 81] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const PDF_MARGIN = 18;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-") || "survey";
}

// ---------------------------------------------------------------------------
// Canvas-based chart image rendering helpers
// ---------------------------------------------------------------------------

const CHART_PALETTE = [
  "#0D9488", "#0B192C", "#3B82F6", "#F59E0B",
  "#8B5CF6", "#10B981", "#6366F1", "#F43F5E",
];

function base64ToUint8Array(base64: string): Uint8Array {
  // Strip data-URL prefix if present
  const raw = base64.includes(",") ? base64.split(",")[1] : base64;
  const binaryStr = atob(raw);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return bytes;
}

function drawBarChartPng(
  data: Array<{ option: string; count: number; percentage: number }>,
  width = 320,
  height = 180,
): Uint8Array {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const padL = 40, padR = 10, padT = 16, padB = 48;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barCount = data.length;
  const groupW = chartW / barCount;
  const barW = Math.max(groupW * 0.55, 4);

  // Y-axis gridlines
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = padT + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 0.5;
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    const val = Math.round((i / gridLines) * maxCount);
    ctx.fillStyle = "#6B7280";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(val), padL - 3, y + 3);
  }

  // Bars
  data.forEach((d, i) => {
    const x = padL + i * groupW + (groupW - barW) / 2;
    const barH = maxCount > 0 ? (d.count / maxCount) * chartH : 0;
    const y = padT + chartH - barH;
    ctx.fillStyle = CHART_PALETTE[i % CHART_PALETTE.length];
    ctx.fillRect(x, y, barW, barH);

    // Percentage label on top
    ctx.fillStyle = "#374151";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center";
    if (d.percentage > 0) ctx.fillText(`${d.percentage}%`, x + barW / 2, y - 3);

    // X-axis label (truncated)
    const label = d.option.length > 8 ? d.option.slice(0, 7) + "…" : d.option;
    ctx.fillStyle = "#6B7280";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x + barW / 2, padT + chartH + 12);
  });

  // Axes
  ctx.beginPath();
  ctx.strokeStyle = "#9CA3AF";
  ctx.lineWidth = 1;
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  return base64ToUint8Array(canvas.toDataURL("image/png"));
}

function drawPieChartPng(
  data: Array<{ name: string; value: number }>,
  width = 200,
  height = 180,
): Uint8Array {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const total = data.reduce((s, d) => s + d.value, 0);
  const legendH = data.length * 14 + 4;
  const pieH = height - legendH;
  const cx = width / 2;
  const cy = pieH / 2;
  const radius = Math.min(width * 0.38, pieH * 0.44);

  if (total === 0) {
    ctx.fillStyle = "#E5E7EB";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    let startAngle = -Math.PI / 2;
    data.forEach((d, i) => {
      const slice = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = CHART_PALETTE[i % CHART_PALETTE.length];
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      startAngle += slice;
    });
  }

  // Legend
  data.forEach((d, i) => {
    const lx = 8;
    const ly = pieH + 6 + i * 14;
    ctx.fillStyle = CHART_PALETTE[i % CHART_PALETTE.length];
    ctx.fillRect(lx, ly, 10, 9);
    ctx.fillStyle = "#374151";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "left";
    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
    const label = `${d.name.length > 14 ? d.name.slice(0, 13) + "…" : d.name} (${pct}%)`;
    ctx.fillText(label, lx + 13, ly + 8);
  });

  return base64ToUint8Array(canvas.toDataURL("image/png"));
}

function downloadBlob(filename: string, content: Blob) {
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextBlob(filename: string, content: string, mimeType: string) {
  downloadBlob(filename, new Blob([content], { type: mimeType }));
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAnswer(value: AnswerValue): string {
  if (value === undefined || value === "") return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 0 : 320, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? COLORS.navy : COLORS.gray700,
        size: level === HeadingLevel.HEADING_1 ? 36 : level === HeadingLevel.HEADING_2 ? 28 : 24,
      }),
    ],
  });
}

function bodyText(text: string, options?: { italic?: boolean; color?: string; spacingAfter?: number }) {
  return new Paragraph({
    spacing: { after: options?.spacingAfter ?? 120 },
    children: [
      new TextRun({
        text,
        italics: options?.italic,
        color: options?.color ?? COLORS.gray700,
        size: 22,
      }),
    ],
  });
}

function insightCallout(text: string) {
  return new Paragraph({
    spacing: { before: 120, after: 240 },
    indent: { left: 240 },
    border: {
      left: { color: COLORS.teal, size: 12, style: BorderStyle.SINGLE },
    },
    shading: { fill: COLORS.tealLight, type: ShadingType.CLEAR },
    children: [
      new TextRun({ text: "Insight: ", bold: true, color: COLORS.teal, size: 20 }),
      new TextRun({ text, color: COLORS.gray700, size: 20, italics: true }),
    ],
  });
}

function headerCell(text: string) {
  return new TableCell({
    shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: true, color: COLORS.white, size: 20 }),
        ],
      }),
    ],
  });
}

function dataCell(text: string, shaded = false) {
  return new TableCell({
    shading: shaded ? { fill: COLORS.gray100, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, color: COLORS.gray700, size: 20 })],
      }),
    ],
  });
}

function buildStyledTable(headers: string[], rows: string[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((header) => headerCell(header)) }),
      ...rows.map(
        (row, rowIndex) =>
          new TableRow({
            children: row.map((cell) => dataCell(cell, rowIndex % 2 === 1)),
          }),
      ),
    ],
  });
}

function buildSummaryStatsTable(payload: AnalyticsExportPayload) {
  const stats = [
    ["Total Responses", String(payload.stats.totalResponses)],
    ["Answer Rate", `${payload.stats.completionRate}%`],
    ["Questions", String(payload.stats.numberOfQuestions)],
    ["Last Response", payload.stats.lastResponseDate],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: stats.map(
      ([label, value], index) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: {
                fill: index % 2 === 0 ? COLORS.gray100 : COLORS.white,
                type: ShadingType.CLEAR,
              },
              margins: { top: 100, bottom: 100, left: 160, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      color: COLORS.gray500,
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              shading: {
                fill: index % 2 === 0 ? COLORS.gray100 : COLORS.white,
                type: ShadingType.CLEAR,
              },
              margins: { top: 100, bottom: 100, left: 120, right: 160 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: value,
                      bold: true,
                      color: COLORS.navy,
                      size: 24,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function buildAnalyticsDocument(payload: AnalyticsExportPayload): Document {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "ANALYTICS REPORT",
          bold: true,
          color: COLORS.teal,
          size: 22,
          allCaps: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: payload.surveyTitle,
          bold: true,
          color: COLORS.navy,
          size: 40,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: `Generated ${payload.lastUpdated}`,
          color: COLORS.gray500,
          size: 20,
        }),
      ],
    }),
    // ── Executive Summary ───────────────────────────────────────────────────
    heading("Executive Summary", HeadingLevel.HEADING_2),
    bodyText(
      "Overview of survey performance, response volume, and answer completeness across all collected submissions.",
      { color: COLORS.gray500, spacingAfter: 200 },
    ),
    buildSummaryStatsTable(payload),
    new Paragraph({ spacing: { after: 240 }, children: [] }),
    bodyText(`Survey ID: ${payload.surveyId}`, {
      color: COLORS.gray500,
      spacingAfter: 320,
    }),
  ];

  // ── Combined Question Analysis (Bar + Pie per question) ────────────────────
  // Match bar charts and pie charts by index — they are generated for the same
  // set of questions in the same order.
  const questionCount = Math.max(payload.barCharts.length, payload.pieCharts.length);

  if (questionCount > 0) {
    children.push(heading("Question Analysis", HeadingLevel.HEADING_2));
    children.push(
      bodyText(
        "For each survey question the response distribution table is shown, followed by a bar chart and pie chart visualisation.",
        { color: COLORS.gray500, spacingAfter: 240 },
      ),
    );

    for (let qi = 0; qi < questionCount; qi++) {
      const bar = payload.barCharts[qi];
      const pie = payload.pieCharts[qi];
      const questionTitle = bar?.questionTitle ?? pie?.questionTitle ?? `Question ${qi + 1}`;
      const totalAnswers = bar?.totalAnswers ?? pie?.totalAnswers ?? 0;
      const interpretation = bar?.interpretation ?? pie?.interpretation ?? "";

      // Question heading
      children.push(heading(questionTitle, HeadingLevel.HEADING_3));
      if (bar) {
        children.push(
          bodyText(`${bar.questionType} · ${totalAnswers} total answers`, {
            color: COLORS.gray500,
            spacingAfter: 160,
          }),
        );
      }

      // Unified data table: Option | Count | Percentage
      if (bar && bar.data.length > 0) {
        children.push(
          buildStyledTable(
            ["Option", "Count", "Percentage"],
            bar.data.map((row) => [row.option, String(row.count), `${row.percentage}%`]),
          ),
        );
      } else if (pie && pie.data.length > 0) {
        children.push(
          buildStyledTable(
            ["Answer", "Count"],
            pie.data.map((row) => [row.name, String(row.value)]),
          ),
        );
      }

      new Paragraph({ spacing: { after: 120 }, children: [] });

      // Render chart images
      try {
        const barData = bar?.data ?? pie?.data.map((d) => ({ option: d.name, count: d.value, percentage: 0 })) ?? [];
        const pieData = pie?.data ?? bar?.data.map((d) => ({ name: d.option, value: d.count })) ?? [];

        const barPng = drawBarChartPng(barData);
        const piePng = drawPieChartPng(pieData);

        // Place images side-by-side in a 2-column table
        const imgTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 60, type: WidthType.PERCENTAGE },
                  margins: { top: 80, bottom: 80, left: 0, right: 80 },
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({ text: "Bar Chart", bold: true, color: COLORS.gray500, size: 16 }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new ImageRun({
                          type: "png",
                          data: barPng,
                          transformation: { width: 240, height: 135 },
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  margins: { top: 80, bottom: 80, left: 80, right: 0 },
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({ text: "Pie Chart", bold: true, color: COLORS.gray500, size: 16 }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new ImageRun({
                          type: "png",
                          data: piePng,
                          transformation: { width: 150, height: 135 },
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });

        children.push(imgTable);
      } catch {
        // Canvas rendering may be unavailable in some environments; skip images gracefully
      }

      children.push(insightCallout(interpretation));
    }
  }

  // ── Recent Submissions ──────────────────────────────────────────────────────
  if (payload.responseTable.length > 0) {
    children.push(heading("Recent Submissions", HeadingLevel.HEADING_2));
    children.push(
      bodyText("Latest respondent submissions recorded for this survey.", {
        color: COLORS.gray500,
        spacingAfter: 240,
      }),
    );
    children.push(
      buildStyledTable(
        ["Response ID", "Submitted At", "Status"],
        payload.responseTable.map((row) => [
          row.responseId,
          row.submittedAt,
          row.status,
        ]),
      ),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 480 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "— End of Report —",
          color: COLORS.gray500,
          size: 18,
          italics: true,
        }),
      ],
    }),
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });
}

function getPdfPageHeight(doc: PdfDoc) {
  return doc.internal.pageSize.getHeight();
}

function getPdfPageWidth(doc: PdfDoc) {
  return doc.internal.pageSize.getWidth();
}

function getPdfContentWidth(doc: PdfDoc) {
  return getPdfPageWidth(doc) - PDF_MARGIN * 2;
}

function ensurePdfSpace(doc: PdfDoc, y: number, needed: number) {
  if (y + needed > getPdfPageHeight(doc) - PDF_MARGIN) {
    doc.addPage();
    return PDF_MARGIN;
  }
  return y;
}

function getTableFinalY(doc: PdfDoc, fallbackY: number) {
  return doc.lastAutoTable?.finalY ?? fallbackY;
}

function pdfTableStyles() {
  return {
    headStyles: {
      fillColor: PDF_RGB.navy,
      textColor: PDF_RGB.white,
      fontStyle: "bold" as const,
    },
    alternateRowStyles: { fillColor: PDF_RGB.gray100 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: PDF_RGB.gray700,
    },
    margin: { left: PDF_MARGIN, right: PDF_MARGIN },
  };
}

function addPdfSectionHeading(doc: PdfDoc, y: number, title: string) {
  y = ensurePdfSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...PDF_RGB.gray700);
  doc.text(title, PDF_MARGIN, y);
  return y + 7;
}

function addPdfSubheading(doc: PdfDoc, y: number, title: string) {
  y = ensurePdfSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_RGB.navy);
  const lines = doc.splitTextToSize(title, getPdfContentWidth(doc));
  doc.text(lines, PDF_MARGIN, y);
  return y + lines.length * 5 + 2;
}

function addPdfBodyText(doc: PdfDoc, y: number, text: string) {
  y = ensurePdfSpace(doc, y, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.gray500);
  const lines = doc.splitTextToSize(text, getPdfContentWidth(doc));
  doc.text(lines, PDF_MARGIN, y);
  return y + lines.length * 4.5 + 3;
}

function addPdfInsight(doc: PdfDoc, y: number, text: string) {
  const contentWidth = getPdfContentWidth(doc);
  const lines = doc.splitTextToSize(`Insight: ${text}`, contentWidth - 8);
  const boxHeight = lines.length * 4.5 + 6;
  y = ensurePdfSpace(doc, y, boxHeight + 4);

  doc.setFillColor(...PDF_RGB.tealLight);
  doc.rect(PDF_MARGIN, y - 3, contentWidth, boxHeight, "F");
  doc.setDrawColor(...PDF_RGB.teal);
  doc.setLineWidth(1.2);
  doc.line(PDF_MARGIN, y - 3, PDF_MARGIN, y - 3 + boxHeight);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.gray700);
  doc.text(lines, PDF_MARGIN + 4, y + 1);
  return y + boxHeight + 5;
}

function addPdfDataTable(
  doc: PdfDoc,
  y: number,
  head: string[],
  body: string[][],
) {
  y = ensurePdfSpace(doc, y, 20);
  autoTable(doc, {
    startY: y,
    head: [head],
    body,
    ...pdfTableStyles(),
  });
  return getTableFinalY(doc, y) + 6;
}

function buildAnalyticsPdf(payload: AnalyticsExportPayload): PdfDoc {
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as PdfDoc;
  const pageWidth = getPdfPageWidth(doc);
  const contentWidth = getPdfContentWidth(doc);
  let y = PDF_MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_RGB.teal);
  doc.text("ANALYTICS REPORT", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(18);
  doc.setTextColor(...PDF_RGB.navy);
  const titleLines = doc.splitTextToSize(payload.surveyTitle, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 7 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_RGB.gray500);
  doc.text(`Generated ${payload.lastUpdated}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 12;

  y = addPdfSectionHeading(doc, y, "Executive Summary");
  y = addPdfBodyText(
    doc,
    y,
    "Overview of survey performance, response volume, and answer completeness across all collected submissions.",
  );
  y = addPdfDataTable(doc, y, ["Metric", "Value"], [
    ["Total Responses", String(payload.stats.totalResponses)],
    ["Answer Rate", `${payload.stats.completionRate}%`],
    ["Questions", String(payload.stats.numberOfQuestions)],
    ["Last Response", payload.stats.lastResponseDate],
  ]);
  y = addPdfBodyText(doc, y, `Survey ID: ${payload.surveyId}`);

  // ── Combined Question Analysis (Bar + Pie per question) ────────────────────
  const questionCount = Math.max(payload.barCharts.length, payload.pieCharts.length);
  if (questionCount > 0) {
    y = addPdfSectionHeading(doc, y, "Question Analysis");
    y = addPdfBodyText(
      doc,
      y,
      "Response distribution for each survey question, with bar and pie chart visualisations.",
    );

    for (let qi = 0; qi < questionCount; qi++) {
      const bar = payload.barCharts[qi];
      const pie = payload.pieCharts[qi];
      const questionTitle = bar?.questionTitle ?? pie?.questionTitle ?? `Question ${qi + 1}`;
      const interpretation = bar?.interpretation ?? pie?.interpretation ?? "";

      y = addPdfSubheading(doc, y, questionTitle);
      if (bar) {
        y = addPdfBodyText(doc, y, `${bar.questionType} · ${bar.totalAnswers} total answers`);
        y = addPdfDataTable(
          doc,
          y,
          ["Option", "Count", "Percentage"],
          bar.data.map((row) => [row.option, String(row.count), `${row.percentage}%`]),
        );
      } else if (pie) {
        y = addPdfBodyText(doc, y, `${pie.totalAnswers} total answers`);
        y = addPdfDataTable(
          doc,
          y,
          ["Answer", "Count"],
          pie.data.map((row) => [row.name, String(row.value)]),
        );
      }

      // Embed bar chart image
      try {
        const barData = bar?.data ?? pie?.data.map((d) => ({ option: d.name, count: d.value, percentage: 0 })) ?? [];
        const pieData = pie?.data ?? bar?.data.map((d) => ({ name: d.option, value: d.count })) ?? [];

        const barPng = drawBarChartPng(barData, 320, 160);
        const piePng = drawPieChartPng(pieData, 200, 160);

        const contentWidth = getPdfContentWidth(doc);
        const imgBarW = contentWidth * 0.58;
        const imgPieW = contentWidth * 0.38;
        const imgH = 45; // mm

        y = ensurePdfSpace(doc, y, imgH + 8);
        // Bar chart on the left
        doc.addImage(barPng, "PNG", PDF_MARGIN, y, imgBarW, imgH);
        // Pie chart on the right
        doc.addImage(piePng, "PNG", PDF_MARGIN + imgBarW + 4, y, imgPieW, imgH);
        y += imgH + 5;
      } catch {
        // Canvas or addImage unavailable; skip images
      }

      y = addPdfInsight(doc, y, interpretation);
    }
  }

  if (payload.responseTable.length > 0) {
    y = addPdfSectionHeading(doc, y, "Recent Submissions");
    y = addPdfBodyText(
      doc,
      y,
      "Latest respondent submissions recorded for this survey.",
    );
    y = addPdfDataTable(
      doc,
      y,
      ["Response ID", "Submitted At", "Status"],
      payload.responseTable.map((row) => [
        row.responseId,
        row.submittedAt,
        row.status,
      ]),
    );
  }

  y = ensurePdfSpace(doc, y, 12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...PDF_RGB.gray500);
  doc.text("— End of Report —", pageWidth / 2, y, { align: "center" });

  return doc;
}

export function exportResponsesCsv(
  surveyTitle: string,
  questions: ExportQuestion[],
  responses: ExportResponse[],
) {
  const answerableQuestions = questions.filter((q) => q.type !== "page_break");
  const headers = [
    "Response ID",
    "Submitted At",
    ...answerableQuestions.map((q) => q.title),
  ];

  const rows = responses.map((resp) => {
    const submittedAt = new Date(resp._creationTime).toLocaleString();
    const answerCells = answerableQuestions.map((q) =>
      escapeCsvCell(formatAnswer(resp.answers[q.id] as AnswerValue)),
    );
    return [
      escapeCsvCell(`RESP-${resp._id.slice(-5).toUpperCase()}`),
      escapeCsvCell(submittedAt),
      ...answerCells,
    ].join(",");
  });

  const csv = [headers.map(escapeCsvCell).join(","), ...rows].join("\n");
  const filename = `${sanitizeFilename(surveyTitle)}-responses.csv`;
  downloadTextBlob(filename, csv, "text/csv;charset=utf-8;");
}

export async function downloadAnalyticsReport(payload: AnalyticsExportPayload) {
  const document = buildAnalyticsDocument(payload);
  const blob = await Packer.toBlob(document);
  const filename = `${sanitizeFilename(payload.surveyTitle)}-analytics-report.docx`;
  downloadBlob(filename, blob);
}

export function exportAnalyticsPdf(payload: AnalyticsExportPayload) {
  const doc = buildAnalyticsPdf(payload);
  const filename = `${sanitizeFilename(payload.surveyTitle)}-analytics-report.pdf`;
  doc.save(filename);
}
