// when the time is changed this funtion will be called
// ------------------------------------------ timer slider --------------------------------------------------
var isPlaying = false;

setInterval(update, 1000);

function update() {
    if (isPlaying) {
        updateTop20()
        const currTime = document.getElementById("timeSlider").value;
        if (currTime == document.getElementById("timeSlider").max) {
            onTimePlay();
            return;
        }
        document.getElementById("timeSlider").value = Number(currTime) + 1;
        document.getElementById("timeText").innerHTML = Number(currTime) + 1;
    }
}

function onTimePlay() {
    isPlaying = !isPlaying;
    const button = document.getElementById("timeButton").innerText = isPlaying ? "pause" : "play";
}

function onTimeChange() {
    updateTop20();
    if (isPlaying) {
        onTimePlay();
    }
    const slider = document.getElementById("timeSlider");
    document.getElementById("timeText").innerText = slider.value;
}

// ------------------------------------------ top 20 games --------------------------------------------------

/*
<div class="gameContainer">
    <div style="display: grid;">
        <a>title</a>
        <a>genres</a>
        <a>platforms</a>
        <a>developers</a>
        <a style="text-align: center;">#1</a>
    </div>
</div>
*/

var listInteractive;

function updateTop20() {
    let sortF = document.getElementById("metricSelector").value;
    let year = document.getElementById("timeSlider").value;
    createTop20(sortAndFilterYear(listInteractive, sortF, year).slice(0, 20));
}

function sortAndFilterYear(data, sortField, year) {
    let filter = data.filter(function(a) {
        return year == new Date(a.Release_Date).getFullYear();
    });
    return filter.sort(function(a, b) {
        return a[sortField] - b[sortField];
    });
}

function createTop20(data) {
    var txtHtml = "";
    for (let i = 0; i < 20; ++i) {
        if (data.length <= i) {
            continue;
        }
        txtHtml += '<div class="gameContainer">';
        txtHtml += '<div style="display: grid;">';
        txtHtml += '<a>' + data[i].Title + '</a>';
        txtHtml += '<a>' + data[i].Genres + '</a>';
        txtHtml += '<a>' + data[i].Platforms + '</a>';
        txtHtml += '<a>' + data[i].Developers + '</a>';
        txtHtml += '<a style="text-align: center;">#' + (i + 1) + '</a>';
        txtHtml += '</div></div>';
    }
    document.getElementById("rankContainerInteractive").innerHTML = txtHtml;
}

d3.csv("data/games_data_clean.csv", function(e, data) {
    if(e) {
        console.log('Error when loading the data for interactive diagram : ', e);
        return;
    }
    listInteractive = data;

    // initialize the top 20 with initial data
    updateTop20()
});


