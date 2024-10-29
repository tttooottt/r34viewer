// ==UserScript==
// @name        r34viewer
// @namespace   tttooottt
// @version     0.1.0
// @author      tttooottt
// @description r34viewer on realbooru(CORS fix)
// @match       *://*.realbooru.com/r34viewer
// @grant       GM_addStyle
// @license     MIT
// ==/UserScript==

document.querySelector('html').innerHTML =`
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>r34viewer</title>
    <link rel="icon" type="image/x-icon">
  </head>
  <body>
  <style>
  body,html {
    margin: 0;
    padding: 0;
    overflow-y:hidden;
}

* {
    box-sizing: border-box;
}

video {
    object-fit: contain;
    height: 100%;
    max-width: 100%;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0F0F0F;
}

main {
    height: 100vh;
}

.topnav {
    font-size: 2rem;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: flex;
    opacity: 0;
}

.topnav:hover, .topnav:has(.searchbar:focus, .index-input:focus) {
    opacity: 1;
}

.topnav-button {
    margin-left: auto;
    background-color: #2F2F2F;
    color: #C5AFA4;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    /* padding-right: 0.5em;
    padding-left: 0.5em; */
}

.searchbar {
    background-color: #2F2F2F;
    width: 100%;
    border: none;
    font-size: 1em;
    padding: 0.5em;
    color: #C5AFA4;
}

button:focus, input:focus, video:focus{
    outline: none;
}

::selection {
    color:rgb(207, 207, 207);
    background: rgb(36, 36, 36);
}

.index-size {
    text-align: center;
    padding: 0.5em;
    font-family: sans-serif;
    color: #C5AFA4;
    display: inline-flex;
    background-color: #2F2F2F;
}

.index-input {
    background-color: #2F2F2F;
    width: 100%;
    max-width: 6em;
    text-align: end;
    border: none;
    font-size: 1em;
    color: #C5AFA4;
}

.vids-size {
    margin-top: 1px;
}

#source {
    padding-right: 0.5em;
}

#hostname {
    padding-left: 0.5em;
}

#hostname img {
    height: 1em;
    cursor: pointer;
}

.topnav-button svg {
    cursor: pointer;
}
  </style>
    <main>
        <div class="topnav">
          <div id="hostname" class="topnav-button" target="_blank" rel="noopener noreferrer">
            <img src="./assets/r34.png"></img>
          </div>
          <input class="searchbar" type="text">
          <div class="index-size">
            <input class="index-input" placeholder="0"></input>
            <div class="vids-size">/0</div>
          </div>
          <a id="source" class="topnav-button" target="_blank" rel="noopener noreferrer">
            <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 13.9633H8V7.96331H14V9.96331H11.4142L16.7438 15.2929L15.3296 16.7071L10 11.3775L10 13.9633Z"
              fill="currentColor"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M1 19C1 21.2091 2.79086 23 5 23H19C21.2091 23 23 21.2091 23 19V5C23 2.79086 21.2091 1 19 1H5C2.79086 1 1 2.79086 1 5V19ZM5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z"
              fill="currentColor"
            />
          </svg>
          </a>
        </div>
        <video playsinline controls autoplay loop></video>
    </main>
    <script src="index.js"></script>
  </body>`


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
        { name: "api.rule34.xxx", icon: "https://raw.githubusercontent.com/tttooottt/r34viewer/refs/heads/main/assets/r34.png", mapper: (video) => {
            return {
                url: video.file_url,
                source: "https://rule34.xxx/index.php?page=post&s=view&id=" + video.id
            }
        }},
        { name: "realbooru.com", icon: "https://raw.githubusercontent.com/tttooottt/r34viewer/refs/heads/main/assets/realbooru.png", mapper: (video) => {
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

    document.addEventListener("keydown", async (e) => {
        if (e.key === "Escape") {
            // e.target.blur();
            videoPlayer.focus();
        }
        if (e.target.nodeName === "INPUT") {
            if (e.code !== "Enter") {
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
        if (e.code === "Comma") {
            if (0 < currentIndex && currentIndex < vids.length) {
                setVid(vids[--currentIndex]);
                indexInput.value = "";
                indexInput.placeholder = currentIndex + 1;
            }
        }
        if (e.code === "Period") {
            if (0 <= currentIndex && currentIndex < vids.length - 1) {
                setVid(vids[++currentIndex]);
                indexInput.value = "";
                indexInput.placeholder = currentIndex + 1;
            }
        }
    });
}

start();