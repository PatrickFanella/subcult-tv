---
title: Social post exemplars
type: research
status: active
created: 2026-10-05
review-after: 2027-01-05
---

# Social post exemplars

Teardowns of real posts, devlogs, release notes and organizing copy that people stop for. Each one shows a mechanism the drafting jobs can use. Use the mechanism. Do not reuse the wording, the jokes or the structure line for line. Pattern skeletons built from these are in [post-patterns.md](post-patterns.md). Voice and facts still come from [VOICE.md](../../VOICE.md) and the [[Product Claims Register]].

## How these were gathered

Collected October 5, 2026 with web search and page fetches. The fetcher passes each page through a summarizing model, so a quote may differ in punctuation from the original. Entries marked **(rechecked)** were fetched a second time and the quoted wording matched. **(snippet)** means the wording came only from a search result. Several X posts were read through the `api.fxtwitter.com` mirror, which returns the original text. Open the source before quoting any of these in public. The excerpts are short, for commentary only.

Some sources could not be reached: TIGSource and Medium (403), Reddit, and Steam news bodies. Instagram and Bluesky posts mostly block fetching, so a few musician and organizer entries cite an article that reproduces the post.

---

## 1. Open on a scene, not an announcement

### 1.1 Untitled Goose Game launch post (rechecked)

