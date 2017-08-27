var default_color = {"text":"steelblue","keyword":"red"};

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "remove")
  .style("position", "fixed")
  .style("z-index", "20")
  .style("visibility", "hidden")
  .style("top", "80px")
  .style("right", "65px");

function getTooltipHtml(criterion, groupby, dKey, searchKey, year, count)
{
  var html = "";
  if(criterion == "Cited Time")
  {
    if(groupby == "Multiple Words")
    {
      html = "<p> key word: " +dKey;
    }
    else
    {
      html = "<p> key word: " +searchKey + 
        "<br/>conference: " + dKey;
    }
    html += "<br/>year: " + year +  
    "<br/>cited " + count + " times(s)</p>";
  }
  else
  {
    if(groupby == "Multiple Words")
      html = "<p> key word: " +dKey;
    else 
    {
      html = "<p> key word: " +searchKey + 
      "<br/> conference: " +dKey;
    }
    html += "<br/>year: " + year +  
    "<br/>appeared in " + count + " paper(s)</p>";
  }

  return html;
}
 

class VisChart
{
  constructor(parentID)
  {
    this._parentID = parentID;
    this._margin = {top: 20, right: 50, bottom: 30, left: 50};

    this._parseTime = d3.timeParse("%Y");
    var startYear = 1990, endYear = 2015;

    var chartDiv = document.getElementById(parentID);
    this._svgWidth = chartDiv.clientWidth-100;
    this._svgHeight = chartDiv.clientHeight-40;
    this._gWidth = this.svgWidth - this.margin.left - this.margin.right,
    this._gHeight = this.svgHeight - this.margin.top - this.margin.bottom;

    this._x = d3.scaleTime()
      .rangeRound([0, this.gWidth])
      .domain([this.parseTime(startYear), this.parseTime(endYear)]);

    var svg = d3.select("#"+parentID).append("svg");
    svg.attr("width",this.svgWidth);
    svg.attr("height",this.svgHeight);

    var g = svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    g.append("g")
      .attr("transform", "translate(0," + this.gHeight + ")")
      .call(d3.axisBottom(this.x));

    this._svg = svg;
    this._g = g;
  }

  get g()
  {
    return this._g;
  }

  get svg()
  {
    return this._svg;
  }

  get parentID()
  {
    return this._parentID;
  }

  get margin()
  {
    return this._margin;
  }

  get parseTime()
  {
    return this._parseTime;
  }

  get svgWidth()
  {
    return this._svgWidth;
  }

  get svgHeight()
  {
    return this._svgHeight;
  }

  get gWidth()
  {
    return this._gWidth;
  }

  get gHeight()
  {
    return this._gHeight;
  }

  get x()
  {
    return this._x;
  }

}

class LineChart extends VisChart
{
  constructor(parentID)
  {
    super(parentID);
    this.inited = false; 
  }

  present(meta)
  {
    var te = meta["text"];
    var kw = meta["keyword"];
    var parseTime = super.parseTime;

    te.forEach(function(e){
      e.year = parseTime(e.year); 
    });

    kw.forEach(function(e){
      e.year = parseTime(e.year); 
    });

    if(!this.inited) 
    {
      this.init(te, "text");
      this.init(kw, "keyword");
      this.inited = true;
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
    var svg = super.svg;

    var margin = super.margin;

    var y = d3.scaleLinear()
      .rangeRound([super.gHeight, 0]);
    var x = super.x;

    y.domain(d3.extent(data, function(d) { return d.count; }));

    var line = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.count); });
     
    var axis;
     
    if(label=="text")
      axis = super.g.append("g")
        .call(d3.axisLeft(y));
    else
      axis = super.g.append("g")
        .attr("transform", "translate( " + super.gWidth + ", 0 )")
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

    super.g.append("path")
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
