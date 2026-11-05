import SEOHead from '@/components/SEOHead';

export default function Privacy() {
  return (
    <>
      <SEOHead path="/privacy" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <p className="showcase-eyebrow">SUBCULT / YOUR INFORMATION</p>
        <h1 className="mb-6">Privacy</h1>
        <p className="text-bone mb-10">
          This notice covers subcult.tv. The products linked from this site have their own services
          and data handling.
        </p>
        <div className="space-y-10 text-bone">
          <section id="contact" className="scroll-mt-24">
            <h2 className="mb-4">Contact messages</h2>
            <p>
              We store the name, email address, subject and message you submit so SUBCULT can read
              and reply to your enquiry. Signed-in administrators can read and delete messages. When
              email notifications are enabled, a copy is sent to the studio inbox through Brevo, our
              email provider.
            </p>
          </section>
          <section id="newsletter" className="scroll-mt-24">
            <h2 className="mb-4">Newsletter</h2>
            <p>
              We store your email address and subscription records, including confirmation and
              unsubscribe status. Brevo handles confirmation emails and newsletter delivery when
              email delivery is enabled. Every newsletter has an unsubscribe link. Unsubscribing
              stops the newsletter; it does not automatically delete the stored subscription record.
            </p>
          </section>
          <section>
            <h2 className="mb-4">Storage and deletion</h2>
            <p>
              Contact messages and subscription records have no automatic expiry. To ask for a copy,
              correction or deletion of information you gave us, email{' '}
              <a href="mailto:info@subcult.tv">info@subcult.tv</a> from the address you used.
            </p>
          </section>
          <section>
            <h2 className="mb-4">Site preferences and analytics</h2>
            <p>
              Your VHS effects preference is saved in your browser. Public pages use Umami for
              traffic measurement when its analytics script is enabled. The app can also send named
              events for newsletter requests and Patreon links; these event calls contain no form
              fields. The app skips those events when your browser sends Do Not Track or Global
              Privacy Control.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
