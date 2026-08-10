"use client";

import { UploadCloud, Loader2, X, Check } from "lucide-react";
import { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import Image from "next/image";

export function RoomLogoCropper({ 
  currentLogoUrl,
  onUploadSuccess 
}: { 
  currentLogoUrl?: string,
  onUploadSuccess: (base64: string) => void 
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUploadSuccess(base64String);
        setImageSrc(null);
        setIsProcessing(false);
      };
      reader.readAsDataURL(croppedBlob);
    } catch (error) {
      console.error("Crop error:", error);
      alert("Error cropping image. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-[#23252b] border border-[#2a2d36] shrink-0 shadow-lg">
          {currentLogoUrl ? (
            <Image src={currentLogoUrl} alt="Room Logo" fill className="object-contain p-2" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <UploadCloud className="w-8 h-8 mb-1 opacity-50" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Logo</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <p className="text-xs text-gray-400">Recommended size: 256x256px. The image will be cropped to a 1:1 square ratio.</p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="self-start px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <UploadCloud size={14} /> Upload New Logo
          </button>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Crop Modal */}
      {imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121415]/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#181a1f] w-full max-w-xl h-[80vh] md:h-[600px] border border-[#2a2d36] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            
            <div className="p-4 border-b border-[#2a2d36] flex justify-between items-center bg-[#181a1f] z-10 relative">
              <h3 className="font-extrabold text-white text-lg tracking-tight">Crop Logo</h3>
              <button 
                onClick={() => setImageSrc(null)}
                className="p-2 bg-black/20 hover:bg-[#ff5a5a]/10 text-gray-400 hover:text-red-400 rounded-xl transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-black/50">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                style={{
                  containerStyle: { background: 'transparent' },
                  cropAreaStyle: { border: '2px dashed #6366f1', boxShadow: '0 0 0 9999em rgba(0,0,0,0.8)' }
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
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setImageSrc(null)}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#23252b] text-gray-400 hover:text-white border border-[#2a2d36] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Check className="w-4 h-4" /> Apply & Save</>
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
