use askama_axum::Template;
use axum::{
    extract::{Path, State},
    response::{Html, Json, IntoResponse},
    routing::{get, post, get_service},
    Router,
};

use tower_http::services::ServeDir;
use pastemd::{database::Database, model::Paste};
use sauropod::markdown::parse_markdown as shared_parse_markdown;

pub fn routes(database: Database) -> Router {
    Router::new()
        .route("/:url/edit", get(editor_request))
        .route("/:url", get(view_paste_request))
        .route("/api/render", post(render_markdown))
        // serve static dir
        .nest_service("/static", get_service(ServeDir::new("./static")))
        // ...
        .with_state(database)
}

#[derive(Template)]
#[template(path = "homepage.html")]
struct HomepageTemplate {}

pub async fn homepage() -> impl IntoResponse {
    Html(HomepageTemplate {}.render().unwrap())
}

#[derive(Template)]
#[template(path = "paste_view.html")]
struct PasteViewTemplate {
    paste: Paste,
    rendered: String,
}

#[derive(Template)]
#[template(path = "error.html")]
struct ErrorViewTemplate {
    title: String,
    error: String,
}

pub async fn view_paste_request(
    Path(url): Path<String>,
    State(database): State<Database>,
) -> impl IntoResponse {
    match database.get_paste_by_url(url).await {
        Ok(p) => {
            let rendered = shared_parse_markdown(p.content.clone(), Vec::new());
            Html(PasteViewTemplate { paste: p, rendered }.render().unwrap())
        }
        Err(e) => Html(
            ErrorViewTemplate {
                title: "Error".to_string(),
                error: e.to_string(),
            }
            .render()
            .unwrap(),
        ),
    }
}

#[derive(Template)]
#[template(path = "paste_editor.html")]
struct EditorTemplate {
    paste: Paste,
}

pub async fn editor_request(
    Path(url): Path<String>,
    State(database): State<Database>,
) -> impl IntoResponse {
    match database.get_paste_by_url(url).await {
        Ok(p) => Html(EditorTemplate { paste: p }.render().unwrap()),
        Err(e) => Html(
            ErrorViewTemplate {
                title: "Error".to_string(),
                error: e.to_string(),
            }
            .render()
            .unwrap(),
        ),
    }
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct RenderMarkdown {
    pub content: String,
}

/// Render markdown body
async fn render_markdown(Json(req): Json<RenderMarkdown>) -> Result<String, ()> {
    Ok(shared_parse_markdown(req.content.clone(), Vec::new()))
}
