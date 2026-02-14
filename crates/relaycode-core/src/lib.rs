use relaycode_schema::{FileApplyStatus, FileStatusEvent, SimulationScenario, Transaction, TransactionStatus, TransactionFile, Prompt};
use std::sync::{Arc, RwLock};
use tokio::sync::broadcast;

pub type Subscriber = Arc<dyn Fn(Transaction) + Send + Sync>;

#[derive(Default)]
pub struct AppState {
    pub transactions: Vec<Transaction>,
    pub prompts: Vec<Prompt>,
    active_simulations: std::collections::HashSet<String>,
}

pub struct Store {
    pub state: Arc<RwLock<AppState>>,
    pub tx_sender: broadcast::Sender<Transaction>,
    pub file_sender: broadcast::Sender<FileStatusEvent>,
}

impl Default for Store {
    fn default() -> Self {
        let (tx_sender, _) = broadcast::channel(100);
        let (file_sender, _) = broadcast::channel(100);
        Self {
            state: Arc::new(RwLock::new(AppState::default())),
            tx_sender,
            file_sender,
        }
    }
}

impl Store {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn load_data(&self) {
        let data = include_str!("data/mock-data.json");
        let parsed: serde_json::Value = serde_json::from_str(data).unwrap();
        
        let transactions: Vec<Transaction> = serde_json::from_value(
            parsed["transactions"].clone()
        ).unwrap();
        
        let prompts: Vec<Prompt> = serde_json::from_value(
            parsed["prompts"].clone()
        ).unwrap();

        let mut state = self.state.write().unwrap();
        state.transactions = transactions;
        state.prompts = prompts;
    }

    pub fn get_transactions(&self, limit: usize, page: usize, search: Option<&str>, status: Option<&str>) -> Vec<Transaction> {
        let state = self.state.read().unwrap();
        let mut result: Vec<Transaction> = state.transactions.clone();

        if let Some(status) = status {
            let status_upper = status.to_uppercase();
            result.retain(|t| format!("{:?}", t.status).to_uppercase() == status_upper);
        }

        if let Some(search) = search {
            let search_lower = search.to_lowercase();
            result.retain(|t| {
                t.description.to_lowercase().contains(&search_lower)
                    || t.author.to_lowercase().contains(&search_lower)
                    || t.blocks.iter().any(|b| {
                        if let Some(content) = &b.content {
                            content.to_lowercase().contains(&search_lower)
                        } else if let Some(file) = &b.file {
                            file.path.to_lowercase().contains(&search_lower)
                        } else {
                            false
                        }
                    })
            });
        }

        let start = (page.saturating_sub(1)) * limit;
        result[start..].iter().take(limit).cloned().collect()
    }

    pub fn get_prompts(&self) -> Vec<Prompt> {
        let state = self.state.read().unwrap();
        state.prompts.clone()
    }

    pub fn update_transaction_status(&self, id: &str, status: TransactionStatus) -> Option<Transaction> {
        let mut state = self.state.write().unwrap();
        if let Some(tx) = state.transactions.iter_mut().find(|t| t.id == id) {
            tx.status = status.clone();
            let tx_clone = tx.clone();
            drop(state);
            let _ = self.tx_sender.send(tx_clone.clone());
            return Some(tx_clone);
        }
        None
    }

    pub fn update_transaction_status_bulk(&self, ids: &[String], status: TransactionStatus) -> Vec<String> {
        let mut state = self.state.write().unwrap();
        let mut updated_ids = Vec::new();
        
        for tx in state.transactions.iter_mut() {
            if ids.contains(&tx.id) {
                tx.status = status.clone();
                updated_ids.push(tx.id.clone());
                let tx_clone = tx.clone();
                let _ = self.tx_sender.send(tx_clone);
            }
        }
        
        updated_ids
    }

    pub fn get_transaction(&self, id: &str) -> Option<Transaction> {
        let state = self.state.read().unwrap();
        state.transactions.iter().find(|t| t.id == id).cloned()
    }

    pub fn subscribe(&self) -> broadcast::Receiver<Transaction> {
        self.tx_sender.subscribe()
    }

    pub fn subscribe_to_file_events(&self) -> broadcast::Receiver<FileStatusEvent> {
        self.file_sender.subscribe()
    }

