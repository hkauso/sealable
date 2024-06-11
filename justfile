build database="sqlite":
    just style
    cargo build -r --no-default-features --features {{database}}

test:
    just style
    cargo run

style:
    bunx tailwindcss -i ./static/input.css -o ./static/style.css
