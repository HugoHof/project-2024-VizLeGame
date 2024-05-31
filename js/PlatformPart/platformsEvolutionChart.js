// setup the dimesnions of the developer evolution chart
const marginPlatformsEvo = { top:10, right: 40, bottom: 60, left:100 }
const widthPlatformsEvo = 700 - marginPlatformsEvo.left -marginPlatformsEvo.right
const heightPlatformsEvo  = 300 - marginPlatformsEvo.top - marginPlatformsEvo.bottom

// append the graph to the page
var platformsEvolutionChart = d3.select("#platform_tree_map_2")
  .append("svg")
    .attr("viewBox", `0 0 ${widthPlatformsEvo + marginPlatformsEvo
    .left + marginPlatformsEvo
    .right} ${heightPlatformsEvo + marginPlatformsEvo
    .top + marginPlatformsEvo
    .bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")
  .append("g")
    .attr("transform", "translate(" + marginPlatformsEvo
.left + "," + marginPlatformsEvo
.top + ")");

// Function to draw the platform's evolution graph.
function drawPlatformsEvolutionChart(data) {
    // remove past graph
    platformsEvolutionChart.selectAll("*").remove()

    // edit the title of the graph
    document.getElementById("platforms_graph_title_2")
        .textContent = "Global Evolution of "+ currentPlatformSelected.name + " along the Years"

    // if ny developer is selected, do nothing
    if(currentPlatformSelected == null){
        return;
    }
    // data processing 
    let graphDataInterPlatforms = []

    for (let year = 1970; year <= 2030; year++) {
        const lst_games = data[String(year)] !== undefined && data[String(year)][currentPlatformSelected.parent] !== undefined && data[String(year)][currentPlatformSelected.parent][currentPlatformSelected.name] !== undefined ? 
            data[String(year)][currentPlatformSelected.parent][currentPlatformSelected.name] : [];
            graphDataInterPlatforms.push({ Year: year, Lst_Games: lst_games });
    }

    let graphDataPlatforms = []
    // take the number of games (size of array)
    if(document.getElementById("platforms_evolution_criteria").value == "Number_of_Games") {
        for (let elem of graphDataInterPlatforms) {
            graphDataPlatforms.push({Year : new Date(String(elem.Year+"-01-01")), YElem : elem.Lst_Games.length})
        }
    // do the mean on the criteria for all the games of a given year
    } else if(document.getElementById("platforms_evolution_criteria").value == "Rating") {
        for (let elem of graphDataInterPlatforms) {
            console.log(elem.Lst_Games);
            var sum = 0
            var count = 0
            for (let elem_2 of elem.Lst_Games) {
                if (elem_2[document.getElementById("platforms_evolution_criteria").value] >=0) {
                    sum += elem_2[document.getElementById("platforms_evolution_criteria").value]
                    count += 1
                }
            }
            graphDataPlatforms.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum != 0 ? sum/count : 0})
        }
     // do the sum on the criteria for all the games of a given year}
    } else {
        for (let elem of graphDataInterPlatforms) {
            var sum = 0
            for (let elem_2 of elem.Lst_Games) {
                sum += elem_2[document.getElementById("platforms_evolution_criteria").value]
            }
            graphDataPlatforms.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum})
        }
    }
   

    // setup x and y scales 
    const x = d3.scaleTime()
        .range([0, widthPlatformsEvo]);
    
    const y = d3.scaleLinear()
        .range([heightPlatformsEvo, 0]);

    // define x and y domains
    x.domain(d3.extent(graphDataPlatforms, function(elem) { return elem.Year; }));
    if(document.getElementById("developer_evolution_criteria").value == "Rating") {
        y.domain([0, 5]);
    } else {
        y.domain([0, d3.max(graphDataPlatforms, function(elem) { return elem.YElem; })]);
    }
    
    // Add the x axis
    platformsEvolutionChart.append("g")
        .attr("transform", `translate(0,${heightPlatformsEvo})`)
        .attr("stroke", "white")
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(10)) 
            .tickFormat(d3.timeFormat("%Y"))
        )
        .selectAll("*")
            .attr("stroke", "white");

    // Add the y axis
    platformsEvolutionChart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("*")
            .attr("stroke", "white");
    
    // Create the line 

    // add a point for the esthetic to complete the graph
    graphDataPlatforms = [{Year : new Date(String("1971-01-01")), YElem : 0}].concat(graphDataPlatforms)
    graphDataPlatforms.push({Year : new Date(String("2023-01-02")), YElem : 0})

    // Plot the area
    platformsEvolutionChart.append("path")
        .attr("class", "mypath")
        .datum(graphDataPlatforms)
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