// paste metadata editor
export default function metadata_editor(bind_to, paste_url, metadata) {
    globalThis.update_metadata_value = (name, value) => {
        metadata[name] = value;
        console.log(metadata);
    };

    // ...
    if (Object.entries(metadata).length == 0) {
        bind_to.innerHTML = `<div class="card secondary round">
            <span>No metadata options available.</span>
        </div>`;
    }

    // render
    for (const field of Object.entries(metadata)) {
        bind_to.innerHTML += `<div class="card secondary round flex justify-between items-center gap-2" id="field:${field[0]}">
            <label for="field_input:${field[0]}">${field[0]}</label>
            <input 
              id="field_input:${field[0]}" 
              type="text" 
              value="${field[1].replace('"', '\\"')}"
              onchange="globalThis.update_metadata_value('${field[0]}', event.target.value)"
              style="width: max-content"
            />
        </div>`;
    }

    // handle submit
    document
        .getElementById("submit_form")
        .addEventListener("submit", async (e) => {
            e.preventDefault();

            const res = await (
                await fetch(`/api/${paste_url}/metadata`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password: e.target.password.value,
                        metadata,
                    }),
                })
            ).json();

            if (res.success === false) {
                // TODO: do something better with the error
                alert(res.message);
            } else {
                window.location.reload();
            }
        });
}