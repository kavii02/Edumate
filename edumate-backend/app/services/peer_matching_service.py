from sqlalchemy import text
from .. import db


def generate_recommendations(student_id):
    # 0. Self-healing synchronization of QuizResult from QuizAttempt for legacy data
    from app.student.models.quiz_attempt_model import QuizAttempt
    from app.student.models.quiz_result_model import QuizResult
    from app.models.quiz_model import QuizQuestion
    
    attempts = QuizAttempt.query.all()
    results = QuizResult.query.all()
    existing_keys = {(r.student_id, r.quiz_id) for r in results}
    
    added_any = False
    for a in attempts:
        if (a.student_id, a.quiz_id) not in existing_keys:
            total_questions = QuizQuestion.query.filter_by(quiz_id=a.quiz_id).count()
            if total_questions == 0:
                total_questions = 5
            
            if a.score > 10:
                percentage = a.score
                score = int(round((a.score / 100) * total_questions))
            else:
                score = int(a.score)
                percentage = round((score / total_questions) * 100, 2)
                
            quiz_result = QuizResult(
                student_id=a.student_id,
                quiz_id=a.quiz_id,
                score=score,
                total_questions=total_questions,
                percentage=percentage,
                feedback="Imported attempt from history.",
                attempted_at=a.attempt_date
            )
            db.session.add(quiz_result)
            existing_keys.add((a.student_id, a.quiz_id))
            added_any = True
            
    if added_any:
        db.session.commit()

    # 1. Fetch all other students from students table
    other_students = db.session.execute(text("""
        SELECT student_id, first_name, last_name, rating, al_stream, grade_level
        FROM students
        WHERE student_id != :sid
    """), {"sid": student_id}).fetchall()

    # 2. Fetch my skills
    my_skills = db.session.execute(text("""
        SELECT skill_id, skill_name, category, skill_level
        FROM skills
        WHERE student_id = :sid
    """), {"sid": student_id}).fetchall()

    # 3. Fetch all other students' skills
    other_skills = db.session.execute(text("""
        SELECT skill_id, student_id, skill_name, category, skill_level
        FROM skills
        WHERE student_id != :sid
    """), {"sid": student_id}).fetchall()

    # Map skills by student_id
    student_skills_map = {}
    for s in other_skills:
        pid = s.student_id
        if pid not in student_skills_map:
            student_skills_map[pid] = []
        student_skills_map[pid].append(s)

    # 4. Fetch my weak areas (Quiz percentage < 70)
    from app.student.models.quiz_result_model import QuizResult
    my_weak_results = db.session.query(QuizResult).filter(QuizResult.student_id == student_id, QuizResult.percentage < 70).all()
    
    weak_topics = set()
    for r in my_weak_results:
        if r.quiz and r.quiz.course:
            weak_topics.add(r.quiz.course.title.lower().strip())
        elif r.quiz:
            weak_topics.add(r.quiz.title.lower().strip())

    # Add my Beginner/Intermediate skills to weak topics
    for s in my_skills:
        if s.skill_level in ("Beginner", "Intermediate"):
            weak_topics.add(s.skill_name.lower().strip())

    LEVELS = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4}
    my_skill_names = {r.skill_name.lower().strip() for r in my_skills}

    matches = []
    for peer in other_students:
        pid = peer.student_id
        name = f"{peer.first_name} {peer.last_name}"
        peer_skills = student_skills_map.get(pid, [])

        # Calculate peer's strong field based on their best quiz mark (QuizResult.percentage)
        peer_best_res = db.session.query(QuizResult).filter(QuizResult.student_id == pid).order_by(QuizResult.percentage.desc()).first()
        if peer_best_res and peer_best_res.quiz:
            if peer_best_res.quiz.course:
                peer_strong_field = peer_best_res.quiz.course.title.split('(')[0].strip()
            else:
                peer_strong_field = peer_best_res.quiz.title
        else:
            peer_strong_field = peer.al_stream or (peer_skills[0].category if peer_skills else "General ICT")

        # Determine peer's excelled topics (Quiz percentage >= 80)
        peer_excelled_topics = set()
        peer_excelled_results = db.session.query(QuizResult).filter(QuizResult.student_id == pid, QuizResult.percentage >= 80).all()
        for r in peer_excelled_results:
            if r.quiz and r.quiz.course:
                peer_excelled_topics.add(r.quiz.course.title.lower().strip())
            elif r.quiz:
                peer_excelled_topics.add(r.quiz.title.lower().strip())

        # Also add their Expert/Advanced skills to their excelled topics
        for s in peer_skills:
            if s.skill_level in ("Advanced", "Expert"):
                peer_excelled_topics.add(s.skill_name.lower().strip())

        # Check if they excelled in any area where the student is weak
        matched_weaknesses = weak_topics & peer_excelled_topics
        is_suggested = False
        reason = "Collaborate on common study areas"
        score = 0
        best_teach_skill = None
        best_teach_id = None

        if matched_weaknesses:
            is_suggested = True
            topic_name = list(matched_weaknesses)[0].title()
            best_teach_skill = topic_name
            for ts in peer_skills:
                if ts.skill_name.lower().strip() == topic_name.lower():
                    best_teach_id = ts.skill_id
                    break
            score += 60
            reason = f"Excelled in {topic_name}, which matches one of your weak areas."

        # Synergy calculations
        if my_skills and peer_skills:
            for their_skill in peer_skills:
                for mine in my_skills:
                    if their_skill.skill_name.lower().strip() not in my_skill_names:
                        score += 20
                        if best_teach_skill is None:
                            best_teach_skill = their_skill.skill_name
                            best_teach_id = their_skill.skill_id

                    their_level = LEVELS.get(their_skill.skill_level, 1)
                    my_level = LEVELS.get(mine.skill_level, 1)
                    if abs(their_level - my_level) <= 1:
                        score += 10
        
        # Defaults if no calculation occurred
        if score == 0 or not best_teach_skill:
            score = 50
            if peer_skills:
                best_teach_skill = peer_skills[0].skill_name
                best_teach_id = peer_skills[0].skill_id
            else:
                best_teach_skill = peer_strong_field
                best_teach_id = 1

        # If they are not suggested yet, but they have high overall score and we have no weak topics
        if not is_suggested and score >= 60 and any(s.skill_level in ("Advanced", "Expert") for s in peer_skills):
            if not weak_topics:
                is_suggested = True
                reason = f"Expert in {best_teach_skill}, ready to help you learn."

        my_best_res = db.session.query(QuizResult).filter(QuizResult.student_id == student_id).order_by(QuizResult.percentage.desc()).first()
        if my_best_res and my_best_res.quiz:
            if my_best_res.quiz.course:
                my_offer_name = my_best_res.quiz.course.title.split('(')[0].strip()
            else:
                my_offer_name = my_best_res.quiz.title
        else:
            my_offer_name = my_skills[0].skill_name if my_skills else "General ICT"

        matches.append({
            "student_id": pid,
            "peer_name": name,
            "score": min(score, 100),
            "score_label": f"{min(score, 100)}% Match" if score == 50 else f"{min(score, 100)}% Synergy Match",
            "can_teach": best_teach_skill,
            "teach_skill_id": best_teach_id,
            "wants": my_offer_name,
            "avatar": name[0].upper() if name else "?",
            "rating": float(peer.rating) if peer.rating is not None else 0.0,
            "al_stream": peer_strong_field,
            "grade_level": peer.grade_level or "Grade 12",
            "is_suggested": is_suggested,
            "reason": reason
        })

    # Sort matches by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches
