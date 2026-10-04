import { Link } from 'react-router-dom';

export default function SupportCallout() {
  return (
    <aside className="support-callout" aria-labelledby="support-callout-heading">
      <div>
        <p className="showcase-eyebrow">KEEP THE WORK GOING</p>
        <h2 id="support-callout-heading">Help build the next release.</h2>
        <p>
          Your support helps pay for hosting, maintenance and time to make independent software.
        </p>
      </div>
      <Link to="/support" className="support-primary">
        Support SUBCULT →
      </Link>
    </aside>
  );
}
