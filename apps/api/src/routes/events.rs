use crate::models::Transaction;
use crate::store::STORE;
use axum::{
    response::sse::{Event, Sse},
    routing::get,
    Router,
};
use futures::stream::Stream;
use std::convert::Infallible;
use std::time::Duration;

fn tx_to_event(tx: &Transaction) -> String {
    let event = serde_json::json!({
        "transactionId": tx.id,
        "status": tx.status,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });
    event.to_string()
}

#[utoipa::path(
    get,
    path = "/api/events",
    tag = "Events",
    responses(
        (status = 200, description = "Server-Sent Events stream")
    )
)]
pub async fn events_stream() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let mut rx = STORE.subscribe();

    let stream = async_stream::stream! {
        yield Ok(Event::default().data("{\"timestamp\": \"connected\"}"));

        while let Ok(tx) = rx.recv().await {
            let json = tx_to_event(&tx);
            yield Ok(Event::default().data(json));
        }
    };

    Sse::new(stream)
        .keep_alive(axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(5))
            .text("keep-alive"))
}

pub fn router() -> Router {
    Router::new()
        .route("/events", get(events_stream))
}
