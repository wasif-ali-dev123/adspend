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

---

## Known issues

| # | where | what |
|---|---|---|
| 1 | `settings.py` | missing comma in `INSTALLED_APPS` between `rest_framework` and `elections` — crashes Django |
| 2 | `views.py` | `APIView`, `Response`, `Sum` not imported |
| 3 | `views.py` | `status.HTTP_400` → should be `HTTP_400_BAD_REQUEST` |
| 4 | `views.py` | `AdSpend.object` typo → `objects` |
| 5 | `views.py` | date format `"%Y-%m-D"` → `"%Y-%m-%d"` |
| 6 | `views.py` | `.order_by()` on new line after `)` — syntax error |
| 7 | `views.py` | `week`/`month` group_by branches not implemented |
| 8 | `views.py` | `topic`, `election`, `spend_week` filters never applied |
| 9 | `views.py` | no `return Response(result)` |
| 10 | `views.py` | wrong import path `from backend.elections.models` |
| 11 | `urls.py` | view never registered — endpoint 404s |
| 12 | `models.py` | unused import `from pyexpat import model` |
| 13 | `models.py` | `raw_spend_week` and `raw_spend_month` fields missing |
| 14 | `ingest_data.py` | wrong import path |
| 15 | `ingest_data.py` | unused imports (`sympy.EX`, `os.name`, `re.A`) |
| 16 | `ingest_data.py` | `drop_duplicates()` result discarded |
| 17 | `ingest_data.py` | column loop has `"election,topic,..."` as one string |
| 18 | `ingest_data.py` | `ingest_data` method missing `self` |
| 19 | `ingest_data.py` | `advertisers[advertiser]` wrong key |
| 20 | `ingest_data.py` | elections, topics, AdSpend rows never created |
| 21 | `ingest_data.py` | exception swallowed — continues with undefined `data` |
| 22 | project | no `requirements.txt` |
| 23 | project | no root `.gitignore` |
| 24 | `tests.py` | empty |
| 25 | `BarChart.jsx` | `tooltip` used before it's defined — ReferenceError on hover |
| 26 | `LineChart.jsx` | same tooltip bug |
| 27 | `FilterPanel.jsx` | ~90 lines of commented-out dead code |
