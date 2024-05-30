// setup the dimesnions of the developer evolution chart
const marginSankeyEvo = { top:10, right: 40, bottom: 60, left:100 }
const widthSankeyEvo = 700 - marginSankeyEvo.left -marginSankeyEvo.right
const heightSankeyEvo = 300 - marginSankeyEvo.top - marginSankeyEvo.bottom

// append the graph to the page
var sankeyEvolutionChart = d3.select("#sankey_circle_packing_chart_2")
  .append("svg")
    .attr("viewBox", `0 0 ${widthSankeyEvo + marginSankeyEvo.left + marginSankeyEvo.right} ${heightSankeyEvo + marginSankeyEvo.top + marginSankeyEvo.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")
  .append("g")
    .attr("transform", "translate(" + marginSankeyEvo.left + "," + marginSankeyEvo.top + ")");

// Function to draw the devleoper's evolution graph.
function drawSankeyEvolutionChart(data) {
    // remove past graph
    sankeyEvolutionChart.selectAll("*").remove()

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
    if(document.getElementById("sankey_evolution_criteria").value == "Number_of_Games") {
        for (let elem of graphDataInter) {
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : elem.Lst_Games.length})
        }
    // do the mean on the criteria for all the games of a given year
    } else if(document.getElementById("sankey_evolution_criteria").value == "Rating") {
        for (let elem of graphDataInter) {
            console.log(elem.Lst_Games);
            let sum = 0
            let count = 0
            for (let elem_2 of elem.Lst_Games) {
                if (elem_2[document.getElementById("sankey_evolution_criteria").value] >=0) {
                    sum += Number(elem_2[document.getElementById("sankey_evolution_criteria").value])
                    count += 1
                }
            }
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum != 0 ? sum/count : 0})
        }
     // do the sum on the criteria for all the games of a given year}
    } else {
        for (let elem of graphDataInter) {
            let sum = 0
            for (let elem_2 of elem.Lst_Games) {
                sum += Number(elem_2[document.getElementById("sankey_evolution_criteria").value])
            }
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum})
        }
    }

    // setup x and y scales 
    const x = d3.scaleTime()
        .range([0, widthSankeyEvo]);
    
    const y = d3.scaleLinear()
        .range([heightSankeyEvo, 0]);

    // define x and y domains
    x.domain(d3.extent(graphData, function(elem) { return elem.Year; }));
    if(document.getElementById("sankey_evolution_criteria").value == "Rating") {
        y.domain([0, 5]);
    } else {
        y.domain([0, d3.max(graphData, function(elem) { return elem.YElem; })]);
    }
    
    // Add the x axis
    sankeyEvolutionChart.append("g")
        .attr("transform", `translate(0,${heightSankeyEvo})`)
        .attr("stroke", "white")
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(10)) 
            .tickFormat(d3.timeFormat("%Y"))
        )
        .selectAll("*")
            .attr("stroke", "white");

    // Add the y axis
    sankeyEvolutionChart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("*")
            .attr("stroke", "white");
    
    // Create the line 

    // add a point for the esthetic to complete the graph
    graphData = [{Year : new Date(String("1971-01-01")), YElem : 0}].concat(graphData)
    graphData.push({Year : new Date(String("2023-01-02")), YElem : 0})

    // Plot the area
    sankeyEvolutionChart.append("path")
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