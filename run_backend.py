import os
import subprocess
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def run_backend():
    PATH_BACKEND = os.getenv("PATH_BACKEND")
    os.chdir(PATH_BACKEND)
    print(f"Directorio actual: {os.getcwd()}")

    NAME_VENV = os.getenv("NAME_VENV")
    venv_activate = Path(PATH_BACKEND+"/"+NAME_VENV+"/Scripts/activate")
    if not venv_activate.exists():
        print(f"No se encontró el entorno virtual {NAME_VENV}. Por favor, crea uno antes de ejecutar este script.")
        sys.exit(1)

    commands = [
        f"call {venv_activate}",
        "uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"
    ]

    try:
        full_command = " && ".join(commands)
        subprocess.run(full_command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar el comando: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_backend()