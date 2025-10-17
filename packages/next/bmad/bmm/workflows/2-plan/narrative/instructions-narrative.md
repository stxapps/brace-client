# Narrative Design Workflow

<workflow>

<critical>The workflow execution engine is governed by: {project_root}/bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already completed the GDD workflow</critical>
<critical>This workflow creates detailed narrative content for story-driven games</critical>
<critical>Uses narrative_template for output</critical>
<critical>If users mention gameplay mechanics, note them but keep focus on narrative</critical>
<critical>Facilitate good brainstorming techniques throughout with the user, pushing them to come up with much of the narrative you will help weave together. The goal is for the user to feel that they crafted the narrative and story arc unless they push you to do it all or indicate YOLO</critical>

<step n="1" goal="Load GDD context and assess narrative complexity">

<action>Load GDD.md from {output_folder}</action>
<action>Extract game_type, game_name, and any narrative mentions</action>

<ask>What level of narrative complexity does your game have?

**Narrative Complexity:**

1. **Critical** - Story IS the game (Visual Novel, Text-Based Adventure)
2. **Heavy** - Story drives the experience (Story-driven RPG, Narrative Adventure)
3. **Moderate** - Story enhances gameplay (Metroidvania, Tactics RPG, Horror)
4. **Light** - Story provides context (most other genres)

Your game type ({{game_type}}) suggests **{{suggested_complexity}}**. Confirm or adjust:</ask>

<action>Set narrative_complexity</action>

<check if="complexity == "Light"">
<ask>Light narrative games usually don't need a full Narrative Design Document. Are you sure you want to continue?

- GDD story sections may be sufficient
- Consider just expanding GDD narrative notes
- Proceed with full narrative workflow

Your choice:</ask>

<action>Load narrative_template from workflow.yaml</action>

</check>

</step>

<step n="2" goal="Define narrative premise and themes">

<ask>Describe your narrative premise in 2-3 sentences.

This is the "elevator pitch" of your story.

Examples:

- "A young knight discovers they're the last hope to stop an ancient evil, but must choose between saving the kingdom or their own family."
- "After a mysterious pandemic, survivors must navigate a world where telling the truth is deadly but lying corrupts your soul."

Your premise:</ask>

<template-output>narrative_premise</template-output>

<ask>What are the core themes of your narrative? (2-4 themes)

Themes are the underlying ideas/messages.

Examples: redemption, sacrifice, identity, corruption, hope vs. despair, nature vs. technology

Your themes:</ask>

<template-output>core_themes</template-output>

<ask>Describe the tone and atmosphere.

Consider: dark, hopeful, comedic, melancholic, mysterious, epic, intimate, etc.

Your tone:</ask>

<template-output>tone_atmosphere</template-output>

</step>

<step n="3" goal="Define story structure">

<ask>What story structure are you using?

Common structures:

- **3-Act** (Setup, Confrontation, Resolution)
- **Hero's Journey** (Campbell's monomyth)
- **Kishōtenketsu** (4-act: Introduction, Development, Twist, Conclusion)
- **Episodic** (Self-contained episodes with arc)
- **Branching** (Multiple paths and endings)
- **Freeform** (Player-driven narrative)

Your structure:</ask>

<template-output>story_type</template-output>

<ask>Break down your story into acts/sections.

For 3-Act:

- Act 1: Setup and inciting incident
- Act 2: Rising action and midpoint
- Act 3: Climax and resolution

Describe each act/section for your game:</ask>

<template-output>act_breakdown</template-output>
<invoke-task halt="true">{project-root}/bmad/core/tasks/adv-elicit.xml</invoke-task>

</step>

<step n="4" goal="Define major story beats">

<ask>List the major story beats (10-20 key moments).

Story beats are significant events that drive the narrative forward.

Format:

1. [Beat name] - Brief description
2. [Beat name] - Brief description
   ...

Your story beats:</ask>

