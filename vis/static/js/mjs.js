function aalert(data)
{
    alert(JSON.stringify(data));
}

var server_ip = "127.0.0.1"
var port = "8000"
var searchLine_url = "/search/line/"
var searchRiver_url = "/search/river/"
var searchList_url = "/search/list/"
var searchHeat_url = "/search/heat/"

var listFields = ["Paper Title","Author Names", "Year", "Link"]

function errorModal(text)
{
    if(typeof(text)==="undefined")
        text = "Cannot fulfill this request.."

    $("#errorModalP").text(text);
    $("#errorModal").fadeIn(500, function(){
    setTimeout(function(){$("#errorModal").fadeOut();},1500) 
    })
}


function sendAndGet(data, url, type, callback, arg) 
{
    $.ajax({
        url: url,
        data: data,
        type: type,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        success: function(res) {
            //console.log(res);
            callback(res,arg); 

        },
        error: function(e, status) {
            console.log(status);
            console.log(e);
            JSON.parse(e.responseText);
            errorModal();
        },
        async: false,

    });
}

function searchList(key, year)
{
    sendAndGet({key:key, year:year, fields:listFields.join(","), qtype:qtype}, searchList_url,"POST",presentList);
}


function presentLineChart(data)
{
    lineChart.present(data);
}

function presentRiverChart(data)
{
    riverChart.present(data);
}

function presentList(data)
{
    tabulate(data, listFields);
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
}


function tabulate(data, c0) 
{

    columns = c0.slice(0,-1);

    d3.select('#searchList').html("");
    var table = d3.select('#searchList').append('table')
        .attr("class", "table")
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    
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

function presentHeatChart(data)
{
    heatChart.present(data);
}

var qtype = 0;

function checkKey(event)
{
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == 13)
    {
        var text = $("#inpt-inpage-search").val();
        if(text=="")
            text = "lighting, texture, material, shadow";

        var chkKw = document.getElementById('chkKw').checked;
        var chkAb = document.getElementById('chkAb').checked;
        if(chkKw)
            qtype = 1;
        else
            qtype = 2;


        if(curFlag == "line")
            sendAndGet({"content":text}, searchLine_url,"POST",presentLineChart);
        else if(curFlag == "river")
            sendAndGet({"content":text, "qtype":qtype}, searchRiver_url,"POST",presentRiverChart);
        else if(curFlag == "heat")
            sendAndGet({"content":text, "qtype":qtype}, searchHeat_url,"POST",presentHeatChart);
    }
}

$("#lineChartSvg").hide(); 
$("#inpt-inpage-search").keydown(function(e){checkKey(e);});

var lineChart = new LineChart("lineChart");
var riverChart = new RiverChart("riverChart");
var heatChart = new HeatChart("heatChart");

var curFlag = "river";

$(".btn-chart-type").click(function(e){
    e.preventDefault();

    tooltip.html("");

    $("#dropdownLabel").text($(this).text());
    curFlag = $(this).attr("targ");

    if(curFlag=="line")
    {
        $("#lineChart").show(); 
        $("#riverChart").hide(); 
        $("#heatChart").hide(); 
        $("#chkbox").hide();
    }
    else if(curFlag == "river")
    {
        $("#lineChart").hide(); 
        $("#riverChart").show(); 
        $("#heatChart").hide(); 
        $("#chkbox").show();
    }
    else if(curFlag == "heat")
    {
        $("#lineChart").hide(); 
        $("#riverChart").hide(); 
        $("#heatChart").show(); 
        $("#chkbox").show();
    }
});

$("html, body").animate({ scrollTop: 0}, 200); 


$("#lineChart").hide(); 
$("#riverChart").show(); 
$("#heatChart").hide(); 
$("#chkbox").show();

var data = [
    [300,200,5],
    [300,230,14],
    [330,215,10],
]

//var heat = simpleheat('canvasHeat').data(data).max(18).radius(40,15);
//
//function draw() {
//    heat.draw();
//}
//
//heat.mixMode("superimposed");
//
//draw();
//
//
