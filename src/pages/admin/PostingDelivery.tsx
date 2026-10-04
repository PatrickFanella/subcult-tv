import PostingShell from './PostingShell';
import SocialDelivery from './SocialDelivery';
export default function PostingDelivery() {
  return (
    <PostingShell title="Scheduled & delivered">
      <SocialDelivery draft={null} revision={0} historyOnly />
    </PostingShell>
  );
}
