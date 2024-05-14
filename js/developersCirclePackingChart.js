// setup the dimesnions of the circle packing chart
const marginDev = { top:10, right: 40, bottom: 60, left:100 }
const widthDev = 710 
const heightDev = 700

// Create the SVG container for the circle packing chart
const devCircleChart = d3.select("#developer_circle_packing_chart").append("svg")
    .attr("width", widthDev)
    .attr("height", heightDev);

// create a tooltip for the circular packing chart
var tooltip = d3.select("#developer_circle_packing_chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

// import the data form the json file
d3.json("data/games_by_year_and_developers.json", function(error, data) {
    if(error) {
        console.log('Error when loading the data for the developer circular packing chart : ', error);
        return;
    }
    // set default value of year and nb developers displayed
    localStorage.setItem("year_developer", 2000)
    localStorage.setItem("nb_developer_displayed", 20)
    //draw initial graph
    drawGraphDev(data)
    
    // retrieve the slider of the years
    var sliderOutputDev = document.getElementById("year_developer_displayed")
    var yearSliderDev = document.getElementById("year_developer_slider")
        .oninput = function() {
            // display the year currently displayed
            sliderOutputDev.innerHTML = this.value;
            localStorage.setItem("year_developer", this.value)
            drawGraphDev(data);
        }

    // retrieve the selector of the number of developers displayed
    var nbDeveloperSelectorDev= document.getElementById("nb_developer_displayed_selector")
        .oninput = function() {
            localStorage.setItem("nb_developer_displayed", this.value);
            drawGraphDev(data);
        }
})

function drawGraphDev(data) {
    const nbItemsDisplayed = localStorage.getItem("nb_developer_displayed");
    const year = localStorage.getItem("year_developer");
    var graphData = []
    var dataForYear = data[String(year)]
    for (let key in dataForYear) {
        graphData.push({Developers : [key], Number_Of_Games : dataForYear[key].length})
    }
    // sort the data
    graphData.sort(function (x, y) {
        return d3.ascending(x.Number_Of_Games, y.Number_Of_Games);
    });

    // select only the nbItemsDisplayed minimum elements(such that if there is less elements to show than expected, tehre is no error)
    const startIndex = Math.min(graphData.length, nbItemsDisplayed)
    graphData = graphData.slice(graphData.length-startIndex, graphData.length)

    // edit the title of the graph
    document.getElementById("developer_graph_title")
        .textContent = "Number of Video Games Realeased by Developer in "+String(year)

    // remove past graph
    devCircleChart.selectAll("*").remove()

    // size scale by developers
    var size = d3.scaleLinear()
        .domain([0, 100000000])
        .range([10, 10+graphData.length])

    // create the circle for each developer 
    var node = devCircleChart
        .append("g")
        .selectAll("circle")
        .data(graphData)
        .enter()
        .append("circle")
            .attr("class", "node")
            .attr("r", function(elem){ return elem.Number_Of_Games})
            .attr("cx", widthDev / 2)
            .attr("cy", heightDev / 2)
            .style("fill", "#69b3a2")
            .style("fill-opacity", 0.3)
            .attr("stroke", "black")
            .style("stroke-width", 1)
    
    // add forces forces between each nodes
    var simulation = d3.forceSimulation()
        // attraction to the center of the circle area
        .force("center", d3.forceCenter().x(widthDev/2).y(heightDev/2))
        // nodes are attracted one each other
        .force("charge", d3.forceManyBody().strength(0.1))
        // force that avoird that the circles overlapp
        .force("collide", d3.forceCollide().strength(.2).radius(function(elem) { return elem.Number_Of_Games + 5; }).iterations(1));

    
    // apply the previous forces to all the nodes and upadtaes the nodes psotions
    // once the force algorithm has converge, the node stop to move
    simulation.nodes(graphData)
        .on("tick", function(elem) {
            node.attr("cx", function(elem){ return elem.x; })
                .attr("cy", function(elem){ return elem.y; })
        });
}