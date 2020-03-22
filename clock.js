var id;

function getUserName() {
    id = document.getElementById('nameField').value;
    document.getElementById("registration").style.display = "none";
    document.getElementById("test").style.display = "block";
    document.getElementById("participantID").innerHTML = id;

}

var date = new Date();
var count = 0;
var arr = [];
var pressTime;
var jumpedTime;
var reactTime;
var correctness;
var csvArr = [];
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
// get childNOdes 
c = document.getElementById("parentdiv").childNodes;

// onkeyup event. Start and react when there is a jump.
document.body.onkeyup = function(e) {
    if (e.keyCode == 83) { //s
        var fifteenMinutes = 60 * 3,
            display = document.querySelector('#time');
        startTimer(fifteenMinutes, display);
        document.getElementById("dashboard").style.display = "block";
    }
    if (e.keyCode == 32) { //space bar
        pressTime = Date.now();

        reactTime = (pressTime - jumpedTime) / 1000;
        document.getElementById("reactT").textContent = reactTime;
        if (!isNaN(reactTime)) {
            document.getElementById("correct").textContent = "Correct!";
            correctness = "Correct";
        } else {
            document.getElementById("correct").textContent = "Incorrect!";
            correctness = "Incorrect";
        }
        csvArr.push([id, Date(pressTime), dot_pos_x, dot_pos_y, reactTime, correctness]);
        jumpedTime = undefined;

    }
}

// download_csv, with the final calculation of average reation time and correct rate.
var avgReaction;
var correctRate;
var tempSum = 0;
var validCount = 0;
var correctCount = 0;
var dot_pos_x, dot_pos_y;

function download_csv() {
    var csv = 'ID, Timestamp, Dot x position, Dot y position, React Time(s), Correctness\n';
    csvArr.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });

    for (var i = 0; i < csvArr.length; i++) {
        if (!isNaN(csvArr[i][4])) {
            tempSum = csvArr[i][4] + tempSum;
            validCount++;
        }
        if (csvArr[i][5] == "Correct") correctCount++;
    }
    avgReaction = (tempSum / validCount).toFixed(2);
    correctRate = (correctCount / csvArr.length).toFixed(2);

    finalArr = [' average reaction time (s): ', avgReaction, 'correct rate: ', correctRate];
    csv += finalArr.join(',');

    console.log(csv);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'report.csv';
    hiddenElement.click();
}



// timer start. A green dot will visit all the white dots, except for the 10% jumps.
function startTimer(duration, display) {
    var timer = duration,
        minutes, seconds;

    var myTimer = setInterval(function() {
        if (count == 0) { //ignore the first child
            count++;
        }
        if (--timer <= 0) {
            document.getElementById("testDone").textContent = "You have accomplished this test!";
            document.getElementById("report").style.display = "block";
            document.getElementById("download_csv").style.display = "block";
            document.getElementById("send_csv").style.display = "block";
            document.getElementById("dashboard").style.display = "none";
            clearInterval(myTimer);
        }
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        // document.getElementById("childNodes").innerHTML = c.length;
        // if 42 dots have been visited, regenerate a random number and continue
        if (count >= 43) {
            count = 1;
            arr = [];
            c[42].style.backgroundColor = "white";
        }
        if (count == 1) {
            while (arr.length < 42 * 0.1 - 1) {
                var random_num = Math.floor(Math.random() * 41) + 1;
                if (arr.indexOf(random_num) === -1) arr.push(random_num);
            }
            // document.getElementById("myArr").innerHTML = arr;
            if (arr.includes(1)) {
                c[count + 1].style.backgroundColor = "green";
                count++;
            } else {
                c[count].style.backgroundColor = "green";
            }
        } else {
            if (arr.includes(count)) {
                //if the participant doesn't react on a jump before the next jump
                // keep the record in log as "No Reaction"
                if (csvArr.length > 1 && csvArr[csvArr.length - 1][2] != dot_pos_x) {
                    csvArr.push([id, Date(), dot_pos_x, dot_pos_y, "NaN", "No Reaction"]);
                }
                c[count - 1].style.backgroundColor = "white";
                if (count == 42) { c[1].style.backgroundColor = "green"; } else {
                    c[count + 1].style.backgroundColor = "green";
                }
                jumpedTime = Date.now();
                dot_pos_x = c[count].getBoundingClientRect().x;
                dot_pos_y = c[count].getBoundingClientRect().y;
                document.getElementById("dotpos").textContent = dot_pos_x + " , " + dot_pos_y;
                // document.getElementById("jumpT").textContent = jumpedTime;
                count++;
            } else {
                c[count - 1].style.backgroundColor = "white";
                c[count].style.backgroundColor = "green";
            }
        }
        count++;
    }, 1000);
}