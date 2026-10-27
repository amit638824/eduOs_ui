import re
import pathlib

base = pathlib.Path(r"c:\Users\ujjaw\Downloads\eduleb-extracted")
out = pathlib.Path(r"d:\online exam\eduOs_ui\_tmp_html")
out.mkdir(exist_ok=True)
files = [
    "about.html",
    "course.html",
    "course_details.html",
    "contact.html",
    "faq.html",
    "instructor.html",
    "ins_details.html",
    "pricing.html",
    "blog.html",
    "blog_single.html",
    "404.html",
]
for f in files:
    c = (base / f).read_text(encoding="utf-8", errors="ignore")
    # debug footer
    print(f, "footer idx", c.lower().find("<footer"), "section-top", c.find("section-top"))
    # try flexible
    m = re.search(r'(?is)(<section\s+class=["\']section-top["\'].*?)(?:<footer|<!--\s*START FOOTER|<!--\s*END)', c)
    if not m and f == "404.html":
        m = re.search(r'(?is)(<!--\s*START 404.*?)<footer', c)
    if m:
        text = m.group(1)
        (out / f).write_text(text, encoding="utf-8")
        print("  OK", len(text))
    else:
        print("  FAIL")
        # show around section-top
        i = c.find("section-top")
        print(repr(c[i-50:i+200]))
