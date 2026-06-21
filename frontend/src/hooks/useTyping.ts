import { useState, useEffect, useCallback, useRef } from "react";

export function useTyping(onMessage: (handler: (msg: any) => void) => () => void, sendMessage: (msg: any) => void) {
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return onMessage((msg: any) => {
      if (msg?.type === 'typing') {
         setTypingUser(msg.userId);
         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
         typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    });
  }, [onMessage]);

  const handleTyping = useCallback(() => {
    sendMessage({ type: "typing", payload: {} });
  }, [sendMessage]);

  return { typingUser, handleTyping };
}
