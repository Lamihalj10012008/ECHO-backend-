import subprocess
import time
import httpx
import os
import sys
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8001"
TEST_DB = "test_echo.db"

def check_server_ready(url: str, timeout: int = 60) -> bool:
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
    # Setup test env
    env = os.environ.copy()
    env["DATABASE_URL"] = f"sqlite:///./{TEST_DB}"
    env["PORT"] = "8001"
    env["HOST"] = "127.0.0.1"
    env["DEBUG"] = "False"

    # Start FastAPI server
    print("[*] Starting backend test server...")
    server_log = open("server_test.log", "w")
    server_process = subprocess.Popen(
        [sys.executable, "main.py"],
        env=env,
        stdout=server_log,
        stderr=server_log,
        cwd=os.getcwd()
    )

    try:
        # Wait for server to boot
        if not check_server_ready(BASE_URL, timeout=60):
            print("[!] Server failed to start within timeout.")
            server_log.close()
            with open("server_test.log", "r") as f:
                print(f"Server Logs:\n{f.read()}")
            return

        print("[+] Test server is up and listening on port 8001")
        
        # Test results tracking
        results = []
        
        def log_test(name, success, info=""):
            status = "PASS" if success else "FAIL"
            status_symbol = "+" if success else "-"
            print(f"[{status_symbol}] {name} - {status} {f'({info})' if info else ''}")
            results.append({"name": name, "success": success, "info": info})

        # Create HTTPX Client
        client = httpx.Client(base_url=BASE_URL)

        # 1. Anonymous health checks
        try:
            res = client.get("/")
            log_test("Root Endpoint", res.status_code == 200, f"Status: {res.status_code}")
        except Exception as e:
            log_test("Root Endpoint", False, str(e))

        try:
            res = client.get("/health")
            log_test("Health Endpoint", res.status_code == 200, f"Status: {res.status_code}")
        except Exception as e:
            log_test("Health Endpoint", False, str(e))

        # 2. Login Tests
        tokens = {}
        users = {
            "student": {"email": "andrea.susanna07@gmail.com", "password": "password"},
            "admin": {"email": "admin@echo.campus", "password": "password"},
            "faculty": {"email": "smith@echo.campus", "password": "password"}
        }

        for role, credentials in users.items():
            try:
                res = client.post("/api/v1/auth/login", json=credentials)
                if res.status_code == 200:
                    tokens[role] = res.json()["access_token"]
                    log_test(f"Login {role.capitalize()}", True)
                else:
                    log_test(f"Login {role.capitalize()}", False, f"Status: {res.status_code}, {res.text}")
            except Exception as e:
                log_test(f"Login {role.capitalize()}", False, str(e))

        if not tokens.get("student") or not tokens.get("admin") or not tokens.get("faculty"):
            print("[!] Essential roles failed to login. Aborting remaining tests.")
            return

        # Header definitions
        student_headers = {"Authorization": f"Bearer {tokens['student']}"}
        admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
        faculty_headers = {"Authorization": f"Bearer {tokens['faculty']}"}

        # 3. Get Me / Refresh Endpoint
        try:
            res = client.get("/api/v1/auth/me", headers=student_headers)
            log_test("Auth Get Me", res.status_code == 200, f"User role: {res.json().get('role')}")
        except Exception as e:
            log_test("Auth Get Me", False, str(e))

        try:
            res = client.post("/api/v1/auth/refresh", headers=student_headers)
            if res.status_code == 200:
                student_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}
                log_test("Auth Refresh Token", True)
            else:
                log_test("Auth Refresh Token", False, f"Status: {res.status_code}")
        except Exception as e:
            log_test("Auth Refresh Token", False, str(e))

        # 4. Register new user
        test_email = f"test_user_{int(time.time())}@echo.campus"
        try:
            register_data = {
                "name": "Test User",
                "email": test_email,
                "phone": "9998887776",
                "password": "testpassword123",
                "role": "student"
            }
            res = client.post("/api/v1/auth/register", json=register_data)
            log_test("Auth Register Student", res.status_code == 201, f"Email: {test_email}")
        except Exception as e:
            log_test("Auth Register Student", False, str(e))

        # 5. Emergency Contacts API
        contact_id = None
        try:
            contact_data = {
                "contact_name": "Guardian Bob",
                "phone_number": "12345678901",
                "relationship": "Father"
            }
            res = client.post("/api/v1/contacts", json=contact_data, headers=student_headers)
            if res.status_code == 201:
                contact_id = res.json()["id"]
                log_test("Create Contact", True, f"Contact ID: {contact_id}")
            else:
                log_test("Create Contact", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("Create Contact", False, str(e))

        if contact_id:
            try:
                res = client.get("/api/v1/contacts", headers=student_headers)
                log_test("Get Contacts", res.status_code == 200, f"Count: {len(res.json())}")
            except Exception as e:
                log_test("Get Contacts", False, str(e))

            try:
                update_data = {"contact_name": "Guardian Bob Senior"}
                res = client.put(f"/api/v1/contacts/{contact_id}", json=update_data, headers=student_headers)
                log_test("Update Contact", res.status_code == 200, f"New name: {res.json().get('contact_name')}")
            except Exception as e:
                log_test("Update Contact", False, str(e))

        # 6. SOS Alerts API
        alert_id = None
        db_alert_id = None
        try:
            alert_data = {
                "emergency_type": "medical",
                "latitude": 28.5355,
                "longitude": 77.3910,
                "location": "Academic Block A",
                "description": "Difficulty breathing"
            }
            res = client.post("/api/v1/sos/alert", json=alert_data, headers=student_headers)
            if res.status_code == 201:
                alert_id = res.json()["alertId"]
                db_alert_id = res.json()["id"]
                log_test("Create SOS Alert", True, f"Alert UUID: {alert_id}, DB ID: {db_alert_id}")
            else:
                log_test("Create SOS Alert", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("Create SOS Alert", False, str(e))

        if db_alert_id:
            try:
                res = client.get("/api/v1/sos/alerts", headers=student_headers)
                log_test("Get User's SOS Alerts", res.status_code == 200, f"Count: {len(res.json())}")
            except Exception as e:
                log_test("Get User's SOS Alerts", False, str(e))

            try:
                res = client.get("/api/v1/sos/alerts/active", headers=admin_headers)
                log_test("Get Active Alerts (Admin)", res.status_code == 200, f"Count: {len(res.json())}")
            except Exception as e:
                log_test("Get Active Alerts (Admin)", False, str(e))

            try:
                res = client.get(f"/api/v1/sos/alerts/{db_alert_id}", headers=student_headers)
                log_test("Get SOS Alert Detail", res.status_code == 200, f"Status: {res.json().get('status')}")
            except Exception as e:
                log_test("Get SOS Alert Detail", False, str(e))

            try:
                update_status = {"status": "help_on_way"}
                res = client.put(f"/api/v1/sos/alerts/{db_alert_id}/status", json=update_status, headers=admin_headers)
                log_test("Update SOS Alert Status (Admin)", res.status_code == 200, f"New Status: {res.json().get('status')}")
            except Exception as e:
                log_test("Update SOS Alert Status (Admin)", False, str(e))

        # 7. Notifications API
        if db_alert_id:
            try:
                res = client.get("/api/v1/notifications", headers=student_headers)
                notifications = res.json()
                log_test("Get Notifications", res.status_code == 200, f"Count: {len(notifications)}")
                
                if len(notifications) > 0:
                    notif_id = notifications[0]["id"]
                    res_mark = client.put(f"/api/v1/notifications/{notif_id}/mark-sent", headers=student_headers)
                    log_test("Mark Notification Sent", res_mark.status_code == 200, f"Notif ID: {notif_id}")
            except Exception as e:
                log_test("Get/Mark Notifications", False, str(e))

            try:
                custom_notif = {
                    "alert_id": db_alert_id,
                    "recipient": "police@campus.edu",
                    "notification_type": "police",
                    "message": "Assistance required"
                }
                res = client.post("/api/v1/notifications/send", json=custom_notif, headers=admin_headers)
                log_test("Send Custom Notification (Admin)", res.status_code == 201, f"Recipient: {res.json().get('recipient')}")
            except Exception as e:
                log_test("Send Custom Notification (Admin)", False, str(e))

        # 8. Tracking API
        if db_alert_id:
            try:
                res = client.get(f"/api/v1/tracking/{db_alert_id}", headers=student_headers)
                log_test("Get Tracking Info", res.status_code == 200, f"Current Status: {res.json().get('current_status')}")
            except Exception as e:
                log_test("Get Tracking Info", False, str(e))

            try:
                res = client.post(f"/api/v1/tracking/{db_alert_id}/assign?officer_name=Officer%20Kramer", headers=admin_headers)
                log_test("Assign Security Officer (Admin)", res.status_code == 200, f"Officer: {res.json().get('assigned_officer')}")
            except Exception as e:
                log_test("Assign Security Officer (Admin)", False, str(e))

            try:
                res = client.post(f"/api/v1/tracking/{db_alert_id}/eta?eta_minutes=7", headers=admin_headers)
                log_test("Set ETA (Admin)", res.status_code == 200, f"ETA: {res.json().get('eta_minutes')} mins")
            except Exception as e:
                log_test("Set ETA (Admin)", False, str(e))

            try:
                res = client.post(f"/api/v1/tracking/{db_alert_id}/arrival", headers=admin_headers)
                log_test("Mark Arrival (Admin)", res.status_code == 200, f"Current Status: {res.json().get('current_status')}")
            except Exception as e:
                log_test("Mark Arrival (Admin)", False, str(e))

            try:
                update_tracking = {"eta_minutes": 0, "current_status": "resolved"}
                res = client.put(f"/api/v1/tracking/{db_alert_id}", json=update_tracking, headers=admin_headers)
                log_test("Update Tracking Details (Admin)", res.status_code == 200, f"New status: {res.json().get('current_status')}")
            except Exception as e:
                log_test("Update Tracking Details (Admin)", False, str(e))

        # 9. Events API (Academic & Event Coordination)
        event_id = None
        try:
            future_date = (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S")
            event_data = {
                "title": "Robotics Seminar",
                "description": "Intro to agents",
                "department": "Computer Science",
                "event_date": future_date,
                "venue": "Seminar Hall 1",
                "expected_attendees": 100
            }
            res = client.post("/api/v1/events/create", json=event_data, headers=faculty_headers)
            if res.status_code == 201:
                event_id = res.json()["id"]
                log_test("Create Event (Faculty)", True, f"Event ID: {event_id}")
            else:
                log_test("Create Event (Faculty)", False, f"Status: {res.status_code}, {res.text}")
        except Exception as e:
            log_test("Create Event (Faculty)", False, str(e))

        # Conflict Event Creation Test
        try:
            future_date = (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%dT%H:%M:%S")
            conflict_data = {
                "title": "AI Seminar",
                "description": "Conflict testing",
                "department": "Electrical Engineering",
                "event_date": future_date,
                "venue": "Seminar Hall 1",  # Same venue, same time
                "expected_attendees": 50
            }
            res = client.post("/api/v1/events/create", json=conflict_data, headers=faculty_headers)
            log_test("Create Event Conflict Validation", res.status_code == 400, f"Status: {res.status_code}, Response: {res.json().get('detail')}")
        except Exception as e:
            log_test("Create Event Conflict Validation", False, str(e))

        if event_id:
            try:
                res = client.get("/api/v1/events/pending", headers=admin_headers)
                log_test("Get Pending Events (Admin)", res.status_code == 200, f"Pending Count: {len(res.json())}")
            except Exception as e:
                log_test("Get Pending Events (Admin)", False, str(e))

            try:
                review_data = {"status": "Approved", "review_comment": "Approved by Admin"}
                res = client.put(f"/api/v1/events/{event_id}/review", json=review_data, headers=admin_headers)
                log_test("Review Event (Admin)", res.status_code == 200, f"Status: {res.json().get('status')}")
            except Exception as e:
                log_test("Review Event (Admin)", False, str(e))

            try:
                res = client.get("/api/v1/events/all", headers=faculty_headers)
                log_test("Get All Events (Faculty)", res.status_code == 200, f"Total Count: {len(res.json())}")
            except Exception as e:
                log_test("Get All Events (Faculty)", False, str(e))

        # Cleanup: Delete Emergency Contact & SOS Alert
        if contact_id:
            try:
                res = client.delete(f"/api/v1/contacts/{contact_id}", headers=student_headers)
                log_test("Delete Contact", res.status_code == 204)
            except Exception as e:
                log_test("Delete Contact", False, str(e))

        if db_alert_id:
            try:
                res = client.delete(f"/api/v1/sos/alerts/{db_alert_id}", headers=student_headers)
                log_test("Cancel SOS Alert", res.status_code == 204)
            except Exception as e:
                log_test("Cancel SOS Alert", False, str(e))

        # Summary of results
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "="*40)
        print("API TESTING SUMMARY")
        print("="*40)
        print(f"Total Tests Run: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print("="*40)

    finally:
        # Stop uvicorn server
        print("[*] Stopping backend test server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()
        print("[+] Test server stopped.")

        try:
            server_log.close()
        except Exception:
            pass

        if os.path.exists("server_test.log"):
            try:
                os.remove("server_test.log")
            except Exception as e:
                print(f"[!] Error deleting server_test.log: {e}")

        # Delete database
        if os.path.exists(TEST_DB):
            try:
                os.remove(TEST_DB)
                print(f"[+] Cleaned up temporary database: {TEST_DB}")
            except Exception as e:
                print(f"[!] Error deleting database {TEST_DB}: {e}")

if __name__ == "__main__":
    run_tests()
