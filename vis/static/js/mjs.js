function aalert(data)
{
    alert(JSON.stringify(data));
}

var server_ip = "127.0.0.1"
var port = "8000"
//var searchLine_url = "/search/line/"
//var searchRiver_url = "/search/river/"
//var searchHeat_url = "/search/heat/"
var search_url = "/search/n/"
var searchList_url = "/search/list/"

var listFields = ["Paper Title","Author Names", "Year", "CiteCount", "Link" ]

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
      //      JSON.parse(e.responseText);
            errorModal();
        },
        async: false,

    });
}


function searchList(data)
{
    var meta = {"data":data};
    meta["fields"] =  listFields.join(",");
    meta["qtype"] = optionChosen["Search From"];
    sendAndGet({"metaStr": JSON.stringify(meta)}, searchList_url,"POST",presentList);
}



function presentLineChart(data)
{
    $(".dvChart").hide();
    $("#lineChart").show();
    lineChart.present(data);
}

function presentRiverChart(data)
{
    console.log(JSON.stringify(data))
    $(".dvChart").hide();
    $("#riverChart").show();
    riverChart.present(data);
}

function presentHeatChart(data)
{
    $(".dvChart").hide();
    $("#heatChart").show();
    heatChart.present(data);
}

function presentList(data)
{
    data.sort(function(a,b){
        return b.CiteCount - a.CiteCount; 
    })
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

function makeSearch()
{
    let text = $("#inpt-search").val();
    if(text=="")
        text = "lighting, texture, material, shadow";
    let data = {"content": text, "options": JSON.stringify(optionChosen)};
    let callback;
    if(optionChosen["Chart Type"] == "River")
        callback = presentRiverChart;
    else if(optionChosen["Chart Type"] == "Line")
        callback = presentLineChart;
    else
        callback = presentHeatChart;
    sendAndGet(data, search_url, "POST", callback);
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
    $("#btn-search").click(makeSearch);
    
    lineChart = new LineChart("lineChart");
    riverChart = new RiverChart("riverChart");
    heatChart = new HeatChart("heatChart");
    
    $(".btn-option").click(function(e){
        e.preventDefault();
    
        tooltip.html("");
    
        let outer = $(this).parent().parent().parent();
        let text = $(this).text();
        outer.find(".dropdownLabel").text(text);
        let label = outer.find(".olabel").attr("targ");
        optionChosen[label] = text;

    });
    
    $("html, body").animate({ scrollTop: 0}, 200); 
    
    $(".dvChart").hide();
}

