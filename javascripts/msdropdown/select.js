function createByJson() {
}
$(document).ready(function(e) {   
  //no use
  try {
    var pages = $("#pages").msDropdown({on:{change:function(data, ui) {
                        var val = data.value;
                        if(val!="")
                          window.location = val;
                      }}}).data("dd");

    var pagename = document.location.pathname.toString();
    pagename = pagename.split("/");
    pages.setIndexByValue(pagename[pagename.length-1]);
    $("#ver").html(msBeautify.version.msDropdown);
  } catch(e) {
    //console.log(e); 
  }
  
  $("#ver").html(msBeautify.version.msDropdown);
    
  //convert
  $("#datasetsSelect").msDropdown({roundedBorder:false});
  $("#tech").data("dd");
});
function showValue(h) {
  console.log(h.name, h.value);
}
$("#tech").change(function() {
  console.log("by jquery: ", this.value);
})
//