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
            e.citeCount = +e.citeCount;
        });
        
        if(!this.inited)
        {
            this.init(meta);
            this.inited = true;
        }
        else
        {
            this.update(meta.data);
        }
    }

    update(data)
    {
        var circles = this.g.selectAll(".dot").data(data);

        circles.enter().append("circle")
            .attr("class", "dot")
          .merge(circles)
            .transition()
            .attr("r", function(d){
                if(d.citeCount==0) 
                    return 0;
                return Math.log(d.citeCount)*3})
            .attr("cx", this.xMap)
            .attr("cy", this.yMap)
            .style("fill", function(d) 
                    { return "#bb3455";});


        circles.exit().remove();
    }

    init(meta)
    {
        var svg =  this.svg
        var margin = this.margin;
        var g = this.g;

        var confs = meta.confs;
        var data = meta.data;

        var xValue = function(d) { return d.year;},
            x = this.x,
            xMap = function(d) { return x(xValue(d));};
        
        var yValue = function(d) { return d.conf;}, 
            y = d3.scaleOrdinal()
                     //.domain(confs)
                     .domain(["vast",'infovis',"scivis","vis"])
                     .range([this.gHeight*0.95, this.gHeight*0.65, this.gHeight*0.35, this.gHeight*0.05]);

            var yMap = function(d) { return y(yValue(d));};
        
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var parseDate = d3.timeParse("%Y");
        
        g.append("g")
            .attr("class",".y-axis")
            .call(d3.axisLeft(y));

        this.y = y;
        this.xMap = xMap;
        this.yMap = yMap;

        this.update(data);

    }

}
