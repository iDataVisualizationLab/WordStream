var gdata, minYear, maxYear, numMonth, totalData;

var topics = ["person","location","organization","miscellaneous"];
function getTop(suddenData, top){
    suddenData.forEach((data) => {
        topics.forEach((topic) => {
            data["words"][topic] = data["words"][topic]
                .slice(0,top);
        })
    });
    return suddenData;
}

function loadBlogPostData(draw, space, links, timeArcs){
    var topics = [];
    d3.tsv(fileName, function(error, rawData) {
        if (error) throw error;
        var inputFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        var outputFormat = d3.time.format('%b %Y');
        topics = categories;
        //Filter and take only dates in 2013
        //
        rawData = rawData.filter(function(d){
            var time = Date.parse(d.time);
            var startDate =  inputFormat.parse('2011-12-01T00:00:00');
            // var endDate = inputFormat.parse('2013-07-01T00:00:00');
            var endDate = inputFormat.parse('2013-01-01T00:00:00');

            //2011 for CrooksAndLiars
            if(fileName.indexOf("Liars")>=0){
                startDate = inputFormat.parse('2010-01-01T00:00:00');
                endDate = inputFormat.parse('2010-07-01T00:00:00');
            }
            return time  >= startDate && time < endDate;

        });
        var data = {};
        d3.map(rawData, function(d, i){
            var date = Date.parse(d.time);
            date = outputFormat(new Date(date));
            topics.forEach(topic => {
                if(!data[date]) data[date] = {};
                data[date][topic] = data[date][topic] ? (data[date][topic] + '|' +d[topic]): (d[topic]);
            });
        });

        data = d3.keys(data).map(function(date, i){
            var words = {};
            topics.forEach(topic => {
                var raw = {};
                raw[topic] = data[date][topic].split('|');
                //Count word frequencies
                var counts = raw[topic].reduce(function(obj, word){
                    if(!obj[word]){
                        obj[word] = 0;
                    }
                    obj[word]++;
                    return obj;
                }, {});
                //Convert to array of objects
                words[topic] = d3.keys(counts).map(function(d){
                    return{
                        sudden: 1,
                        text: d,
                        frequency: counts[d],
                        topic: topic,
                        id: d.split(".").join("_").split(" ").join("_") + "_" + topic + "_" + (i-1)
                    }
                })
                    .sort(function(a, b){//sort the terms by frequency
                    return b.frequency-a.frequency;
                }).filter(function(d){return d.text; });//filter out empty words
                 words[topic] = words[topic].slice(0, 30);

                // Uncomment above line if processSuddenFreq()
            });
            return {
                date: date,
                words: words
            }
        }).sort(function(a, b){//sort by date
            return outputFormat.parse(a.date) - outputFormat.parse(b.date);
        });

        // processSuddenFreq(data);
        //
        // var sub = d3.keys(data[0].words);
        //
        // for (var i = 0; i < data.length; i ++){
        //     for (var j in sub){
        //         data[i].words[sub[j]].sort(function(a, b){//sort the terms by frequency
        //             return b.sudden-a.sudden;
        //         }).filter(function(d){return d.text; })//filter out empty words
        //     }
        // }
        //
        // totalData = JSON.parse(JSON.stringify(data));   // all timestep, include sudden
        // crop top:
        data = getTop(data, space);

        data = data.slice(1);
        // minYear = data[1]["date"].slice(-4);
        // maxYear = parseInt(data[data.length-1]["date"].slice(-4)) + 1;
        // numMonth = 12*(maxYear-minYear);

        // data = tfidf(data);
        gdata = JSON.parse(JSON.stringify(data));

        draw(data);

        //timeArcs();

    });
}

