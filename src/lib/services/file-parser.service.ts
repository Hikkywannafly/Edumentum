export class FileParserService {
  async parseFile(file: File): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return this.parsePDF(file);
      case "docx":
      case "doc":
        return this.parseWord(file);
      case "xlsx":
      case "xls":
        return this.parseExcel(file);
      case "pptx":
      case "ppt":
        return this.parsePowerPoint(file);
      case "json":
        return this.parseJSON(file);
      case "md":
        return this.parseMarkdown(file);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private async parsePDF(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let content = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      content += `${textContent.items.map((item: any) => item.str).join(" ")}\n`;
    }

    return content;
  }

  private async parseWord(file: File): Promise<string> {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async parseExcel(file: File): Promise<string> {
    const XLSX = await import("xlsx");
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    let content = "";
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      content += `Sheet: ${sheetName}\n`;
      for (const row of jsonData) {
        content += `${(row as any[]).join("\t")}\n`;
      }
      content += "\n";
    }

    return content;
  }

  private async parsePowerPoint(_file: File): Promise<string> {
    return "PowerPoint content extraction requires additional processing";
  }

  private async parseJSON(file: File): Promise<string> {
    const text = await file.text();
    const json = JSON.parse(text);

    if (json.quiz && json.quiz.questions) {
      let content = `Quiz: ${json.quiz.title}\n`;
      content += `Description: ${json.quiz.description}\n\n`;

      json.quiz.questions.forEach((q: any, index: number) => {
        content += `${index + 1}. ${q.question}\n`;
        q.answers.forEach((a: any, aIndex: number) => {
          const letter = String.fromCharCode(65 + aIndex);
          const marker = a.isCorrect ? " *" : "";
          content += `   ${letter}. ${a.text}${marker}\n`;
        });
        content += "\n";
      });

      return content;
    }

    return JSON.stringify(json, null, 2);
  }

  private async parseMarkdown(file: File): Promise<string> {
    return await file.text();
  }
}
