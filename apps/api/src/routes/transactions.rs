use crate::models::{BulkActionRequest, BulkActionResponse, Transaction, UpdateStatusRequest};
use crate::store::{start_simulation, STORE};
use axum::{
    extract::Query,
    routing::{get, patch, post},
    Json, Router,
};
use serde::Deserialize;
use utoipa::IntoParams;

#[derive(Deserialize, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ListQuery {
    #[serde(default = "default_page")]
    pub page: usize,
    #[serde(default = "default_limit")]
    pub limit: usize,
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub status: Option<String>,
}

fn default_page() -> usize {
    1
}

fn default_limit() -> usize {
    15
}

#[utoipa::path(
    get,
    path = "/api/transactions",
    tag = "Transactions",
    params(ListQuery),
    responses(
        (status = 200, body = [Transaction])
    )
)]
pub async fn list_transactions(
    Query(params): Query<ListQuery>,
) -> Json<Vec<Transaction>> {
    let transactions = STORE.get_transactions(
        params.limit,
        params.page,
        params.search.as_deref(),
        params.status.as_deref(),
    );
    Json(transactions)
}

#[utoipa::path(
    patch,
    path = "/api/transactions/{id}/status",
    tag = "Transactions",
    params(
        ("id" = String, Path, description = "Transaction ID")
    ),
    request_body = UpdateStatusRequest,
    responses(
        (status = 200, body = Transaction),
        (status = 404, description = "Transaction not found")
    )
)]
pub async fn update_transaction_status(
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(body): Json<UpdateStatusRequest>,
) -> Result<Json<Transaction>, axum::http::StatusCode> {
    if body.status == crate::models::TransactionStatus::Applying {
        start_simulation(id.clone(), body.scenario.clone());
        
        if let Some(tx) = STORE.get_transaction(&id) {
            return Ok(Json(tx));
        }
    }

    match STORE.update_transaction_status(&id, body.status) {
        Some(tx) => Ok(Json(tx)),
        None => Err(axum::http::StatusCode::NOT_FOUND),
    }
}

#[utoipa::path(
    post,
    path = "/api/transactions/bulk",
    tag = "Transactions",
    request_body = BulkActionRequest,
    responses(
        (status = 200, body = BulkActionResponse)
    )
)]
pub async fn bulk_update_transactions(
    Json(body): Json<BulkActionRequest>,
) -> Json<BulkActionResponse> {
    let updated_ids = STORE.update_transaction_status_bulk(&body.ids, body.action);
    Json(BulkActionResponse {
        success: true,
        updated_ids,
    })
}

pub fn router() -> Router {
    Router::new()
        .route("/transactions", get(list_transactions))
        .route("/transactions/{id}/status", patch(update_transaction_status))
        .route("/transactions/bulk", post(bulk_update_transactions))
}