function loadAuthorData(draw, space, timeArcs){
    var topics = categories;
    d3.tsv(fileName, function(error, rawData) {
        if (error) throw error;
        //Filter
        //Filter
        var startYear = 2007;
        var endYear = 2016;
        if(fileName.indexOf("PopCha")>=0 || fileName.indexOf("Cards_Fries")>=0 || fileName.indexOf("Cards_PC")>=0){
            startYear = 2007;
            endYear = 2013;
        }
        rawData = rawData.filter(d=>{
            return d.Year >= startYear && d.Year <= endYear;
        });

        // rawData = rawData.filter(d=>{
        //     return d.Year;
        // });
        var data={};
        d3.map(rawData, function(d, i){
            var year = +d["Year"];
            var topic = d["Conference"];
            if(!data[year]) data[year] = {};
            data[year][topic] = (data[year][topic]) ? ((data[year][topic])+";" + d["Author Names"]): (d["Author Names"]);
        });
        var data = d3.keys(data).map(function(year, i){
            var words = {};
            topics.forEach(topic => {
                var raw = {};
                if(!data[year][topic]) data[year][topic] = "";
                raw[topic] = data[year][topic].split(";");
                //Count word frequencies
                var counts = raw[topic].reduce(function(obj, word){
                        if(!obj[word]){
                            obj[word] = 0;
                        }
                        obj[word]++;
                        return obj;
                }, {});
                //Convert to array of objects
                words[topic] = d3.keys(counts).map(function(d){
                    return{
                        text: d,
                        frequency: counts[d],
                        topic: topic,
                        sudden: 1,
                        id: d.split(".").join("_").split(" ").join("_") + "_" + topic + "_" + (i-1)
                    }
                }).sort(function(a, b){//sort the terms by frequency
                    return b.frequency-a.frequency;
                }).filter(function(d){return d.text; })//filter out empty words
                .slice(0, space);
            });
            return {
                date: year,
                words: words
            }
        }).sort(function(a, b){//sort by date
            return a.date - b.date;
        });

        processSuddenFreq(data);

        var sub = d3.keys(data[0].words).map(d => d);
        for (var i = 0; i < data.length; i ++){
            for (var j in sub){
                data[i].words[sub[j]].sort(function(a, b){//sort the terms by frequency
                    return b.sudden-a.sudden;
                }).filter(function(d){return d.text; })//filter out empty words
                data[i].words[sub[j]]=data[i].words[sub[j]].slice(0, Math.min(data[i].words[sub[j]].length, space));
            }
        }

        // Uncomment below for enabling TimeArc

        data = data.slice(1);
        minYear = data[1]["date"].slice(-4);
        maxYear = parseInt(data[data.length-1]["date"].slice(-4)) + 1;
        numMonth = 12*(maxYear-minYear);

        data = tfidf(data);

        gdata = JSON.parse(JSON.stringify(data));
        console.log("data: ");
        console.log(gdata);
        t1Load = performance.now();
        console.log("Load data took " + (t1Load - t0Load) + " milliseconds.");

        draw(data);
        //timeArcs();

    });
}

function tfidf(data){
    var topics = d3.keys(data[0]["words"]);
    // get total frequency for each month -> tf
    var docFreq = [];
    var bags = [];
    data.forEach((month,i) => {
        docFreq[i] = 0;
        bags[i] = [];
        var words = month["words"];
        topics.forEach(topic => {
            words[topic].forEach((d) => {
                docFreq[i] += d["frequency"];
                bags[i].push(d["text"]);
            })
        })
    });

    // idf
    var N = data.length;
    var text;
    data.forEach((month,i) => {
        var words = month["words"];
        topics.forEach(topic => {
            words[topic].forEach((d) => {
                text = d["text"];
                var df = 0;
                // calculate df in bags
                bags.forEach((bag) => {
                    for (var word in bag){
                        if (bag[word] == text){
                            df += 1;
                            break;
                        }
                    }
                });

                var tf = d["frequency"]/docFreq[i];
                var idf = Math.log10(N/df);

                d.tf_idf = tf*idf;

            })
        })
    });
    return data;
}

function processSuddenFreq(data){
    const subjects = d3.keys(data[0].words);
    subjects.forEach((topic, i) => {
        for (let j = 1; j < data.length; j++){
            data[j]["words"][topic].forEach((word, k) => {
                var prev = 0;
                if (data[j-1]["words"][topic].find(d => d.text === word.text)){
                    prev = data[j-1]["words"][topic].find(d => d.text === word.text).frequency;
                }
                word.sudden = (word.frequency + 1) / (prev + 1)
            })
        }
    });
}