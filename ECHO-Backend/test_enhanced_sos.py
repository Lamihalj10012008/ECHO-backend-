"""
Integration tests for the Enhanced SOS Alert System.
Spins up a test server on port 8002, runs tests against all endpoints, and prints the results.
"""

import os
import sys
import time
import httpx
import subprocess
from datetime import datetime

BASE_URL = "http://127.0.0.1:8002"
TEST_DB = "test_echo_enhanced.db"

def check_server_ready(url: str, timeout: int = 30) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = httpx.get(f"{url}/health")
            if response.status_code == 200:
                return True
        except httpx.RequestError:
            pass
        time.sleep(0.5)
    return False

def run_tests():
    # Setup test database and environment variables
    env = os.environ.copy()
    env["DATABASE_URL"] = f"sqlite:///./{TEST_DB}"
    env["PORT"] = "8002"
    env["HOST"] = "127.0.0.1"
    env["DEBUG"] = "False"

    # Start FastAPI test server
    print("[*] Starting backend test server on port 8002...")
    server_log = open("server_enhanced_test.log", "w")
    server_process = subprocess.Popen(
        [sys.executable, "main.py"],
        env=env,
        stdout=server_log,
        stderr=server_log,
        cwd=os.getcwd()
    )

    try:
        # Wait for server to boot
        if not check_server_ready(BASE_URL, timeout=30):
            print("[!] Server failed to start within timeout.")
            server_log.close()
            with open("server_enhanced_test.log", "r") as f:
                print(f"Server Logs:\n{f.read()}")
            return

        print("[+] Test server is up. Running test suite...")
        
        # Test results tracking
        results = []
        
        def log_test(name, success, info=""):
            status = "PASS" if success else "FAIL"
            status_symbol = "[+]" if success else "[-]"
            print(f"{status_symbol} {name} - {status} {f'({info})' if info else ''}")
            results.append({"name": name, "success": success, "info": info})

        client = httpx.Client(base_url=BASE_URL)

        # 1. Login
        tokens = {}
        try:
            res = client.post("/api/v1/auth/login", json={
                "email": "andrea.susanna07@gmail.com",
                "password": "password"
            })
            if res.status_code == 200:
                tokens["student"] = res.json()["access_token"]
                log_test("Login Student", True)
            else:
                log_test("Login Student", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("Login Student", False, str(e))

        try:
            res = client.post("/api/v1/auth/login", json={
                "email": "admin@echo.campus",
                "password": "password"
            })
            if res.status_code == 200:
                tokens["admin"] = res.json()["access_token"]
                log_test("Login Admin", True)
            else:
                log_test("Login Admin", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("Login Admin", False, str(e))

        if not tokens.get("student") or not tokens.get("admin"):
            print("[!] Essential roles failed to login. Aborting remaining tests.")
            return

        student_headers = {"Authorization": f"Bearer {tokens['student']}"}
        admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}

        # 2. Test GET /api/contacts
        try:
            res = client.get("/api/contacts", headers=student_headers)
            log_test("GET Contacts", res.status_code == 200, f"Contacts count: {len(res.json())}")
        except Exception as e:
            log_test("GET Contacts", False, str(e))

        # 3. Test POST /api/contacts (Add new contact)
        contact_id = None
        try:
            res = client.post("/api/contacts", headers=student_headers, json={
                "contact_name": "Test Father",
                "phone_number": "+91-9876543210",
                "relationship": "Parent"
            })
            if res.status_code == 201:
                contact_id = res.json()["id"]
                log_test("POST Add Contact", True, f"ID: {contact_id}")
            else:
                log_test("POST Add Contact", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("POST Add Contact", False, str(e))

        # 4. Test duplicate prevention (POST same number, expect update instead of duplicate)
        try:
            res = client.post("/api/contacts", headers=student_headers, json={
                "contact_name": "Test Father Updated",
                "phone_number": "+91 9876 543 210",  # formatting shouldn't matter
                "relationship": "Guardian"
            })
            if res.status_code == 201:
                updated_contact = res.json()
                is_correct = (updated_contact["id"] == contact_id and 
                              updated_contact["contact_name"] == "Test Father Updated" and
                              updated_contact["relationship"] == "Guardian")
                log_test("Duplicate Phone Protection (In-place Update)", is_correct, 
                         f"ID: {updated_contact['id']}, Name: {updated_contact['contact_name']}")
            else:
                log_test("Duplicate Phone Protection (In-place Update)", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("Duplicate Phone Protection (In-place Update)", False, str(e))

        # 5. Test phone number validation (POST invalid format, expect 400)
        try:
            res = client.post("/api/contacts", headers=student_headers, json={
                "contact_name": "Invalid Phone",
                "phone_number": "123456789a",  # 10 chars (bypasses Pydantic min_length=10) but has letter 'a' (fails regex)
                "relationship": "Friend"
            })
            log_test("Phone Format Validation", res.status_code == 400, f"Status: {res.status_code}")
        except Exception as e:
            log_test("Phone Format Validation", False, str(e))

        # 6. Test PUT /api/contacts/{id}
        try:
            res = client.put(f"/api/contacts/{contact_id}", headers=student_headers, json={
                "contact_name": "Test Father Final",
                "phone_number": "+91-9876543210",
                "relationship": "Parent"
            })
            if res.status_code == 200:
                log_test("PUT Update Contact", res.json()["contact_name"] == "Test Father Final")
            else:
                log_test("PUT Update Contact", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("PUT Update Contact", False, str(e))

        # 7. Test POST /api/sos/trigger
        alert_db_id = None
        alert_uid = None
        try:
            res = client.post("/api/sos/trigger", headers=student_headers, json={
                "emergency_type": "medical",
                "latitude": 12.9720,
                "longitude": 77.5950,
                "location": "Central Library"
            })
            if res.status_code == 201:
                data = res.json()
                alert_db_id = data["id"]
                alert_uid = data["alert_id"]
                log_test("POST Trigger SOS Alert", True, f"DB ID: {alert_db_id}, UID: {alert_uid}, Office: {data.get('nearest_security_office')}")
            else:
                log_test("POST Trigger SOS Alert", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("POST Trigger SOS Alert", False, str(e))

        # 8. Test GET /api/sos/history
        try:
            res = client.get("/api/sos/history", headers=student_headers)
            if res.status_code == 200:
                history = res.json()
                found = any(a["alert_id"] == alert_uid for a in history)
                log_test("GET SOS History", found, f"History size: {len(history)}")
            else:
                log_test("GET SOS History", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("GET SOS History", False, str(e))

        # 9. Test GET /api/sos/{id} (alphanumeric search)
        try:
            res = client.get(f"/api/sos/{alert_uid}", headers=student_headers)
            if res.status_code == 200:
                log_test("GET Alert by Alphanumeric UID", res.json()["id"] == alert_db_id)
            else:
                log_test("GET Alert by Alphanumeric UID", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("GET Alert by Alphanumeric UID", False, str(e))

        # 10. Test GET /api/sos/live-status/{id}
        try:
            res = client.get(f"/api/sos/live-status/{alert_uid}", headers=student_headers)
            if res.status_code == 200:
                data = res.json()
                notifs = data.get("notifications", [])
                log_test("GET SOS Live Status & Logs", True, f"Status: {data.get('status')}, Notifications queued: {len(notifs)}")
            else:
                log_test("GET SOS Live Status & Logs", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("GET SOS Live Status & Logs", False, str(e))

        # 11. Test POST /api/sos/{id}/escalate
        try:
            res = client.post(f"/api/sos/{alert_uid}/escalate", headers=student_headers)
            if res.status_code == 200:
                log_test("POST Escalate SOS (Level 2 -> Level 3)", res.json()["escalation_level"] == 3)
            else:
                log_test("POST Escalate SOS (Level 2 -> Level 3)", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("POST Escalate SOS (Level 2 -> Level 3)", False, str(e))

        # 12. Test GET /api/notifications/history
        try:
            res = client.get("/api/notifications/history", headers=student_headers)
            if res.status_code == 200:
                logs = res.json()
                log_test("GET Notification History", len(logs) > 0, f"Logs size: {len(logs)}")
            else:
                log_test("GET Notification History", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("GET Notification History", False, str(e))

        # 13. Test DELETE /api/contacts/{id}
        try:
            res = client.delete(f"/api/contacts/{contact_id}", headers=student_headers)
            log_test("DELETE Contact", res.status_code == 204)
        except Exception as e:
            log_test("DELETE Contact", False, str(e))

        # 14. Test Rate Limiting (Flood trigger, expect 429)
        rate_limited = False
        print("[*] Flood triggering SOS alerts to verify Rate Limiting (expecting 429)...")
        for i in range(10):
            try:
                res = client.post("/api/sos/trigger", headers=student_headers, json={
                    "emergency_type": "fire",
                    "latitude": 12.9720,
                    "longitude": 77.5950,
                    "location": "Central Library"
                })
                if res.status_code == 429:
                    rate_limited = True
                    break
            except Exception:
                pass
        log_test("API Rate Limiting (429)", rate_limited)

        # Print final summary
        print("\n=== TEST RESULTS SUMMARY ===")
        passed = sum(1 for r in results if r["success"])
        total = len(results)
        print(f"Passed: {passed}/{total} ({passed/total*100:.1f}%)")
        
    finally:
        # Shutdown test server
        print("[*] Shutting down backend test server...")
        server_process.terminate()
        server_process.wait()
        server_log.close()
        
        # Clean up database
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
                os.remove(f"{TEST_DB}-shm")
                os.remove(f"{TEST_DB}-wal")
            except Exception:
                pass

if __name__ == "__main__":
    run_tests()
