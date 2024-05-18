//Draw the list of the games relative to a developer.
function drawListGamesDeveloper(data) {
    // obatins the current developer, year and ranking criteria selected
    const developer = localStorage.getItem("developer_selected")
    const criteria = localStorage.getItem("developer_list_games_criteria")
    const year = localStorage.getItem("year_developer")
    var gameLst = (data[String(year)])[developer]
    // sort the games according to the criteria
    gameLst.sort(function (x, y) {
        return d3.descending(x[criteria], y[criteria]);
    });
    var textHTML = "";
    var index = 0;
    // create a card game for all the games
    for(let game of gameLst) {
        textHTML += '<div class="gameCard" style="display: inline-table;">'
        textHTML += '<div class= "gameCardTitleContainer">'
        textHTML += '<h1 class="gameCardTitle">' + game["Title"] + '</h1>'
        textHTML += '</div>'
        textHTML += '<div class= "gameDescriptionContainer">'
        textHTML += '<label class="gameCardLabel" for="game_developer_genre_' + index +'">Genre(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_genre_' + index +'">' + String(game["Genres"]).replaceAll(',', "<br>") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_developer_developer_' + index +'">Developer(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_developer_' + index + '">' + String(game["Developers"]).replaceAll(',', "<br>") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_developer_platform_' + index + '">Platform(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_platform_' + index + '">' + String(game["Platforms"]).replaceAll(',', "<br>") + '</p>'
        textHTML += '</div>'
        textHTML += '</div>'
        index += 1
    }
    document.getElementById("developer_list_games").innerHTML = textHTML;
    
}