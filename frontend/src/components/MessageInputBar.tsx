import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputBarProps {
  replyingTo: any | null;
  onCancelReply: () => void;
  onSend: (text: string) => void;
  onTyping: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadFiles: (files: File[]) => void;
  onFocus?: () => void;
}



export const MessageInputBar = React.memo(({
  replyingTo,
  onCancelReply,
  onSend,
  onTyping,
  onFileUpload,
  onUploadFiles,
  onFocus,
}: MessageInputBarProps) => {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const myTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        onUploadFiles([file]);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };


  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.focus();
    }
  }, [text, onSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize without blocking main thread
    if (textareaRef.current) {
      const el = textareaRef.current;
      requestAnimationFrame(() => {
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
      });
    }

    if (!myTypingTimeoutRef.current) {
      onTyping();
      myTypingTimeoutRef.current = setTimeout(() => {
        myTypingTimeoutRef.current = null;
      }, 1500);
    }
  }, [onTyping]);

  return (
    <div className="flex-shrink-0 w-full px-3 sm:px-4 pb-2 sm:pb-3 safe-bottom pt-2 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent z-40 pointer-events-none">
      <div className="max-w-3xl mx-auto relative flex flex-col justify-end pointer-events-auto">
        {replyingTo && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-2 mx-2 p-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg flex items-center justify-between backdrop-blur-md relative z-0"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-1 h-8 bg-[var(--color-accent)] rounded-full flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[var(--color-accent)] dark:text-[var(--color-accent-light)] font-semibold text-xs uppercase mb-0.5">Reply to {replyingTo.authorId}</span>
                <span className="text-[var(--color-text-secondary)] truncate text-[13px]">{replyingTo.content || "Media"}</span>
              </div>
            </div>
            <button 
              aria-label="Cancel reply"
              className="w-8 h-8 flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-accent-muted)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex-shrink-0"
              onClick={onCancelReply}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}



        <div 
          className={cn(
            "flex items-end w-full min-h-[52px] px-2 py-1.5 rounded-[26px] border shadow-[var(--shadow-lg)] bg-[var(--color-surface-raised)] backdrop-blur-2xl relative z-10 transition-all duration-300",
            isFocused ? "border-[var(--color-accent)] ring-[3px] ring-[var(--color-accent)]/20 shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.15)]" : "border-[var(--color-border-strong)]"
          )}
        >
          <button 
            aria-label="Attach file"
            className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors active:scale-[0.94] flex-shrink-0 mb-0.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
          </button>

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={onFileUpload} 
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
          />
          
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-4 py-2.5 min-w-0 max-h-[120px]">
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <Mic size={16} />
                <span className="text-sm font-semibold">{Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}</span>
              </div>
              <button 
                onClick={stopRecording}
                className="p-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              name="chatMessage"
              id="chat-input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              rows={1}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus-visible:outline-none px-2 text-[var(--color-text)] text-base placeholder:text-[var(--color-text-muted)] py-2.5 min-w-0 resize-none max-h-[120px] will-change-[height]"
              style={{ boxShadow: 'none' }}
              placeholder="Message..."
              value={text}
              onChange={handleInput}
              onFocus={() => {
                setIsFocused(true);
                onFocus?.();
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          )}

          {!text.trim() && !isRecording && (
            <button 
              aria-label="Voice Message"
              className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-red-500 transition-colors active:scale-[0.94] flex-shrink-0 mb-0.5"
              onClick={startRecording}
            >
              <Mic size={20} />
            </button>
          )}

          {(!isRecording && text.trim()) && (
            <button 
              onClick={handleSend}
              onMouseDown={(e) => e.preventDefault()}
              aria-label="Send message"
              className={cn(
                "w-9 h-9 ml-1 mb-1 rounded-full flex items-center justify-center transition-all flex-shrink-0 group relative overflow-hidden",
                text.trim() ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)] active:scale-90" : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] active:scale-[0.94]"
              )}
            >
              {text.trim() && (
                <motion.div 
                  layoutId="send-glow"
                  className="absolute inset-0 bg-white/20 blur-md rounded-full"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Send size={16} className={cn("relative z-10", text.trim() && "ml-0.5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform duration-200")} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
});
