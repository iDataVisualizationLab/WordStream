let minWidth = screen.availWidth, height = 800;
let svg = d3.select("body").append('svg').attr({
    width: minWidth,
    height: height,
    id: "mainsvg"
});

// let fileList = ["WikiNews","Huffington","CrooksAndLiars","EmptyWheel","Esquire","FactCheck"
//                 ,"VIS_papers","IMDB","PopCha","Cards_PC","Cards_Fries"]

let fileList = ["WikiNews", "Huffington", "CrooksAndLiars", "EmptyWheel","Esquire","FactCheck", "VIS_papers", "IMDB","PopCha","Cards_PC","Cards_Fries","CS_TTU"]

let initialDataset = "CS_TTU";
let categories = ["person","location","organization","miscellaneous"];

var fileName;

addDatasetsOptions();
function addDatasetsOptions() {
    let select = document.getElementById("datasetsSelect");
    for(let i = 0; i < fileList.length; i++) {
        let opt = fileList[i];
        let el = document.createElement("option");
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
    let opts = {
        lines: 25, // The number of lines to draw
        length: 15, // The length of each line
        width: 5, // The line thickness
        radius: 25, // The radius of the inner circle
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 2, // Rounds per second
        trail: 50, // Afterglow percentage
        className: 'spinner', // The CSS class to assign to the spinner
    };
    let target = document.getElementById('loadingSpinner');
    spinner = new Spinner(opts).spin(target);
    // END: loader spinner settings ****************************
    fileName = "data/"+fileName+".tsv"; // Add data folder path
    if (fileName.indexOf("Cards_Fries")>=0){
        categories = ["increases_activity", "decreases_activity"];
        loadAuthorData(draw, 100);
    }
    else if (fileName.indexOf("CS_TTU")>=0){
        categories = ["Data Science", "High Performance Computing", "Software Engineering","Artificial Intelligence", "Security"];
        loadCS(drawCS, 100);
    }
    else if (fileName.indexOf("Cards_PC")>=0){
        categories = ["adds_modification", "removes_modification", "increases","decreases", "binds", "translocation"];
        loadAuthorData(draw, 100);
    }
    else if (fileName.indexOf("PopCha")>=0){
        categories = ["Comedy","Drama","Action", "Fantasy", "Horror"];
        loadAuthorData(drawpop, 1000);
    }
    else if (fileName.indexOf("IMDB")>=0){
        categories = ["Comedy","Drama","Action", "Family"];
        loadAuthorData(draw, 20);
    }
    else if (fileName.indexOf("VIS")>=0){
        categories = categories = ["Vis","VAST","InfoVis","SciVis"];
        loadAuthorData(draw, 20);
    }
    else if (fileName.indexOf("Huffington")>=0){
        categories = categories = ["person","location","organization","miscellaneous"];
        loadBlogPostData(draw, 45);
    }
    else if (fileName.indexOf("CrooksAndLiars")>=0){
        categories = categories = ["person","location","organization","miscellaneous"];
        loadBlogPostData(draw, 40);
    }
    else if (fileName.indexOf("EmptyWheel")>=0) {
        categories = categories = ["person", "location", "organization", "miscellaneous"];
        loadBlogPostData(draw, 40);
    }
    else if (fileName.indexOf("Esquire")>=0) {
        categories = categories = ["person", "location", "organization", "miscellaneous"];
        loadBlogPostData(draw, 40);
    }
    else{
        categories = ["person","location","organization","miscellaneous"];
        loadBlogPostData(draw, 30);
    }
}
function loadNewData(event) {
    svg.selectAll("*").remove();
    fileName = this.options[this.selectedIndex].text;
    loadData();
}
function drawpop(data){
    draw(data, 1);
};

function drawCS(data){
    draw(data, 2)
}
function draw(data, pop){
    //Layout data
    let dataWidth;
    if (pop === 1) {dataWidth = data.length*20;}
    else if (pop === 2) {dataWidth = data.length*160;}
    else {dataWidth = data.length*100;}

// function draw(data){
//     //Layout data
//     let dataWidth = data.length*100;

    // let width = (dataWidth > minWidth) ? dataWidth:minWidth;
    let width = dataWidth ;
    document.getElementById("mainsvg").setAttribute("width",width);
    let font = "Arial";
    let interpolation = "cardinal";
    let bias = 200;
    let offsetLegend = 0;
    let axisPadding = 10;
    let margins = {left: 20, top: 20, right: 10, bottom: 30};
    let ws = d3.layout.wordStream()
        .size([width, height])
        .interpolate(interpolation)
        .fontScale(d3.scale.linear())
        .minFontSize(10)
        .maxFontSize(38)
        .data(data)
        .font(font);
    let boxes = ws.boxes(),
        minFreq = ws.minFreq(),
        maxFreq = ws.maxFreq();

    //Display data
    let legendFontSize = 20;
    let legendHeight = boxes.topics.length*legendFontSize;
    //set svg data.
    svg.attr({
        width: width + margins.left + margins.top,
        height: height + margins.top + margins.bottom + axisPadding + offsetLegend+legendHeight + bias
    });

    let area = d3.svg.area()
        .interpolate(interpolation)
        .x(function(d){return (d.x);})
        .y0(function(d){return d.y0;})
        .y1(function(d){return (d.y0 + d.y); });

    function color(n) {
        var colores = ["#008fd0", "#FC660F", "#489d4c", "#E00D37", "#8D6BB8", "#85584E" , "#8d6bb8", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eae"];
        return colores[n % colores.length];
    }

    // let color = d3.scale.category10();
    //Display time axes
    let dates = [];
    boxes.data.forEach(row =>{
        dates.push(row.date);
    });

    let xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, width]);
    let xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);
    let axisGroup = svg.append('g').attr('transform', 'translate(' + (margins.left) + ',' + (height+margins.top+axisPadding+legendHeight+offsetLegend) + ')');
    let axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);
    //Display the vertical gridline
    let xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length+1)).rangeBands([0, width+width/boxes.data.length]);
    let xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);
    let xGridlinesGroup = svg.append('g').attr('transform', 'translate(' + (margins.left-width/boxes.data.length/2) + ',' + (height+margins.top + axisPadding+legendHeight+margins.bottom+offsetLegend) + ')');
    let gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-height-axisPadding-legendHeight-margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    //Main group
    let mainGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
    let wordStreamG = mainGroup.append('g');

    // =============== Get BOUNDARY and LAYERPATH ===============
    let lineCardinal = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("cardinal");

    let boundary = [];
    for (let i = 0; i < boxes.layers[0].length; i ++){
        let tempPoint = Object.assign({}, boxes.layers[0][i]);
        tempPoint.y = tempPoint.y0;
        boundary.push(tempPoint);
    }

    for (let i = boxes.layers[boxes.layers.length-1].length-1; i >= 0; i --){
        let tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length-1][i]);
        tempPoint2.y = tempPoint2.y + tempPoint2.y0;
        boundary.push(tempPoint2);
    }       // Add next (8) elements

    let lenb = boundary.length;

    // Get the string for path

    let combined = lineCardinal( boundary.slice(0,lenb/2))
        + "L"
        + lineCardinal( boundary.slice(lenb/2, lenb))
            .substring(1,lineCardinal( boundary.slice(lenb/2, lenb)).length)
        + "Z";


    // ============== DRAW CURVES =================
    let topics = boxes.topics;
    mainGroup.selectAll('path')
        .data(boxes.layers)
        .enter()
        .append('path')
        .attr('d', area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr({
            'fill-opacity': 0,      // = 1 if full color
           // stroke: 'black',
            'stroke-width': 0.3,
            topic: function(d, i){return topics[i];}
        });
    // ============= Get LAYER PATH ==============
    let layerPath = mainGroup.selectAll("path").append("path")
        .attr("d", combined )
        .attr({
            'fill-opacity': 0.1,
            'stroke-opacity': 0,
        });

    // ARRAY OF ALL WORDS
    let allWords = [];
    d3.map(boxes.data, function(row){
        boxes.topics.forEach(topic=>{
            allWords = allWords.concat(row.words[topic]);
        });
    });
    //Color based on term
    let terms = [];
    for(i=0; i< allWords.length; i++){
        terms.concat(allWords[i].text);
    }

    let opacity = d3.scale.log()
        .domain([minFreq, maxFreq])
        .range([0.4,1]);

    // Add moi chu la 1 element <g>, xoay g dung d.rotate
    let placed = true; // = false de hien thi nhung tu ko dc dien

    mainGroup.selectAll('g').data(allWords).enter().append('g')
        .attr({transform: function(d){return 'translate('+d.x+', '+d.y+')rotate('+d.rotate+')';}})
        .append('text')
        .text(function(d){return d.text;})      // add text vao g
        .attr({
            'font-family': font,
            'font-size': function(d){return d.fontSize;},
            fill: function(d){return color(d.topicIndex);},
            'fill-opacity': function(d){return opacity(d.frequency)},
            'text-anchor': 'middle',
            'alignment-baseline': 'middle',
            topic: function(d){return d.topic;},
            visibility: function(d){ return d.placed ? (placed? "visible": "hidden"): (placed? "hidden": "visible");}
        });

    // When click a term
    //Try
    let prevColor;
    //Highlight
    mainGroup.selectAll('text').on('mouseenter', function(){
        let thisText = d3.select(this);
        thisText.style('cursor', 'pointer');
        prevColor = thisText.attr('fill');

        let text = thisText.text();
        let topic = thisText.attr('topic');
        let allTexts = mainGroup.selectAll('text').filter(t =>{
            return t && t.text === text &&  t.topic === topic;
        });
        allTexts.attr({
            stroke: prevColor,
            'stroke-width': 1.5
        });
    });

    mainGroup.selectAll('text').on('mouseout', function(){
        let thisText = d3.select(this);
        thisText.style('cursor', 'default');
        let text = thisText.text();
        let topic = thisText.attr('topic');
        let allTexts = mainGroup.selectAll('text').filter(t =>{
            return t && !t.cloned && t.text === text &&  t.topic === topic;
        });
        allTexts.attr({
            stroke: 'none',
            'stroke-width': '0'
        });
    });
    //Click
    mainGroup.selectAll('text').on('click', function(){
        let thisText = d3.select(this);
        let text = thisText.text();
        let topic = thisText.attr('topic');
        let allTexts = mainGroup.selectAll('text').filter(t =>{
            return t && t.text === text &&  t.topic === topic;
        });
        // get the word out
        //Select the data for the stream layers
        let streamLayer = d3.select("path[topic='"+ topic+"']" )[0][0].__data__;

        //Push all points
        let points = Array();
        //Initialize all points
        streamLayer.forEach(elm => {
            points.push({
                x: elm.x,
                y0: elm.y0+elm.y,
                y: 0//zero as default
            });
        });
        allTexts[0].forEach(t => {
            let data = t.__data__;
            let fontSize = data.fontSize;
            //The point
            let thePoint = points[data.timeStep+1];//+1 since we added 1 to the first point and 1 to the last point.
            thePoint.y = -data.streamHeight;
            //Set it to visible.
            //Clone the nodes.
            let clonedNode = t.cloneNode(true);
            d3.select(clonedNode).attr({
                visibility: "visible",
                stroke: 'none',
                'stroke-size': 0,
            });
            let clonedParentNode = t.parentNode.cloneNode(false);
            clonedParentNode.appendChild(clonedNode);

            t.parentNode.parentNode.appendChild(clonedParentNode);
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
        let allOtherTexts = mainGroup.selectAll('text').filter(t =>{
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
    let legendGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + (height+margins.top+offsetLegend) + ')');
    let legendNodes = legendGroup.selectAll('g').data(boxes.topics).enter().append('g')
        .attr('transform', function(d, i){return 'translate(' + 30 + ',' + (i*legendFontSize+5) + ')';});
    legendNodes.append('circle').attr({
        r: 6,
        fill: function(d, i){return color(i);},
        'fill-opacity': 1,
        stroke: 'black',
        'stroke-width': .5,
    });
    legendNodes.append('text').text(function(d){return d;}).attr("class","axis").attr({
        'font-size': legendFontSize,
        'alignment-baseline': 'middle',
        dx: 15, dy: 3

    });

    //  =========== COMPACTNESS ==============

    let usedArea = 0, allWordsArea = 0,
        totalArea, compactness,
        ratio;

    let threshold = 1;        // ignore this size of area

    allWords.forEach(function (d) {
        allWordsArea += (d.heightBBox * d.widthBBox);
        if (d.placed){
            usedArea += (d.heightBBox * d.widthBBox);
        }
    });

    let poly = pathToPolygonViaSubdivision(layerPath,threshold);

    totalArea = polyArea(poly);
    compactness = usedArea/totalArea;
    ratio = allWordsArea/totalArea;

    // ======== DISPLAY RATES ===========
    let displayFreq_1 = 0,        // sum of Display Freqs
        totalFreq_1 = 0;          // total of freq for top 30

    let displayNormFreq_2 = 0,    // sum of Normalized Display Freqs
        numbers_2 = 0;       // number of words displayed

    let norm = d3.scale.linear().domain([0, maxFreq]).range([0,1]);
    allWords.forEach(function (d) {
        totalFreq_1 += d.frequency;
        if (d.placed){
            displayFreq_1 += d.frequency;

            numbers_2 += 1;
            displayNormFreq_2 += norm(d.frequency);

        }
    });

    let weightedRate = displayFreq_1 / totalFreq_1;
    let averageNormFreq = displayNormFreq_2 / numbers_2;

    // ========== WRITE ==============
    d3.select('svg').append('g').attr({
        width: 200,
        height: 200}).attr('transform', 'translate(' + (margins.left) + ',' + (height + margins.top + axisPadding + legendHeight + margins.bottom+offsetLegend) + ')').append("svg:text").attr('transform','translate (0,20)').attr("class","axis")
        // .append("svg:tspan").attr('x', 0).attr('dy', 20).text(compactness.toFixed(2) +"  "+ ratio.toFixed(2) +"  "+ weightedRate.toFixed(2) +"  "+ averageNormFreq.toFixed(3))
        // .append("svg:tspan").attr('x', 0).attr('dy', 20).text("Used Area: " + usedArea
        // + "  |  Total Area: " + totalArea.toFixed(0) + "  |  Area of all words: " + allWordsArea)
        .append("svg:tspan").attr('x', 0).attr('dy', 20).text("Compactness: " + compactness.toFixed(2))
        .append("svg:tspan").attr('x', 0).attr('dy', 20).text("Area of all words = " + ratio.toFixed(2) + " × Total Area" )
        .append("svg:tspan").attr('x', 0).attr('dy', 20).text("Weighted Display Rate: " + weightedRate.toFixed(2))
        .append("svg:tspan").attr('x', 0).attr('dy', 20).text("Average Normalized Frequency: " + averageNormFreq.toFixed(3) );

    console.log(compactness.toFixed(2), ratio.toFixed(2), weightedRate.toFixed(2), averageNormFreq.toFixed(3));

    // ============ Get APPROXIMATE AREA ============

    // let aveX = 0, aveY1, aveY2,
    //     sumY1 = 0, sumY2 = 0;
    //
    // for (let q = 0; q < boundary.length; q++){
    //     if (boundary[q].x > aveX) {aveX = boundary[q].x};
    //     if (q < lenb/2) {sumY1 += boundary[q].y}
    //     else (sumY2 += boundary[q].y)
    // };
    // aveY1 = sumY1 / (lenb / 2);
    // aveY2 = sumY2 / (lenb / 2);

    // console.log("Area of grey region: " +totalArea);
    // console.log("Area aprx: " + (aveY2 - aveY1)*aveX);
    // console.log("Area within black border: "+getArea(boundary));

    spinner.stop();


};


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
        let pts=[p1];
        for (let i=1,step=(p2.d-p1.d)/segments;i<segments;i++){
            pts[i] = ptWithLength(p1.d + step*i);
        }
        pts.push(p2);
        if (polyArea(pts)<=threshold) return [p1,p2];
        else {
            let result = [];
            for (let j=1;j<pts.length;++j){
                let mids = subdivide(pts[j-1], pts[j]);
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
        'font-family': 'serif',
        'font-size': 14
    });
}
function styleGridlineNodes(gridlineNodes){
    gridlineNodes.selectAll('.domain').attr({
        fill: 'none',
        stroke: 'none'
    });
    gridlineNodes.selectAll('.tick line').attr({
        fill: 'none',
        'stroke-width': 0.7,
        stroke: 'lightgray'
    });
}