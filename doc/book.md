# Book API Spec

## Create Book

Endpoint : POST /api/books

Headers :

- Authorization: token

Request Body :

```json
{
  "title": "DeepSeek AI",
  "stock": 4
}
```

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "title": "DeepSeek AI",
    "stock": 4
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Book title already exists"
}
```

## Update Book

Endpoint : PATCH /api/books/:bookId

Headers :

- Authorization: token

Request Body :

```json
{
  "title": "DeepSeek AI",
  "stock": 6
}
```

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "title": "DeepSeek AI R1",
    "stock": 6
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Book title already exists"
}
```

## Get Book

Endpoint : GET /api/books/:bookId

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "title": "DeepSeek AI",
    "stock": 2
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Book not found"
}
```

## List Book

Endpoint : GET /api/books

Headers :

- Authorization: token

Response Body

```json
{
  "data": [
    {
      "id": 1,
      "title": "DeepSeek AI",
      "stock": 2
    },
    {
      "id": 2,
      "title": "ChatGPT AI",
      "stock": 7
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

## Search Book

Endpoint : GET /api/books

Headers :

- Authorization: token

Query Params :

- id: string, optional
- title: string, book title, optional
- page: number, default 1
- size: number, default 10

Response Body (Success) :

```json
{
  "data": [
    {
      "id": 1,
      "title": "DeepSeek AI",
      "stock": 2
    },
    {
      "id": 2,
      "title": "ChatGPT AI",
      "stock": 7
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```

## Remove Book

Endpoint : DELETE /api/books/:bookId

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
  "errors": "Book has active loans"
}
```
