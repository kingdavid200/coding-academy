/**
 * True while `next build` is running. During the build the production database
 * (e.g. Cloud SQL on a private network) is not reachable, so data-backed
 * metadata routes skip their queries and fall back to static output.
 */
export const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
