
const Ranker = require("./ranker.js");
const RankCache = require("./rankCache.js");
const CrawlerManager = require("./crawlerManager.js");

module.exports =
class Ghriosro {
  constructor(opts = {}) {
    // Options
    if (!opts.hasOwnProperty("ranker")) {
      opts.ranker = {};
    }
    this.rankerOpts = {
      carrying_capacity: opts.ranker.carryingCapacity,
      trust_steepness: opts.ranker.trustSteepness,
      half_steep_point: opts.ranker.halfSteepPoint,
      rankCache: null
    };

    if (!opts.hasOwnProperty("rankCache")) {
      opts.rankCache = {};
    }
    this.rankCacheOpts = {
      trustDefault: opts.rankCache.trustDefault,
      antitrustDefault: opts.rankCache.antitrustDefault,
      neutralDefault: opts.rankCache.neutralDefault,
      distanceFallback: opts.rankCache.distanceFallback,
      cache: {}
    };

    if (!opts.hasOwnProperty("crawlerManager")) {
      opts.crawlerManager = {};
    }
    this.crawlerManagerOpts = {
      waitTime: opts.crawlerManager.waitTime,
      failOpen: opts.crawlerManager.failOpen,
      userAgent: opts.crawlerManager.userAgent,
      crawlLimits: opts.crawlerManager.crawlLimits,
      ranker: null,
      seedKind: opts.crawlerManager.seedKind ?? null,
      seedLinks: opts.crawlerManager.seedLinks ?? [],
      sharedRobotsCache: null
    };

    this.ranker;
    this.rankCache;
    this.crawlerManager;

    this.sharedRobotsCache = new Map();
    this.persistentRankCache = opts.persistentRankCache ?? {};
  }

  init() {

    this.rankCacheOpts.cache = this.persistentRankCache;

    this.rankCache = new RankCache(this.rankCacheOpts);

    this.rankerOpts.rankCache = this.rankCache;

    this.ranker = new Ranker(this.rankerOpts);

    this.crawlerManagerOpts.ranker = this.ranker;
    this.crawlerManagerOpts.sharedRobotsCache = this.sharedRobotsCache;

    this.crawlerManager = new CrawlerManager(this.crawlerManagerOpts);

    // Init calls
    this.crawlerManager.init();
  }


}
