"use client";

import { useEffect, useState } from "react";
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

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 select-none touch-none"
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
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: scale, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain cursor-grab active:cursor-grabbing will-change-transform"
              onClick={(e) => e.stopPropagation()}
              drag
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
              dragElastic={0.1}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
