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
                body: JSON.stringify({ content: globalThis.editor.getValue() }),
            })
        ).text();

        globalThis._sealable_base.fix_markdown("preview_tab"); // fix markdown
    });
}

// "SECRET"
globalThis._sealable_base.gen_secret = (type, title, content) => {
    if (document.getElementById("SECRET")) {
        // there can only be one
        document.getElementById("SECRET").remove();
    }
    
    const element = document.createElement("div");
    element.id = "SECRET";
    element.classList.add("mdnote");
    element.classList.add(type);
    element.innerHTML = `<b class="mdnote-title">${title}</b><p>${content}</p>`;
    document.querySelector("main").prepend(element);
};

// secret from query params
const search = new URLSearchParams(window.location.search);

if (search.get("SECRET")) {
    // get defaults
    // we'll always use the value given in a query param over the page-set value
    const secret_type = search.get("SECRET_TYPE")
        ? search.get("SECRET_TYPE")
        : globalThis._sealable_base.secret.type;
    const secret_title = search.get("SECRET_TITLE")
        ? search.get("SECRET_TITLE")
        : globalThis._sealable_base.secret.title;

    // ...
    globalThis._sealable_base.gen_secret(
        secret_type,
        secret_title,
        search.get("SECRET"),
    );
}

// theme
globalThis.sun_icon = document.getElementById("theme_icon_sun");
globalThis.moon_icon = document.getElementById("theme_icon_moon");

globalThis.update_theme_icon = () => {
    if (document.documentElement.classList.contains("dark")) {
        globalThis.sun_icon.style.display = "none";
        globalThis.moon_icon.style.display = "flex";
    } else {
        globalThis.sun_icon.style.display = "flex";
        globalThis.moon_icon.style.display = "none";
    }
};

globalThis.update_theme_icon(); // initial update

globalThis.toggle_theme = () => {
    if (
        window.PASTE_USES_CUSTOM_THEME &&
        window.localStorage.getItem("se:user.ForceClientTheme") !== "true"
    ) {
        return;
    }

    const current = window.localStorage.getItem("theme");

    if (current === "dark") {
        /* set light */
        document.documentElement.classList.remove("dark");
        window.localStorage.setItem("theme", "light");
    } else {
        /* set dark */
        document.documentElement.classList.add("dark");
        window.localStorage.setItem("theme", "dark");
    }

    globalThis.update_theme_icon();
};

// wants redirect
for (const element of Array.from(
    document.querySelectorAll('[data-wants-redirect="true"]'),
)) {
    element.href = `${element.href}?callback=${encodeURIComponent(
        `${window.location.origin}/api/auth/callback`,
    )}`;
}

// logout protection
for (const element of Array.from(
    document.querySelectorAll('a[href="/api/auth/logout"]'),
)) {
    element.href = "javascript:globalThis._sealable_base.logout()";
}

globalThis._sealable_base.logout = () => {
    if (
        !confirm(
            "This will log you out of your account. Are you sure you would like to do this?",
        )
    ) {
        return;
    }

    window.location.href = "/api/auth/logout";
};
