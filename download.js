import * as AudioPlayer from "./audio_player.js";

document.getElementById("downloadButton").addEventListener("click", function (event) {
    event.preventDefault();
    saveTextGrid();
});
  
const downloadLink = document.createElement("a");
document.body.appendChild(downloadLink);

function textGridInterval(index, xmin, xmax, text) {
    return `
            intervals [${index + 1}]:
            xmin = ${xmin}
            xmax = ${xmax}
            text = "${text}"
`}

async function saveTextGrid(event) {
    await saveAll();

    var str = textGridHeader(AudioPlayer.getDuration(), subsCount);
    var xmin = 0, xmax = 0;
    for (var n = subsCount-1, i = 0; i < n; i++) {
        xmin = xmax;
        xmax = await loadTime(i+1);
        str += textGridInterval(i, xmin, xmax, await loadText(i));
    }   
    str += textGridInterval(n, xmax, AudioPlayer.getDuration(), await loadText(n));

    var file = new Blob([str], {type: 'text/plain'});
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = phapname.split("/")[1] + '.txt';
    downloadLink.target = '_blank';
    downloadLink.click();
}

function textGridHeader(xmax, size) {
return `File type = "ooTextFile"
Object class = "TextGrid"

xmin = 0
xmax = ${xmax}
tiers? <exists>
size = 1
item []:
    item [1]:
        class = "IntervalTier"
        name = "segments"
        xmin = 0
        xmax = ${xmax}
        intervals: size = ${size}
`
}
