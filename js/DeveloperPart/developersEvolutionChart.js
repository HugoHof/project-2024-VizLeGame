// setup the dimesnions of the developer evolution chart
const marginDevEvo = { top:10, right: 40, bottom: 60, left:100 }
const widthDevEvo = 700 - marginDevEvo.left -marginDevEvo.right
const heightDevEvo = 300 - marginDevEvo.top - marginDevEvo.bottom

// append the graph to the page
var devEvolutionChart = d3.select("#developer_circle_packing_chart_2")
  .append("svg")
    .attr("width", widthDevEvo + marginDevEvo.left + marginDevEvo.right)
    .attr("height", heightDevEvo + marginDevEvo.top + marginDevEvo.bottom)
  .append("g")
    .attr("transform", "translate(" + marginDevEvo.left + "," + marginDevEvo.top + ")");

// Function to draw the devleoper's evolution graph.
function drawDevEvolutionChart(data) {
    // remove past graph
    devEvolutionChart.selectAll("*").remove()

    const evolutionCriteria = localStorage.getItem("developer_evolution_criteria")
    const devSelected = localStorage.getItem("developer_selected")

    // edit the title of the graph
    document.getElementById("developer_graph_title_2")
        .textContent = "Global Evolution of "+ devSelected + " along the Years"

    // if ny developer is selected, do nothing
    if(devSelected == null){
        return;
    }
    // data processing 
    var graphDataInter = []
    for (let key in data) {

        const lst_games = (data[String(key)])[devSelected] != undefined ? (data[String(key)])[devSelected] : []
        if (key >= 1970) {
            graphDataInter.push({Year : key, Lst_Games : lst_games})
        }
    }
    var graphData = []
    // take the number of games (size of array)
    if(evolutionCriteria == "Number_of_Games") {
        for (let elem of graphDataInter) {
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : elem.Lst_Games.length})
        }
    // do the mean on the criteria for all the games of a given year
    } else if(evolutionCriteria == "Rating") {
        for (let elem of graphDataInter) {
            console.log(elem.Lst_Games);
            var sum = 0
            var count = 0
            for (let elem_2 of elem.Lst_Games) {
                if (elem_2[evolutionCriteria] >=0) {
                    sum += elem_2[evolutionCriteria]
                    count += 1
                }
            }
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum != 0 ? sum/count : 0})
        }
     // do the sum on the criteria for all the games of a given year}
    } else {
        for (let elem of graphDataInter) {
            var sum = 0
            for (let elem_2 of elem.Lst_Games) {
                sum += elem_2[evolutionCriteria]
            }
            graphData.push({Year : new Date(String(elem.Year+"-01-01")), YElem : sum})
        }
    }
   

    // setup x and y scales 
    const x = d3.scaleTime()
        .range([0, widthDevEvo]);
    
    const y = d3.scaleLinear()
        .range([heightDevEvo, 0]);

    // define x and y domains
    x.domain(d3.extent(graphData, function(elem) { return elem.Year; }));
    if(evolutionCriteria == "Rating") {
        y.domain([0, 5]);
    } else {
        y.domain([0, d3.max(graphData, function(elem) { return elem.YElem; })]);
    }
    
    // Add the x axis
    devEvolutionChart.append("g")
        .attr("transform", `translate(0,${heightDevEvo})`)
        .attr("stroke", "white")
        .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(10)) 
            .tickFormat(d3.timeFormat("%Y"))
        )
        .selectAll("*")
            .attr("stroke", "white");

    // Add the y axis
    devEvolutionChart.append("g")
        .call(d3.axisLeft(y))
        .selectAll("*")
            .attr("stroke", "white");
    
    // Create the line 

    // add a point for the esthetic to complete the graph
    graphData = [{Year : new Date(String("1971-01-01")), YElem : 0}].concat(graphData)
    graphData.push({Year : new Date(String("2023-01-02")), YElem : 0})

    // Plot the area
    devEvolutionChart.append("path")
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