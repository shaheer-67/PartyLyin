"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import { Check, X } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropDone: (croppedBase64: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropDone, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropDone(croppedImage);
    } catch (e) {
      console.error(e);
      alert("Failed to crop image.");
    }
  }, [imageSrc, croppedAreaPixels, onCropDone]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // 1:1 ratio for profile pictures
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="p-5 pb-8 bg-[#0d0a1a] flex flex-col gap-4 border-t border-white/10">
        <div>
          <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full mt-2 accent-purple-500"
          />
        </div>
        <div className="flex justify-between gap-4 mt-2">
          <button onClick={onCancel} className="flex-1 glass py-3 rounded-full font-bold flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={showCroppedImage} className="flex-1 grad text-white cta py-3 rounded-full font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
