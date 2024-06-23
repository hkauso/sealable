use axum::{routing::get, Router};
use pastemd::{database::Database, routing::api, DatabaseOpts};
use std::env;

mod base;
mod markdown;
mod pages;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok(); // load .env

    let port: u16 = match env::var("PORT") {
        Ok(v) => v.parse::<u16>().unwrap(),
        Err(_) => 8080,
    };

    // init database
    let database = Database::new(
        pongo::Database::env_options(),
        pastemd::database::ServerOptions {
            view_password: true,
            guppy: env::var("GUPPY_ROOT").is_ok(),
            paste_ownership: true,
            view_mode: if env::var("GUPPY_ROOT").is_ok() {
                pastemd::database::ViewMode::AuthenticatedOnce
            } else {
                pastemd::database::ViewMode::OpenMultiple
            },
            document_store: false,
        },
    )
    .await;

    database.init().await;

    let pongo_database = pongo::Database::new(
        pongo::Database::env_options(),
        pongo::ServerOptions::default(),
    )
    .await;

    pongo_database.init().await;

    // ...
    let app = Router::new()
        .route("/", get(pages::homepage))
        .merge(pages::routes(database.clone()))
        .nest("/api", api::routes(database.clone()))
        .nest("/@pongo", pongo::dashboard::routes(pongo_database.clone()))
        .fallback(api::not_found);

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{port}"))
        .await
        .unwrap();

    println!("Starting server at http://localhost:{port}!");
    axum::serve(listener, app).await.unwrap();
}
