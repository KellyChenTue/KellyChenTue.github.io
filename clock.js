var id;
/* Get User ID*/
function getUserId() {
    id = document.getElementById('idField').value;
    document.getElementById("registration").style.display = "none";
    document.getElementById("test").style.display = "block";
    document.getElementById("participantID").innerHTML = id;
}

function send_csv() {
    alert("Sorry, this function is not available at the moment.")
}
/* Create 42 dots */
var deg = 360 / 42;
var radius = 200;
var parentdiv = document.getElementById('parentdiv');
var offsetToParentCenter = parseInt(parentdiv.offsetWidth / 2); //assumes parent is square
var offsetToChildCenter = 20;
var totalOffset = offsetToParentCenter - offsetToChildCenter;
var f_cross = document.createElement('div');
f_cross.className = 'div_f';
f_cross.style.position = 'absolute';
f_cross.style.top = (totalOffset - 5) + "px";
f_cross.style.left = (totalOffset + 5) + "px";
parentdiv.appendChild(f_cross);
// create 42 white dots
for (var i = 1; i <= 42; ++i) {
    var childdiv = document.createElement('div');
    childdiv.className = 'div2';
    childdiv.style.position = 'absolute';
    var y = Math.sin((deg * i - 90) * (Math.PI / 180)) * radius;
    var x = Math.cos((deg * i - 90) * (Math.PI / 180)) * radius;
    childdiv.style.top = (y + totalOffset).toString() + "px";
    childdiv.style.left = (x + totalOffset).toString() + "px";
    parentdiv.appendChild(childdiv);
}
c = document.getElementById("parentdiv").childNodes; // get childNOdes 
c[42].style.backgroundColor = "green"; //starting indicator


/* Onkeyup event. Start and react when there is a jump.*/
var count = 0;
var arr = [];
var pressTime, jumpedTime, reactTime, correctness;
var csvArr = [];

document.body.onkeyup = function(e) {
        if (e.keyCode == 83) { //s
            var fifteenMinutes = 60 * 15,
                display = document.querySelector('#time');
            startTimer(fifteenMinutes, display);
        }
        if (e.keyCode == 32) { //space bar
            pressTime = Date.now();
            reactTime = (pressTime - jumpedTime) / 1000;
            if (csvArr[csvArr.length - 1][2] == count - 1) { // when the normal movement has been recorded, but reacted, it's false positive.
                correctness = "False Positive";
                csvArr.push([id, Date(), count - 1, dot_pos_x.toFixed(3), dot_pos_y.toFixed(3), "NaN", correctness]);
            } else {
                correctness = "Correct";
                csvArr.push([id, Date(pressTime), jump_idx, jump_pos_x.toFixed(3), jump_pos_y.toFixed(3), reactTime, correctness]);
                jump_idx = undefined;
            }
        }
    }
    /* download_csv, with the final calculation of average reation time and correct rate. */
var avgReaction, correctRate;
var tempSum = 0;
var validCount = 0;
var correctCount = 0;

function download_csv() {
    var csv = 'ID, Timestamp, Dot Index, Dot x position, Dot y position, React Time(s), Correctness\n';
    csvArr.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });
    for (var i = 0; i < csvArr.length; i++) {
        if (!isNaN(csvArr[i][5])) {
            tempSum = csvArr[i][5] + tempSum;
            validCount++;
        }
        if (csvArr[i][6] == "Correct") correctCount++;
    }
    avgReaction = (tempSum / validCount).toFixed(2);
    correctRate = (correctCount / csvArr.length).toFixed(2);
    finalArr = [',  average reaction time (s): ', avgReaction, 'correct rate: ', correctRate];
    csv += finalArr.join(',');

    console.log(csv);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = id + '_report.csv';
    hiddenElement.click();
}


/* timer start. A green dot will visit all the white dots, except for the 10% jumps.*/
var jump_idx, jump_pos_x, jump_pos_y, dot_idx, dot_pos_x, dot_pos_y;

function startTimer(duration, display) {
    var timer = duration,
        minutes, seconds;
    var myTimer = setInterval(function() {
        c[42].style.backgroundColor = "white"; //hide the starting indicator
        if (count == 0) { //ignore the fixation cross.
            count++;
        }
        if (--timer <= 0) {
            document.getElementById("testDone").textContent = "You have accomplished this test!";
            document.getElementById("report").style.display = "block";
            document.getElementById("download_csv").style.display = "block";
            document.getElementById("send_csv").style.display = "block"; // TODO. Github.io doesn't support hosting function of the server. 
            clearInterval(myTimer);
        }
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;

        /* if 42 dots have been visited, regenerate random numbers and continue */
        if (count >= 43) {
            count = 1;
            arr = [];
            c[42].style.backgroundColor = "white";
        }
        dot_pos_x = c[count].getBoundingClientRect().x;
        dot_pos_y = c[count].getBoundingClientRect().y;
        if (count == 1) {
            while (arr.length < 42 * 0.1 - 1) {
                var random_num = Math.floor(Math.random() * 41) + 1;
                if (arr.indexOf(random_num) === -1) arr.push(random_num);
            }
        }
        /* Perform a normal movement or a jump */
        if (arr.includes(count)) { // Jumping cases
            if (count != 1)
                c[count - 1].style.backgroundColor = "white";
            else if (count == 1) {
                c[42].style.backgroundColor = "white";
            }
            if (count == 42) { c[1].style.backgroundColor = "green"; } else {
                c[count + 1].style.backgroundColor = "green";
            }
            jumpedTime = Date.now();
            jump_idx = count;
            jump_pos_x = c[count].getBoundingClientRect().x;
            jump_pos_y = c[count].getBoundingClientRect().y;
            count++; //count the jump
        } else { // Normal cases
            if (!isNaN(jump_idx) && csvArr.length > 1 && csvArr[csvArr.length - 1][2] != jump_idx) {
                csvArr.push([id, Date(), jump_idx, jump_pos_x.toFixed(3), jump_pos_y.toFixed(3), "NaN", "No Reaction"]);
                jump_idx = undefined;
            }
            csvArr.push([id, Date(), count, dot_pos_x.toFixed(3), dot_pos_y.toFixed(3), "NaN", "Normal movement"]);

            c[count - 1].style.backgroundColor = "white";
            c[count].style.backgroundColor = "green";
        }
        count++;
    }, 1000);
}