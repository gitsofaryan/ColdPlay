import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique name
    const ext = path.extname(file.name);
    const basename = path.basename(file.name, ext);
    const filename = `${basename}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save to disk
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename: filename,
      originalName: file.name,
      path: filePath
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 });
  }
}
