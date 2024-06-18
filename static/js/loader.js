//! Sealable Namespace Loader

/// Query an existing namespace
globalThis.ns = (ns) => {
    console.info("namespace query:", ns);

    // get namespace from sealable base
    let res = globalThis._sealable_base.ns_store[`$${ns}`];

    if (!res) {
        return console.error(
            "namespace does not exist, please use one of the following:",
            Object.keys(globalThis._sealable_base.ns_store),
        );
    }

    return res;
};

/// Register a new namespace
globalThis.reg_ns = (ns, deps) => {
    if (typeof ns !== "string") {
        return console.error("type check failed on namespace:", ns);
    }

    if (!ns) {
        return console.error("cannot register invalid namespace!");
    }

    if (globalThis._sealable_base.ns_store[`$${ns}`]) {
        console.warn("overwriting existing namespace:", ns);
    }

    // register new blank namespace
    globalThis._sealable_base.ns_store[`$${ns}`] = {
        _ident: ns,
        _deps: deps || [],
        /// Pull dependencies (other namespaces) as listed in the given `deps` argument
        _get_deps: () => {
            const self = globalThis.ns(ns);
            let deps = {};

            for (const dep of self._deps) {
                const res = globalThis.ns(dep);

                if (!res) {
                    console.warn("failed to pull dependency:", dep);
                    continue;
                }

                deps[dep] = res;
            }

            return deps;
        },
        /// Store the real versions of functions
        _fn_store: {},
        /// Call a function in a namespace and load namespace dependencies
        define: (name, func, types) => {
            const self = globalThis.ns(ns);
            self._fn_store[name] = func; // store real function
            // this is js so we can just say this takes no arguments and then give them anyways
            // (as long as the function is anonymous and not arrow, we can use `arguments`)
            self[name] = function () {
                console.info("namespace call:", ns, name);

                // js doesn't provide type checking, we do
                if (types) {
                    for (const i in arguments) {
                        if (types[i] && typeof arguments[i] !== types[i]) {
                            return console.error(
                                "argument does not pass type check:",
                                i,
                                arguments[i],
                            );
                        }
                    }
                }

                // ...
                self._fn_store[name](self._get_deps(), ...arguments); // call with deps and arguments
            };
        },
    };

    console.log("registered namespace:", ns);
    return globalThis._sealable_base.ns_store[`$${ns}`];
};

/// Call a namespace function quickly
globalThis.trigger = (id, args) => {
    // get namespace
    const [namespace, func] = id.split(":");
    const self = ns(namespace);

    if (!self) {
        return console.error("namespace does not exist:", namespace);
    }

    return self[func](...(args || []));
};

/// Import a namespace from path (relative to `/static/js/ns/`)
globalThis.use = (id, callback) => {
    // check if namespace already exists
    const res = globalThis._sealable_base.ns_store[`$${id}`];

    if (res) {
        return callback(res);
    }

    // create script to load
    const script = document.createElement("script");
    script.src = `/static/js/ns/${id}.js`;
    document.head.appendChild(script);
    script.setAttribute("data-registered", new Date().toISOString());

    // run callback once the script loads
    script.addEventListener("load", () => {
        const res = globalThis._sealable_base.ns_store[`$${id}`];

        if (!res) {
            return console.error("imported namespace failed to register:", id);
        }

        callback(res);
    });
};
