"use client";

import { UploadCloud, Loader2, X, Check } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

export function CustomCloudinaryUpload({ onUploadSuccess, compact = false }: { onUploadSuccess: (url: string) => void, compact?: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Read the file as a data URL so we can show it in the cropper
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    
    // Reset input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      // Get the cropped blob from the canvas utility
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const formData = new FormData();
      formData.append('file', croppedBlob);
      // HARDCODE values as requested in Phase 42 to bypass Next.js env caching issues
      formData.append('upload_preset', 'pcg_preset');

      const response = await fetch(`https://api.cloudinary.com/v1_1/ammascfn/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        // Inject f_webp,q_auto to force WebP optimized delivery
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_webp,q_auto/');
        onUploadSuccess(optimizedUrl);
        setImageSrc(null); // Close modal
      } else {
        console.error("Upload failed:", data);
        alert("Upload failed. Please check your Cloudinary configuration.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-[#2a2d36] hover:border-[#00ff9d] bg-[#121415] rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 group ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${compact ? 'p-3 w-12 h-12' : 'p-8'}`}
        title="Upload new avatar"
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className={`text-[#00ff9d] animate-spin ${compact ? 'w-4 h-4' : 'w-8 h-8'}`} />
        ) : (
          <UploadCloud className={`text-gray-500 group-hover:text-[#00ff9d] transition-colors ${compact ? 'w-5 h-5' : 'w-8 h-8'}`} />
        )}
      </div>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121415]/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#181a1f] w-full max-w-xl h-[80vh] md:h-[600px] border border-[#2a2d36] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            
            <div className="p-4 border-b border-[#2a2d36] flex justify-between items-center bg-[#181a1f] z-10 relative">
              <h3 className="font-extrabold text-white text-lg tracking-tight">Crop Avatar</h3>
              <button 
                onClick={() => setImageSrc(null)}
                className="p-2 bg-black/20 hover:bg-[#ff5a5a]/10 text-gray-400 hover:text-red-400 rounded-xl transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black/50">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // 1:1 Aspect Ratio for Avatars
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                style={{
                  containerStyle: { background: 'transparent' },
                  cropAreaStyle: { border: '2px solid #00ff9d', boxShadow: '0 0 0 9999em rgba(0,0,0,0.8)' }
                }}
              />
            </div>

            <div className="p-6 border-t border-[#2a2d36] bg-[#181a1f] flex flex-col gap-6 z-10 relative">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#00ff9d]"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setImageSrc(null)}
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#23252b] text-gray-400 hover:text-white border border-[#2a2d36] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadConfirm}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Confirm & Upload</>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
