// var fileList = ["WikiNews","Huffington","CrooksAndLiars","EmptyWheel","Esquire","FactCheck"
//                 ,"VIS_papers","IMDB","PopCha","Cards_PC","Cards_Fries"]
var svg = d3.select("body").append('svg')
    .attr({
        id: "mainsvg",
        width: 1400,
        height: 660
    });
var fileList = ["WikiNews", "Huffington", "CrooksAndLiars", "EmptyWheel", "Esquire", "FactCheck", "VIS_papers", "IMDB", "PopCha", "Cards_PC", "Cards_Fries", "QuantumComputing"]

var initialDataset = "EmptyWheel";
var categories = ["person", "location", "organization", "miscellaneous"];

var fileName;

var opacity, layerPath, maxFreq;

var axisGroup = svg.append('g').attr("id", "axisGroup");
var xGridlinesGroup = svg.append('g').attr("id", "xGridlinesGroup");
var mainGroup = svg.append('g').attr("id", "main");
var legendGroup = svg.append('g').attr("id", "legend");

addDatasetsOptions();

function addDatasetsOptions() {
    var select = document.getElementById("datasetsSelect");
    for (var i = 0; i < fileList.length; i++) {
        var opt = fileList[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el["data-image"] = "images2/datasetThumnails/" + fileList[i] + ".png";
        select.appendChild(el);
    }
    document.getElementById('datasetsSelect').value = initialDataset;  //************************************************
    fileName = document.getElementById("datasetsSelect").value;
    loadData();
}

var spinner;

function loadData() {
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
    fileName = "data/" + fileName + ".tsv"; // Add data folder path
    if (fileName.indexOf("Cards_Fries") >= 0) {
        categories = ["increases_activity", "decreases_activity"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("Cards_PC") >= 0) {
        categories = ["adds_modification", "removes_modification", "increases", "decreases", "binds", "translocation"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("PopCha") >= 0) {
        categories = ["Comedy", "Drama", "Action", "Fantasy", "Horror"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("IMDB") >= 0) {
        categories = ["Comedy", "Drama", "Action", "Family"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("VIS") >= 0) {
        categories = ["Vis", "VAST", "InfoVis", "SciVis"];
        loadAuthorData(draw, initTop);
    }
    else if (fileName.indexOf("QuantumComputing") >= 0) {
        fileName = "data/" + fileName + ".tsv"; // Add data folder path
        categories = ["Unknown citation", "Have citation", "Affiliations", "Author"];
        initTop = 15;
        loadQuantumComputing(draw, initTop);
    }
    else if (fileName.indexOf("Huffington") >= 0) {
        categories = ["person", "location", "organization", "miscellaneous"];
        loadBlogPostData(draw, initTop);
        document.getElementById("rel").checked = true;
    }
    else {
        categories = ["person", "location", "organization", "miscellaneous"];
        loadBlogPostData(draw, initTop);
    }
}

function loadNewData(event) {
    legendGroup.selectAll("*").remove();
    axisGroup.selectAll("*").remove();
    xGridlinesGroup.selectAll("*").remove();
    mainGroup.selectAll("*").remove();

    fileName = this.options[this.selectedIndex].text;
    document.getElementById("rel").checked = false;
    loadData();
}

function draw(data) {
    //Layout data
    var font = "Arial";
    var interpolation = "cardinal";
    const axisPadding = 10;
    const legendFontSize = 12;
    const legendOffset = 10;
    var legendHeight = categories.length * legendFontSize;

    const margins = {left: 20, top: 20, right: 10, bottom: 30};
    var width = globalWidth - (margins.left + margins.top);
    var height = globalHeight - (+margins.top + margins.bottom + axisPadding + legendHeight);
    var ws = d3.layout.wordStream()
            .size([width, height])
            .fontScale(d3.scale.linear())
            .minFontSize(globalMinFont)
            .maxFontSize(globalMaxFont)
            .data(data)
            .flag(globalFlag)
        // .font(font)
        // .interpolate(interpolation)
        // .fontScale(d3.scale.linear())
    ;
    var boxes = ws.boxes();
    var minSud = ws.minSud();
    var maxSud = ws.maxSud();
    maxFreq = ws.maxFreq();

    //set svg data.
    svg
        .transition()
        .duration(300)
        .attr({
            width: globalWidth,
            height: globalHeight,
        });

    var area = d3.svg.area()
        .interpolate(interpolation)
        .x(function (d) {
            return (d.x);
        })
        .y0(function (d) {
            return d.y0;
        })
        .y1(function (d) {
            return (d.y0 + d.y);
        });

    //Display time axes
    var dates = [];
    boxes.data.forEach(row => {
        dates.push(row.date);
    });

    var xAxisScale = d3.scale.ordinal().domain(dates).rangeBands([0, width]);
    var xAxis = d3.svg.axis().orient('bottom').scale(xAxisScale);

    axisGroup.attr('transform', 'translate(' + (margins.left) + ',' + (height + margins.top + axisPadding + legendHeight) + ')');
    var axisNodes = axisGroup.call(xAxis);
    styleAxis(axisNodes);

    //Display the vertical gridline
    var xGridlineScale = d3.scale.ordinal().domain(d3.range(0, dates.length + 1)).rangeBands([0, width + width / boxes.data.length]);
    var xGridlinesAxis = d3.svg.axis().orient('bottom').scale(xGridlineScale);

    xGridlinesGroup.attr('transform', 'translate(' + (margins.left - width / boxes.data.length / 2) + ',' + (height + margins.top + axisPadding + legendHeight + margins.bottom) + ')');
    var gridlineNodes = xGridlinesGroup.call(xGridlinesAxis.tickSize(-height - axisPadding - legendHeight - margins.bottom, 0, 0).tickFormat(''));
    styleGridlineNodes(gridlineNodes);

    //Main group
    mainGroup.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
    var wordStreamG = mainGroup.append('g').attr("id", "wordStreamG");

// =============== Get BOUNDARY and LAYERPATH ===============
    const lineCardinal = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .interpolate("cardinal");

    var boundary = [];
    for (var i = 0; i < boxes.layers[0].length; i++) {
        var tempPoint = Object.assign({}, boxes.layers[0][i]);
        tempPoint.y = tempPoint.y0;
        boundary.push(tempPoint);
    }

    for (var i = boxes.layers[boxes.layers.length - 1].length - 1; i >= 0; i--) {
        var tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length - 1][i]);
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

    // draw curves
    var topics = boxes.topics;

    var curve = mainGroup.selectAll('.curve').data(boxes.layers);

    curve.exit().remove();

    curve.enter()
        .append('path')
        .attr('d', area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr({
            "class": "curve",
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-width': 0,
            topic: function (d, i) {
                return topics[i];
            }
        });

    curve.attr("d", area)
        .style('fill', function (d, i) {
            return color(i);
        })
        .attr({
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-width': 0,
            topic: function (d, i) {
                return topics[i];
            }
        });


    // ============= Get LAYER PATH ==============

    layerPath = mainGroup.selectAll("path").append("path")
        .attr("d", combined)
        .attr({
            'fill-opacity': 0,
            'stroke-opacity': 0,
        });

    var allWords = [];
    d3.map(boxes.data, function (row) {
        boxes.topics.forEach(topic => {
            allWords = allWords.concat(row.words[topic]);
        });
    });

    allW = JSON.parse(JSON.stringify(allWords));

    opacity = d3.scale.log()
        .domain([minSud, maxSud])
        .range([0.4, 1]);

    var lineScale;
    if (fileName.indexOf("Huffington") >= 0) {
        d3.json("data/linksHuff2012.json", function (error, rawLinks) {
            const threshold = 5;
            const links = rawLinks.filter(d => d.weight > threshold);
            var isRel = document.getElementById("rel").checked;

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
                    visibleLinks.push({
                        sourceX: s.x,
                        sourceY: s.y,
                        targetX: t.x,
                        targetY: t.y,
                        weight: d.weight,
                        sourceID: d.sourceID,
                        targetID: d.targetID,
                    });
                }
            });

            lineScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 3]);

            opacScale = d3.scale.linear()
                .domain(d3.extent(visibleLinks, d => d.weight))
                .range([0.5, 1]);

            var connection = mainGroup.selectAll(".connection").data(visibleLinks);
            connection.exit().remove();

            connection.enter()
                .append("line")
                .attr("class", "connection");

            connection
                .attr("opacity", isRel ? 1 : 0)
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
    } else drawWords();

    function drawWords() {
        var placed = true;
        var prevColor;

        var texts = mainGroup.selectAll('.word').data(allWords, d => d.id);

        texts.exit().remove();

        var textEnter = texts.enter().append('g')
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .attr("class", "word")

        textEnter.transition()
            .duration(800)

        textEnter.append('text')
            .text(function (d) {
                return d.text;
            })
            .attr({
                "id": d => d.id,
                "class": "textData",
                'font-family': font,
                'font-size': function (d) {
                    return d.fontSize;
                },
                "fill": function (d, i) {
                    return color(categories.indexOf(d.topic));
                },
                "fill-opacity": function (d) {
                    return opacity(d.sudden);
                },
                'text-anchor': 'middle',
                'alignment-baseline': 'middle',
                topic: function (d) {
                    return d.topic;
                },
                visibility: function (d) {
                    return d.placed ? "visible" : "hidden";
                }
            });

        texts.transition().duration(800)
            .attr({
                transform: function (d) {
                    return 'translate(' + d.x + ', ' + d.y + ')rotate(' + d.rotate + ')';
                }
            })
            .select("text")
            .attr('font-size', function (d) {
                return d.fontSize;
            })
            .attr({
                visibility: function (d) {
                    return d.placed ? "visible" : "hidden";
                }
            });

        // texts.style("text-decoration", "underline");

        mainGroup.selectAll(".connection").on("mouseover", function () {
            var thisLink = d3.select(this);
            thisLink.style('cursor', 'crosshair');
            // in order to select by byid, the id must not have space
            var sourceText = mainGroup.select("#" + thisLink[0][0].__data__.sourceID);
            var prevSourceColor = sourceText.attr("fill");
            var targetText = mainGroup.select("#" + thisLink[0][0].__data__.targetID);
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
            var sourceText = mainGroup.select("#" + thisLink[0][0].__data__.sourceID);
            var targetText = mainGroup.select("#" + thisLink[0][0].__data__.targetID);

            thisLink.attr("stroke-width", lineScale(thisLink[0][0].__data__.weight));

            sourceText.attr({
                stroke: 'none',
                'stroke-width': 0
            });

            targetText.attr({
                stroke: 'none',
                'stroke-width': 0
            });
        });

        //Highlight
        mainGroup.selectAll('.textData').on('mouseenter', function () {
            var thisText = d3.select(this);
            thisText.style('cursor', 'pointer');
            prevColor = thisText.attr('fill');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: prevColor,
                'stroke-width': 1
            });
        });
        mainGroup.selectAll('.textData').on('mouseout', function () {
            var thisText = d3.select(this);
            thisText.style('cursor', 'default');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && !t.cloned && t.text === text && t.topic === topic;
            });
            allTexts.attr({
                stroke: 'none',
                'stroke-width': '0'
            });
        });
        //Click
        mainGroup.selectAll('.textData').on('click', function () {
            var thisText = d3.select(this);
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && t.text === text && t.topic === topic;
            });
            //Select the data for the stream layers
            var streamLayer = d3.select("path[topic='" + topic + "']")[0][0].__data__;
            //Push all points
            var points = Array();
            //Initialize all points
            streamLayer.forEach(elm => {
                points.push({
                    x: elm.x,
                    y0: elm.y0 + elm.y,
                    y: 0//zero as default
                });
            });
            allTexts[0].forEach(t => {
                var data = t.__data__;
                var fontSize = data.fontSize;
                //The point
                var thePoint = points[data.timeStep + 1];
                ;//+1 since we added 1 to the first point and 1 to the last point.
                thePoint.y = -data.streamHeight;
                //Set it to visible.
                //Clone the nodes.
                var clonedNode = t.cloneNode(true);
                d3.select(clonedNode).attr({
                    visibility: "visible",
                    stroke: 'none',
                    'stroke-size': 0,
                });
                var clonedParentNode = t.parentNode.cloneNode(false);
                clonedParentNode.appendChild(clonedNode);

                t.parentNode.parentNode.appendChild(clonedParentNode);
                d3.select(clonedParentNode).attr({
                    cloned: true,
                    topic: topic
                }).transition().duration(300).attr({
                    transform: function (d, i) {
                        return 'translate(' + thePoint.x + ',' + (thePoint.y0 + thePoint.y - fontSize / 2) + ')';
                    },
                });
            });
            //Add the first and the last points
            points[0].y = points[1].y;//First point
            points[points.length - 1].y = points[points.length - 2].y;//Last point
            //Append stream
            wordStreamG.append('path')
                .datum(points)
                .attr('d', area)
                .style('fill', prevColor)
                .attr({
                    'fill-opacity': prevColor,
                    stroke: 'black',
                    'stroke-width': 0.3,
                    topic: topic,
                    wordStream: true
                });
            //Hide all other texts
            var allOtherTexts = mainGroup.selectAll('.textData').filter(t => {
                return t && !t.cloned && t.topic === topic;
            });
            allOtherTexts.attr('visibility', 'hidden');
        });
        topics.forEach(topic => {
            d3.select("path[topic='" + topic + "']").on('click', function () {
                mainGroup.selectAll('.textData').filter(t => {
                    return t && !t.cloned && t.placed && t.topic === topic;
                }).attr({
                    visibility: 'visible'
                });
                //Remove the cloned element
                document.querySelectorAll("g[cloned='true'][topic='" + topic + "']").forEach(node => {
                    node.parentNode.removeChild(node);
                });
                //Remove the added path for it
                document.querySelectorAll("path[wordStream='true'][topic='" + topic + "']").forEach(node => {
                    node.parentNode.removeChild(node);
                });
            });

        });

        //Build the legends
        legendGroup.attr('transform', 'translate(' + margins.left + ',' + (height + margins.top + legendOffset) + ')');
        var legendNodes = legendGroup.selectAll('g').data(boxes.topics).enter().append('g')
            .attr('transform', function (d, i) {
                return 'translate(' + 10 + ',' + (i * legendFontSize) + ')';
            });
        legendNodes.append('circle').attr({
            r: 5,
            fill: function (d, i) {
                return color(i);
            },
            'fill-opacity': 1,
            stroke: 'black',
            'stroke-width': .5,
        });
        legendNodes.append('text').text(function (d) {
            return d;
        }).attr({
            'font-size': legendFontSize,
            'alignment-baseline': 'middle',
            dx: 8
        });
        spinner.stop();
    };
}

function styleAxis(axisNodes) {
    axisNodes.selectAll('.domain').attr({
        fill: 'none'
    });
    axisNodes.selectAll('.tick line').attr({
        fill: 'none',
    });
    axisNodes.selectAll('.tick text').attr({
        'font-family': 'serif',
        'font-size': 10
    });
}

function styleGridlineNodes(gridlineNodes) {
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
