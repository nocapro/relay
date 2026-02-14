use axum::{
    routing::post,
    Json, Router,
};

#[utoipa::path(
    post,
    path = "/api/dev/reset",
    tag = "Dev",
    responses(
        (status = 200, description = "Mock data reset successfully")
    )
)]
pub async fn reset_mock_data() -> Json<serde_json::Value> {
    relaycode_core::STORE.load_data();
    Json(serde_json::json!({ "success": true, "message": "Mock data reset" }))
}

pub fn router() -> Router {
    Router::new()
        .route("/dev/reset", post(reset_mock_data))
}