    pub fn update_file_apply_status(&self, tx_id: &str, file_path: &str, status: FileApplyStatus, error: Option<String>) -> Option<Transaction> {
        let mut state = self.state.write().unwrap();
        if let Some(tx) = state.transactions.iter_mut().find(|t| t.id == tx_id) {
            for block in &mut tx.blocks {
                if block.block_type == "file" {
                    if let Some(ref mut file) = block.file {
                        if file.path == file_path {
                            file.apply_status = status.clone();
                            file.error_message = error.clone();
                        }
                    }
                }
            }
            for file in &mut tx.files {
                if file.path == file_path {
                    file.apply_status = status.clone();
                    file.error_message = error.clone();
                }
            }
            let tx_clone = tx.clone();
            drop(state);
            let _ = self.tx_sender.send(tx_clone.clone());
            return Some(tx_clone);
        }
        None
    }

    pub fn get_failed_files(&self, tx_id: &str) -> Vec<String> {
        let state = self.state.read().unwrap();
        let mut failed_paths = Vec::new();
        if let Some(tx) = state.transactions.iter().find(|t| t.id == tx_id) {
            for block in &tx.blocks {
                if block.block_type == "file" {
                    if let Some(ref file) = block.file {
                        if file.apply_status == FileApplyStatus::Failed {
                            failed_paths.push(file.path.clone());
                        }
                    }
                }
            }
            for file in &tx.files {
                if file.apply_status == FileApplyStatus::Failed {
                    failed_paths.push(file.path.clone());
                }
            }
        }
        failed_paths
    }
}

use std::sync::LazyLock;

pub static STORE: LazyLock<Store> = LazyLock::new(|| {
    let store = Store::new();
    store.load_data();
    store
});

pub fn start_simulation(id: String, scenario: Option<SimulationScenario>) {
    let tx_sender = STORE.tx_sender.clone();
    let file_sender = STORE.file_sender.clone();
    let state = STORE.state.clone();
    
    {
        let state_guard = state.read().unwrap();
        if state_guard.active_simulations.contains(&id) {
            return;
        }
        let tx = state_guard.transactions.iter().find(|t| t.id == id);
        if tx.is_none() || tx.unwrap().status != TransactionStatus::Pending {
            return;
        }
    }

    {
        let mut state_guard = state.write().unwrap();
        state_guard.active_simulations.insert(id.clone());
    }

    {
        let mut state_guard = state.write().unwrap();
        if let Some(tx) = state_guard.transactions.iter_mut().find(|t| t.id == id) {
            tx.status = TransactionStatus::Applying;
            let tx_clone = tx.clone();
            let _ = tx_sender.send(tx_clone);
        }
    }

    let file_paths: Vec<String> = {
        let state_guard = state.read().unwrap();
        if let Some(tx) = state_guard.transactions.iter().find(|t| t.id == id) {
            let mut paths = Vec::new();
            for block in &tx.blocks {
                if block.block_type == "file" {
                    if let Some(ref file) = block.file {
                        paths.push(file.path.clone());
                    }
                }
            }
            for file in &tx.files {
                paths.push(file.path.clone());
            }
            paths
        } else {
            Vec::new()
        }
    };

    tokio::spawn(async move {
        let duration = match scenario.as_ref() {
            Some(SimulationScenario::FastSuccess) => 500.0 + rand_float() * 500.0,
            Some(SimulationScenario::LongRunning) => 8000.0 + rand_float() * 4000.0,
            _ => 2000.0 + rand_float() * 4000.0,
        };

        let file_count = file_paths.len();
        let file_delay = if file_count > 0 { duration / (file_count as f64 * 2.0) } else { 0.0 };
        
        for (idx, file_path) in file_paths.iter().enumerate() {
            tokio::time::sleep(tokio::time::Duration::from_millis(file_delay as u64)).await;
            
            let file_status = match scenario.as_ref() {
                Some(SimulationScenario::SimulatedFailure) => FileApplyStatus::Failed,
                Some(SimulationScenario::PartialFailure) => {
                    if idx % 3 == 2 {
                        FileApplyStatus::Failed
                    } else {
                        FileApplyStatus::Applied
                    }
                }
                _ => FileApplyStatus::Applied,
            };

            let error_msg = if file_status == FileApplyStatus::Failed {
                Some("Patch conflict: file content mismatch".to_string())
            } else {
                None
            };

            {
                let mut state_guard = state.write().unwrap();
                if let Some(tx) = state_guard.transactions.iter_mut().find(|t| t.id == id) {
                    for block in &mut tx.blocks {
                        if block.block_type == "file" {
                            if let Some(ref mut file) = block.file {
                                if &file.path == file_path {
                                    file.apply_status = file_status.clone();
                                    file.error_message = error_msg.clone();
                                }
                            }
                        }
                    }
                    for file in &mut tx.files {
                        if &file.path == file_path {
                            file.apply_status = file_status.clone();
                            file.error_message = error_msg.clone();
                        }
                    }
                }
            }

            let _ = file_sender.send(FileStatusEvent {
                transaction_id: id.clone(),
                file_path: file_path.clone(),
                apply_status: file_status,
                error_message: error_msg,
            });
        }

        tokio::time::sleep(tokio::time::Duration::from_millis(file_delay as u64)).await;

        let final_status = match scenario.as_ref() {
            Some(SimulationScenario::SimulatedFailure) => TransactionStatus::Failed,
            Some(SimulationScenario::PartialFailure) => {
                let applied_count = {
                    let state_guard = state.read().unwrap();
                    if let Some(tx) = state_guard.transactions.iter().find(|t| t.id == id) {
                        tx.blocks.iter().filter(|b| {
                            b.block_type == "file" && 
                            b.file.as_ref().map_or(false, |f| f.apply_status == FileApplyStatus::Applied)
                        }).count() + tx.files.iter().filter(|f| f.apply_status == FileApplyStatus::Applied).count()
                    } else {
                        0
                    }
                };
                let failed_count = {
                    let state_guard = state.read().unwrap();
                    if let Some(tx) = state_guard.transactions.iter().find(|t| t.id == id) {
                        tx.blocks.iter().filter(|b| {
                            b.block_type == "file" && 
                            b.file.as_ref().map_or(false, |f| f.apply_status == FileApplyStatus::Failed)
                        }).count() + tx.files.iter().filter(|f| f.apply_status == FileApplyStatus::Failed).count()
                    } else {
                        0
                    }
                };
                
                if failed_count == 0 {
                    TransactionStatus::Applied
                } else if applied_count == 0 {
                    TransactionStatus::Failed
                } else {
                    TransactionStatus::PartiallyApplied
                }
            }
            _ => TransactionStatus::Applied,
        };

        {
            let mut state_guard = state.write().unwrap();
            if let Some(tx) = state_guard.transactions.iter_mut().find(|t| t.id == id) {
                tx.status = final_status.clone();
                let tx_clone = tx.clone();
                let _ = tx_sender.send(tx_clone);
            }
            state_guard.active_simulations.remove(&id);
        }
    });
}

