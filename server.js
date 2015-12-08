//NewsForHumans BOT!!!!



var request = require('request');
var _ = require('underscore.deferred');
var Twit = require('twit');
var T = new Twit(require('./config.js'));

var options = {
    url: 'https://www.kimonolabs.com/api/YOUR_KEY',
    headers: {
        'User-Agent': 'request'
    }
};

function getHeadlines() {
    var headlines = [];
    var dfd = new _.Deferred();
    request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var info = JSON.parse(body);
            for (i = 0; i < info.results.collection1.length; i++) {
    
                headlines.push(info.results.collection1[i].news.text);

            };

            dfd.resolve(headlines);
        } else {
            dfd.reject();
        }
    });
    return dfd.promise();

}

function stringyDingy() {

    var dfd = new _.Deferred();
    var string;

    getHeadlines().then(function(headlines) {


        var string = headlines.join(".");

        dfd.resolve(string);

    });

    return dfd.promise();
}

var cache = {
    '_START': []
};

function tweet() {

    stringyDingy().then(function(string) {

        var text = string.split(/\s+/g);

        cache['_START'].push(text[0]);

        for (var i = 0; i < text.length - 1; i++) {
            if (!cache[text[i]])
                cache[text[i]] = [];
            cache[text[i]].push(text[i + 1]);

            if (text[i].match(/\.$/))
                cache['_START'].push(text[i + 1]);
        }

        var currentWord = '_START';
        var str = '';

        for (var i = 0; i < 600; i++) {

            var rand = Math.floor(Math.random() * cache[currentWord].length);
            str += cache[currentWord][rand];

            if (!cache[cache[currentWord][rand]]) {
                currentWord = '_START';


                if (!cache[currentWord][rand].match(/\.$/)) {
                    str += '. ';
                } else {
                    str += ' ';

                }
            } else {
                currentWord = cache[currentWord][rand];
                str += ' ';
            }

        }

        var chopped = str.split(/\.+/g);

        var markovArray = [];

        for (i = 0; i < chopped.length; i++) {

            var stringed = chopped[i].toString()

            if ((stringed.length < 127) && (stringed.length > 10)) {

                markovArray.push(chopped[i]);


            } else {
                console.log("tweet too long, trying again")
            }
        }

        var status = (markovArray[Math.floor(Math.random() * markovArray.length)] + ". ") + "#BreakingNews" + " http://bit.ly/BreakinNews";

        T.post('statuses/update', {
            status: status
        }, function(err, reply) {

            if (err) {
                console.log('error', err);
            } else {
                console.log('reply', reply);
            }

        });
    });
}


tweet();

setInterval(function() {
    try {
        tweet();
    } catch (e) {
        console.log(e);
    }
}, 60000 * 30);
