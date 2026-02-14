pub mod routes;

use std::fs;

use axum::{
    routing::get,
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_scalar::{Scalar, Servable};

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::transactions::list_transactions,
        routes::transactions::update_transaction_status,
        routes::transactions::bulk_update_transactions,
        routes::transactions::reapply_single_file,
        routes::transactions::reapply_all_failed_files,
        routes::prompts::list_prompts,
        routes::events::events_stream,
    ),
    components(
        schemas(
            relaycode_schema::Transaction,
            relaycode_schema::TransactionStatus,
            relaycode_schema::TransactionBlock,
            relaycode_schema::TransactionFile,
            relaycode_schema::FileStatus,
            relaycode_schema::FileApplyStatus,
            relaycode_schema::FileStatusEvent,
            relaycode_schema::BulkActionRequest,
            relaycode_schema::BulkActionResponse,
            relaycode_schema::Prompt,
            relaycode_schema::PromptStatus,
            relaycode_schema::SimulationEvent,
            relaycode_schema::UpdateStatusRequest,
            relaycode_schema::SimulationScenario,
            relaycode_schema::ReapplyFileRequest,
        )
    ),
    info(
        title = "Relaycode API",
        version = "1.0.0",
    )
)]
pub struct ApiDoc;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let openapi = ApiDoc::openapi();
    let openapi_path = std::path::Path::new("/root/code/relay/openapi.json");
    fs::write(&openapi_path, openapi.to_pretty_json().unwrap()).unwrap();

    relaycode_core::STORE.load_data();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let scalar = Scalar::with_url("/scalar", ApiDoc::openapi());
    
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/version", get(version))
        .merge(scalar)
        .nest("/api", routes::transactions::router())
        .nest("/api", routes::prompts::router())
        .nest("/api", routes::events::router())
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("Server running on http://localhost:3000");
    tracing::info!("Scalar API docs available at http://localhost:3000/scalar");
    
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn version() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "version": "1.2.4",
        "environment": "stable"
    }))
}
