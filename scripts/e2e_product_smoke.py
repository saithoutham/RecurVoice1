#!/usr/bin/env python3
import http.cookiejar
import json
import sys
import time
import urllib.parse
import urllib.request


BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3001"


class Client:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.cookie_jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cookie_jar)
        )

    def request(self, method: str, path: str, payload=None):
        body = None if payload is None else json.dumps(payload).encode()
        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=body,
            headers={"Content-Type": "application/json"},
            method=method,
        )
        with self.opener.open(request, timeout=30) as response:
            raw = response.read().decode()
            return response.getcode(), json.loads(raw) if raw else None

    def get(self, path: str):
        with self.opener.open(f"{self.base_url}{path}", timeout=30) as response:
            return response.getcode(), response.read().decode()


def build_healthy_features():
    features = {
        "f0_mean": 185.0,
        "f0_std": 6.0,
        "hnr_mean": 18.4,
        "jitter_local": 0.0042,
        "jitter_rap": 0.00252,
        "shimmer_local": 2.1,
        "shimmer_apq3": 1.68,
        "spectral_centroid_mean": 1850.0,
        "zero_crossing_rate_mean": 0.082,
        "voiced_frame_ratio": 0.84,
        "snr_db": 24.0,
    }
    for index in range(1, 14):
        features[f"mfcc_{index}"] = -2.0 + index * 0.12
        features[f"mfcc_delta_{index}"] = 0.015 * index
    return features


def features_for_day(day_number: int):
    if day_number <= 7:
        return build_healthy_features()

    features = build_healthy_features()
    features["hnr_mean"] = 1.0
    features["jitter_local"] = 0.75
    features["jitter_rap"] = 0.45
    features["shimmer_local"] = 18.0
    features["shimmer_apq3"] = 14.4
    features["spectral_centroid_mean"] = 3200.0
    features["zero_crossing_rate_mean"] = 0.26
    features["voiced_frame_ratio"] = 0.52
    features["snr_db"] = 13.0
    for index in range(1, 14):
        features[f"mfcc_{index}"] = 0.8 + index * 0.05
        features[f"mfcc_delta_{index}"] = 0.12 + index * 0.01
    return features


def expect(status: int, payload, expected: int, step: str):
    if status != expected:
        raise RuntimeError(f"{step} failed: status={status} payload={payload}")


