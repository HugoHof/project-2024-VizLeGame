// when the time is changed this funtion will be called

var isPlaying = false;

setInterval(update, 1000);

function update() {
    if (isPlaying) {
        const currTime = document.getElementById("timeSlider").value;
        document.getElementById("timeSlider").value = Number(currTime) + 1;
        document.getElementById("timeText").innerHTML = Number(currTime) + 1;
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
}

