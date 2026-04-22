#!/usr/bin/env python3
import csv
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".local_site"
FACES = ["R", "B", "G", "W", "Y"]
FINGERS = ["LT", "LI", "LM", "LR", "LL", "RT", "RI", "RM", "RR", "RL"]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def strip_front_matter(text: str) -> tuple[dict[str, str], str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text

    front_matter = {}
    idx = 1
    while idx < len(lines) and lines[idx].strip() != "---":
        line = lines[idx]
        if ":" in line:
            key, value = line.split(":", 1)
            front_matter[key.strip()] = value.strip().strip('"')
        idx += 1

    body = "\n".join(lines[idx + 1 :]).lstrip()
    return front_matter, body


def csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def participant_options(rows: list[dict[str, str]], french: bool) -> str:
    label = "envergure" if french else "span"
    options = []
    for idx, row in enumerate(rows):
        handedness = row["Handedness"].capitalize()
        options.append(
            f'        <option value="{idx}">\n'
            f'          P{row["Number"]} ({handedness}, {label} {row["SpanRightHand"]}mm)\n'
            f"        </option>"
        )
    return "\n".join(options)


def coerce_int(value: str) -> int:
    return int(float(value or 0))


def build_participants_data(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    participants = []
    for row in rows:
        participant = {
            "number": coerce_int(row["Number"]),
            "handedness": row["Handedness"],
            "circumferenceLeft": coerce_int(row["CircumferenceLeftHand"]),
            "circumferenceRight": coerce_int(row["CircumferenceRightHand"]),
            "lengthLeft": coerce_int(row["LengthLeftHand"]),
            "lengthRight": coerce_int(row["LengthRightHand"]),
            "spanLeft": coerce_int(row["SpanLeftHand"]),
            "spanRight": coerce_int(row["SpanRightHand"]),
        }
        for face in FACES:
            participant[face] = [coerce_int(row[f"{face}{idx}"]) for idx in range(1, 17)]
        participants.append(participant)
    return participants


def reachability_value(row: dict[str, str], finger: str, face: str, idx: int) -> int:
    value = coerce_int(row[f"{finger}-{face}{idx}"])
    return 3 if value == 2 else value


def build_reachability_data(rows: list[dict[str, str]]) -> list[dict[str, object]]:
    data = []
    for row in rows:
        participant = {"number": coerce_int(row["Number"])}
        for face in FACES:
            participant[face] = [
                sum(reachability_value(row, finger, face, idx) for finger in FINGERS)
                for idx in range(1, 17)
            ]
        data.append(participant)
    return data


def build_per_finger_reachability(rows: list[dict[str, str]]) -> dict[str, list[dict[str, list[int]]]]:
    per_finger = {}
    for finger in FINGERS:
        per_finger[finger] = []
        for row in rows:
            participant = {}
            for face in FACES:
                participant[face] = [
                    reachability_value(row, finger, face, idx) for idx in range(1, 17)
                ]
            per_finger[finger].append(participant)
    return per_finger


def build_preference_aggregate(participants: list[dict[str, object]]) -> dict[str, object]:
    finger_map = ["LL", "LR", "LM", "LI", "LT", "RT", "RI", "RM", "RR", "RL"]
    aggregate = {"scores": {}, "dominantFingers": {}, "tiedFingers": {}}

    for face in FACES:
        scores = []
        dominant = []
        tied = []
        for idx in range(16):
            counts = [0] * 10
            for participant in participants:
                finger_code = participant[face][idx]
                if 1 <= finger_code <= 10:
                    counts[finger_code - 1] += 1
            max_count = max(counts)
            tied_fingers = [
                finger_map[i] for i, count in enumerate(counts) if count == max_count
            ]
            scores.append(round(max_count / len(participants), 2))
            dominant.append(tied_fingers[0])
            tied.append(tied_fingers)
        aggregate["scores"][face] = scores
        aggregate["dominantFingers"][face] = dominant
        aggregate["tiedFingers"][face] = tied
    return aggregate


def build_dataviz_data_script(preferences_csv: Path, reachability_csv: Path) -> str:
    preference_rows = csv_rows(preferences_csv)
    reachability_rows = csv_rows(reachability_csv)

    participants = build_participants_data(preference_rows)
    reachability = build_reachability_data(reachability_rows)
    per_finger = build_per_finger_reachability(reachability_rows)
    preference_aggregate = build_preference_aggregate(participants)

    return """<script>
window.participantsData = {participants};
window.reachabilityData = {reachability};
window.perFingerReachability = {per_finger};
window.preferenceAggregate = {preference_aggregate};
</script>
""".format(
        participants=json.dumps(participants, separators=(",", ":")),
        reachability=json.dumps(reachability, separators=(",", ":")),
        per_finger=json.dumps(per_finger, separators=(",", ":")),
        preference_aggregate=json.dumps(preference_aggregate, separators=(",", ":")),
    )


def render_index(content: str, title: str, lang: str) -> str:
    layout = read_text(ROOT / "_layouts" / "default.html")
    layout = layout.replace('{{ page.lang | default: \'fr\' }}', lang)
    layout = layout.replace('{{ page.title | default: "Keycube Jekyll" }}', title)
    layout = layout.replace("{{ site.baseurl }}", "")
    layout = layout.replace("{{ content }}", content)
    return layout


def render_dataviz_page(content: str, title: str, default_mode: str, lang: str) -> str:
    layout = read_text(ROOT / "_layouts" / "dataviz.html")
    layout = layout.replace('{{ page.lang | default: \'en\' }}', lang)
    layout = layout.replace("{{ site.baseurl }}", "")
    layout = layout.replace(
        "{{ page.default_mode | default: 'preference' }}", default_mode
    )
    layout = layout.replace('{{ page.title | default: "Keycube Heatmap 3D" }}', title)
    layout = re.sub(
        r'href="\{\{ \'/assets/css/dataviz\.css\' \| relative_url \}\}\?v=\{\{ site\.time \| date: \'%s\' \}\}"',
        'href="/assets/css/dataviz.css"',
        layout,
    )
    layout = re.sub(
        r'href="\{\{ \'/assets/img/favicon\.png\' \| relative_url \}\}"',
        'href="/assets/img/favicon.png"',
        layout,
    )
    layout = re.sub(
        r'src="\{\{ \'/assets/js/dataviz\.js\' \| relative_url \}\}\?v=\{\{ site\.time \| date: \'%s\' \}\}"',
        'src="/assets/js/dataviz.js"',
        layout,
    )
    layout = layout.replace("{{ content }}", content)
    layout = layout.replace(
        "{% include model-viewer.html %}",
        read_text(ROOT / "_includes" / "model-viewer.html"),
    )
    layout = layout.replace(
        "{% include dataviz-data.html %}",
        build_dataviz_data_script(
            ROOT / "_data" / "preferences.csv",
            ROOT / "_data" / "reachability.csv",
        ),
    )
    return layout


def render_preference_body(path: Path, french: bool) -> tuple[dict[str, str], str]:
    front_matter, body = strip_front_matter(read_text(path))
    body = body.replace("{{ '/' | relative_url }}", "/")
    body = re.sub(r'\{\{\s*["\']/\s*["\']\s*\|\s*relative_url\s*\}\}', "/", body)
    options = participant_options(csv_rows(ROOT / "_data" / "preferences.csv"), french)
    body = re.sub(
        r"\s*\{% for row in site\.data\.preferences %\}\n.*?\n\s*\{% endfor %\}",
        "\n" + options,
        body,
        flags=re.DOTALL,
    )
    return front_matter, body


def render_reachability_body(path: Path) -> tuple[dict[str, str], str]:
    front_matter, body = strip_front_matter(read_text(path))
    body = body.replace("{{ '/' | relative_url }}", "/")
    body = re.sub(r'\{\{\s*["\']/\s*["\']\s*\|\s*relative_url\s*\}\}', "/", body)
    return front_matter, body


def write_page(relative_path: str, html: str) -> None:
    target = OUT / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(ROOT / "assets", OUT / "assets")

    index_front_matter, index_body = strip_front_matter(read_text(ROOT / "index.html"))
    index_body = index_body.replace("{{ site.baseurl }}", "")
    index_body = re.sub(r'\{\{\s*\'/preference/\'\s*\|\s*relative_url\s*\}\}', "/preference/", index_body)
    index_body = re.sub(r'\{\{\s*\'/reachability/\'\s*\|\s*relative_url\s*\}\}', "/reachability/", index_body)
    write_page(
        "index.html",
        render_index(index_body, index_front_matter["title"], index_front_matter["lang"]),
    )

    for source_name, route, french in [
        ("preference.html", "preference/index.html", False),
        ("preference-fr.html", "preference-fr/index.html", True),
    ]:
        front_matter, body = render_preference_body(ROOT / source_name, french)
        write_page(
            route,
            render_dataviz_page(
                body,
                front_matter["title"],
                front_matter["default_mode"],
                front_matter["lang"],
            ),
        )

    for source_name, route in [
        ("reachability.html", "reachability/index.html"),
        ("reachability-fr.html", "reachability-fr/index.html"),
    ]:
        front_matter, body = render_reachability_body(ROOT / source_name)
        write_page(
            route,
            render_dataviz_page(
                body,
                front_matter["title"],
                front_matter["default_mode"],
                front_matter["lang"],
            ),
        )


if __name__ == "__main__":
    main()
