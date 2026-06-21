import { useState, useEffect } from "react";

const formatLastSeen = (isoStr: string) => {
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `today at ${time}`;
  return `${d.toLocaleDateString()} at ${time}`;
};

export function usePresence(onMessage: (handler: (msg: any) => void) => () => void, userId: string | null, wsStatus: string) {
  const [otherStatus, setOtherStatus] = useState<"online" | "offline">("offline");
  const [otherLastSeen, setOtherLastSeen] = useState<string | null>(null);

  useEffect(() => {
    return onMessage((msg: any) => {
      if (msg?.type === 'presence') {
         if (msg.userId !== userId) {
           setOtherStatus(msg.status);
           if (msg.lastSeen) setOtherLastSeen(msg.lastSeen);
         }
      }
    });
  }, [onMessage, userId]);

  const displayStatus = wsStatus !== "connected" 
    ? wsStatus 
    : otherStatus === "online" 
      ? "online" 
      : otherLastSeen 
        ? `Was here at ${formatLastSeen(otherLastSeen)}`
        : "offline";

  return { otherStatus, displayStatus };
}
