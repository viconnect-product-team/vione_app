const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

function parseInlineFormatting(text) {
  const runs = [];
  // Tokenize bold (**text**), inline code (`code`), italic (*text*)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.substring(lastIndex, match.index) }));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      runs.push(new TextRun({ text: token.slice(2, -2), bold: true }));
    } else if (token.startsWith('`') && token.endsWith('`')) {
      runs.push(
        new TextRun({
          text: token.slice(1, -1),
          font: 'Consolas',
          color: 'B45309',
        })
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      runs.push(new TextRun({ text: token.slice(1, -1), italics: true }));
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.substring(lastIndex) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text })];
}

function convertMarkdownToDocx(mdContent) {
  const lines = mdContent.split(/\r?\n/);
  const children = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];

  function flushTable() {
    if (tableRows.length === 0) return;

    // Filter separator lines like | :--- | :---: |
    const contentRows = tableRows.filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())));
    if (contentRows.length === 0) {
      tableRows = [];
      inTable = false;
      return;
    }

    const docxRows = contentRows.map((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      const cells = row.map((cellText) => {
        const runs = parseInlineFormatting(cellText.trim());
        return new TableCell({
          children: [
            new Paragraph({
              children: runs.map((r) => {
                if (isHeader) r.bold = true;
                return r;
              }),
              spacing: { before: 60, after: 60 },
            }),
          ],
          shading: isHeader
            ? { fill: 'F1F5F9', type: ShadingType.CLEAR }
            : { fill: 'FFFFFF', type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
        });
      });
      return new TableRow({
        children: cells,
        tableHeader: isHeader,
      });
    });

    children.push(
      new Table({
        rows: docxRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    // Spacing after table
    children.push(new Paragraph({ spacing: { after: 120 } }));

    tableRows = [];
    inTable = false;
  }

  function flushCodeBlock() {
    if (codeLines.length === 0) return;
    for (const codeLine of codeLines) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeLine,
              font: 'Consolas',
              size: 18, // 9pt
              color: '1E293B',
            }),
          ],
          shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
          spacing: { before: 20, after: 20 },
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 100 } }));
    codeLines = [];
    inCodeBlock = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks ```
    if (line.trim().startsWith('```')) {
      if (inTable) flushTable();
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Check tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      continue;
    }

    // Horizontal rule ---
    if (/^---$|^___$|^\*\*\*$/.test(trimmed)) {
      children.push(
        new Paragraph({
          border: {
            bottom: { color: 'CBD5E1', size: 6, style: BorderStyle.SINGLE, space: 1 },
          },
          spacing: { before: 120, after: 120 },
        })
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.TITLE,
          spacing: { before: 240, after: 120 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 160, after: 80 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(5),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 60 },
        })
      );
      continue;
    }

    // Blockquote >
    if (trimmed.startsWith('> ')) {
      children.push(
        new Paragraph({
          children: parseInlineFormatting(trimmed.slice(2)),
          indent: { left: 400 },
          border: {
            left: { color: '94A3B8', size: 12, style: BorderStyle.SINGLE, space: 4 },
          },
          spacing: { before: 60, after: 60 },
        })
      );
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*+]\s+/, '');
      children.push(
        new Paragraph({
          children: parseInlineFormatting(itemText),
          bullet: { level: 0 },
          spacing: { before: 30, after: 30 },
        })
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      children.push(
        new Paragraph({
          children: parseInlineFormatting(itemText),
          numbering: { reference: 'numbering-spec', level: 0 },
          spacing: { before: 30, after: 30 },
        })
      );
      continue;
    }

    // Standard paragraph
    children.push(
      new Paragraph({
        children: parseInlineFormatting(trimmed),
        spacing: { before: 60, after: 60 },
      })
    );
  }

  if (inTable) flushTable();
  if (inCodeBlock) flushCodeBlock();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return doc;
}

async function run() {
  const docDir = path.join(__dirname, '..', 'document');
  const files = fs.readdirSync(docDir).filter((f) => f.endsWith('.md'));

  console.log(`Found ${files.length} markdown files in ${docDir}`);

  for (const file of files) {
    const mdPath = path.join(docDir, file);
    const docxPath = path.join(docDir, file.replace(/\.md$/, '.docx'));

    console.log(`Converting ${file} -> ${path.basename(docxPath)}...`);
    const content = fs.readFileSync(mdPath, 'utf8');
    const doc = convertMarkdownToDocx(content);
    const buffer = await Packer.toBuffer(doc);
    const tempPath = docxPath + '.tmp';
    fs.writeFileSync(tempPath, buffer);
    try {
      if (fs.existsSync(docxPath)) {
        fs.unlinkSync(docxPath);
      }
      fs.renameSync(tempPath, docxPath);
      console.log(`✓ Generated ${docxPath} (${buffer.length} bytes)`);
    } catch (writeErr) {
      console.warn(`Could not overwrite ${docxPath} directly (${writeErr.message}), keeping updated version at ${tempPath}`);
    }
  }

  console.log('All documents converted to Word .docx successfully!');
}

run().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
