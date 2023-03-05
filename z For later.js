const xhr = new XMLHttpRequest();
xhr.open("GET", "../files names/rle.txt");
xhr.onload = function () {
    if (xhr.status === 200) {
        let files = xhr.responseText.split("\n");
        file = files[Math.floor(Math.random() * files.length)];
        // console.log(file);
        const navbarTitle = document.querySelector("h1");
        //loading file
        xhr.open("GET", "../all/" + file);
        xhr.onload = function () {
            if (xhr.status === 200) {
                text = xhr.responseText;
                readingRLE(text);
            }
        };
        xhr.send();
        navbarTitle.textContent = file.slice(0, -4).toUpperCase();
    }
};
xhr.send();
