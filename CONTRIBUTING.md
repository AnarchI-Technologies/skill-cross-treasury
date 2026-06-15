# Contributing

Keep the skill deterministic, composable, and safe by default.

- Prefer read-only commands for discovery.
- Put protocol-specific writes in the dedicated skill that owns that protocol.
- Keep `cross-treasury` focused on policy, risk gates, and orchestration.
- Never print secrets.
- Add or update smoke tests for new public behavior.
