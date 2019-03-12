// pre-defined size
var initWidth = 2350,
    initHeight = 1000,
    initMinFont = 17,
    initMaxFont = 32,
    initFlag = "none",// none / fa/ f / a
    topRank, topRankUpdate;

var svg = d3.select("body").append('svg')
    .attr({
    width: initWidth,
    height: initHeight,
    id: "mainsvg",
});

var mainGroup, axisGroup, xGridlinesGroup, opacScale, legendGroup;

// var fileList = ["WikiNews","Huffington","CrooksAndLiars","EmptyWheel","Esquire","FactCheck"
//                 ,"VIS_papers","IMDB","PopCha","Cards_PC","Cards_Fries"]

var fileList = ["QuantumComputing",
    // "ACLED", "H.E.A.T.Map", "GTD",
    "WikiNews", "Huffington", "CrooksAndLiars", "EmptyWheel","Esquire","FactCheck","VIS_papers", "IMDB","PopCha","Cards_PC","Cards_Fries"
];

var initialDataset = "EmptyWheel";
var categories = ["person","location","organization","miscellaneous"];

var fileName;

addDatasetsOptions();
function addDatasetsOptions() {
    var select = document.getElementById("datasetsSelect");
    for(var i = 0; i < fileList.length; i++) {
        var opt = fileList[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el["data-image"]="images2/datasetThumnails/"+fileList[i]+".png";
        select.appendChild(el);
    }
    document.getElementById('datasetsSelect').value = initialDataset;  //************************************************
    fileName = document.getElementById("datasetsSelect").value;
    loadData();
}
var spinner;
function loadData(){
    // START: loader spinner settings ****************************
    var opts = {
        lines: 25, // The number of lines to draw
        length: 15, // The length of each line
        width: 5, // The line thickness
        radius: 25, // The radius of the inner circle
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 2, // Rounds per second
        trail: 50, // Afterglow percentage
        className: 'spinner', // The CSS class to assign to the spinner
    };
    var target = document.getElementById('loadingSpinner');
    spinner = new Spinner(opts).spin(target);
    // END: loader spinner settings ****************************

    if (fileName.indexOf("Cards_Fries")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["increases_activity", "decreases_activity"];
        loadAuthorData(draw, topRank200()
            ,drawTimeArcs
        );

    }
    else if (fileName.indexOf("Cards_PC")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["adds_modification", "removes_modification", "increases","decreases", "binds", "translocation"];
        loadAuthorData(draw, topRank200()
            , drawTimeArcs
        );
    }
    else if (fileName.indexOf("PopCha")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["Comedy","Drama","Action", "Fantasy", "Horror"];
        loadAuthorData(draw, topRank200()
            , drawTimeArcs
        );

    }
    else if (fileName.indexOf("IMDB")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["Comedy","Drama","Action", "Family"];
        loadAuthorData(draw, topRank45()
            , drawTimeArcs
        );

    }
    else if (fileName.indexOf("VIS")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["Vis","VAST","InfoVis","SciVis"];
        loadAuthorData(draw, topRank45()
            , drawTimeArcs
        );

    }
    else if (fileName.indexOf("QuantumComputing")>=0){
        fileName = "data/"+fileName+".tsv"; // Add data folder path
        categories = ["Unknown citation","Have citation","Affiliations","Author"];
        loadQuantum(draw, 20);

    }
    else{
        fileName = "data/"+fileName+".tsv";
        categories = ["person","location","organization","miscellaneous"];
        loadBlogPostData(draw, topRank45()
            , drawTimeArcs
        );

    }
}
function loadNewData(event) {
    svg.selectAll("*").remove();
    // svg2.selectAll("*").remove();
    // svg3.selectAll("*").remove();
    fileName = this.options[this.selectedIndex].text;
    topRank=undefined;
    loadData();
    d3.selectAll(".topRank").remove();
    updateTopRank();
}

function drawTimeArcs(){
    timeArcs()
}
function draw(data){
    var width = initWidth  ;
    var height = initHeight;
    var font = "Arial";
    var interpolation = "cardinal";
    var bias = 200;
    var offsetLegend = -10;
    var axisPadding = 10;
    var margins = {left: 20, top: 20, right: 10, bottom: 30};
    var ws = d3.layout.wordStream()
        .size([width, height])
        .interpolate(interpolation)
        .fontScale(d3.scale.log())
        .minFontSize(initMinFont)
        .maxFontSize(initMaxFont)
        .data(data)
        .font(font)
        .flag(initFlag);
    var boxes = ws.boxes(),     // initial boxes
        minFreq = ws.minFreq(),
        maxFreq = ws.maxFreq(),
        minSud = ws.minSud(),
        maxSud = ws.maxSud()
    ;

    //Display data
    var legendFontSize = 20;
    var legendHeight = boxes.topics.length*legendFontSize;
    //set svg data.
    svg.attr({
        width: width + margins.left + margins.top,
        height: height + margins.top + margins.bottom + axisPadding + offsetLegend + legendHeight
    });

    var area = d3.svg.area()
        .interpolate(interpolation)
        .x(function(d){return (d.x);})
        .y0(function(d){return d.y0;})
        .y1(function(d){return (d.y0 + d.y); });

    // function color(n) {
    //     var colores = ["#008fd0", "#FC660F", "#489d4c", "#E00D37", "#8D6BB8", "#85584E" , "#8d6bb8", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eae"];
    //     return colores[n % colores.length];
    // }

    var color = d3.scale.category10();
    //Display time axes
    var dates = [];
    boxes.data.forEach(row =>{
        dates.push(row.date);
    });

    var xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, width]);
    var xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);
    axisGroup = svg.append('g').attr('transform', 'translate(' + (margins.left) + ',' + (height+margins.top+axisPadding+legendHeight+offsetLegend) + ')');
    var axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);
    //Display the vertical gridline
    var xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length+1)).rangeBands([0, width+width/boxes.data.length]);
    var xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);

    xGridlinesGroup = svg.append('g')
        .attr('transform', 'translate(' + (margins.left-width/boxes.data.length/2) + ',' + (height+margins.top + axisPadding+legendHeight+margins.bottom+offsetLegend) + ')');

    var gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-height-axisPadding-legendHeight-margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    //Main group
    mainGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')').attr("id", "mainGroup");
    var wordStreamG = mainGroup.append('g');

    // // =============== Get BOUNDARY and LAYERPATH ===============
    // var lineCardinal = d3.svg.line()
    //     .x(function(d) { return d.x; })
    //     .y(function(d) { return d.y; })
    //     .interpolate("cardinal");
    //
    // var boundary = [];
    // for (var i = 0; i < boxes.layers[0].length; i ++){
    //     var tempPoint = Object.assign({}, boxes.layers[0][i]);
    //     tempPoint.y = tempPoint.y0;
    //     boundary.push(tempPoint);
    // }
    //
    // for (var i = boxes.layers[boxes.layers.length-1].length-1; i >= 0; i --){
    //     var tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length-1][i]);
    //     tempPoint2.y = tempPoint2.y + tempPoint2.y0;
    //     boundary.push(tempPoint2);
    // }       // Add next (8) elements
    //
    // var lenb = boundary.length;
    //
    // // Get the string for path
    //
    // var combined = lineCardinal( boundary.slice(0,lenb/2))
    //     + "L"
    //     + lineCardinal( boundary.slice(lenb/2, lenb))
    //         .substring(1,lineCardinal( boundary.slice(lenb/2, lenb)).length)
    //     + "Z";
    //
    //
    // // ============== DRAW CURVES AREA =================
    // var topics = boxes.topics;
    // mainGroup.selectAll('path')
    //     .data(boxes.layers)
    //     .enter()
    //     .append('path')
    //     .attr('d', area)
    //     .style('fill', function (d, i) {
    //         return color(i);
    //     })
    //     .attr({
    //         'fill-opacity': 0,      // = 1 if full color
    //        // stroke: 'black',
    //         'stroke-width': 0.3,
    //         topic: function(d, i){return topics[i];}
    //     });
    // // ============= Get LAYER PATH ==============
    // var layerPath = mainGroup.selectAll("path").append("path")
    //     .attr("d", combined )
    //     .attr({
    //         'fill-opacity': 0.1,
    //         'stroke-opacity': 0,
    //     });
    // ARRAY OF ALL WORDS
    var allWords = [];
    d3.map(boxes.data, function(row){
        boxes.topics.forEach(topic=>{
            allWords = allWords.concat(row.words[topic]);
        });
    });

    if (fileName.indexOf("Huffington") >= 0) {
        d3.json("data/linksHuff2012.json", function (error, rawLinks) {
            const threshold = 5;
            const links = rawLinks.filter(d => d.weight > threshold);

            links.forEach(d => {
                d.sourceID = d.sourceID.split(".").join("_").split(" ").join("_");
                d.targetID = d.targetID.split(".").join("_").split(" ").join("_");
            });
            let visibleLinks = [];

            // select only links with: word place = true and have same id
            links.forEach(d => {
                let s = allWords.find(w => (w.id === d.sourceID) && (w.placed === true));
                let t = allWords.find(w => (w.id === d.targetID) && (w.placed === true));
                if ((s !== undefined) && (t !== undefined)) {
                    d.sourceX = s.x;
                    d.sourceY = s.y;
                    d.targetX = t.x;
                    d.targetY = t.y;
                    visibleLinks.push(d);
                }
            });

            const lineScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 3]);

            opacScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 1]);

            mainGroup.selectAll(".connection")
                .data(visibleLinks)
                .enter()
                .append("line")
                .attr("class", "connection")
                .attr("opacity", 0)
                .attr({
                    "x1": d => d.sourceX,
                    "y1": d => d.sourceY,
                    "x2": d => d.targetX,
                    "y2": d => d.targetY,
                    "stroke": "#444444",
                    "stroke-opacity": d => opacScale(d.weight),
                    "stroke-width": d => lineScale(d.weight)
                });

            drawWords();
        });
    }
    else drawWords();

    function drawWords() {

    var opacity = d3.scale.log()
        .domain([minSud, maxSud])
        .range([0.4,1]);

    // Add moi chu la 1 element <g>, xoay g dung d.rotate
    var placed = true; // = false de hien thi nhung tu ko dc dien

    //  ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ PLACING WORDS  ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿

    mainGroup.selectAll('.word').data(allWords).enter().append('g')
        .attr({transform: function(d){return 'translate('+d.x+', '+d.y+')rotate('+d.rotate+')';}})
        .attr("class", "word")
        .append('text')
        .text(function(d){return d.text;})
        .attr({
            "id": d => d.id,
            'font-family': font,
            'font-size': function(d){return d.fontSize;},
            fill: function(d){return color(d.topicIndex);},
           'fill-opacity': function(d){return opacity(d.sudden)},
           // 'fill-opacity': 0,
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
            topic: function(d){return d.topic;},
            visibility: function(d){ return d.placed ? ("visible"): ("hidden");}
        });



    mainGroup.selectAll(".connection").on("mouseover", function () {
        var thisLink = d3.select(this);
        thisLink.style('cursor', 'crosshair');
         // in order to select by byid, the id must not have space
        var sourceText = mainGroup.select("#" + thisLink.data()[0].sourceID);
        var prevSourceColor = sourceText.attr("fill");
        var targetText = mainGroup.select("#" + thisLink.data()[0].targetID);
        var prevTargetColor = targetText.attr("fill");

        thisLink.attr("stroke-width", 4);

        sourceText.attr({
            stroke: prevSourceColor,
            fill: prevSourceColor,
            'stroke-width': 1.5
        });

        targetText.attr({
            stroke: prevTargetColor,
            fill: prevTargetColor,
            'stroke-width': 1.5
        });
    });

        mainGroup.selectAll(".connection").on("mouseout", function () {
            var thisLink = d3.select(this);
            thisLink.style('cursor', 'crosshair');

            var sourceText = mainGroup.select("#" + thisLink.data()[0].sourceID);
            var targetText = mainGroup.select("#" + thisLink.data()[0].targetID);

            thisLink.attr("stroke-width", d => opacScale(d.weight));

            sourceText.attr({
                stroke: 'none',
                'stroke-width': 0
            });

            targetText.attr({
                stroke: 'none',
                'stroke-width':0
            });
        });

    // When click a term
    //Try
    var prevColor;
    // --- Highlight when mouse enter ---
    mainGroup.selectAll('text').on('mouseenter', function(){  // hover above the word -> select this
        var thisText = d3.select(this);
        thisText.style('cursor', 'pointer');
        prevColor = thisText.attr('fill');

        var text = thisText.text();
        var topic = thisText.attr('topic');
        var allTexts = mainGroup.selectAll('text').filter(t =>{
            return t && t.text === text &&  t.topic === topic;
        });
        allTexts.attr({
            stroke: prevColor,
            fill: prevColor,
            'stroke-width': 1.5
        });
    });

    // --- Lowlight when mouse out ---
    mainGroup.selectAll('text').on('mouseout', function(){
        var thisText = d3.select(this);
        thisText.style('cursor', 'default');
        var text = thisText.text();
        var topic = thisText.attr('topic');
        var allTexts = mainGroup.selectAll('text').filter(t =>{
            return t && !t.cloned && t.text === text &&  t.topic === topic;
        });
        allTexts.attr({
            stroke: 'none',
            'stroke-width': '0'
        });
    });
    //Click
    mainGroup.selectAll('text').on('click', function(){
        var thisText = d3.select(this);
        var text = thisText.text();
        var topic = thisText.attr('topic');
        var allTexts = mainGroup.selectAll('text').filter(t =>{     // group of all the same words
            return t && t.text === text &&  t.topic === topic;
        });

        // get the word out
        // Select the data for the stream layers
        var streamLayer = d3.select("path[topic='"+ topic+"']" )[0][0].__data__; // at this time: not available

        //Push all points
        var points = Array();
        //Initialize all points
        streamLayer.forEach(elm => {
            points.push({
                x: elm.x,
                y0: elm.y0+elm.y,
                y: 0//zero as default
            });
        });
        allTexts[0].forEach(t => {      // for each TEXT
            var data = t.__data__;
            var fontSize = data.fontSize;
            //The point
            var thePoint = points[data.timeStep+1];//+1 since we added 1 to the first point and 1 to the last point.
            thePoint.y = -data.streamHeight;
            //Set it to visible.
            //Clone the nodes.
            var clonedNode = t.cloneNode(true);
            d3.select(clonedNode).attr({        // add attribute to the cloned node
                visibility: "visible",
                stroke: 'none',
                'stroke-size': 0,
            });
            var clonedParentNode = t.parentNode.cloneNode(false);   // clone ca parent nua -_- empty
            clonedParentNode.appendChild(clonedNode);

            t.parentNode.parentNode.appendChild(clonedParentNode);  // append clonedParent vao grandparent
            d3.select(clonedParentNode).attr({
                cloned: true,
                topic: topic
            }).transition().duration(300).attr({
                transform: function(d, i){return 'translate('+thePoint.x+','+(thePoint.y0+thePoint.y-fontSize/2)+')';},
            });
        });
        //Add the first and the last points
        points[0].y = points[1].y;//First point
        points[points.length-1].y = points[points.length-2].y;//Last point
        //Append stream
        wordStreamG.append('path')
            .datum(points)
            .attr('d', area)
            .style('fill', prevColor)
            .attr({
                'fill-opacity': 1,
                stroke: 'black',
                'stroke-width': 0.3,
                topic: topic,
                wordStream: true
            });
        //Hide all other texts
        var allOtherTexts = mainGroup.selectAll('text').filter(t =>{
            return t && !t.cloned &&  t.topic === topic;
        });
        allOtherTexts.attr('visibility', 'hidden');
    });


    topics.forEach(topic=>{
        d3.select("path[topic='"+ topic+"']" ).on('click', function(){
            mainGroup.selectAll('text').filter(t=>{
                return t && !t.cloned && t.placed && t.topic === topic;
            }).attr({
                visibility: 'visible'
            });
            //Remove the cloned element
            document.querySelectorAll("g[cloned='true'][topic='"+topic+"']").forEach(node=>{
                node.parentNode.removeChild(node);
            });
            //Remove the added path for it
            document.querySelectorAll("path[wordStream='true'][topic='"+topic+"']").forEach(node=>{
                node.parentNode.removeChild(node);
            });
        });

    });

    //Build the legends
    legendGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + (height+margins.top+offsetLegend) + ')');
    var legendNodes = legendGroup.selectAll('g').data(boxes.topics).enter().append('g')
        .attr('transform', function(d, i){return 'translate(' + 30 + ',' + (i*legendFontSize+5) + ')';});
    legendNodes.append('circle').attr({
        r: 6,
        fill: function(d, i){return color(i);},
        'fill-opacity': 1,
        stroke: 'black',
        'stroke-width': .5,
    });
    legendNodes.append('text').text(function(d){return d;}).attr("class","legendValue").attr({
        'font-size': legendFontSize,
        'alignment-baseline': 'middle',
        dx: 15, dy: 3

    });

    // ========== Write to box =======

    // var metValue = [getTfidf(allWords).toFixed(2),
    //     getCompactness(allWords, layerPath)[0].toFixed(2),
    //     getCompactness(allWords, layerPath)[1].toFixed(2),
    //     getDisplayRate(allWords, maxFreq)[0].toFixed(2),
    //     getDisplayRate(allWords, maxFreq)[1].toFixed(3)];
    //
    // metric2.selectAll(".metricValue").remove();
    // metric2.selectAll(".metricValue")
    //     .data(metValue)
    //     .enter()
    //     .append("text")
    //     .text(d => d)
    //     .attr("class","metricValue metricDisplay")
    //     .attr("x","0")
    //     .attr("y",(d,i) =>43+ 36*i)
    //     .attr("font-weight", "bold");

