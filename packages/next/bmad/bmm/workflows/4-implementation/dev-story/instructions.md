# Develop Story - Workflow Instructions

````xml
<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {installed_path}/workflow.yaml</critical>
<critical>Only modify the story file in these areas: Tasks/Subtasks checkboxes, Dev Agent Record (Debug Log, Completion Notes), File List, Change Log, and Status</critical>
<critical>Execute ALL steps in exact order; do NOT skip steps</critical>
<critical>If {{run_until_complete}} == true, run non-interactively: do not pause between steps unless a HALT condition is reached or explicit user approval is required for unapproved dependencies.</critical>
<critical>Absolutely DO NOT stop because of "milestones", "significant progress", or "session boundaries". Continue in a single execution until the story is COMPLETE (all ACs satisfied and all tasks/subtasks checked) or a HALT condition is triggered.</critical>
<critical>Do NOT schedule a "next session" or request review pauses unless a HALT condition applies. Only Step 6 decides completion.</critical>

<workflow>

  <step n="1" goal="Load story from status file IN PROGRESS section">
    <action>Read {output_folder}/bmm-workflow-status.md (if exists)</action>
    <action>Navigate to "### Implementation Progress (Phase 4 Only)" section</action>
    <action>Find "#### IN PROGRESS (Approved for Development)" section</action>

    <check if="IN PROGRESS section has a story">
      <action>Extract story information:</action>
      - current_story_id: The story ID (e.g., "1.1", "auth-feature-1", "login-fix")
      - current_story_title: The story title
      - current_story_file: The exact story file path
      - current_story_context_file: The context file path (if exists)

      <critical>DO NOT SEARCH for stories - the status file tells you exactly which story is IN PROGRESS</critical>

      <action>Set {{story_path}} = {story_dir}/{current_story_file}</action>
      <action>Read the COMPLETE story file from {{story_path}}</action>
      <action>Parse sections: Story, Acceptance Criteria, Tasks/Subtasks (including subtasks), Dev Notes, Dev Agent Record, File List, Change Log, Status</action>
      <action>Identify the first incomplete task (unchecked [ ]) in Tasks/Subtasks; if subtasks exist, treat all subtasks as part of the selected task scope</action>
      <check>If no incomplete tasks found → "All tasks completed - proceed to completion sequence" and <goto step="6">Continue</goto></check>
      <check>If story file inaccessible → HALT: "Cannot develop story without access to story file"</check>
      <check>If task requirements ambiguous → ASK user to clarify; if unresolved, HALT: "Task requirements must be clear before implementation"</check>
    </check>

    <check if="IN PROGRESS section is empty OR status file not found">
      <action>Fall back to legacy auto-discovery:</action>
      <action>If {{story_path}} was explicitly provided and is valid → use it. Otherwise, attempt auto-discovery.</action>
      <action>Auto-discovery: Read {{story_dir}} from config (dev_story_location). If invalid/missing or contains no .md files, ASK user to provide either: (a) a story file path, or (b) a directory to scan.</action>
      <action>If a directory is provided, list story markdown files recursively under that directory matching pattern: "story-*.md".</action>
      <action>Sort candidates by last modified time (newest first) and take the top {{story_selection_limit}} items.</action>
      <ask>Present the list with index, filename, and modified time. Ask: "Select a story (1-{{story_selection_limit}}) or enter a path:"</ask>
      <action>Resolve the selected item into {{story_path}}</action>
      <action>Read the COMPLETE story file from {{story_path}}</action>
      <action>Parse sections: Story, Acceptance Criteria, Tasks/Subtasks (including subtasks), Dev Notes, Dev Agent Record, File List, Change Log, Status</action>
      <action>Identify the first incomplete task (unchecked [ ]) in Tasks/Subtasks; if subtasks exist, treat all subtasks as part of the selected task scope</action>
      <check>If no incomplete tasks found → "All tasks completed - proceed to completion sequence" and <goto step="6">Continue</goto></check>
      <check>If story file inaccessible → HALT: "Cannot develop story without access to story file"</check>
      <check>If task requirements ambiguous → ASK user to clarify; if unresolved, HALT: "Task requirements must be clear before implementation"</check>
    </check>
  </step>

  <step n="2" goal="Plan and implement task">
    <action>Review acceptance criteria and dev notes for the selected task</action>
    <action>Plan implementation steps and edge cases; write down a brief plan in Dev Agent Record → Debug Log</action>
    <action>Implement the task COMPLETELY including all subtasks, following architecture patterns and coding standards in this repo</action>
    <action>Handle error conditions and edge cases appropriately</action>
    <check>If unapproved dependencies are needed → ASK user for approval before adding</check>
    <check>If 3 consecutive implementation failures occur → HALT and request guidance</check>
    <check>If required configuration is missing → HALT: "Cannot proceed without necessary configuration files"</check>
    <check>If {{run_until_complete}} == true → Do not stop after partial progress; continue iterating tasks until all ACs are satisfied or a HALT condition triggers</check>
    <check>Do NOT propose to pause for review, standups, or validation until Step 6 gates are satisfied</check>
  </step>

  <step n="3" goal="Author comprehensive tests">
    <action>Create unit tests for business logic and core functionality introduced/changed by the task</action>
    <action>Add integration tests for component interactions where applicable</action>
    <action>Include end-to-end tests for critical user flows if applicable</action>
    <action>Cover edge cases and error handling scenarios noted in the plan</action>
  </step>

  <step n="4" goal="Run validations and tests">
    <action>Determine how to run tests for this repo (infer or use {{run_tests_command}} if provided)</action>
    <action>Run all existing tests to ensure no regressions</action>
    <action>Run the new tests to verify implementation correctness</action>
    <action>Run linting and code quality checks if configured</action>
    <action>Validate implementation meets ALL story acceptance criteria; if ACs include quantitative thresholds (e.g., test pass rate), ensure they are met before marking complete</action>
    <check>If regression tests fail → STOP and fix before continuing</check>
    <check>If new tests fail → STOP and fix before continuing</check>
  </step>

  <step n="5" goal="Mark task complete and update story">
    <action>ONLY mark the task (and subtasks) checkbox with [x] if ALL tests pass and validation succeeds</action>
    <action>Update File List section with any new, modified, or deleted files (paths relative to repo root)</action>
    <action>Add completion notes to Dev Agent Record if significant changes were made (summarize intent, approach, and any follow-ups)</action>
    <action>Append a brief entry to Change Log describing the change</action>
    <action>Save the story file</action>
    <check>Determine if more incomplete tasks remain</check>
    <check>If more tasks remain → <goto step="1">Next task</goto></check>
    <check>If no tasks remain → <goto step="6">Completion</goto></check>
  </step>

  <step n="6" goal="Story completion sequence">
    <action>Verify ALL tasks and subtasks are marked [x] (re-scan the story document now)</action>
    <action>Run the full regression suite (do not skip)</action>
    <action>Confirm File List includes every changed file</action>
    <action>Execute story definition-of-done checklist, if the story includes one</action>
    <action>Update the story Status to: Ready for Review</action>
    <check>If any task is incomplete → Return to step 1 to complete remaining work (Do NOT finish with partial progress)</check>
    <check>If regression failures exist → STOP and resolve before completing</check>
    <check>If File List is incomplete → Update it before completing</check>
  </step>

  <step n="7" goal="Validation and handoff" optional="true">
    <action>Optionally run the workflow validation task against the story using {project-root}/bmad/core/tasks/validate-workflow.xml</action>
    <action>Prepare a concise summary in Dev Agent Record → Completion Notes</action>
    <action>Communicate that the story is Ready for Review</action>
  </step>

  <step n="8" goal="Update status file on completion">
    <action>Search {output_folder}/ for files matching pattern: bmm-workflow-status.md</action>
    <action>Find the most recent file (by date in filename)</action>

    <check if="status file exists">
      <action>Load the status file</action>

      <template-output file="{{status_file_path}}">current_step</template-output>
      <action>Set to: "dev-story (Story {{current_story_id}})"</action>

      <template-output file="{{status_file_path}}">current_workflow</template-output>
      <action>Set to: "dev-story (Story {{current_story_id}}) - Complete (Ready for Review)"</action>

      <template-output file="{{status_file_path}}">progress_percentage</template-output>
      <action>Calculate per-story weight: remaining_40_percent / total_stories / 5</action>
      <action>Increment by: {{per_story_weight}} * 5 (dev-story weight is ~5% per story - largest weight)</action>

      <template-output file="{{status_file_path}}">decisions_log</template-output>
      <action>Add entry:</action>
      ```
      - **{{date}}**: Completed dev-story for Story {{current_story_id}} ({{current_story_title}}). All tasks complete, tests passing. Story status: Ready for Review. Next: User reviews and runs story-approved when satisfied with implementation.
      ```

      <output>**✅ Story Implementation Complete**

**Story Details:**
- Story ID: {{current_story_id}}
- Title: {{current_story_title}}
- File: {{story_path}}
- Status: Ready for Review

**Status file updated:**
- Current step: dev-story (Story {{current_story_id}}) ✓
- Progress: {{new_progress_percentage}}%

**Next Steps:**
1. Review the implemented story and test the changes
2. Verify all acceptance criteria are met
3. When satisfied, run `story-approved` to mark story complete and advance the queue

Or check status anytime with: `workflow-status`
      </output>
    </check>

    <check if="status file not found">
      <output>**✅ Story Implementation Complete**

**Story Details:**
- Story ID: {{current_story_id}}
- Title: {{current_story_title}}
- File: {{story_path}}
- Status: Ready for Review

Note: Running in standalone mode (no status file).

To track progress across workflows, run `workflow-status` first.
      </output>
    </check>
  </step>

</workflow>
````
