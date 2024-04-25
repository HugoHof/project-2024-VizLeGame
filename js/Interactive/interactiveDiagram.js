// when the time is changed this funtion will be called
// ------------------------------------------ timer slider --------------------------------------------------
var isPlaying = false;

setInterval(update, 1000);

function update() {
    if (isPlaying) {
        const currTime = document.getElementById("timeSlider").value;
        if (currTime == document.getElementById("timeSlider").max) {
            onTimePlay();
            return;
        }
        document.getElementById("timeSlider").value = Number(currTime) + 1;
        document.getElementById("timeText").innerHTML = Number(currTime) + 1;
        updateTop20()
    }
}

function onTimePlay() {
    isPlaying = !isPlaying;
    const button = document.getElementById("timeButton").innerText = isPlaying ? "pause" : "play";
}

function onTimeChange() {
    if (isPlaying) {
        onTimePlay();
    }
    const slider = document.getElementById("timeSlider");
    document.getElementById("timeText").innerText = slider.value;
    updateTop20();
}

// ------------------------------------------ top 20 games --------------------------------------------------

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

function listStringToString(list) {
    return list.match(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g).join(", ").replace(/["']/g, '');
}

function createTop20(data) {
    var txtHtml = "";
    for (let i = 0; i < 20; ++i) {
        if (data.length <= i) {
            continue;
        }
        txtHtml += '<div class="gameContainer">';
        txtHtml += '<div style="display: grid; height: 100%;">';
        txtHtml += '<a style="font-size: x-large; text-align: center;">' + data[i].Title + '</a>';
        txtHtml += '<a>Genres: ' + listStringToString(data[i].Genres) + '</a>';
        txtHtml += '<a>Platforms: ' + listStringToString(data[i].Platforms) + '</a>';
        txtHtml += '<a>Developers: ' + listStringToString(data[i].Developers) + '</a>';
        txtHtml += '<a style="text-align: center; align-self: end">#' + (i + 1) + '</a>';
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