spinner.stop();

}};
function getTfidf(allWords){
    var sumTfidfDisplayed = 0;
    var sumTfidf = 0;
    allWords.forEach(function (d) {
        sumTfidf += d.tf_idf;
        if (d.placed){
            sumTfidfDisplayed += d.tf_idf;
        }
    });

    return sumTfidfDisplayed/sumTfidf;
}

function getCompactness(allWords, layerPath){

    var usedArea = 0, allWordsArea = 0,
        totalArea, compactness,
        ratio;

    var threshold = 1;        // ignore this size of area

    allWords.forEach(function (d) {
        allWordsArea += (d.heightBBox * d.widthBBox);
        if (d.placed){
            usedArea += (d.heightBBox * d.widthBBox);
        }
    });

    var poly = pathToPolygonViaSubdivision(layerPath,threshold);

    totalArea = polyArea(poly);         // area of stream
    compactness = usedArea/totalArea;
    ratio = allWordsArea/totalArea;

    return [compactness, ratio];
}
function getDisplayRate(allWords, maxFreq){
    // ======== DISPLAY RATES ===========
    var displayFreq_1 = 0,        // sum of Display Freqs
        totalFreq_1 = 0;          // total of freq for top 30

    var displayNormFreq_2 = 0,    // sum of Normalized Display Freqs
        numbers_2 = 0;       // number of words displayed

    var norm = d3.scale.linear().domain([0, maxFreq]).range([0,1]);
    allWords.forEach(function (d) {
        totalFreq_1 += d.frequency;
        if (d.placed){
            displayFreq_1 += d.frequency;

            numbers_2 += 1;
            displayNormFreq_2 += norm(d.frequency);

        }
    });

    var weightedRate = displayFreq_1 / totalFreq_1;
    var averageNormFreq = displayNormFreq_2 / numbers_2;

    console.log([weightedRate, averageNormFreq]);
    return [weightedRate, averageNormFreq]
}
// path:      an SVG <path> element
// threshold: a 'close-enough' limit (ignore subdivisions with area less than this)
// segments:  (optional) how many segments to subdivisions to create at each level
// returns:   a new SVG <polygon> element
function pathToPolygonViaSubdivision(path,threshold,segments){
    if (!threshold) threshold = 0.0001; // Get really, really close
    if (!segments)  segments = 3;       // 2 segments creates 0-area triangles

    var points = subdivide( ptWithLength(0), ptWithLength( path.node().getTotalLength() ) );
    for (var i=points.length;i--;) points[i] = [points[i].x,points[i].y];

    var poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points',points.join(' '));
    return poly;

    // Record the distance along the path with the point for later reference
    function ptWithLength(d) {
        var pt = path.node().getPointAtLength(d); pt.d = d; return pt;
    }

    // Create segments evenly spaced between two points on the path.
    // If the area of the result is less than the threshold return the endpoints.
    // Otherwise, keep the intermediary points and subdivide each consecutive pair.
    function subdivide(p1,p2){
        var pts=[p1];
        for (var i=1,step=(p2.d-p1.d)/segments;i<segments;i++){
            pts[i] = ptWithLength(p1.d + step*i);
        }
        pts.push(p2);
        if (polyArea(pts)<=threshold) return [p1,p2];
        else {
            var result = [];
            for (var j=1;j<pts.length;++j){
                var mids = subdivide(pts[j-1], pts[j]);
                mids.pop(); // We'll get the last point as the start of the next pair
                result = result.concat(mids)
            }
            result.push(p2);
            return result;
        }
    }

    // Calculate the area of an polygon represented by an array of points
    function polyArea(points){
        var p1,p2;
        for(var area=0,len=points.length,i=0;i<len;++i){
            p1 = points[i];
            p2 = points[(i-1+len)%len]; // Previous point, with wraparound
            area += (p2.x+p1.x) * (p2.y-p1.y);
        }
        return Math.abs(area/2);
    }
}


