// ==UserScript==
// @name        rule34.xxx hover
// @namespace   tttooottt
// @version     0.1.0
// @author      tttooottt
// @description Hover over thumbnail to preview
// @match       *://*.rule34.xxx/*
// @license     MIT
// ==/UserScript==

document.querySelectorAll('.thumb img').forEach(t => {
    t.title ="";
    t.addEventListener('mouseover', async (thumb) => {
        const url = new URL(thumb.target.src);
        const id = [...url.searchParams][0][0];
        const prev = document.createElement('video');
        prev.loop = true;
        prev.classList.add("gif-preview");
        prev.style.position = "fixed";
        prev.style.top = 0;
        if (thumb.screenX > window.innerWidth/2)
            prev.style.left = 0
        else
            prev.style.right = 0;
        prev.style.maxWidth = "49%";
        prev.style.maxHeight = "100%";
        prev.style.zIndex = 99;
        document.body.appendChild(prev);
        thumb.target.addEventListener("mouseleave", (e) => {
            prev.remove(); console.log(e);
        }, { once: "true" });
        const res = await fetch("https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&id=" + id);
        const vi = await res.json();
        if (document.body.contains(prev)) {
            prev.src = vi[0].file_url;
            prev.play();
        }
})});