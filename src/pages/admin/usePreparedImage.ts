import { useEffect, useState } from 'react';
import { getPreparedMedia } from '@/lib/api';

interface PreparedImageState {
  sha: string;
  url: string;
  blob: Blob | null;
  error: boolean;
}
const EMPTY: PreparedImageState = { sha: '', url: '', blob: null, error: false };

/** Loads one private prepared JPEG into an object URL for previews and thumbnails. */
export function usePreparedImage(sha256: string | undefined) {
  const [state, setState] = useState<PreparedImageState>(EMPTY);
  useEffect(() => {
    if (!sha256) return;
    let url = '';
    let active = true;
    getPreparedMedia(sha256)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setState({ sha: sha256, url, blob, error: false });
      })
      .catch(() => {
        if (active) setState({ sha: sha256, url: '', blob: null, error: true });
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [sha256]);
  return state.sha === sha256 ? state : EMPTY;
}
