from sqlalchemy import text
from app import db


def generate_recommendations(student_id):
    my_skills = db.session.execute(text("""
        SELECT skill_id, skill_name, category, skill_level
        FROM skills
        WHERE student_id = :sid
    """), {"sid": student_id}).fetchall()

    other_skills = db.session.execute(text("""
        SELECT
            s.skill_id,
            s.student_id,
            s.skill_name,
            s.category,
            s.skill_level,
            CONCAT(st.first_name, ' ', st.last_name) AS peer_name
        FROM skills s
        JOIN students st ON s.student_id = st.student_id
        WHERE s.student_id != :sid
    """), {"sid": student_id}).fetchall()

    if not my_skills:
        return []

    LEVELS = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4}

    my_skill_names = {r.skill_name for r in my_skills}

    peer_map = {}
    for row in other_skills:
        pid = row.student_id
        if pid not in peer_map:
            peer_map[pid] = {
                "student_id": pid,
                "peer_name": row.peer_name,
                "skills": []
            }
        peer_map[pid]["skills"].append({
            "skill_id": row.skill_id,
            "skill_name": row.skill_name,
            "skill_level": row.skill_level,
            "category": row.category
        })

    matches = []
    for pid, peer in peer_map.items():
        score = 0
        best_teach_skill = None
        best_teach_id = None

        for their_skill in peer["skills"]:
            for mine in my_skills:
                if their_skill["skill_name"] not in my_skill_names:
                    score += 40
                    if best_teach_skill is None:
                        best_teach_skill = their_skill["skill_name"]
                        best_teach_id = their_skill["skill_id"]

                their_level = LEVELS.get(their_skill["skill_level"], 1)
                my_level = LEVELS.get(mine.skill_level, 1)
                if abs(their_level - my_level) <= 1:
                    score += 20

        if score > 0 and best_teach_skill:
            my_offer = my_skills[0]
            name = peer["peer_name"]
            matches.append({
                "student_id": pid,
                "peer_name": name,
                "score": min(score, 100),
                "score_label": f"{min(score, 100)}% Synergy Match",
                "can_teach": best_teach_skill,
                "teach_skill_id": best_teach_id,
                "wants": my_offer.skill_name,
                "avatar": name[0].upper() if name else "?"
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches[:5]
