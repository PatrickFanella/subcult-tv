---
title: Social post patterns
type: research
status: active
created: 2026-10-05
review-after: 2027-01-05
---

# Social post patterns

Named structures for posts of 40 to 150 words. The real posts behind each mechanism are in [exemplars.md](exemplars.md). [VOICE.md](../../VOICE.md) decides how each account and product sounds, and the [[Product Claims Register]] decides what a post may say. A pattern never licenses a claim.

## How to read the worked examples

Every worked example is **illustrative**. Facts taken from the claims register are left plain. Anything in `[square brackets]` is invented for the example, such as a person, a time, a count or a quote, and must be replaced with a real, checked fact or removed. If there is no real fact to put in the brackets, use a different pattern. Do not publish an example as written.

A batch of drafts should use several patterns. Two drafts in one batch should not share a pattern unless they are for different accounts and read differently.

## Principles behind the patterns

These come from the craft sources gathered October 5, 2026. Quotes were checked through a summarizing fetcher; verify before quoting in public. **(snippet)** means search-result wording only.

- **The first line has one job.** Joseph Sugarman: "The sole purpose of the first sentence in an ad is to get you to read the second sentence" (quoted at [verygoodcopy.com](https://www.verygoodcopy.com/verygoodcopy-blogs-7/joe-sugarman); other sources drop "sole"). David Ogilvy: "When you have written your headline, you have spent eighty cents out of your dollar" ([Goodreads](https://www.goodreads.com/quotes/191457-on-the-average-five-times-as-many-people-read-the)). In a feed, the first line is the headline.
- **Make the reader feel something before you sell.** Chris Zukowski, quoting IndieGameJoe: "Stop thinking 'how do I sell this?' and start thinking 'how do I make someone feel something?'" and "Get straight to the gameplay or the strongest visual idea" ([howtomarketagame.com, May 7, 2026](https://howtomarketagame.com/2026/05/07/2026-tips-for-making-your-tweets-go-viral/)).
- **One true thing the reader didn't know.** Paul Graham: "Useful writing tells people something true and important that they didn't already know, and tells them as unequivocally as possible" ([How to Write Usefully](https://paulgraham.com/useful.html)).
- **Name the dog.** Roy Peter Clark, tool 14: "Get the name of the dog. Dig for the concrete and specific, details that appeal to the senses" ([Poynter](https://www.poynter.org/reporting-editing/2006/fifty-writing-tools-quick-list/)). Strunk, rule 12: "Prefer the specific to the general, the definite to the vague, the concrete to the abstract" ([Gutenberg](https://www.gutenberg.org/files/37134/37134-h/37134-h.htm)).
- **Start late.** Kurt Vonnegut: "Start as close to the end as possible" (snippet, from *Bagombo Snuff Box*). Horace's *in medias res*: "he hurries to the action, and snatches the listener into the middle of things" ([Wikipedia](https://en.wikipedia.org/wiki/In_medias_res)). Elmore Leonard: "Try to leave out the part that readers tend to skip" ([Farnam Street](https://fs.blog/elmore-leonard-10-rules-of-writing/)).
- **Connect by cause, not by "and".** Trey Parker and Matt Stone's "But & Therefore" rule, as summarized by [David Perell](https://perell.com/note/but-therefore-rule/) (paraphrase only): stories that move on "and then" are dull, stories that move on "but" and "therefore" hold attention. Emma Coats's story spine ([Aerogramme](https://www.aerogrammestudio.com/2013/03/07/pixars-22-rules-of-storytelling/)) gives the same shape: "Every day, ___. One day ___. Because of that, ___." These were her personal notes, not official Pixar doctrine.
- **End on the thing, not on its meaning.** Strunk, rule 18: the most prominent place in a sentence "is usually the end." Susan Orlean on unlearning "those summary upsurges, rehashing what I'd already written" ([Nieman Storyboard, January 16, 2026](https://niemanstoryboard.org/2026/01/16/how-to-end-a-story/)). Lauren Kessler: "The tidy-little-package ending often does not" work ([Nieman Storyboard, May 19, 2023](https://niemanstoryboard.org/2023/05/19/narrative-writing-story-structure-endings/)).
- **Vary the rhythm.** Gary Provost: "This sentence has five words. Here are five more words. Five-word sentences are fine." The passage goes on to show how a run of them drones ([Goodreads](https://www.goodreads.com/quotes/1313924-this-sentence-has-five-words-here-are-five-more-words)).
- **Post when there's something to say.** Steamworks: "If you don't have a reason to post an announcement, don't post one - constant communication just to fill space risks player fatigue" ([Steamworks docs](https://partner.steamgames.com/doc/marketing/event_tools)).
- **Answer the reader's question.** Simon Willison: release notes should "best answer the question 'what has changed and why does this matter to me?'" ([January 31, 2022](https://simonwillison.net/2022/Jan/31/release-notes/)).

---

## The patterns

### 1. The bug confession

**When:** Something of ours was broken for real people and is now fixed. Best on Patrick's account, where self-deprecation fits.

**Skeleton:** What broke, as the person met it → how long, or why I didn't notice → the cause in one plain line → what they get now → a short closer that is about me, not a lesson.

**Worked example** (Patrick, clpr, illustrative):

> I broke clpr's topic pages for [about a day] and didn't notice, because I only ever browse by creator. [Someone] told me that picking a topic gave them [an empty page]. The filter was [reading the wrong field]. It's fixed. Pick a topic and the clips are there again. If you find another empty page on clpr, tell me. Apparently I won't find it myself. https://clpr.tv/

**Failure modes:** Confessing a bug nobody hit, which is just a changelog with guilt. Inventing who reported it. Pipeline words ("merged", "deployed the fix"). Turning the closer into a moral about testing. Using this pattern every week, which makes the product look fragile.

### 2. The impossible symptom

**When:** A bug or behavior that sounded wrong or absurd when reported. It works best when the cause is surprising and short to explain. From the 500-mile email and the Tuesday printer.

**Skeleton:** The symptom in the reporter's words, at its strangest → "I didn't believe it" or the first wrong guess → the real cause in one or two sentences → the fix in one clause.

**Worked example** (Patrick, HasanAra, illustrative):

> Bug report: "search works, except for anything said in [March]." I assumed they'd typed it wrong. They hadn't. [Every broadcast from that month had been indexed with the wrong year], so the record had it filed [a year early]. Searching works across that month again. The transcripts are still automatic, so check the tape before you quote one. https://hasanara.tv/

**Failure modes:** A symptom that is only mildly odd. A cause that needs a paragraph of jargon. Building suspense the payoff can't support.

### 3. Before and after, for one person

**When:** A change or a product makes one specific job easier for one kind of person. A real named person needs their permission and a real asset. Otherwise write in the second person and make the person "you".

**Skeleton:** The person and their job → what was in the way (one concrete obstacle) → what they did with the product (two or three plain steps) → the result, as an object you could see.

**Worked example** (SUBCULT, Undertow, illustrative):

> You finished the track on [Sunday]. The only thing to post with it is the cover art. Open Undertow in a browser, drop in the song, pick one of six templates and add the lyrics as an LRC file. Export a 9:16 MP4. It renders on your machine, so how fast depends on the machine. https://undertow.subcult.tv/

**Failure modes:** An invented testimonial. A "before" so exaggerated that nobody recognizes it. Listing every feature in the "after". Promising speed (the register says performance varies).

### 4. A scene at the door

**When:** Products used at a particular time and place: Subcult OS, Patchwork, Kork at a merch table. Use Subcult OS's run-sheet register.

**Skeleton:** A time cue and one sensory detail → the problem in that moment → the product in one sentence → its maturity, once.

**Worked example** (SUBCULT, Subcult OS, illustrative):

> [18:40]. The line is out the door, the paper list is [three pages], and someone's name is spelled two ways. That's the shift Subcult OS is for: free reservations, a guest list on a phone, check-in by name or code, and a report at close-out instead of a pile of screenshots. It's in development, and the guest in the demo is fake. https://subcult.tv/products/subcult-os

**Failure modes:** Nightlife glamour. A scene that never connects to what the product does. Implying a real event was run on it (the register says none was verified).

### 5. The number that means something

**When:** A true number that becomes interesting when you put a second number next to it. From Jake Birkett's 0.47 and ConcernedApe's 10 versus 15 years.

**Skeleton:** The number → the comparison that gives it meaning → what the product does about the gap.

**Worked example** (SUBCULT, Rekolekt, illustrative):

> A [four-hour] recording has [14,400] seconds in it. The sentence you want is in one of them. Rekolekt transcribes each recording with timestamps, indexes the text, and links every passage back to the second it was spoken. It's software you deploy for your own archive. HasanAra is one archive built on it. https://subcult.tv/products/rekolekt

**Failure modes:** An invented or rounded-up number. A number with nothing to compare it to. User or download counts (the register forbids them in evergreen copy). Two numbers in one post when one would do.

### 6. The tiny tour

**When:** A screen or flow that is easier to show than describe. Needs a real capture or a short recording. Fits products with lots of visible parts, like Kork and Undertow.

**Skeleton:** "Three things on this screen" or "Here's [X] in [N] steps" → each stop in one line, in the product's own words → one line on what's not there yet.

**Worked example** (SUBCULT, Kork, with a real capture):

> A Kork page, top to bottom. Your links, plus any of 92 services with their icons. A tip button that goes to your own Cash App or PayPal, not to us. One of ten themes, or your own colors and fonts. It's free and new. A new account waits 24 hours before it can publish. https://kork.subcult.tv/

**Failure modes:** Using the tour to dump the full feature list. Steps that don't match the capture. Imperative-verb chains ("Create. Customize. Share.").

### 7. Ask for help honestly

**When:** We need something specific from readers: testers, a bug report, feedback on one screen. From the tenant-organizing guide's small physical asks.

**Skeleton:** What it is and how unfinished, plainly → the one thing we want them to do → why their answer changes something → how to tell us.

**Worked example** (SUBCULT, Patchwork, illustrative):

> Patchwork is a demo of a neighborhood board for requests and offers. It isn't ready for real help yet, so please don't post a real request. We do want to know where it confuses people. Post a pretend offer, like [a spare crib], and tell us which screen made you stop and think. [Reply here] or open an issue. https://patchwork.subcult.tv/

**Failure modes:** A vague ask ("let us know what you think"). Hiding how unfinished it is. Asking for something we won't act on. Engagement bait dressed up as feedback.

### 8. The refusal

**When:** The point of the product is something we won't do. Kork takes no cut, the archive won't pretend transcripts are perfect, the code is public. From Albini's "No points. Period." and Dischord's "actual postage".

**Skeleton:** The refusal as a flat rule → why we can keep it (a mechanism, not a value statement) → what the reader gets.

**Worked example** (SUBCULT, Kork):

> We don't take a cut of your tips. We couldn't if we tried: the button on a Kork page goes straight to your Cash App or PayPal, and the money never passes through us. Kork is a free link page. It's new, and it has rough edges. Tell us where. https://kork.subcult.tv/

**Failure modes:** Refusing something nobody does. Moral superiority instead of mechanism. Turning it into a dunk on a named competitor. Refusing something we haven't actually ruled out (paid plans are planned for Kork, so "never paid" is not a refusal we can make).

### 9. The flat description

**When:** The product is strange or simple enough that describing it in the plainest words is the hook. From Terry Cavanagh's egg game. Best for Patrick.

**Skeleton:** "I made a thing that [does X]" → how you use it, in two plain steps → one honest limit.

**Worked example** (Patrick, Undertow, illustrative):

> I made a thing that turns a song into a video. You open it in a browser, drop in the track, and pick a template, or move every layer yourself if you have opinions. It exports an MP4 without uploading your audio anywhere. My laptop takes [a while] on the big presets, so yours might too. https://undertow.subcult.tv/

**Failure modes:** Adding adjectives because plain feels too modest. Flat turning into dull, with no detail a reader can picture.

### 10. Who this is for

**When:** A niche product where the right reader should feel addressed and everyone else can skip it. From Factorio FFF #366 and the 37signals Puma post.

**Skeleton:** "This one is for people who [specific job]" → their problem in their own vocabulary → the mechanism → what kind of thing it is (deployable software, demo, preview).

**Worked example** (SUBCULT, Rekolekt):

> This one is for people who keep an archive of recordings and get asked "where did they say that?" Rekolekt transcribes each recording with timestamps and links every search result back to the passage in the source. It's software you run under your own archive's name. It's not an upload service. HasanAra is the running example. https://subcult.tv/products/rekolekt

**Failure modes:** "For creators, builders and anyone who..." (VOICE.md bans that audience line). Addressing a group so broad that it addresses nobody.

### 11. The note from the room

**When:** Weekly or occasional maker notes on Patrick's account. One true detail from the work, not a status report. From Tarn Adams's cat.

**Skeleton:** Where I am or what happened (one concrete detail) → the one thing I worked on → a small unresolved bit.

**Worked example** (Patrick, illustrative):

> [The radiator in my room started clanking at 2am], which is how I ended up awake rewriting how Subcult OS prints the end-of-night report. It now [fits on one page]. Still in development, and nobody has run a real door with it yet. That's next. Not at 2am.

**Failure modes:** An invented detail. A detail that has nothing to do with the work. Turning it into a productivity flex.

### 12. Bad news, straight

**When:** Something is going away, isn't available, costs more, or broke. From Panic, Dischord and Cloudflare.

**Skeleton:** The news in the first sentence → the one fact that forced it → what still works or what to do instead → when, if there is a date.

**Worked example** (SUBCULT, Undertow):

> You can't buy cloud rendering for Undertow. We've been testing it, and billing is switched off. What works today: the editor in your browser, six templates, lyrics from LRC, SRT or VTT files, and MP4 export on your own machine. https://undertow.subcult.tv/

**Failure modes:** Burying the news under context. Apologizing in a way that makes the post about us. Promising a date we haven't committed to.

### 13. The question that isn't bait

**When:** We actually need to know something, the answer will change what we build, and the readers are the people who would know.

**Skeleton:** Who we're asking → the exact question, with its options → why we need to know → what we'll do with the answers.

**Worked example** (Patrick, Rekolekt, illustrative):

> Question for people who cite recordings: when you give a timestamp, do you count from the start of the file or the start of the set? I'm deciding what Rekolekt shows by default, and I'd rather ask than guess. I'll go with whatever most replies say and post what I picked.

**Failure modes:** A question whose answer we already have. "What do you think?" with no options. Questions as openers that the next sentence answers. Promising to act on replies and then not doing it.

### 14. The chat report

**When:** clpr's own account. The bit is the familiar experience of a moment that nobody clipped, or a clip you can't find. Lowercase-friendly and fast.

**Skeleton:** The moment as chat lived it → the problem afterward → what clpr does, in clip-hunter words.

**Worked example** (clpr):

> chat: "CLIP IT"
> also chat: does not clip it
> three days later you're scrubbing a vod at 2x looking for one sentence.
> if somebody did clip it, it's on clpr, filed under the creator and the topic. save it to a playlist this time. https://clpr.tv/

**Failure modes:** Naming real streamers without a checked clip. Emote spam. Slang older than the reader. "content" and "discover" (banned for clpr).

### 15. The correction

**When:** HasanAra's announcer voice, or any time we got something wrong in public. Newspaper furniture makes it fun without making light of the error.

**Skeleton:** "Corrections:" or "A correction" → what we said → what's true → what readers should do differently.

**Worked example** (SUBCULT, HasanAra, illustrative):

> Corrections desk. In [last week's post], we described HasanAra's transcripts as if they were finished text. They aren't. They're machine-made and sometimes wrong. The record shows when something was said. The tape shows what was said. Check the tape before you quote. https://hasanara.tv/

**Failure modes:** A fake correction used as a hook. Correcting trivia nobody noticed. A joke that makes the error seem not to matter.

### 16. The one-line release

**When:** A music release or a small, self-explanatory launch. The facts are the post. From Jeff Rosenstock's POST- announcement. This is the one pattern that runs under 40 words on purpose.

**Skeleton:** What it is → price → where. Optionally one line on why now or who made it.

**Worked example** (Patrick, music, illustrative):

> New track, [title], out now on [Bandcamp]. [Pay what you want]. [I made the video for it in Undertow, which felt like cheating, since I also made Undertow.] [link]

**Failure modes:** Padding it into a paragraph. Teasers in place of the release. Hype adjectives. Turning the second line into a pitch.

### 17. The cost of a thing

**When:** Explaining a rule or limit by showing what it costs us without it. From Daniel Stenberg's nineteen minutes on one bogus report.

**Skeleton:** The time or effort, in real units → the specific thing that took it → the rule we made because of it → what that means for the reader.

**Worked example** (Patrick, Kork, illustrative):

> I spent [twenty minutes] this morning deleting [eleven] Kork pages that were nothing but [crypto giveaway links]. [That's why] a new account waits 24 hours before it can publish. Sorry if you're the real musician stuck in that wait. Your page will be there tomorrow. https://kork.subcult.tv/

**Failure modes:** Complaining with no rule attached. Blaming users. Made-up minutes. Claiming a reason for a rule that the rule's owners haven't stated; the claims register records Kork's 24-hour wait but not why it exists.

---

## First-line openers by type

Templates, not copy. Fill the brackets with a real fact. Don't use the same opener type twice in one batch.

**Scene**
1. "[Time]. [One physical detail]."
2. "It's [time of day] and [one thing is going wrong]."
3. "You finished [the thing]. Now [the next problem]."
4. "There's a [object] on [place], and [what's wrong with it]."

**Confession**
5. "I broke [thing] for [duration] and didn't notice."
6. "I've been avoiding writing about [topic]."
7. "This took me [time] longer than it should have."
8. "I was wrong about [specific thing]."

**Symptom or mystery**
9. "Bug report: '[the user's exact words].'"
10. "Someone told me [impossible-sounding symptom]. I didn't believe them."
11. "[Thing] worked everywhere except [one weird place]."
12. "The first clue was [small odd symptom]."

**Number**
13. "[Number] [unit]. [The comparison that gives it meaning]."
14. "A [length] recording has [count] seconds in it."
15. "[Expected number]. We got [actual number]."
16. "It took [time] to [do the small thing]."

**Flat description**
17. "I made a thing that [does one plain thing]."
18. "[Product] does one job: [the job]."
19. "This is a [plain noun] for [specific person]."

**Refusal**
20. "We don't [the thing everyone else does]."
21. "No [familiar extra]. [Why not, in a few words]."
22. "[Product] will never ask you for [thing]." (Only if it's true and committed.)

**Address the reader**
23. "This one is for people who [specific job]."
24. "If you've ever [specific annoying experience], [what's different]."
25. "If you came for [the other thing], skip this one."

**Someone said**
26. "Somebody in chat said [line]." (Real chat only.)
27. "A friend asked me [specific question]."
28. "The most common question about [product] is [the question]." (Only with a real pattern of questions.)

**Correction or news**
29. "Corrections: [what we got wrong]."
30. "[Thing] is going away on [date]."
31. "You can't [do the thing people expect] yet."
32. "Not live yet, but [what you can see now]."

**Small ask**
33. "We need [number] people to try [one specific thing]."
34. "Question for [specific group]: [the exact question]?"

**Chat register (clpr only)**
35. "chat: '[the line]'"
36. "you saw it live. good luck finding it again."

---

## Anti-patterns

Each one is a shape that makes readers scroll past, with a real example.

### The changelog dump

A list of features with no person or scene. Brotato's Next Fest post ("A new weapon combining system, weapon sets, 2 new traits, 32 new items...") drew 17 likes at fetch time ([X](https://x.com/blobfishdev/status/1536384192594026496)); the game itself went on to do well. Keep a Changelog: "Using commit log diffs as changelogs is a bad idea: they're full of noise" ([keepachangelog.com](https://keepachangelog.com/en/1.1.0/)). Zukowski's *60 Game Marketing Mistakes* names "boring headlines like 'Update #11' or 'Spring update' or 'Dev Log #23'" and says "Boring subject lines = lower click-through" ([PDF](https://howtomarketagame.com/wp-content/uploads/2023/05/Zukowski_60MistakesEbookV1.pdf)). **Instead:** pick the one change a person would notice and use pattern 1, 3 or 6.

### The diff

"The revised X replaces Y with Z." The reader never saw Y. VOICE.md records this as a repeated failure of the October 2026 batches. **Instead:** describe what a person meets now, as in the Things release note "Restored the behavior where deleting all checklist items leaves an empty item ready for typing" ([Cultured Code](https://culturedcode.com/things/support/articles/1100684/)).

### The question opener the next sentence answers

From our own W40 drafts ([[2026-W40 Content Posts]]): "Looking for a Twitch moment worth revisiting? Browse clips on CLPR, follow the source creator, and explore what else catches your attention." and "Researching a HasanAbi discussion? Search HasanAra, open a result at its broadcast timestamp..." The question gives the reader nothing to wonder about, because the answer is always "use our product". **Instead:** pattern 13 for a real question, or a scene opener.

### Verdict framing

Telling the reader what to conclude about the product instead of showing it. From the same W40 file: "A search result is more useful when it leads back to the conversation." The October batches also produced discoveries framed as "A useful X" (recorded in [[Posting Best Practices]]). A verdict is a claim the reader has to take on trust. Wikipedia's AI-writing guide calls a related habit puffery: writing that "puffs up the importance of the subject matter" ([WP:AISIGNS](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)). **Instead:** show the mechanism ("Click a result and you're in the broadcast at that second") and let the reader decide it's useful.

### The imperative chain

"Browse clips, follow the creator, and explore what else catches your attention." Three verbs in a row read as instructions on a box. WP:AISIGNS: "LLMs overuse the rule of three... from 'adjective, adjective, adjective' to 'short phrase, short phrase, and short phrase'." VOICE.md bans three imperative-titled features for the same reason. **Instead:** one action, described as what happens.

### The caveat ending

Ending on a disclaimer or a check that's still due ("Fresh recording remains pending", or a maturity line tacked on last). Posting Best Practices records "a closing line about checks still due" as a repeated October shape. The last position in a post is the most prominent (Strunk, rule 18), so a caveat there becomes the takeaway. **Instead:** keep the maturity limit, but put it where it matters to the reader, said once and plainly, usually mid-post. Exception: HasanAra's "check the tape before you quote" can close a post when the post is about quoting.

### The moral ending

A closing line that turns the post into a maxim ("Because context matters."). Susan Orlean on unlearning "summary upsurges" and Lauren Kessler on "the tidy-little-package ending" ([Nieman Storyboard](https://niemanstoryboard.org/2026/01/16/how-to-end-a-story/)). WP:AISIGNS lists summary endings and notes that older models "often ended paragraphs or sections by summarizing and restating its core idea." **Instead:** end on a concrete detail, the URL, or a dry aside about yourself.

### Hashtag walls

Adam Mosseri, announcing Instagram's five-hashtag limit in December 2025: "a few specific tags actually perform better than a long list of generic ones" (quoted at [TechBuzz](https://www.techbuzz.ai/articles/instagram-caps-hashtags-at-five-to-combat-spam); original Threads post not opened). Search results also attribute to him "hashtags are not a way to get more reach" (snippet). Our default is zero hashtags, with one specific tag only when it helps identify the topic. **Instead:** say the topic in words.

### Engagement bait and generic CTAs

Meta's 2017 announcement defines engagement bait as posts that seek "to take advantage of our News Feed algorithm by boosting engagement in order to get greater reach," with "LIKE this if you're an Aries!" as its example ([Meta Newsroom, December 18, 2017](https://about.fb.com/news/2017/12/news-feed-fyi-fighting-engagement-bait-on-facebook/)). "Check it out!", "Let us know what you think!" and "Tag a friend" are softer versions of the same thing. Zukowski does argue for a call to action: "you should have a clear idea of what you want people to do after they see your primary message" (60 Mistakes PDF). The key word is *clear*. **Instead:** a specific next step (pattern 7) or just the URL.

### AI tells

WP:AISIGNS lists, among others: puffery ("is a testament", "pivotal", "evolving landscape"), negative parallelism ("It is not just ..., it's ..."), rule of three, trailing "-ing" analysis ("highlighting...", "fostering..."), promotional words ("boasts", "vibrant", "groundbreaking"), summary endings, formulaic em dashes and chatbot sign-offs. The page warns that scrubbing only the surface signs is not the fix ([WP:AISIGNS](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)). VOICE.md already bans "not just X, but Y", "The result?" and a list of words. **Instead:** a specific fact in every sentence. A post made of specifics has no room for these.

### Broetry

One sentence per line, building to an inspirational lesson. BuzzFeed News, which coined the term: "LinkedIn power users are gaming the social network with elongated self-help posts that look like poems" ([December 6, 2017](https://www.buzzfeednews.com/article/ryanmac/why-are-these-posts-taking-over-your-linkedin-feed-because)). The clpr chat-report pattern uses line breaks, but for a joke's timing, not for a lesson.

### Stock phrases

Orwell: "Never use a metaphor, simile or other figure of speech which you are used to seeing in print" ([Politics and the English Language](https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/)). Elmore Leonard: "If it sounds like writing, I rewrite it" ([Farnam Street](https://fs.blog/elmore-leonard-10-rules-of-writing/)). "In one place", "with the source attached" and "worth keeping" are our own stock phrases, per VOICE.md.

### Teaching the wrong audience

Zukowski's teardown of an underwhelming launch quotes the developer: "our devlogs also were consistently the worst performing videos we uploaded each month." His diagnosis was that the devlogs reached other developers, not players ([howtomarketagame.com, October 31, 2023](https://howtomarketagame.com/2023/10/31/deconstructing-the-underwhelming-launch-of-a-automation-builder-game/)). For SUBCULT: a post about our stack reaches developers. A post about a clip, a door or a tape reaches the people who would use the product. Both are fine. Know which one you're writing.

### Posting to fill a slot

Steamworks: "constant communication just to fill space risks player fatigue." If a scheduled slot has no real change, scene, number or question behind it, skip the slot.

### Pipeline words

"Merged", "PR", "deployed", "live check", "verification". VOICE.md keeps these in private notes. The reader can't see our pipeline. Say "not live yet" or "in development", once.
