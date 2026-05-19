import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.contact_service import create_contact_message

data = {
    "name": "Local Test",
    "email": "official.vanvasipragatimandal@gmail.com",
    "phone": "0000000000",
    "message": "Testing the DB and Email flow"
}

res = create_contact_message(data)
print("Result:", res)
