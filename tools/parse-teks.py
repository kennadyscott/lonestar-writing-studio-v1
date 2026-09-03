#!/usr/bin/env python3
"""Parse the TEKS out of TEA's own published chapter PDFs.

Deterministic on purpose. A model summarising a standards document is exactly
how five bogus codes ended up in a crosswalk, so nothing here is inferred: every
row is text lifted verbatim from the PDF, and anything the parser cannot read it
reports rather than guesses.

Grain matches how content is actually tagged: a row per student expectation
AND a row per breakout, because 5.11D (ii) is what a worksheet teaches.

  python3 tools/parse-teks.py teks/*.pdf > teks.json
"""
import fitz, json, re, sys, os

# The knowledge-and-skills statements name their strand before the colon. These
# are the state's words on the left and the platform's domain on the right.
DOMAINS = [
    ("developing and sustaining foundational language skills", "Foundational Language"),
    ("comprehension skills",        "Comprehension"),
    ("response skills",             "Response Skills"),
    ("multiple genres",             "Multiple Genres"),
    ("author's purpose and craft",  "Author's Purpose"),
    ("composition",                 "Composition"),
    ("inquiry and research",        "Inquiry and Research"),
]

SUBJECT_BY_CHAPTER = {"110": "ELAR", "111": "Math", "112": "Science", "113": "Social Studies"}

GRADE_WORDS = {
    "kindergarten": "K", "grade 1": "1", "grade 2": "2", "grade 3": "3", "grade 4": "4",
    "grade 5": "5", "grade 6": "6", "grade 7": "7", "grade 8": "8",
}

# Where each chapter was fetched from, recorded per row so provenance travels
# with the data instead of living in someone's memory.
SOURCE = {
    "ch110a.pdf": "https://tea.texas.gov/sites/default/files/ch110a.pdf",
    "ch110b.pdf": "https://tea.texas.gov/sites/default/files/ch110b.pdf",
    "ch111a.pdf": "https://tea.texas.gov/sites/default/files/ch111a.pdf",
    "ch111b.pdf": "https://tea.texas.gov/sites/default/files/ch111b.pdf",
    "ch112a.pdf": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch112a.pdf",
    "ch112b.pdf": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch112b.pdf",
    "ch113a.pdf": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch113a.pdf",
    "ch113b.pdf": "https://tea.texas.gov/laws-and-rules/sboe-rules-tac/sboe-tac-currently-effect/ch113b.pdf",
}

SECTION = re.compile(r"^§(\d{3})\.(\d+)\.\s*(.*)$")

# Running headers and footers are separate lines in the extracted text and get
# swept into whatever paragraph is open, which appends "Page 4 of 27" to a
# standard's wording. Silent corruption, so it is filtered before parsing.
_FURNITURE = r"(?:§1\d\d\.[A-Z]\.|Page \d+(?: of \d+)?|of \d+|Elementary|Middle School|High School|[A-Z][a-z]+ \d{4} Update|\d{4} Update)"
FOOTER = re.compile(rf"^(?:{_FURNITURE}[\s,.]*)+$", re.I)

# The same grade can carry more than one course: Grade 6 Adopted 2012 and Grade 6
# Middle School Advanced Mathematics Adopted 2025 both define 6.1A. Collapsing
# them onto one key would quietly merge an advanced course into the regular one,
# so the course is part of a standard's identity.
def course_of(head):
    """What is left of a section title once the subject, the grade and the
    adoption year are taken out. Usually nothing, which is a plain grade level;
    when something remains it is a distinct course sharing the grade's codes."""
    t = re.sub(r",?\s*Adopted\s+\d{4}\.?$", "", head.strip()).rstrip(".")
    t = re.sub(r"^(English Language Arts and Reading|Mathematics|Science|Social Studies)\b[,\s]*", "", t, flags=re.I)
    t = re.sub(r"\b(Kindergarten|Grade \d+)\b[,\s]*", "", t, flags=re.I)
    return t.strip().strip(",").strip() or "Grade Level"

def adopted_of(head):
    m = re.search(r"Adopted\s+(\d{4})", head)
    return m.group(1) if m else None
# (a) and (b) are subsections; (i), (v) and (x) are breakouts, and they are the
# same shape. Only a marker followed by its heading is a subsection.
SUBSEC  = re.compile(r"^\(([a-z])\)$")
HEADING = re.compile(r"^(introduction|knowledge and skills)", re.I)
NUM     = re.compile(r"^\((\d{1,2})\)$")
LETTER  = re.compile(r"^\(([A-Z])\)$")
ROMAN   = re.compile(r"^\(([ivxl]+)\)$")


