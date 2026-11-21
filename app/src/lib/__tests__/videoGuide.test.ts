import { describe, expect, it } from 'vitest';
import { videoGuideUrl } from '../videoGuide';

describe('videoGuideUrl', () => {
  it('matches the classic app search construction', () => {
    expect(videoGuideUrl('Face Pull')).toBe(
      'https://www.youtube.com/results?search_query=Face%20Pull%20exercise%20form%20tutorial',
    );
  });

  it('encodes special characters in exercise names', () => {
    expect(videoGuideUrl('Landmine 180°')).toContain('Landmine%20180%C2%B0%20exercise%20form%20tutorial');
  });
});
