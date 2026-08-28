import SEOHead from '@/components/SEOHead';
import Button from '@/components/ui/Button';
import TerminalPanel from '@/components/effects/TerminalPanel';

const BRAND_COLORS = [
  { name: 'Void', hex: '#0a0a0a', usage: 'Primary background' },
  { name: 'Soot', hex: '#141414', usage: 'Secondary background' },
  { name: 'Ash', hex: '#1a1a1a', usage: 'Card backgrounds' },
  { name: 'Smoke', hex: '#2a2a2a', usage: 'Elevated surfaces' },
  { name: 'Fog', hex: '#3a3a3a', usage: 'Borders, dividers' },
  { name: 'Bone', hex: '#c4b9a7', usage: 'Body text' },
  { name: 'Chalk', hex: '#e8e0d0', usage: 'Primary text' },
  { name: 'Signal', hex: '#8b5cf6', usage: 'Primary accent, CTAs' },
  { name: 'Static', hex: '#00ff88', usage: 'Success, terminal green' },
  { name: 'Flicker', hex: '#ffcc00', usage: 'Warning, highlights' },
  { name: 'Scan', hex: '#e040fb', usage: 'Secondary accent' },
  { name: 'Cyan', hex: '#00ccff', usage: 'Info, links' },
];

export default function PressKit() {
  return (
    <>
      <SEOHead
        title="Press Kit"
        description="SUBCULT brand assets, colors, typography, and usage guidelines."
        path="/press"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-12">
          <p className="font-mono text-xs text-dust mb-3">&gt; ls /press-kit/</p>
          <h1 className="mb-4">Press Kit</h1>
          <p className="text-bone max-w-2xl">
            Names, colors, typefaces, and usage rules for Subculture Collective and SUBCULT.
          </p>
        </div>

        {/* Brand Name */}
        <section className="mb-12">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Brand Identity
          </h2>
          <div className="bg-ash border border-fog p-6 space-y-4">
            <div>
              <span className="font-mono text-xs text-dust block mb-1">Full Name</span>
              <span className="font-display text-2xl text-glow">Subculture Collective</span>
            </div>
            <div>
              <span className="font-mono text-xs text-dust block mb-1">Short Name</span>
              <span className="font-display text-2xl text-glow">SUBCULT</span>
            </div>
            <div>
              <span className="font-mono text-xs text-dust block mb-1">Domain</span>
              <span className="font-mono text-glow">subcult.tv</span>
            </div>
            <div>
              <span className="font-mono text-xs text-dust block mb-1">Tagline</span>
              <span className="text-bone italic">
                "We build tools, media, and infrastructure for the counterculture."
              </span>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Color Palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRAND_COLORS.map((color) => (
              <div key={color.name} className="border border-fog overflow-hidden">
                <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                <div className="p-2 bg-ash">
                  <span className="font-mono text-xs text-glow block">{color.name}</span>
                  <span className="font-mono text-xs text-dust block">{color.hex}</span>
                  <span className="text-xs text-bone block mt-1">{color.usage}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Typography
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-ash border border-fog p-6">
              <span className="font-mono text-xs text-dust block mb-2">Display Font</span>
              <span className="font-display text-3xl text-glow block mb-2">Oswald</span>
              <p className="text-sm text-bone">
                Use for headings, navigation, and brand text. Set it bold and uppercase.
              </p>
            </div>
            <div className="bg-ash border border-fog p-6">
              <span className="font-mono text-xs text-dust block mb-2">Body Font</span>
              <span
                className="text-3xl text-glow block mb-2"
                style={{ fontFamily: 'Libre Baskerville, Georgia, serif' }}
              >
                Libre Baskerville
              </span>
              <p className="text-sm text-bone">
                Use for body text, descriptions, and long-form copy.
              </p>
            </div>
            <div className="bg-ash border border-fog p-6">
              <span className="font-mono text-xs text-dust block mb-2">Mono Font</span>
              <span className="font-mono text-3xl text-glow block mb-2">JetBrains Mono</span>
              <p className="text-sm text-bone">
                Use for code, terminal output, labels, and system text.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Rules */}
        <section className="mb-12">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Usage Guidelines
          </h2>
          <TerminalPanel title="brand.rules" className="max-w-2xl">
            <div>
              <span className="text-dust"># brand usage rules:</span>
              <br />
              <br />
              <span className="text-static">DO:</span>
              <br />
              <span className="text-chalk"> → Use "SUBCULT" or "Subculture Collective"</span>
              <br />
              <span className="text-chalk"> → Maintain dark backgrounds with light text</span>
              <br />
              <span className="text-chalk"> → Use Signal Purple (#8b5cf6) as primary accent</span>
              <br />
              <span className="text-chalk"> → Keep monospace for technical/system text</span>
              <br />
              <br />
              <span className="text-signal">DON'T:</span>
              <br />
              <span className="text-chalk"> → Use on light/white backgrounds</span>
              <br />
              <span className="text-chalk"> → Alter the color palette significantly</span>
              <br />
              <span className="text-chalk"> → Use decorative/cursive fonts for brand text</span>
              <br />
              <span className="text-chalk"> → Add drop shadows or 3D effects to the logo</span>
              <br />
              <span className="text-chalk">
                {' '}
                → Associate with political movements we haven't endorsed
              </span>
            </div>
          </TerminalPanel>
        </section>

        {/* Downloads placeholder */}
        <section className="mb-12">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            Downloadable Assets
          </h2>
          <div className="bg-ash border border-fog p-6">
            <p className="text-bone mb-4">
              These asset files are not yet included. Request current brand materials through the
              contact form.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Logo (SVG)', file: 'subcult-logo.svg' },
                { name: 'Logo (PNG)', file: 'subcult-logo.png' },
                { name: 'Banner (Wide)', file: 'subcult-banner-wide.png' },
                { name: 'Banner (Square)', file: 'subcult-banner-square.png' },
              ].map((asset) => (
                <div key={asset.name} className="border border-fog p-3 text-center opacity-50">
                  <span className="font-mono text-xs text-dust block">{asset.name}</span>
                  <span className="font-mono text-xs text-fog block mt-1">{asset.file}</span>
                  <span className="font-mono text-xs text-fog block mt-2">[COMING SOON]</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact for press */}
        <div className="text-center py-8 border-t border-fog">
          <p className="text-bone mb-4">
            For brand materials or press inquiries, use the contact form.
          </p>
          <Button as="link" to="/contact" variant="secondary">
            Contact form
          </Button>
        </div>
      </div>
    </>
  );
}
