globalThis._sealable_base.create_editor = (value) => {
    globalThis.editor = CodeMirror(document.getElementById("text_tab"), {
        value: value || "",
        mode: "markdown",
        lineWrapping: true,
        autoCloseBrackets: true,
        autofocus: true,
        viewportMargin: Infinity,
        lineWrapping: true,
        inputStyle: "contenteditable",
        highlightFormatting: false,
        fencedCodeBlockHighlighting: false,
        xml: false,
        smartIndent: false,
        extraKeys: {
            Home: "goLineLeft",
            End: "goLineRight",
            Enter: (cm) => {
                cm.replaceSelection("\n");
            },
        },
    });

    // ...
    document.querySelector(".CodeMirror-code").setAttribute("spellcheck", "true");
};
