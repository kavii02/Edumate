from .admin import Admin
from .admin_verification_code import AdminVerificationCode
from .skill import Skill
from .skill_request import SkillRequest
from .skill_message import SkillMessage
from .skill_recommendation import SkillRecommendation
from ..student.models.student_model import Student, PendingStudent
from .course_model import Course, Tutor
from .quiz_model import Quiz, QuizQuestion
from ..student.models.enrollment_model import Enrollment
from ..student.models.quiz_result_model import QuizResult
from ..student.models.quiz_attempt_model import QuizAttempt
from ..student.models.study_planner_model import StudyPlanner
from ..student.models.attendance_model import AttendanceRecord
from .course_material_model import CourseMaterial