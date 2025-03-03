# Loan API Spec

## Create Loan

Endpoint : POST /api/loans

Headers :

- Authorization: token

Request Body :

```json
{
  "nim": "205400001",
  "bookId": "1"
}
```

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "nim": "205400001",
    "full_name": "Ilman Rifqi",
    "title": "ChatGPT AI",
    "status": "APPROVED"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Student has pending loans"
}

or

{
  "errors": "Book out of stock"
}
```

## Update Loan

Endpoint : PATCH /api/loans/:loanId

Headers :

- Authorization: token

Request Body :

```json
{
  "status": "RETURNED"
}
```

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "nim": "205400001",
    "full_name": "Ilman Rifqi",
    "title": "ChatGPT AI",
    "status": "RETURNED"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Invalid status transition"
}
```

## Get Loan

Endpoint : GET /api/loans/:loanId

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "nim": "205400001",
    "full_name": "Ilman Rifqi",
    "title": "ChatGPT AI",
    "status": "RETURNED"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Loan not found"
}
```

## List Loan

Endpoint : GET /api/loans

Headers :

- Authorization: token

Response Body

```json
{
  "data": [
    {
      "id": 1,
      "nim": "205400001",
      "full_name": "Ilman Rifqi",
      "title": "ChatGPT AI",
      "status": "RETURNED"
    },
    {
      "id": 2,
      "nim": "205400002",
      "full_name": "Delis Rahmawati",
      "title": "DeepSeek AI",
      "status": "APPROVED"
    }
  ]
}
```

Response Body (Failed) :

```json
{
  "errors": "Data not found"
}
```

## Search Loan

Endpoint : GET /api/loans

Headers :

- Authorization: token

Query Params :

- nim: string, optional
- full_name: string, optional
- status: string, optional
- page: number, default 1
- size: number, default 10

Response Body (Success) :

```json
{
  "data": [
    {
      "id": 1,
      "nim": "205400001",
      "full_name": "Ilman Rifqi",
      "title": "ChatGPT AI",
      "status": "RETURNED"
    },
    {
      "id": 2,
      "nim": "205400002",
      "full_name": "Delis Rahmawati",
      "title": "DeepSeek AI",
      "status": "APPROVED"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```

## Remove Loan

Endpoint : DELETE /api/loans/:loanId

Headers :

- Authorization: token

Response Body

```json
{
  "data": true
}
```

Response Body (Failed) :

```json
{
  "errors": "Data not found"
}
```
