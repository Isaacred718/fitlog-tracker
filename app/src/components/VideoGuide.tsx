import { videoGuideUrl } from '../lib/videoGuide';
import { Icon } from './Icon';

// Text link for action rows (active workout card): "Video guide".
export function VideoGuideLink({ name }: { name: string }) {
  return (
    <a
      className="ghost-btn"
      href={videoGuideUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch a video guide for ${name} on YouTube`}
    >
      <Icon name="play" size={18} /> Video guide
    </a>
  );
}

// Round play button for catalog rows (Library).
export function VideoGuideIconButton({ name }: { name: string }) {
  return (
    <a
      className="icon-btn video-btn"
      href={videoGuideUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch a video guide for ${name} on YouTube`}
    >
      <Icon name="play" size={20} />
    </a>
  );
}
