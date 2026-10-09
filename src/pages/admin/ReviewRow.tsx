import type { ReactNode } from 'react';
import type { PostingDraft, ReviewDraft } from '@/lib/api';
import { draftPlatform, firstLine, platformLabel } from '@/lib/review-queue';
import { usePreparedImage } from './usePreparedImage';
import { useSavedImage } from './useSavedImage';
import { useReveal } from './useReveal';

function RowThumbnail({ draft, edit }: { draft: PostingDraft; edit?: ReviewDraft }) {
  const saved = useSavedImage(edit?.has_media ? edit.draft_id : undefined, edit?.version);
  const prepared = usePreparedImage(edit?.has_media ? undefined : draft.media.image?.sha256);
  const url = edit?.has_media ? saved.url : prepared.url;
  if (url) return <img className="review-row-thumb" src={url} alt="" />;
  return (
    <span className="review-row-thumb review-row-thumb-empty" aria-hidden="true">
      {draftPlatform(draft) === 'instagram' ? 'IG' : platformLabel(draftPlatform(draft))}
    </span>
  );
}

/** One collapsible post: a summary line that opens its review or edit sheet. */
export default function ReviewRow({
  draft,
  edit,
  meta,
  when,
  state,
  attention = false,
  expanded,
  onToggle,
  children,
}: {
  draft: PostingDraft;
  edit?: ReviewDraft;
  meta: string;
  when: string;
  state: string;
  /** Marks a missed or failed post. */
  attention?: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const sheet = `review-sheet-${draft.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  // Opening a row scrolls it to the top so the sheet is in view.
  const ref = useReveal<HTMLLIElement>(expanded, 'start');
  return (
    <li
      ref={ref}
      className="review-row"
      data-expanded={expanded || undefined}
      data-attention={attention || undefined}
    >
      <button
        type="button"
        className="review-row-summary"
        aria-expanded={expanded}
        aria-controls={sheet}
        onClick={onToggle}
      >
        <RowThumbnail draft={draft} edit={edit} />
        <span className="review-row-main">
          <span className="review-row-meta">{meta}</span>
          <span className="review-row-text">{firstLine(draft.text)}</span>
        </span>
        <span className="review-row-side">
          <span>{when}</span>
          <span className="review-row-state">{state}</span>
        </span>
      </button>
      {expanded && (
        <div id={sheet} className="review-row-sheet">
          {children}
        </div>
      )}
    </li>
  );
}
