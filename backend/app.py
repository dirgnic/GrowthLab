from flask import Flask, jsonify, request
from flask_cors import CORS
from challenges import get_all_challenges, get_challenge_by_id
from tools import build_admin_audit_report, generate_creatives

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/challenges', methods=['GET'])
def challenges():
    """Get all challenges"""
    return jsonify(get_all_challenges())

@app.route('/api/challenges/<challenge_id>', methods=['GET'])
def challenge(challenge_id):
    """Get a specific challenge by ID"""
    ch = get_challenge_by_id(challenge_id)
    if ch:
        return jsonify(ch)
    return jsonify({'error': 'Challenge not found'}), 404

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

@app.route('/api/tools/admin-audit/report', methods=['POST'])
def admin_audit_report():
    payload = request.get_json(silent=True) or {}
    responses = payload.get("responses") or {}
    return jsonify(build_admin_audit_report(responses))

@app.route('/api/tools/creative/generate', methods=['POST'])
def creative_generate():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    return jsonify(generate_creatives(inputs))

if __name__ == '__main__':
    app.run(debug=True, port=8000)
