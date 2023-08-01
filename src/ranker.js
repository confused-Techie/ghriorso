/**
 * This module really does the heavy lifting for the entire application.
 * Here we receive new page details, and begin the process of ranking
 * the URLs we receive.
 * This module should only operate on the basis of websites. Not caring for specific
 * paths. But if the domain, subdomain, or port are different then they should be
 * considered different websites.
 */

const { URL } = require("node:url");
const RankCache = require("./rankCache.js");

module.exports =
class Ranker {
  constructor(opts) {
    this.carrying_capacity = opts.carrying_capacity;
    this.trust_steepness = opts.trust_steepness;
    this.half_steep_point = opts.half_steep_point;
    this.rankCache = opts.rankCache ?? new RankCache();
  }

  /**
   * @name rankLink
   * @memberof Ranker
   * @description Ranks any single given link
   * @param {string} link - The link to rank
   * @param {string} seed - The base seed, if any. Either 'trust' or 'antitrust'.
   * Otherwise 'null'.
   * @param {string} linkedFrom - The link that links directly to this link.
   * @param {integer} linksOnPageCount - The amount of links on the page that
   * links directly to this one.
   */
  rankLink(link, seed, linkedFrom, linksOnPageCount) {
    this.rankCache.registerLink(link, seed, linkedFrom);
    // Now that we are sure the basic data of the ranking exists in our rank cache
    // lets go ahead and calculate what it's actual ranking should be.

    const trustDistance = (page) => {
      return linksOnPageCount / ( 1 + Math.E^( -this.trust_steepness * ( this.rankCache.seedDistance(page) - this.half_steep_point )));
    };

    let newRank = this.rankCache.getPageRank(link) + ( this.rankCache.getPageRank(linkedFrom) / linksOnPageCount + trustDistance(link) );

    this.rankCache.setPageRank(link, newRank);
  }

  ingestCrawlerData(data, seed) {
    // This method intakes directly returned crawler data, and the seed type.
    // The seed type can be 'null' if not the initial seed value.

    /**
     * To intake this data we will need to extract out all links within the page.
     * Then resolve them to hostname only, and remove duplicates
     * finally registering the initial link, with it's seed value, then providing
     * all linked to pages to the proper `rankLink` method
     */

    let rankObj = {
      initialLink: "",
      links: [],
      totalLinkCount: 0
    };

    // Now to begin transforming the data
    for (let i = 0; i < data.lonelyLinks.length; i++) {
      let origin = new URL(lonelyLinks[i]).origin;

      if (!rankObj.links.includes(origin)) {
        rankObj.links.push(origin);
      }
    }

    for (let node in data.textLinks) {
      let origin = new URL(data.textLinks[node]).origin;

      if (!rankObj.links.includes(origin)) {
        rankObj.links.push(origin);
      }
    }

    rankObj.initialLink =  new URL(data.pageURL).origin;
    rankObj.totalLinkCount = rankObj.links.length;

    // Now with our rankObj lets go ahead and register the first link, with it's seed.
    // Then provide the rest of these ingested normally.
    // An aside, and possible TODO; The first ever added link will have no existing references
    // and will only receive the default ranking. This should be fine, but while the
    // flow of this makes it appear that the initialLink of any given set of links will
    // always only receive default ranking, because of the fact that any initialLink here
    // that is not the seed link should have been previously ranked from it's existance in the seed
    // links set, means it will already have a ranking. And registering an already ranked
    // link will result in zero change. So this registering should only ever result
    // in the original seed link receiving the default ranking. As we would want.
    this.rankCache.registerLink(rankObj.initialLink, seed, null);

    for (let i = 0; i < rankObj.links.length; i++) {
      this.rankLink(rankObj.links[i], null, rankObj.initialLink, rankObj.totalLinkCount);
    }

    return;

  }
}
