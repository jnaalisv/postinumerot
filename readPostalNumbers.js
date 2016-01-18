
var secret      = require('./secret.js');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : secret.host,
    user     : secret.user,
    password : secret.password,
    database : secret.database
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;

    console.log('Connected to database');
});

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
            postalCodeData.features.forEach(function(element) {
                var postalCodeToArea = element.properties;

                connection.query('INSERT INTO PostalCode SET ?', {postalCode: postalCodeToArea.posti_alue, areaName: postalCodeToArea.nimi}, function(err, result) {
                    if (err) throw err;
                });
            });

            connection.end();

            console.log('No more data in response.')
        })
        .on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
});

