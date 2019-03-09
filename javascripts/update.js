var globalWidth = initWidth,
    globalHeight = initHeight,
    globalMinFont = initMinFont,
    globalMaxFont = initMaxFont,
    globalFlag = initFlag

;
var color = d3.scale.category10();
var axis = d3.svg.axis().ticks(4);
var axisFont = d3.svg.axis().tickValues([0, 25, 50, 75, 100]);
// var verticalAxis = d3.svg.axis().orient("left").ticks(5);

d3.select('#widthSlider').call(d3.slider()
    .axis(axis)
    .value([0, initWidth])
    .min(0)
    .max(2500)
    .step(20)
    .on("slide", function (evt, value) {
        d3.select('#widthText').text(value[1]);
    }))
;
d3.select('#heightSlider').call(d3.slider()
    .axis(axis)
    .value([0, initHeight])
    .min(0)
    .max(2500)
    .step(20)
    .on("slide", function (evt, value) {
        d3.select('#heightText').text(value[1]);
    }))
;
d3.select('#fontSlider').call(d3.slider().axis(axisFont).value([initMinFont, initMaxFont]).on("slide", function (evt, value) {
    d3.select('#fontMin').text(value[0].toFixed(0));
    d3.select('#fontMax').text(value[1].toFixed(0));
}));

// // draw line
// var frontier = d3.select("#cp").append("line")
//     .attr("id", "frontier")
//     .attr("x1", 170)
//     .attr("x2", 170)
//     .attr("y1", 300)
//     .attr("y2", 350)
//     .attr("class", "frontier");

function updateTopRank() {

    d3.select(".holderCP").append("span")
        .attr("id", "topRankText")
        .attr("class", "topRankText topRank textSlider");

    d3.select(".holderCP").append("div")
        .attr("id", "topRankSlider")
        .attr("class", "topRankAxis topRank slider");

    d3.select("#topRankText").text(topRank);

    d3.select('#topRankSlider').call(d3.slider()
        .axis(axis)
        .value([0, topRank])
        .min(0)
        .max(50)
        .step(5)
        .on("slide", function (evt, value) {
            d3.select('#topRankText').text(value[1]);
        }))
        .on("mouseup", function () {
            submitInput(updateData);
        })
    ;
}

function showRelationship() {
    let isRel = document.getElementById("rel").checked;
    console.log(isRel);
    if (isRel) {
        d3.selectAll(".connection").transition().duration(200).attr("opacity", 1);
    }
    else d3.selectAll(".connection").transition().duration(200).attr("opacity", 0);
}

function progressing() {
    var bar = new ProgressBar.Line(progressBar, {
        strokeWidth: 4,
        easing: 'easeInOut',
        //duration: 1400,
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
            style: {
                // Text color.
                // Default: same as stroke color (options.color)
                color: '#999',
                position: 'absolute',
                right: '0',
                top: '30px',
                padding: 0,
                margin: 0,
                transform: null
            },
            autoStyleContainer: false
        },
        from: {color: '#FFEA82'},
        to: {color: '#ED6A5A'},
        step: (state, bar) => {
            bar.setText(Math.round(bar.value() * 100) + ' %');
        }
    });

    bar.animate(1.0);  // Number from 0.0 to 1.0
}

function submitInput(updateData) {
    globalWidth = parseInt(document.getElementById("widthText").innerText);
    globalHeight = parseInt(document.getElementById("heightText").innerText);
    globalMinFont = parseInt(document.getElementById("fontMin").innerText);
    globalMaxFont = parseInt(document.getElementById("fontMax").innerText);
    topRankUpdate = parseInt(document.getElementById("topRankText").innerText);
    let isFlow = document.getElementById("flow").checked;
    let isAv = document.getElementById("av").checked;
    if (isFlow && isAv) {
        console.log("Flow and Av");
        globalFlag = "fa";
    }
    else if (isFlow && !isAv) {
        console.log("Just Flow");
        globalFlag = "f";
    }

    else if (!isFlow && isAv) {
        console.log("Just AV");
        globalFlag = "a";
    }

    else if (!isFlow && !isAv) {
        console.log("None");
        globalFlag = "none"
    }

    // top rank
    var temp = getTop(totalData, topRankUpdate).slice(1);
    var data = tfidf(temp);

    console.log("input submitted");
    console.log(data);

    updateData(data);
}

