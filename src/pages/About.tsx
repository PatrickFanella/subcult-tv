import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { getShowcaseProducts } from '@/lib/showcase';
import { getProductPath } from '@/lib/product-paths';

export default function About() {
  return (
    <>
      <SEOHead path="/about" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="max-w-3xl mb-16">
          <p className="showcase-eyebrow">INDEPENDENT SOFTWARE STUDIO</p>
          <h1 className="mb-6">We are Subculture Collective.</h1>
          <p className="text-bone text-lg leading-relaxed">
            SUBCULT for short. We build software for people who clip streams, keep archives,
            organize mutual aid and put on shows. Most platforms are built to keep you scrolling.
            Our software does one job and lets you leave.
          </p>
        </header>
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="mb-5">Each product starts with a specific job.</h2>
            <p className="text-bone leading-relaxed">
              Somebody clipped the stream and now nobody can find it. A sentence is buried four
              hours into a recording. A neighbor needs a ride. Someone has to work the door. We pick
              one of those and build for it.
            </p>
          </div>
          <div className="space-y-6 text-bone">
            <div>
              <h3 className="text-glow mb-2">The code is public</h3>
              <p>
                Each product links to its repository. You can see how it works and watch it change.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">Each one looks like itself</h3>
              <p>
                There is no house template. A clip site and a mutual aid board have different jobs,
                so they don’t look alike.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">We say how finished it is</h3>
              <p>
                Some of these are live. Others are demos, previews or still in development, and each
                page says which.
              </p>
            </div>
            <div>
              <h3 className="text-glow mb-2">We stick around</h3>
              <p>
                After a release we keep fixing bugs, updating the documentation and answering the
                people who use it.
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
            Tell us about the archive, the group, the venue or the record you’re working on. Product
            questions, patches and collaborations are welcome too.
          </p>
          <Link to="/contact" className="showcase-text-link">
            Write to us →
          </Link>
        </section>
      </div>
    </>
  );
}
