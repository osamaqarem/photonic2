# Photonic

### DB

```
fly pg create
fly pg attach --app [app_name] [database_name]
# Redploying the app with the updated secret is now required.
```

### Bulk setting secrets on app

```
flyctl --app [app_name] secrets import < ./apps/next/.env
```
