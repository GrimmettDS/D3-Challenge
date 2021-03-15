// @TODO: YOUR CODE HERE!
// Define height and width
var svgHeight = 600;
var svgWidth = document.getElementsByClassName('jumbotron')[0].offsetWidth;

// Define the chart's margins
var chartMargin = {
  top: 40,
  right: 30,
  bottom : 90,
  left:85
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth)

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Inital parameters
var chosenXAxis = "poverty";
var chosenYAxis = 'healthcare';

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    if (chosenXAxis === 'income') {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis])-((d3.min(data, d => d[chosenXAxis])*.0667)), d3.max(data, d => d[chosenXAxis])+((d3.min(data, d => d[chosenXAxis])*.0667))])
        .range([0,chartWidth]);
    } else {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenXAxis])-2,d3.max(data, d => d[chosenXAxis])+2])
            .range([0,chartWidth]);
    };
  
    return xLinearScale;
  
  };

// Function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis])-2, d3.max(data, d => d[chosenYAxis])+2])
    .range([chartHeight, 0]);
    return yLinearScale;
};

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
};

// Function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
};

// Function used for updating points of scatter plot upon click on axis label
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// Function for updating text inside points of scatter plot upon click on axis label
function updateText(circleTexts,newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleTexts.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis])+3);
    
    return circleTexts;
}

// Updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
      var label = "Poverty : ";
    } else if (chosenXAxis === "age"){
      var label = "Age : ";
    } else if (chosenXAxis === 'income') {
        var label = "Income : ";
    };

    if (chosenYAxis === "healthcare") {
        var yLabel = "Healthcare : ";
    } else if (chosenYAxis === "smokes"){
    var yLabel = "Smokes : ";
    } else if (chosenYAxis === 'obesity') {
        var yLabel = "Obesity : ";
    };

    // Add toolTip
    var toolTip = d3.tip()
      .attr('class','d3-tip')
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
    
    // Show data upon mouseover
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    return circlesGroup;
};

// Function for updating scatterplot title
function updateTitle(chosenXAxis, chosenYAxis) {
        var titleGroup = chartGroup.selectAll('.title')
        titleGroup.text(`${chosenXAxis.replace(/^\w/, c => c.toUpperCase())} vs ${chosenYAxis.replace(/^\w/, c => c.toUpperCase())}`)
        console.log(titleGroup)
};

// Read in the data
d3.csv("../D3_data_journalism/assets/data/data.csv").then(function(data) {
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(data, chosenXAxis);

    var yLinearScale = yScale(data, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
                    .classed('x-axis',true)
                    .attr("transform", `translate(0, ${chartHeight})`)
                    .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
                .classed('y-axis',true)
                .call(leftAxis);

    // Create circlesGroup
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr('r', 12)
        .attr('fill','#c92e1a')
        .attr('opacity',0.8)
        .attr('stroke','#000000');

    // Create group for x-axis label
    var labelsGroupX = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // Create group for y-axis label
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", `translate(${-chartMargin.left/3}, ${chartHeight/2})rotate(-90)`)
    
    // Create group for text inside circles
    var circleTexts = chartGroup.append("text")
        .attr('fill','white')
        .attr('font-size','10px')
        .attr('color','white')
        .attr('text-anchor','middle')
        .selectAll('tspan')
        .data(data)
        .enter()
        .append("tspan")
        .attr('color','white')
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis])+3)
        .text((d) => d.abbr);

    var circleTexts = d3.select('g').selectAll('tspan');

    // Create axis labels:
        var povertyLabel = labelsGroupX.append("text")
            .attr('x',0)
            .attr('y',20)
            .attr('value','poverty')
            .classed('active',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .text("In Poverty (%)");

        var ageLabel = labelsGroupX.append("text")
            .attr('x',0)
            .attr('y',40)
            .attr('value','age')
            .classed('inactive',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .text("Age (Median)");

        var incomeLabel = labelsGroupX.append("text")
            .attr('x',0)
            .attr('y',60)
            .attr('value','income')
            .classed('inactive',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .text("Household Income (Median)");

        var healthcareLabel = labelsGroupY.append("text")
            .attr('x',0)
            .attr('y',0)
            .attr('value','healthcare')
            .classed('active',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .classed("axis-text", true)
            .text("Lacks Healthcare (%)");
        
        var smokesLabel = labelsGroupY.append("text")
            .attr('x',0)
            .attr('y',-20)
            .attr('value','smokes')
            .classed('inactive',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .classed("axis-text", true)
            .text("Smokes (%)");

        var obesityLabel = labelsGroupY.append("text")
            .attr('x',0)
            .attr('y',-40)
            .attr('value','obesity')
            .classed('inactive',true)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "black")
            .attr('font-weight','bold')
            .classed("axis-text", true)
            .text("Obesity (%)");

    // Update tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
    var titleLabel = chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${-chartMargin.top/2})`)
        .classed('title',true)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("fill", "black")
        .attr('font-weight','bold')
        .text(`${chosenXAxis.replace(/^\w/, c => c.toUpperCase())} vs ${chosenYAxis.replace(/^\w/, c => c.toUpperCase())}`)

    // Update scatterplot upon click on x-axis label
    labelsGroupX.selectAll('text').on('click', function() {
        var value = d3.select(this).attr('value');

        var chosenYAxis = labelsGroupY.selectAll('.active').attr('value');
        var yLinearScale = yScale(data,chosenYAxis);

        if (value !== chosenXAxis) {
            chosenXAxis = value;
            xLinearScale = xScale(data,chosenXAxis);
            xAxis = renderAxes(xLinearScale, xAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            updateTitle(chosenXAxis, chosenYAxis);
            circleTexts = updateText(circleTexts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            statOutput(data, chosenXAxis, chosenYAxis);

            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } 
            else if (chosenXAxis === 'age') {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);

            };
        };
    });

    // Update scatterplot upon click on y-axis label
    labelsGroupY.selectAll('text').on('click', function() {
        var value = d3.select(this).attr('value');
        var chosenXAxis = labelsGroupX.selectAll('.active').attr('value');
        var xLinearScale = xScale(data,chosenXAxis);

        if (value !== chosenYAxis) {
            chosenYAxis = value;
            yLinearScale = yScale(data,chosenYAxis);
            yAxis = renderAxesY(yLinearScale, yAxis);

            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            updateTitle(chosenXAxis, chosenYAxis);
            circleTexts = updateText(circleTexts, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            statOutput(data, chosenXAxis, chosenYAxis)

            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === 'smokes'){
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            };
        };
    });
    }).catch(function(error) {
        console.log(error);
  });
