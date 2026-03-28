# Sample Incident Descriptions for Testing

Copy and paste these into the app to test different scenarios.

---

## 1. Verbal Harassment in Study Group (High Severity)

Last Tuesday evening in Torgersen Hall, third floor, I was in a study group with four other students when one of them started making racially charged remarks directed at me. The comments were made openly, in front of everyone in the group. No one said anything. I felt unsafe and left early. I want to document what happened and understand what my options are.

---

## 2. Online Harassment (Medium Severity)

Over the past week, I've been receiving hateful messages on a class Discord server. The messages contain slurs related to my sexual orientation. Multiple people have seen them but the moderators haven't done anything. I have screenshots but I'm not sure who to report this to or what protections I have.

---

## 3. Classroom Incident (Medium Severity)

During a lecture last Wednesday in McBryde Hall, a student made a joke that mocked my religion. Several people laughed. The professor didn't address it. I felt humiliated and had trouble focusing for the rest of class. I'm not sure if this counts as something I can report or if it's just something I need to deal with.

---

## 4. Physical Intimidation (High Severity)

Yesterday afternoon near the drill field, a group of students surrounded me and made threatening comments about my ethnicity. They didn't touch me but they blocked my path and one of them stepped very close to my face. I felt physically threatened. I managed to walk away but I'm worried about running into them again. I don't know their names.

---

## 5. Exclusion from Group Project (Low Severity)

In my engineering class, I was assigned to a group project. After the first meeting, the other group members created a group chat without me and have been meeting without telling me. When I asked about it, one of them said they "didn't think I'd fit in" and made a comment about my accent. I'm worried this will affect my grade and I don't know if this is something I can report.

---

## 6. Graffiti in Dorm (Medium Severity)

Someone wrote a homophobic slur on the whiteboard outside my dorm room. This is the third time it's happened this semester. I've reported it to my RA each time but nothing has changed. I don't feel safe in my own building. I want to know what my options are beyond just talking to the RA.

---

## 7. Discriminatory Comment from TA (Medium Severity)

During office hours last Friday, a teaching assistant made a comment suggesting that students from my country "usually cheat on exams." I was the only international student in the room. Other students heard it. I didn't say anything at the time because I was shocked. Now I'm worried about how this TA will grade my work.

---

## 8. Exclusion from Social Event (Low Severity)

My club is having a social event this weekend. When I asked about it, the president said it was "members only" even though I've been a member for two semesters. Later I found out they're inviting people who just joined. I overheard someone say they didn't want me there because of my disability. I'm not sure if this is worth reporting or if I'm overreacting.

---

## Testing Tips

- **High severity incidents** should trigger red severity indicators in the Documenter output
- **Different bias categories** (race, religion, sexual orientation, disability, etc.) should be correctly identified
- **Different incident types** (verbal, physical, written, online) should be categorized properly
- **Location and date context** should be extracted even when vague ("last week", "near the drill field")
- **Policy matching** should vary — Title IX for gender/sexual orientation, Bias Response Team for race/ethnicity/religion, etc.

---

## What NOT to Include (PII Test Cases)

If you want to test the PII detection, try adding these (they should be rejected):

- Email: "My email is student@vt.edu"
- Phone: "You can reach me at 540-555-1234"
- VT PID: "My PID is ab12345"
- Name: "My name is John Smith"

The backend should reject these with: "Your description appears to contain personal information. Please remove names, email addresses, or ID numbers before submitting."
