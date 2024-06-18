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
        ...code.matchAll(/\=\s*(?<NAME>.*?)\!\s*\{\s*(?<ARGS>.*?)\};/gm),
    ];

    for (const call of await_calls) {
        if (!call.groups) {
            continue;
        }

        // const name = prompt::("Your name:");
        // const name = await $(["prompt", "Your name:"]);
        code = code.replace(
            call[0],
            `= await $(["${call.groups.NAME}", ${call.groups.ARGS}])`,
        );
    }

    // regular calls
    const regular_calls = [
        ...code.matchAll(/(?<NAME>.*?)\!\s*\{\s*(?<ARGS>.*?)\};/gm),
    ];

    for (const call of regular_calls) {
        if (!call.groups) {
            continue;
        }

        // trigger::("sealable:gen_secret", ["note-info", "Name", name]);
        // $(["trigger", "sealable:gen_secret", ["note-info", "Name", name]]);
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

globalThis.spawn = (code) => {
    globalThis.trigger("bundled_env:enter_env", [code]);
};
