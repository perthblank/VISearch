class RiverChart 
{
  constructor(parentID)
  {
    this.inited = false; 
    this.parentID = parentID;
  }

  convertToRiverData(meta)
  {
    var keys = meta.keys;
    var data = meta.data;
    var ndata = [];
    var curyear = 1990-1;
    var parseDate = d3.timeParse("%Y");

   
    data.forEach(function(e){
      while(curyear<e.year)
      {
        curyear += 1;
        var ob = {};
        keys.forEach(function(k){
          ob[k] = 0;
        });
        ob["year"] = curyear;
        ndata.push(ob);
      }
      ndata[ndata.length-1][e.key] += +e.count;
    });

    while(curyear<2015)
    {
      var ob = {};
      curyear += 1;
      keys.forEach(function(k){
        ob[k] = 0;
      });
      ob["year"] = curyear;
      ndata.push(ob);
    }

    meta.data = ndata;
    meta.data.forEach(function(e){
      e.date = parseDate(e["year"]);
    });
    return meta;
  }

  present(meta)
  {
    meta = this.convertToRiverData(meta);

    d3.select("#"+this.parentID).selectAll("*").remove();
    var keys = meta.keys;
    var data = meta.data;
    var criterion = meta.criterion;
    var searchKey = meta.search;
    var groupby = meta.groupby;
    var svg = d3.select("#"+this.parentID).append("svg"),
      margin = {top: 20, right: 50, bottom: 30, left: 50};


    var chartDiv = document.getElementById(this.parentID);
    var divWidth = chartDiv.clientWidth;
    var divHeight = chartDiv.clientHeight;

    svg.attr("width",divWidth-100);
    svg.attr("height",divHeight-30);


    var width = svg.attr("width") - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom;
    
   
    var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);

    
    var stack = d3.stack();
    
    var area = d3.area()
      .x(function(d, i) { return x(d.data.date); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });
    
    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

    x.domain(d3.extent(data, function(d) { return d.date; }));
    z.domain(keys);

    stack.keys(keys);

    var stackedData = stack(data)

    y.domain((d3.extent(stackedData[stackedData.length-1], function(d) { return d[1]; })));
    //console.log(y.domain([0, y.domain()[1]]));

    var layer = g.selectAll(".layer")
      .data(stackedData)
      .enter().append("g")
      .attr("class", "layer");

    layer.append("path")
      .attr("class", "area")
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

    layer//.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
      .append("text")
      .attr("x", width - 6)
      .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
      .attr("dy", ".35em")
      .style("font", "10px sans-serif")
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });

    layer.attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 0.6 : 1;
        })
      }).on("mouseout", function(d, i) {
        svg.selectAll(".layer")
        .transition()
        .duration(250)
        .attr("opacity", "1"); 
      }).on("mousemove", function(d, i) {
        var mouse = d3.mouse(this);
        var mousex = mouse[0]+20;
        var offset = Math.round(x.invert(mousex).getYear()-90);
        var count = (d[offset][1]-d[offset][0]);
        var year = offset+1990;
        var html = getTooltipHtml(criterion, groupby, d.key, searchKey, year, count);

        tooltip.html(html).style("visibility", "visible");
        tooltip.style("left", mousex + 50);
        tooltip.style("top", mouse[1] + 50);

       }).on("click",function(d,i){

      var mousex = d3.mouse(this);
      mousex = mousex[0]+20;
      var offset = Math.round(x.invert(mousex).getYear()-90);
      var year = offset+1990;
      if(groupby=="Conferences")
      {
        searchList({"conference": d.key, "key": searchKey, "year":year});
      }
      else
        searchList({"key": d.key, "year":year});
      d3.event.stopPropagation();
    });

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y)
        .ticks(Math.min(y.domain()[1], 10))
      )
      .append("text")
        .attr("transform", "translate(0,0), rotate(-90)")
        .attr("y", 5)
        .attr("dy", "0.8em")
	.attr("fill", "black")
        .text("Each Year");



    var vertical = d3.select("#"+this.parentID)
      .append("div")
      .attr("class", "remove")
      .style("position", "absolute")
      .style("z-index", "119")
      .style("width", "1px")
      .style("height", (height+30)+"px")
      .style("top", "10px")
      .style("bottom", "3px")
      .style("left", "0px")
      .style("background", "#fff");
    
    d3.select("#"+this.parentID)
      .on("mousemove", function(){  
         var mousex = d3.mouse(this);
         mousex = mousex[0];
         vertical.style("left", (mousex +5) + "px" )})
      .on("mouseover", function(){  
         var mousex = d3.mouse(this);
         mousex = mousex[0];
         vertical.style("left", (mousex +5) + "px")});

    svg.on("click",function(){
      $("html, body").animate({ scrollTop: 0}, 200); 
    });


    // draw acc lines
    // use previous g
    // data form [{id, key, values:[{date, val}]}]

    for(let i = 1; i<meta.data.length; ++i)
      meta.keys.forEach(k => {
        meta.data[i][k] += meta.data[i-1][k];
      });

    let accData = [];
    for(let i = 0; i<meta.keys.length; ++i) {
      let el = {};
      let key = meta.keys[i];
      el.id = i;
      el.key = key;
      el.values = [];
      for(let k = 0; k<meta.data.length; ++k) {
        el.values.push({
          date: meta.data[k].date, 
          val: meta.data[k][key]
        });
      }
      accData.push(el);
    }



    //var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

    y.domain([
      0,
      d3.max(accData, function(c) { return d3.max(c.values, function(d) { return d.val; }); })
    ]);

    z.domain(accData.map(function(c) { return c.id; }));

    var line = d3.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.val); })
      .y1(function(d) { return y(d.val-y.domain()[1]/100); });

    let acc_y = g.append("g")
        .attr("class", "axis axis--y acc-el")
        .call(d3.axisRight(y))
        .attr("transform", "translate(" + (width) + ",0)")
      .append("text")
        .attr("transform", "translate(0,50), rotate(-90)")
        .attr("dy", "-1.0em")
	.attr("fill", "black")
        .text("Accumulate");

    var acc = g.selectAll(".acc")
      .data(accData)
      .enter().append("g")
        .attr("class", "acc acc-el");

    acc.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .attr("stroke-width", 1)
      .style("fill", function(d) { return z(d.id); })
      .style("stroke", "#fff");

    acc.append("text")
      .datum(function(d) { return {id: d.key, value: d.values[d.values.length - 2]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.val) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });

    let showAccBtn = d3.select("#"+this.parentID)
      .append("div")
      .attr("class", "checkbox")
      .style("position", "absolute")
      .style("left", "100px")
      .style("top", "20px");
    let btnLabel = showAccBtn.append("label");
    let btnInput = btnLabel.append("input")
      .attr("type", "checkbox")
      .attr("checked", "true");
    btnLabel.append("span")
      .html("Show Accumulate Curve");

    btnInput.on("click", ()=> {
      $(".acc-el").toggle();
    })
  }
}
