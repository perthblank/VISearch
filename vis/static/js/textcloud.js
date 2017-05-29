class TextCloud
{
    constructor(parentID)
    {
        this._parentID = parentID; 
    }

    present(words)
    {
        llog(words);
        var parentID = this._parentID;
        
        var layout = d3.layout.cloud()
            .size([$(document).width()*0.9, 500])
            .words(words)
            .padding(5)
            //.rotate(function() { return ~~(Math.random() * 2) * 90; })
            .rotate(function() { return 0; })
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", function(words){
                var fill = d3.scaleOrdinal(d3.schemeCategory20);
                d3.select("#"+parentID).selectAll("*").remove();
                d3.select("#"+parentID).append("svg")
                    .attr("width", layout.size()[0])
                    .attr("height", layout.size()[1])
                  .append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                  .selectAll("text")
                    .data(words)
                  .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) { return fill(i); })
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; });
           
            });
        
        layout.start();
    }

    draw(words) 
    {
    }
}

