
var unitsSankey = "Games";

var marginSankey = {top: 10, right: 10, bottom: 10, left: 10},
    widthSankey = 1200 - marginSankey.left - marginSankey.right,
    heightSankey = 740 - marginSankey.top - marginSankey.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + unitsSankey; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

// to know if the graph is currently play
var isPlayingSankey = false;

var sankeyDiagram = d3.select("#sankey_diagram_graph").append("svg")
    .attr("viewBox", `0 0 ${widthSankey + marginSankey.left + marginSankey.right} ${heightSankey + marginSankey.top + marginSankey.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "block")
    .append("g")
    .attr("transform", "translate(" + marginSankey.left + "," + marginSankey.top + ")");

d3.json("data/games_by_year_by_all.json", function(error, data) {
    if (error) throw error;
    
    // initial graph draw
    drawSankey(data);

    // retrieve the slider of the years
    var sliderOutputSankey = document.getElementById("year_sankey_displayed");
    var yearSliderSanky = document.getElementById("year_sankey_slider")
        .oninput = function() {
            // display the year currently displayed
            sliderOutputSankey.innerHTML = this.value;
            drawSankey(data);
        };

    // retrieve the selector of the number of bars displayed
    var nbBarsSankey= document.getElementById("nb_sankey_displayed_selector")
        .oninput = function() {
            drawSankey(data);
        };

    // upadte every 3 s the displaying of the graph if isPlayingSankey is activated
    setInterval(function() { return upadteGraphDisplayinyOnPlaySankey(data); }, 3000);

});

// update when time is playing
function upadteGraphDisplayinyOnPlaySankey(data){

}

// Called by play button
function onClickPlayButtonSankey() {
    let sankeySlider = document.getElementById("year_sankey_slider");
    if(sankeySlider.value < sankeySlider.max || isPlayingSankey) {
        isPlayingSankey  = !isPlayingSankey;
        document.getElementById("sankey_play_button").innerText = isPlayingSankey ? "Pause" : "Play";
    }
}

function drawSankey(data){

    let sankey_data_year = data[1952]//data[String(document.getElementById("year_sankey_slider").value)];

    var nodes = [];
    var links = [];

    // create links and nodes
    sankey_data_year.forEach(link => {
        // nodes -------------------------
        if (nodes.findIndex(it => it.name === link.Genre) == -1) nodes.push({"name": link.Genre});

        if (nodes.findIndex(it => it.name === link.Platform) == -1) nodes.push({"name": link.Platform});

        if (nodes.findIndex(it => it.name === link.Developer) == -1) nodes.push({"name": link.Developer});

        // links -------------------------
        // Create two links for each data element
        let link1 = { "source": link.Genre, "target": link.Platform, "value": link.value };
        let link2 = { "source": link.Platform, "target": link.Developer, "value": link.value };

        // Function to find an existing link and update the value if found
        function updateOrAddLink(newLink) {
            const existingLink = links.find(link => link.source === newLink.source && link.target === newLink.target);
            if (existingLink) {
                existingLink.value += newLink.value;
            } else {
                links.push(newLink);
            }
        }

        // Update or add the links
        updateOrAddLink(link1);
        updateOrAddLink(link2);

    });

    // loop through each link replacing the text with its index from node
    links.forEach(function (d, i) {
        links[i].source = nodes.findIndex(item => item.name === links[i].source);
        links[i].target = nodes.findIndex(item => item.name === links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    nodes.forEach(function (d, i) {
        nodes[i] = { "name": d };
    });

    var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(10)
    .size([widthSankey, heightSankey]);

    var path = sankey.link();

    sankey
        .nodes(nodes)
        .links(links)
        .layout(8);

    var link = sankeyDiagram.append("g").selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(2, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.append("title")
        .text(function(d) { return d.source.name.name + " → " + d.target.name.name + "\n" + format(d.value); });

    var node = sankeyDiagram.append("g").selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .on("start", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name); })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) { return d.name.name + "\n" + format(d.value); });

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name.name; })
        .filter(function(d) { return d.x < widthSankey / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + (
            d.x = Math.max(0, Math.min(widthSankey - d.dx, d3.event.x))
        ) + "," + (
            d.y = Math.max(0, Math.min(heightSankey - d.dy, d3.event.y))
        ) + ")");
        sankey.relayout();
        link.attr("d", path);
    }
}
