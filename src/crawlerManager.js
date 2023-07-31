/**
 * Provided an array of seedLinks, as well as other options needed
 * for initializing a single crawler, this class can then manager as many
 * crawlers as length of seedLinks provided.
 */
module.exports =
class CrawlerManager {
  constructor(opts = {}) {
    this.seedLink = opts.seedLinks ?? [];
    this.waitTime = opts.waitTime ?? 2000;
    this.failOpen = opts.failOpen ?? false;
    this.ranker = opts.ranker;
  }
}
