import os
import subprocess
import sys
from pathlib import Path

def run_frontend():
    frontend_path = Path(__file__).parent / "frontend"
    os.chdir(frontend_path)
    print(f"Current directory: {os.getcwd()}")

    npm_run_dev = Path("npm run dev")
    if not Path("node_modules").exists():
        print("El comando que estás intentando ejecutar no existe. Por favor, asegúrate de que estás en el directorio correcto y que el comando es válido.")
        sys.exit(1)

    subprocess.run("npm run dev", shell=True, check=True)

if __name__ == "__main__":
    print("🚀 Iniciando sistema ASIA WOK...")
    run_frontend()