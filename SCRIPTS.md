# Script Usage Guide

This repository now provides four PowerShell scripts at the project root:

- `setup.ps1`: first-time machine setup (dependency install + `.env` generation + MySQL init)
- `start.ps1`: full startup (runs setup, then starts backend and frontend)
- `stop.ps1`: stop running services
- `run.ps1`: compatibility alias of `start.ps1`

## Recommended First-Time Flow (new machine)

```powershell
# 1) One-click setup + startup (interactive DB config)
.\start.ps1
```

When running for the first time, `setup.ps1` will:

1. Check `node` and `npm`
2. Install `server` and `client` dependencies
3. Create `server/.env` from `server/.env.example` (if missing)
4. Ask for MySQL connection values and save them to `.env`
5. Run `npm run db:init` to create schema and seed initial data

## Common Commands

### Start

```powershell
.\start.ps1
```

### Start without opening browser

```powershell
.\start.ps1 -NoBrowser
```

### Reconfigure DB settings and restart

```powershell
.\start.ps1 -ReconfigureDb
```

### Reinitialize database (drop existing user/progress data, then seed)

```powershell
.\start.ps1 -ResetDb
```

### Skip DB initialization (for already prepared DB)

```powershell
.\start.ps1 -SkipDbInit
```

### Check environment only (no startup)

```powershell
.\start.ps1 -CheckOnly
```

## Setup Script (standalone)

```powershell
.\setup.ps1
```

Useful options:

- `-ForceInstall`: force reinstall dependencies
- `-ReconfigureDb`: prompt DB values again
- `-ResetDb`: run `db:init` with reset mode
- `-SkipProgressSeed`: initialize schema/admin user but skip progress seed
- `-SkipDbInit`: skip DB init command
- `-CheckOnly`: check/install/config only, no DB init

## Stop Script

```powershell
.\stop.ps1
```

Useful options:

- `-Force`: stop processes on target ports even if not recognized as this project
- `-KillAllNode`: stop all local `node` processes

## Compatibility Script

```powershell
.\run.ps1
```

`run.ps1` forwards all arguments to `start.ps1`.

## Notes

- Backend port is read from `server/.env` (`PORT`, default `3000`).
- Frontend dev port defaults to `5173`.
- If MySQL is not running or credentials are invalid, setup/start will fail early with a clear error.
