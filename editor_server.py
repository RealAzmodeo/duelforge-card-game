#!/usr/bin/env python3
"""
Servidor local ligero para el Visor de Escenas de Duelforge.
Sirve el proyecto y permite guardar los cambios de scene-layout.js directamente en disco.
"""

import argparse
import json
import os
import re
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
LAYOUT_FILE = os.path.join(ROOT_DIR, "scene-layout.js")
ASSETS_DIR = os.path.join(ROOT_DIR, "assets")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"}


def read_layout_json():
    if not os.path.exists(LAYOUT_FILE):
        return {}
    try:
        with open(LAYOUT_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.search(r"window\.SCENE_LAYOUT\s*=\s*(\{[\s\S]*\})\s*;?", content)
        if not match:
            return {}
        return json.loads(match.group(1))
    except Exception:
        return {}


def write_layout_json(data):
    pretty = json.dumps(data, indent=2, ensure_ascii=False)
    content = (
        "// Configuracion de escena guardada por el Visor de Escenas (scene-editor.html).\n"
        "// No edites manualmente a menos que sepas lo que haces.\n"
        f"window.SCENE_LAYOUT = {pretty};\n"
    )
    with open(LAYOUT_FILE, "w", encoding="utf-8") as f:
        f.write(content)


def list_assets():
    items = []
    if not os.path.isdir(ASSETS_DIR):
        return items
    for dirpath, _, filenames in os.walk(ASSETS_DIR):
        for fname in sorted(filenames):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in IMAGE_EXTS:
                continue
            full_path = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(full_path, ROOT_DIR).replace("\\", "/")
            parts = rel_path.split("/")
            category = parts[1] if len(parts) > 2 else "other"
            items.append({
                "path": rel_path,
                "category": category,
                "name": fname,
            })
    return items


class EditorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def _send_json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/assets":
            self._send_json(200, {"assets": list_assets()})
            return
        if self.path == "/api/layout":
            self._send_json(200, {"layout": read_layout_json()})
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/layout":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length).decode("utf-8")
                data = json.loads(raw)
                if not isinstance(data, dict):
                    self._send_json(400, {"ok": False, "error": "Payload must be a JSON object"})
                    return
                write_layout_json(data)
                self._send_json(200, {"ok": True, "saved_keys": len(data)})
            except Exception as exc:
                self._send_json(500, {"ok": False, "error": str(exc)})
            return
        self._send_json(404, {"ok": False, "error": "Not found"})

    def log_message(self, format, *args):
        # Keep console output clean
        pass


def main():
    parser = argparse.ArgumentParser(description="Servidor del Visor de Escenas de Duelforge")
    parser.add_argument("--port", type=int, default=8125, help="Puerto HTTP local")
    parser.add_argument("--no-browser", action="store_true", help="No abrir el navegador automaticamente")
    args = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), EditorHandler)
    url = f"http://127.0.0.1:{args.port}/scene-editor.html"
    print(f"Visor de Escenas activo en: {url}")
    print("Presiona Ctrl+C para detener el servidor.")

    if not args.no_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        server.server_close()


if __name__ == "__main__":
    main()
