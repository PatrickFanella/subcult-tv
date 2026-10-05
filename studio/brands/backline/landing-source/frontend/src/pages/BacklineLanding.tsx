import { ArrowDown, ArrowUpRight, Check, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import './backline-landing.css';

const source =
    'https://git.subcult.tv/subculture-collective/backline';
const tools = [
    {
        number: '01',
        name: 'A good first hello.',
        label: 'WELCOME & ROLES',
        text: 'Choose a welcome channel, set up rules acknowledgment, and let members choose from the roles you make available.',
        doc: 'onboarding',
        tags: [
            'Welcome messages',
            'Rules acknowledgment',
            'Self-service roles',
        ],
    },
    {
        number: '02',
        name: 'Keep the context.',
        label: 'MODERATION',
        text: 'Warnings, timeouts, and other moderation actions belong in a case history, with a reason and the staff member who took the action.',
        doc: 'moderation',
        tags: ['Case history', 'Permission checks', 'Audit records'],
    },
    {
        number: '03',
        name: 'Make room to listen.',
        label: 'PRIVATE SUPPORT',
        text: 'Give members a place to ask for help. Staff can claim a ticket, bring in the right people, and close the conversation when it is resolved.',
        doc: 'tickets',
        tags: ['Ticket panels', 'Staff assignment', 'Retention controls'],
    },
];

export default function BacklineLanding() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="backline">
            <header className="bl-header">
                <Link to="/" className="bl-brand" aria-label="Backline home">
                    <img
                        src="/brand/backline/lockup.svg"
                        alt="Backline"
                        width="610"
                        height="152"
                    />
                </Link>
                <button
                    className="bl-menu-button"
                    type="button"
                    aria-expanded={menuOpen}
                    aria-controls="bl-navigation"
                    aria-label={
                        menuOpen ? 'Close navigation' : 'Open navigation'
                    }
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? (
                        <X aria-hidden="true" />
                    ) : (
                        <Menu aria-hidden="true" />
                    )}
                </button>
                <nav
                    id="bl-navigation"
                    className={menuOpen ? 'bl-nav is-open' : 'bl-nav'}
                    aria-label="Main navigation"
                >
                    <a href="#tools" onClick={() => setMenuOpen(false)}>
                        The tools
                    </a>
                    <a href="#how" onClick={() => setMenuOpen(false)}>
                        How it works
                    </a>
                    <Link className="bl-nav-login" to="/login">
                        Pilot sign in{' '}
                        <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                </nav>
            </header>

            <main id="main-content">
                <section className="bl-hero" aria-labelledby="bl-title">
                    <div className="bl-hero-copy">
                        <p className="bl-eyebrow">
                            <span className="bl-square" /> A SUBCULT TOOL /
                            DISCORD COMMUNITIES
                        </p>
                        <h1 id="bl-title">
                            KEEP YOUR
                            <br />
                            PEOPLE
                            <br />
                            <span>TOGETHER.</span>
                        </h1>
                        <p className="bl-hero-description">
                            The tools behind your community. Welcome people,
                            support your members, and give your moderation team
                            the context to do its work.
                        </p>
                        <div className="bl-hero-actions">
                            <a className="bl-button" href="#tools">
                                Explore the tools{' '}
                                <ArrowDown size={20} aria-hidden="true" />
                            </a>
                            <a className="bl-text-link" href="#pilot">
                                Meet the private pilot{' '}
                                <ArrowUpRight size={18} aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                    <div
                        className="bl-workflow"
                        aria-label="Illustrative Backline workflows with fictional members and records"
                    >
                        <div className="bl-workflow-label">
                            <span>BEHIND THE SCENES</span>
                            <span>ILLUSTRATIVE WORKFLOWS</span>
                        </div>
                        <div className="bl-workflow-board">
                            <div className="bl-board-top">
                                <img
                                    src="/brand/backline/mark.svg"
                                    alt=""
                                    width="32"
                                    height="32"
                                />
                                <span>YOUR COMMUNITY</span>
                                <span className="bl-board-number">001</span>
                            </div>
                            <div className="bl-example bl-example-welcome">
                                <div className="bl-example-heading">
                                    <span className="bl-step-label">
                                        01 / WELCOME
                                    </span>
                                    <span className="bl-example-symbol">↳</span>
                                </div>
                                <h2>
                                    YOU’RE IN.
                                    <br />
                                    MAKE YOURSELF AT HOME.
                                </h2>
                                <p>
                                    A welcome message. A clear set of rules. A
                                    place to start.
                                </p>
                                <span className="bl-example-chip">
                                    <Check size={14} aria-hidden="true" /> Rules
                                    acknowledged
                                </span>
                            </div>
                            <div className="bl-example bl-example-case">
                                <div className="bl-example-heading">
                                    <span className="bl-step-label">
                                        02 / MODERATION
                                    </span>
                                    <span className="bl-small-label">
                                        CASE #014
                                    </span>
                                </div>
                                <div className="bl-case-line">
                                    <strong>ACTION</strong>
                                    <span>Warning</span>
                                </div>
                                <div className="bl-case-line">
                                    <strong>REASON</strong>
                                    <span>Repeated off-topic posts</span>
                                </div>
                                <div className="bl-case-line">
                                    <strong>STAFF</strong>
                                    <span>Sam / moderator</span>
                                </div>
                            </div>
                            <div className="bl-example bl-example-ticket">
                                <div className="bl-example-heading">
                                    <span className="bl-step-label">
                                        03 / SUPPORT
                                    </span>
                                    <span className="bl-small-label">
                                        TICKET #008
                                    </span>
                                </div>
                                <h2>“A LITTLE HELP?”</h2>
                                <div className="bl-ticket-bottom">
                                    <span>Alex / member</span>
                                    <span className="bl-example-chip">
                                        Claimed by staff
                                    </span>
                                </div>
                            </div>
                            <div className="bl-board-bottom">
                                ONE SERVER. THE MODULES YOU CHOOSE.
                            </div>
                        </div>
                        <p className="bl-sample-note">
                            Sample content, not a live server or dashboard
                            capture.
                        </p>
                    </div>
                </section>

                <div className="bl-strip" aria-label="Core modules">
                    <span>WELCOME</span>
                    <span aria-hidden="true">✳</span>
                    <span>MODERATE</span>
                    <span aria-hidden="true">✳</span>
                    <span>SUPPORT</span>
                    <span aria-hidden="true">✳</span>
                    <span>BACK YOUR PEOPLE</span>
                </div>

                <section
                    id="tools"
                    className="bl-tools bl-section"
                    aria-labelledby="bl-tools-title"
                >
                    <div className="bl-section-heading">
                        <p className="bl-eyebrow">THE TOOLKIT / 01—03</p>
                        <h2 id="bl-tools-title">
                            A community takes work.
                            <br />
                            Give that work a home.
                        </h2>
                        <p>
                            Start with the jobs your server needs. Each module
                            is configured for that server and starts disabled
                            until you choose to enable it.
                        </p>
                    </div>
                    <div className="bl-tool-list">
                        {tools.map((tool) => (
                            <article className="bl-tool" key={tool.number}>
                                <span
                                    className="bl-tool-number"
                                    aria-hidden="true"
                                >
                                    {tool.number}
                                </span>
                                <div>
                                    <p className="bl-eyebrow">{tool.label}</p>
                                    <h3>{tool.name}</h3>
                                    <p className="bl-tool-description">
                                        {tool.text}
                                    </p>
                                    <ul
                                        className="bl-tags"
                                        aria-label={`${tool.label} capabilities`}
                                    >
                                        {tool.tags.map((tag) => (
                                            <li key={tag}>{tag}</li>
                                        ))}
                                    </ul>
                                </div>
                                <a
                                    className="bl-doc-link"
                                    href={`${source}/src/branch/main/docs/developer/${tool.doc}.md`}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Read ${tool.label.toLowerCase()} documentation`}
                                >
                                    Read the details{' '}
                                    <ArrowUpRight
                                        size={20}
                                        aria-hidden="true"
                                    />
                                </a>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    id="how"
                    className="bl-how bl-section"
                    aria-labelledby="bl-how-title"
                >
                    <div className="bl-section-heading">
                        <p className="bl-eyebrow">YOUR SERVER / YOUR SETUP</p>
                        <h2 id="bl-how-title">
                            Choose the job.
                            <br />
                            Set the boundaries.
                        </h2>
                    </div>
                    <ol className="bl-steps">
                        <li>
                            <span className="bl-step-index">01</span>
                            <h3>Pick your server.</h3>
                            <p>
                                Sign in with Discord. The dashboard checks your
                                access to the server you want to configure.
                            </p>
                        </li>
                        <li>
                            <span className="bl-step-index">02</span>
                            <h3>Set up the module.</h3>
                            <p>
                                Choose channels, staff roles, and the settings
                                that fit your community. Review the permissions
                                it needs.
                            </p>
                        </li>
                        <li>
                            <span className="bl-step-index">03</span>
                            <h3>Bring it into Discord.</h3>
                            <p>
                                Use commands and member-facing panels in the
                                server. Return to the dashboard for setup and
                                moderation records.
                            </p>
                        </li>
                    </ol>
                    <div className="bl-principle">
                        <img
                            src="/brand/backline/mark.svg"
                            alt=""
                            width="72"
                            height="72"
                        />
                        <p>
                            Good tools respect the people using them.
                            <br />
                            <strong>
                                Clear permissions. Deliberate setup. A record of
                                the action.
                            </strong>
                        </p>
                    </div>
                </section>

                <section
                    id="pilot"
                    className="bl-pilot bl-section"
                    aria-labelledby="bl-pilot-title"
                >
                    <div className="bl-pilot-copy">
                        <p className="bl-eyebrow">CURRENTLY / PRIVATE PILOT</p>
                        <h2 id="bl-pilot-title">
                            BUILT WITH
                            <br />A REAL COMMUNITY.
                        </h2>
                        <p>
                            Backline is being tested with SUBCULT before broader
                            community installation. The pilot is where we check
                            setup, permissions, and what happens when a real
                            server uses the tools.
                        </p>
                        <p>
                            Public installation is not open yet. If you already
                            have pilot access, your dashboard is ready to sign
                            in.
                        </p>
                        <Link className="bl-button" to="/login">
                            Pilot sign in{' '}
                            <ArrowUpRight size={20} aria-hidden="true" />
                        </Link>
                    </div>
                    <div className="bl-pilot-stamp" aria-hidden="true">
                        <img
                            src="/brand/backline/mark-light.svg"
                            alt=""
                            width="240"
                            height="240"
                        />
                        <span>
                            BACKLINE
                            <br />
                            CREW TOOLS / VOL. 01
                        </span>
                    </div>
                </section>

                <section
                    className="bl-faq bl-section"
                    aria-labelledby="bl-faq-title"
                >
                    <div>
                        <p className="bl-eyebrow">BEFORE YOU ASK</p>
                        <h2 id="bl-faq-title">A few practical things.</h2>
                    </div>
                    <div className="bl-faq-list">
                        <details>
                            <summary>Can I add Backline to my server?</summary>
                            <p>
                                Public installation is not available yet.
                                Backline is in a private pilot with SUBCULT; a
                                broader release needs its own installation and
                                operating checks.
                            </p>
                        </details>
                        <details>
                            <summary>
                                Do I have to turn on every module?
                            </summary>
                            <p>
                                No. Modules start disabled and are configured
                                separately for each server. Choose the channels,
                                roles, and capabilities your community needs.
                            </p>
                        </details>
                        <details>
                            <summary>Who can see support tickets?</summary>
                            <p>
                                The ticket opener, invited participants,
                                configured staff, and the bot receive access.
                                Discord server owners and administrators retain
                                their inherent access.
                            </p>
                        </details>
                        <details>
                            <summary>
                                Where can I read the implementation details?
                            </summary>
                            <p>
                                The project’s{' '}
                                <a
                                    href={`${source}/src/branch/main/docs/developer/bot-expansion-roadmap.md`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    development documentation
                                </a>{' '}
                                explains the modules, implementation sequence,
                                and qualification gates.
                            </p>
                        </details>
                    </div>
                </section>
            </main>
            <footer className="bl-footer">
                <img
                    src="/brand/backline/wordmark.svg"
                    alt="Backline"
                    width="470"
                    height="132"
                />
                <p>
                    A tool from <a href="https://subcult.tv/">SUBCULT</a>.<br />
                    For the people behind the community.
                </p>
                <a href="#bl-title">Back to the top ↑</a>
            </footer>
        </div>
    );
}