var up = [];

function updateData(data) {
    var offsetLegend = -10;
    var axisPadding = 10;
    var margins = {left: 20, top: 20, right: 10, bottom: 30};

    var ws = d3.layout.wordStream()
        .size([globalWidth, globalHeight])
        .interpolate("cardinal")
        .fontScale(d3.scale.log())
        .minFontSize(globalMinFont)
        .maxFontSize(globalMaxFont)
        .data(data)
        .flag(globalFlag);

    var newboxes = ws.boxes(),
        minFreq = ws.minFreq(),
        maxFreq = ws.maxFreq(),
        minSud = ws.minSud(),
        maxSud = ws.maxSud();

    var legendFontSize = 20;
    var legendHeight = newboxes.topics.length * legendFontSize;

    d3.select("#mainsvg")
        .transition()
        .duration(300)
        .attr({
            width: globalWidth + margins.left + margins.top,
            height: globalHeight + +margins.top + margins.bottom + axisPadding + offsetLegend + legendHeight
        });

    // d3.select("#mainsvg").selectAll("*").remove();
    var dates = [];
    newboxes.data.forEach(row => {
        dates.push(row.date);
    });

    var xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, globalWidth]);
    var xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);

    axisGroup
        .attr('transform', 'translate(' + (margins.left) + ',' + (globalHeight + margins.top + axisPadding + legendHeight + offsetLegend) + ')');

    var axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);

    //Display the vertical gridline
    var xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length + 1)).rangeBands([0, globalWidth + globalWidth / newboxes.data.length]);
    var xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);

    xGridlinesGroup.attr("id", "gridLines")
        .attr('transform', 'translate(' +
            (margins.left - globalWidth / 24)
            + ',' + (globalHeight + margins.top + axisPadding + legendHeight + margins.bottom + offsetLegend) + ')');

    var gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-globalHeight - axisPadding - legendHeight - margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    // build legend
    legendGroup.attr('transform', 'translate(' + margins.left + ',' + (globalHeight + margins.top + offsetLegend) + ')');
    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) {
            return (d.x);
        })
        .y0(function (d) {
            return d.y0;
        })
        .y1(function (d) {
            return (d.y0 + d.y);
        });

    mainGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

    // ARRAY OF ALL WORDS
    var allWordsUpdate = [];
    d3.map(newboxes.data, function (row) {
        newboxes.topics.forEach(topic => {
            allWordsUpdate = allWordsUpdate.concat(row.words[topic]);
        });
    });

    up = JSON.parse(JSON.stringify(allWordsUpdate));
    var opacity = d3.scale.log()
        .domain([minSud, maxSud])
        .range([0.4, 1]);

    if (fileName.indexOf("Huffington") >= 0) {
        d3.json("data/linksHuff2012.json", function (error, rawLinks) {
            const threshold = 10;
            const links = rawLinks.filter(d => d.weight > threshold);

            links.forEach(d => {
                d.sourceID = d.sourceID.split(".").join("_").split(" ").join("_");
                d.targetID = d.targetID.split(".").join("_").split(" ").join("_");
            });
            let visibleLinks = [];

            // select only links with: word place = true and have same id
            links.forEach(d => {
                let s = allWordsUpdate.find(w => (w.id === d.sourceID) && (w.placed === true));
                let t = allWordsUpdate.find(w => (w.id === d.targetID) && (w.placed === true));
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

            drawWordsUpdate();
        });
    }
    else drawWordsUpdate();

    function drawWordsUpdate() {
        var texts = d3.select("#mainsvg").selectAll('.word').data(allWordsUpdate, d => d.id);

        texts.exit()
            .remove();

        texts.transition()
            .duration(1000)
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .select("text")
            .text(function (d) {
                return d.text;
            })
            .attr({
                'font-size': function (d) {
                    return d.fontSize;
                },
                fill: function (d) {
                    return color(d.topicIndex);
                },
                'fill-opacity': function (d) {
                    return opacity(d.sudden)
                },
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                topic: function (d) {
                    return d.topic;
                },
                visibility: function (d) {
                    return d.placed ? ("visible") : ("hidden");
                }
            });


        texts.enter()
            .append("g")
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .attr("class", "word")
            .append("text")
            .text(function (d) {
                return d.text;
            })
            .attr({
                'font-size': function (d) {
                    return d.fontSize;
                },
                fill: function (d) {
                    return color(d.topicIndex);
                },
                'fill-opacity': function (d) {
                    return opacity(d.sudden)
                },
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                topic: function (d) {
                    return d.topic;
                },
                visibility: function (d) {
                    return d.placed ? ("visible") : ("hidden");
                }
            });

        var prevColor;
        // --- Highlight when mouse enter ---
        mainGroup.selectAll('text').on('mouseenter', function () {  // hover above the word -> select this
            var thisText = d3.select(this);
            thisText.style('cursor', 'pointer');
            prevColor = thisText.attr('fill');

            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('text').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: prevColor,
                fill: prevColor,
                'stroke-width': 1.5
            });
        });

        // --- Lowlight when mouse out ---
        mainGroup.selectAll('text').on('mouseout', function () {
            var thisText = d3.select(this);
            thisText.style('cursor', 'default');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('text').filter(t => {
                return t && !t.cloned && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: 'none',
                'stroke-width': '0'
            });
        });
// Get layer path
        var lineCardinal = d3.svg.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            })
            .interpolate("cardinal");

        var boundary = [];
        for (var i = 0; i < newboxes.layers[0].length; i++) {
            var tempPoint = Object.assign({}, newboxes.layers[0][i]);
            tempPoint.y = tempPoint.y0;
            boundary.push(tempPoint);
        }

        for (var i = newboxes.layers[newboxes.layers.length - 1].length - 1; i >= 0; i--) {
            var tempPoint2 = Object.assign({}, newboxes.layers[newboxes.layers.length - 1][i]);
            tempPoint2.y = tempPoint2.y + tempPoint2.y0;
            boundary.push(tempPoint2);
        }       // Add next (8) elements

        var lenb = boundary.length;

        // Get the string for path

        var combined = lineCardinal(boundary.slice(0, lenb / 2))
            + "L"
            + lineCardinal(boundary.slice(lenb / 2, lenb))
                .substring(1, lineCardinal(boundary.slice(lenb / 2, lenb)).length)
            + "Z";

        var topics = newboxes.topics;
        mainGroup.selectAll('path')
            .data(newboxes.layers)
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
                topic: function (d, i) {
                    return topics[i];
                }
            });
        // ============= Get LAYER PATH ==============
        var layerPath = mainGroup.selectAll("path").append("path")
            .attr("d", combined)
            .attr({
                'fill-opacity': 0.1,
                'stroke-opacity': 0,
            });

        var metValue = [getTfidf(allWordsUpdate).toFixed(2),
            getCompactness(allWordsUpdate, layerPath)[0].toFixed(2),
            getCompactness(allWordsUpdate, layerPath)[1].toFixed(2),
            getDisplayRate(allWordsUpdate, maxFreq)[0].toFixed(2),
            getDisplayRate(allWordsUpdate, maxFreq)[1].toFixed(3)];

        metric2.selectAll(".metricValue").remove();
        metric2.selectAll(".metricValue")
            .data(metValue)
            .enter()
            .append("text")
            .text(d => d)
            .attr("class", "metricValue metricDisplay")
            .attr("x", "0")
            .attr("y", (d, i) => 43 + 36 * i)
            .attr("font-weight", "bold");


    }
}


// d3.select("#heightSlider")
//     .attr("id","test")
//     .call(d3.slider()
//     .axis(verticalAxis)
//     .value(800)
//     .min(600)
//     .max(1200)
//     .step(100)
//     .orientation("vertical")
//     .on("slide", function (evt, value) {
//         d3.select('#heightText').text(value);
//     }))
// ;
// metric.selectAll("rect")
//     .data(metricLine)
//     .enter()
//     .append("rect")
//     .attr("id", "metric" + function(d){
//         return d
//     })
//     .attr("class",".metricRect")
//     .attr("x","20")
//     .attr("y",(d,i) => 50*i+40)
//     .attr("rx","5")
//     .attr("ry","5")
//     .attr("width","320")
//     .attr("height","36")
//     .style("fill","#eeeeee")
//     .attr("stroke","#8f8f8f");

// metric.selectAll(".metricText")
//     .data(metricName)
//     .enter()
//     .append("text")
//     .text(d => d)
//     .attr("class","metricDisplay")
//     .attr("x","33")
//     .attr("y",(d,i) =>i*50);