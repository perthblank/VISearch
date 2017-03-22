function aalert(data)
{
    alert(JSON.stringify(data));
}

var server_ip = "127.0.0.1"
var port = "8000"
var search_url = "/search/"
var searchRiver_url = "/search/river/"

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
    //var rest = server_ip + ":" + port + "" + url;

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
        error: function(e) {
            console.log(e);
            errorModal();
        },
        async: false,

    });
}



function handle0(data)
{
    //alert(JSON.stringify(data));
    lineChart.present(data);
}

function handle1(data)
{
    riverChart.present(data);
}

function checkKey(event)
{
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == 13)
    {
        let text = $("#inpt-inpage-search").val();
        if(text=="")
            text = "lighting, texture, material, shadow";
        if(curFlag == "line")
            sendAndGet({"content":text}, search_url,"POST",handle0);
        else
        {
            var qtype = 0;
            var chkKw = document.getElementById('chkKw').checked;
            var chkAb = document.getElementById('chkAb').checked;

            if(!chkAb && !chkKw)
            {
                alert("choose query field");
                return;
            }

            if(chkKw && chkAb)
                qtype = 3;
            else if(chkKw)
                qtype = 1;
            else
                qtype = 2;
            sendAndGet({"content":text, "qtype":qtype}, searchRiver_url,"POST",handle1);
        }
    }
}

$("#lineChartSvg").hide(); 
$("#inpt-inpage-search").keydown(function(e){checkKey(e);});

var lineChart = new LineChart("lineChartSvg");
var riverChart = new RiverChart("riverChartSvg");

var curFlag = "river";

$(".btn-chart-type").click(function(e){
    e.preventDefault();

    tooltip.html("");

    $("#dropdownLabel").text($(this).text());
    if($(this).attr("targ")=="line")
    {
        $("#lineChartSvg").show(); 
        $("#riverChartSvg").hide(); 
    }
    else
    {
        $("#lineChartSvg").hide(); 
        $("#riverChartSvg").show(); 
    }
    curFlag = $(this).attr("targ");
});
