/**
 * Anumated dynamically the displaying of a number for the 0 to the finalValueDisplayed number.
 * @param {*} elementId the id of the element to animate.
 * @param {*} finalValueDisplayed the final value displayed after the end of the animation. 
 * @param {*} animationDuration the duration of the animation (default value is 2s).
 */
function displayNumberDynamically(elementId, finalValueDisplayed, animationDuration = 2000) {
    d3.select(elementId)
    .transition()
    .tween("text" , () => {
        const interpolator = d3.interpolateNumber(0, finalValueDisplayed);
        return function(t) {
            d3.select(elementId).text(Math.round(interpolator(t)))
        }
    })
    .duration(animationDuration);
}
