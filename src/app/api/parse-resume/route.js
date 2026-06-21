import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const dataBuffer = Buffer.from(bytes);

    // Dynamic import to avoid build issues
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
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
