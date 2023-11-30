
async function loadIframe(url, target) {

    return new Promise((resolve, reject) => {

        const iframe = document.createElement("iframe")
        iframe.src = url
        iframe.addEventListener("load", ev => {

            resolve(iframe)
        })
        target.appendChild(iframe)
    })
}

export async function runSequence(urls) {

    const sketches = []
    let currentSketchId = -1

    const main = document.querySelector("main")
    main.style.visibility = "hidden"
    for (const url of urls) {

        sketches.push({
            url: url,
            iframe: await loadIframe(url, main)
        })
    }


    setSketch(0)
    main.style.visibility = "visible"


    function setSketch(id) {

        const prev = sketches[currentSketchId]
        if (prev) {
            prev.iframe.style = "z-index:-99"
            prev.iframe.src = prev.iframe.src;
        }

        currentSketchId = id

        const newSketch = sketches[currentSketchId]
        if (newSketch) {
            newSketch.iframe.style = "z-index:99;"
        }
    }

    function next() {

        const nextId = (currentSketchId + 1) % sketches.length
        setSketch(nextId)
    }

    window.addEventListener("message", (event) => {

        if (event.data === "finished") {
            console.log("received message to move to next sketch")
            next()
        }
    }, false)
}

/**
 * This tells the sequence runner (which has the sketch loaded as an iframe) that this sketch is finished. The next sketch will be activated.
 */
export function sendSequenceNextSignal() {

    console.log("sketch finished, starting the next one.")
    window.parent.postMessage("finished", "*")
}