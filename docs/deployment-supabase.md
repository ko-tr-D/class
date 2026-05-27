# Supabase Deployment Plan

## Storage Decision

- GitHub: source code only
- Supabase PostgreSQL: students, classes, evaluations, attempts, analytics, record drafts, audit logs
- Supabase Storage or Google Drive: PDF originals and images

## Environment Variables

The API uses SQLite by default. When `DATABASE_URL` is set, it connects to Supabase PostgreSQL.

```env
DATABASE_URL=postgresql://...
WEB_ORIGIN=https://your-site.example.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=class-documents
```

Use Supabase's Session pooler connection string for deployed API servers. Supabase's docs say the connection string is available from the dashboard's Connect/Database settings, and direct connections may require IPv6 depending on the environment.

## Site Address Plan

- Web app: `https://class-record.example.com`
- API: `https://api.class-record.example.com`
- Database: Supabase PostgreSQL
- File bucket: `class-documents`

## What The Teacher Needs To Do

1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Create a private Storage bucket named `class-documents`.
4. Give Codex the project URL and database connection string when ready.
5. Choose a site domain name.

## References

- Supabase database connection strings: https://supabase.com/docs/reference/postgres/connection-strings
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase S3 compatibility: https://supabase.com/docs/guides/storage/s3/compatibility/