<template-output>story_beats</template-output>
<invoke-task halt="true">{project-root}/bmad/core/tasks/adv-elicit.xml</invoke-task>

<ask>Describe the pacing and flow of your narrative.

Consider:

- Slow burn vs. fast-paced
- Tension/release rhythm
- Story-heavy vs. gameplay-heavy sections
- Optional vs. required narrative content

Your pacing:</ask>

<template-output>pacing_flow</template-output>

</step>

<step n="5" goal="Develop protagonist(s)">

<ask>Describe your protagonist(s).

For each protagonist include:

- Name and brief description
- Background and motivation
- Character arc (how they change)
- Strengths and flaws
- Relationships to other characters
- Internal and external conflicts

Your protagonist(s):</ask>

<template-output>protagonists</template-output>
<invoke-task halt="true">{project-root}/bmad/core/tasks/adv-elicit.xml</invoke-task>

</step>

<step n="6" goal="Develop antagonist(s)">

<ask>Describe your antagonist(s).

For each antagonist include:

- Name and brief description
- Background and motivation
- Goals (what they want)
- Methods (how they pursue goals)
- Relationship to protagonist
- Sympathetic elements (if any)

Your antagonist(s):</ask>

<template-output>antagonists</template-output>

</step>

<step n="7" goal="Develop supporting characters">

<ask>Describe supporting characters (allies, mentors, companions, NPCs).

For each character include:

- Name and role
- Personality and traits
- Relationship to protagonist
- Function in story (mentor, foil, comic relief, etc.)
- Key scenes/moments

Your supporting characters:</ask>

<template-output>supporting_characters</template-output>
<invoke-task halt="true">{project-root}/bmad/core/tasks/adv-elicit.xml</invoke-task>

</step>

<step n="8" goal="Map character arcs">

<ask>Describe the character arcs for major characters.

Character arc: How does the character change from beginning to end?

For each arc:

- Starting state
- Key transformation moments
- Ending state
- Lessons learned

Your character arcs:</ask>

<template-output>character_arcs</template-output>

</step>

<step n="9" goal="Build world and lore">

<ask>Describe your world.

Include:

- Setting (time period, location, world type)
- World rules (magic systems, technology level, societal norms)
- Atmosphere and aesthetics
- What makes this world unique

Your world:</ask>

<template-output>world_overview</template-output>

<ask>What is the history and backstory of your world?

- Major historical events
- How did the world reach its current state?
- Legends and myths
- Past conflicts

Your history:</ask>

<template-output>history_backstory</template-output>
<invoke-task halt="true">{project-root}/bmad/core/tasks/adv-elicit.xml</invoke-task>

</step>

<step n="10" goal="Define factions and locations">

<ask optional="true">Describe factions, organizations, or groups (if applicable).

For each:

- Name and purpose
- Leadership and structure
- Goals and methods
- Relationships with other factions

Your factions:</ask>

<template-output>factions_organizations</template-output>

<ask>Describe key locations in your world.

For each location:

- Name and description
- Narrative significance
- Atmosphere and mood
- Key events that occur there

Your locations:</ask>

<template-output>locations</template-output>

</step>

<step n="11" goal="Define dialogue framework">

<ask>Describe your dialogue style.

Consider:

- Formal vs. casual
- Period-appropriate vs. modern
- Verbose vs. concise
- Humor level
- Profanity/mature language

Your dialogue style:</ask>

<template-output>dialogue_style</template-output>

<ask>List key conversations/dialogue moments.

Include:

- Who is involved
- When it occurs
- What's discussed
- Narrative purpose
- Emotional tone

Your key conversations:</ask>

<template-output>key_conversations</template-output>

<check if="game has branching dialogue">
  <ask>Describe your branching dialogue system.

- How many branches/paths?
- What determines branches? (stats, choices, flags)
- Do branches converge?
- How much unique dialogue?

Your branching system:</ask>

