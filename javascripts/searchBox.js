function addSearchBox() {
  //===============================================
  $("#searchName").on("select2-selecting", function(e) {
      clearAll(root);
      clearAll(rootSearch);
      expandAll(rootSearch);
      updateSearch(rootSearch);

      searchField = "d.name";
      searchText = e.object.text;
      searchTree(rootSearch);
      rootSearch.children.forEach(collapseAllNotFound);
      updateSearch(rootSearch);
  })

   treeSearch = d3.layout.tree()
      .size([height, width]);

   diagonal = d3.svg3.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

    rootSearch = root;
    rootSearch.x0 = height / 2;
    rootSearch.y0 = 0;

    select2Data = [];
    select2DataCollectName(rootSearch);
    select2DataObject = [];
    select2Data.sort(function(a, b) {
              if (a > b) return 1; // sort
              if (a < b) return -1;
              return 0;
          })
          .filter(function(item, i, ar) {
              return ar.indexOf(item) === i;
          }) // remove duplicate items
          .filter(function(item, i, ar) {
              select2DataObject.push({
                  "id": i,
                  "text": item
              });
          });
      select2Data.sort(function(a, b) {
              if (a > b) return 1; // sort
              if (a < b) return -1;
              return 0;
          })
          .filter(function(item, i, ar) {
              return ar.indexOf(item) === i;
          }) // remove duplicate items
          .filter(function(item, i, ar) {
              select2DataObject.push({
                  "id": i,
                  "text": item
              });
          });
    $("#searchName").select2({
          data: select2DataObject,
          containerCssClass: "search"
    });
    rootSearch.children.forEach(collapse);
    updateSearch(rootSearch);
 } 
 

//===============================================
function select2DataCollectName(d) {
    if (d.children)
        d.children.forEach(select2DataCollectName);
    else if (d._children)
        d._children.forEach(select2DataCollectName);
    select2Data.push(d.name);
}

//===============================================
function searchTree(d) {
    if (d.children)
        d.children.forEach(searchTree);
    else if (d._children)
        d._children.forEach(searchTree);
    var searchFieldValue = eval(searchField);
    if (searchFieldValue && searchFieldValue.match(searchText)) {
            // Walk parent chain
            var ancestors = [];
            var parent = d;
            while (typeof(parent) !== "undefined") {
                ancestors.push(parent);
        //console.log(parent);
                parent.class = "found";
                parent = parent.parent;
            }
        //console.log(ancestors);
    }
}

//===============================================
function clearAll(d) {
    d.class = "";
    if (d.children)
        d.children.forEach(clearAll);
    else if (d._children)
        d._children.forEach(clearAll);
}

//===============================================
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

//===============================================
function collapseAllNotFound(d) {
    if (d.children) {
        if (d.class !== "found") {
            d._children = d.children;
            d._children.forEach(collapseAllNotFound);
            d.children = null;
    } else 
            d.children.forEach(collapseAllNotFound);
    }
}

//===============================================
function expandAll(d) {
    if (d._children) {
        d.children = d._children;
        d.children.forEach(expandAll);
        d._children = null;
    } else if (d.children)
        d.children.forEach(expandAll);
}

//===============================================
// Toggle children on click.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  clearAll(rootSearch);
  updateSearch(d);
  $("#searchName").select2("val", "");
}


//===============================================
function updateSearch(source) {

  // Compute the new tree layout.
  var nodesSeach = treeSearch.nodes(rootSearch).reverse(),
      linksSearch = treeSearch.links(nodesSeach);

  // Normalize for fixed-depth.
  nodesSeach.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var nodeSearch = svg3.selectAll("g.nodeSearch")
      .data(nodesSeach, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter2 = nodeSearch.enter().append("g")
      .attr("class", "nodeSearch")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", toggle);

  nodeEnter2.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter2.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = nodeSearch.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) {
            if (d.class === "found") {
                return "#ff4136"; //red
            } else if (d._children) {
                return "lightsteelblue";
            } else {
                return "#fff";
            }
        })
        .style("stroke", function(d) {
            if (d.class === "found") {
                return "#ff4136"; //red
            }
        });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = nodeSearch.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var linkSearch = svg3.selectAll("path.linkSearch")
      .data(linksSearch, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  linkSearch.enter().insert("path", "g")
      .attr("class", "linkSearch")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  linkSearch.transition()
      .duration(duration)
      .attr("d", diagonal)
      .style("stroke", function(d) {
            if (d.target.class === "found") {
                return "#ff4136";
            }
        });

  // Transition exiting nodes to the parent's new position.
  linkSearch.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodesSeach.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}


  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }