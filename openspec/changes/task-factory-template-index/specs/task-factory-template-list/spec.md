## ADDED Requirements

### Requirement: Task template draft tab SHALL render factory template list
The system SHALL render a task factory template list when the user opens the `taskTemplateDraft` tab in Task index.

#### Scenario: User opens task template draft tab
- **WHEN** user switches from `taskList` tab to `taskTemplateDraft` tab
- **THEN** the system displays the task factory template list view instead of placeholder content

### Requirement: Task template draft tab SHALL fetch data from S_TaskFactoryTemplete.index
The system SHALL request template list data through `S_TaskFactoryTemplete.index` as the canonical data source for `taskTemplateDraft`.

#### Scenario: List view mounts successfully
- **WHEN** `taskTemplateDraft` list view is mounted
- **THEN** the system calls `S_TaskFactoryTemplete.index` and binds the response to the list

### Requirement: Task template draft tab SHALL expose loading, empty, and error states
The system MUST provide observable loading, empty, and error UI states for the `taskTemplateDraft` list view.

#### Scenario: API request is in-flight
- **WHEN** `S_TaskFactoryTemplete.index` request has started and not completed
- **THEN** the system displays loading state in the list area

#### Scenario: API request returns empty data
- **WHEN** `S_TaskFactoryTemplete.index` returns no template items
- **THEN** the system displays an empty state message in the list area

#### Scenario: API request fails
- **WHEN** `S_TaskFactoryTemplete.index` request fails
- **THEN** the system displays an error state in the list area without crashing or leaving the page

### Requirement: Header right action SHALL remain tab-specific in Task index
The system SHALL keep header-right behavior scoped by first-level tab selection.

#### Scenario: User is on task list tab
- **WHEN** active tab is `taskList`
- **THEN** header-right action remains "create task"

#### Scenario: User is on task template draft tab
- **WHEN** active tab is `taskTemplateDraft`
- **THEN** header-right action opens the task template modal flow

#### Scenario: User is on common template tab
- **WHEN** active tab is `taskCommonTemplate`
- **THEN** header-right action is hidden or non-interactive

### Requirement: Existing task list behavior SHALL remain unchanged
The system SHALL preserve existing task list rendering and navigation behavior while adding task template draft list support.

#### Scenario: User navigates back to task list tab after visiting template tab
- **WHEN** user switches from `taskTemplateDraft` back to `taskList`
- **THEN** task list content and "create task" header-right behavior work the same as before this change
