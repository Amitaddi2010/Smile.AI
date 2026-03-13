
import sys
import os
from datetime import datetime

# Add the project root to sys.path
sys.path.append('e:/SMILE-AI/backend')

from app.database import SessionLocal
from app.models.user import JournalEntry, User
from app.schemas.schemas import JournalEntryResponse

def test_journal_history():
    db = SessionLocal()
    try:
        print("--- Diagnostic Start ---")
        # Find any user with journal entries
        entries = db.query(JournalEntry).limit(10).all()
        if not entries:
            print("No journal entries found in database to test.")
            return

        print(f"Found {len(entries)} entries. Starting validation check...")
        
        for entry in entries:
            try:
                # Check raw fields
                print(f"\nEntry ID: {entry.id}")
                print(f"  is_crisis: {entry.is_crisis} (type: {type(entry.is_crisis)})")
                print(f"  smile_risk_index: {entry.smile_risk_index}")
                
                # Test Pydantic validation
                pydantic_entry = JournalEntryResponse.model_validate(entry)
                print(f"  Pydantic Validation: SUCCESS")
                print(f"  Validated Output: {pydantic_entry.model_dump()}")
            except Exception as e:
                print(f"  Pydantic Validation: FAILED")
                print(f"  Error: {str(e)}")
                
        print("\n--- Diagnostic End ---")
    finally:
        db.close()

if __name__ == "__main__":
    test_journal_history()
