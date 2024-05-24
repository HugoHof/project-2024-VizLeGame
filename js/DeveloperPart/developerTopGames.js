//Draw the list of the games relative to a developer.
function drawListGamesDeveloper(data) {
    //change the title
    document.getElementById("developer_list_games_title")
        .textContent = "Games Realeased by " + String(currentDeveloperSelected) + " in " + String(document.getElementById("year_developer_slider").value)

    var gameLst = (data[String(document.getElementById("year_developer_slider").value)])[currentDeveloperSelected]
    // sort the games according to the criteria
    gameLst.sort(function (x, y) {
        return d3.descending(x[document.getElementById("developer_list_games_criteria").value], y[document.getElementById("developer_list_games_criteria").value]);
    });
    var textHTML = "";
    var index = 0;
    // create a card game for all the games
    for(let game of gameLst) {
        textHTML += '<div class="gameCard">'
        textHTML += '<div class= "gameCardTitleContainer">'
        textHTML += '<h1 class="gameCardTitle">' + game["Title"] + '</h1>'
        textHTML += '</div>'
        textHTML += '<div class= "gameDescriptionContainer">'
        textHTML += '<label class="gameCardLabel" for="game_developer_genre_' + index +'">Genre(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_genre_' + index +'">' + String(game["Genres"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_developer_developer_' + index +'">Developer(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_developer_' + index + '">' + String(game["Developers"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_developer_platform_' + index + '">Platform(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_developer_platform_' + index + '">' + String(game["Platforms"]).replaceAll(',', ", ") + '</p>'
        textHTML += '</div>'
        textHTML += '</div>'
        index += 1
    }
    document.getElementById("developer_list_games").innerHTML = textHTML;
    
}