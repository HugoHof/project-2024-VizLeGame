
// Specify the chart’s dimensions.
const marginTreemap = { top:10, right: 40, bottom: 60, left:100 }
const widthTreemap = 1700 - marginTreemap.left -marginTreemap.right; 
const heightTreemap = 1300 - marginTreemap.top - marginTreemap.bottom;

const tile = d3.treemapSquarify;
var isPlayingPlatforms = false;
var currentPlatformSelected = "";

var colorPlatforms = []

// Create the SVG container.
const platform_tree_map = d3.select("#platform_tree_map").append("svg")
    .attr("viewBox", `0 0 ${widthTreemap + marginTreemap.left + marginTreemap.right} ${heightTreemap + marginTreemap.top + marginTreemap.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")
    .append("g")
    .attr("transform", "translate(" + marginTreemap.left + "," + marginTreemap.top + ")");

var TooltipPlatforms = d3.select("#platform_tree_map").append("div")
    .attr("class", "tooltipGraph")


d3.json("data/games_by_year_and_platforms.json", function(e, data) {
    if (e) console.log("Error loading the data for treemap platforms file: " + e);

    // Specify the color scale.
    const colors = ["#9e0142","#d53e4f", "#f46d43", "#fdae61", "#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"];
    
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

    document.getElementById("platforms_graph_title").textContent = "Games by Platforms in " + datePlatforms

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

    
    
    leaf
    .on("mouseover", d => mouseMoveRectPlatforms(d, data))
    .on("mouseout", function(d) {
        TooltipPlatforms.transition().duration(500).style("opacity", 0);
    });

    // Append a color rectangle. 
    leaf.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => currentPlatformSelected.name === d.data.name ? d.data.color.darker(3) : d.data.color)
        .style("fill-opacity", 1)
        .on("click",d => onClickRectPlatforms(d, data))
        

    // Append a clipPath to ensure text does not overflow.
    leaf.append("clipPath")
        .attr("id", d => (`clip-${d.clipUid}`))
        .append("use");
        
        leaf.append("text")
        .attr("x", d => Math.max((d.x1 - d.x0)/15, 2) +"px")
        .attr("y", d => Math.max((d.y1-d.y0)/11, 2) +"px")
        .attr("dy", "0.35em")
        .attr("pointer-events", "none")
        .attr("text-anchor", "left")
        .style("font-family", "arial")
        .style("font-weight", "bold")
        .style("fill", d => currentPlatformSelected.name === d.data.name ? "white" : "#3c3d28")
        .text(d => {
            var index = ((d.x1 -d.x0)) <= 500 ? (d.x1 -d.x0) * 7 / (Math.min((d.x1 - d.x0), (d.y1 -d.y0))) : 100
            if(index < String(d.data.name).length) {
                return String(d.data.name).substring(0, index) + "...";
            }
            return d.data.name;
        })
        .style("font-size", d => { return Math.min(Math.min((d.x1 - d.x0), (d.y1 -d.y0)) / 5, 60) + "px"; })

        leaf.append("text")
        .attr("x", d => Math.max((d.x1 - d.x0)/15, 2) +"px")
        .attr("y", d => Math.max((d.y1-d.y0)/11, 2) + Math.min(Math.min((d.x1 - d.x0), (d.y1 -d.y0)) /5, 70)+"px")
        .attr("dy", "0.35em")
        .attr("pointer-events", "none")
        .attr("text-anchor", "left")
        .style("font-family", "arial")
        .style("fill", d => currentPlatformSelected.name === d.data.name ? "white" : "#3c3d28")
        .text(d => {
            var index = (d.x1 -d.x0) * 8 / (Math.min((d.x1 - d.x0), (d.y1 -d.y0)))
            if(index < String(d.data.value).length) {
                return String(d.data.value).substring(0, index) + "...";
            }
            return d.data.value;
        })
        .style("font-size", d => { return Math.min(Math.min((d.x1 - d.x0), (d.y1 -d.y0)) /5  + 1, 62) + "px"; })
       

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

    // redraw the treemap
    drawPlatformTreemap(data);

    // show the right content of the visualization
    document.getElementById("platforms_right_no_selected").style.display = "none"
    document.getElementById("platforms_right_selected").style.display = "initial"
    
}

function mouseMoveRectPlatforms(d, data){
    TooltipPlatforms.transition().duration(200).style("opacity", .9);
    TooltipPlatforms.html(d.data.parent + "<br>" + d.data.name + "<br>" + d.value + " games released")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 50) + "px")

    }
