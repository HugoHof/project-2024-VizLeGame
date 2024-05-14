// setup the dimesnions of the circle packing chart
const marginDev = { top:10, right: 40, bottom: 60, left:100 }
const widthDev = 710 - marginDev.left -marginDev.right
const heightDev = 700 - marginDev.top - marginDev.bottom

// Create the SVG container for the circle packing chart
const devCircleChart = d3.select("#developer_circle_packing_chart").append("svg")
    .attr("width", widthDev + marginDev.left + marginDev.right)
    .attr("height", heightDev + marginDev.top + marginDev.bottom)
    .append("g")
    .attr("transform", "translate(" + marginDev.left + "," + marginDev.top + ")");

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
}