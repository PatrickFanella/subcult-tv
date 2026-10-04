import { useEffect, useState } from 'react';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { getReviewDraftMedia } from '@/lib/api';

export default function PostPreview({
  account,
  caption,
  image,
  draftID,
  version,
  hasMedia,
  onMediaReady,
}: {
  account: string;
  caption: string;
  image?: string;
  draftID?: string;
  version?: number;
  hasMedia?: boolean;
  onMediaReady?: (ready: boolean) => void;
}) {
  const [savedImage, setSavedImage] = useState({ url: '', identity: '' });
  const identity = `${draftID}:${version}:${image}`;
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let url = '';
    if (draftID && hasMedia && !image) {
      getReviewDraftMedia(draftID, version!, controller.signal)
        .then((blob) => {
          if (!controller.signal.aborted) {
            url = URL.createObjectURL(blob);
            setSavedImage({ url, identity });
          }
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setError('Image preview unavailable. Refresh before approving.');
        });
    }
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [draftID, version, hasMedia, image, identity]);
  const source = image || (savedImage.identity === identity ? savedImage.url : '');
  return (
    <div className="instagram-preview" aria-label={`Instagram preview for ${account}`}>
      <div className="instagram-preview-header">
        <span className="instagram-avatar" aria-hidden="true">
          {account.slice(0, 1).toUpperCase()}
        </span>
        <strong>{account}</strong>
        <MoreHorizontal size={20} aria-hidden="true" />
      </div>
      {source ? (
        <img
          className="instagram-preview-image"
          src={source}
          onLoad={() => onMediaReady?.(true)}
          onError={() => {
            onMediaReady?.(false);
            setError('Image preview unavailable. Refresh before approving.');
          }}
          alt="Selected image for this post"
        />
      ) : (
        <div className="instagram-preview-placeholder">
          <span>{error || (hasMedia ? 'Loading selected image…' : 'Image needed')}</span>
          {!hasMedia && <small>Use Edit to select the image.</small>}
        </div>
      )}
      <div className="instagram-preview-actions" aria-hidden="true">
        <Heart />
        <MessageCircle />
        <Send />
        <Bookmark />
      </div>
      <p className="instagram-preview-caption">
        <strong>{account}</strong> {caption}
      </p>
    </div>
  );
}
