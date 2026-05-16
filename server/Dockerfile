FROM python:3

WORKDIR /usr/src/app 

RUN pip install uv 

COPY . ./

CMD ["uv", "run", "main.py"]