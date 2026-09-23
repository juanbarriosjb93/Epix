@echo off
cd /d C:\Users\ADMIN\Desktop\epix\backend
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --env-file .env >> uvicorn.out.log 2>> uvicorn.err.log
