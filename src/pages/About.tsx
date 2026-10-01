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
            Subculture Collective is an independent software studio. We build tools for people who
            collect clips, keep archives, organize mutual aid, and put on live events.
          </p>
        </header>
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="mb-5">Each product starts with a specific job.</h2>
            <p className="text-bone leading-relaxed">
              A stream produces moments worth keeping. A recording holds a conversation worth
              finding again. A neighborhood needs a way to coordinate help. An event needs someone
              to run the door. We build for one of those jobs at a time.
            </p>
          </div>
          <div className="space-y-6 text-bone">
            <div>
              <h3 className="text-glow mb-2">Source you can inspect</h3>
              <p>
                Each product links to its repository, so you can see how it works and follow its
                development.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">A design of its own</h3>
              <p>Each product has its own look, designed around the people who use it.</p>
            </div>
            <div>
              <h3 className="text-glow mb-2">Maintained after release</h3>
              <p>
                We keep fixing bugs, updating documentation, and answering feedback after a product
                ships.
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
            Tell us about your archive, community, event, or creative project. We also welcome
            product questions, contributions, and collaborations.
          </p>
          <Link to="/contact" className="showcase-text-link">
            Get in touch →
          </Link>
        </section>
      </div>
    </>
  );
}
