var default_color = {"text":"steelblue","keyword":"red"};

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("position", "fixed")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "80px")
    .style("left", "65px");


class VisChart
{
    constructor()
    {

    }
}

class LineChart
{
    constructor(parentID)
    {
        this.inited = false; 
        this.parentID = parentID;
    }

    present(meta)
    {
        var te = meta["text"];
        var kw = meta["keyword"];
        var parseTime = d3.timeParse("%Y");

        te.forEach(function(e){
            e.year = parseTime(e.year); 
        });

        kw.forEach(function(e){
            e.year = parseTime(e.year); 
        });


        if(!this.inited) 
        {
            this.init(te, "text");
            this.inited = true;
            this.init(kw, "keyword");
        }
        else
        {
            this.update(te, "text")
            this.update(kw, "keyword")
        }
    }

    update(data, label)
    {
        var line;
        if(label=="text")
        {
            this.yleft
                .domain((d3.extent(data, function(d) { return d.count; })));
            this.g.selectAll(".y-axis-"+label)
                .call(d3.axisLeft(this.yleft));
            line = this.line1;
        }
        else
        {
            this.yright
                .domain((d3.extent(data, function(d) { return d.count; })));
            this.g.selectAll(".y-axis-"+label)
                .call(d3.axisLeft(this.yright));
            line = this.line2;
        }

        this.g.selectAll(".line-path-"+label)
            .datum(data)
            .transition()
            .duration(300)
            .attr("d", line);
    }

    init(data, label)
    {
        var margin = {top: 20, right: 50, bottom: 30, left: 50},
          svg = d3.select("#"+this.parentID).append("svg");

        var chartDiv = document.getElementById("lineChart");
        var divWidth = chartDiv.clientWidth;
        var divHeight = chartDiv.clientHeight;

        svg.attr("width",divWidth-100);
        svg.attr("height",divHeight-100);

        var width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;


        var x = d3.scaleTime()
            .rangeRound([0, width]);
        x.domain(d3.extent(data, function(d) { return d.year; }));

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);

        y.domain(d3.extent(data, function(d) { return d.count; }));

        var line = d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.count); });
         
        if(this.inited == false)
        {
            var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            
            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            this.g = g;
        }

        var axis;
       
        if(label=="text")
            axis = this.g.append("g")
                .call(d3.axisLeft(y));
        else
            axis = this.g.append("g")
                .attr("transform", "translate( " + width + ", 0 )")
                .call(d3.axisLeft(y));

        axis.attr("class","y-axis-"+label)
            .attr("fill", default_color[label])
          .append("text")
            .attr("fill", default_color[label])
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(label);

        this.g.append("path")
            .datum(data)
            .attr("class","line-path-"+label)
            .attr("fill", "none")
            .attr("stroke", default_color[label])
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 2.0)
            .attr("d", line);

        
        if(label=="text")
        {
            this.yleft = y;
            this.line1 = line;
        }
        else
        {
            this.yright = y;
            this.line2 = line;
        }
    }
}


class RiverChart extends VisChart
{
    constructor(parentID)
    {
        super();
        this.inited = false; 
        this.parentID = parentID;
    }

    present(meta)
    {
        d3.select("#"+this.parentID).selectAll("*").remove();
        var keys = meta["keys"];
        var data = meta["data"];
        var svg = d3.select("#"+this.parentID).append("svg"),
            margin = {top: 20, right: 20, bottom: 30, left: 50};


        var chartDiv = document.getElementById("lineChart");
        var divWidth = chartDiv.clientWidth;
        var divHeight = chartDiv.clientHeight;

        svg.attr("width",divWidth-100);
        svg.attr("height",divHeight-100);


        var width = svg.attr("width") - margin.left - margin.right,
            height = svg.attr("height") - margin.top - margin.bottom;
        
        var parseDate = d3.timeParse("%Y");

        data.forEach(function(e){
            e.date = parseDate(e["year"]);
            keys.forEach(function(k){
                e[k] = e[k]
            });
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
            tooltip.html( "<p>" + d.key + "<br>" + "</p>" ).style("visibility", "visible");
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
	    var val = (d[offset][1]-d[offset][0]);
            tooltip.html("<p>" + d.key + " on " + (offset+1990) +  "<br>" + val + "</p>" ).style("visibility", "visible");
   	}).on("click",function(d,i){

            var mousex = d3.mouse(this);
            mousex = mousex[0]+20;
            var offset = Math.round(x.invert(mousex).getYear()-90);
            var year = offset+1990;
            searchList(d.key, year);
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

