const fs = require('fs');
const csv2array = require('csv-parse/lib/sync');
const mm = require("micromatch");

// express modules
const express = require('express');
const app = express();
const path = require('path');

// publish static files
app.use(express.static('public'));
app.use(express.static('resources'));

const mp = {
    def: {
        station: {}
    },

    loadDef: function() {
        var stationCsvArray = csv2array(fs.readFileSync(__dirname + '/resources/station.csv')),
            lineCsvArray = csv2array(fs.readFileSync(__dirname + '/resources/line.csv')),
            prefCsvArray = csv2array(fs.readFileSync(__dirname + '/resources/pref.csv')),
            lineMap = {}, prefMap = {};
            _self = this;
            
        // key:linecode, value:linename
        lineCsvArray.filter(function(elm, idx) {
            return (idx !== 0);
        }).forEach(function(elm) {
            lineMap[elm[0]] = elm[2];
        });

        // key:prefcode, value:prefname
        prefCsvArray.filter(function(elm, idx) {
            return (idx !== 0);
        }).forEach(function(elm) {
            prefMap[elm[0]] = elm[1];
        });

        // key:stationname(prefname)
        // value:{linename, lon, lat}
        stationCsvArray.filter(function(elm, idx) {
            return (idx !== 0);
        }).forEach(function(elm) {

            // 2byte brackets
            var nameWithPref = elm[2] + "（" + prefMap[elm[6]] + "）",
                linename = lineMap[elm[5]],
                lon = elm[9],
                lat = elm[10];

            _self.def.station[nameWithPref] = {
                linename: linename,
                lon: lon,
                lat: lat
            };
        });
    }
};

mp.loadDef();

// return static file sample
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/helloworld.html');
});

// return static file sample
app.get('/index', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});

// return static file sample
app.get('/inspection', function (req, res) {

    // 以下、動作確認用
    // mmでワイルドカードで、複数件の同一名駅を検索できることを確認
    Object.keys(req.query).forEach(function (key) {
        var stationname = req.query[key];
        console.log(mm.matchKeys(mp.def.station, stationname + "（*）"));
    });
    res.sendFile(__dirname + '/public/html/index.html');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});