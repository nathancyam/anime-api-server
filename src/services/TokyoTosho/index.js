const FeedParser = require('feedparser');
const request = require('request');
const Fuse = require('fuse.js');

function fetchRss(url, mapCallback) {
  return new Promise((resolve, reject) => {
    const req = request(url);
    const feedParserStream = new FeedParser([]);

    req.on('error', err => {
      return reject(err);
    });

    req.on('response', function (res) {
      if (res.statusCode !== 200) {
        return reject(new Error(`Could not resolve ${url}`));
      } else {
        this.pipe(feedParserStream)
      }
    });

    feedParserStream.on('error', err => {
      return reject(err);
    });

    let results = [];
    feedParserStream.on('readable', function () {
      let item;
      while (item = this.read()) {
        results = results.concat([ mapCallback(item) ]);
      }
    });

    feedParserStream.on('end', () => {
      return resolve(results);
    })
  });
}


class TokyoToshoFetcher {

  constructor() {
    this.cancel = setInterval(() => this.fetch({ invalidate: true }), 1000 * 60 * 60 * 6);
    this.cache = [];
  }

  fetch(options = { invalidate: false }) {
    if (!options.invalidate && this.cache.length !== 0) {
      return Promise.resolve(this.cache);
    }

    this.cache = [];
    return fetchRss('https://www.tokyotosho.info/rss.php?filter=1&entries=450', (item) => {
      return item;
    }).then(results => {
      this.cache = results;
      return this.cache;
    });
  }

  search(name) {
    const searchOpt = { keys: ['title'] };

    return this.fetch()
      .then(results => {
        const fuse = new Fuse(results, searchOpt);
        return fuse.search(name);
      });
  }
}

module.exports = TokyoToshoFetcher;