pub fn reapply_file(id: String, file_path: String) {
    let file_sender = STORE.file_sender.clone();
    let state = STORE.state.clone();

    {
        let mut state_guard = state.write().unwrap();
        if let Some(tx) = state_guard.transactions.iter_mut().find(|t| t.id == id) {
            for block in &mut tx.blocks {
                if block.block_type == "file" {
                    if let Some(ref mut file) = block.file {
                        if file.path == file_path {
                            file.apply_status = FileApplyStatus::Applying;
                            file.error_message = None;
                        }
                    }
                }
            }
            for file in &mut tx.files {
                if file.path == file_path {
                    file.apply_status = FileApplyStatus::Applying;
                    file.error_message = None;
                }
            }
        }
    }

    let _ = file_sender.send(FileStatusEvent {
        transaction_id: id.clone(),
        file_path: file_path.clone(),
        apply_status: FileApplyStatus::Applying,
        error_message: None,
    });

    tokio::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_millis(800 + (rand_float() as u64 % 400))).await;
        
        let success = rand_float() > 300.0;
        
        let (status, error) = if success {
            (FileApplyStatus::Applied, None)
        } else {
            (FileApplyStatus::Failed, Some("Retry failed: unresolved conflict".to_string()))
        };

        {
            let mut state_guard = state.write().unwrap();
            if let Some(tx) = state_guard.transactions.iter_mut().find(|t| t.id == id) {
                for block in &mut tx.blocks {
                    if block.block_type == "file" {
                        if let Some(ref mut file) = block.file {
                            if file.path == file_path {
                                file.apply_status = status.clone();
                                file.error_message = error.clone();
                            }
                        }
                    }
                }
                for file in &mut tx.files {
                    if file.path == file_path {
                        file.apply_status = status.clone();
                        file.error_message = error.clone();
                    }
                }
            }
        }

        let _ = file_sender.send(FileStatusEvent {
            transaction_id: id,
            file_path,
            apply_status: status,
            error_message: error,
        });
    });
}

pub fn reapply_all_failed(id: String) {
    let failed_files = STORE.get_failed_files(&id);
    for file_path in failed_files {
        reapply_file(id.clone(), file_path);
    }
}

fn rand_float() -> f64 {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    rng.gen::<f64>() * 1000.0
}
