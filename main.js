const fs = require("fs");
const csv2array = require("csv-parse/lib/sync");
const mm = require("micromatch");
const log4js = require("log4js");

// express modules
const express = require("express");
const app = express();
const path = require("path");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// publish static files
app.use(express.static("public"));
app.use(express.static("resources"));

// hoge
const mp = {
    logger: null,

    def: {
        station: {}
    },

    loadDef: function() {
        var stationCsvArray = csv2array(fs.readFileSync(__dirname + "/resources/station.csv")),
            lineCsvArray = csv2array(fs.readFileSync(__dirname + "/resources/line.csv")),
            prefCsvArray = csv2array(fs.readFileSync(__dirname + "/resources/pref.csv")),
            lineMap = {}, prefMap = {};
            _self = this;
            
        // key:linecode, value:lineName
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

        // key:stationName(prefname)
        // value:{lineName, lon, lat}
        stationCsvArray.filter(function(elm, idx) {
            return (idx !== 0);
        }).forEach(function(elm) {

            // 2byte brackets
            var nameWithPref = elm[2] + "（" + prefMap[elm[6]] + "）",
                lineName = lineMap[elm[5]],
                lon = elm[9],
                lat = elm[10];

            if(!_self.def.station[nameWithPref]) {
                _self.def.station[nameWithPref] = {
                    lineName: [lineName],
                    lon: lon,
                    lat: lat
                };
            } else {
                _self.def.station[nameWithPref].lineName.push(lineName);
            }
        });
    },

    logError: function(status, path, param) { 
        var errorMsg = {
            status: status,
            path: path,
            param: param
        };

        if (!this.logger) {
            log4js.configure({
                appenders: {
                    error: {
                        type: "file",
                        filename: "log/error.log",
                        maxLogSize: 10000,
                        backups: 2,
                    }
                },
                 categories: {
                    default: {
                        appenders: ["error"],
                        level: "error"
                    }
                }
            });

            this.logger = log4js.getLogger("error");
        }

        this.logger.error(JSON.stringify(errorMsg));  
    },

    // get station object considering of suffix "駅"
    // return format is below
    // {
    //     stationName(prefName1): {
    //         lineName: xxx,
    //         lon: xxx,
    //         lat: xxx
    //     },
    //     stationName(prefNameX): {
    //         lineName: xxx,
    //         lon: xxx,
    //         lat: xxx
    //     }
    // }
    getStationFuzzy: function(stationName) {
        var _stationName = stationName;

        // first, exact match and break
        if (this.def.station[_stationName]) {
            return mm.matchKeys(this.def.station, _stationName);
        }

        // if user input suffix "駅", remove it
        if(_stationName.slice(-1) === "駅") {
            _stationName = _stationName.slice(0, -1);
        }

        return mm.matchKeys(this.def.station, _stationName + "（*）");
    }
};

mp.loadDef();

// simple link
app.get("/", function (req, res) {
    res.redirect("/index");
});
app.get("/index", function (req, res) {
    res.render("index");
});
app.get("/contact", function (req, res) {
    res.render("contact");
});
app.get("/poricy", function (req, res) {
    res.render("poricy");
});
app.get("/information", function (req, res) {
    res.render("information");
});

app.get("/check/autocomplist", function (req, res) {
    var keyword = req.query["keyword"];

    res.header("Content-Type", "application/json; charset=utf-8")
    res.send({
        // response forword match station names
        autocomplist: Object.keys(mm.matchKeys(mp.def.station, keyword + "*"))
    });
});

app.get("/check/exist", function (req, res) {
    var notFoundStations = [];

    Object.keys(req.query).forEach(function (key) {
        var stationName, tmpDataset, tmpLength;

        // bad request parameter is not process
        if (!/station[1-9]+/.test(key)) {
            return true;
        }

        stationName = req.query[key];
        tmpDataset = mp.getStationFuzzy(stationName);

        // do not get length cause tmpDataset is json format,
        // so get length from keys array
        tmpLength = Object.keys(tmpDataset).length;

        if (tmpLength === 0) {
            notFoundStations.push(stationName);
        }
    });

    res.header("Content-Type", "application/json; charset=utf-8")
    res.send({
        notFoundStations: notFoundStations
    });
});

