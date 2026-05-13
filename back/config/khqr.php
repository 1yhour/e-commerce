<?php

// config/khqr.php
//
// ── Development .env (mock mode ON) ─────────────────────────────────────────
//
//   BAKONG_MOCK_MODE=true
//   BAKONG_MOCK_AUTO_PAY_SECONDS=15
//
//   # These are not used in mock mode but set them anyway for when you go live:
//   BAKONG_ACCOUNT_ID=dev_mock@devb
//   BAKONG_MERCHANT_NAME="DEV STORE"
//   BAKONG_MERCHANT_CITY="Phnom Penh"
//
// ── Production .env (real Bakong API) ────────────────────────────────────────
//
//   BAKONG_MOCK_MODE=false
//   BAKONG_ACCOUNT_ID=012345678@aclb          # from your Bakong app profile
//   BAKONG_MERCHANT_NAME="YOUR STORE NAME"
//   BAKONG_MERCHANT_CITY="Phnom Penh"
//   BAKONG_API_TOKEN=eyJhbGci...              # from api-bakong.nbc.gov.kh/register
//   BAKONG_API_BASE=https://api-bakong.nbc.gov.kh
//   BAKONG_QR_TTL_MINUTES=10                 # max 10 per NBC spec

return [
    'bakong_account_id'     => env('BAKONG_ACCOUNT_ID', 'dev_mock@devb'),
    'merchant_name'         => env('BAKONG_MERCHANT_NAME', 'DEV STORE'),
    'merchant_city'         => env('BAKONG_MERCHANT_CITY', 'Phnom Penh'),
    'api_token'             => env('BAKONG_API_TOKEN', ''),
    'api_base'              => env('BAKONG_API_BASE', 'https://api-bakong.nbc.gov.kh'),
    'qr_ttl_minutes'        => env('BAKONG_QR_TTL_MINUTES', 10),

    // ── Mock mode ─────────────────────────────────────────────────────────────
    // Set BAKONG_MOCK_MODE=true in development.
    // The service auto-confirms payment after BAKONG_MOCK_AUTO_PAY_SECONDS.
    'mock_mode'             => env('BAKONG_MOCK_MODE', false),
    'mock_auto_pay_seconds' => env('BAKONG_MOCK_AUTO_PAY_SECONDS', 15),
];