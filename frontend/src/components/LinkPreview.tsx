import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

export function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<{ title: string, description: string, image: string, url: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPreview = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
        const res = await fetch(`${apiUrl}/api/link-preview?url=${encodeURIComponent(url)}`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        } else {
          if (isMounted) setError(true);
        }
      } catch (e) {
        if (isMounted) setError(true);
      }
    };
    fetchPreview();
    return () => { isMounted = false; };
  }, [url]);

  if (error || !data || (!data.title && !data.description && !data.image)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="underline decoration-current/30 underline-offset-4 break-all">
        {url}
      </a>
    );
  }

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (e) {}

  return (
    <a href={url} target="_blank" rel="noreferrer" className="block my-1 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left max-w-sm no-underline bg-black/5 dark:bg-white/5">
      {data.image && (
        <div className="w-full h-32 bg-black/5 dark:bg-white/5">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-2.5">
        <h4 className="text-[13px] font-semibold text-current line-clamp-1 mb-0.5">{data.title || hostname}</h4>
        {data.description && (
          <p className="text-[11px] text-current/70 line-clamp-2 leading-snug">{data.description}</p>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-current/50">
          <ExternalLink size={10} />
          <span>{hostname}</span>
        </div>
      </div>
    </a>
  );
}
