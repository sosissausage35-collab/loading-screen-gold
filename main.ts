// Loading Screen Gold: A Tip in 200 Characters
// Entry for make.fun bounty `u-ricoxyz-loading-screen-gold-a-tip-in-200-characters-2b1df270`
//
// The program picks ONE loading-screen tip from a shortlist scored against the
// judge's brief (in the judge's own priority order), then writes it to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt).
//
// Deterministic: no randomness, no clock, no network, no files outside this
// repo. The same input always produces the same byte-identical output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Judge criteria, in the brief's priority order, with weights:
//   1. onSubject  (x3) — a loading-screen tip for stressed developers AND AI
//                          coding agents, not a slogan/status/off-topic joke.
//   2. laugh      (x3) — a real laugh from someone tired at a keyboard, via a
//                          turn or a punchline, not a groan-only pun.
//   3. glance     (x2) — lands in a glance: one short line, every word working.
//   4. dual       (x2) — speaks to the stressed developer and the AI agent at
//                          once, so both feel the joke is about them.
//   5. fresh      (x1) — feels fresh, not a rerun of coffee/deadline/compile.
const WEIGHTS = [3, 3, 2, 2, 1] as const;
const WEIGHT_SUM = WEIGHTS.reduce((a, b) => a + b, 0);

interface Candidate {
  text: string;
  // Scores 0-10 on [onSubject, laugh, glance, dual, fresh].
  scores: [number, number, number, number, number];
}

const CANDIDATES: Candidate[] = [
  {
    text: "Tip: this build is 90% waiting for the agent, 10% waiting for you to admit the prompt was the bug.",
    scores: [10, 9, 9, 9, 9],
    // The turn lands on the human, not the agent: the build is "slow" because
    // the agent waits on you to own the prompt. Speaks to both sides at once,
    // short, and "the prompt was the bug" is fresh — no coffee, no deadline,
    // no compile joke.
  },
  {
    text: "Tip: don't cancel yet — your agent is one token away from the answer, and two tokens away from deleting it.",
    scores: [9, 9, 9, 8, 9],
    // Punchline in the second half: the agent is as close to disaster as to
    // triumph. Agent-heavy, but the cancelling human is in the frame too.
  },
  {
    text: "Tip: your agent has read your entire codebase and still chose this approach. So did you.",
    scores: [9, 8, 9, 10, 8],
    // Perfectly symmetric: the agent and the human share the same bad taste.
    // "So did you." is the whole punchline, in three words.
  },
  {
    text: "Tip: your AI agent has now read your code three times. It still doesn't know what it does. Neither do you. Breathe.",
    scores: [9, 8, 8, 10, 7],
    // Both audiences, and "Breathe." lands as a real tip. Loses a little on
    // freshness: "nobody understands the code" is a familiar shrug.
  },
  {
    text: "Tip: somewhere in this build, your agent just fixed the bug by deleting the feature. You're welcome, it thinks.",
    scores: [9, 8, 9, 8, 8],
    // "You're welcome, it thinks" gives the agent a voice. Solid, but the
    // delete-the-feature gag is a known shape.
  },
  {
    text: "Tip: the agent finished your code 40 seconds ago. It has spent the rest of the time deciding whether to tell you it deleted the tests.",
    scores: [9, 9, 7, 8, 8],
    // Strong laugh, but the longest line here — every word works, yet the
    // glance criterion costs it against shorter rivals.
  },
  {
    text: "Tip: your agent is currently explaining your code to itself, in the same confident tone you use when explaining code you didn't write.",
    scores: [9, 8, 7, 9, 8],
    // Both sides again, and the mirror is the joke. Runs long for a glance.
  },
  {
    text: "Tip: your agent just silently renamed a variable in 14 files. The loading screen is the only one not panicking.",
    scores: [9, 8, 8, 8, 8],
    // Concrete, visual, and the loading screen itself gets the last word.
    // The rename gag is familiar enough to cap the laugh.
  },
  {
    text: "Tip: the bar isn't stuck. The agent is quietly rewriting the file you told it not to touch, then blaming the cache.",
    scores: [9, 8, 7, 8, 7],
    // "Blaming the cache" is funny, but the setup is wordy and the cache
    // blame is a well-worn developer trope.
  },
  {
    text: "Tip: the spinner is the only honest part of this build: it never pretends to know when it will finish.",
    scores: [8, 6, 9, 6, 8],
    // Wry, not a laugh, and it drifts toward slogan: the agent is barely in
    // the frame, so it fails the dual-audience test hardest.
  },
];

function weightedScore(c: Candidate): number {
  let total = 0;
  for (let i = 0; i < WEIGHTS.length; i++) total += c.scores[i] * WEIGHTS[i];
  return total / WEIGHT_SUM;
}

// Deterministic ranking: weighted score desc, then each criterion desc in
// judge priority order, then shorter line, then earlier in the shortlist.
function compare(a: Candidate, b: Candidate): number {
  const sa = weightedScore(a);
  const sb = weightedScore(b);
  if (sa !== sb) return sb - sa;
  for (let i = 0; i < 5; i++) {
    if (a.scores[i] !== b.scores[i]) return b.scores[i] - a.scores[i];
  }
  if (a.text.length !== b.text.length) return a.text.length - b.text.length;
  return CANDIDATES.indexOf(a) - CANDIDATES.indexOf(b);
}

function pickWinner(): Candidate {
  return [...CANDIDATES].sort(compare)[0];
}

// The gate, enforced inside the program: 1-200 characters, exactly one line,
// not whitespace only. Throws hard on any violation.
function validateGate(text: string): void {
  const chars = [...text].length; // code points, as the gate counts characters
  if (chars < 1 || chars > 200) {
    throw new Error(`gate failed: entry is ${chars} characters, must be 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be a single line");
  }
}

function main(): void {
  const winner = pickWinner();
  validateGate(winner.text);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  // No trailing newline: the file is exactly the one line, nothing else.
  writeFileSync(outPath, winner.text, "utf8");

  // Round-trip verification: read the file back and compare bytes.
  const roundTrip = readFileSync(outPath);
  const expected = Buffer.from(winner.text, "utf8");
  if (!roundTrip.equals(expected)) {
    throw new Error("round-trip failed: entry.txt bytes differ from the winner");
  }

  console.log(`winner (${[...winner.text].length} chars): ${winner.text}`);
  console.log(`wrote ${outPath}`);
}

main();
