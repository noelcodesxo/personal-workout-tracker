FROM python:3

WORKDIR /app 

RUN pip install uv 

# Copying files that don't change much
COPY pyproject.toml uv.lock ./

# Use uv.lock as is and install dependencies in system
RUN uv sync --frozen --no-install-project

COPY . ./

RUN uv sync --frozen

EXPOSE 8000

CMD ["uv", "run", "main.py"]