// Return the area for an SVG <polygon> or <polyline>
// Self-crossing polys reduce the effective 'area'
function polyArea(poly){
    var area=0,pts=poly.points,len=pts.numberOfItems;
    for(var i=0;i<len;++i){
        var p1 = pts.getItem(i), p2=pts.getItem((i+len-1)%len);
        area += (p2.x+p1.x) * (p2.y-p1.y);
    }
    return Math.abs(area/2);
}

function getArea(points){       // duplicate of polyArea(points)
    var p1,p2;
    for(var area=0,len=points.length,i=0;i<len;++i){
        p1 = points[i];
        p2 = points[(i-1+len)%len]; // Previous point, with wraparound
        area += (p2.x+p1.x) * (p2.y-p1.y);
    }
    return Math.abs(area/2);
}
function styleAxis(axisNodes){
    axisNodes.selectAll('.domain').attr({
        fill: 'none'
    });
    axisNodes.selectAll('.tick line').attr({
        fill: 'none',
    });
    axisNodes.selectAll('.tick text').attr({
        // 'text-anchor': 'end',
        // 'transform': 'rotate(-30)',
        'font-family': 'sans-serif',
        'font-size': 20
    });
}
function styleGridlineNodes(gridlineNodes){
    gridlineNodes.selectAll('.domain').attr({
        fill: 'none',
        stroke: 'none'
    });
    gridlineNodes.selectAll('.tick line').attr({
        fill: 'none',
        'stroke-width': 2,
        stroke: '#aaaaaa',
        "stroke-dasharray": ("3, 4")
    });
}
function topRank200(){
    if (topRank==undefined){
        topRank = 200;
    }
    return topRank;
}
function topRank1000(){
    if (topRank==undefined){
        topRank = 1000;
    }
    return topRank;
}
function topRank45(){
    if (topRank==undefined){
        topRank = 30;
    }
    return topRank;
}