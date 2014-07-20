/**
 * Created by nathanyam on 26/04/2014.
 */

exports.dollarParser = function (key, attribute) {
    return function (info) {
        var animeInfo = info.ann.anime[0].info[0],
            animeInfoArray = [];

        function recur() {
            Object.keys(animeInfo).map(function (element) {
                if (animeInfo[element].length !== undefined && Array.isArray(animeInfo[element])) {
                    animeInfo[element].filter(function (arrayElement) {
                        return arrayElement.$[key] !== undefined;
                    }).forEach(function (e) {
                        animeInfoArray.push(e.$[key]);
                    });
                }
                if (element === '$') {
                    if (animeInfo[element][key] !== undefined) {
                        animeInfoArray.push(animeInfo[element][key]);
                    }
                }
            });
        }

        recur();

        info[attribute] = animeInfoArray;
    };
};

exports.underscoreParser = function (type) {
    var key = type.toLowerCase().replace(/\s/g, '_');
    return function (data) {
        var animeInfo = data.ann.anime[0].info,
            resultArray = animeInfo.reduce(function (prev, curr) {
                if (curr.$.type && curr.$.type === type) {
                    prev.push(curr._);
                }
                return prev;
            }, []);

        data[key] = resultArray;
    };
};

exports.voiceActParser = function (data) {
    var castInfo = data.ann.anime[0].cast;

    data.cast = castInfo.filter(function (e) {
        return e.$.lang === 'JA';
    }).reduce(function (prev, cur) {
        prev.push({
            character: cur.role.length == 1 ? cur.role[0] : cur.role,
            seiyuu: cur.person[0]._,
            seiyuu_id: cur.person[0].$.id
        });
        return prev;
    }, []);
};

exports.numberOfEpisodeParser = function (data) {
    if (data.ann.anime[0].episode !== undefined) {
        data.number_of_episodes = data.ann.anime[0].episode.length;
    } else {
        data.number_of_episodes = 'N/A';
    }
};



