// setup the dimesnions of the developer evolution chart
const marginConclusionEvo = { top:10, right: 40, bottom: 60, left:100 }
const widthConclusionEvo = 650 - marginConclusionEvo.left -marginConclusionEvo.right
const heightConclusionEvo = 550 - marginConclusionEvo.top - marginConclusionEvo.bottom

// append the graph to the page
var ConclusionEvolutionChart = d3.select("#conclusion_chart")
  .append("svg")
    .attr("viewBox", `0 0 ${widthConclusionEvo + marginConclusionEvo.left + marginConclusionEvo.right} ${heightConclusionEvo + marginConclusionEvo.top + marginConclusionEvo.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")
  .append("g")
    .attr("transform", "translate(" + marginConclusionEvo.left + "," + marginConclusionEvo.top + ")");

d3.csv("data/games_data_clean.csv", function(e, data) {
    if(e) {
        console.log('Error when loading the data for interactive diagram : ', e);
        return;
    }
    drawConclusionEvolutionChart(data);
});


// Function to draw the devleoper's evolution graph.
function drawConclusionEvolutionChart(data) {
    // remove past graph
    ConclusionEvolutionChart.selectAll("*").remove()

    // edit the title of the graph
    document.getElementById("developer_graph_title_2")
        .textContent = "Global Evolution of along the Years of the selected items"

    // if ny developer is selected, do nothing
    if(currentDeveloperSelected == null){
        return;
    }
    // data processing 
    let dataPerYear = []

    data.forEach(elem => {
        let year = new Date(elem['Release_Date']).getFullYear();
        if (!dataPerYear[year]) {
            dataPerYear[year] = [];
          }
        dataPerYear[year].push(elem);
    });


    let graphDataInter = []

    for (let year = 1970; year <= 2023; year++) {
        const lst_games = dataPerYear[String(year)] !== undefined ? dataPerYear[String(year)] : [];
        graphDataInter.push({ Year: year, Lst_Games: lst_games });
    }

    let graphData = []
    // take the number of games (size of array)
    for (let elem of graphDataInter) {
        graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : elem.Lst_Games.length})
    }

    // setup x and y scales 
    const x = d3.scaleTime()
        .range([0, widthConclusionEvo]);
    
    const y = d3.scaleLinear()
        .range([heightConclusionEvo, 0]);

    // define x and y domains
    x.domain(d3.extent(graphData, function(elem) { return elem.Year; }));
    y.domain([0, d3.max(graphData, function(elem) { return elem.YElem; })]);
    
    // Add the x axis
    ConclusionEvolutionChart.append("g")
        .attr("transform", `translate(0,${heightConclusionEvo})`)
        .attr("stroke", "white")
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(10)) 
            .tickFormat(d3.timeFormat("%Y"))
        )
        .selectAll("*")
            .attr("stroke", "white");

    // Add the y axis
    ConclusionEvolutionChart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("*")
            .attr("stroke", "white");
    
    // Create the line 

    // add a point for the esthetic to complete the graph
    graphData = [{Year : new Date(String("1971-01-01")), YElem : 0}].concat(graphData)
    graphData.push({Year : new Date(String("2023-01-02")), YElem : 0})

    // Plot the area
    ConclusionEvolutionChart.append("path")
        .attr("class", "mypath")
        .datum(graphData)
        .attr("fill", "#69b3aa")
        .attr("opacity", ".8")
        .attr("stroke", "#000")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(elem) { return x(elem.Year); })
            .y(function(elem) { return y(elem.YElem); })
        );
}