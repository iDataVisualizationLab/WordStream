// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
// Also referenced to the implementation: by Jason Davies, https://www.jasondavies.com/wordcloud/
d3.layout.wordStream = function(){
    var data = [],
        size = [1200, 500],
        maxFontSize = 24,
        minFontSize = 10,
        rotateCorner = 15,
        font = "Arial",
        flag = "n",
        fontScale = d3.scale.linear(),
        frequencyScale = d3.scale.linear(),
        spiral = achemedeanSpiral,
        canvas = cloudCanvas,
        interpolation = "linear";
    var wordStream = {};

    var cloudRadians = Math.PI / 180, toDegree = 180 / Math.PI,
        cw = (fileName.indexOf("Quantum")) >= 0 ? 25000 : 1<< 14 ,
        ch = 1 << 11;

    var maxSud, minSud, maxFreq;

    wordStream.boxes = function(){
        var boxWidth = size[0]/data.length;
        buildFontScale(data);
        buildFrequencyScale(data);
        var boxes = buildBoxes(data);
        //Get the sprite for each word
        getImageData(boxes);
        //Set for each stream
        for(var tc = 0; tc< boxes.topics.length; tc++){
            var topic = boxes.topics[tc];
            var board = buildBoard(boxes, topic);
            var innerBoxes = boxes.innerBoxes[topic];
            var layer = boxes.layers[tc];
            //Place
            for(var bc = 0; bc < boxes.data.length; bc++){
                var words = boxes.data[bc].words[topic];
                var n = words.length;
                var innerBox = innerBoxes[bc];
                board.boxWidth = innerBox.width;
                board.boxHeight = innerBox.height;
                board.boxX = innerBox.x;
                board.boxY = innerBox.y;
                for(var i = 0; i < n; i++){
                    place(words[i], board);
                }
            }
        }
        return boxes;
    };

    //#region helper functions
    function buildFontScale(data){
        var topics = d3.keys(data[0].words);
        //#region scale for the font size.
        var maxSudden = 0;
        var minSudden = Number.MAX_SAFE_INTEGER;
        var maxFrequency = 0;
        var minFrequency = Number.MAX_SAFE_INTEGER;
        d3.map(data, function(box){
            d3.map(topics, function(topic){
                var maxF = d3.max(box.words[topic], function(d){
                    return d.frequency;
                });
                var minF = d3.min(box.words[topic], function(d){
                    return d.frequency;
                });
                if(maxFrequency < maxF) maxFrequency = maxF;
                if(minFrequency > minF) minFrequency = minF;
                // ---------------------------------------------
                var maxS = d3.max(box.words[topic], function(d){
                    return d.sudden;
                });
                var minS = d3.min(box.words[topic], function(d){
                    return d.sudden;
                });
                if(maxSudden < maxS) maxSudden = maxS;
                if(minSudden > minS) minSudden = minS;
            })
        });
        //fontScale.domain([minFrequency, maxFrequency]).range([minFontSize, maxFontSize]);
        maxSud = maxSudden;
        minSud = minSudden;
        maxFreq = maxFrequency;
        fontScale.domain([minSudden, maxSudden]).range([minFontSize, maxFontSize]);
    }
    function buildFrequencyScale(data){
        var totalFrequencies  = calculateTotalFrequenciesABox(data);
        var max = 0;
        d3.map(totalFrequencies, function(d){
            var keys = d3.keys(totalFrequencies[0]);
            var total = 0;
            keys.forEach(key=>{
                total += d[key];
            });
            if(total > max) max = total;
        });
        frequencyScale.domain([0, max]).range([0, size[1]]);
    }
    //Convert from data to box
    function buildBoxes(data){
        //Build settings based on frequencies
        var totalFrequencies  = calculateTotalFrequenciesABox(data);
        var topics = d3.keys(data[0].words);
        //#region creating boxes
        var numberOfBoxes = data.length;
        var boxes = {};
        var boxWidth =  ~~(size[0]/numberOfBoxes);
        //Create the stacked data
        var allPoints = [];
        topics.forEach(topic=>{
            var dataPerTopic = [];
            //Push the first point
            dataPerTopic.push({x: 0, y:frequencyScale(totalFrequencies[0][topic])});
            totalFrequencies.forEach((frq, i) =>{
                dataPerTopic.push({x: (i*boxWidth) + (boxWidth>>1), y: frequencyScale(frq[topic])});
            });
            //Push the last point
            dataPerTopic.push({x: size[0], y:frequencyScale(totalFrequencies[totalFrequencies.length-1][topic])});//TODO:
            allPoints.push(dataPerTopic);
        });
        var layers = d3.layout.stack().offset('silhouette')(allPoints);

        var innerBoxes = {};
        topics.forEach((topic, i)=>{
            innerBoxes[topic] = [];
            for(var j = 1; j< layers[i].length-1; j++){
                innerBoxes[topic].push({
                    x: layers[i][j].x - (boxWidth>>1),
                    y: layers[i][j].y0,
                    width: boxWidth,
                    height: layers[i][j].y
                });
            }
        });
        boxes = {
            topics: topics,
            data: data,
            layers: layers,
            innerBoxes: innerBoxes
        };
        return boxes;
    }
    function place(word, board){
        var bw = board.width,
            bh = board.height,
            maxDelta = ~~Math.sqrt((board.boxWidth*board.boxWidth) + (board.boxHeight*board.boxHeight)),
            startX =  ~~(board.boxX + (board.boxWidth*( Math.random() + .5) >> 1)),
            startY =  ~~(board.boxY + (board.boxHeight*( Math.random() + .5) >> 1)),
            s = spiral([board.boxWidth, board.boxHeight]),
            dt = Math.random() < .5 ? 1 : -1,
            t = -dt,
            dxdy, dx, dy;
        word.x = startX;
        word.y = startY;
        word.placed = false;
        while (dxdy = s(t += dt)) {
            dx = ~~dxdy[0];
            dy = ~~dxdy[1];

            if (Math.max(Math.abs(dx), Math.abs(dy)) >= (maxDelta))
                break;

            word.x = startX + dx;
            word.y = startY + dy;

            if (word.x + word.x0 < 0 || word.y + word.y0 < 0 || word.x + word.x1 > size[0] || word.y + word.y1 > size[1])
                continue;
            if(!cloudCollide(word, board)){
                placeWordToBoard(word, board);
                word.placed = true;
                break;
            }
        }
    }
    //board has current bound + which is placed at the center
    //x, y of the word is placed at the center
    function cloudCollide(word, board) {
        var wh = word.height,
            ww = word.width,
            bw = board.width;
        //For each pixel in word
        for(var j = 0; j < wh; j++){
            for(var i = 0; i < ww; i++){
                var wsi = j*ww + i; //word sprite index;
                var wordPixel = word.sprite[wsi];

                var bsi = (j+word.y+word.y0)*bw + i+(word.x + word.x0);//board sprite index
                var boardPixel = board.sprite[bsi];

                if(boardPixel!=0 && wordPixel!=0){
                    return true;
                }
            }
        }
        return false;
    }
    function placeWordToBoard(word, board){
        //Add the sprite
        var y0 = word.y + word.y0,
            x0 = word.x + word.x0,
            bw = board.width,
            ww = word.width,
            wh = word.height;
        for(var j=0; j< wh; j++){
            for(var i = 0; i< ww; i++){
                var wsi = j*ww + i;
                var bsi = (j+y0)*bw + i + x0;
                if(word.sprite[wsi]!=0) board.sprite[bsi] = word.sprite[wsi];
            }
        }
    }

    function buildSvg(boxes, topic){
        streamPath1 = Array(),
            streamPath2 = Array();
        var width = size[0],
            height = size[1];
        var svg = d3.select(document.createElement('svg')).attr({
            width: width,
            height: height
        });
        var graphGroup = svg.append('g');
        var n = boxes.length;

        var catIndex = boxes.topics.indexOf(topic);

        var area1 = d3.svg.area()
            .interpolate(interpolation)
            .x(function(d){return d.x; })
            .y0(0)
            .y1(function(d){return d.y0; });


        var area2 = d3.svg.area()
            .interpolate(interpolation)
            .x(function(d){return d.x; })
            .y0(function(d){return (d.y + d.y0); })
            .y1(height);

        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr({
                d: area1,
                stroke: 'red',
                'stroke-width': 2,
                fill :'red',
                id: 'path1'
            });
        graphGroup.append('path').datum(boxes.layers[catIndex])
            .attr({
                d: area2,
                stroke: 'red',
                'stroke-width': 2,
                fill :'red',
                id: 'path2'
            });
        return svg;
    }
    function buildCanvas(boxes, topic){
        var svg = buildSvg(boxes, topic);
        var path1 = svg.select("#path1").attr('d');
        var p2d1 = new Path2D(path1);
        var path2 = svg.select("#path2").attr('d');
        var p2d2 = new Path2D(path2);
        var canvas = document.createElement("canvas");
        canvas.width = size[0];
        canvas.height = size[1];
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fill(p2d1);
        ctx.fill(p2d2);
        return canvas;
    }
    function buildBoard(boxes, topic){
        var canvas = buildCanvas(boxes,topic);
        var width = canvas.width,
            height = canvas.height;
        var board = {};
        board.x = 0;
        board.y = 0;
        board.width = width;
        board.height = height;
        var sprite = [];
        //initialization
        for(var i=0; i< width*height; i++) sprite[i] = 0;
        var c = canvas.getContext('2d');
        var pixels = c.getImageData(0, 0, width, height).data;
        for(var i=0; i< width*height; i++){
            sprite[i] = pixels[i<<2];
        }
        board.sprite = sprite;
        return board;
    }
    function getContext(canvas) {
        canvas.width = cw;
        canvas.height = ch;
        var context = canvas.getContext("2d");
        context.fillStyle = context.strokeStyle = "red";
        context.textAlign = "center";
        context.textBaseline = "middle";
        return context;
    }
    function angle(boxes){
        var angles = [];

        var y1upper, y2upper, y1lower, y2lower, x;
        var angle1, angle2, angle;
        var innerBoxes = boxes.innerBoxes;
        for (var i = 0; i < d3.keys(innerBoxes).length; i++){   // i: index cua topic
            var key = d3.keys(innerBoxes)[i];

            for (var j = 0; j < innerBoxes[key].length-1; j++){     // j: index cua doi tuong

                x = boxes.innerBoxes[key][j].width;

                y1upper = innerBoxes[key][j].y;
                y2upper = innerBoxes[key][j+1].y;

                y1lower = innerBoxes[key][j].y + innerBoxes[key][j].height;
                y2lower = innerBoxes[key][j+1].y + innerBoxes[key][j+1].height;

                angle1 = Math.atan2(y1upper - y2upper, x);
                angle2 = Math.atan2(y1lower - y2lower, x);

                angle = (angle1 + angle2) / 2 * toDegree;

                angles.push({
                    topic: key,
                    timeStep: j,
                    angle: angle
                });
                if (j === innerBoxes[key].length - 2){    // phan tu cuoi
                    angles.push({
                        topic: key,
                        timeStep: j+1,
                        angle: 0});
                }
            }
        }
        return angles;
    }
    //Get image data for all words
    function getImageData(boxes){
        var av = flag.includes("a")? 15 : 0;
        var flow = 0;
        var angles = angle(boxes);
        var data = boxes.data;
        var c = getContext(canvas());
        c.clearRect(0, 0, cw, ch);
        var x = 0,
            y = 0,
            maxh = 0;
        for(var i = 0; i < data.length; i++){
            boxes.topics.forEach(topic =>{
                var words = data[i].words[topic];
                var n = words.length;
                var di=-1;
                var d = {};
                if (flag.includes("f")){
                    for (var k in angles){
                        if ((topic === angles[k].topic) && (i === angles[k].timeStep)){
                            flow = angles[k].angle;
                            break;
                        }
                    }
                }
                while (++di < n) {
                    d = words[di];
                    c.save();
                    // d.fontSize = ~~fontScale(d.frequency);
                    d.fontSize = ~~fontScale(d.sudden);
                    d.rotate = (~~(Math.random() * 4) - 2) * av - flow;
                    // d.rotate = (~~(Math.random() * 6) - 3) * rotateCorner;
                    c.font = ~~(d.fontSize + 1) + "px " + font;

                    var w = ~~(c.measureText(d.text).width),
                        h = d.fontSize;
                    if (d.rotate) {
                        var sr = Math.sin(d.rotate * cloudRadians),
                            cr = Math.cos(d.rotate * cloudRadians),
                            wcr = w * cr,
                            wsr = w * sr,
                            hcr = h * cr,
                            hsr = h * sr;
                        w = ~~Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr));
                        h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
                    }
                    if (h > maxh) maxh = h;
                    if (x + w >= cw) {
                        x = 0;
                        y += maxh;
                        maxh = 0;
                    }
                    if (y + h >= ch) break;
                    c.translate((x + (w >> 1)) , (y + (h >> 1)));
                    if (d.rotate) c.rotate(d.rotate * cloudRadians);
                    c.fillText(d.text, 0, 0);
                    if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
                    c.restore();

                    d.width = w;
                    d.height = h;
                    d.x = x;
                    d.y = y;
                    d.x1 = w>>1;
                    d.y1 = h>>1;
                    d.x0 = -d.x1;
                    d.y0 = -d.y1;
                    d.timeStep = i;
                    d.streamHeight = frequencyScale(d.frequency);
                    x += w;
                }
            });
        }
        for(var bc = 0; bc < data.length; bc++){
            boxes.topics.forEach(topic=>{
                var words = data[bc].words[topic];
                var n = words.length;
                var di=-1;
                var d = {};
                while (++di < n) {
                    d = words[di];
                    var w = d.width,
                        h = d.height,
                        x = d.x,
                        y = d.y;

                    var pixels = c.getImageData(d.x, d.y, d.width, d.height).data;
                    d.sprite = Array();
                    for(var i = 0; i<<2 < pixels.length; i++){
                        d.sprite.push(pixels[i<<2]);
                    }
                }
            });
        }
        //Only return this to test if needed
        return c.getImageData(0, 0, cw, ch);
    }
    function calculateTotalFrequenciesABox(data){
        var topics = d3.keys(data[0].words);
        var totalFrequenciesABox = Array();
        d3.map(data, function(row){
            var aBox = {};
            topics.forEach(topic =>{
                var totalFrequency = 0;
                row.words[topic].forEach(element => {
                    totalFrequency += element.frequency;
                });
                aBox[topic] = totalFrequency;
            });
            totalFrequenciesABox.push(aBox);
        });
        return totalFrequenciesABox;
    }
    //#endregion
    //#region defining the spirals
    function achemedeanSpiral(size){
        var e = size[0]/size[1];
        return function(t){
            return [e*(t *= .1)*Math.cos(t), t*Math.sin(t)];
        }
    };
    function rectangularSpiral(size){
        var dy = 4,
            dx = dy *size[0]/size[1],
            x = 0,
            y = 0;
        return function(t){
            var sign = t < 0 ? -1 : 1;
            switch((Math.sqrt(1 + 4*sign*t) - sign) & 3){
                case 0: x += dx; break;
                case 1: y += dy; break;
                case 2: x -= dx; break;
                default: y -= dy; break;
            }
        }
    };
    var spirals = {
        achemedean: achemedeanSpiral,
        rectangular: rectangularSpiral
    }
    function cloudCanvas() {
        return document.createElement("canvas");
    }
    //#endregion
    //#region exposed methods to test, should be deleted
    wordStream.getImageData = getImageData;
    wordStream.cloudCollide = cloudCollide;
    wordStream.place = place;
    wordStream.buildSvg = buildSvg;
    wordStream.buildCanvas = buildCanvas;
    wordStream.buildBoard = buildBoard;
    wordStream.placeWordToBoard = placeWordToBoard;
    wordStream.buildBoxes = buildBoxes;
    wordStream.buildFontScale = buildFontScale;
    //#endregion
    //Exporting the functions to set configuration data
    //#region setter/getter functions
    wordStream.interpolate = function(_){
        return arguments.length ? (interpolation = _, wordStream) : interpolation;
    }
    wordStream.streamPath1 = function(_){
        return arguments.length ? (streamPath1 = _, wordStream) : streamPath1;
    }
    wordStream.streamPath2 = function(_){
        return arguments.length ? (streamPath1 = _, wordStream) : streamPath2;
    }
    wordStream.font = function(_){
        return arguments.length ? (font = _, wordStream): font;
    }
    wordStream.frequencyScale = function(_){
        return arguments.length ? (frequencyScale = _, wordStream) : frequencyScale;
    }
    wordStream.spiral = function(_){
        return arguments.length ? (spiral = spirals[_]|| _, wordStream) : spiral;
    }
    wordStream.data = function(_) {
        return arguments.length ? (data = _, wordStream) : data;
    };
    wordStream.size = function(_){
        return arguments.length ? (size = _, wordStream) : size;
    };
    wordStream.maxFontSize = function(_){
        return arguments.length ? (maxFontSize = _, wordStream) : maxFontSize;
    };
    wordStream.minFontSize = function(_){
        return arguments.length ? (minFontSize = _, wordStream) : minFontSize;
    };
    wordStream.minSud = function (_) {
        return arguments.length ? (minSud = _, wordStream) : minSud;
    };
    wordStream.maxSud = function (_) {
        return arguments.length ? (maxSud = _, wordStream) : maxSud;
    };
    wordStream.minFreq = function (_) {
        return arguments.length ? (minFreq = _, wordStream) : minFreq;
    };
    wordStream.maxFreq = function (_) {
        return arguments.length ? (maxFreq = _, wordStream) : maxFreq;
    };
    wordStream.fontScale = function(_){
        return arguments.length ? (fontScale = _, wordStream) : fontScale;
    };
    wordStream.font = function (_) {
        return arguments.length ? (font = _, wordStream) : font;
    };
    wordStream.flag = function(_){
        return arguments.length ? (flag = _, wordStream) : flag;
    };
    //#endregion
    return wordStream;
};