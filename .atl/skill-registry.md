# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Before any creative work — features, components, functionality, behavior changes | brainstorming | ~/.agents/skills/brainstorming/SKILL.md |
| Dashboard, admin panel, app, tool, interactive product UI design | interface-design | ~/.agents/skills/interface-design/SKILL.md |
| Discover and install agent skills for functionality | find-skills | ~/.agents/skills/find-skills/SKILL.md |
| PR creation workflow, preparing changes for review | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| Creating GitHub issues, reporting bugs, requesting features | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| Creating new AI agent skills | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| Go tests, Bubbletea TUI testing | go-testing | ~/.config/opencode/skills/go-testing/SKILL.md |
| Adversarial dual review protocol | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| Programación III Backend Java exam support | programacion-backend-java-optimizer | ~/.config/opencode/skills/programacion-backend-java-optimizer/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### brainstorming
- MUST be used BEFORE any creative work — no implementation without approved design
- Ask questions ONE AT A TIME — do not present menus or exhaustive lists
- Present 2-3 approaches with trade-offs before settling on a design
- Get user approval after each design section
- Write design doc to `docs/superpowers/specs/` before any code
- Spec self-review: check for placeholders, contradictions, ambiguity, scope creep
- "Simple" projects still need design — can be brief but MUST be presented and approved

### interface-design
- For dashboards, admin panels, apps, tools, interactive products — NOT marketing sites
- Avoid generic "kitchen feel" — define a signature design intent before coding
- Process: explore domain → name a signature → state intent → design with craft
- Consistency in spacing, typography, color, and interaction patterns
- Design for real data and edge cases, not just happy paths

### branch-pr
- Every PR MUST link an approved issue — no exceptions
- Every PR MUST have exactly one `type:*` label
- Automated checks must pass before merge
- Blank PRs without issue linkage will be blocked

### issue-creation
- Blank issues disabled — MUST use template (bug report or feature request)
- Every issue gets `status:needs-review` automatically
- Maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, not issues

### skill-creator
- Follow the Agent Skills spec format for creating new skills
- Include frontmatter with name, description, trigger
- Structure: Purpose, When to Use, Critical Rules, Workflow, Output Format

### go-testing
- Go testing patterns for Gentleman.Dots
- Bubbletea TUI testing with teatest
- Table-driven tests preferred

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize findings, apply fixes, re-judge until both pass
- Escalate after 2 iterations if still failing

### programacion-backend-java-optimizer
- Layered architecture for Java backend exams
- Optimal algorithms and efficient data structures
- Explicit technical justification required

## Project Conventions

No convention files found (no AGENTS.md, CLAUDE.md, .cursorrules, etc.).

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
