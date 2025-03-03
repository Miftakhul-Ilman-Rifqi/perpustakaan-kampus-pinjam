# Student API Spec

## Get Student

Endpoint : GET /api/students/:studentId

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": {
    "id": 1,
    "full_name": "Ilman Rifqi",
    "nim": "205400001"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Student not found"
}
```

## List Student

Endpoint : GET /api/students

Headers :

- Authorization: token

Response Body

```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Ilman Rifqi",
      "nim": "205400001"
    },
    {
      "id": 2,
      "full_name": "Delis Rahmawati",
      "nim": "205400002"
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

## Search Student

Endpoint : GET /api/students

Headers :

- Authorization: token

Query Params :

- full_name: string, students full_name or contain, optional
- nim: string, students nim, optional
- page: number, default 1
- size: number, default 10

Response Body (Success) :

```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Ilman Rifqi",
      "nim": "205400001"
    },
    {
      "id": 2,
      "full_name": "Delis Rahmawati",
      "nim": "205400002"
    }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```
