# Ad Spend

Ad spend analytics. Django backend + React frontend.

```
backend/   Django REST API
web/       React dashboard
```

---

## Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py ingest_data --file dataset.csv
python manage.py runserver
```

API runs at `http://localhost:8000`.

### Endpoints

**GET /spend/summary**

| param | required | values |
|---|---|---|
| `group_by` | yes | `advertiser` `topic` `election` `week` `month` |
| `spend_month` | no | `YYYY-MM` |
| `spend_week` | no | `YYYY-MM-DD` |
| `topic` | no | string |
| `election` | no | string |

```
GET /spend/summary?group_by=topic&election=NV-SEN

[
  { "group": "Climate & Energy", "spend": 120000.0 },
  { "group": "Abortion", "spend": 98000.0 }
]
```

---

## Frontend

```bash
cd web
npm install
npm run dev
```

Dashboard at `http://localhost:5173`. Loads data from `web/public/data/data.csv` directly — no backend call needed.

Charts: spend by election (bar), spend by topic (pie), spend over time (line). Filterable by advertiser, election, and topic.

---

## Data format

CSV columns: `advertiser`, `election`, `topic`, `spend`, `spend_week` (e.g. `2024_10/01-10/06`), `spend_month` (e.g. `2024_10`).

DB schema: `Advertiser`, `Election`, `Topic` lookup tables + `AdSpend` fact table with FK references.
