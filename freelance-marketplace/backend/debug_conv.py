"""
Temporary script to debug the conversation idempotence query.
Run with: python manage.py shell < debug_conv.py
Delete this file after debugging.
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.messaging.models import Conversation

User = get_user_model()

# Clean slate for debugging
Conversation.objects.all().delete()
User.objects.filter(username__in=["_dbg_a", "_dbg_b", "_dbg_c"]).delete()

u1 = User.objects.create_user(
    username="_dbg_a", email="_a@example.com", password="Pass1234!", role="FREELANCER"
)
u2 = User.objects.create_user(
    username="_dbg_b", email="_b@example.com", password="Pass1234!", role="EMPLOYER"
)
u3 = User.objects.create_user(
    username="_dbg_c", email="_c@example.com", password="Pass1234!", role="FREELANCER"
)

# Create one conversation between u1 and u2
conv = Conversation.objects.create()
conv.participants.add(u1, u2)
print(f"Created conversation id={conv.id} between {u1.username} and {u2.username}")

# --- Test 1: chained filters (should be broken) ---
q1 = Conversation.objects.filter(participants=u1).filter(participants__id=u2.id)
print(f"\nTest 1 (chained filter, chained .filter): count = {q1.count()}")
print(f"  SQL: {q1.query}")

# --- Test 2: single filter with both kwargs ---
q2 = Conversation.objects.filter(participants=u1, participants__id=u2.id)
print(f"\nTest 2 (single filter, both kwargs): count = {q2.count()}")
print(f"  SQL: {q2.query}")

# --- Test 3: single filter + annotate + distinct Count ---
q3 = (
    Conversation.objects.filter(participants=u1, participants__id=u2.id)
    .annotate(pcount=__import__("django.db.models", fromlist=["Count"]).Count("participants", distinct=True))
    .filter(pcount=2)
)
print(f"\nTest 3 (single filter + annotate pcount): count = {q3.count()}")
print(f"  SQL: {q3.query}")

# --- Test 4: check what a fresh instance looks like when u2 initiates ---
q4 = Conversation.objects.filter(participants=u2).filter(participants__id=u1.id)
print(f"\nTest 4 (reversed participants, chained): count = {q4.count()}")

q5 = Conversation.objects.filter(participants=u2, participants__id=u1.id)
print(f"Test 5 (reversed participants, single filter): count = {q5.count()}")

# Cleanup
Conversation.objects.all().delete()
User.objects.filter(username__in=["_dbg_a", "_dbg_b", "_dbg_c"]).delete()
print("\nCleaned up debug data.")