def domain_for(statement):
    """ELAR names its strand before a colon and matches the platform's seven
    domains. Maths, science and social studies name theirs before the first
    period: "Algebraic reasoning. The student applies...". Neither is inferred
    beyond the punctuation the documents actually use."""
    low = statement.lower()
    for needle, name in DOMAINS:
        if low.startswith(needle):
            return name
    if ":" in statement and statement.index(":") < 60:
        return statement.split(":")[0].strip()
    return statement.split(". ")[0].strip().rstrip(".")


def short_name(text):
    """A provisional label so a human can find the row. Never presented as
    authored: every row this touches is marked name_verified = false."""
    t = re.sub(r"\s+", " ", text).strip().rstrip(";.").strip()
    t = re.sub(r"^(edit drafts?|use|develop|demonstrate|recognize|identify|explain|compose|describe)\s+", "", t, flags=re.I)
    words = t.split()
    return " ".join(words[:6]) + ("..." if len(words) > 6 else "")


def parse(path):
    chapter = re.search(r"ch(\d{3})", os.path.basename(path)).group(1)
    subject = SUBJECT_BY_CHAPTER.get(chapter, chapter)
    doc = fitz.open(path)
    lines = []
    for page in doc:
        for raw in page.get_text().split("\n"):
            s = raw.strip()
            if s and not FOOTER.match(s):
                lines.append(s)

    rows, problems = [], []
    grade = None
    course = "Grade Level"
    adopted = None
    # Every section opens with "(a) Introduction." — numbered prose paragraphs
    # that restart at "(b) Knowledge and skills.". Reading standards out of the
    # introduction attaches real expectations to the wrong strand, so nothing is
    # emitted until we are demonstrably inside the knowledge and skills.
    in_ks = False
    ks_num = ks_text = None
    exp_letter = None
    exp_text_parts = []
    cur = None          # ('ks'|'exp'|'brk', key)
    buf = []

    def flush():
        nonlocal cur, buf, ks_text, exp_letter
        if not cur:
            buf = []
            return
        text = re.sub(r"\s+", " ", " ".join(buf)).strip()
        kind, key = cur
        if kind == "ks":
            ks_text = text
        elif kind == "exp":
            emit(f"{grade}.{ks_num}{key}", text, f"{grade}.{ks_num}")
            exp_text_parts.clear()
            exp_text_parts.append(text)
        elif kind == "brk":
            stem = exp_text_parts[0] if exp_text_parts else ""
            emit(f"{grade}.{ks_num}{exp_letter} ({key})", text, f"{grade}.{ks_num}{exp_letter}", stem)
        buf = []

    def emit(sid, text, parent, stem=""):
        if grade is None or ks_num is None:
            problems.append(f"{sid}: no grade or knowledge-and-skills number in scope")
            return
        rows.append({
            "state": "TX",
            "subject": subject,
            "grade": grade,
            "course": course,
            "adopted": adopted,
            "domain": domain_for(ks_text or ""),
            "standard_id": sid,
            "standard_name": short_name(text),
            "name_verified": False,          # the label is ours, not the state's
            "description": (stem + " " + text).strip() if stem else text,
            "breakout_text": text if stem else None,
            "parent_id": parent,
            "strand_statement": ks_text or "",
            "source_url": SOURCE.get(os.path.basename(path), ""),
            "verified": True,                # the wording is verbatim from TEA
        })

    for idx, line in enumerate(lines):
        m = SECTION.match(line)
        if m:
            flush(); cur = None
            head = m.group(3).lower()
            grade = next((g for w, g in GRADE_WORDS.items() if w in head), None)
            course = course_of(m.group(3))
            adopted = adopted_of(m.group(3))
            ks_num = exp_letter = None
            in_ks = False
            continue
        if grade is None:
            continue
        if SUBSEC.match(line) and idx + 1 < len(lines) and HEADING.match(lines[idx + 1]):
            flush(); cur = None
            in_ks = HEADING.match(lines[idx + 1]).group(1).lower().startswith("knowledge")
            ks_num = exp_letter = None
            continue
        if not in_ks:
            continue
        if HEADING.match(line) and not cur:
            continue
        if NUM.match(line):
            flush(); ks_num = NUM.match(line).group(1); exp_letter = None
            cur = ("ks", ks_num); continue
        if LETTER.match(line) and ks_num:
            flush(); exp_letter = LETTER.match(line).group(1)
            cur = ("exp", exp_letter); continue
        if ROMAN.match(line) and exp_letter:
            flush(); cur = ("brk", ROMAN.match(line).group(1)); continue
        if cur:
            buf.append(line)
    flush()
    return rows, problems


all_rows, all_problems = [], []
for path in sys.argv[1:]:
    r, p = parse(path)
    all_rows += r
    all_problems += [f"{os.path.basename(path)}: {x}" for x in p]
    print(f"{os.path.basename(path):12} {len(r):5} rows", file=sys.stderr)

json.dump({"rows": all_rows, "problems": all_problems}, sys.stdout, indent=1)
