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
            margin = {top: 20, right: 20, bottom: 30, left: 50};


        var chartDiv = document.getElementById(this.parentID);
        var divWidth = chartDiv.clientWidth;
        var divHeight = chartDiv.clientHeight;

        svg.attr("width",divWidth-100);
        svg.attr("height",divHeight-100);


        var width = svg.attr("width") - margin.left - margin.right,
            height = svg.attr("height") - margin.top - margin.bottom;
        
        var parseDate = d3.timeParse("%Y");

        data.forEach(function(e){
            e.date = parseDate(e["year"]);
        });
        
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

            //tooltip.html("");
        }).on("mousemove", function(d, i) {
            var mousex = d3.mouse(this);
            mousex = mousex[0]+20;
            var offset = Math.round(x.invert(mousex).getYear()-90);
	    var count = (d[offset][1]-d[offset][0]);
            var year = offset+1990;
            var html = getTooltipHtml(criterion, groupby, d.key, searchKey, year, count);

            tooltip.html(html).style("visibility", "visible");

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
  	    .call(d3.axisLeft(y));

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
    }
}
