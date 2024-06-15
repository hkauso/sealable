globalThis._sealable_base.fix_markdown = (root_id) => {
    const theme = document.querySelector(`#${root_id} theme`);
    
    if (theme !== undefined) {
        if (theme.innerText === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // update icon
        globalThis.update_theme_icon();
    }
};
