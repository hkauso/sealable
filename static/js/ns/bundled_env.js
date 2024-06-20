//! Paste custom environment handler
reg_ns("bundled_env").define("enter_env", ({ $ }, code) => {
    if (!window.Worker) {
        return;
    }

    if (!$.workers) {
        $.workers = [];
    }

    // translate code
    // function calls that expect a result
    const await_calls = [
        ...code.matchAll(/\=\s*(?<NAME>.*?)\s*::\s*<\(\s*(?<ARGS>.*?)\s*\)>/gm),
    ];

    for (const call of await_calls) {
        if (!call.groups) {
            continue;
        }

        code = code.replace(
            call[0],
            `= await $(["${call.groups.NAME}", ${call.groups.ARGS}])`,
        );
    }

    // regular calls
    const regular_calls = [
        ...code.matchAll(/(?<NAME>.*?)\s*::\s*<\(\s*(?<ARGS>.*?)\s*\)>/gm),
    ];

    for (const call of regular_calls) {
        if (!call.groups) {
            continue;
        }

        code = code.replace(
            call[0],
            `$(["${call.groups.NAME}", ${call.groups.ARGS}])`,
        );
    }

    // create blob
    const blob_url = URL.createObjectURL(
        new Blob(
            [
                `const $ = (d) => {
            self.postMessage(d);

            return new Promise((resolve) => {
                self.onmessage = (d) => {
                    resolve(d.data);
                }
            });
        }\n(async () => {\n${code}\n})();`,
            ],
            {
                type: "text/javascript",
            },
        ),
    );

    // create worker
    const worker = new Worker(blob_url);
    $.workers.push(worker);

    worker.onmessage = (msg) => {
        // type check message (should be array calling global function)
        const { data } = msg;

        if (typeof data !== "object") {
            return console.error(
                "WORKER: we can't do anything with this message",
            );
        }

        // call global function and return
        const func = data[0];
        data.shift();

        if (
            ![
                "ns",
                "reg_ns",
                "trigger",
                "alert",
                "confirm",
                "prompt",
                "spawn",
                // colors
                "swap_color",
                "read_color",
                // DOM
                "create_element",
                "update_element_property",
                "update_element_attribute"
            ].includes(func)
        ) {
            return console.error("WORKER: illegal function call");
        }

        // call and return
        worker.postMessage(window[func](...data));
    };

    worker.onerror = (err) => {
        console.error("WORKER:", err.message || "UNKNOWN ERROR");
    };
});

/// Spawn new worker thread with `code`
globalThis.spawn = (code) => {
    globalThis.trigger("bundled_env:enter_env", [code]);
};

/// Get the background color and text color of an element by query selector
///
/// ## Arguments:
/// * `selector` - css selector
///
/// ## Returns:
/// * `[background color, text color]`
globalThis.read_color = (selector) => {
    const element = document.querySelector(selector);

    if (!element) {
        return ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"];
    }

    const style = window.getComputedStyle(element);
    return [style["background-color"], style.color];
};

/// Replace color in every content element on the page
globalThis.swap_color = (source, replacement) => {
    // get source as css rgb
    const source_element = document.createElement("div");
    source_element.style.backgroundColor = source;
    document.body.appendChild(source_element);
    source = window.getComputedStyle(source_element)["background-color"];
    source_element.remove();
    console.log(source);

    // ...
    for (const element of Array.from(
        document.querySelectorAll(
            "body, div, main, input, textarea, button, a, p, strong, em, h1, h2, h3, h4, h5, h6",
        ),
    )) {
        const style = window.getComputedStyle(element);

        if (style["background-color"] === source) {
            element.style.backgroundColor = replacement;
        }

        if (style.color === source) {
            element.color = replacement;
        }

        continue;
    }
};

/// Create element of type and return ID, appened to `append_to_selector`
globalThis.create_element = (type, append_to_selector) => {
    if (["script", "object", "embed", "iframe"].includes(type)) {
        console.error("WORKER: not allowed to create this element type");
        return undefined;
    }

    const element = document.createElement(type);
    const id = window.crypto.randomUUID();
    element.id = id;
    document.querySelector(append_to_selector).appendChild(element);
    return id;
};

/// Update en element's property given its `id`
globalThis.update_element_property = (id, property, value) => {
    const element = document.getElementById(id);

    if (!element) {
        return false;
    }

    element[property] = value;
    return true;
};

/// Update en element's attribute given the element `id` and attribute `name`
globalThis.update_element_attribute = (id, name, value) => {
    const element = document.getElementById(id);

    if (!element) {
        return false;
    }

    element.setAttribute(name, value);
    return true;
};
