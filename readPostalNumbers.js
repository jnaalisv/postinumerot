var fs = require('fs');

var http = require('http');
var options = {
    hostname: 'geo.stat.fi',
    path: '/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=postialue:pno&outputFormat=json',
    port: 80
};

// The optional callback parameter will be added as a one time listener for the 'response' event.
http.get(options, function(res) {
    console.log('RESPONSE STATUS: ' + res.statusCode);

    var body = '';
    res
        .on('data', function(chunk) {
            body += chunk;
        }).on('end', function() {
            var postalCodeData = JSON.parse(body);

            var stream = fs.createWriteStream("postalCodes.sql");
            stream.once('open', function(fd) {
                postalCodeData.features.forEach(function(element) {
                    var postalCodeToArea = element.properties;
                    stream.write("INSERT INTO PostalCode(postalCode, areaName) VALUES (\'"+postalCodeToArea.posti_alue+"\',\'"+postalCodeToArea.nimi+"\');\n");
                });
                stream.end();
            });

            console.log('No more data in response.')
        })
        .on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
});

