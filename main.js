const fs = require('fs');
const csv2array = require('csv-parse/lib/sync');
const mm = require("micromatch");

// express modules
const express = require('express');
const app = express();
const path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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

// start point
app.get('/', function (req, res) {
    res.redirect("/index");
});
app.get('/index', function (req, res) {
    // res.sendFile(__dirname + '/public/html/index.html');

    // TODO: jade template test
    res.render("index2");
});

// requeat parameter = station1, station2, ..., station[1-9]+
app.get('/check/exist', function (req, res) {
    var notFoundStations = [];

    Object.keys(req.query).forEach(function (key) {
        var originStationname,
            tmpStationname, tmpDataset, tmpLength;

        // bad request parameter is not process
        if (!/station[1-9]+/.test(key)) {
            return true;
        }

        originStationname = tmpStationname = req.query[key];

        // if user input suffix "駅", remove it
        if(tmpStationname.slice(-1) === "駅") {
            tmpStationname = tmpStationname.slice(0, -1);
        }

        // do not get length cause tmpDataset is json format,
        // so get length from keys array
        tmpDataset = mm.matchKeys(mp.def.station, tmpStationname + "（*）");
        tmpLength = Object.keys(tmpDataset).length;

        if (tmpLength === 0) {
            notFoundStations.push(originStationname);
        }
    });

    res.header('Content-Type', 'application/json; charset=utf-8')
    res.send({
        notFoundStations: notFoundStations
    });
});

// TODO
app.get('/inspection', function (req, res) {
    var lon = 0.0, lat = 0.0;

    // TODO: 都道府県を確定するための処理を実装する
        // 都道府県違いの駅が一つでもある場合
            // 都道府県違いがある場合 ー＞ select要素作成
            // 都道府県違いがない場合 ー＞ input要素をhiddenで作成
            // 解決用のHTMLレンダリング
        // 都道府県違いの駅が一つもない場合
            // 検索へリダイレクト

    // TODO: 以下、動作確認用
    // mmでワイルドカードで、複数県の同一名駅を検索できることを確認
    // Object.keys(req.query).forEach(function (key) {
    //     var stationname = req.query[key];
    //     console.log(mm.matchKeys(mp.def.station, stationname + "（*）"));
    // });
    
    // TODO: 以下、動作確認用
    // どの駅名かユーザに選択させたあと、緯度経度の中点を求めるまで
    // Object.keys(req.query).forEach(function (key) {
    //     var stationname = req.query[key],
    //         dataset = mm.matchKeys(mp.def.station, stationname + "（*）"),
    //         datakey = Object.keys(dataset)[0];

    //         lon += parseFloat(dataset[datakey].lon);
    //         lat += parseFloat(dataset[datakey].lat);

    //         // 緯度経度が加算されていることの確認 
    //         console.log(lon + ", " + lat);
    // });

    // lon = lon / Object.keys(req.query).length;
    // lat = lat / Object.keys(req.query).length;

    // // 中点の確認
    // console.log(lon + ", " + lat);

    // // 全駅がどれ位離れているかを調べる
    // Object.keys(mp.def.station).forEach(function (key) {
    //     var data = mp.def.station[key],
    //         tmpLon = data.lon,
    //         tmpLat = data.lat,
    //         distance,
    //         radian = function(deg) {
    //             return deg * ( Math.PI / 180 );
    //         };

    //     // https://qiita.com/yangci/items/dffaacf424ebeb1dd643
    //     // tmpLat、tmplon〜lat、lon間のキロ数を求める計算
    //     distance = 6371 *
    //                 Math.acos(Math.cos(radian(lat)) *
    //                     Math.cos(radian(tmpLat)) *
    //                     Math.cos(radian(tmpLon) - radian(lon)) + Math.sin(radian(lat)) *
    //                     Math.sin(radian(tmpLat))
    //                 );
    //     // 例えば3キロ以内なら、以下のように判定する
    //     // 何キロにすればいいだろうか？
    //     if (distance <= 3) {
    //         console.log(key + ", " + distance);
    //     }
    // });

    res.sendFile(__dirname + '/public/html/index.html');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});