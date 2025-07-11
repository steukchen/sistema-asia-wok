import os
import subprocess
import sys
from pathlib import Path

def run_backend():
    backend_path = Path(__file__).parent / "backend"
    os.chdir(backend_path)
    print(f"Directorio actual: {os.getcwd()}")

    venv_activate = Path(".venv/Scripts/activate")
    if not venv_activate.exists():
        print("No se encontró el entorno virtual 'venv'. Por favor, crea uno antes de ejecutar este script.")
        sys.exit(1)

    commands = [
        f"call {venv_activate}",
        "uvicorn main:app --host 0.0.0.0 --port 5000 --reload"
    ]

    try:
        full_command = " && ".join(commands)
        subprocess.run(full_command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar el comando: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_backend()