app.get("/inspection", function (req, res) {
    var candidates = [],
        requireResolution = false,
        url;

    Object.keys(req.query).forEach(function (queryKey) {
        var stationName, candidateStationNames;

        // bad request parameter is not process
        if (!/station[1-9]+/.test(queryKey)) {
            return true;
        }

        stationName = decodeURIComponent(req.query[queryKey]);
        candidateStationNames = Object.keys(mp.getStationFuzzy(stationName));

        candidates.push({
            userInputStationName: stationName,
            candidateStationNames: candidateStationNames
        });

        if (!requireResolution && candidateStationNames.length >= 2) {
            requireResolution = true;
        }
    });

    if (requireResolution) {
        res.render("inspection", {
            candidates: candidates
        });
    } else {
        url = "search?";

        candidates.forEach(function(elm, idx) {
            url += "station" + (idx + 1) + "=" + encodeURIComponent(elm.candidateStationNames[0]);

            if (idx !== (candidates.length - 1)) {
                url += "&";
            }
        });

        res.redirect(url);
    }
});

app.get("/search", function (req, res) {
    var lon = 0.0, lat = 0.0,
        middlePointStations = [], userInputStations = [];

    // calculate middle point
    Object.keys(req.query).forEach(function (key) {
        var stationName, stationData;

            // bad request parameter is not process
            if (!/station[1-9]+/.test(key)) {
                return true;
            }

            stationName = decodeURIComponent(req.query[key]);
            userInputStations.push(stationName);
            stationData = mp.def.station[stationName];

            lon += parseFloat(stationData.lon);
            lat += parseFloat(stationData.lat);
    });

    lon = lon / userInputStations.length;
    lat = lat / userInputStations.length;

    // calculate distancea between each station and middle point
    Object.keys(mp.def.station).some(function (key) {
        var stationData = mp.def.station[key],
            tmpLon = stationData.lon,
            tmpLat = stationData.lat,
            radian = function(deg) {
                return deg * ( Math.PI / 180 );
            },
            kmDist;

        // calculate km distance
        kmDist = 6371 * Math.acos(Math.cos(radian(lat)) *
                            Math.cos(radian(tmpLat)) *
                            Math.cos(radian(tmpLon) - radian(lon)) +
                            Math.sin(radian(lat)) *
                            Math.sin(radian(tmpLat))
                        );

        // within 300km radius, because the width of Japan is roughly like that
        if (kmDist <= 300) {
            middlePointStations.push({
                stationName: key,
                lineName: stationData.lineName,
                kmDist: kmDist,
                lon: tmpLon,
                lat: tmpLat
            });
        }
    });

    // sort with distance
    middlePointStations.sort(function(a, b) {
        return (a.kmDist - b.kmDist);
    });

    // trim length
    if (middlePointStations.length > 5) {
        middlePointStations = middlePointStations.slice(0, 5);
    }

    // trim lineName
    middlePointStations.forEach(function(stationData) {
        var lineNameArray = stationData.lineName;

        if (lineNameArray.length > 3) {
            lineNameArray = lineNameArray.slice(0, 3);
            lineNameArray.push("等");
        }

        stationData.lineName = lineNameArray.join(", ");
    });

    // trim inputStations
    userInputStations = userInputStations.join(", ");

    res.render("result", {
        middlePointStations: middlePointStations,
        userInputStations: userInputStations
    });
});

// 404 error
app.use(function(req, res, next){
    mp.logError(404, req.path, req.query);
    res.status(404);
    res.render("error", {
        status: 404,
        msg: req.path + "は存在しないパスです。"
    });
});

//500 error
app.use(function(err, req, res, next){
    mp.logError(500, req.path, req.query);
    res.status(500);
    res.render("error", {
        status: 500,
        msg: "サーバー内部エラーです。申し訳ありません。"
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log("start port: " + PORT);
});
// app.listen(9000, function () {
//     console.log("start");
// });