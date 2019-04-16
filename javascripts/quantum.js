// var categories = ["PRODUCT","ORG","PERSON","MONEY","PERCENT"];//["ORG","GPE","NORP","LOC","PERSON","PRODUCT","EVENT","FAC","MONEY","PERCENT"];

var topWords;
let self = null;
// var categoriesgroup ={
//     "NUMBER": ["MONEY","PERCENT"],
//     "EVENT":["PRODUCT","EVENT","LAW","DATE"],
//     "PERSON":["PERSON"],
//     "ORG":["ORG"],
//     "NATION":["GPE","LOC","FAC"]};
var categoriesgroup ={
    "Journals & Magazines": ["IEEE Journals & Magazines"],
    "Conferences":["IEEE Conferences"],
    "Early Access Articles":["IEEE Early Access Articles"]};
var wordsunvi = ["University",
    "Institute",
    "Univ.",
    "Inst.",
    "Inc.",
    "Paris-Dauphine",
    "IRCCyN",
    "Pacific Northwest National Laboratory",
    "Naval Research Lab"];
var color = d3v4.scaleOrdinal(d3v4.schemeCategory10);
var categories=[];
var outputFormat = d3v4.timeFormat('%Y');
var parseTime = (d => Date.parse(d));
var TermwDay,
    termscollection_org,
    ArticleDay,
    data,
    svg;
var lineColor = d3v4.scaleLinear()
    .domain([0,120])
    .range(['#558', '#000']);
// var x = d3v4.scalePoint();
var x = d3v4.scaleTime();
var wscale = 0.01;
var timeline;
var svgHeight = 1000;
var nodes2,links2;
var mainconfig = {
    subcategory:true,
    renderpic: false,
    wstep: 100,
    numberOfTopics: 10,
    rateOfTopics: 0.005,
    Isweekly: false,
    seperate: false,
    minfreq: 5,
    minlink:10,
};
var daystep = 365;
var startDate;
var endDate;


var opts = {
    lines: 7, // The number of lines to draw
    length: 10, // The length of each line
    width: 17, // The line thickness
    radius: 3, // The radius of the inner circle
    scale: 0.55, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#1687ff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 62, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '48%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    position: 'absolute' // Element positioning
};
var navbar;

// Get the offset position of the navbar
var sticky;

var target;
var spinner ;
function loadQuantum(draw, space){
    topWords = space;
    $(document).ready(function () {

        d3v4.queue()
            .defer(d3v4.csv,"data/QuantumComputing.csv")
            .await(ready);

        d3v4.select("#IsCitationCount").on("click",()=> {
            mainconfig.subcategory = !mainconfig.subcategory;
            if ( $("#IsCitationCount").hasClass('active') ) {
                $("#IsCitationCount").removeClass('active');
            } else {
                $("#IsCitationCount").addClass('active');
            }
            update();
        });
        d3v4.select("#IsWeekly").on("click",()=> {
            mainconfig.IsWeekly = !mainconfig.IsWeekly;
            if ( $("#IsWeekly").hasClass('active') ) {
                $("#IsWeekly").removeClass('active');
            } else {
                $("#IsWeekly").addClass('active');
            }
            update();
        });
        d3v4.select("#IsSeperate").on("click",()=> {
            mainconfig.seperate = !mainconfig.seperate;
            if ( $("#IsSeperate").hasClass('active') ) {
                $("#IsSeperate").removeClass('active');
            } else {
                $("#IsSeperate").addClass('active');
            }
            update();
        });
        //$('.sidenav').sidenav();

    });
}

