FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Shell form (not exec array) so $PORT actually gets substituted — Render/Railway
# inject their own PORT at runtime and expect the container to listen on it.
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
