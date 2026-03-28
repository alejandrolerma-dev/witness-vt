"""
VT Policy Knowledge Base — used by the Advisor agent to match incidents
to the correct Virginia Tech policy, office, and student rights.

Each policy entry includes:
  - category: internal classification tag
  - office: full name of the responsible office
  - phone: contact phone number (if applicable)
  - email: contact email (if applicable)
  - url: canonical web link for the office / reporting form
  - process: step-by-step description of the reporting and resolution process
  - timeline: expected response / resolution timeline
  - student_rights: list of rights the student has under this policy
  - what_students_miss: commonly overlooked information
"""

VT_POLICIES = [
    {
        "id": "academic_honor_code",
        "name": "Academic Honor Code Violation",
        "category": "academic_misconduct",
        "office": "Office of Academic Integrity, 370 Burruss Hall",
        "phone": "540-231-9741",
        "url": "https://honorsystem.vt.edu",
        "process": (
            "Student submits report via academicintegrity.vt.edu -> "
            "Faculty member investigates -> Honor System hearing if unresolved -> "
            "Sanctions range from grade penalty to expulsion"
        ),
        "timeline": "Initial response within 5 business days",
        "student_rights": [
            "Right to hear charges",
            "Right to present evidence",
            "Right to appeal decision",
            "Right to have an advisor present",
        ],
        "what_students_miss": (
            "You can report anonymously as a witness even if you're not the victim."
        ),
    },
    {
        "id": "title_ix_sexual_harassment",
        "name": "Title IX — Sexual Harassment / Assault",
        "category": "title_ix",
        "office": "Title IX Coordinator, 210 Burruss Hall",
        "phone": "540-231-9573",
        "email": "titleix@vt.edu",
        "url": "https://safe.vt.edu",
        "process": (
            "Report to Title IX office -> Supportive measures offered immediately -> "
            "Formal or informal resolution options -> Investigation if formal -> Appeal available"
        ),
        "timeline": "Resolution within 60-90 days for formal process",
        "student_rights": [
            "Right to an advisor",
            "Right to equal access to evidence",
            "Right to appeal",
            "Right to supportive measures regardless of whether you file formally",
        ],
        "what_students_miss": (
            "Reporting does NOT automatically start a formal investigation — "
            "you control whether to proceed."
        ),
    },
    {
        "id": "bias_incident",
        "name": "Bias Incident Reporting",
        "category": "bias_discrimination",
        "office": "Bias Intervention and Response Team (BIRT)",
        "url": "https://inclusive.vt.edu/birt",
        "process": (
            "Submit report online -> BIRT reviews within 2 business days -> "
            "Outreach to affected party -> Educational or disciplinary response depending on severity"
        ),
        "timeline": "Initial outreach within 2 business days",
        "student_rights": [
            "Can report anonymously",
            "Can request no contact with respondent",
            "Can request follow-up on outcome",
        ],
        "what_students_miss": (
            "Bias incidents don't have to be criminal to be reportable — "
            "microaggressions, exclusion, and hostile environments all qualify."
        ),
    },
    {
        "id": "racial_discrimination",
        "name": "Racial Discrimination",
        "category": "bias_discrimination",
        "office": "Office for Equity and Accessibility, 241 University City Blvd",
        "phone": "540-231-2010",
        "url": "https://oea.vt.edu/harassment-discrimination.html",
        "process": (
            "File complaint with OEA -> Intake meeting within 10 days -> "
            "Investigation -> Written findings -> Appeal available"
        ),
        "timeline": "Investigation completed within 60 days when possible",
        "student_rights": [
            "Right to written notice of allegations",
            "Right to respond",
            "Right to appeal findings",
            "Right to know outcome",
        ],
        "what_students_miss": (
            "You can file with both VT's OEA and externally with the "
            "US Department of Education Office for Civil Rights simultaneously."
        ),
    },
    {
        "id": "disability_discrimination",
        "name": "Disability Discrimination",
        "category": "bias_discrimination",
        "office": "Services for Students with Disabilities + Office for Equity and Accessibility",
        "phone": "540-231-3788",
        "url": "https://oea.vt.edu/harassment-discrimination.html",
        "process": (
            "Report to SSD or OEA -> Investigation -> "
            "Remediation including retroactive accommodations"
        ),
        "timeline": "Varies based on complexity",
        "student_rights": [
            "Right to reasonable accommodations",
            "Right to appeal denied accommodations",
            "Right to file discrimination complaint separately from accommodation request",
        ],
        "what_students_miss": (
            "You can dispute a professor's refusal to honor SSD-approved accommodations — "
            "this is a policy violation, not a gray area."
        ),
    },
    {
        "id": "sexual_misconduct_non_title_ix",
        "name": "Sexual Misconduct (Non-Title IX)",
        "category": "title_ix",
        "office": "CARES Program (Campus Advocacy, Resources, Education for Survivors)",
        "phone": "540-231-0045",
        "url": "https://safe.vt.edu",
        "process": (
            "Contact CARES for confidential support first -> "
            "CARES helps you understand reporting options -> "
            "You choose whether to report formally"
        ),
        "timeline": "Immediate support available 24/7",
        "student_rights": [
            "CARES advocates are confidential — nothing you share triggers a mandatory report",
        ],
        "what_students_miss": (
            "CARES is separate from the Title IX office — "
            "talking to CARES does not start an investigation."
        ),
    },
    {
        "id": "retaliation",
        "name": "Retaliation",
        "category": "bias_discrimination",
        "office": "Office for Equity and Accessibility",
        "url": "https://oea.vt.edu/harassment-discrimination.html",
        "process": (
            "File retaliation complaint with OEA -> "
            "Treated as separate violation from original complaint -> "
            "Expedited review given urgency"
        ),
        "timeline": "Expedited review",
        "student_rights": [
            "Retaliation for filing any complaint is independently prohibited",
            "Full protection even if your original complaint is not upheld",
        ],
        "what_students_miss": (
            "Retaliation includes subtle actions like exclusion from opportunities, "
            "grade changes, or social ostracism — not just overt threats."
        ),
    },
    {
        "id": "graduate_student_grievance",
        "name": "Graduate Student Grievance",
        "category": "academic_misconduct",
        "office": "Graduate School, 244 Graduate Life Center",
        "phone": "540-231-6691",
        "url": "https://graduateschool.vt.edu",
        "process": (
            "Informal resolution with advisor first -> If unresolved, formal grievance to department -> "
            "Graduate School review -> Provost appeal"
        ),
        "timeline": "Informal step: 30 days. Formal step: 60 days",
        "student_rights": [
            "Right to written response at every stage",
            "Right to have a support person present",
            "Right to appeal to Provost",
        ],
        "what_students_miss": (
            "Graduate students can grieve advisor misconduct including unreasonable workload demands, "
            "funding retaliation, and authorship disputes."
        ),
    },
    {
        "id": "faculty_staff_misconduct",
        "name": "Faculty/Staff Misconduct Toward Student",
        "category": "bias_discrimination",
        "office": "Dean of Students, 109 Henderson Hall",
        "phone": "540-231-3787",
        "url": "https://dos.vt.edu",
        "process": (
            "Report to Dean of Students -> DOS advocates on your behalf -> "
            "Escalated to department chair or HR depending on severity"
        ),
        "timeline": "Varies based on severity",
        "student_rights": [
            "Right to have Dean of Students as your advocate throughout the process",
        ],
        "what_students_miss": (
            "The Dean of Students office is YOUR office — they work for students, not faculty."
        ),
    },
    {
        "id": "hostile_classroom",
        "name": "Hostile Classroom Environment",
        "category": "bias_discrimination",
        "office": "Dean of Students + relevant College Dean's office",
        "url": "https://dos.vt.edu",
        "process": (
            "Document incidents with dates and quotes -> Report to Dean of Students -> "
            "DOS contacts department -> Resolution may include course reassignment"
        ),
        "timeline": "Varies based on severity",
        "student_rights": [
            "Right to a learning environment free from harassment",
            "Right to request section transfer without academic penalty",
        ],
        "what_students_miss": (
            "A single serious incident can qualify — you don't need a pattern of behavior to report."
        ),
    },
    {
        "id": "international_student_discrimination",
        "name": "International Student Discrimination",
        "category": "bias_discrimination",
        "office": "Cook Counseling + BIRT + Office for Equity and Accessibility",
        "phone": "540-231-6527",
        "url": "https://inclusive.vt.edu/birt",
        "additional_resource": "International Student and Scholar Services, 110 Cranwell International Center",
        "process": (
            "Same as bias incident — report to BIRT -> "
            "ISSS can provide additional advocacy and documentation support"
        ),
        "timeline": "Initial outreach within 2 business days",
        "student_rights": [
            "Same rights as all students",
            "Immigration status does not affect your right to report or receive support",
        ],
        "what_students_miss": (
            "ISSS can provide letters of support and advocate with faculty on your behalf during an investigation."
        ),
    },
    {
        "id": "first_gen_academic",
        "name": "First-Generation Student Academic Concerns",
        "category": "academic_misconduct",
        "office": "Dean of Students + Academic Advising",
        "url": "https://dos.vt.edu",
        "process": (
            "Contact Dean of Students -> Connected to peer mentors, academic coaching, "
            "and emergency resources"
        ),
        "timeline": "Immediate support available",
        "student_rights": [],
        "what_students_miss": (
            "The Dean of Students office has emergency funding for students in financial crisis "
            "that can prevent academic withdrawal."
        ),
    },
    {
        "id": "housing_discrimination",
        "name": "Housing / Roommate Discrimination",
        "category": "bias_discrimination",
        "office": "Housing and Residence Life + BIRT",
        "phone": "540-231-6205",
        "url": "https://inclusive.vt.edu/birt",
        "process": (
            "Report to RA -> RA escalates to RD -> Formal mediation or reassignment -> "
            "BIRT involvement if bias-motivated"
        ),
        "timeline": "Urgent safety situations resolved within 24 hours",
        "student_rights": [
            "Right to safe housing",
            "Right to request room reassignment",
            "Right to have bias component investigated separately",
        ],
        "what_students_miss": (
            "Bias-motivated roommate conflicts are handled differently from general disputes — "
            "BIRT investigates the bias component separately."
        ),
    },
    {
        "id": "online_social_media_harassment",
        "name": "Online / Social Media Harassment",
        "category": "bias_discrimination",
        "office": "BIRT + Dean of Students + VT Police if criminal",
        "phone": "540-231-6411",
        "url": "https://inclusive.vt.edu/birt",
        "process": (
            "Screenshot and document everything first -> Report to BIRT -> "
            "If threatening, also report to VT Police (540-231-6411) -> "
            "Dean of Students can pursue student conduct charges"
        ),
        "timeline": "Varies; criminal threats prioritized",
        "student_rights": [
            "Online harassment by another VT student is subject to the Student Code of Conduct "
            "regardless of whether it occurred on campus",
        ],
        "what_students_miss": (
            "VT can take action even if the harassment happened on personal social media accounts."
        ),
    },
    {
        "id": "student_code_of_conduct",
        "name": "Student Code of Conduct Violation",
        "category": "academic_misconduct",
        "office": "Office of Student Conduct, 109 Henderson Hall",
        "phone": "540-231-3787",
        "url": "https://dos.vt.edu",
        "process": (
            "Report filed -> Respondent notified -> Hearing scheduled -> "
            "Sanctions if responsible -> Appeal within 5 business days"
        ),
        "timeline": "Hearing typically within 15 business days",
        "student_rights": [
            "Presumed not responsible until finding",
            "Right to review all evidence",
            "Right to bring an advisor",
            "Right to appeal",
        ],
        "what_students_miss": (
            "You as the reporting party also have rights throughout the conduct process — "
            "you can request updates and attend the hearing."
        ),
    },
]

# ---------------------------------------------------------------------------
# Lookup helpers
# ---------------------------------------------------------------------------

def get_policy_by_id(policy_id: str) -> dict | None:
    """Return a single policy by its id field."""
    for p in VT_POLICIES:
        if p["id"] == policy_id:
            return p
    return None


def get_policies_by_category(category: str) -> list[dict]:
    """Return all policies matching a category (e.g. 'bias_discrimination', 'title_ix')."""
    return [p for p in VT_POLICIES if p["category"] == category]


def get_all_policy_names() -> list[str]:
    """Return a list of all policy names for prompt injection."""
    return [p["name"] for p in VT_POLICIES]
