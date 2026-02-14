use relaycode_schema::{FileStatusEvent, Transaction};
use relaycode_core::STORE;
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
        "type": "transaction",
        "transactionId": tx.id,
        "status": tx.status,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });
    event.to_string()
}

fn file_event_to_sse(event: &FileStatusEvent) -> String {
    let json = serde_json::json!({
        "type": "file",
        "transactionId": event.transaction_id,
        "filePath": event.file_path,
        "applyStatus": event.apply_status,
        "errorMessage": event.error_message,
    });
    json.to_string()
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
    let mut tx_rx = STORE.subscribe();
    let mut file_rx = STORE.subscribe_to_file_events();

    let stream = async_stream::stream! {
        yield Ok(Event::default().data("{\"type\": \"connected\"}"));

        loop {
            tokio::select! {
                result = tx_rx.recv() => {
                    match result {
                        Ok(tx) => {
                            let json = tx_to_event(&tx);
                            yield Ok(Event::default().data(json));
                        }
                        Err(_) => break,
                    }
                }
                result = file_rx.recv() => {
                    match result {
                        Ok(file_event) => {
                            let json = file_event_to_sse(&file_event);
                            yield Ok(Event::default().data(json));
                        }
                        Err(_) => break,
                    }
                }
            }
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
