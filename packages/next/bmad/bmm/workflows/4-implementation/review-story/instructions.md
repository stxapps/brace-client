# Senior Developer Review - Workflow Instructions

````xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>This workflow performs a Senior Developer Review on a story flagged Ready for Review, appends structured review notes, and can update the story status based on the outcome.</critical>
<critical>Default execution mode: #yolo (non-interactive). Only ask if {{non_interactive}} == false. If auto-discovery of the target story fails, HALT with a clear message to provide 'story_path' or 'story_dir'.</critical>
<critical>Only modify the story file in these areas: Status (optional per settings), Dev Agent Record (Completion Notes), File List (if corrections are needed), Change Log, and the appended "Senior Developer Review (AI)" section at the end of the document.</critical>
<critical>Execute ALL steps in exact order; do NOT skip steps</critical>

<workflow>

  <step n="1" goal="Check and load workflow status file">
    <action>Search {output_folder}/ for files matching pattern: bmm-workflow-status.md</action>
    <action>Find the most recent file (by date in filename: bmm-workflow-status.md)</action>

    <check if="exists">
      <action>Load the status file</action>
      <action>Set status_file_found = true</action>
      <action>Store status_file_path for later updates</action>
    </check>

    <check if="not exists">
      <ask>**No workflow status file found.**

This workflow performs Senior Developer Review on a story (optional Phase 4 workflow).

Options:
1. Run workflow-status first to create the status file (recommended for progress tracking)
2. Continue in standalone mode (no progress tracking)
3. Exit

