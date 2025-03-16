# Superadmin API Spec

## Register Superadmin via Seed Code

Endpoint : (Hanya via database seed, tidak ada endpoint publik)

Request Body :

```json
{
  "username": "rifqi1",
  "password": "rahasia",
  "full_name": "Miftakhul"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "rifqi1",
    "full_name": "Miftakhul"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username already registered"
}

or

{
  "errors": "Superadmin limit reached"
}
```

## Login Superadmin

Endpoint : POST /api/superadmins/login

Request Body :

```json
{
  "username": "rifqi1",
  "password": "rahasia"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "rifqi1",
    "full_name": "Miftakhul",
    "token": "jwt_token"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username or password is wrong"
}
```

## Logout Superadmin

Endpoint : DELETE /api/superadmins/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": true
}
```