function ready (error, dataf){
    console.log(dataf);
    //spinner = new Spinner(opts).spin(document.getElementById('timelinewImg'));
    if (error) throw error;
    //data = dataf;
    // format the data
    //data =data.filter(d=>d.source=="reuters");
    data = dataf.map(function(d) {
        var wregex = new RegExp(wordsunvi.join("|"),"g");
        var university =[];
        d["Author Affiliations"].split(";").forEach(e=>{
            e.split(",").forEach(t=>{
                if (t.match(wregex)!=null)
                    university.push({term: t,
                        category:  t.match(wregex),
                        category1:  t.match(wregex),
                        category2: t.match(wregex)});
            });
        });
        var ditem = {
            time: parseTime(~~d.Publication_Year),
            keywords: d["INSPEC Controlled Terms"].split(";").map(k=>
            {
                var citation = d["Article Citation Count"];
                var classcit = "UNKNOW";
                if (citation !=""){
                    citation = ~~citation;
                    if (citation<11)
                        classcit = "1-10";
                    else if (citation<101)
                        classcit = "10-100";
                    else
                        classcit = "<100";
                }
                return {term: k,
                    category:  d["Document Identifier"],
                    category1:  d["Document Identifier"],
                    category2: classcit}}).concat(university).concat(d["Authors"].split(";").map(a=>{
                return{term: a,
                    category:  "Author",
                    category1:  "Author",
                    category2: "Author"}
            })),
            title: d["Document Title"],
            author: d["Authors"].split(";"),
            source: d["Publisher"],
            urlToImage: "",
            link: d["PDF Link"]
        };
        return ditem;

    });
    data.sort((a,b)=> a.time-b.time);
    //data = data.filter(d=> d.time> parseTime('Apr 15 2018'));
    termscollection_org = blacklist(data,"category1");

    var listjson = {};
    d3v4.map(termscollection_org, function(d){return d.term;}).keys().forEach(d=>listjson[d]=null);
    $('#autocomplete-input').autocomplete( {
        data: listjson,
        limit: 100,
        minLength: 2,
    });
    // autocomplete(document.getElementById("theWord"), d3v4.map(termscollection_org, function(d){return d.term;}).keys());
    // document.getElementById("theWord").autocompleter({ source: data });
    setTimeout(function () {
        // do calculations
        // update graph
        // clear spinner
        handledata(data);
    }, 0);
}

