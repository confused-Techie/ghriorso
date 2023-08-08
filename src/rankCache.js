/**
 * This module is the RankCache for the Ranker module.
 * Simply being a class wrapper around accessing data about the object of every
 * possible sites ranking. This is intended to do the following:
 *  1. Make future modification easier, for when this cache becomes to large
 *     to keep in memory.
 *  2. Allow abstractions around the data format itself, to allow easy manipulation.
 *
 * The current implementation of this data will be the following:
 * Each item within the rank cache, will have it's key defined by the hostname
 * of the website. Within that will have the following values:
 *  - rank: The most important value. A score dipping into the negatives depicts
 *          an Anti-Trust ranking, meaning the site is untrustworthy.
 *          With a 0 rank being nuetral, -x being Anti-Trust, and +x being Trustworthy.
 *          Where of course the higher positive or negative the score indicating a stronger
 *          direction either way.
 *  - seed: This indicates the type of seed the page was initially. Consisting of either
 *          'trust', 'antitrust', or 'null' if the page was not a seed page at all.
 *  - distanceFromSeed: This value indicates how far any page is from it's initial seed value.
 *                      Where this value is continually updated to it's lowest possible value.
 *                      Where '0' is the lowest possible distance, indicating the page
 *                      itself is a seed page. And any value above that is how far it is from the seed, in nodes.
 */

module.exports =
class RankCache {
  constructor(opts = {}) {
    this.cache = opts.cache ?? {};
    this.trustDefault = opts.trustDefault ?? 1;
    this.antitrustDefault = opts.antitrustDefault ?? -1;
    this.neutralDefault = opts.neutralDefault ?? 0.25;
    this.distanceFallback = opts.distanceFallback ?? 5;
  }

  rankForSeed(seed) {
    // Returns the ranking assigned to a given seed
    switch(seed) {
      case "trust":
        return this.trustDefault;
      case "antitrust":
        return this.antitrustDefault;
      default:
        // The seed assigned to any non-seeded page
        return this.neutralDefault;
    }
  }

  seedDistance(link) {
    // Determines the distance of a given page, from it's seed
    if (typeof this.cache[link] === "object") {
      return this.cache[link].distanceFromSeed;
    } else {
      // The link doesn't exist. So we can't reliably determine it's seed distance.
      // We maybe want to throw here? Or do some investigation to a known solution
      // Or maybe use link anylisis to determine what's best to automatically assign?
      // TODO: For now, lets return 5, my gut likes it
      return this.distanceFallback;
    }
  }

  registerLink(link, seed, linkedFrom) {
    if (typeof this.cache[link] === "object") {
      // This link is already registered. So we could return, but lets make sure
      // this link isn't being assigned as a seed
      if (typeof seed !== "string") {
        // No seed assignment here. Lets return
        return;
      } else {
        // This page is newly being assigned a seed. So lets reflect that
        this.cache[link].seed = seed;
      }
    }

    // This link doesn't yet exist. So lets add it
    if (typeof seed === "string") {
      // We have been provided a new seed page, lets initialize it as such
      this.cache[link] = {
        rank: this.rankForSeed(seed),
        seed: seed,
        distanceFromSeed: 0
      };

    }

    // The page doesn't exist, but is not a seed page. So we will want to use `linkedFrom` to determine seed distance
    this.cache[link] = {
      rank: this.rankForSeed(null),
      seed: null,
      distanceFromSeed: this.seedDistance(linkedFrom) + 1
    };
  }

  /** Utility Functions **/
  getPageRank(link) {
    if (typeof this.cache[link] === "object") {
      return this.cache[link].rank;
    } else {
      // This item doesn't yet exist.
      this.registerLink(link, null, null);
      return this.cache[link].rank;
    }
  }

  setPageRank(link, rank) {
    this.cache[link].rank = rank;
  }

  getSeedDistance(link) {
    if (typeof this.cache[link] === "object") {
      return this.cache[link].distanceFromSeed;
    } else {
      // Link doesn't exist, will assign it
      this.registerLink(link, null, null);
      return this.cache[link].distanceFromSeed;
    }
  }

  setSeedDistance(link, distanceFromSeed) {
    this.cache[link].distanceFromSeed = distanceFromSeed;
  }
}