<template-output>branching_dialogue</template-output>
</check>

</step>

<step n="12" goal="Environmental storytelling">

<ask>How will you tell story through the environment?

Visual storytelling:

- Set dressing and props
- Environmental damage/aftermath
- Visual symbolism
- Color and lighting

Your visual storytelling:</ask>

<template-output>visual_storytelling</template-output>

<ask>How will audio contribute to storytelling?

- Ambient sounds
- Music emotional cues
- Voice acting
- Audio logs/recordings

Your audio storytelling:</ask>

<template-output>audio_storytelling</template-output>

<ask optional="true">Will you have found documents (journals, notes, emails)?

If yes, describe:

- Types of documents
- How many
- What they reveal
- Optional vs. required reading

Your found documents:</ask>

<template-output>found_documents</template-output>

</step>

<step n="13" goal="Narrative delivery methods">

<ask>How will you deliver narrative content?

**Cutscenes/Cinematics:**

- How many?
- Skippable?
- Real-time or pre-rendered?
- Average length

Your cutscenes:</ask>

<template-output>cutscenes</template-output>

<ask>How will you deliver story during gameplay?

- NPC conversations
- Radio/comm chatter
- Environmental cues
- Player actions
- Show vs. tell balance

Your in-game storytelling:</ask>

<template-output>ingame_storytelling</template-output>

<ask>What narrative content is optional?

- Side quests
- Collectible lore
- Optional conversations
- Secret endings

Your optional content:</ask>

<template-output>optional_content</template-output>

<check if="multiple endings">
  <ask>Describe your ending structure.

- How many endings?
- What determines ending? (choices, stats, completion)
- Ending variety (minor variations vs. drastically different)
- True/golden ending?

Your endings:</ask>

<template-output>multiple_endings</template-output>
</check>

</step>

<step n="14" goal="Gameplay integration">

<ask>How does narrative integrate with gameplay?

- Does story unlock mechanics?
- Do mechanics reflect themes?
- Ludonarrative harmony or dissonance?
- Balance of story vs. gameplay

Your narrative-gameplay integration:</ask>

<template-output>narrative_gameplay</template-output>

<ask>How does story gate progression?

- Story-locked areas
- Cutscene triggers
- Mandatory story beats
- Optional vs. required narrative

Your story gates:</ask>

<template-output>story_gates</template-output>

<ask>How much agency does the player have?

- Can player affect story?
- Meaningful choices?
- Role-playing freedom?
- Predetermined vs. dynamic narrative

Your player agency:</ask>

<template-output>player_agency</template-output>

</step>

<step n="15" goal="Production planning">

<ask>Estimate your writing scope.

- Word count estimate
- Number of scenes/chapters
- Dialogue lines estimate
- Branching complexity

Your scope:</ask>

<template-output>writing_scope</template-output>

<ask>Localization considerations?

- Target languages
- Cultural adaptation needs
- Text expansion concerns
- Dialogue recording implications

Your localization:</ask>

<template-output>localization</template-output>

<ask>Voice acting plans?

- Fully voiced, partially voiced, or text-only?
- Number of characters needing voices
- Dialogue volume
- Budget considerations

Your voice acting:</ask>

<template-output>voice_acting</template-output>

</step>

<step n="16" goal="Completion and next steps">

<action>Generate character relationship map (text-based diagram)</action>
<template-output>relationship_map</template-output>

<action>Generate story timeline</action>
<template-output>timeline</template-output>

<ask optional="true">Any references or inspirations to note?

- Books, movies, games that inspired you
- Reference materials
- Tone/theme references

Your references:</ask>

<template-output>references</template-output>

<ask>Narrative Design complete! Next steps:

1. Proceed to solutioning (technical architecture)
2. Create detailed script/screenplay (outside workflow)
3. Review narrative with team/stakeholders
4. Exit workflow

Which would you like?</ask>

</step>

</workflow>
