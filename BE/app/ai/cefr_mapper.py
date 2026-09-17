"""
CEFR & Band Score Mapping Engine
Converts between IELTS Bands (0.0 - 9.0), Aptis scaled scores (0 - 50), and CEFR levels (A1 - C2).
Based on official British Council & Cambridge English CEFR alignment guidelines.
"""

def ielts_band_to_cefr(band: float) -> str:
    if band >= 8.5:
        return "C2"
    elif band >= 7.0:
        return "C1"
    elif band >= 5.5:
        return "B2"
    elif band >= 4.0:
        return "B1"
    elif band >= 3.0:
        return "A2"
    else:
        return "A1"

def cefr_to_ielts_band(cefr: str) -> float:
    mapping = {
        "C2": 8.5,
        "C1": 7.5,
        "B2": 6.5,
        "B1": 5.0,
        "A2": 3.5,
        "A1": 2.5
    }
    return mapping.get(cefr.upper(), 5.5)

def aptis_score_to_cefr(score: int) -> str:
    # Aptis score per skill is typically 0 to 50
    if score >= 43:
        return "C" # C1/C2
    elif score >= 38:
        return "B2"
    elif score >= 28:
        return "B1"
    elif score >= 16:
        return "A2"
    else:
        return "A1"

def calculate_overall_band(scores: list) -> float:
    valid_scores = [s for s in scores if s is not None and s > 0]
    if not valid_scores:
        return 6.0
    avg = sum(valid_scores) / len(valid_scores)
    # IELTS rounding rules:
    # - If average ends in .25, round up to next half band (.5)
    # - If average ends in .75, round up to next whole band (next .0)
    # e.g., 6.25 -> 6.5, 6.75 -> 7.0, 6.125 -> 6.0, 6.375 -> 6.5
    fraction = avg - int(avg)
    if fraction < 0.25:
        rounded = int(avg) + 0.0
    elif fraction < 0.75:
        rounded = int(avg) + 0.5
    else:
        rounded = int(avg) + 1.0
    return min(9.0, max(1.0, float(rounded)))
