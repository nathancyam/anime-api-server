/**
 * Created by nathan on 5/18/14.
 */

/*jslint node: true */
"use strict";
var http = require('http'),
    url = require('url'),
    request = require('request'),
    cheerio = require('cheerio'),
    NT = require('nyaatorrents');

var NTWrapper = module.exports = function () {
    var baseUrl = "http://www.nyaa.se/";

    return {
        search: function (query, cb) {
            var self = this,
                nt = new NT();

            var uri = url.parse(baseUrl, true);

            if (typeof query === "function") {
                cb = query;
                query = null;
            }

            query = query || {};

            for (var k in query) {
                uri.query[k] = query[k];
            }

            uri.query.page = "search";

            request({uri: url.format(uri)}, function (err, res, data) {
                if (err) {
                    return cb(err);
                }

                var $ = cheerio.load(data);

                // Check if we are on a torrent page
                if (($('form').attr('action')).indexOf("tid") !== -1) {
                    var gid = $("form").attr("action").split("tid=").pop();
                    return self.getSingleTorrent(gid, cb);
                } else {
                    return nt.search(query, cb);
                }
            });
        },
        getSingleTorrent: function (id, cb) {
            var self = this;
            http.request(url.parse("http://www.nyaa.se/?page=view&tid=" + id), function (res) {
                var data = '';
                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function () {
                    self.parseData(id, data, cb);
                });
            }).end();
        },
        parseData: function (id, data, cb) {
            var $ = cheerio.load(data);
            var content = $(".content")[0];

            // When there's an error, it's displayed as text in the spot where the page
            // content would usually go. We pass that through as-is to the user.
            if (content.children.length === 1 && content.children[0].type === "text") {
                return cb(Error(ent.decode(content.children[0].data).trim()));
            }

            var obj = {};

            // These are things like "trusted" or "remake". See [the NyaaTorrents manual](http://www.nyaa.se/?page=manual)
            // for more information.
            obj.flags = content.attribs.class.split(/ /g).filter(function (e) {
                return e !== "content";
            });

            // Categories. Super simple stuff. These are lower-cased, hyphen-delimited,
            // human-readable strings.
            obj.categories = Array.prototype.slice.apply($(content).find("td.viewcategory a")).map(function (e) {
                return $(e).text().toLowerCase().trim().replace(/\s+/g, "-");
            });

            // The torrent details are displayed in a wonky table thing. Each field is
            // displayed as a pair of cells, with the former containing the field name
            // and the latter displaying the field value. Based on the name, we do some
            // field-specific transformations on some fields. Others just get passed on
            // through as text.
            var tds = $(content).find("table.viewtable tr > td");

            for (var i = 0; i < tds.length; i += 2) {
                // This is the field name.
                var k = $(tds[i]).text().replace(/:$/, "").replace(/\s+/g, "_").trim().toLowerCase();

                switch (k) {
                    // "information" is basically synonymous with "website"
                    case "information":
                        var link = $(tds[i + 1]).find("a");
                        if (link.length)
                            obj.website = link[0].attribs.href;
                        break;

                    // "file_size" is exactly what it sounds like, and it has to be turned
                    // into a real number.
                    case "file_size":
//                    obj.size = filesize_parser($(tds[i+1]).text().trim());
                        break;

                    // This is the user that submitted the torrent. We parse it out into the
                    // separate `id` and `name` values.
                    case "submitter":
                        obj.user = {
                            id: parseInt($(tds[i + 1]).find("a")[0].attribs.href.replace(/^.+?(\d+)$/, "$1"), 10),
                            name: $(tds[i + 1]).text()
                        };
                        break;

                    // This might not work on anything except V8. Will have to check that
                    // if this ever works on anything except node.
                    case "date":
                        obj.date = new Date($(tds[i + 1]).text());
                        break;

                    // The "stardom" field just displays the number of people who've set
                    // themselves as "fans" of this torrent. I don't really know what the
                    // deal is here.
                    case "stardom":
                        obj.fans = parseInt($(tds[i + 1]).text().replace(/^.+(\d+).+$/, "$1"), 10);
                        break;

                    // All these need to be turned to real numbers instead of strings.
                    case "seeders":
                    case "leechers":
                    case "downloads":
                        obj[k] = parseInt($(tds[i + 1]).text(), 10);
                        break;

                    // Anything not otherwise handled is just sent through as text.
                    default:
                        obj[k] = $(tds[i + 1]).text();
                }
            }

            // This is the torrent ID... You already have it, but this seemed like a
            // good idea for completeness.
            obj.id = parseInt(id);
            if ($(content).find("div.viewdownloadbutton a").length !== 0) {
                obj.id = parseInt($(content).find("div.viewdownloadbutton a")[0].attribs.href.replace(/^.+?(\d+)$/, "$1"), 10);
            }

            // This is a chunk of HTML. You'll probably want to turn it into some other
            // kind of markup.
            obj.description = $($(content).find("div.viewdescription")[0]).html();

            // Yay comments!
            obj.comments = [];

            var commentElements = $(content).find(".comment");

            // Each of these will have a blob of HTML as the "content". Same deal as
            // above with the description.
            for (var i = 0; i < commentElements.length; ++i) {
                obj.comments.push({
                    id: parseInt(commentElements[i].attribs.id.replace(/[^0-9]/g, ""), 10),
                    time: $(commentElements[i]).find(".chead").html().split(/<br>/).pop(),
                    user: {
                        id: parseInt($(commentElements[i]).find(".chead > a")[0].attribs.href.replace(/^.+?([0-9])$/, "$1"), 10),
                        name: $(commentElements[i]).find(".chead > a > span").text()
                    },
                    content: $(commentElements[i]).find(".cmain").html()
                });
            }

            return cb(null, obj);
        }
    };
};

