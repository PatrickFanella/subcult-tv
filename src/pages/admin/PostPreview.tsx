import { useEffect, useState } from 'react';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { getReviewDraftMedia } from '@/lib/api';
import { FEED_MIN_RATIO, INSTAGRAM_FOLD, feedRatio } from '@/lib/review-queue';

export default function PostPreview({
  account,
  caption,
  image,
  draftID,
  version,
  hasMedia,
  altText,
  showFold,
  onMediaReady,
}: {
  account: string;
  caption: string;
  image?: string;
  draftID?: string;
  version?: number;
  hasMedia?: boolean;
  altText?: string;
  /** Mark where Instagram's feed truncates the caption with "more". */
  showFold?: boolean;
  onMediaReady?: (ready: boolean) => void;
}) {
  const [savedImage, setSavedImage] = useState({ url: '', identity: '' });
  const identity = `${draftID}:${version}:${image}`;
  const [error, setError] = useState('');
  const [ratio, setRatio] = useState(FEED_MIN_RATIO);
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
      <div
        className="instagram-preview-frame"
        style={{ aspectRatio: source ? ratio : FEED_MIN_RATIO }}
      >
        {source ? (
          <img
            className="instagram-preview-image"
            src={source}
            onLoad={(event) => {
              setRatio(
                feedRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight),
              );
              onMediaReady?.(true);
            }}
            onError={() => {
              onMediaReady?.(false);
              setError('Image preview unavailable. Refresh before approving.');
            }}
            alt={altText || 'Selected image for this post'}
          />
        ) : (
          <div className="instagram-preview-placeholder">
            <span>{error || (hasMedia ? 'Loading selected image…' : 'Image needed')}</span>
            {!hasMedia && <small>Choose or upload a JPEG.</small>}
          </div>
        )}
      </div>
      <div className="instagram-preview-actions" aria-hidden="true">
        <Heart />
        <MessageCircle />
        <Send />
        <Bookmark />
      </div>
      <p className="instagram-preview-caption">
        <strong>{account}</strong>{' '}
        {showFold && [...caption].length > INSTAGRAM_FOLD ? (
          <>
            {[...caption].slice(0, INSTAGRAM_FOLD).join('')}
            <span className="instagram-fold" role="note">
              … more · feed fold
            </span>
            <span className="instagram-below-fold">
              {[...caption].slice(INSTAGRAM_FOLD).join('')}
            </span>
          </>
        ) : (
          caption
        )}
      </p>
    </div>
  );
}
