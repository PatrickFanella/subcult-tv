import type { PostingDraft } from '@/lib/api';

export default function CampaignContext({ draft }: { draft: PostingDraft }) {
  const campaign = draft.craft?.campaign;
  if (!campaign) return <p className="studio-note">Prepared before packet tracking. Campaign alignment needs review.</p>;
  return (
    <details className="studio-note">
      <summary>Campaign: {campaign.project_name || 'Editorial'} · {campaign.theme || 'Theme needs review'}</summary>
      <p>Reader action: {campaign.reader_action || 'No project action selected'}{campaign.destination ? ` — ${campaign.destination}` : ''}</p>
      <p>Packet: {campaign.status} · {campaign.packet_revision || 'Unavailable'} · {campaign.packet_sha256 ? `SHA-256 ${campaign.packet_sha256}` : 'No packet hash'}</p>
      <p>Next review step: {campaign.review_decision?.replaceAll('_', ' ') || 'Review campaign alignment'} · {campaign.asset_ids?.length || 0} inspected assets · {campaign.result_ids?.length || 0} result records</p>
      {campaign.measurement && <p>Measure: {campaign.measurement}</p>}
      {campaign.asset_task && <p>Demonstration to check: {campaign.asset_task}</p>}
      {campaign.flags?.length ? <ul>{campaign.flags.map((flag) => <li key={flag}>{flag}</li>)}</ul> : null}
    </details>
  );
}
