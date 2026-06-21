import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

export async function POST(request) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Dynamic import to avoid build issues
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return NextResponse.json({
      success: true,
      text: data.text,
      pages: data.numpages,
      info: data.info
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to parse PDF: ' + error.message
    }, { status: 500 });
  }
}