What would you like to do?</ask>
      <action>If user chooses option 1 → HALT with message: "Please run workflow-status first, then return to review-story"</action>
      <action>If user chooses option 2 → Set standalone_mode = true and continue</action>
      <action>If user chooses option 3 → HALT</action>
    </check>
  </step>

  <step n="2" goal="Locate story and verify review status">
    <action>If {{story_path}} was provided → use it. Else auto-discover from {{story_dir}} by listing files matching pattern: "story-*.md" (recursive), sort by last modified (newest first), present top {{story_selection_limit}}.</action>
    <ask optional="true" if="{{non_interactive}} == false">Select a story (1-{{story_selection_limit}}) or enter a path:</ask>
    <action>Resolve {{story_path}} and read the COMPLETE file.</action>
    <action>Extract {{epic_num}} and {{story_num}} from filename (e.g., story-2.3.*.md) and story metadata if available.</action>
    <action>Parse sections: Status, Story, Acceptance Criteria, Tasks/Subtasks (and completion states), Dev Notes, Dev Agent Record (Context Reference, Completion Notes, File List), Change Log.</action>
    <action if="Status is not one of {{allow_status_values}}">HALT with message: "Story status must be 'Ready for Review' to proceed" (accept 'Review' as equivalent).</action>
    <action if="story cannot be read">HALT.</action>
  </step>

  <step n="2" goal="Resolve context and specification inputs">
    <action>Locate Story Context: Under Dev Agent Record → Context Reference, read referenced path(s). If missing and {{auto_discover_context}}: search {{output_folder}} for files named "story-context-{{epic_num}}.{{story_num}}*.xml"; pick the most recent.</action>
    <action if="no context found">Continue but record a WARNING in review notes: "No Story Context found".</action>
    <action>Locate Epic Tech Spec: If {{auto_discover_tech_spec}}, search {{tech_spec_search_dir}} with glob {{tech_spec_glob_template}} (resolve {{epic_num}}); else use provided input.</action>
    <action if="no tech spec found">Continue but record a WARNING in review notes: "No Tech Spec found for epic {{epic_num}}".</action>
    <action>Load architecture/standards docs: For each file name in {{arch_docs_file_names}} within {{arch_docs_search_dirs}}, read if exists. Collect any testing, coding standards, security, and architectural patterns.</action>
  </step>

  <step n="3" goal="Detect tech stack and establish best-practice reference set">
    <action>Detect primary ecosystem(s) by scanning for manifests (e.g., package.json, pyproject.toml, go.mod, Dockerfile). Record key frameworks (e.g., Node/Express, React/Vue, Python/FastAPI, etc.).</action>
    <action>If {{enable_mcp_doc_search}} and MCP servers are available → Use them to search for up-to-date best practices, security advisories, and framework-specific guidance relevant to the detected stack and the story's domain.</action>
    <action>If MCP is unavailable or insufficient and {{enable_web_fallback}} → Perform targeted web searches and fetch authoritative references (framework docs, OWASP, language style guides). Prefer official documentation and widely-recognized standards.</action>
    <action>Synthesize a concise "Best-Practices and References" note capturing any updates or considerations that should influence the review (cite links and versions if available).</action>
  </step>

  <step n="4" goal="Assess implementation against acceptance criteria and specs">
    <action>From the story, read Acceptance Criteria and Tasks/Subtasks with their completion state.</action>
    <action>From Dev Agent Record → File List, compile list of changed/added files. If File List is missing or clearly incomplete, search repo for recent changes relevant to the story scope (heuristics: filenames matching components/services/routes/tests inferred from ACs/tasks).</action>
    <action>Cross-check epic tech-spec requirements and architecture constraints against the implementation intent in files.</action>
    <action>For each acceptance criterion, verify there is evidence of implementation and corresponding tests (unit/integration/E2E as applicable). Note any gaps explicitly.</action>
    <action if="critical architecture constraints are violated (e.g., layering, dependency rules)">flag as High Severity finding.</action>
  </step>

  <step n="5" goal="Perform code quality and risk review">
    <action>For each changed file, skim for common issues appropriate to the stack: error handling, input validation, logging, dependency injection, thread-safety/async correctness, resource cleanup, performance anti-patterns.</action>
    <action>Perform security review: injection risks, authZ/authN handling, secret management, unsafe defaults, un-validated redirects, CORS misconfigured, dependency vulnerabilities (based on manifests).</action>
    <action>Check tests quality: assertions are meaningful, edge cases covered, deterministic behavior, proper fixtures, no flakiness patterns.</action>
    <action>Capture concrete, actionable suggestions with severity (High/Med/Low) and rationale. When possible, suggest specific code-level changes (filenames + line ranges) without rewriting large sections.</action>
  </step>

  <step n="6" goal="Decide review outcome and prepare notes">
    <action>Determine outcome: Approve, Changes Requested, or Blocked.</action>
    <action>Prepare a structured review report with sections: Summary, Outcome, Key Findings (by severity), Acceptance Criteria Coverage, Test Coverage and Gaps, Architectural Alignment, Security Notes, Best-Practices and References, Action Items.</action>
    <action>For Action Items, use imperative phrasing and map each to related ACs or files. Include suggested owners if clear.</action>
  </step>

  <step n="7" goal="Append review to story and update metadata">
    <action>Open {{story_path}} and append a new section at the end titled exactly: "Senior Developer Review (AI)".</action>
    <action>Insert subsections:
      - Reviewer: {{user_name}}
      - Date: {{date}}
      - Outcome: (Approve | Changes Requested | Blocked)
      - Summary
      - Key Findings
      - Acceptance Criteria Coverage
      - Test Coverage and Gaps
      - Architectural Alignment
      - Security Notes
      - Best-Practices and References (with links)
      - Action Items
    </action>
    <action>Add a Change Log entry with date, version bump if applicable, and description: "Senior Developer Review notes appended".</action>
    <action>If {{update_status_on_result}} is true: update Status to {{status_on_approve}} when approved; to {{status_on_changes_requested}} when changes requested; otherwise leave unchanged.</action>
    <action>Save the story file.</action>
  </step>

  <step n="8" goal="Persist action items to tasks/backlog/epic">
    <action>Normalize Action Items into a structured list: description, severity (High/Med/Low), type (Bug/TechDebt/Enhancement), suggested owner (if known), related AC/file references.</action>
    <action if="{{persist_action_items}} == true and 'story_tasks' in {{persist_targets}}">
      Append under the story's "Tasks / Subtasks" a new subsection titled "Review Follow-ups (AI)", adding each item as an unchecked checkbox in imperative form, prefixed with "[AI-Review]" and severity. Example: "- [ ] [AI-Review][High] Add input validation on server route /api/x (AC #2)".
    </action>
    <ask optional="true" if="{{non_interactive}} == false">Confirm adding follow-ups into story Tasks/Subtasks. Proceed?</ask>
    <action if="{{persist_action_items}} == true and 'backlog_file' in {{persist_targets}}">
      If {{backlog_file}} does not exist, copy {installed_path}/backlog_template.md to {{backlog_file}} location.
      Append a row per action item with Date={{date}}, Story={{epic_num}}.{{story_num}}, Epic={{epic_num}}, Type, Severity, Owner (or "TBD"), Status="Open", Notes with short context and file refs.
    </action>
    <action if="{{persist_action_items}} == true and ('epic_followups' in {{persist_targets}} or {{update_epic_followups}} == true)">
      If an epic Tech Spec was found: open it and create (if missing) a section titled "{{epic_followups_section_title}}". Append a bullet list of action items scoped to this epic with references back to Story {{epic_num}}.{{story_num}}.
    </action>
    <action>Save modified files.</action>
    <action>Optionally invoke tests or linters to verify quick fixes if any were applied as part of review (requires user approval for any dependency changes).</action>
  </step>

  <step n="9" goal="Validation and completion">
    <invoke-task>Run validation checklist at {installed_path}/checklist.md using {project-root}/bmad/core/tasks/validate-workflow.xml</invoke-task>
    <action>Report workflow completion.</action>
  </step>  <step n="1" goal="Locate story and verify review status">
    <action>If {{story_path}} was provided → use it. Else auto-discover from {{story_dir}} by listing files matching pattern: "story-*.md" (recursive), sort by last modified (newest first), present top {{story_selection_limit}}.</action>
    <ask optional="true" if="{{non_interactive}} == false">Select a story (1-{{story_selection_limit}}) or enter a path:</ask>
    <action>Resolve {{story_path}} and read the COMPLETE file.</action>
    <action>Extract {{epic_num}} and {{story_num}} from filename (e.g., story-2.3.*.md) and story metadata if available.</action>
    <action>Parse sections: Status, Story, Acceptance Criteria, Tasks/Subtasks (and completion states), Dev Notes, Dev Agent Record (Context Reference, Completion Notes, File List), Change Log.</action>
    <action if="Status is not one of {{allow_status_values}}">HALT with message: "Story status must be 'Ready for Review' to proceed" (accept 'Review' as equivalent).</action>
    <action if="story cannot be read">HALT.</action>
  </step>

  <step n="2" goal="Resolve context and specification inputs">
    <action>Locate Story Context: Under Dev Agent Record → Context Reference, read referenced path(s). If missing and {{auto_discover_context}}: search {{output_folder}} for files named "story-context-{{epic_num}}.{{story_num}}*.xml"; pick the most recent.</action>
    <action if="no context found">Continue but record a WARNING in review notes: "No Story Context found".</action>
    <action>Locate Epic Tech Spec: If {{auto_discover_tech_spec}}, search {{tech_spec_search_dir}} with glob {{tech_spec_glob_template}} (resolve {{epic_num}}); else use provided input.</action>
    <action if="no tech spec found">Continue but record a WARNING in review notes: "No Tech Spec found for epic {{epic_num}}".</action>
    <action>Load architecture/standards docs: For each file name in {{arch_docs_file_names}} within {{arch_docs_search_dirs}}, read if exists. Collect any testing, coding standards, security, and architectural patterns.</action>
  </step>

  <step n="3" goal="Detect tech stack and establish best-practice reference set">
    <action>Detect primary ecosystem(s) by scanning for manifests (e.g., package.json, pyproject.toml, go.mod, Dockerfile). Record key frameworks (e.g., Node/Express, React/Vue, Python/FastAPI, etc.).</action>
    <action>If {{enable_mcp_doc_search}} and MCP servers are available → Use them to search for up-to-date best practices, security advisories, and framework-specific guidance relevant to the detected stack and the story's domain.</action>
    <action>If MCP is unavailable or insufficient and {{enable_web_fallback}} → Perform targeted web searches and fetch authoritative references (framework docs, OWASP, language style guides). Prefer official documentation and widely-recognized standards.</action>
    <action>Synthesize a concise "Best-Practices and References" note capturing any updates or considerations that should influence the review (cite links and versions if available).</action>
  </step>

  <step n="4" goal="Assess implementation against acceptance criteria and specs">
    <action>From the story, read Acceptance Criteria and Tasks/Subtasks with their completion state.</action>
    <action>From Dev Agent Record → File List, compile list of changed/added files. If File List is missing or clearly incomplete, search repo for recent changes relevant to the story scope (heuristics: filenames matching components/services/routes/tests inferred from ACs/tasks).</action>
    <action>Cross-check epic tech-spec requirements and architecture constraints against the implementation intent in files.</action>
    <action>For each acceptance criterion, verify there is evidence of implementation and corresponding tests (unit/integration/E2E as applicable). Note any gaps explicitly.</action>
    <action if="critical architecture constraints are violated (e.g., layering, dependency rules)">flag as High severity finding.</action>
  </step>

  <step n="5" goal="Perform code quality and risk review">
    <action>For each changed file, skim for common issues appropriate to the stack: error handling, input validation, logging, dependency injection, thread-safety/async correctness, resource cleanup, performance anti-patterns.</action>
    <action>Perform security review: injection risks, authZ/authN handling, secret management, unsafe defaults, unvalidated redirects, CORS misconfig, dependency vulnerabilities (based on manifests).</action>
    <action>Check tests quality: assertions are meaningful, edge cases covered, deterministic behavior, proper fixtures, no flakiness patterns.</action>
    <action>Capture concrete, actionable suggestions with severity (High/Med/Low) and rationale. When possible, suggest specific code-level changes (filenames + line ranges) without rewriting large sections.</action>
  </step>

  <step n="6" goal="Decide review outcome and prepare notes">
    <action>Determine outcome: Approve, Changes Requested, or Blocked.</action>
    <action>Prepare a structured review report with sections: Summary, Outcome, Key Findings (by severity), Acceptance Criteria Coverage, Test Coverage and Gaps, Architectural Alignment, Security Notes, Best-Practices and References, Action Items.</action>
    <action>For Action Items, use imperative phrasing and map each to related ACs or files. Include suggested owners if clear.</action>
  </step>

  <step n="7" goal="Append review to story and update metadata">
    <action>Open {{story_path}} and append a new section at the end titled exactly: "Senior Developer Review (AI)".</action>
    <action>Insert subsections:
      - Reviewer: {{user_name}}
      - Date: {{date}}
      - Outcome: (Approve | Changes Requested | Blocked)
      - Summary
      - Key Findings
      - Acceptance Criteria Coverage
      - Test Coverage and Gaps
      - Architectural Alignment
      - Security Notes
      - Best-Practices and References (with links)
      - Action Items
    </action>
    <action>Add a Change Log entry with date, version bump if applicable, and description: "Senior Developer Review notes appended".</action>
    <action>If {{update_status_on_result}} is true: update Status to {{status_on_approve}} when approved; to {{status_on_changes_requested}} when changes requested; otherwise leave unchanged.</action>
    <action>Save the story file.</action>
  </step>

  <step n="8" goal="Follow-up options" optional="true">
    <action>If action items are straightforward and within safety bounds, ASK whether to create corresponding unchecked items under "Tasks / Subtasks" so the `dev-story` workflow can implement them next. If approved, append them under an Action Items subsection.</action>
    <action>Optionally invoke tests or linters to verify quick fixes if any were applied as part of review (requires user approval for any dependency changes).</action>
  </step>

  <step n="9" goal="Validation and completion">
    <invoke-task>Run validation checklist at {installed_path}/checklist.md using {project-root}/bmad/core/tasks/validate-workflow.xml</invoke-task>
    <action>Report workflow completion.</action>
  </step>

  <step n="10" goal="Update status file on completion">
    <action>Search {output_folder}/ for files matching pattern: bmm-workflow-status.md</action>
    <action>Find the most recent file (by date in filename)</action>

    <check if="status file exists">
      <action>Load the status file</action>

      <template-output file="{{status_file_path}}">current_step</template-output>
      <action>Set to: "review-story (Story {{epic_num}}.{{story_num}})"</action>

      <template-output file="{{status_file_path}}">current_workflow</template-output>
      <action>Set to: "review-story (Story {{epic_num}}.{{story_num}}) - Complete"</action>

      <template-output file="{{status_file_path}}">progress_percentage</template-output>
      <action>Calculate per-story weight: remaining_40_percent / total_stories / 5</action>
      <action>Increment by: {{per_story_weight}} * 2 (review-story ~2% per story)</action>

      <template-output file="{{status_file_path}}">decisions_log</template-output>
      <action>Add entry:</action>
      ```
      - **{{date}}**: Completed review-story for Story {{epic_num}}.{{story_num}}. Review outcome: {{outcome}}. Action items: {{action_item_count}}. Next: Address review feedback if needed, then continue with story-approved when ready.
      ```

      <output>**✅ Story Review Complete**

**Story Details:**
- Story: {{epic_num}}.{{story_num}}
- Review Outcome: {{outcome}}
- Action Items: {{action_item_count}}

**Status file updated:**
- Current step: review-story (Story {{epic_num}}.{{story_num}}) ✓
- Progress: {{new_progress_percentage}}%

**Next Steps:**
1. Review the Senior Developer Review notes appended to story
2. Address any action items or changes requested
3. When ready, run `story-approved` to mark story complete

Check status anytime with: `workflow-status`
      </output>
    </check>

    <check if="status file not found">
      <output>**✅ Story Review Complete**

**Story Details:**
- Story: {{epic_num}}.{{story_num}}
- Review Outcome: {{outcome}}

Note: Running in standalone mode (no status file).

**Next Steps:**
1. Review the Senior Developer Review notes
2. Address any action items
      </output>
    </check>
  </step>

</workflow>
````
