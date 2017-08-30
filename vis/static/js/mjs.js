function aalert(data)
{
  alert(JSON.stringify(data));
}

function llog(data)
{
  console.log(JSON.stringify(data));
}

var server_ip = "127.0.0.1"
var port = "8000"
var search_url = "/search/n/"
var searchList_url = "/search/list/"
var searchCloud_url = "/search/cloud/"

var listFields = ["Paper Title","Author Names", "Year", "CiteCount", "Link" ]

function showLoading(callback) {

  $("#loadingModal").modal("show");
  $("#loadingModal").on("shown.bs.modal",callback);
}

function hideLoading() {
  $("#loadingModal").modal("hide");
}


function errorModal(text)
{
  if(typeof(text)==="undefined")
    text = "Cannot fulfill this request.."

  $("#errorModalP").text(text);
  $("#errorModal").fadeIn(500, function(){
  setTimeout(function(){$("#errorModal").fadeOut();},1500) 
  })
}


function sendAndGet(data, url, type, callback, arg, modal) 
{
  
  var exec = function(){
    $.ajax({
      url: url,
      data: data,
      type: type,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      success: function(res) {
        callback(res,arg); 
        hideLoading();
      },
      error: function(e, status) {
        console.log(status);
        console.log(e);
        errorModal();
      },
      async: true,
    });
  };

  if(modal===undefined)
    exec();
  else
    showLoading(exec);
}

function resetWidget()
{
  $(".dvChart").hide();
  tooltip.html("");
}

function presentLineChart(data)
{
  resetWidget();
  $("#lineChart").show();
  lineChart.present(data);
}

function presentRiverChart(data)
{
  resetWidget();
  $("#riverChart").show();
  riverChart.present(data);
}

function presentHeatChart(data)
{
  resetWidget();
  $("#heatChart").show();
  heatChart.present(data);
}

function presentTextCloud(data)
{
  resetWidget();
  $("#cloudChart").show();
  var cloudID = "cloudChart";
  var textCloud = new TextCloud(cloudID);
  textCloud.present(getCloudList(data));
}

function searchList(query)
{
  var meta = {"query":query};
  meta["fields"] =  listFields.join(",");
  meta["qtype"] = optionChosen["Search From"];
  sendAndGet({"metaStr": JSON.stringify(meta)}, searchList_url,"POST",presentList);
}

function presentList(res)
{
  var data = res["res"];
  var metaStr = res["metaStr"];

  data.sort(function(a,b){
    return b.CiteCount - a.CiteCount; 
  })
  tabulate(data, listFields);
  //$("html, body").animate({ scrollTop: $(document).height() }, 1000);

  d3.select('#searchList').append("h3").text("Text Cloud");

  sendAndGet({"metaStr": metaStr}, searchCloud_url, "POST", presentCloudUnderList);
}

function getCloudList(res)
{
  var list = Object.keys(res).map(function(d){
    return {text: d, size: d==""?0:res[d]}; 
  }).sort(function(a,b){
    return b.size-a.size;
  });

  list = list.slice(0,40);
  var range = d3.extent(list, function(d){return d.size});
  list.forEach(function(d){
    d.size = (d.size-range[0])/(range[1]-range[0])*50+30;
  })

  return list;
}

function presentCloudUnderList(res)
{
  var cloudID = "searchListCloud";

  d3.select('#searchList')
    .append("div")
    .attr("id", cloudID);

  var textCloud = new TextCloud(cloudID);
  textCloud.present(getCloudList(res));
  $("html, body").animate({ scrollTop: $(document).height() }, 1000);
}


function tabulate(data, c0) 
{
  columns = c0.slice(0,-1);

  d3.select('#searchList').html("");

  d3.select('#searchList').append("h3").text("Paper List");
  var table = d3.select('#searchList').append('table')
    .attr("class", "table")
  var thead = table.append('thead')
  var  tbody = table.append('tbody');
  
  thead.append('tr')
    .selectAll('th')
    .data(columns).enter()
    .append('th')
    .text(function (column) { return column; });
  
  var rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr');
  
  var cells = rows.selectAll('td')
    .data(function (row) {
    return columns.map(function (column) {
      return {column: column, 
        value: column!= "Paper Title"? row[column]: "<a href='"+row["Link"]+"' target='_blank'>"+row[column]+"</a>"};
    });
    })
    .enter()
    .append('td')
    .html(function (d) { return d.value; });

  return table;
}

