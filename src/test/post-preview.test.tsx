import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PostPreview from '@/pages/admin/PostPreview';
import { feedRatio } from '@/lib/review-queue';

vi.mock('@/lib/api', () => ({ getReviewDraftMedia: vi.fn() }));

afterEach(cleanup);

describe('Instagram post preview', () => {
  it('keeps feed images between 4:5 portrait and 1.91:1 landscape', () => {
    expect(feedRatio(1080, 1350)).toBeCloseTo(0.8);
    expect(feedRatio(1080, 1920)).toBeCloseTo(0.8);
    expect(feedRatio(1080, 1080)).toBe(1);
    expect(feedRatio(3000, 1000)).toBeCloseTo(1.91);
    expect(feedRatio(0, 0)).toBeCloseTo(0.8);
  });

  it('reserves a 4:5 frame before an image is chosen', () => {
    render(<PostPreview account="subcult" caption="Hello" />);
    const frame = screen
      .getByText('Image needed')
      .closest('.instagram-preview-frame') as HTMLElement;
    expect(frame.style.aspectRatio).toBe('0.8 / 1');
  });

  it('crops the frame to the loaded image within feed limits', () => {
    render(<PostPreview account="subcult" caption="Hello" image="blob:prepared" />);
    const image = screen.getByRole('img') as HTMLImageElement;
    Object.defineProperty(image, 'naturalWidth', { value: 1080 });
    Object.defineProperty(image, 'naturalHeight', { value: 1080 });
    fireEvent.load(image);
    expect((image.parentElement as HTMLElement).style.aspectRatio).toBe('1 / 1');
  });
});
