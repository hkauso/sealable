// localized times
setTimeout(() => {
    for (const element of Array.from(
        document.querySelectorAll(".date-time-to-localize"),
    ))
        element.innerText = new Date(
            parseInt(element.innerText),
        ).toLocaleDateString();
}, 50);

// tabs
const text_button = document.getElementById("text_button");
const text_tab = document.getElementById("text_tab");

const preview_button = document.getElementById("preview_button");
const preview_tab = document.getElementById("preview_tab");

if (text_button && preview_button) {
    text_button.addEventListener("click", () => {
        preview_button.classList.add("secondary");
        text_button.classList.remove("secondary");

        preview_tab.style.display = "none";
        text_tab.style.display = "block";
    });

    preview_button.addEventListener("click", async () => {
        text_button.classList.add("secondary");
        preview_button.classList.remove("secondary");

        text_tab.style.display = "none";
        preview_tab.style.display = "block";

        // render
        preview_tab.innerHTML = await (
            await fetch("/api/render", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: globalThis.editor.getValue()  }),
            })
        ).text();
    });
}

// "SECRET"
const search = new URLSearchParams(window.location.search);

if (search.get("SECRET")) {
    alert(`Page secret: ${search.get("SECRET")}`);
}
