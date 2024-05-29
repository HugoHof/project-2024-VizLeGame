
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

var sankey = d3.sankey()
.nodeWidth(36)
.nodePadding(10)
.size([widthSankey, heightSankey]);

var path = sankey.link();

d3.json("data/games_by_year_by_all.json", function(error, data) {
    if (error) throw error;
    
    // initial graph draw
    drawSankey(data);

    // retrieve the slider of the years
    var sliderOutputSankey = document.getElementById("year_sankey_displayed");
    document.getElementById("year_sankey_slider")
        .oninput = function() {
            // display the year currently displayed
            sliderOutputSankey.innerHTML = this.value;
            drawSankey(data);
        };

    // retrieve the selectors of the number of bars displayed
    document.getElementById("nb_sankey_displayed_selector_genre")
        .oninput = function() {
            drawSankey(data);
        };

    document.getElementById("nb_sankey_displayed_selector_platform")
        .oninput = function() {
            drawSankey(data);
        };

    document.getElementById("nb_sankey_displayed_selector_developer")
        .oninput = function() {
            drawSankey(data);
        };

    // order draggable
    const container = document.getElementById('sankey_order_draggable');
    let draggedElement = null;

    container.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.dataTransfer.effectAllowed = 'move';
    });

    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const target = e.target;
        if (target && target !== draggedElement && target.classList.contains('draggable')) {
            const rect = target.getBoundingClientRect();
            const threshold = rect.height * 0.5;
            const mouseOverTop = e.clientY - rect.top;
            const mouseOverBot = rect.bottom - e.clientY;
            const prev = mouseOverTop > threshold;
            const next = mouseOverBot > threshold;
            container.insertBefore(draggedElement, next && target.nextSibling || prev && target.previousSibling || target);
            drawSankey(data);
        }
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        draggedElement = null;
    });

    container.addEventListener('dragend', (e) => {
        e.preventDefault();
        draggedElement = null;
    });

    // upadte every 3 s the displaying of the graph if isPlayingSankey is activated
    setInterval(function() { return upadteGraphDisplayinyOnPlaySankey(data); }, 3000);

});



// update when time is playing
function upadteGraphDisplayinyOnPlaySankey(data){
    const currentYear = Number(document.getElementById("year_sankey_slider").value)
    if(isPlayingSankey) {
        if(currentYear >= document.getElementById("year_sankey_slider").max-1) {
            isPlayingSankey = false
            document.getElementById("sankey_play_button").innerText = "Play"
        }
        // to evict the bug when moveing the side bar during the animation.
        if(currentYear >= document.getElementById("year_sankey_slider").min && currentYear <= document.getElementById("year_sankey_slider").max - 1) {
            document.getElementById("year_sankey_displayed").innerHTML = currentYear + 1
            document.getElementById("year_sankey_slider").value = currentYear + 1
            // re draw the graph
            drawSankey(data)
        }
    }
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

    // Clear the previous diagram
    sankeyDiagram.selectAll("*").remove();

    let sankey_data = data[String(document.getElementById("year_sankey_slider").value)].sort((a, b) => b.value - a.value);

    var nodes = [];
    var links = [];

    let nbGenre = document.getElementById("nb_sankey_displayed_selector_genre").value;
    let nbPlatform = document.getElementById("nb_sankey_displayed_selector_platform").value;
    let nbDeveloper = document.getElementById("nb_sankey_displayed_selector_developer").value;

    // create nodes and links
    sankey_data.forEach(link => {
        
        // update text to avoid loop
        const genre = link.Genre + 'g';
        const platform = link.Platform + 'p';
        const developer = link.Developer + 'd';

        // nodes -------------------------
        if (nodes.findIndex(it => it.name === genre) == -1 && nbGenre > 0) {
            nbGenre--;
            nodes.push({"name": genre, "color": [102, 92, 190]});
        }

        if (nodes.findIndex(it => it.name === platform) == -1 && nbPlatform > 0) {
            nbPlatform--;
            nodes.push({"name": platform, "color": [228, 0, 15]});
        }

        if (nodes.findIndex(it => it.name === developer) == -1 && nbDeveloper > 0) {
            nbDeveloper--;
            nodes.push({"name": developer, "color": [14, 122, 13]});
        }

        // order of the bars
        const container = document.getElementById('sankey_order_draggable');
        const order = Array.from(container.children).map(div => div.id).map(id => {
            if (id === "sankey_genres") return genre;
            if (id === "sankey_platforms") return platform;
            if (id === "sankey_developers") return developer;
        });

        // links -------------------------
        // Create two links for each data element
        if (nodes.findIndex(it => it.name === order[0]) != -1 && nodes.findIndex(it => it.name === order[1]) != -1) {
            let link1 = { "source": order[0], "target": order[1], "value": link.value };
            updateOrAddLink(link1);
        }
        
        if (nodes.findIndex(it => it.name === order[1]) != -1 && nodes.findIndex(it => it.name === order[2]) != -1) {
            let link2 = { "source": order[1], "target": order[2], "value": link.value };
            updateOrAddLink(link2);
        }

        // Function to find an existing link and update the value if found
        function updateOrAddLink(newLink) {
            const existingLink = links.find(link => link.source === newLink.source && link.target === newLink.target);
            if (existingLink) {
                existingLink.value += newLink.value;
            } else {
                links.push(newLink);
            }
        }

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
        .attr("class", "link-title")
        .text(function(d) { return d.source.name.name.slice(0, -1) + " → " + d.target.name.name.slice(0, -1) + "\n" + format(d.value); });

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
        .style("fill", function(d) { return d3.rgb(...d.name.color); })
        .style("stroke", function(d) { return d3.rgb(...d.name.color).darker(2); })
        .append("title")
        .attr("class", "node-title")
        .text(function(d) { return d.name.name.slice(0, -1) + "\n" + format(d.value); });

    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name.name.slice(0, -1); })
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
