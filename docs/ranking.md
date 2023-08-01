# Ranking within Ghriorso


This application will use a custom mix of PageRank, TrustRank, and AntiTrustRank. Described as PageRank with Logistic Growth of TrustRank and AntiTrustRank.

The ranking process begins by supplying a set of seed pages, these can either be a `trust` seed or `antitrust` seed.

From there, like PageRank, the amount of links on any given page (to unique hostnames) is considered in the final ranking, as well as the distance of any given page from it's initial seed is considered.

This will result in a page attaining a total `rank` that can be a negative or positive number, where `0` is true neutral, `-x` is an AntiTrust ranking, and `+x` is a Trust ranking. Any page thought to be trustworthy must have a positive ranking.

The idea behind the formula laid out here is that each page receives it's default ranking, which as increased based on whoever linked to it, accounting for however many links were on that original page. Which is accounted for to reduce the chances of spam pages linking out to many pages to gain trustworthiness. This is also then increased by it's trust distance. A logistic growth curve based on the distance the link is from it's original seed page, since it's thought that if a trustworthy page links directly to another location, that secondary location is extremely trustworthy, whereas the further you get away from this, the less of an effect this should have. But to avoid the edges of a seeds link being penalized for distance, which distance from the seed doesn't mean it's untrustworthy it only means we are unsure of their trustworthiness, so the curve will taper off to a more neutral value at the edges of a seeds crawling. The trust distance alone would provide an S-Curve distribution of a high ranking, while incorporating PageRank on top of that ensures trustworthiness is determined by the 'community' of surrounding links.

The formula for determining a page ranking would look something like this:

Where:
* Page **B**, **C**, and **D** all link to page **A**
* `PR` equals the ranking of the page
* `L` equals the total value of unique hostnames linked to on any given page
* `SD` is the distance of any page from it's original seed.
* `l` Is the carrying capacity of the trustworthiness score
* `e` is Euler's number, the base of natural logarithms
* `k` is a constant that determines the steepness of the curve
* `d0` is the distance at which the trustworthiness score is half of `l`
* `trust` seed pages are initialized at rank `1`, `antitrust` seeds are initialized at rank `-1`, and all other pages are initialized as `0.25`.

```javascript

const trustDistance = (page) => {
  return l / ( 1 + e^( -k( SD(page) - d0 )))
};

const PR(A) = initial_ranking + ( PR(B) / L(B) + trustDistance(B) ) + ( PR(C) / L(C) + trustDistance(C) ) + ( PR(D) / L(D) + trustDistance(D) );

```
