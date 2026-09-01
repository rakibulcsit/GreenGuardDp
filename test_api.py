import urllib.request
import urllib.error
import json

lat = 23.7104
lon = 90.4074
url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide&hourly=us_aqi,pm2_5,pm10&forecast_days=7&timezone=auto"

print(f"Querying URL: {url}")
try:
    with urllib.request.urlopen(url) as response:
        status = response.getcode()
        body = response.read().decode('utf-8')
        print(f"Status: {status}")
        print("Body (first 500 chars):", body[:500])
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.reason}")
    print("Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
