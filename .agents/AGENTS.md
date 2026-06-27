
## Emoji Picker
- NEVER implement or add an emoji picker to the application. The user has explicitly stated they do not want this feature.

## Data Integrity and Persistence (CRITICAL)
- **Zero Data Loss Guarantee**: Messages, reactions, media, and all user-generated content are immutable and sacred. Under no circumstances should any change (migrations, feature additions, schema updates) result in the deletion, loss, or corruption of existing data.
- **Backward-Safe Operations**: All schema changes and migrations must be fully backward-compatible. Do not use destructive operations (like `prisma db push` without safeguards, or dropping tables/columns) in a production environment unless explicitly requested and manually verified.
- **Staging and Testing**: Any change that could potentially impact existing data must be staged, tested, and validated for non-destructive behavior before it touches production. Always err on the side of caution.
