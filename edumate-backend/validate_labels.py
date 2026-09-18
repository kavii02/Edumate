import re, sys
from collections import defaultdict

sql = open(r'C:/Users/Dell/Desktop/Edumate/edumate_70_synthetic_students_dataset.sql', 'r').read()
sp_section = sql[sql.find('student_performance'):]
pattern = r'\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*\'(\w+)\'\)'
matches = re.findall(pattern, sp_section)
rows = []
for m in matches:
    perf_id, student_id, course_id, quiz, att, asgn, risk = m
    rows.append({'student_id': int(student_id), 'quiz_score': float(quiz), 'attendance_pct': float(att), 'assignment_score': float(asgn), 'risk_level': risk})

print(f'Total records: {len(rows)}')
print()

# Apply the tree rules the DT learned
correct = 0
mismatches = []
for r in rows:
    if r['assignment_score'] > 73.97:
        pred = 'Low'
    elif r['quiz_score'] > 50.74:
        pred = 'Medium'
    else:
        pred = 'High'
    if pred == r['risk_level']:
        correct += 1
    else:
        mismatches.append(r | {'rule_pred': pred})

print(f'DT Rule accuracy on all 70 records: {correct}/{len(rows)} = {correct/len(rows)*100:.2f}%')
print(f'Mismatches: {len(mismatches)}')
for m in mismatches:
    print(f'  Stu {m[\"student_id\"]}: quiz={m[\"quiz_score\"]}, att={m[\"attendance_pct\"]}, assign={m[\"assignment_score\"]} | actual={m[\"risk_level\"]} | rule={m[\"rule_pred\"]}')

print()
risk_stats = defaultdict(lambda: {'quiz': [], 'att': [], 'assign': []})
for r in rows:
    risk_stats[r['risk_level']]['quiz'].append(r['quiz_score'])
    risk_stats[r['risk_level']]['att'].append(r['attendance_pct'])
    risk_stats[r['risk_level']]['assign'].append(r['assignment_score'])

for risk in ['Low', 'Medium', 'High']:
    q = risk_stats[risk]['quiz']
    a = risk_stats[risk]['att']
    s = risk_stats[risk]['assign']
    print(f'{risk} ({len(q)}): quiz avg={sum(q)/len(q):.1f} [{min(q):.1f}-{max(q):.1f}] | att avg={sum(a)/len(a):.1f} [{min(a):.1f}-{max(a):.1f}] | assign avg={sum(s)/len(s):.1f} [{min(s):.1f}-{max(s):.1f}]')

print()
print('Attendance overlap check:')
low_att = [r['attendance_pct'] for r in rows if r['risk_level']=='Low']
med_att = [r['attendance_pct'] for r in rows if r['risk_level']=='Medium']
high_att = [r['attendance_pct'] for r in rows if r['risk_level']=='High']
print(f'  Low  att range: {min(low_att):.1f} to {max(low_att):.1f}')
print(f'  Med  att range: {min(med_att):.1f} to {max(med_att):.1f}')
print(f'  High att range: {min(high_att):.1f} to {max(high_att):.1f}')

print()
print('Do any High-risk students score above 60 in quiz?')
for r in rows:
    if r['risk_level']=='High' and r['quiz_score']>55:
        print(f'  Stu {r[\"student_id\"]}: quiz={r[\"quiz_score\"]}, att={r[\"attendance_pct\"]}, assign={r[\"assignment_score\"]}')
