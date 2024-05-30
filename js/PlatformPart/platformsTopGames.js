//Draw the list of the games relative to a developer.
function drawListGamesPlatforms(data) {
    //change the title
    document.getElementById("platforms_list_games_title")
        .textContent = "Games Realeased on " + String(currentPlatformSelected) + " in " + String(document.getElementById("year_platforms_slider").value)


    
    let gameLst = currentPlatformSelected.games
    // sort the games according to the criteria
    gameLst.sort(function (x, y) {
        return d3.descending(x[document.getElementById("platforms_list_games_criteria").value], y[document.getElementById("platforms_list_games_criteria").value]);
    });
    let textHTML = "";
    let index = 0;
    // create a card game for all the games
    for(let game of gameLst) {
        textHTML += '<div class="gameCard gameCardHorizontalFlex">'
        textHTML += '<div class= "gameCardTitleContainer">'
        textHTML += '<h1 class="gameCardTitle">' + game["Title"] + '</h1>'
        textHTML += '</div>'
        textHTML += '<div class= "gameDescriptionContainer">'
        textHTML += '<label class="gameCardLabel" for="game_platforms_genre_' + index +'">Genre(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_platforms_genre_' + index +'">' + String(game["Genres"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_platforms_developer_' + index +'">Developer(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_platforms_developer_' + index + '">' + String(game["Developers"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel" for="game_platforms_platform_' + index + '">Platform(s) </label>'
        textHTML += '<p class="gameCardTextElem" id="game_platforms_platform_' + index + '">' + String(game["Platforms"]).replaceAll(',', ", ") + '</p>'
        textHTML += '</div>'
        textHTML += '</div>'
        index += 1
    }
    document.getElementById("platforms_list_games").innerHTML = textHTML;
    
}