async function searchVids(host, e, limit, pid) {
    const url = `https://${host.name}/index.php?page=dapi&s=post&q=index${limit ? "&limit=" + limit : ""}${pid ? "&pid=" + pid : ""}&json=1&tags=video`;
    const res = await fetch(url + " " + e);
    if (!res.ok) {
        console.log(res.status);
        return;
    }
    return res.json().then(v => v.map(host.mapper));
}

async function searchVidsAll(host, e) {
    let vidsAll = [];
    let pagesCount = 0;
    while (true) {
        try {
            const vids = await searchVids(host, e, 1000, pagesCount++);
            vidsAll = vidsAll.concat(vids);
            if (vids.length !== 1000) {
                break;
            }
        }
        catch {
            break;
        }
    }
    return vidsAll;
}

async function setVid(vid) {
    if (!vid) return;
    document.querySelector("#source").href = vid.source;
    const player = document.querySelector("video");
    player.src = vid.url;
    player.play();
}

function hostedSearhVids (host) {
    return (...args) => searchVids(host, ...args);
}

function* cycleHost() {
    const hosts = [
        { name: "api.rule34.xxx", icon: "./assets/r34.png", mapper: (video) => {
            return {
                url: video.file_url,
                source: "https://rule34.xxx/index.php?page=post&s=view&id=" + video.id
            }
        }},
        { name: "realbooru.com", icon: "./assets/realbooru.png", mapper: (video) => {
            return {
                url: `https://realbooru.com//images/${video.directory}/${video.image}`,
                source: "https://realbooru.com/index.php?page=post&s=view&id=" + video.id
            }
        }}
    ]
    
    for (const h of hosts) {
        h.search = hostedSearhVids(h);
    }

    while (true) {
        for (const h of hosts) {
            yield h;
        }
    }
}

async function start() {
    const searchbar = document.querySelector(".searchbar");
    const indexInput = document.querySelector(".index-input");
    const vidsSize = document.querySelector(".vids-size");
    const videoPlayer = document.querySelector("video");
    const hostnameEl = document.querySelector("#hostname");

    const hostGen = cycleHost();
    const nextHost = () => {
        const h = hostGen.next().value;
        document.querySelector("link[rel~='icon']").href = h.icon;
        document.querySelector("#hostname img").src = h.icon;
        return h;
    }
    let currentHost = nextHost();

    let vids = [];
    let currentIndex = 0;
    let searchId = 0;

    ['seeking', 'play', 'pause', 'fullscreenchange'].forEach((event) => {
        document.querySelector('video').addEventListener(event, (e) => {
            if (document.activeElement.nodeName !== "VIDEO") {
                return;
            }
            e.target.focus();
        });
    });

    hostnameEl.addEventListener('click', (e) => {
        currentHost = nextHost();
    });

    const nextVideo = () => {
        if (0 <= currentIndex && currentIndex < vids.length - 1) {
            setVid(vids[++currentIndex]);
            indexInput.value = "";
            indexInput.placeholder = currentIndex + 1;
        }
    }
    const prevVideo = () => {
        if (0 < currentIndex && currentIndex < vids.length) {
            setVid(vids[--currentIndex]);
            indexInput.value = "";
            indexInput.placeholder = currentIndex + 1;
        }
    }

    document.querySelector(".side-button_right").addEventListener("click", nextVideo);
    document.querySelector(".side-button_left").addEventListener("click", prevVideo);

    document.addEventListener("keydown", async (e) => {
        if (e.key === "Escape") {
            // e.target.blur();
            videoPlayer.focus();
        }
        if (e.target.nodeName === "INPUT") {
            if (e.key !== "Enter") {
                return;
            }
            if (e.target === searchbar) {
                searchId++;
                try {
                    vids = await currentHost.search(e.target.value, 1000);
                }
                catch {
                    searchbar.style.borderBottom = "2px solid red";
                    searchbar.style.marginBottom = "-2px";
                    return;
                }
                setVid(vids[0]);
                searchbar.style.marginBottom = "";
                searchbar.style.borderBottom = "";
                currentIndex = 0;
                indexInput.value = "";
                indexInput.placeholder = currentIndex + 1;
                vidsSize.textContent = "/" + vids.length;
                videoPlayer.focus();

                (async function () {
                    const localTags = e.target.value;
                    const localCurrentHost = {...currentHost};
                    const localSearchId = searchId;
                    let pagesCount = 1;
                    while (true) {
                        try {
                            const pageVids = await localCurrentHost.search(localTags, 1000, pagesCount++);
                            if (searchId !== localSearchId) {
                                return;
                            }
                            if (pageVids.length === 0) {
                                break;
                            }
                            vids = vids.concat(pageVids);
                            indexInput.placeholder = currentIndex + 1;
                            vidsSize.textContent = "/" + vids.length;
                        }
                        catch {
                            break;
                        }
                    }
                })();
            }
            if (e.target === indexInput) {
                const vid = vids[e.target.value - 1];
                if (!vid) {
                    return;
                }
                setVid(vid);
                currentIndex = +e.target.value - 1;
                indexInput.value = "";
                indexInput.placeholder = currentIndex + 1;
                videoPlayer.focus();
            }
            return;
        }
        if (e.code === "Slash") {
            e.preventDefault();
            searchbar.focus();
        }
        if (e.code === "Semicolon") {
            e.preventDefault();
            indexInput.focus();
        }
        if (e.code === "KeyL") {
            e.preventDefault();
            currentHost = nextHost();
        }
        if (e.code === "KeyF") {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        if (e.code === "Comma") {
            prevVideo();
        }
        if (e.code === "Period") {
            nextVideo();
        }
    });
}

start();