def main():
    client = Client(BASE_URL)
    email = f"web_e2e_{str(time.time()).replace('.', '')}@example.com"
    password = "RecurVoice123!"
    summary = {
        "base_url": BASE_URL,
        "email": email,
        "page_checks": {},
        "analysis_results": [],
    }

    status, signup = client.request(
        "POST",
        "/api/auth/signup",
        {
            "fullName": "Web E2E User",
            "email": email,
            "password": password,
            "confirmPassword": password,
        },
    )
    expect(status, signup, 200, "signup")
    verify_token = urllib.parse.parse_qs(
        urllib.parse.urlparse(signup["verification_url"]).query
    )["token"][0]

    status, verify = client.request("POST", "/api/auth/verify", {"token": verify_token})
    expect(status, verify, 200, "verify")

    status, profile = client.request(
        "PATCH",
        "/api/profile",
        {
            "profile": {
                "full_name": "Web E2E User",
                "date_of_birth": "1980-01-01",
                "diagnosis_stage": "Stage III",
                "treatment_type": "Radiation",
                "treatment_start_date": "2026-01-01",
                "oncologist_name": "Dr Demo",
                "oncologist_email": "oncologist@example.com",
                "caregiver_name": "Care Giver",
                "caregiver_email": "caregiver@example.com",
                "caregiver_phone": "555-111-2222",
            },
            "consents": [
                "data_collection",
                "not_medical_device",
                "terms_privacy",
            ],
            "onboarding_complete": True,
        },
    )
    expect(status, profile, 200, "profile")

    status, comorbidity = client.request(
        "POST",
        "/api/comorbidity",
        {
            "answers": {
                "heart_attack": False,
                "heart_failure": False,
                "poor_circulation": False,
                "stroke": False,
                "memory_problems": False,
                "chronic_lung_disease": True,
                "rheumatic_disease": False,
                "ulcer": False,
                "mild_liver_disease": False,
                "diabetes_pills": True,
                "diabetes_insulin": False,
                "paralysis": False,
                "kidney_disease": False,
                "other_recent_cancer": False,
                "severe_liver_disease": False,
                "hiv": False,
                "diabetes_organ_damage": False,
                "metastatic_tumor": False,
                "dialysis": False,
            }
        },
    )
    expect(status, comorbidity, 200, "comorbidity")

    status, recurrence_risk = client.request(
        "POST",
        "/api/recurrence-risk",
        {
            "answers": {
                "stage_three_or_four": True,
                "lymph_node_involvement": True,
                "tumor_four_cm_or_larger": False,
                "positive_or_close_margins": False,
                "pleural_or_chest_wall_involvement": False,
                "lymphovascular_invasion": False,
                "multiple_tumors_or_second_primary": False,
                "prior_recurrence_or_residual_disease": False,
            }
        },
    )
    expect(status, recurrence_risk, 200, "recurrence-risk")
    if recurrence_risk.get("profile", {}).get("risk_tier") != "intermediate":
        raise RuntimeError(f"unexpected recurrence risk tier: {recurrence_risk}")

    start_timestamp = time.time() - (20 * 86400)
    baseline_completed = False
    weekly_level_two = False
    weekly_caregiver_notified = False
    weekly_results = []

    for day_number in range(1, 22):
        status, result = client.request(
            "POST",
            "/api/analyze",
            {
                "timestamp": time.strftime(
                    "%Y-%m-%dT%H:%M:%SZ",
                    time.gmtime(start_timestamp + ((day_number - 1) * 86400)),
                ),
                "illness_flag": False,
                "features": features_for_day(day_number),
            },
        )
        expect(status, result, 200, f"analyze day {day_number}")

        sample = {
            "day_number": result.get("day_number"),
            "baseline_complete": result.get("baseline_complete"),
            "alert_level": result.get("alert_level"),
            "cusum_score": result.get("cusum_score"),
            "consecutive_alert_days": result.get("consecutive_alert_days"),
            "caregiver_notified": result.get("caregiver_notified"),
        }
        summary["analysis_results"].append(sample)

        if day_number == 7 and not result.get("baseline_complete"):
            raise RuntimeError(f"baseline did not complete on day 7: {sample}")

        baseline_completed = baseline_completed or bool(result.get("baseline_complete"))

        if day_number == 7:
            status, weekly = client.request(
                "POST",
                "/api/weekly-checkin",
                {
                    "assessed_at": time.strftime(
                        "%Y-%m-%dT%H:%M:%SZ",
                        time.gmtime(start_timestamp + ((day_number - 1) * 86400)),
                    ),
                    "ecog_score": 0,
                    "cough_score": 0,
                    "dyspnea_score": 0,
                    "fatigue_score": 0,
                    "pain_score": 0,
                },
            )
            expect(status, weekly, 200, "weekly-checkin baseline")
            weekly_results.append(weekly)

        if day_number == 18:
            status, weekly = client.request(
                "POST",
                "/api/weekly-checkin",
                {
                    "assessed_at": time.strftime(
                        "%Y-%m-%dT%H:%M:%SZ",
                        time.gmtime(start_timestamp + ((day_number - 1) * 86400)),
                    ),
                    "ecog_score": 2,
                    "cough_score": 2,
                    "dyspnea_score": 2,
                    "fatigue_score": 2,
                    "pain_score": 1,
                },
            )
            expect(status, weekly, 200, "weekly-checkin convergence")
            weekly_results.append(weekly)
            weekly_level_two = (weekly.get("convergence_level") or 0) >= 2
            weekly_caregiver_notified = bool(weekly.get("caregiver_notified"))

    if not baseline_completed:
        raise RuntimeError("baseline never completed")
    if not weekly_level_two:
        raise RuntimeError(f"weekly convergence never reached level 2; weekly_results={weekly_results}")
    if not weekly_caregiver_notified:
        raise RuntimeError(f"caregiver email was not reported on level 2 weekly convergence; weekly_results={weekly_results}")

    for path in [
        "/dashboard",
        "/progress",
        "/trends",
        "/scores",
        "/compare",
        "/alerts",
        "/weekly-checkin",
        "/weekly-history",
        "/recurvoice-ai",
        "/settings",
        "/settings/profile",
        "/settings/caregiver",
        "/settings/notifications",
        "/settings/data",
        "/guide",
        "/terms",
        "/privacy",
    ]:
        status, _ = client.get(path)
        if status != 200:
            raise RuntimeError(f"page check failed for {path}: {status}")
        summary["page_checks"][path] = status

    status, weekly = client.request("POST", "/api/weekly-summary", {})
    expect(status, weekly, 200, "weekly-summary")
    summary["weekly_summary_mode"] = weekly.get("mode")

    status, test_caregiver = client.request("POST", "/api/send-test-caregiver", {})
    expect(status, test_caregiver, 200, "send-test-caregiver")
    summary["test_caregiver_mode"] = test_caregiver.get("mode")
    summary["weekly_results"] = weekly_results

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
