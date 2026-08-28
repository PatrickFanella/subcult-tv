import SEOHead from '@/components/SEOHead';
import TerminalPanel from '@/components/effects/TerminalPanel';

export default function About() {
  return (
    <>
      <SEOHead
        title="About"
        description="How SUBCULT builds open-source tools for underground scenes, mutual aid, archives, and independent media."
        path="/about"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-xs text-dust mb-3">&gt; cat /about/README.md</p>
          <h1 className="mb-6">About // studio</h1>
          <p className="text-bone max-w-3xl text-lg leading-relaxed">
            SUBCULT is an independent software studio. We build open-source tools for underground
            scenes, mutual aid, archives, and independent media.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Mission */}
          <div>
            <h2 className="mb-6">
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Mission
            </h2>
            <div className="space-y-4 text-bone leading-relaxed">
              <p>
                We work with small communities, local scenes, shared memory, and mutual aid. This
                work should not depend on surveillance or algorithmic reach.
              </p>
              <p>
                When practical, we develop the software in public. Repositories, documentation, and
                project status let people inspect the work and judge the evidence.
              </p>
              <p>
                Our mission:{' '}
                <span className="text-signal font-bold">
                  give independent culture tools it can understand, host, adapt, and keep.
                </span>
              </p>
              <p>
                We make bounded claims, document limitations, and treat maintenance as part of the
                work.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="mb-6">
              <span className="text-dust font-mono text-sm mr-3">//</span>
              Values
            </h2>
            <ul className="space-y-4">
              {[
                {
                  label: 'Privacy by default',
                  detail: 'Collect less data. Explain what remains. Ask for clear consent.',
                },
                {
                  label: 'Open source as baseline',
                  detail: 'Source access is part of the work.',
                },
                {
                  label: 'Evidence over hype',
                  detail: 'Publish project status, limitations, and outcomes.',
                },
                {
                  label: 'Self-hosting as independence',
                  detail: 'People should be able to run and understand the tools they depend on.',
                },
                {
                  label: 'Documentation is a feature',
                  detail: "If it's not documented, it doesn't exist.",
                },
                { label: 'Ugly-beautiful design', detail: 'Communication comes first.' },
              ].map((v) => (
                <li key={v.label} className="border-l-2 border-signal pl-4">
                  <span className="font-mono text-sm text-glow block">{v.label}</span>
                  <span className="text-sm text-bone">{v.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What we build / won't build */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="bg-ash border border-fog p-6">
            <h3 className="text-static mb-4">
              <span className="font-mono text-sm mr-2">✓</span>
              What we build
            </h3>
            <ul className="space-y-2 text-sm text-bone">
              <li>→ Privacy-respecting software</li>
              <li>→ Tools for local and underground scenes</li>
              <li>→ Mutual-aid and community infrastructure</li>
              <li>→ Archives, discovery, and cultural memory</li>
              <li>→ Independent media tools</li>
              <li>→ Small utilities that support that work</li>
            </ul>
          </div>

          <div className="bg-ash border border-fog p-6">
            <h3 className="text-signal mb-4">
              <span className="font-mono text-sm mr-2">✗</span>
              What we won't build
            </h3>
            <ul className="space-y-2 text-sm text-bone">
              <li>→ Surveillance disguised as analytics</li>
              <li>→ Engagement traps masquerading as features</li>
              <li>→ Software that requires data surrender</li>
              <li>→ Anything that phones home without consent</li>
              <li>→ Hidden data collection or unclear consent</li>
              <li>→ Products that optimize for addiction</li>
            </ul>
          </div>
        </div>

        {/* Process */}
        <div className="mt-16">
          <h2 className="mb-6">
            <span className="text-dust font-mono text-sm mr-3">//</span>
            How we work
          </h2>

          <TerminalPanel title="subcult.practice" className="max-w-2xl">
            <div>
              <span className="text-dust"># principles before platforms</span>
              <br />
              <br />
              <span className="text-chalk">start: </span>
              <span className="text-static">NAME THE COMMUNITY NEED</span>
              <br />
              <span className="text-chalk">build: </span>
              <span className="text-static">USE BORING, INSPECTABLE PARTS</span>
              <br />
              <span className="text-chalk">verify: </span>
              <span className="text-static">TEST THE CLAIMS WE PUBLISH</span>
              <br />
              <span className="text-chalk">share: </span>
              <span className="text-static">DOCUMENT THE PATH IN AND OUT</span>
              <br />
              <span className="text-dust"># status and limitations included.</span>
            </div>
          </TerminalPanel>
        </div>

        {/* Philosophy */}
        <div className="mt-16 py-12 border-t border-fog text-center">
          <blockquote className="text-lg text-bone italic max-w-2xl mx-auto">
            "Check the public catalog before you take our word for it. It shows project status and
            links to available source and documentation."
          </blockquote>
          <p className="font-mono text-xs text-dust mt-4">&gt; next: open /projects</p>
        </div>
      </div>
    </>
  );
}
