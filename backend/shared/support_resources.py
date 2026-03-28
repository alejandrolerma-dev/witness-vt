"""
Support resources — returns campus mental health, counseling, and support
resources tailored to the incident's severity and bias category.
"""

# Base resources available to all students
_BASE_RESOURCES = [
    {
        "name": "Cook Counseling Center",
        "contact": "540-231-6557",
        "url": "https://ucc.vt.edu",
        "description": "Free confidential counseling for all VT students — same-day crisis appointments available",
        "type": "counseling",
    },
    {
        "name": "Dean of Students Office",
        "contact": "540-231-3787",
        "url": "https://dos.vt.edu",
        "description": "Advocacy, emergency funding, and academic support during difficult situations",
        "type": "advocacy",
    },
]

# Additional resources by bias category
_CATEGORY_RESOURCES = {
    "gender": [
        {
            "name": "Women's Center at Virginia Tech",
            "contact": "540-231-7806",
            "url": "https://womenscenter.vt.edu",
            "description": "Support, advocacy, and programming for gender-based concerns",
            "type": "support",
        },
        {
            "name": "CARES (Campus Advocacy, Resources & Education for Survivors)",
            "contact": "540-231-0045",
            "url": "https://safe.vt.edu",
            "description": "Confidential 24/7 support for survivors — does NOT trigger a mandatory report",
            "type": "crisis",
        },
    ],
    "sexual_orientation": [
        {
            "name": "LGBTQ+ Resource Center",
            "contact": "540-231-3785",
            "url": "https://lgbtq.vt.edu",
            "description": "Community, support groups, and advocacy for LGBTQ+ students",
            "type": "support",
        },
        {
            "name": "CARES (Campus Advocacy, Resources & Education for Survivors)",
            "contact": "540-231-0045",
            "url": "https://safe.vt.edu",
            "description": "Confidential 24/7 support for survivors — does NOT trigger a mandatory report",
            "type": "crisis",
        },
    ],
    "race": [
        {
            "name": "Black Cultural Center",
            "contact": "540-231-1834",
            "url": "https://mlfs.vt.edu/bcc.html",
            "description": "Community space, programming, and support for Black students",
            "type": "support",
        },
        {
            "name": "Multicultural Programs & Services",
            "contact": "540-231-1820",
            "url": "https://mlfs.vt.edu",
            "description": "Advocacy and resources for students of color",
            "type": "support",
        },
    ],
    "ethnicity": [
        {
            "name": "Multicultural Programs & Services",
            "contact": "540-231-1820",
            "url": "https://mlfs.vt.edu",
            "description": "Advocacy and resources for underrepresented students",
            "type": "support",
        },
    ],
    "religion": [
        {
            "name": "Interfaith Engagement at Virginia Tech",
            "contact": "540-231-3787",
            "url": "https://dos.vt.edu",
            "description": "Interfaith support and religious accommodation advocacy",
            "type": "support",
        },
    ],
    "national_origin": [
        {
            "name": "Cranwell International Center",
            "contact": "540-231-6527",
            "url": "https://international.vt.edu",
            "description": "Immigration advising, advocacy, and support for international students",
            "type": "support",
        },
    ],
    "disability": [
        {
            "name": "Services for Students with Disabilities (SSD)",
            "contact": "540-231-3788",
            "url": "https://ssd.vt.edu",
            "description": "Accommodation support and disability rights advocacy",
            "type": "support",
        },
    ],
}

# Extra resources for high-severity incidents
_HIGH_SEVERITY_RESOURCES = [
    {
        "name": "VT Police Department",
        "contact": "540-231-6411",
        "url": "https://police.vt.edu",
        "description": "For incidents involving physical harm, threats, or criminal activity",
        "type": "safety",
    },
    {
        "name": "988 Suicide & Crisis Lifeline",
        "contact": "Call or text 988",
        "description": "Free, confidential 24/7 crisis support",
        "type": "crisis",
    },
]


def get_support_resources(bias_category: str, severity: str) -> list[dict]:
    """Return a tailored list of support resources based on incident details."""
    resources = list(_BASE_RESOURCES)

    # Add category-specific resources
    if bias_category in _CATEGORY_RESOURCES:
        resources.extend(_CATEGORY_RESOURCES[bias_category])

    # Add high-severity resources
    if severity == "high":
        resources.extend(_HIGH_SEVERITY_RESOURCES)

    return resources
