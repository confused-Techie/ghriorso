const fs = require("fs");

(async () => {

  const { Ghriosro } = require("./src/index.js");

  const trustLink = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status";
  const antitrustLink = "https://news.ycombinator.com/";

  const opts = {
    ranker: {
      carryingCapacity: 10,
      trustSteepness: 6,
      halfSteepPoint: 2
    },
    rankCache: {
      trustDefault: 11,
      antitrustDefault: -11,
      neutralDefault: 2,
      distanceFallback: 5
    },
    crawlerManager: {
      seedLinks: [],
      seedKind: null,
      waitTime: 2000,
      failOpen: false,
      userAgent: `${process.arch}/Ghriorso/Crawler-Test`,
      crawlLimits: 5
    }
  };

  // First seeding

  let gh = new Ghriosro({
    // Lots of default options to provide. All of which rather important
    ranker: opts.ranker,
    rankCache: opts.rankCache,
    crawlerManager: {
      seedLinks: [ trustLink ],
      seedKind: "trust",
      waitTime: opts.crawlerManager.waitTime,
      failOpen: opts.crawlerManager.failOpen,
      userAgent: opts.crawlerManager.userAgent,
      crawlLimits: opts.crawlerManager.crawlLimits
    }
  });

  gh.init();

  await gh.crawlerManager.crawl();

  // Now that all crawling has completed. Lets go ahead and take a look at our date
  // With the first thing we care about being our rankCache

  let persistentRankCache = gh.persistentRankCache;

  gh = null;

  gh = new Ghriosro({
    ranker: opts.ranker,
    rankCache: opts.rankCache,
    crawlerManager: {
      seedLinks: [ antitrustLink ],
      seedKind: "antitrust",
      waitTime: opts.crawlerManager.waitTime,
      failOpen: opts.crawlerManager.failOpen,
      userAgent: opts.crawlerManager.userAgent,
      crawlLimits: opts.crawlerManager.crawlLimits
    },
    persistentRankCache: persistentRankCache
  });

  gh.init();

  await gh.crawlerManager.crawl();

  fs.writeFileSync("rankCache.json", JSON.stringify(gh.persistentRankCache, null, 2), { encoding: "utf8" });
  fs.writeFileSync("crawlersCache.json", JSON.stringify(gh.crawlerManager.crawlersCache, null, 2), { encoding: "utf8" });
  fs.writeFileSync("rankerCache.json", JSON.stringify(gh.ranker.rankObjCache, null, 2), { encoding: "utf8" });

})();
