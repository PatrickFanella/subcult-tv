import { useEffect, useState } from 'react';
import { getReviewDraftMedia } from '@/lib/api';

/** Load the private JPEG from the exact saved draft version. */
export function useSavedImage(draftID: string | undefined, version: number | undefined) {
  const identity = `${draftID}:${version}`;
  const [state, setState] = useState({ identity: '', url: '', error: false });
  useEffect(() => {
    if (!draftID || !version) return;
    const controller = new AbortController();
    let url = '';
    getReviewDraftMedia(draftID, version, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setState({ identity, url, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ identity, url: '', error: true });
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [draftID, version, identity]);
  return state.identity === identity ? state : { identity, url: '', error: false };
}
