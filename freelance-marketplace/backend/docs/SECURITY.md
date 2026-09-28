# Security Notes

This document records the security posture of the Freelance Marketplace
at the end of Phase 34 (Security Review). It is not a claim that the
application is "secure" — no application is. It is a record of:

- What we audited.
- What we fixed.
- What we deliberately deferred.
- What must be done before any public deployment.

## What is currently in place

### Access control
- Every ViewSet scopes its queryset to the current user (or their role).
- Object-level permissions exist for accept/reject, portfolio mutations,
  and messaging.
- Cross-user access returns 404, not 403, hiding the existence of the
  resource.

### Authentication
- Custom User model with a role field.
- JWT via SimpleJWT: 60-minute access, 7-day refresh.
- Password hashing via Django's PBKDF2-SHA256 (600k+ iterations by default in Django 5).
- Password validators (length, common password, similarity, numeric).
- Login and register endpoints are rate-limited (5/min, 3/hr).

### Transport & headers (production only, gated by `DEBUG=False`)
- `SECURE_SSL_REDIRECT = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`
- `SECURE_HSTS_SECONDS = 31536000`
- `X_FRAME_OPTIONS = "DENY"`
- `SECURE_CONTENT_TYPE_NOSNIFF = True`

### Input handling
- Django ORM parameterizes all queries. No raw SQL.
- Serializers validate all input.
- React escapes all rendered content. No `dangerouslySetInnerHTML`.

### Uploads
- File uploads validated by Pillow (must be a valid image).
- 5 MB per-file limit, 1000 field limit per multipart.
- Media served by Django in dev; must be served by nginx/CDN in production.

### Rate limiting
- 60/min anonymous
- 240/min authenticated
- 5/min login
- 3/hour register

(Per-process, in-memory. See "Before launch" for production notes.)

### Logging
- Console logging at INFO level.
- Django security logger at WARNING.

## What is NOT in place (deferred)

These are known gaps. They are acceptable for a learning project that
isn't publicly launched, but they must be addressed before any public
deployment.

### Password reset
Users cannot reset a forgotten password. Before launch:
- Add `POST /api/auth/password-reset/` and `.../confirm/`.
- Configure an email backend (SMTP, SendGrid, Postmark, etc.).
- Send a signed one-time token by email.

### Email verification
Users can register with any email they don't own. Before launch:
- Send a verification link on registration.
- Require verification before certain actions (posting jobs, applying).

### Refresh token rotation
Refresh tokens are currently long-lived and not rotated. Before launch:
- Add `rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS`.
- Set `ROTATE_REFRESH_TOKENS = True`.
- Set `BLACKLIST_AFTER_ROTATION = True`.
- Add `POST /api/auth/logout/` that blacklists the refresh token.

### Distributed rate limiting
Current rate limiting is per-process. If you run multiple Django workers,
each has its own counter. Before launch:
- Configure a shared cache (Redis or Memcached).
- Point `CACHES["default"]` at it.

### HTTPS & domain
Everything runs on `http://localhost:8000` in dev. Before launch:
- Terminate TLS at a reverse proxy (nginx, Caddy, or a cloud LB).
- Set `ALLOWED_HOSTS` to the real domain.
- Set `CORS_ALLOWED_ORIGINS` to the real frontend domain (or serve both
  from the same origin and remove CORS entirely).
- Set `VITE_SITE_URL` in `frontend/.env` to the real domain.

### Media storage
Media files are stored on the local filesystem. Before launch:
- For single-server: mount a persistent volume; serve `/media/` via nginx.
- For multi-server: use S3 or an equivalent object store, and update
  `DEFAULT_FILE_STORAGE` and `MEDIA_URL`.

### Sentry / error tracking
There is no error monitoring. Before launch:
- Add `sentry-sdk` to `requirements.txt`.
- Configure it with your DSN.
- Route Django exceptions to Sentry.

### Backups
There are no backups configured. Before launch:
- Daily database dumps to off-site storage.
- Test the restore procedure.

### Postgres migration
The dev database is SQLite. Before launch:
- Migrate to PostgreSQL.
- Update `DATABASES` to use `DATABASE_URL` from `.env`.
- Test migrations and queries on Postgres.

## Known limitations

### Refresh tokens are not rotated
As above. Add blacklist + rotation before launch.

### Rate limiting is per-process
As above.

### No password reset, no email verification
As above.

### `npm audit` warnings in dev dependencies
The frontend has audit warnings in its dev-tooling tree (Vitest, jsdom,
Playwright, etc.). These do not ship to users. Run
`npm audit --production` to verify production dependencies are clean.

### `pip-audit` on backend dependencies
Run `pip-audit` periodically and update patch versions as CVEs drop.

## Reporting a vulnerability

If you find a security issue, do not open a public issue. Contact the
maintainer privately.

## Acknowledgements

This review is based on the OWASP Top 10 (2021). It is a starting point,
not a complete audit.