function handledata(data){
    var termscollection = [];
    //sort out term for 1 article
    if (mainconfig.IsWeekly) {
        outputFormat =  (d) => {
            return d3v4.timeFormat('%Y')(d3v4.timeSunday(d))
        };
        daystep = 30;
        svgHeight = 1000;
        mainconfig.wstep = 15;
    }else {
        outputFormat =  d3v4.timeFormat('%Y');
        daystep = 365;
        svgHeight = 1000;
        mainconfig.wstep = 100;
    }
    if (mainconfig.subcategory){
        categoriesgroup ={
            "Unknown citation": ["UNKNOW"],
            "Have citation": ["1-10","10-100",">100"],
            "Affiliations": wordsunvi,
            "Author":["Author"]};
        termscollection_org = blacklist(data,"category2");
    }else {
        categoriesgroup ={
            "Journals & Magazines": ["IEEE Journals & Magazines"],
            "Conferences":["IEEE Conferences"],
            "Early Access Articles":["IEEE Early Access Articles"],
            "Affiliations": wordsunvi,
            "Author":["Author"]};
        termscollection_org = blacklist(data,"category1");
    }
    var nested_data;
    // let word = document.getElementById("theWord").value;

        nested_data = d3v4.nest()
            .key(function (d) {
                return d.title;
            })
            .key(function (d) {
                return d.term;
            })
            .rollup(function (words) {
                return {frequency: words.length, data: words[0]};
            })
            .entries(termscollection_org);

    termscollection.length = 0;
    nested_data.forEach(d=> d.values.forEach(e=> termscollection.push(e.value.data)));
    //sudden
    var nestedByTerm = d3v4.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return d.term; })
        .key(function(d) { return outputFormat(d.time); })
        .entries(termscollection);
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                var pre = 0;
                var preday = new Date(term.values[0].key);
                term.values.forEach(day => {
                    preday["setDate"](preday.getDate() + daystep);
                    if (preday.getFullYear() != new Date(day.key).getFullYear())
                        pre = pre==0?0:pre-1;
                    var sudden  = (day.values.length+1)/(pre+1);
                    day.values.forEach(e=> e.sudden = sudden);
                    pre = day.values.length;
                    preday = new Date(day.key);
                })
            }
        )
    );
    termscollection.length = 0;
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                term.values.forEach(day => {
                    day.values.forEach(e=> termscollection.push(e))
                })
            }
        )
    );
    nestedByTerm = d3v4.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return outputFormat(d.time); })
        .key(function(d) { return d.term; })
        .entries(termscollection);
    nestedByTerm.forEach(c=> c.values.forEach( day=>
        day.values.sort((a,b)=>b.values[0].sudden-a.values[0].sudden)));
    nestedByTerm.forEach(c=> c.values.forEach( day=>{
        // var numtake = Math.max(mainconfig.numberOfTopics,day.values.length*mainconfig.rateOfTopics);
        var numtake = mainconfig.numberOfTopics;
        day.values = day.values.slice(0,topWords)}));

    termscollection.length = 0;
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                term.values.forEach(day => {
                    day.values.forEach(e=> termscollection.push(e))
                })
            }
        )
    );
    console.log('cut by sudden: '+ termscollection.length);
    // done -sort
    termscollection.sort((a,b)=>a.time-b.time);
    nested_data = d3v4.nest()
        .key(function(d) { return outputFormat(d.time); })
        .key(function(d) { return d.category; })
        .key(function(d) { return d.term; })
        .rollup(function(words) { return {frequency: words.length,sudden: words[0].sudden,data:words}; })
        .entries(termscollection);

    //nested_data = nested_data.slice(1,nested_data.length-1);
    //slice data
    //nested_data = nested_data.filter(d=> parseTime(d.key)> parseTime('Apr 15 2018'));

    // ArticleByDay
    ArticleDay = d3v4.nest()
        .key(function(d) { return outputFormat(d.time); })
        .rollup(function(words) { return {articlenum: words.length,data:words}; })
        .entries(data);
    ArticleDay=ArticleDay.filter(d=> nested_data.find(e=> e.key === d.key));
    TermwDay = nested_data.map(d=>{
        var words = {};
        categories.forEach( topic =>
        {
            var w = d.values.filter(wf => wf.key === topic)[0];
            if (w !== undefined) {
                words[w.key] = w.values.map(
                    text => {
                        return {
                            text: text.key,
                            sudden: text.value.sudden,
                            topic: w.key,
                            frequency: text.value.frequency,
                            data: text.value.data,
                            date: d.key,
                            id: text.key.split(" ").join("").replace(/\.|\,|\(|\)|\;|\:|\!|\&|\?|\#|\"|\'/gi,'') + "_" + w.key.split(" ").join("").replace(/\.|\,|\(|\)|\;|\:|\!|\&|\?|\#|\"|\'/gi,'') + "_" + d.key
                        };
                    })
            }else{
                words[topic] =[];
            }
        });
        return {'date': d.key,
            'words': words};});
    startDate = TermwDay[0].date;
    endDate = TermwDay[TermwDay.length-1].date;
    console.log(startDate +" - "+endDate);
    //fillData(endDate, startDate);

    TermwDay = tfidf(TermwDay);
    gdata = TermwDay;
    draw(TermwDay);
}

function blacklist(data,category){
    var numterm =0;
    categories = Object.keys(categoriesgroup);
    var categoriesmap = {};
    for ( k in categoriesgroup)
        categoriesgroup[k].forEach(kk=> categoriesmap[kk]= k);
    var blackw =["TX","TWDB","&","&nbsp; "," ","today"];
    termscollection_org =[];
    data.forEach(d=>{
        d.keywords.filter(w => {
            numterm++;
            var key = false;
            //categories.forEach(c=> key = key || ((w.category==c)&&(blackw.find(d=>d==w.term)== undefined)));
            key = key || ((blackw.find(d=>d===w.term)== undefined)) && categoriesmap[w[category]]!= undefined ;
            return key;}).forEach( w => {
            w.maincategory = w[category];
            w.term = w.term.trim();
            w.category = categoriesmap[w[category]]||w[category];
            var e = w;
            e.time = d.time;
            e.title = d.title;
            if (e.term!="")
                termscollection_org.push(e)});
    });
    console.log("#org terms: " +numterm);
    console.log("#terms: " +termscollection_org.length);
    return termscollection_org;
}
