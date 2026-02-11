# Relaycode

**A zero-friction, AI-native patch engine for modern development workflows.**

Relaycode is a stateful Terminal User Interface (TUI) application that bridges the gap between AI-generated code changes and production commits. It transforms chaotic AI patch application into a structured, reviewable, and reversible transaction system.

## Table of Contents

- [Core Philosophy](#core-philosophy)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Workflow & State Machines](#workflow--state-machines)
- [Screen Reference](#screen-reference)
- [Configuration](#configuration)
- [Keyboard Navigation](#keyboard-navigation)
- [Integration Points](#integration-points)

---

## Core Philosophy

### Transaction-Based Code Management

Relaycode treats every code change as a **transaction**—a discrete, trackable unit of work that moves through defined states:

1. **PENDING** - Patch detected, awaiting review
2. **APPLIED** - Changes approved and written to filesystem
3. **COMMITTED** - Changes committed to git history
4. **REVERTED** - Changes undone (creates inverse transaction)
5. **FAILED** - Patch application failed, awaiting repair

### Zero-Friction AI Integration

Unlike traditional AI coding assistants that overwrite files directly, Relaycode:
- **Intercepts** AI-generated patches from clipboard
- **Stages** them in a reviewable state without touching git
- **Validates** changes with post-commands (tests, linters)
- **Preserves** complete audit trails of AI reasoning and decisions

### Stateful TUI Architecture

Built with React + Ink, Relaycode maintains complex UI state:
- **Persistent Context**: Header shows git branch, project ID, and system status
- **Progressive Disclosure**: Expandable sections reveal detail without clutter
- **Context-Aware Actions**: Footer shortcuts change based on current state
- **Non-Blocking Operations**: Background processing with real-time feedback

---

## Key Features

### 1. Intelligent Clipboard Monitoring (`relay watch`)
- **Live Detection**: Automatically detects patch formats in clipboard
- **Smart Parsing**: Supports unified diff, git patches, and AI-generated formats
- **Global Pause/Resume**: System-wide clipboard monitoring control (`P`)
- **Event Stream**: Reverse-chronological transaction history with real-time updates

### 2. Granular Review System
- **Per-File Approval**: Approve/reject individual files within a transaction
- **Visual Diff Rendering**: Syntax-highlighted diffs with hunk navigation (`J`/`K`)
- **AI Reasoning Display**: View step-by-step AI logic (`R` key)
- **Strategy Selection**: Choose patch application strategies (replace, merge, etc.)

### 3. Multi-State Repair Workflows
When patches fail (context mismatches, line offsets):
- **Manual Override**: Edit patch context directly
- **AI Auto-Repair**: Automated context adjustment with progress visualization
- **Bulk Repair**: Handle multiple failed files simultaneously
- **External Handoff**: Generate detailed prompts for external AI agents

### 4. Post-Command Validation
- **Hook Integration**: Automatic test/lint execution after patch application
- **Output Capture**: View script results inline with error navigation
- **Conditional Logic**: Block commits on failed validation or allow override
- **Performance Metrics**: Track execution time for each validation step

### 5. Advanced Copy Mode
Context-aware clipboard extraction:
- **Metadata Extraction**: Copy UUIDs, git messages, AI prompts
- **Diff Aggregation**: Copy specific files or entire transaction diffs
- **Context Sharing**: Export context files for external AI agents
- **Multi-Select**: Bulk copy across multiple transactions

### 6. Transaction History & Forensics
Complete audit trail with drill-down capabilities:
- **Hierarchical Browsing**: 3-level expansion (Transaction → Section → Content)
- **In-Place Diff Preview**: View code changes without leaving the list
- **Advanced Filtering**: Query by file path, status, date, or content (`F`)
- **Bulk Actions**: Revert, delete, or mark multiple transactions
- **Immutable Records**: Original AI prompts and reasoning preserved forever

### 7. Git-Native Workflow
- **Commit Aggregation**: Bundle multiple transactions into single git commits
- **Message Generation**: AI-generated commit messages with manual override
- **Pre-Commit Review**: Final "airlock" screen before `git commit`
- **Revert Safety**: Creates new transactions for rollbacks, preserving history

### 8. Multi-Provider AI Support
- **Provider Agnostic**: OpenRouter, Anthropic, OpenAI, Google AI, etc.
- **Model Selection**: Per-transaction model choice with cost awareness
- **Secure Storage**: Encrypted local API key management
- **Failover Logic**: Automatic retry with exponential backoff

---

## System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    React + Ink (TUI)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Screens    │  │   Stores     │  │   Components     │   │
│  │  (16 types) │  │  (Zustand)   │  │ (Ink + Custom)   │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
┌─────────▼────────────────▼───────────────────▼─────────────┐
│                    Service Layer                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │
│  │   Patch      │ │   Git        │ │   AI Providers   │   │
│  │  Processor   │ │  Integration │ │   (Multi-model)  │   │
│  └──────────────┘ └──────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### State Management Architecture

**Store Segregation:**
- `dashboard.store.ts` - Watcher state, event stream, selection
- `review.store.ts` - Transaction review states, file approvals, body views
- `transaction.store.ts` - Transaction data, history, metadata
- `init.store.ts` - Bootstrap phase machine, user choices
- `settings.store.ts` - AI provider configuration, API keys

### Transaction Lifecycle

```
┌──────────┐    Detect     ┌──────────┐    Review     ┌──────────┐
│ Clipboard│──────────────▶│  PENDING │──────────────▶│  APPLIED │
└──────────┘               └──────────┘               └────┬─────┘
                                                           │
                              ┌────────────────────────────┘
                              │ Post-Commands
                              ▼
┌──────────┐    Commit    ┌──────────┐    Revert    ┌──────────┐
│   Git    │◀─────────────│ COMMITTED│◀─────────────│ REVERTED │
└──────────┘               └──────────┘               └──────────┘
```

---

## Workflow & State Machines

### 1. Standard Application Flow

```mermaid
[Splash Screen] → [Initialization] → [Dashboard] → [Review] → [Commit]
```

**Phase 1: Bootstrap** (`relay init`)
- **Analyze**: Detect project structure, git status, existing config
- **Configure**: Create `relay.config.json`, initialize `.relay/` state directory
- **Interactive Choice**: Git repository initialization prompts
- **Finalize**: Generate system prompts, display next actions

**Phase 2: Monitoring** (`relay watch`)
- **Active Listening**: Clipboard watcher monitors for patch formats
- **Transaction Creation**: New transactions appear in PENDING state
- **Real-time Updates**: Event stream with animated entry indicators
- **Global Controls**: Pause/Resume affects all screens

**Phase 3: Review** (Auto-triggered on detection)
The Review Screen implements a **13-state finite state machine**:

| State | Description | Key Actions |
|-------|-------------|-------------|
| **Success** | All files applied, scripts passed | Approve All (`A`), Commit (`C`) |
| **Partial Failure** | Some files failed to apply | Try Repair (`T`), Bulk Repair (`Shift+T`) |
| **Script Issues** | Tests/lint failed | View Output (`Enter`), Navigate Errors (`J`/`K`) |
| **Diff View** | Examining code changes | Hunk Nav (`J`/`K`), Expand (`X`) |
| **Reasoning View** | Reading AI logic | Scroll (`↑↓`), Copy (`C`) |
| **Copy Mode** | Extracting data | Multi-select (`Space`), Aggregate Copy |
| **Bulk Repair Modal** | Multi-file fix strategy | Handoff, Auto-repair, Change Strategy |
| **Handoff Confirm** | External AI delegation | Confirm (`Enter`), Copy Prompt |

**Phase 4: Commit** (`relay git commit` or `C` from Dashboard)
- **Summary View**: Lists all included transactions
- **Message Preview**: Shows generated commit message
- **Final Gate**: Explicit confirmation before git operations
- **Atomic Commit**: All or nothing transaction bundling

### 2. AI Processing Flow (Auto-Repair)

When patch application fails:

```
[Review Screen] → [AI Processing Screen] → [Context Analysis] → [API Request]
                                                         ↓
[Patch Generation] ← [Response Processing] ← [AI Interaction]
        ↓
[Validation] → [Success: Return to Review] / [Failure: Error Display]
```

**Visual Feedback:**
- Real-time step indicators with spinners (`(●)`)
- Sub-step hierarchies for file-level operations
- Timing information (elapsed: 5.1s)
- Error context with retry logic

### 3. Failure Recovery Hierarchy

1. **Single File Repair** (`T` on failed file)
   - Change strategy (context vs. line-based)
   - Manual context edit
   - AI-guided repair

2. **Bulk Repair** (`Shift+T` with multiple failures)
   - Copy bulk re-apply prompt (for single-shot AI)
   - Bulk strategy change
   - Auto-repair with AI (parallel processing)

3. **External Handoff**
   - Generate comprehensive prompt with context
   - Copy to clipboard for external agent (Claude, GPT-4, etc.)
   - Mark transaction as "Handoff" (terminal state)

---

## Screen Reference

### Dashboard Screen (`relay watch`)
The operational HUD with **5 distinct states**:
- **Active & Listening**: Default operational state
- **Paused**: Clipboard monitoring suspended
- **Confirmation Overlay**: Modal for destructive actions (Approve All)
- **In-Progress**: Animated spinners during batch operations
- **Expanded Item**: Drill-down into transaction details

**Key Footer Actions**: `(A)pprove All`, `(C)ommit`, `(P)ause`, `(L)og`, `(Q)uit`

### Review Screen (13 States)
Complex multi-state interface with dynamic footers:

**Primary Views:**
- **Navigator**: File list with status indicators (`[✓]`, `[✗]`, `[!]`)
- **Diff View**: Syntax-highlighted changes with hunk navigation (`J`/`K`)
- **Reasoning View**: AI thought process with scroll support
- **Script Output**: Test/lint results with error navigation

**Modal Overlays:**
- **Copy Mode**: Checkbox selection for data extraction
- **Bulk Repair**: Strategy selection for multiple failures
- **Handoff Confirm**: Final check before external delegation

### Transaction History Screen (`relay log`)
Hierarchical database explorer:

**3-Level Drill Down:**
1. **Transaction List** - `▸` collapsed, `▾` expanded
2. **Section Preview** - Prompt, Reasoning, Files list
3. **Content Preview** - In-place diff/reasoning text

**Advanced Features:**
- **Filtering**: Real-time search with syntax (`logger.ts status:committed`)
- **Multi-Select**: Spacebar selection for bulk operations
- **Copy Mode**: Multi-transaction data aggregation
- **Bulk Actions**: Revert, delete, or modify multiple transactions

### AI Processing Screen
Real-time monitoring for automated operations:

**Visual Indicators:**
- `( )` Pending → `(●)` Active → `[✓]` Completed → `[!]` Failed
- Hierarchical sub-steps with indentation
- Elapsed time counters
- Progress-aware footer (Cancel, Skip Script)

### Git Commit Screen
Final "airlock" before repository modification:

- **Contextual Summary**: Lists bundled transactions
- **Message Preview**: Final commit message display
- **Safety Gate**: Binary choice (Confirm/Cancel)
- **Simplicity**: No deep inspection, only final confirmation

### Settings Screen
AI provider configuration with **3-step setup**:
1. **Provider Selection**: Searchable dropdown (OpenRouter, Anthropic, etc.)
2. **API Key Input**: Masked secure input with validation
3. **Model Selection**: Provider-filtered model list

**Features**: Real-time validation, secure local storage, multi-profile support

### Supporting Screens
- **Copy Mode**: Context-aware data extraction overlay (available in Review, History, Details)
- **Debug Log**: System event monitoring with level filtering (ERROR, WARN, INFO, DEBUG)
- **Notification**: Non-blocking alerts with auto-dismissal (Success, Error, Warning, Info)
- **Initialization**: 5-phase bootstrap (Analyze → Configure → Interactive → Finalize)
- **Splash Screen**: Animated startup with update checking and community links

---

## Configuration

### File Structure
```
project-root/
├── relay.config.json          # Main configuration
├── .relay/                    # State directory (gitignored by default)
│   ├── transactions/          # Transaction YAML files
│   ├── prompts/
│   │   └── system-prompt.md   # AI system instructions
│   └── state.json             # Application state
└── .gitignore                 # Relaycode patterns added automatically
```

### Configuration Options (`relay.config.json`)
```json
{
  "projectId": "my-project",
  "aiProvider": {
    "name": "openrouter",
    "apiKey": "sk-or-v1-...",
    "defaultModel": "anthropic/claude-3.5-sonnet"
  },
  "postCommands": [
    "npm run test",
    "npm run lint"
  ],
  "git": {
    "autoCommit": false,
    "commitMessageTemplate": "conventional"
  },
  "ui": {
    "theme": "default",
    "confirmDestructive": true
  }
}
```

### Environment Variables
- `RELAYCODE_API_KEY` - Override provider API key
- `RELAYCODE_CONFIG_PATH` - Custom config location
- `RELAYCODE_DEBUG` - Enable debug logging

---

## Keyboard Navigation

### Universal Shortcuts
| Key | Action |
|-----|--------|
| `?` | Global help overlay |
| `Q` / `Ctrl+C` | Quit/Cancel |
| `Esc` | Back/Close modal |
| `↑` `↓` | Navigate items |
| `→` / `Enter` | Expand/Select |
| `←` | Collapse/Back |

### Context-Aware Shortcuts
Shortcuts change based on current screen state:

**Dashboard:**
- `A` - Approve All (with confirmation)
- `C` - Commit All
- `P` - Pause/Resume
- `L` - View Log

**Review Screen:**
- `Space` - Toggle file approval
- `D` - View Diff
- `R` - View Reasoning
- `T` - Try Repair (failed files)
- `Shift+T` - Bulk Repair
- `C` - Copy Mode
- `J`/`K` - Next/Previous hunk or error

**History Screen:**
- `F` - Filter mode
- `Space` - Select for bulk
- `B` - Bulk Actions
- `O` - Open YAML

**Copy Mode (Global):**
- `U` - UUID
- `M` - Git Message
- `P` - Prompt
- `R` - Reasoning
- `F` - Diff for selected file
- `A` - All Diffs

---

## Integration Points

### AI Provider Integration
- **OpenRouter**: Unified API for multiple models
- **Anthropic**: Claude 3.5 Sonnet with extended thinking
- **OpenAI**: GPT-4, GPT-4o with tool use
- **Local Models**: Ollama, LM Studio support

**Features:**
- Streaming responses for real-time processing
- Cost tracking per transaction
- Model fallback chains
- Rate limit handling with exponential backoff

### Git Integration
- **Native Git**: Direct `git` CLI execution
- **State Synchronization**: Transaction status synced with git state
- **Reversible Operations**: All changes tracked as revertible transactions
- **Branch Awareness**: Dashboard shows current branch in header

### Editor Integration
- **YAML Editing**: `O` key opens transaction YAML in `$EDITOR`
- **Diff Viewing**: Integration with external diff tools (configurable)
- **File Preview**: Open specific files from review screen

### Clipboard System
- **Multi-format**: Supports HTML, RTF, plain text
- **Paste Detection**: Monitors system clipboard continuously
- **Format Validation**: Validates patch structure before processing
- **Copy Aggregation**: Multi-item clipboard formatting

---

## Development

### Prerequisites
- Node.js 18+
- Git 2.30+
- Terminal with Unicode and 256-color support

### Installation
```bash
npm install -g relaycode
# or
yarn global add relaycode
# or
bun install -g relaycode
```

### Quick Start
```bash
# Initialize project
cd my-project
relay init

# Start monitoring
relay watch

# Process a patch from clipboard
# (Paste patch, UI appears automatically)

# View history
relay log

# Commit approved changes
relay git commit
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

Built by Arman and contributors · [https://relay.noca.pro ](https://relay.noca.pro )

---

**Relaycode**: Transforming AI-generated chaos into structured, reviewable, and reversible development workflows.