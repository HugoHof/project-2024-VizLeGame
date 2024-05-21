// setup the dimesnions of the bar chart
const marginGenre = { top:10, right: 40, bottom: 60, left:200 }
const widthGenre = 700 - marginGenre.left -marginGenre.right
const heightGenre = 700 - marginGenre.top - marginGenre.bottom

// to know if we currently playing in the genre part
var isPlayingGenre = false

// Create the SVG container for the bar chart
const barChartGenre = d3.select("#genres_bar_chart").append("svg")
    .attr("width", widthGenre + marginGenre.left + marginGenre.right)
    .attr("height", heightGenre + marginGenre.top + marginGenre.bottom)
    .append("g")
    .attr("transform", "translate(" + marginGenre.left + "," + marginGenre.top + ")");

d3.json("data/games_by_year_and_genre.json", function(error, data) {
    if(error) {
        console.log('Error when loading the data for the genres bar chart : ', error);
        return;
    }
    // set default value of year and nb genres displayed
    localStorage.setItem("year_genres", 2000)
    localStorage.setItem("nb_genres_displayed", 23)

    // load the content of the json file that contains the genre descriptions
    d3.json("data/genresDef.json", function(error, genreDescription) {
        //draw initial graph
        drawGraphGenre(data, genreDescription)
        
        // retrive the slider of the years
        var sliderOutputGenre = document.getElementById("year_genre_displayed")
        var yearSliderGenre = document.getElementById("year_genre_slider")
            .oninput = function() {
                // display the year currently displayed
                sliderOutputGenre.innerHTML = this.value;
                localStorage.setItem("year_genres", this.value)
                drawGraphGenre(data, genreDescription);
            }

        // retrive the slector of the number of genres displayed
        var nbGenresSelector= document.getElementById("nb_genre_displayed_selector")
            .oninput = function() {
                localStorage.setItem("nb_genres_displayed", this.value);
                drawGraphGenre(data, genreDescription);
            }
        
        //default criteria 
        localStorage.setItem("top_3_genres_criteria", "Plays")
        // extract the ranking top-3 games criteria
        var criteriaGenre = document.getElementById("genres_games_top_3_criteria")
            .oninput = function() {
                // save the new criteria
                localStorage.setItem("top_3_genres_criteria", this.value)
                //update the top-3 ranking
                updateTop3GamesGenreRanking(data, genreDescription)
            }
        
        // upadte every 1 s the displaying of the graph if isPlayingDeveloper is activated
        setInterval(function() { return upadteGraphDisplayinyOnPlayGenre(data), genreDescription; }, 1000)
    });
});