- **Source:** [X, @house_house_, September 19, 2019](https://x.com/house_house_/status/1174822313193115648). About 16,900 likes at fetch time, with a video.
- **Excerpt:** "It's a lovely morning in the village and you are a horrible goose. Untitled Goose Game is out today."
- **Why it works:** The first sentence is a place and a role. The joke turns on one word ("horrible"). The announcement is sentence two and takes seven words. Nothing in the post describes features; the scene already tells you what the game is.
- **Borrow it:** Put the reader in the product's situation before naming the product. Subcult OS: the minutes before doors, with the list in your hand. Undertow: a finished track and nothing to post with it. The product name arrives second, in a plain sentence.

### 1.2 Terry Cavanagh, "About the Egg game"

- **Source:** [distractionware.com blog, September 11, 2025](https://distractionware.com/blog/2025/09/about-the-egg-game/).
- **Excerpt:** "Recently, I've been working on a game about being an egg. You play as a normal egg exploring a big 3D world, looking for nests to hatch in."
- **Why it works:** The premise fits in one plain sentence and sounds absurd. He doesn't sell it. Later in the post he admits there is "a gap between where I am now, and where I want to be," which keeps the tone honest.
- **Borrow it:** Patrick can describe a product in its flattest possible terms and trust it to be interesting. "I made a thing that turns a song into a video in your browser" beats any adjective.

### 1.3 Steve Albini, "The Problem with Music"

- **Source:** [The Baffler No. 5, 1993](https://thebaffler.com/salvos/the-problem-with-music).
- **Excerpt:** "Imagine a trench, about four feet wide and five feet deep, maybe sixty yards long, filled with runny, decaying shit."
- **Why it works:** He opens with a physical picture of a record deal, with measurements, before a single number about royalties. The measurements make the image concrete. The essay then itemizes the band's actual money.
- **Borrow it:** SUBCULT's masthead voice can open on a concrete picture of what a platform does to a small operator, with measurements, then show what we built instead. One image per post, not three, and nothing as gross unless the subject earns it.

---

## 2. One person, before and after

### 2.1 Anastasia Opara, Tiny Glade timelapse

- **Source:** [X, @anastasiaopara, February 3, 2023](https://x.com/anastasiaopara/status/1621551506389450752). About 8,200 likes and 470,000 views at fetch time, with a 26-second timelapse.
- **Excerpt:** "My mom gave Tiny Glade a try and she's built the most epic castle 🤯😍 I love seeing her creative process reflected in the timelapse!"
- **Why it works:** The subject is one named relationship, a person who is not the target gamer. "Even my mom could use it" is never said; the video shows it. Pride in someone else's result reads differently from pride in your own product.
- **Borrow it:** Kork or Undertow posts can center one real person's result, but only with that person's permission and a real asset. Never invent the person. Without a real person, use the plain second person ("you") instead of a fake testimonial.

### 2.2 Mitski on filming at shows

- **Source:** [NME, February 25, 2022](https://www.nme.com/news/music/mitski-asks-fans-to-stop-filming-entire-songs-or-whole-sets-at-her-shows-3169422), quoting her post of February 24. (rechecked)
- **Excerpt:** "sometimes when I see people filming entire songs or whole sets, it makes me feel as though we are not here together."
- **Why it works:** It is a request framed as how one person feels on stage, and it names one exact behavior (filming whole songs, not taking photos). She grants the reader's side first ("I'm not against taking photos"), so the ask doesn't read as a scolding. Sources print "here" and "there" differently in one line; check before quoting.
- **Borrow it:** When asking readers to do or stop something (test Patchwork but not with real requests), name the exact behavior and say why from the point of view of the person affected.

---

## 3. The bug told as a mystery

### 3.1 "The case of the 500-mile email"

- **Source:** [Trey Harris, mailing-list story, November 24, 2002](https://www.ibiblio.org/harris/500milemail.html).
- **Excerpt:** "We can't send mail farther than 500 miles from here," he repeated. "A little bit more, actually. Call it 520 miles. But no farther."
- **Why it works:** A non-technical person reports an impossible symptom, and the precise correction ("520") makes it believable. The reader wants the explanation more than the fix. Twenty years later it is still passed around.
- **Borrow it:** Lead a bug post with the symptom as the person experienced it, at its strangest, before any cause. A HasanAra or clpr bug that "only happened on one stream" is a better opening than "fixed an indexing issue".

### 3.2 OpenOffice "won't print on Tuesdays"

- **Source:** [Ubuntu Launchpad bug 255161, comment 28, April 28, 2009](https://bugs.launchpad.net/ubuntu/+source/cupsys/+bug/255161/comments/28).
- **Excerpt:** "My wife has complained that open office will never print on Tuesdays!?! Then she demonstrated it. Sure enough, won't print on Tuesday."
- **Why it works:** A household complaint, a demonstration in front of a witness, and a three-word confirmation. The rhythm sets up and lands the joke without the writer trying to be funny.
- **Borrow it:** "Someone told me X. I didn't believe it. Then I watched it happen." is a three-beat structure that fits under 60 words. Use only when the report is real.

### 3.3 Julia Evans, "Why you should understand (a little) about TCP"

- **Source:** [jvns.ca, November 21, 2015](https://jvns.ca/blog/2015/11/21/why-you-should-understand-a-little-about-tcp/).
- **Excerpt:** "someone mentioned on Slack 'hey I'm publishing messages to NSQ and it's taking 40ms each time'"
- **Why it works:** The investigation starts from an offhand remark with a suspicious number in it. The reader follows the hunt and learns something on the way.
- **Borrow it:** Patrick's account can open with the casual message that started a fix ("someone said the clip page was slow on their phone"), then one detail of what he found.

### 3.4 Andres Freund, xz backdoor disclosure

- **Source:** [oss-security mailing list, March 29, 2024](https://www.openwall.com/lists/oss-security/2024/03/29/4).
- **Excerpt:** "After observing a few odd symptoms around liblzma (part of the xz package) on Debian sid installations over the last weeks (logins with ssh taking a lot of CPU, valgrind errors) I figured out the answer"
- **Why it works:** A large finding opens with small, ordinary symptoms anyone could have shrugged off. The parenthesis lists exactly what he noticed. There's no drama in the wording; the facts carry it.
- **Borrow it:** Lead with the small thing someone noticed. Keep the tone level even when the result matters.

---

## 4. A number that means something

### 4.1 Jake Birkett, wishlist formula check (rechecked)

- **Source:** [X, @greyalien, April 16, 2020](https://x.com/greyalien/status/1250854399938789382).
- **Excerpt:** "Formula says: pre-launch WLs x 0.5 = week 1 unit sales. We got, drum roll, 0.47 sales per wishlist."
- **Why it works:** A prediction, then the real result against it. The number means something because the reader knows what it was supposed to be. "Drum roll" is the only flourish.
- **Borrow it:** Only with real numbers. A number needs a comparison next to it: what we expected, what it was before, or what it costs elsewhere.

### 4.2 ConcernedApe, Stardew Valley 10-year anniversary (rechecked)

- **Source:** [stardewvalley.net, February 26, 2026](https://www.stardewvalley.net/stardew-valley-10-year-anniversary/).
- **Excerpt:** "While the game has been publicly available for 10 years, I've been working on it for almost 15 years."
- **Why it works:** Two numbers in one sentence, and the gap between them shows five years of work nobody saw. First person, no adjectives.
- **Borrow it:** The gap between two true figures (time since first commit vs. time since public release; hours of recording vs. seconds you need) tells a story without commentary.

### 4.3 Raycast changelog v2.6 (rechecked)

- **Source:** [raycast.com/changelog, October 2, 2026](https://www.raycast.com/changelog).
- **Excerpt:** "Raycast's host process now uses about 50% less memory."
- **Why it works:** One measured change, with "about" left in. It replaces "performance improvements" with something a user can check.
- **Borrow it:** If a change has a measured before and after, say the measurement with its hedge. If it was not measured, describe what a person sees instead. Never round up.

### 4.4 37signals, "Warming up the Puma master before it forks"

- **Source:** [dev.37signals.com, Lewis Buckley, October 1, 2026](https://dev.37signals.com/warming-up-the-puma-master-before-it-forks/).
- **Excerpt:** "Basecamp 5 runs on Puma in cluster mode: one master process with `preload_app!` and 63 single-threaded workers per host"
- **Why it works:** The opening is a precise description of the setup, which tells the right reader instantly that this is for them. The post's payoff is a before/after pair (the agent reported a 652 ms cold first request vs. 28 ms warm; not rechecked).
- **Borrow it:** Technical posts from Patrick can open with the exact setup. Peers trust specificity over enthusiasm.

### 4.5 Boston community fridge (rechecked)

- **Source:** [WBUR, Andrea Shea, September 17, 2020](https://www.wbur.org/news/2020/09/17/take-what-you-need-leave-what-you-can-at-a-community-fridge-in-boston).
- **Excerpt:** "Every morning somebody comes by and takes a picture so that we know what items we need, and we'll post it on our Instagram account."
- **Why it works:** The account's whole posting strategy is a daily photo of what is missing. The article reports that a call for bottled water got a case delivered within 25 minutes. A specific need, posted where neighbors look, gets a specific response.
- **Borrow it:** Patchwork posts can show what a single request or offer looks like, with a small ordinary need. Because Patchwork is a demo, the post must not solicit real aid.

### 4.6 Daniel Stenberg, "The I in LLM stands for intelligence"

- **Source:** [daniel.haxx.se, January 2, 2024](https://daniel.haxx.se/blog/2024/01/02/the-i-in-llm-stands-for-intelligence/).
- **Excerpt:** "I have held back on writing anything about AI or how we (not) use AI for development in the curl factory. Now I can't hold back anymore."
- **Why it works:** The opening admits restraint, then breaks it, so the reader knows something specific pushed him. The body counts the cost in real units: 415 reports, 64 confirmed, and "Nineteen minutes later I had looked at the code" for one bogus report.
- **Borrow it:** A maintainer's cost, in minutes, of one specific bad interaction. Patrick could use this for spam signups or junk reports, if he has the real minutes.

### 4.7 Factorio Friday Facts #1 (rechecked)

- **Source:** [factorio.com, September 27, 2013](https://www.factorio.com/blog/post/fff-1).
- **Excerpt:** "The final count of solved issues in the 0.7.0 has stopped at symbolic 111."
- **Why it works:** A small, slightly self-amused number, and the post ends on a broken Linux build with a deadpan emoticon. The first weekly post also admits they had "done a poor job in providing updates about our progress" (agent-verified).
- **Borrow it:** A regular series can start by saying why it exists. A count is fine when it's real and you don't inflate it.

---

## 5. Admit it first

### 5.1 Fly.io, "Reliability: It's Not Great" (rechecked)

- **Source:** [Fly.io community forum, Kurt, March 6, 2023](https://community.fly.io/t/reliability-its-not-great/11253).
- **Excerpt:** "The last four months have been rough. We've had more issues than we're OK with. I've hesitated to share this because, well, I'm fighting a debilitating feeling of failure."
- **Why it works:** The title is the verdict, against the company. The first three sentences get shorter and then more personal. Readers who were angry find nothing to argue with, so they keep reading for the explanation.
- **Borrow it:** When something of ours broke for people, say so in the first line in plain words. Patrick can say how it felt; SUBCULT says what happened and what we changed.

### 5.2 Cloudflare, November 18, 2025 outage

- **Source:** [Cloudflare blog, Matthew Prince, November 18, 2025](https://blog.cloudflare.com/18-november-2025-outage/).
- **Excerpt:** "We know we let you down today."
- **Why it works:** The post opens with an exact UTC timestamp, and the apology has no qualifier. Precision and ownership together make the technical detail that follows credible.
- **Borrow it:** For an outage post, give the time window and the plain apology before the cause. Keep internal pipeline words out.

### 5.3 Panic, "End of the Road for Google Drive in Transmit"

- **Source:** [Panic blog, October 8, 2024](https://blog.panic.com/end-of-the-road-for-google-drive-and-transmit/).
- **Excerpt:** "We never like removing functionality from our apps." / "They promised a discounted minimum price, but no maximum price."
- **Why it works:** Bad news, then one dry sentence that explains the whole decision. The reader understands the problem without a paragraph about vendor terms.
- **Borrow it:** When we drop something, say what is going away, then the one fact that forced it.

### 5.4 Dischord, "Postage Increases = End of Postpaid" (rechecked)

- **Source:** [dischord.com news, May 14, 2007](https://www.dischord.com/news/150/2007/5/postage-increases-end-of-postpaid).
- **Excerpt:** "We have decided instead to begin charging postage (note: we will charge *actual* postage not "postage & handling")"
- **Why it works:** A label announces a price increase and still sounds trustworthy, because it says what it will not do. The parenthesis names a familiar retail trick and refuses it. The post also gives the last year they raised prices (1998–99).
- **Borrow it:** When we change something people won't like, state the exact rule and the trick we're not pulling. Kork's "no cut" works the same way.

---

## 6. Humor in the boring slot

### 6.1 Slack iOS release notes

- **Source:** [slack.com/release-notes/ios](https://slack.com/release-notes/ios). Versions shift; the fetches disagreed on which version carried each line.
- **Excerpt:** "Sharing a URL into a direct message through the iOS share extension wasn't working. As anyone with children will tell you, sharing is often easier in theory than in practice."
- **Why it works:** Sentence one is a plain fix that a user would recognize. Sentence two is the joke, and it's about the user's experience, not the team. The joke never replaces the information. Slack's writers describe the space as "a little space in which we can be human" ([Building Slack, February 26, 2024](https://buildingslack.com/lets-talk-about-release-notes/)).
- **Borrow it:** One plain sentence about what was broken, then at most one aside. clpr and Kork have the license for this; HasanAra's joke is its formality.

### 6.2 Discord patch notes, February 4, 2026 (rechecked)

- **Source:** [discord.com blog](https://discord.com/blog/discord-patch-notes-february-4-2026).
- **Excerpt:** "Resolved a bug on iOS that caused swiping on the Client Themes list to scroll comically fast. Like, _warp speed_ fast."
- **Why it works:** The aside sounds spoken. It describes what the bug felt like, which a dry fix line can't.
- **Borrow it:** In clpr's voice, describe the bug the way someone in chat would have reported it.

### 6.3 SourceHut, "What's cooking on SourceHut? Q2 2026"

- **Source:** [sourcehut.org, May 28, 2026](https://sourcehut.org/blog/2026-05-28-whats-cooking-q2-2026/).
- **Excerpt:** "Unfortunately, by now, the main offender for fake accounts has become: Gmail… _sad trombone_"
- **Why it works:** A plain quarterly report sectioned by person, with one deadpan beat where the reader expects a dull admin note.
- **Borrow it:** A long SUBCULT roundup gets one joke, placed on the most boring item.

### 6.4 Tarn Adams, Dwarf Fortress dev log

- **Source:** [bay12games.com, March 28, 2010 entry](https://www.bay12games.com/dwarves/dev_now.html) (a legacy log).
- **Excerpt:** "Still on track here. Scamps learned to fullscreen Dwarf Fortress and he learned that scratching my computer's case is a great way to get attention."
- **Why it works:** Progress in three words, then the cat. The household detail makes a terse log feel like it comes from a person at a desk. Other entries name specific bugs, such as a crash "related to vermin getting caught in cobwebs" (agent-verified).
- **Borrow it:** Patrick's weekly notes can carry one true detail from the room. Never invent the detail.

### 6.5 Tom Francis, Tactical Breach Wizards

- **Source:** [X, @Pentadact, January 16, 2019](https://x.com/Pentadact/status/1085537748168126465).
- **Excerpt:** "Yep, Tactical Breach Wizards is going well. Why do you ask?"
- **Why it works:** Deadpan understatement against an attached image. The question at the end is a joke, not a prompt for replies. (The agent could not see the image.)
- **Borrow it:** A broken render or a funny bug capture, with one understated line. The image must be real and must actually be funny.

---

## 7. Refuse something out loud

### 7.1 Steve Albini, letter to Nirvana

- **Source:** [Mixdown, May 9, 2024](https://mixdownmag.com.au/features/steve-albini-the-man-the-myth-and-now-the-legend/), quoting the 1992 letter.
- **Excerpt:** "I do not want and will not take a royalty on any record I record. No points. Period."
- **Why it works:** He turns down the money most people in his position would ask for, in sentences that get shorter. The refusal is the pitch.
- **Borrow it:** Kork's offer is a refusal: we don't take a cut because we never touch the money. Say it as a flat rule, not as a benefit.

### 7.2 Dischord, mail-order FAQ

- **Source:** [dischord.com/about](https://dischord.com/about).
- **Excerpt:** "We put our mail-order price on our records because we charge less than most labels and we want our customers to know they have the option to buy directly from us"
- **Why it works:** The price printed on the sleeve is a promise you can check. The FAQ explains the reason in one sentence.
- **Borrow it:** Pair each claim with how a reader can check it. "The code is public. Read it before you trust us" from VOICE.md is the same mechanism.

### 7.3 Jeff Rosenstock, POST- release

- **Source:** [Vanyaland, January 2, 2018](https://vanyaland.com/2018/01/02/fast-tracked-jeff-rosenstock-kicks-off-2018-with-surprise-record-post/), quoting his announcement.
- **Excerpt:** "HAPPY NEW YEAR. NEW RECORD "POST-" AVAILABLE NOW FOR FREE/DONATION ON QUOTE UNQUOTE RECORS AND BANDCAMP."
- **Why it works:** No teaser and no adjectives: what it is, what it costs, where it is. The surprise and the price are the news. The typo was in the original.
- **Borrow it:** For a music release, the facts in one line can be the whole post. Price and place are information, not a CTA.

### 7.4 International Pop Underground Convention, 1991

- **Source:** [Wikipedia](https://en.wikipedia.org/wiki/International_Pop_Underground_Convention), reproducing the K Records flyer.
- **Excerpt:** "No lackeys to the corporate ogre allowed."
- **Why it works:** A political line made funny with a fairy-tale villain. It says who the event is for by saying who it's not for.
- **Borrow it:** SUBCULT can name what it's against in one playful line, as long as the next line names what we built.

### 7.5 Food Not Bombs, principles

- **Source:** [foodnotbombs.net/principles.html](https://foodnotbombs.net/principles.html).
- **Excerpt:** "Our food is vegan or vegetarian and free to anyone without restriction, rich or poor, stoned or sober."
- **Why it works:** Paired opposites make "anyone" concrete, and "stoned or sober" names exactly the person a charity might turn away.
- **Borrow it:** Replace "for everyone" with the specific person who usually gets left out. Kork: the musician with no budget for a paid link page.

### 7.6 Dean Spade, *Mutual Aid*

- **Source:** [The Anarchist Library](https://theanarchistlibrary.org/library/dean-spade-mutual-aid) (Verso, 2020).
- **Excerpt:** "Mutual aid is not charity."
- **Why it works:** A definition by refusal, followed immediately by who holds power in charity. Four words someone can repeat.
- **Borrow it:** Patchwork copy should describe neighbors helping neighbors, not a service helping recipients. Avoid hero language.

---

## 8. A concrete ask, small enough to do today

### 8.1 Rose Lenehan and Tracy Rosenthal, "How To: Organize Your Building"

- **Source:** [Black Rose/Rosa Negra, June 11, 2025](https://www.blackrosefed.org/how-to-organize-your-building/).
- **Excerpt:** "Put up a sign with your contact info; slip notes under your neighbors' doors; draw on existing relationships; talk to people you pass in the halls."
- **Why it works:** Every item is a physical action in a hallway, doable tonight. Nothing asks you to join anything first.
- **Borrow it:** "Ask for help honestly" posts should name one small action: try this one screen and tell us where it broke.

### 8.2 Kamala Parks, *Book Your Own Fuckin' Life* origin

- **Source:** [Vice, May 6, 2019](https://www.vice.com/en/article/the-story-of-the-diy-publication-that-kept-bands-on-the-road-for-decades/), quoting MRR #73 (June 1989).
- **Excerpt:** "Step 1: Getting connections with all the happening people in the world of Punk Rock"
- **Why it works:** Numbered steps in the scene's own voice, followed by a call for exact practical data (cities, phone numbers, all-ages or not). The tone is casual and the information is precise.
- **Borrow it:** A tiny how-to in a product's own vocabulary. Subcult OS can borrow the run-sheet version: times and roles.

### 8.3 DIY Conspiracy, "Prix Libre"

- **Source:** [diyconspiracy.net, March 16, 2017](https://diyconspiracy.net/prix-libre-the-gift-economy-of-diy-punk/), quoting a donation-box sign in Tarbes, France.
- **Excerpt:** "an absence of donations would mean an end to the gigs, look negatively for the reputation of the venue and result in bands no longer taking the detour to play in the town."
- **Why it works:** The sign states the real consequence of not paying, all the way down to touring bands skipping the town. There's no guilt language, just cause and effect.
- **Borrow it:** A Patreon or support post can state what the money actually keeps running, in specifics, without urgency or guilt.

### 8.4 Mariame Kaba, letter to new organizers

- **Source:** [In These Times](https://inthesetimes.com/article/mariame-kaba-letter-to-young-organizers-on-hope-action) (the agent's fetch reported January 22, 2026).
- **Excerpt:** "Be astonished at mundane things in your world."
- **Why it works:** Short imperative, a daily practice rather than a slogan.
- **Borrow it:** Patrick's commentary posts can end on a practice, not a moral. Use sparingly.

---

## 9. Tell the reader who it's for

### 9.1 Factorio Friday Facts #366

- **Source:** [factorio.com, kovarex, June 18, 2021](https://www.factorio.com/blog/post/fff-366).
- **Excerpt:** "Today's post will be quite technical and related to programming, so if you just came for the game news, you can safely skip this one."
- **Why it works:** Letting readers off the hook builds trust, and the readers who stay chose to.
- **Borrow it:** Rekolekt posts can say "this one is for people who keep an archive" and then talk to them as peers.

### 9.2 Lucas Pope, Obra Dinn "Dithering Process"

- **Source:** [dukope.com devlog archive (originally TIGSource), 2017](https://dukope.com/devlogs/obra-dinn/tig-32/).
- **Excerpt:** "Obra Dinn renders everything internally in 8-bit grayscale then converts the final output to 1-bit in a post-processing pass."
- **Why it works:** One hard problem, explained with before/after images. His short tweets ([example](https://x.com/dukope/status/817626490699325440)) are a GIF plus one line and a link to the long post.
- **Borrow it:** Undertow can explain one rendering problem with two captures. The social post is the image plus one line; the depth lives on the linked page.

### 9.3 Things 3.24.1 release notes

- **Source:** [culturedcode.com, September 30, 2026](https://culturedcode.com/things/support/articles/1100684/).
- **Excerpt:** "Restored the behavior where deleting all checklist items leaves an empty item ready for typing."
- **Why it works:** The line describes what the user sees on screen, not what changed in the code.
- **Borrow it:** Every change line should describe what a person meets. That is already a VOICE.md rule; this shows it at the smallest scale.

### 9.4 Tailscale, "We're making Tailscale faster"

- **Source:** [tailscale.com blog, September 22, 2026](https://tailscale.com/blog/making-tailscale-faster).
- **Excerpt:** "If you've been following Tailscale at all, you know we're really just a bunch of geeks who care a lot about internet connectivity."
- **Why it works:** A company introduces itself as a small group of people with one obsession, then gets to the technical work.
- **Borrow it:** SUBCULT's "we" should sound like particular people. Name the obsession, not the mission.

### 9.5 Linear changelog

- **Source:** [linear.app/changelog](https://linear.app/changelog), entry dated September 24, 2026.
- **Excerpt:** "Coding sessions are the shortest path from issue to diff."
- **Why it works:** The entry opens with a single claim about the user's workflow. The fix list underneath is terse and prefixed by product area.
- **Borrow it:** For the website changelog, not social: one claim line, then terse what-you-see bullets.

---

## Contrast case: the feature list

### Blobfish, Brotato Next Fest post

- **Source:** [X, @blobfishdev, June 13, 2022](https://x.com/blobfishdev/status/1536384192594026496). 17 likes at fetch time.
- **Excerpt:** "A new weapon combining system, weapon sets, 2 new traits, 32 new items, 4 new weapons, 2 new waves and more."
- **Why it fails:** It is a changelog with no person, no scene and no media. The game later became a hit, so the problem was the post, not the game. One post's like count proves nothing on its own, but the same shape keeps underperforming, and it matches what Zukowski warns about with "Update #11" headlines (see post-patterns.md).
- **What to do instead:** Pick the one new item that changes how a session feels and show it.

---

## Craft sources cited in the pattern library

These are advice, not exemplars. Quotes and links are in [post-patterns.md](post-patterns.md): Chris Zukowski (howtomarketagame.com), Steamworks event guidance, Keep a Changelog, Simon Willison on release notes, Dan Luu on postmortems, Joseph Sugarman, David Ogilvy, Paul Graham, George Orwell, Roy Peter Clark, Elmore Leonard, Strunk, Susan Orlean and Lauren Kessler at Nieman Storyboard, Emma Coats, Wikipedia's Signs of AI writing, Meta's 2017 engagement-bait post, Adam Mosseri on hashtags and BuzzFeed News on broetry.
