# Create your views here.
import requests
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required

import os
FRIEND_SERVICE = os.getenv("FRIEND_SERVICE_URL", "http://localhost:4000")



@require_POST
@login_required
def send_friend_request(request):
    sender_id = request.user.id
    receiver_id = request.POST.get("receiverId")

    res = requests.post(
        f"{FRIEND_SERVICE}/friends/request",
        json={
            "senderId": str(sender_id),
            "receiverId": receiver_id
        }
    )

    return JsonResponse(res.json(), status=res.status_code)
