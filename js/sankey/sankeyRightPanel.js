// sorting function
function sortSankey(data, sortField) {
    return data.sort(function(a, b) {
        return b[sortField] - a[sortField];
    });
}

function filterSankey(data, filterField, filterList) {
    return data.filter(elem => {
        let include = true;
        filterList.forEach(filter => {
            include &= elem[filterField].includes(filter)
        })
        return include;
    });
}

let sankey_data;

//Draw the list of the games relative to a developer.
async function drawListGamesSankey(sankeyData, data) {

    sankey_data = sankeyData;
    
    // edit the dropdown list---------------------------------------------------------------
    let selectedItems = [];
    selectedItems = selectedItems.concat(sankeyFilterList.genres, sankeyFilterList.developers, sankeyFilterList.platforms);
    let selectedText;
    
    if (selectedItems.length > 0) {
        selectedText = selectedItems.join(', ');
    } else {
        selectedText = "All games";
    }

    let filterText = `
        <div class="custom-select">
            <div class="selected-item" onclick="toggleDropdownSankey()">
                <div class="selected-text">Selected items: ${selectedText}</div>
                <span class="arrow down">></span>
            </div>
            <div class="custom-select-content">
    `;

    sankeyFilterList.genres.forEach(filter => {
        filterText += `<div>${filter}<span class="remove-btn" onclick="removeFilterSankey('genres', '${filter}')">x</span></div>`;
    });
    sankeyFilterList.developers.forEach(filter => {
        filterText += `<div>${filter}<span class="remove-btn" onclick="removeFilterSankey('developers', '${filter}')">x</span></div>`;
    });
    sankeyFilterList.platforms.forEach(filter => {
        filterText += `<div>${filter}<span class="remove-btn" onclick="removeFilterSankey('platforms', '${filter}')">x</span></div>`;
    });
    filterText += '</div></div>';

    document.getElementById("sankey_list_games_filter").innerHTML = filterText;

    let gameList = data;

    // filter by genre--------------------------------------------------------------------------
    if (sankeyFilterList.genres.length > 0)
        gameList = filterSankey(gameList, 'Genres', sankeyFilterList.genres);

    // filter by platform---------------------------------------------------------------------------
    if (sankeyFilterList.platforms.length > 0)
        gameList = filterSankey(gameList, 'Platforms', sankeyFilterList.platforms);

    // filter by developer-------------------------------------------------------------------------
    if (sankeyFilterList.developers.length > 0)
        gameList = filterSankey(gameList, 'Developers', sankeyFilterList.developers);

    let gameListCard = gameList;
    
    // filter by year--------------------------------------------------------------------------
    gameListCard = gameListCard.filter(function(a) {
        return document.getElementById("year_sankey_slider").value == new Date(a.Release_Date).getFullYear();
    });
    
    // sort by criteria----------------------------------------------------------------------------
    gameListCard = sortSankey(gameListCard, String(document.getElementById("sankey_list_games_criteria").value));

    let textHTML = "";

    if (gameListCard.length <= 0) {
        textHTML += '<h1 class="gameCardTitle" style="width: 100%;" >No game matching the current filter(s) and date</h1>';
    }

    // create a card game for all the games
    for(let game of gameListCard) {
        textHTML += '<div class="gameCard gameCardHorizontalFlex">'
        textHTML += '<div class= "gameCardTitleContainer">'
        textHTML += '<h1 class="gameCardTitle">' + game["Title"] + '</h1>'
        textHTML += '</div>'
        textHTML += '<div class= "gameDescriptionContainer">'
        textHTML += '<label class="gameCardLabel">Genre(s) </label>'
        textHTML += '<p class="gameCardTextElem">' + String(game["Genres"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel">Developer(s) </label>'
        textHTML += '<p class="gameCardTextElem">' + String(game["Developers"]).replaceAll(',', ", ") + '</p>'
        textHTML += '<label class="gameCardLabel">Platform(s) </label>'
        textHTML += '<p class="gameCardTextElem">' + String(game["Platforms"]).replaceAll(',', ", ") + '</p>'
        textHTML += '</div>'
        textHTML += '</div>'
    }
    document.getElementById("sankey_list_games").innerHTML = textHTML;


    // draw graph ---------------------------------------------------------------------------------------
    drawSankeyEvolutionChart(gameList);
    drawSankey(sankeyData);

}

// remove the filter, called from the dropdownmenu ---------------------------------------------------------------------
function removeFilterSankey(type, filter) {
    if (type === 'genres') {
        sankeyFilterList.genres = sankeyFilterList.genres.filter(item => item !== filter);
    } else if (type === 'developers') {
        sankeyFilterList.developers = sankeyFilterList.developers.filter(item => item !== filter);
    } else if (type === 'platforms') {
        sankeyFilterList.platforms = sankeyFilterList.platforms.filter(item => item !== filter);
    }
    // redraw
    drawListGamesSankey(sankey_data, allSankeyGames);
}

// toggle the dropdown called form the dropdownmenu
function toggleDropdownSankey() {
    const content = document.querySelector(".custom-select-content");
    const arrow = document.querySelector(".arrow");
    content.classList.toggle("show");
    arrow.classList.toggle("down");
    arrow.classList.toggle("up");
}