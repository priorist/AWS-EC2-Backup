'use strict';


var main = require('./');
var conf = require('./conf');


main.handler(conf, null, function(err, result)
{
    if (err) {
        console.error(err);
        process.exit(1);
    }

    if (typeof result != 'undefined') {
        console.log(result);
    }
});
