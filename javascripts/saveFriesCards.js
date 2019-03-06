
var data3;
var nodes3 =[];
var links3 =[];
  

function saveTimeArcsData() {
  console.log("*********** saveTimeArcsData ******************");
  var csvContent = "";
 /*
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "aaaavvv.tsv");
  link.click(); // This will download the data file named "my_data.csv".
   console.log("*********** DONE save ******************");*/
 
  nodes3List ={}; 
  nodes.forEach(function(d, index){
     if (nodes3List[d.name]==undefined){
        var nod = {};
        nod.name = d.name;
        nod.id = d.id;
        nod.index = nodes3.length;  // The index make sure id start from 0;
        nodes3.push(nod);
        nodes3List[d.name] = nod;
     } 
     else{
      //if (d.id>nodes3List[d.name].id)
      //  console.log("d.id="+d.id+" nodes3List[d.name]="+nodes3List[d.name].id);
     }    
  });

  links3List ={}; 
  links.forEach(function(d, index){
    var sourceName = d.source.name;
    var targetName = d.target.name;
    var source3 = nodes3List[sourceName];
    var target3 = nodes3List[targetName];
    if (links3List[sourceName+"__"+targetName]==undefined){
        var lin = {};
        lin.name = sourceName+"__"+targetName;
        lin.id = source3.id+target3.id;
        lin.source = source3;
        lin.target = target3;
        lin.count=1;
        links3.push(lin);
        links3List[lin.name] = lin;
    } 
    else{
      links3List[sourceName+"__"+targetName].count++;
    }
  });

  csvContent +=  "{"+ "\n";
  csvContent +=  '"nodes": ['+ "\n"

  nodes3.forEach(function(d, index){
    csvContent += "\t"+'{"id": "'+d.index+'", "name": "'+ d.name +'", "group": '+ 1+'}';
    //csvContent += "\t"+'{"id": "'+d.index+'", "group": '+ 1+'}';
    if (index<nodes3.length-1)
      csvContent +="," + "\n"; 
    else
      csvContent += "\n"+"],"+"\n"; 
  });

  csvContent +=  '"links": ['+"\n";

  links3.forEach(function(d, index){
    var source3 = d.source;
    var target3 = d.target;
    csvContent += "\t"+'{"source": "'+source3.index+'", "target": "'+ target3.index +'", "value": '+ d.count+'}';
    if (index<links3.length-1)
      csvContent +="," + "\n"; 
    else
      csvContent += "\n"+"]"+"\n"; 
  });

  csvContent +=  "}";


 // var data = "{name: ['Bob','aa'], occupation: 'Plumber'}";
  var url = 'data:text;charset=utf8,' + encodeURIComponent(csvContent);
  window.open(url, '_blank');
  window.focus();
}