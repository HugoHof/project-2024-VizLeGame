
// Specify the chart’s dimensions.
const widthTreemap = 1700; 
const heightTreemap = 1300;

const tile = d3.treemapSquarify;
var isPlayingPlatforms = false;
var currentPlatformSelected = "";

var colorPlatforms = []

// Create the SVG container.
const platform_tree_map = d3.select("#platform_tree_map").append("svg")
    .attr("viewBox", `0 0 ${widthTreemap} ${heightTreemap}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")

d3.json("data/games_by_year_and_platforms.json", function(e, data) {
    if (e) console.log("Error loading the data for treemap platforms file: " + e);

     // Specify the color scale.
     //const colors = ["#ffbff1", "#bf60aa", "#ff80e3", "#ffd5bf", "#bf8160", "#ffac80","#8060bf","#d5bfff","#aa80ff","#c40098"];
     const colors = ["#ff80e3", "#aa80ff","#b33e00","#d5bfff", "#804071","#ff5800","#24006b","#330099","#c40098", "#ffbff1"];



    Object.keys(data).forEach(year => {
        Object.keys(data[year]).forEach(type => {
            if (!colorPlatforms[type])
                colorPlatforms[type] = d3.rgb(colors.pop())
        })
    })
    //draw the treemap
    drawPlatformTreemap(data)

    //extract the criteria for the platform evolution
    var criteriaPlatformsEvolution = document.getElementById("platforms_evolution_criteria")
        .oninput = function() {
            //re-draw the evolution graph
            drawPlatformsEvolutionChart(data)
        }
    // obtains the criteria in which the list of games will be ranked
    var criteriaPlatformsTop = document.getElementById("platforms_list_games_criteria")
        .oninput = function() {
            //re-draw the list of games relative to the platform
            drawListGamesPlatforms(data)
        }
    // obtains the year in which the data will be displayed
    var sliderOutputPlatforms = document.getElementById("year_platforms_displayed")
    var yearPlatforms = document.getElementById("year_platforms_slider")
        .oninput = function() {
            //re-draw the platform Treemap
            sliderOutputPlatforms.innerHTML = document.getElementById("year_platforms_slider").value
            drawPlatformTreemap(data)
        }

    // upadte every 3 s the displaying of the graph if isPlayingPlatforms is activated
    setInterval(function() { return updateTreemapDisplayinyOnPlayPlatforms(data); }, 3000)

});

function drawPlatformTreemap(data) {
    // clean old graph
    platform_tree_map.selectAll("*").remove();

    // check date
    datePlatforms = document.getElementById("year_platforms_slider").value
    let data_year = data[datePlatforms]

    let treemapData = {"name": "platforms", "children": []};

    Object.keys(data_year).forEach(type => {
        treemapData.children.push({"name": type, "children": []});

        let color = colorPlatforms[type];

        Object.keys(data_year[type]).forEach(platform => {
            treemapData.children.at(treemapData.children.length - 1).children.push({"name": platform, "parent": type, "value": data_year[type][platform].length, "games": data_year[type][platform], "color": color})
        })
    });

   
    

    // Compute the layout.
    const root = d3.treemap()
        .tile(tile) // e.g., d3.treemapSquarify
        .size([widthTreemap, heightTreemap])
        .padding(1)
        .round(true)
    (d3.hierarchy(treemapData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));



    // Append a tooltip.
    const format = d3.format(",d");

    // Add a cell for each leaf of the hierarchy.
    const leaf = platform_tree_map.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    
    
    leaf.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(".")}\n${format(d.value)}`);

    // Append a color rectangle. 
    leaf.append("rect")
        //.attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        //.style("fill", d => { d3.rgb([200, 0, 0])/*color(d.parent.name);*/ })
        .style("fill", d => d.data.color)
        .style("fill-opacity", 0.7)
        .on("click",d => onClickRectPlatforms(d, data));

    // Append a clipPath to ensure text does not overflow.
    leaf.append("clipPath")
        //.attr("id", d => (d.clipUid = DOM.uid("clip")).id)
        .append("use")
        //.attr("xlink:href", d => d.leafUid.href);

    // Append multiline text. The last line shows the value and has a specific formatting.
    leaf.append("text")
        .style("font-family", "arial")
        .style("font-weight", "bold")
        .style("font-size", d => {
            // Calculate area of the rectangle
            const area = (d.x1 - d.x0) * (d.y1 - d.y0);
            // Determine font size proportional to area (adjust multiplier as needed)
            return Math.sqrt(area) / 6;})
        .attr("clip-path", d => d.clipUid)
        .attr("text-anchor", "start")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
        .enter()
        .append("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);


}

// Updadte the treemap displaying if the play button is activated
function updateTreemapDisplayinyOnPlayPlatforms(data) {
    const currentYear = Number(document.getElementById("year_platforms_slider").value)
    if(isPlayingPlatforms) {
        if(currentYear >= document.getElementById("year_platforms_slider").max-1) {
            isPlayingPlatforms = false
            document.getElementById("platforms_play_button").innerText = "Play"
        }
        // to evict the bug when moving the side bar during the animation.
        if(currentYear >= document.getElementById("year_platforms_slider").min && currentYear <= document.getElementById("year_developer_slider").max - 1) {
            document.getElementById("year_platforms_displayed").innerHTML = currentYear + 1
            document.getElementById("year_platforms_slider").value = currentYear + 1
            // re-draw the treemap
            drawPlatformTreemap(data)
        }
    }
}

function onClickPlayButtonPlatforms() {
    if(document.getElementById("year_platforms_slider").value < document.getElementById("year_platforms_slider").max || isPlayingPlatforms) {
        isPlayingPlatforms  = !isPlayingPlatforms
        document.getElementById("platforms_play_button").innerText = isPlayingPlatforms ? "Pause" : "Play"
    }
}
function onClickRectPlatforms(e,data){

    if (currentPlatformSelected != e.data) {
        currentPlatformSelected = e.data
        drawListGamesPlatforms(data)
        drawPlatformsEvolutionChart(data)
    }

    // show the right content of the visualization
    document.getElementById("platforms_right_no_selected").style.display = "none"
    document.getElementById("platforms_right_selected").style.display = "initial"
    
}
