import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote, urlparse

from .database import fetch_selected_candidates
from .email_service import send_email_to_username


def _json_response(handler, status_code, payload):
    body = json.dumps(payload).encode('utf-8')
    handler.send_response(status_code)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(body)))
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type')
    handler.end_headers()
    handler.wfile.write(body)


class RecruiterRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        _json_response(self, 204, {})

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == '/api/selected-candidates':
            candidates = fetch_selected_candidates()
            _json_response(self, 200, {'candidates': candidates})
            return

        _json_response(self, 404, {'error': 'Endpoint not found'})

    def do_POST(self):
        parsed = urlparse(self.path)
        prefix = '/api/selected-candidates/'
        suffix = '/send-email'

        if parsed.path.startswith(prefix) and parsed.path.endswith(suffix):
            username = parsed.path[len(prefix):-len(suffix)]
            username = unquote(username).strip()

            if not username:
                _json_response(self, 400, {'success': False, 'message': 'Username is required.'})
                return

            result = send_email_to_username(username)
            if result.get('success'):
                status_code = 200
            elif result.get('error_type') == 'candidate_not_found':
                status_code = 404
            else:
                status_code = 500

            _json_response(self, status_code, result)
            return

        _json_response(self, 404, {'error': 'Endpoint not found'})

    def log_message(self, format, *args):
        return


def run_server(port=8000):
    server = HTTPServer(('0.0.0.0', port), RecruiterRequestHandler)
    print(f'Recruiter API running on http://localhost:{port}')
    server.serve_forever()


if __name__ == '__main__':
    run_server()
