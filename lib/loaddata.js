function loadBlogPostData(draw, space){
    var topics = [];
    d3.tsv(fileName, function(error, rawData) {
        if (error) throw error;
        var inputFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        var outputFormat = d3.time.format('%b %Y');
        topics = categories;
        //Filter and take only dates in 2013
        // rawData = rawData.filter(function(d){
        //     var time = Date.parse(d.time);
        //     var startDate =  inputFormat.parse('2011-06-01T00:00:00');
        //     var endDate = inputFormat.parse('2013-07-01T00:00:00');
        //     //2011 for CrooksAndLiars
        //     if(fileName.indexOf("Liars")>=0){
        //         startDate = inputFormat.parse('2010-01-01T00:00:00');
        //         endDate = inputFormat.parse('2010-07-01T00:00:00');
        //     }
        //     return      time  >= startDate && time < endDate;
        //
        // });
        var data = {};
        d3.map(rawData, function(d, i){
            var date = Date.parse(d.time);
            date = outputFormat(new Date(date));
            topics.forEach(topic => {
                if(!data[date]) data[date] = {};
                data[date][topic] = data[date][topic] ? (data[date][topic] + '|' +d[topic]): (d[topic]); 
            });
        });
        var data = d3.keys(data).map(function(date, i){
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
                        sudden: 0,
                        text: d,
                        frequency: counts[d],
                        topic: topic
                    }
                })
                    .sort(function(a, b){//sort the terms by frequency
                    return b.frequency-a.frequency;
                }).filter(function(d){return d.text; });//filter out empty words
                words[topic] = words[topic].slice(0, Math.min(words[topic].length, space));

                // words[topic] = words[topic].slice(0, Math.min(words[topic].length, 100));
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
        // var sub = d3.keys(data[0].words).map(d => d);
        // for (let i = 0; i < data.length; i ++){
        //     for (let j in sub){
        //         data[i].words[sub[j]].sort(function(a, b){//sort the terms by frequency
        //             return b.sudden-a.sudden;
        //         }).filter(function(d){return d.text; })//filter out empty words
        //          .slice(0, Math.min(data[i].words[sub[j]].length, space));
        //     }
        // }
        draw(data);
    });
}

function processSuddenFreq(data){
    // let word0 = [], word1 = [];
    let subjects = d3.keys(data[0].words);
    for (let i = 1; i < data.length; i++){      // loop timestep
        for (let j in subjects){
            // word0 = data[i-1].words[subjects[j]];
            // word1 = data[i].words[subjects[j]];

            data[i].words[subjects[j]].forEach((d1) => {
                data[i-1].words[subjects[j]].forEach((d0) => {
                    if (d1.text === d0.text){
                        console.log("Hi");
                        d1.sudden = (d1.frequency + 1) / (d0.frequency + 1);
                    }
                })
            })

        }
    }
    return data;

};

function loadAuthorData(draw, space){
    var topics = categories;
    d3.tsv(fileName, function(error, rawData) {
        if (error) throw error;
        //Filter
        
        rawData = rawData.filter(d=>{
            return d.Year;
        });
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
                        topic: topic
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
        draw(data);
    });
}

function loadCS(draw, space){
    var topics = categories;
    d3.tsv(fileName, function(error, rawData) {
        if (error) throw error;
        //Filter
        var startYear = 2001;

        rawData = rawData.filter(d=>{       // filter
            return d.Year >= startYear;
        });
        var data={};
        d3.map(rawData, function(d, i){
            var year = +d["Year"];
            var topic = d["Topic"];
            if(!data[year]) data[year] = {};
            data[year][topic] = (data[year][topic]) ? ((data[year][topic])+";" + d["Title"]): (d["Title"]);
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
                        topic: topic
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
        draw(data);
    });
}