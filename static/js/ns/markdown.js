reg_ns("markdown", ["sealable", "bundled_env"]).define(
    "fix_markdown",
    function ({ sealable, bundled_env }, root_id) {
        const theme = document.querySelector(`#${root_id} theme`);

        if (theme !== null) {
            if (theme.innerText === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }

            // update icon
            sealable.update_theme_icon();
        }

        // get js
        const bundled = document.querySelector("code.language-worker");

        if (bundled !== null) {
            if (bundled_env.workers && bundled_env.workers.length > 0) {
                // make sure we don't leave the old workers running
                for (worker of bundled_env.workers) {
                    console.info("terminated old worker");
                    worker.terminate();
                }
            }

            bundled_env.enter_env(bundled.innerText);
            bundled.remove();
        }

        // escape all code blocks
        for (const block of Array.from(
            document.querySelectorAll("#tab\\:preview pre code"),
        )) {
            block.innerHTML = block.innerHTML
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
        }

        // highlight
        hljs.highlightAll();
    },
    ["string"],
);
