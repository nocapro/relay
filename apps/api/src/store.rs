use crate::models::{SimulationScenario, Transaction, TransactionStatus, Prompt};
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
}

impl Default for Store {
    fn default() -> Self {
        let (tx_sender, _) = broadcast::channel(100);
        Self {
            state: Arc::new(RwLock::new(AppState::default())),
            tx_sender,
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
}

use std::sync::LazyLock;

pub static STORE: LazyLock<Store> = LazyLock::new(|| {
    let store = Store::new();
    store.load_data();
    store
});

pub fn start_simulation(id: String, scenario: Option<SimulationScenario>) {
    let tx_sender = STORE.tx_sender.clone();
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

    tokio::spawn(async move {
        let duration = match scenario.as_ref() {
            Some(SimulationScenario::FastSuccess) => 500.0 + rand_float() * 500.0,
            Some(SimulationScenario::LongRunning) => 8000.0 + rand_float() * 4000.0,
            _ => 2000.0 + rand_float() * 4000.0,
        };

        tokio::time::sleep(tokio::time::Duration::from_millis(duration as u64)).await;

        let final_status = match scenario.as_ref() {
            Some(SimulationScenario::SimulatedFailure) => TransactionStatus::Failed,
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

fn rand_float() -> f64 {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    rng.gen::<f64>() * 1000.0
}
