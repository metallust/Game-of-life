const toggleButton = document.getElementById("toggle-button");
const resetButton = document.querySelector(".reset-btn");

const slider = document.getElementById("resize-slider");
const output = document.getElementById("slidervalue");
const randomizeButton = document.querySelector(".randomize-btn");

let grid = [];
let rows,
    cols = 50;
let start = false;
let loadedtext;
let originx, originy;
let xoff = 0,
    yoff = 0;
let xlen, ylen;

const navbar = document.querySelector("nav");
const navbarHeight = navbar.offsetHeight;

function setup() {
    createCanvas(windowWidth, windowHeight - navbarHeight);
    let w = width / cols;
    rows = floor(height / w);
    output.textContent = cols;
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    loadLivePixels(); //randomly load a rle file from "all" folder
    for (let i = 0; i < grid.length; i++) grid[i].addneigbour();
}

function draw() {
    if (start) {
        background(51, 50);
        let temp = [];
        for (let i = 0; i < grid.length; i++) {
            temp.push(grid[i].update());
        }
        for (let i = 0; i < grid.length; i++) {
            if (grid[i].state !== temp[i]) {
                grid[i].state = temp[i];
                grid[i].display();
            } else if (grid[i].state) {
                grid[i].display();
            }
        }
    }
    // for (let i = 0; i < grid.length; i++) grid[i].display();
    // noLoop();
}

class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.state = false;
        this.neigbour = [];
    }

    display() {
        noStroke();
        if (this.state) {
            fill(0, 255, 0);
        } else {
            fill(255, 0, 0);
        }
        rect(
            this.i * (width / cols),
            this.j * (height / rows),
            width / cols,
            height / rows
        );
    }
    addneigbour() {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let cell = grid[indexOf(this.i + i, this.j + j)];
                if (this !== cell) this.neigbour.push(cell);
            }
        }
    }

    update() {
        let count = 0;
        this.neigbour.forEach((element) => {
            if (element.state) count++;
        });
        // ! rules

        if (this.state && count < 2) return false; //underpopulation
        else if (this.state && count > 3) return false; //overpopulation
        else if (this.state && (count == 2 || count == 3)) return true;
        else if (!this.state && count == 3) return true;
        else return this.state;
    }
}

function indexOf(i, j) {
    if (i === -1) i = cols - 1;
    if (i === cols) i = 0;
    if (j === -1) j = rows - 1;
    if (j === rows) j = 0;
    return i + cols * j;
}

addEventListener("keydown", (e) => {
    if (e.key === " ") {
        start = !start;
    }
    updateToggle();
});

function calculateOffset(text) {
    xoff = 0;
    yoff = 0;
    let temptext = text.split("\n");
    ylen = temptext.length;
    xlen = max(temptext.map((element) => element.length));
    xoff = floor(xlen / 2);
    yoff = floor(ylen / 2);
    console.log(cols, rows, xlen + 30, ylen + 30);
}

function readingPlainText(text) {
    background(51);
    originx = floor(cols / 2);
    originy = floor(rows / 2);
    calculateOffset(text);
    let padding = 30;
    if (xlen + padding >= cols || ylen + padding >= rows) {
        if (ylen + padding >= rows) {
            rows = ylen + padding + 1;
            let w = height / rows;
            cols = floor(width / w) + 2;
            console.log(cols);
        } else {
            cols = xlen + padding + 1;
            // console.log("it was x");
        }
        console.log(
            "The file is too big to be displayed changing no. of columns to " +
                cols +
                " " +
                rows
        );
        output.value = cols;
        slider.value = cols;
        slider.min = cols;
        changingCellWidth(cols);
        return;
    }
    let x = -xoff,
        y = -yoff;
    console.log(grid.length);

    for (let i = 0; i < text.length; i++) {
        if (text[i] === "O") {
            try {
                let cell = grid[indexOf(originx + x, originy + y)];
                cell.state = true;
                cell.display();
            } catch (error) {
                console.log(
                    "error" + i + " " + (originx + x) + " " + (originy + y)
                );
            }
            x++;
        } else if (text[i] === "\n") {
            x = -xoff;
            y++;
        } else if (text[i] === ".") {
            x++;
        }
    }
}

function readingRLE(text) {
    let head = skipingHead(text);
    loadedtext = convertRLEtoPlainText(text, head);
    readingPlainText(loadedtext);
}

function skipingHead(text) {
    let i = 0;
    while (text[i] === "#" || text[i] === "x") {
        while (text[i] !== "\n") i++;
        i++;
    }
    return i;
}

function convertRLEtoPlainText(text, head) {
    let newTxt = "";
    let m = 1;
    for (let i = head; text[i] !== "!"; i++) {
        if (text[i] === "\r" || text[i] === "\n") continue;
        let num = "";
        for (let j = i; !isNaN(text[i]); j++) {
            num += text[j];
            i = j;
        }
        num === "" ? (m = 1) : (m = parseInt(num));
        newTxt += text[i].repeat(m);
    }
    newTxt = newTxt
        .replaceAll("b", ".")
        .replaceAll("o", "O")
        .replaceAll("$", "\n");
    console.log(newTxt);
    return newTxt;
}
function loadLivePixels() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "files names/rle.txt");
    xhr.onload = function () {
        if (xhr.status === 200) {
            let files = xhr.responseText.split("\n");
            let file = files[Math.floor(Math.random() * files.length)];
            // console.log(file);
            const navbarTitle = document.querySelector("nav h1");
            //loading file
            // xhr.open("GET", "./all/3enginecordershiprake.rle");
            xhr.open("GET", "./all/" + file);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    text = xhr.responseText;
                    console.log(text);
                    readingRLE(text);
                }
            };
            xhr.send();
            navbarTitle.textContent = file.slice(0, -4);
        }
    };
    xhr.send();
}

function reset() {
    start = false;
    slider.min = 30;
    updateToggle();
    background(51);
    for (let i = 0; i < grid.length; i++) grid[i].state = false;
    readingPlainText(loadedtext);
}

function randomize() {
    for (let i = 0; i < grid.length; i++) grid[i].state = false;
    start = false;
    cols = 50;
    let w = width / cols;
    rows = floor(height / w);
    output.textContent = cols;
    updateToggle();
    loadLivePixels();
}

function changingCellWidth(newCols) {
    start = false;
    cols = newCols;
    grid = [];
    let w = width / cols;
    rows = floor(height / w);
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            grid.push(new Cell(i, j));
        }
    }
    for (let i = 0; i < grid.length; i++) grid[i].addneigbour();
    readingPlainText(loadedtext);
    output.textContent = cols;
    slider.value = cols;
}

toggleButton.addEventListener("click", function () {
    start = !start;
    updateToggle();
});

function updateToggle() {
    if (start) {
        toggleButton.textContent = "Stop (Space)";
        // start functionality
    } else {
        toggleButton.textContent = "Start (Space)";
        // stop functionality
    }
}

resetButton.addEventListener("click", function () {
    reset();
    resetButton.blur();
});

slider.addEventListener("change", function () {
    const value = slider.value;
    output.textContent = value;
    changingCellWidth(parseInt(value));
    slider.blur();
});

randomizeButton.addEventListener("click", function () {
    randomize();
    randomizeButton.blur();
});
