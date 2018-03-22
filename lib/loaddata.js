function loadEmptyWheelData(draw){
    var url = "./data/emptywheel.csv";
    var topics = [];
    d3.csv(url, function(error, rawData) {
        if (error) throw error;
        var inputFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');
        var outputFormat = d3.time.format('%b %Y');
        topics = d3.keys(rawData[0]).slice(2, 6);
        //Filter and take only dates in 2013
        rawData = rawData.filter(function(d){
            var time = inputFormat.parse(d.time);
            var starDate =  inputFormat.parse('2013-01-01T00:00:00');
            var endDate = inputFormat.parse('2013-07-01T00:00:00');
            return      time  >= starDate && time < endDate; 
        });
        var data = {};
        d3.map(rawData, function(d, i){
            var date = inputFormat.parse(d.time);
            var date = outputFormat(date);
            topics.forEach(topic => {
                if(!data[date]) data[date] = {};
                data[date][topic] += data[date][topic] ? ('|' +d[topic]): (d[topic]); 
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
                        text: d,
                        frequency: counts[d],
                        topic: topic
                    }
                }).sort(function(a, b){//sort the terms by frequency
                    return b.frequency-a.frequency;
                }).filter(function(d){return d.text; })//filter out empty words
                .slice(0, 30);
            });
            return {
                date: date,
                words: words
            }
        }).sort(function(a, b){//sort by date
            return outputFormat.parse(a.date) - outputFormat.parse(b.date);
        });
        draw(data);
    });
}
function loadIEEEVisData(draw){
    var url = "./data/IEEE VIS papers 1990-2016 - Main dataset.csv";
    var topics = [];
    var stopwords = "i|me|my|myself|we|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|s|t|can|will|just|don|should|now";
    d3.csv(url, function(error, rawData) {
        if (error) throw error;
        
        topics = ['Authors'];
        //topics = ['PaperType', 'Authors', 'Keywords'];
        var data = {};
        var splitters = {
            'Authors': ';',
            'Keywords': ';'
        };
        rawData = rawData.filter(d=>{
            return d.Year >= 2009 && d.Year <= 2016;
        });
        d3.map(rawData, function(d, i){
            var year = +d.Year;
            if(!data[year]) data[year] = {};
            topics.forEach(topic =>{
                //If it is title then remove stop words
                if(topic==='Title'){
                    d[topic] = d[topic].replace(new RegExp('\\b('+stopwords+')\\b', 'g'), '');
                    //Remove multiple spaces
                    d[topic] = d[topic].replace(/\s+/g, ' ');
                }
                data[year][topic] += data[year][topic] ? (splitters[topic] + d[topic]): (d[topic]);
            });            
        });
        var data = d3.keys(data).map(function(year, i){
            var words = {};
            topics.forEach(topic => {
                var raw = {};
                if(topic === 'Title'){
                    raw[topic] = data[year][topic].match(/("[^"]+"|[^"\s]+)/g);
                }else{
                    raw[topic] = data[year][topic].split(splitters[topic]);
                }
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
                .slice(0, 30);
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