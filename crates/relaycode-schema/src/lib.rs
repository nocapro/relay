use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq)]
#[serde(rename_all = "UPPERCASE")]
pub enum TransactionStatus {
    Pending,
    Applying,
    Applied,
    PartiallyApplied,
    Committed,
    Reverted,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "UPPERCASE")]
pub enum PromptStatus {
    Draft,
    Active,
    Completed,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq)]
#[serde(rename_all = "UPPERCASE")]
pub enum FileApplyStatus {
    Pending,
    Applying,
    Applied,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum FileStatus {
    #[serde(rename = "modified")]
    Modified,
    #[serde(rename = "created")]
    Created,
    #[serde(rename = "deleted")]
    Deleted,
    #[serde(rename = "renamed")]
    Renamed,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TransactionFile {
    pub path: String,
    pub status: FileStatus,
    #[serde(default = "default_file_apply_status")]
    pub apply_status: FileApplyStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
    pub language: String,
    pub diff: String,
}

fn default_file_apply_status() -> FileApplyStatus {
    FileApplyStatus::Pending
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TransactionBlock {
    #[serde(rename = "type")]
    pub block_type: String,
    pub content: Option<String>,
    pub file: Option<TransactionFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub status: TransactionStatus,
    pub description: String,
    pub timestamp: String,
    pub created_at: String,
    pub prompt_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_chain_root: Option<bool>,
    pub author: String,
    pub blocks: Vec<TransactionBlock>,
    pub files: Vec<TransactionFile>,
    pub provider: String,
    pub model: String,
    pub cost: String,
    pub tokens: String,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct BulkActionRequest {
    pub ids: Vec<String>,
    pub action: TransactionStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct BulkActionResponse {
    pub success: bool,
    pub updated_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub content: String,
    pub timestamp: String,
    pub status: PromptStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct SimulationEvent {
    pub transaction_id: String,
    pub status: TransactionStatus,
    pub timestamp: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progress: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct FileStatusEvent {
    pub transaction_id: String,
    pub file_path: String,
    pub apply_status: FileApplyStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "kebab-case")]
pub enum SimulationScenario {
    FastSuccess,
    SimulatedFailure,
    LongRunning,
    PartialFailure,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UpdateStatusRequest {
    pub status: TransactionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scenario: Option<SimulationScenario>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ReapplyFileRequest {
    pub file_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct ReapplyAllFailedRequest {
    pub transaction_id: String,
}
