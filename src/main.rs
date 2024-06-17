use axum::{routing::get, Router};
use pastemd::{database::Database, routing::api, DatabaseOpts};
use std::env;

mod base;
mod pages;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok(); // load .env

    let port: u16 = match env::var("PORT") {
        Ok(v) => v.parse::<u16>().unwrap(),
        Err(_) => 8080,
    };

    let database = Database::new(
        DatabaseOpts {
            // dorsal expects "_type" and "host" to be Option but "env::var" gives Result...
            // we just need to convert the result to an option
            _type: match env::var("DB_TYPE") {
                Ok(v) => Option::Some(v),
                Err(_) => Option::None,
            },
            host: match env::var("DB_HOST") {
                Ok(v) => Option::Some(v),
                Err(_) => Option::None,
            },
            user: env::var("DB_USER").unwrap_or(String::new()),
            pass: env::var("DB_PASS").unwrap_or(String::new()),
            name: env::var("DB_NAME").unwrap_or(String::new()),
        },
        pastemd::database::ServerOptions {
            view_password: true,
            guppy: env::var("GUPPY_ROOT").is_ok(),
            paste_ownership: true,
            view_mode: if env::var("GUPPY_ROOT").is_ok() {
                pastemd::database::ViewMode::AuthenticatedOnce
            } else {
                pastemd::database::ViewMode::OpenMultiple
            },
        },
    )
    .await;

    database.init().await;

    let app = Router::new()
        .route("/", get(pages::homepage))
        .merge(pages::routes(database.clone()))
        .nest("/api", api::routes(database.clone()))
        .fallback(api::not_found);

    let listener = tokio::net::TcpListener::bind(format!("127.0.0.1:{port}"))
        .await
        .unwrap();

    println!("Starting server at http://localhost:{port}!");
    axum::serve(listener, app).await.unwrap();
}
