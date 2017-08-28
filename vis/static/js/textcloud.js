class TextCloud
{
  constructor(parentID)
  {
    this._parentID = parentID; 
  }

  present(words)
  {
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
        let svg = d3.select("#"+parentID).append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
        let layer = svg.append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
            .style("font-size", function(d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .style("cursor", "pointer")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .attr("class", "text-layer")
            .text(function(d) { return d.text; })
            .on("click", function(d,i) {
              makeSearch(d.text, true);
            });
       
        layer.attr("opacity", 1)
          .on("mouseover", function(d, i) {
            svg.selectAll(".text-layer").transition()
            .duration(250)
            .attr("opacity", function(d, j) {
              return j != i ? 0.6 : 1;
            })
          }).on("mouseout", function(d, i) {
            svg.selectAll(".text-layer")
            .transition()
            .duration(250)
            .attr("opacity", "1"); 
          })
    
      });
    layout.start();
  }

  draw(words) 
  {
  }
}

