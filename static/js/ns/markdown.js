reg_ns("markdown", ["sealable"]).define(
    "fix_markdown",
    function (imports, root_id) {
        const theme = document.querySelector(`#${root_id} theme`);

        if (theme !== null) {
            if (theme.innerText === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            // update icon
            imports.sealable.update_theme_icon();
        }
    },
    ["string"],
);
