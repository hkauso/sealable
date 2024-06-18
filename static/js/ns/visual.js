(() => {
    const self = reg_ns("visual"); // register namespace

    function visual_editor_event_feedback(event) {
        const target = event.target;

        if (!target) {
            return;
        }

        if (
            (event.type === "mousedown" && event.button === 0) ||
            event.type === "touchstart"
        ) {
            self.selected = target;
        }
    }

    self.define("create_visual_editor", async function (imports, bind_to) {
        bind_to.addEventListener("mousedown", visual_editor_event_feedback); // desktop
        bind_to.addEventListener("touchstart", visual_editor_event_feedback); // mobile
    });
})();
