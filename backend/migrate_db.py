
import sqlite3
import os

db_path = 'e:/SMILE-AI/backend/smile_ai.db'

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    def add_column_if_missing(table, column, type_def, default=None):
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [row[1] for row in cursor.fetchall()]
        if column not in columns:
            print(f"Adding {column} to {table}...")
            default_val = f" DEFAULT {default}" if default is not None else ""
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}{default_val}")

    try:
        # Users
        add_column_if_missing('users', 'wellness_level', 'INTEGER', 1)
        add_column_if_missing('users', 'wellness_points', 'INTEGER', 0)
        
        # Journal Entries
        add_column_if_missing('journal_entries', 'smile_risk_index', 'FLOAT')
        add_column_if_missing('journal_entries', 'risk_level', 'VARCHAR(20)')
        add_column_if_missing('journal_entries', 'is_crisis', 'BOOLEAN', 0)
        add_column_if_missing('journal_entries', 'fusion_details', 'TEXT')
        add_column_if_missing('journal_entries', 'title', 'VARCHAR(200)')
        add_column_if_missing('journal_entries', 'self_reported_mood', 'VARCHAR(50)')

        # Assessments
        add_column_if_missing('assessments', 'screen_time', 'FLOAT')
        add_column_if_missing('assessments', 'gaming_hours', 'FLOAT')
        add_column_if_missing('assessments', 'financial_stress', 'INTEGER')
        add_column_if_missing('assessments', 'family_history', 'BOOLEAN')
        add_column_if_missing('assessments', 'academic_pressure', 'INTEGER')
        add_column_if_missing('assessments', 'gaming_behavior_score', 'INTEGER')
        add_column_if_missing('assessments', 'social_media_addiction', 'INTEGER')
        add_column_if_missing('assessments', 'academic_workload', 'INTEGER')
        add_column_if_missing('assessments', 'peer_pressure', 'INTEGER')
        add_column_if_missing('assessments', 'exam_anxiety', 'INTEGER')

        # New Table: daily_mission_progress
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_mission_progress'")
        if not cursor.fetchone():
            print("Creating daily_mission_progress table...")
            cursor.execute("""
                CREATE TABLE daily_mission_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    mission_title VARCHAR(200) NOT NULL,
                    is_completed BOOLEAN DEFAULT 1,
                    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            """)

        conn.commit()
        print("Comprehensive migration successful.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
