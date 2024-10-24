async function searchVids(e) {
    const url = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=1000&json=1&tags=video"
    const res = await fetch(url + " " + e);
    if (!res.ok) {
        console.log(res.status);
        return;
    }
    console.log(res);
    return res.json();
}

async function setVid(vid) {
    if (!vid) return;
    document.querySelector("#source").href = "https://rule34.xxx/index.php?page=post&s=view&id=" + vid.id;
    const player = document.querySelector("video");
    player.src = vid.file_url;
    player.play();
}

async function start() {
    const searchbar = document.querySelector(".searchbar");
    let vids = [];
    let currentIndex = 0;
    ['seeking', 'play', 'pause', 'volumechange', 'fullscreenchange'].forEach((event) => {
        document.querySelector('video').addEventListener(event, (e) => e.target.focus());
    });
    document.addEventListener("keydown", async (e) => {
        if (e.key === "Escape") {
            e.target.blur();
        }
        if (e.target.nodeName === "INPUT") {
            if (e.code === "Enter") {
                try {
                    vids = await searchVids(e.target.value);
                    setVid(vids[0]);
                    searchbar.style.outline = "";
                }
                catch {
                    searchbar.style.outline = "2px solid red";
                }
            }
            return;
        }
        if (e.code === "Slash") {
            e.preventDefault();
            searchbar.focus();
        }

        if (e.code === "Comma") {
            if (0 < currentIndex && currentIndex < vids.length)
                setVid(vids[--currentIndex]);
        }
        if (e.code === "Period") {
            if (0 <= currentIndex && currentIndex < vids.length - 1)
                setVid(vids[++currentIndex]);
        }
    });
}

start();