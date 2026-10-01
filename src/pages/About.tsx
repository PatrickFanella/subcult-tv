import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { getShowcaseProducts } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';

export default function About() {
  return (
    <>
      <SEOHead
        title="Studio"
        description="SUBCULT is the independent studio behind CLPR, Patchwork, HasanAra, Rekolekt, Subcult OS, and Undertow."
        path="/about"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="max-w-3xl mb-16">
          <p className="showcase-eyebrow">THE STUDIO BEHIND THE PRODUCTS</p>
          <h1 className="mb-6">Built by SUBCULT.</h1>
          <p className="text-bone text-lg leading-relaxed">
            Subculture Collective is an independent software studio. We build tools for the people
            collecting media, preserving memory, organizing support, and making live culture happen.
          </p>
        </header>
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="mb-5">A practice, expressed in products.</h2>
            <p className="text-bone leading-relaxed">
              A stream produces moments worth keeping. A recording holds a conversation worth
              finding again. A neighborhood needs a way to coordinate help. An event needs someone
              to run the door. Our products start with those concrete needs.
            </p>
          </div>
          <div className="space-y-6 text-bone">
            <div>
              <h3 className="text-glow mb-2">Source you can inspect</h3>
              <p>
                Each product links to its repository, so you can follow its development and see how
                it works.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">Identity that fits the work</h3>
              <p>
                Every product has its own visual language, shaped around the people and workflows it
                serves.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">Care beyond the release</h3>
              <p>
                Maintenance, documentation, and useful feedback are part of building software people
                can keep using.
              </p>
            </div>
          </div>
        </section>
        <section aria-labelledby="studio-products">
          <h2 id="studio-products" className="mb-8">
            What we build
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12">
            {getShowcaseProducts().map(({ project, headline }) => (
              <Link
                key={project.slug}
                to={getProductPath(project.slug)}
                className="block border-t border-fog py-6 no-underline"
              >
                <h3 className="text-glow mb-2">{project.name} →</h3>
                <p className="text-bone">{headline}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="border-t border-fog mt-12 pt-12">
          <h2 className="mb-5">Have a use for one of these?</h2>
          <p className="text-bone mb-6 max-w-2xl">
            Talk to us about your archive, community, event, or creative workflow. Product
            questions, contributions, and collaborations are welcome.
          </p>
          <Link to="/contact" className="showcase-text-link">
            Get in touch →
          </Link>
        </section>
      </div>
    </>
  );
}