function drawGraphGenre(data, genreDescription) {
    const nbItemsDisplayed = localStorage.getItem("nb_genres_displayed");
    const year = localStorage.getItem("year_genres");
    var graphData = []
    var dataForYear = data[String(year)]
    for (let key in dataForYear) {
        graphData.push({Genre : [key], Number_Of_Games : dataForYear[key].length})
    }
    // sort the data
    graphData.sort(function (x, y) {
        return d3.ascending(x.Number_Of_Games, y.Number_Of_Games);
    });

    // select only the nbItemsDisplayed first elements
    const startIndex = Math.min(graphData.length, nbItemsDisplayed)
    graphData = graphData.slice(graphData.length-startIndex, graphData.length)

    // edit the title of the graph
    document.getElementById("genre_graph_title")
        .textContent = "Number of Video Games by Genre in "+String(year)

    // remove past graph
    barChartGenre.selectAll("*").remove()

    // set the x scale
    const x = d3.scaleLinear()
        .range([0, widthGenre])
        .domain([0, d3.max(graphData, function(elem) { return elem.Number_Of_Games; })]);
    // set the y scale
    const y = d3.scaleBand()
        .range([heightGenre, 0])
        .padding(0.1)
        .domain(graphData.map(function (elem) { return elem.Genre}));

    // create the x and y axes
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickSize(0);
    const yAxis = d3.axisLeft(y)
        .tickSize(0)
        .tickPadding(10);
    
    // add grid lines
    barChartGenre.selectAll("line.vertical-grid")
        .data(x.ticks(5))
        .enter()
        .append("line")
        .attr("class", "vertical-grid")
        .attr("x1", function (elem) { return x(elem); })
        .attr("y1", 0)
        .attr("x2", function (elem) { return x(elem); })
        .attr("y2", heightGenre)
        .style("stroke", "gray")
        .style("stroke-width", 0.5)
        .style("stroke-dasharray", "3 3");

    // create the bars
    var bars = barChartGenre.selectAll(".bar")
        .data(graphData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("y", function (elem) { return y(elem.Genre); })
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", function (elem) { return x(elem.Number_Of_Games); })
        .style("fill", '#96a5b9')
    
    //add click listner on bar
    bars.on("click", function(elem) { 
        // reset the color of all the bars
        barChartGenre.selectAll(".bar").style("fill", '#96a5b9')
        // change the color of the bar
        d3.select(this).style("fill", '#003366')
        // save the genre selected
        localStorage.setItem("genre_selected", elem.Genre)
        updateGenreDescription(genreDescription); 
        //save the new list of games displayed in the top-3 ranking
        updateTop3GamesGenreRanking(data);
        // show the right content of the visualization
        document.getElementById("genre_right_no_selected").style.display = "none"
        document.getElementById("genre_right_selected").style.display = "initial"
        return;
    });

    // add the x and y axes to the bar chart
    barChartGenre.append('g')
        .attr("class", "x axis")
        .style("font-family", "'Games', sans-serif")
        .style("font-size", "10pt")
        .attr("transform", "translate(0," + heightGenre + ")")
        .call(xAxis)
        .call(g => g.select(".domain").remove());

    barChartGenre.append('g')
        .attr("class", "y axis")
        .style("font-family", "'Games', sans-serif")
        .style("font-size", "10pt")
        .call(yAxis)
        .selectAll("path")
        .style("stroke-width", "1.75px");
    
    barChartGenre.selectAll(".y.axis .tick text")
        .style("font-family", "'Games', sans-serif")
        .style("font-size", "10pt")
        .text(function (elem) { return elem[0].toUpperCase().replaceAll('&', 'And'); });

    // add labels to the end of each bars
    barChartGenre.selectAll(".label")
        .data(graphData)
        .enter()
        .append("text")
        .attr("x", function (elem) { return x(elem.Number_Of_Games) + 5; })
        .attr("y", function (elem) { return y(elem.Genre) + y.bandwidth() / 2; })
        .attr("dy", ".35em")
        .style("font-family", "'SF Pixelate', sans-serif")
        .style("foont-size", "0.1px")
        .style("font-weight", "bold")
        .style("fill", "#3c3d28")
        .text( function (elem) { return elem.Number_Of_Games; });
}

function updateGenreDescription(genreDescription) {
    // retrive the current genre selected
    const currentGenre = localStorage.getItem("genre_selected")
    // edit the title of the description section
    document.getElementById("genre_description_title")
        .textContent = currentGenre +" Genre"
    // edit the genre description text
    document.getElementById("genre_description_text")
        .textContent = genreDescription[String(currentGenre)]    
}

function updateTop3GamesGenreRanking(data) {
    const rankingCriteria = localStorage.getItem("top_3_genres_criteria")
    const yearSelected = localStorage.getItem("year_genres");
    const genreSelected = localStorage.getItem("genre_selected");
    const gamesArray = data[yearSelected][genreSelected]
    // sort the games according to the criteria
    gamesArray.sort(function (x, y) {
        return d3.descending(x[rankingCriteria], y[rankingCriteria]);
    });
    //slect the top 3
    const endIndex = Math.max(0, gamesArray.length);
    const top3Games = gamesArray.slice(0, endIndex);
    //update games rankings displaying
    
    if(top3Games.length >= 1) {
        //top 1
        document.getElementById("genre_rank_1").style.display = "initial"
        document.getElementById("games_genre_rank_1_title")
            .textContent = top3Games[0]["Title"].toUpperCase()
        document.getElementById("games_genre_rank_1_genres")
            .innerHTML = String(top3Games[0]["Genres"]).replaceAll(',', ", ");
        document.getElementById("games_genre_rank_1_developer")
            .innerHTML = String(top3Games[0]["Developers"]).replaceAll(',', ", ");
        document.getElementById("games_genre_rank_1_platforms")
            .innerHTML = String(top3Games[0]["Platforms"]).replaceAll(',', ", ");
        if(top3Games.length >=2) {
            //top 2
            document.getElementById("genre_rank_2").style.display = "initial"
            document.getElementById("games_genre_rank_2_title")
                .textContent = top3Games[1]["Title"].toUpperCase()
            document.getElementById("games_genre_rank_2_genres")
                .innerHTML = String(top3Games[1]["Genres"]).replaceAll(',', ", ");
            document.getElementById("games_genre_rank_2_developer")
                .innerHTML = String(top3Games[1]["Developers"]).replaceAll(',', ", ");
            document.getElementById("games_genre_rank_2_platforms")
                .innerHTML = String(top3Games[1]["Platforms"]).replaceAll(',', ", ");
            
            if(top3Games.length >= 3) {
                //top 3
                document.getElementById("genre_rank_3").style.display = "initial"
                document.getElementById("games_genre_rank_3_title")
                    .textContent = top3Games[2]["Title"].toUpperCase()
                document.getElementById("games_genre_rank_3_genres")
                    .innerHTML = String(top3Games[2]["Genres"]).replace(',', ", ");
                document.getElementById("games_genre_rank_3_developer")
                    .innerHTML = String(top3Games[2]["Developers"]).replace(',', ", ");
                document.getElementById("games_genre_rank_3_platforms")
                    .innerHTML = String(top3Games[2]["Platforms"]).replace(',', ", ");
            } else {
                document.getElementById("genre_rank_3").style.display = "none"
            }
        } else {
            document.getElementById("genre_rank_2").style.display = "none"
            document.getElementById("genre_rank_3").style.display = "none"
        }
    } else {
        document.getElementById("genre_rank_1").style.display = "none"
        document.getElementById("genre_rank_2").style.display = "none"
        document.getElementById("genre_rank_3").style.display = "none"
    }
}

// Play Button change on click
function onClickPlayButtonGenre() {
    const currentYear = localStorage.getItem("year_genres")
    if(currentYear < document.getElementById("year_genre_slider").max || isPlayingGenre) {
        isPlayingGenre  = !isPlayingGenre
        document.getElementById("genre_play_button").innerText = isPlayingGenre ? "Pause" : "Play"
    }
}

// Updadte the graph displaying if the play button is activated
function upadteGraphDisplayinyOnPlayGenre(data, genreDescription) {
    if(isPlayingGenre) {
        const currentYear = localStorage.getItem("year_genres")
        if(currentYear >= document.getElementById("year_genre_slider").max-1) {
            isPlayingGenre = false
            document.getElementById("genre_play_button").innerText = "Play"
        }
        // to evict the bug when moveing the side bar during the animation.
        if(currentYear >= document.getElementById("year_developer_slider").min && currentYear <= document.getElementById("year_developer_slider").max - 1) {
            localStorage.setItem("year_genres", Number(currentYear) + 1);
            document.getElementById("year_genre_displayed").innerHTML = Number(currentYear) + 1
            document.getElementById("year_genre_slider").value = Number(currentYear) + 1
            // re draw the graph
            drawGraphGenre(data, genreDescription)
        }
    }
}