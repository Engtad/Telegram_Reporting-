import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get token from .env
TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

if not TOKEN:
    print("❌ ERROR: TELEGRAM_BOT_TOKEN not found in .env file")
    print("📝 Create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here")
    exit(1)

print(f"✅ Token found: {TOKEN[:10]}...{TOKEN[-5:]}")

# Test connection to Telegram API
try:
    url = f"https://api.telegram.org/bot{TOKEN}/getMe"
    response = requests.get(url)
    data = response.json()
    
    if data.get('ok'):
        bot_info = data['result']
        print(f"\n✅ SUCCESS! Bot connected:")
        print(f"   Bot Name: @{bot_info['username']}")
        print(f"   Bot ID: {bot_info['id']}")
        print(f"   Bot First Name: {bot_info['first_name']}")
    else:
        print(f"\n❌ FAILED: {data.get('description', 'Unknown error')}")
        
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("Make sure you have internet connection and valid token")
