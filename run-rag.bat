@echo off

cd /d %~dp0

REM Activate virtual environment
call venv\Scripts\activate

python start_minirag.py