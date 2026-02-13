use relaycode_schema::Prompt;
use relaycode_core::STORE;
use axum::{routing::get, Json, Router};

#[utoipa::path(
    get,
    path = "/api/prompts",
    tag = "Prompts",
    responses(
        (status = 200, body = [Prompt])
    )
)]
pub async fn list_prompts() -> Json<Vec<Prompt>> {
    Json(STORE.get_prompts())
}

pub fn router() -> Router {
    Router::new()
        .route("/prompts", get(list_prompts))
}
