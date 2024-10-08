use axum::{routing::get, Router};
use pastemd::{database::Database, routing::api};
use std::env;

mod base;
mod markdown;
mod pages;

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok(); // load .env

    let host: String = match env::var("HOST") {
        Ok(s) => s,
        Err(_) => String::from("localhost"),
    };

    let port: u16 = match env::var("PORT") {
        Ok(v) => v.parse::<u16>().unwrap(),
        Err(_) => 8080,
    };

    // init database
    let database = Database::new(
        pongo::Database::env_options(),
        pastemd::database::ServerOptions {
            view_password: true,
            starstraw: env::var("USE_STARSTRAW").is_ok(),
            paste_ownership: true,
            view_mode: if env::var("USE_STARSTRAW").is_ok() {
                pastemd::database::ViewMode::AuthenticatedOnce
            } else {
                pastemd::database::ViewMode::OpenMultiple
            },
            table_pastes: pastemd::database::PastesTableConfig {
                table_name: "se_pastes".to_string(),
                prefix: "se_paste".to_string(),
                ..Default::default()
            },
            table_views: pastemd::database::ViewsTableConfig {
                table_name: "se_views".to_string(),
                prefix: "se_views".to_string(),
            },
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
    std::env::set_var("PO_NESTED", "a/pongo");
    std::env::set_var("PO_STARSTRAW", "/star");

    let starstraw_database = starstraw::Database::new(
        starstraw::Database::env_options(),
        starstraw::ServerOptions::default(),
    )
    .await;

    starstraw_database.init().await;

    // ...
    let app = Router::new()
        .route("/", get(pages::homepage))
        .merge(pages::routes(database.clone()))
        .merge(pages::extra_starstraw_routes(starstraw_database.clone()))
        .nest("/api", api::routes(database.clone()))
        .nest("/star", pongo::starstraw::routes(starstraw_database))
        .nest("/a/pongo", pongo::dashboard::routes(pongo_database.clone()))
        .fallback(api::not_found);

    let listener = tokio::net::TcpListener::bind(format!("{host}:{port}"))
        .await
        .unwrap();

    println!("Starting server at http://{host}:{port}");
    axum::serve(listener, app).await.unwrap();
}
