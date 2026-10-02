import { useEffect, useState, useRef } from 'react';
import { getStudioAsset } from '@/lib/api';

function AssetContent({ id, alt, video = false }: { id: string; alt: string; video?: boolean }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let objectURL = '';
    getStudioAsset(id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectURL = URL.createObjectURL(blob);
        setUrl(objectURL);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => {
      controller.abort();
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [id]);
  if (error) return <p role="status">Preview unavailable.</p>;
  if (!url) return <p role="status">Loading preview…</p>;
  return video ? (
    <video src={url} controls preload="metadata" aria-label={alt} />
  ) : (
    <img src={url} alt={alt} loading="lazy" />
  );
}

export function AssetDownload({ id, name }: { id: string; name: string }) {
  const [status, setStatus] = useState('');
  const download = async () => {
    setStatus('Preparing download…');
    try {
      const blob = await getStudioAsset(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name.split('/').pop() || 'asset';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('');
    } catch {
      setStatus('Download failed. Try again.');
    }
  };
  return (
    <>
      <button
        onClick={download}
        disabled={status === 'Preparing download…'}
        aria-label={`Download ${name}`}
      >
        Download
      </button>
      {status && <span role="status">{status}</span>}
    </>
  );
}

export function StudioAsset(props: { id: string; alt: string; video?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (visible || !host.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [visible]);
  return (
    <div ref={host} className="studio-lazy-asset">
      {visible ? <AssetContent key={props.id} {...props} /> : <span>Preview</span>}
    </div>
  );
}
