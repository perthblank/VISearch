class RiverChart extends VisChart
{
    constructor(parentID)
    {
        super(parentID);
        this.inited = false; 
    }

    present(meta)
    {
        if(!this.inited)
        {
            this.init(meta);
            this.inited = true;
        }

        this.update(meta);
    }

    update(meta)
    {
        var g = this.g;

        var stack = d3.stack().keys(meta.keys);
        var stackedData = stack(meta.data);

  	this.z.domain(meta.keys);
        this.y.domain((d3.extent(stackedData[stackedData.length-1], function(d) { return d[1]; })));

        var z = this.z;
        var x = this.x;
        var y = this.y;
        var area = this.area;
        var svg = this.svg;

        g.selectAll(".layer").remove();

  	var layers = g.selectAll(".layer")
  	  .data(stackedData);

        //layers
        //  .selectAll("path")
  	//    .attr("class", "area")
  	//    .style("fill", function(d) { 
        //        console.log("update");
        //        console.log(d); 
        //        return z(d.key); })
  	//    .attr("d", area);

  	layers.enter()
          .append("g")
  	    .attr("class", "layer")
          //.merge(layers)
  	  .append("path")
  	    .attr("class", "area")
  	    .style("fill", function(d) { console.log(d); return z(d.key); })
  	    .attr("d", area);

        //layers.exit().remove();

        // ----
        //g.selectAll(".layer").attr("opacity", 1)
	//.on("mouseover", function(d, i) {
    	//    svg.selectAll(".layer").transition()
    	//    .duration(250)
    	//    .attr("opacity", function(d, j) {
    	//        return j != i ? 0.6 : 1;
        //    })
        //    tooltip.html( "<p>" + d.key + "<br>" + "</p>" ).style("visibility", "visible");
	//}).on("mouseout", function(d, i) {
        //    svg.selectAll(".layer")
        //    .transition()
        //    .duration(250)
        //    .attr("opacity", "1"); 

        //    //tooltip.html("");
        //}).on("mousemove", function(d, i) {
        //    var mousex = d3.mouse(this);
        //    mousex = mousex[0]+20;
        //    var offset = Math.round(x.invert(mousex).getYear()-90);
	//    var val = (d[offset][1]-d[offset][0]);
        //    tooltip.html("<p>" + d.key + " on " + (offset+1990) +  "<br>" + val + " paper(s)</p>" ).style("visibility", "visible");
   	//}).on("click",function(d,i){

        //    var mousex = d3.mouse(this);
        //    mousex = mousex[0]+20;
        //    var offset = Math.round(x.invert(mousex).getYear()-90);
        //    var year = offset+1990;
        //    searchList(d.key, year);
        //    d3.event.stopPropagation();
        //});

        g.selectAll(".axis--y")
  	    .call(d3.axisLeft(this.y));
    }

    init(meta)
    {
        var keys = meta["keys"];
        var data = meta["data"];
        var svg = super.svg,
            margin = super.margin;
        
        var parseTime = this.parseTime;

        data.forEach(function(e){
            e.year = parseTime(e["year"]);
        });
        
        var x = this.x,
            y = d3.scaleLinear().range([this.gHeight, 0]),
            z = d3.scaleOrdinal(d3.schemeCategory10);

        var area = d3.area()
            .x(function(d, i) { return x(d.data.year); })
            .y0(function(d) {return y(d[0]); })
            .y1(function(d) {return y(d[1]); });
        
        this.g.append("g")
  	    .attr("class", "axis axis--y");

        var vertical = d3.select("#"+this.parentID)
          .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "119")
            .style("width", "1px")
            .style("height", (this.gHeight+30)+"px")
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

        this.y = y;
        this.z = z;
        this.area = area;
    }
}

