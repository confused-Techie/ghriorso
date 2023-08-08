/**
 * Provided an array of seedLinks, as well as other options needed
 * for initializing a single crawler, this class can then manager as many
 * crawlers as length of seedLinks provided.
 */

const cuid = require("cuid");
const { Crawler } = require("crawler");

module.exports =
class CrawlerManager {
  constructor(opts = {}) {
    this.seedLinks = opts.seedLinks ?? [];
    this.seedKind = opts.seedKind;
    this.waitTime = opts.waitTime ?? 2000;
    this.failOpen = opts.failOpen ?? false;
    this.userAgent = opts.userAgent ?? `${process.os}/Crawler`;
    this.crawlLimits = opts.crawlLimits ?? 5;
    this.ranker = opts.ranker;

    this.crawlers = {};
    this.crawlersLimits = {};
    // We use a shared robots cache, to ensure we can keep it around
    this.sharedRobotsCache = opts.sharedRobotsCache ?? new Map();
  }

  init() {

    for (let i = 0; i < this.seedLinks.length; i++) {
      let id = cuid();
      this.crawlers[id] = new Crawler({
        userAgent: this.userAgent,
        waitTime: this.waitTime,
        failOpen: this.failOpen,
        robotsCache: this.sharedRobotsCache
      });

      this.crawlersLimits[id] = 0;

      this.handleCrawlerEvents(id, this.seedLinks[i]);
    }

  }

  handleCrawlerEvents(id, link) {
    let crawl = this.crawlers[id];

    crawl.init(link);

    crawl.emitter.on("crawling:failed", (data) => {
      console.error(`Crawling has failed!: ${data.toString()}`);
    });

    crawl.emitter.on("crawling:error", (err) => {
      console.error(`Crawling has had an error!: ${err.toString()}`);
    });

    crawl.emitter.on("crawling:done", () => {
      console.log(`${id} crawler has finished crawling!`);
    });

    crawl.emitter.on("crawling:crawled", (data) => {
      this.crawlersLimits[id]++;
      console.log("We have successfully crawled a URL!");

      let providedSeed = null;

      if (this.crawlersLimits[id] === 1) {
        // We only assign the seed on the first results returned. As those are
        // stemming from a properly seeded value
        // After the first seed link, they have no seed value
        providedSeed = this.seedKind;
      }

      this.ranker.ingestCrawlerData(data, providedSeed);

      if (this.crawlersLimits[id] === this.crawlLimits || this.crawlersLimits[id] > this.crawlLimits) {
        crawl.kill();
        console.log(`Called crawl.kill() on ${id}`);
      }
    });
  }

  async crawl() {
    for (let id in this.crawlers) {
      await this.crawlers[id].crawl();
    }
  }

}