function makeSearch(text, openNew)
{

  if(text == undefined) {
    text = $("#inpt-search").val();
  } else {
    // if search from text given -- click text cloud
    // default using abstract
    optionChosen["Search From"] = "Abstract";
  }

  if(text=="")
    if(optionChosen["Group By"]== "Conferences" || 
      optionChosen["Chart Type"]=="Text Cloud")
      text = "visualization";
    else
      text = "lighting, texture, material, shadow";

  if(optionChosen["Group By"]== "Conferences" || 
      optionChosen["Chart Type"]=="Text Cloud")
  {
    let n = text.split(',').length;
    if(n >1)
    {
      alert("Conferences mode supports only single word (or phrase) search");
      return;
    }
  }

  if(optionChosen["Search From"] !== "Keywords") {
    optionChosen["Search From"] = "Abstract";
  }

 
  let data = {"content": text, "options": JSON.stringify(optionChosen)};
  // let callback;
  // if(optionChosen["Chart Type"] == "River Chart")
  //   callback = presentRiverChart;
  // else if(optionChosen["Chart Type"] == "Heat Chart")
  //   callback = presentHeatChart;
  // else if(optionChosen["Chart Type"] == "Text Cloud")
  // {
  //   callback = presentTextCloud;
  // }
  // else
  // {
  //   console.log("no chart of "+optionChosen["Chart Type"]);
  //   return;
  // }

  // sendAndGet(data, search_url, "POST", callback, undefined, true);
  // $("#dvUsage").hide();

  let url = new URL(window.location.href).origin + "?q=" + encodeURI(JSON.stringify(data));
  if(openNew) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

function makeSearchFromQueryStr(str) {
  let data = JSON.parse(decodeURI(str));
  optionChosen = JSON.parse(data.options);

  let dropDowns = $(".dropdownLabel");
  dropDowns.each(function(index) {
    $(this).text(optionChosen[$(this).attr("targ")]);
  })
  let callback;
  if(optionChosen["Chart Type"] == "River Chart")
    callback = presentRiverChart;
  else if(optionChosen["Chart Type"] == "Heat Chart")
    callback = presentHeatChart;
  else if(optionChosen["Chart Type"] == "Text Cloud")
  {
    callback = presentTextCloud;
  }
  else
  {
    console.log("no chart of "+optionChosen["Chart Type"]);
    return;
  }

  $("#inpt-search").val(data.content);
  sendAndGet(data, search_url, "POST", callback, undefined, true);
  $("#dvUsage").hide();
}

function checkKey(event)
{
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == 13)
  {
    makeSearch();
  }
}

var optionChosen = {};
var riverChart, lineChart, heatChart;

function initWidget(navOptions)
{

  navOptions.forEach(function(e){
    optionChosen[e.label] = e.options[0];
  });

  $("#inpt-search").keydown(function(e){checkKey(e);});
  $("#btn-search").click(() => makeSearch());
  
  lineChart = new LineChart("lineChart");
  riverChart = new RiverChart("riverChart");
  heatChart = new HeatChart("heatChart");
  
  $(".btn-option").click(function(e){
    e.preventDefault();
  
    tooltip.html("");
  
    let outer = $(this).parent().parent().parent();
    let text = $(this).text();
    outer.find(".dropdownLabel").text(text);
    let label = outer.find(".olabel");
    optionChosen[label] = text;

  });
  
  $("html, body").animate({ scrollTop: 0}, 200); 
  
  $(".dvChart").hide();

  $("#btn-usage").click(function(){$("#dvUsage").toggle()});
  $("#dvUsageClick").click(function(){$("#dvUsage").hide()});

  $("#btn-back").click(goBack);
  setTimeout(checkParam, 100);
}

function getID(f, postfix) {
  // Search from => Search-from-btn
  let arr = f.split(' ');
  arr.push(postfix);
  return arr.join('-');
}

function checkParam() {

  let url_str = window.location.href;
  let url = new URL(url_str);
  let param = url.searchParams.get("q");
  if(param) {

    makeSearchFromQueryStr(param);
  }
}

function goBack() {
  let url = new URL(window.location.href);
  window.location.href = url.origin;
}
