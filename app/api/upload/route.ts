import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error('Cloudinary config missing in env');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // We can forward the formData directly to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const data = await response.json();

    if (data.secure_url) {
      // Inject f_webp,q_auto to force WebP optimized delivery
      const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_webp,q_auto/');
      return NextResponse.json({ success: true, secure_url: optimizedUrl });
    } else {
      console.error("Cloudinary upload failed:", data);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
