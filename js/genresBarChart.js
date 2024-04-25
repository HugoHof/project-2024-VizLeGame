// setup the dimesnions of the bar chart
const margin = { top:70, right: 40, bottom: 60, left:175 }
const width = 560 - margin.left -margin.right
const height = 300 - margin.top - margin.bottom

// Create the SVG container for the bar chart
const barChart = d3.select("#genres_bar_chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/games_by_year_and_genre.json", function(error, data) {
    if(error) {
        console.log('Error when loading the data for the genres bar chart : ', error);
        return;
    }
    // retrive the slider of the years
    var sliderOutput = document.getElementById("year_genre_displayed")
    var yearSlider = document.getElementById("year_genre_slider")
        .oninput = function() {
            // display the year currently displayed
            sliderOutput.innerHTML = this.value;
            year = this.value
            drawGraph(year, data)
        }
})

function drawGraph(year, data) {
    graphData = []
    var dataForYear = data[String(year)]
    for (let key in dataForYear) {
        graphData.push({Genre : [key], Number_Of_Games : dataForYear[key].length})
    }
    // sort the data
    graphData.sort(function (x, y) {
        return d3.ascending(x.Number_Of_Games, y.Number_Of_Games);
    });

    // remove past graph
    barChart.selectAll("*").remove()

    // set the x scale
    const x = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(graphData, function(elem) { return elem.Number_Of_Games; })]);
    // set the y scale
    const y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1)
        .domain(graphData.map(function (elem) { return elem.Genre}));

    // create the x and y axes
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickSize(0);
    const yAxis = d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(10);
    
    // add grid lines
    barChart.selectAll("line.vertical-grid")
        .data(x.ticks(5))
        .enter()
        .append("line")
        .attr("class", "vertical-grid")
        .attr("x1", function (elem) { return x(elem); })
        .attr("y1", 0)
        .attr("x2", function (elem) { return x(elem); })
        .attr("y2", height)
        .style("stroke", "gray")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3 3");

    // create the bars
    barChart.selectAll(".bar")
    .data(graphData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("y", function (elem) { return y(elem.Genre); })
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", function (elem) { return x(elem.Number_Of_Games); })
    .style("fill", '#96a5b9')

    // add the x and y axes to the bar chart
    barChart.append('g')
    .attr("class", "x axis")
    .style("font-size", "10px")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .call(g => g.select(".domain").remove());

    barChart.append('g')
        .attr("class", "y axis")
        .style("font-size", "8px")
        .call(yAxis)
        .selectAll("path")
        .style("stroke-width", "1.75px");
    
    barChart.selectAll(".y.axis .tick text")
        .text(function (elem) { return elem[0].toUpperCase(); });

    // add labels to the end of each bars
    barChart.selectAll(".label")
        .data(graphData)
        .enter()
        .append("text")
        .attr("x", function (elem) { return x(elem.Number_Of_Games) + 5; })
        .attr("y", function (elem) { return y(elem.Genre) + y.bandwidth() / 2; })
        .attr("dy", ".35em")
        .style("font-family", "arial")
        .style("foont-size", "0.1px")
        .style("font-weight", "bold")
        .style("fill", "#3c3d28")
        .text( function (elem) { return elem.Number_Of_Games; });
}