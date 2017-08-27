class HeatChart extends VisChart
{
  constructor(parentID)
  {
    super(parentID);
    this.inited = false;
  }

  present(meta)
  {
    var parseTime = this.parseTime;
    meta.data.forEach(function(e){
      e.year = parseTime(e["year"]);
      e.count = +e.count;
    });
    
    if(!this.inited)
    {
      this.init(meta);
      this.inited = true;
    }

    this.update(meta);
  }

  update(meta)
  {
    var data = meta.data;
    var searchKey = meta.search;
    var keys = meta.keys;
    var circles = this.g.selectAll(".dot").data(data);
    var svg = this.svg;
    var x = this.x;

    var keysY = [];
    if(keys.length==1)
    {
      keysY = [this.gHeight*0.5]; 
    }
    else
    {
      for(var i = 0; i<keys.length; ++i)
      {
        keysY.push(this.gHeight*(0.95-(0.9)/(keys.length-1)*i));
      }
    }

    var yValue = function(d) { return d.key;}, 
      y = d3.scaleOrdinal()
           .domain(keys)
           .range(keysY);

    var yMap = function(d) { return y(yValue(d));};

    this.y = y;
    this.yMap = yMap;

    this.g.selectAll(".y-axis")
      .call(d3.axisLeft(y));

    var criterion = meta.criterion;
    var groupby = meta.groupby;

    circles.enter().append("circle")
      .attr("class", "dot")
      .merge(circles)
	  .on("mouseover", function(d, i) {
  	    svg.selectAll(".dot").transition()
  	      .duration(250)
  	      .attr("opacity", function(d, j) {
  	        return j != i ? 0.6 : 1;
          })
	  }).on("mouseout", function(d, i) {
        svg.selectAll(".dot")
        .transition()
        .duration(250)
        .attr("opacity", "1"); 

      }).on("mousemove", function(d, i) {
        var year = (d3.timeFormat("%Y")(d.year));
        var html = getTooltipHtml(criterion, groupby, d.key, searchKey, year, d.count);
        /*
        var html  = "";
        if(criterion == "Cited Time")
        {
          html = "<p> key word: " +searchKey + 
          "<br/>conference: " + d.key +
          "<br/>year: " + year +  
          "<br/>cited " + d.count + " times(s)</p>" 
        }
        else
        {
          html = "<p> key word: " +d.key + 
          "<br/>year: " + year +  
          "<br/>appeared in " + d.count + " paper(s)</p>" 
        }
        */
        tooltip.html(html).style("visibility", "visible");
   	  }).on("click",function(d,i){

        console.log("hclick");

        var year = +(d3.timeFormat("%Y")(d.year))
        if(groupby=="Conferences")
          searchList({"conference": d.key, "year": year, "key": searchKey});
        else
          searchList({"year": year, "key": d.key});
        d3.event.stopPropagation();
      })


      .transition()
      .attr("r", function(d){
        if(d.count==0) 
          return 0;
        return Math.sqrt(d.count+1)*3})
        //return (d.count+1)})
      .attr("cx", this.xMap)
      .attr("cy", this.yMap)
      .style("fill", function(d) 
          { return "#bb3455";})
      .attr("opacity", 1)

    circles.exit().remove();
  }

  init(meta)
  {
    var svg =  this.svg
    var margin = this.margin;
    var g = this.g;

    var keys = meta.keys;
    var keysY = [];
    for(var i = 0; i<keys.length; ++i)
    {
      keysY.push(this.gHeight*(0.95-(0.9)/(keys.length-1)*i));
    }
    var data = meta.data;

    var xValue = function(d) { return d.year;},
      x = this.x,
      xMap = function(d) { return x(xValue(d));};
    
    var yValue = function(d) { return d.key;}, 
      y = d3.scaleOrdinal()
           .domain(keys)
           .range(keysY);

    //var yMap = function(d) { return y(yValue(d));};
    
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var parseDate = d3.timeParse("%Y");
    
    g.append("g")
      .attr("class","y-axis")
      //.call(d3.axisLeft(y));

    this.y = y;
    this.xMap = xMap;
    //this.yMap = yMap;

    svg.on("click",function(){
      $("html, body").animate({ scrollTop: 0}, 200); 
    });

  }

}
