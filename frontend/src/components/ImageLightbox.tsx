"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = "Image", isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const initialDistance = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setScale(1);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.5, 0.5));
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = src;
    a.download = src.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialDistance.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current !== null) {
      e.stopPropagation();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist - initialDistance.current;
      
      if (Math.abs(delta) > 5) {
        setScale((s) => {
          const newScale = s + delta * 0.005;
          return Math.min(Math.max(newScale, 0.5), 4);
        });
        initialDistance.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    initialDistance.current = null;
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale((s) => (s > 1 ? 1 : 2));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none touch-none"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-3 z-50">
            <button onClick={handleZoomIn} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Zoom In">
              <ZoomIn size={20} />
            </button>
            <button onClick={handleZoomOut} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Zoom Out">
              <ZoomOut size={20} />
            </button>
            <button onClick={handleDownload} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Download">
              <Download size={20} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2" title="Close">
              <X size={20} />
            </button>
          </div>

          {/* Image */}
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              ref={imgRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: scale, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain cursor-grab active:cursor-grabbing will-change-transform"
              onClick={handleTap}
              onTouchEnd={handleTap}
              drag={scale > 1}
              dragConstraints={scale > 1 ? { top: -200, left: -200, right: 200, bottom: 200 } : { top: 0, left: 0, right: 0, bottom: 0 }}
              dragElastic={0.1}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
