{
  "action": "upsert",
  "company": {
    "companyName": "NOME 1",
    "companyName2": "NOME 2", // NOVO
    "companyName3": "NOME 3", // NOVO
    "hasFloridaAddress": false,
    "usAddress": { /* ... */ }
  },
  "members": [
    {
      "fullName": "Sócio A",
      "email": "a@exemplo.com",
      "passport": "...",
      "address": { // NOVO OBJETO ANINHADO
        "line1": "Rua Principal",
        "city": "Miami",
        "state": "FL",
        "zip": "33101"
      }
    },
    // ... Sócio B
  ]
}