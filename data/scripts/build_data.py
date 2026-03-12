#!/usr/bin/env python3
"""
Build optimized JavaScript data file for Sr Homeopata.
Converts extracted JSON data into a compact JS format for browser use.
"""

import json
import os

SIHORE_DATA = "/sessions/jolly-practical-goldberg/sihore_data"
OUTPUT = "/sessions/jolly-practical-goldberg/mnt/SIHOREMAX7/sr_homeopata_data.js"

def load_json(filename):
    path = os.path.join(SIHORE_DATA, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def build_repertory_data(rep_data):
    """Convert repertory to compact format.
    Each rubric becomes: [symptomPT, symptomEN, remedies, numRemedies, miasm_info]
    Chapters stored as: { code: { name, rubrics: [...] } }
    """
    chapter_map = rep_data.get('_chapter_map', {})
    chapters = {}

    # Get all chapter codes (non-underscore keys)
    ch_codes = sorted([k for k in rep_data.keys() if not k.startswith('_')])

    total = 0
    for code in ch_codes:
        ch_info = rep_data[code]
        name = chapter_map.get(code, code)
        rubrics = []

        for r in ch_info['data']:
            if not r.get('_active', True):
                continue

            symptom_pt = r.get('sintopor', '').replace('&', ' / ')
            symptom_en = r.get('sintoing', '').replace('&', ' / ')
            remedies = r.get('remedi', '').strip()
            num_rem = r.get('numrem', '').strip()

            # Miasm info (compact)
            psora = r.get('psora', '').strip()
            syphi = r.get('syphi', '').strip()
            sicos = r.get('sicos', '').strip()
            miasm = ''
            if psora or syphi or sicos:
                miasm = f"{psora}|{syphi}|{sicos}"

            # Only add non-empty rubrics
            if symptom_pt or symptom_en:
                rubrics.append([symptom_pt, symptom_en, remedies, num_rem, miasm])

        if rubrics:
            chapters[code] = {
                'name': name,
                'count': len(rubrics),
                'rubrics': rubrics
            }
            total += len(rubrics)

    return chapters, total

def build_remedies_data(rep_data):
    """Extract remedy list."""
    remedios = rep_data.get('_remedios', {})
    result = []
    for r in remedios.get('data', []):
        if not r.get('_active', True):
            continue
        result.append({
            'code': r.get('codigo', ''),
            'name': r.get('nomeremedio', ''),
            'synonym': r.get('sinonimia', '')
        })
    return result

def build_def_data(def_data):
    """Compact medication dictionary."""
    if not def_data:
        return []
    result = []
    for r in def_data.get('data', []):
        if not r.get('_active', True):
            continue
        # Get first few meaningful fields
        entry = {}
        for k, v in r.items():
            if k == '_active':
                continue
            if v and v.strip():
                entry[k] = v.strip()
        if entry:
            result.append(entry)
    return result

def build_dicionario_data(dic_data):
    """Compact medical dictionary."""
    if not dic_data:
        return []
    result = []
    for r in dic_data.get('data', []):
        if not r.get('_active', True):
            continue
        entry = {}
        for k, v in r.items():
            if k == '_active':
                continue
            if v and v.strip():
                entry[k] = v.strip()
        if entry:
            result.append(entry)
    return result

def build_fitoterapia_data(fito_data):
    """Compact phytotherapy data."""
    if not fito_data:
        return {}
    result = {}
    for db_name, db_info in fito_data.items():
        entries = []
        for r in db_info.get('data', []):
            if not r.get('_active', True):
                continue
            entry = {}
            for k, v in r.items():
                if k == '_active':
                    continue
                if v and v.strip():
                    entry[k] = v.strip()
            if entry:
                entries.append(entry)
        if entries:
            result[db_name] = entries
    return result

def main():
    print("Loading extracted data...")

    rep_data = load_json('repertory.json')
    def_data = load_json('def_medications.json')
    dic_data = load_json('dicionario.json')
    cor_data = load_json('correlatos.json')
    fito_data = load_json('fitoterapia.json')
    textos_data = load_json('textos_index.json')

    print("Building optimized repertory...")
    chapters, total_rubrics = build_repertory_data(rep_data)
    print(f"  {total_rubrics} rubrics across {len(chapters)} chapters")

    print("Building remedy index...")
    remedies = build_remedies_data(rep_data)
    print(f"  {len(remedies)} remedies")

    print("Building medication dictionary...")
    medications = build_def_data(def_data)
    print(f"  {len(medications)} medications")

    print("Building medical dictionary...")
    dictionary = build_dicionario_data(dic_data)
    print(f"  {len(dictionary)} entries")

    print("Building phytotherapy data...")
    phyto = build_fitoterapia_data(fito_data)
    print(f"  {sum(len(v) for v in phyto.values())} entries")

    # Build correlatos
    correlatos = []
    if cor_data:
        for r in cor_data.get('data', []):
            if not r.get('_active', True):
                continue
            entry = {k: v.strip() for k, v in r.items() if k != '_active' and v and v.strip()}
            if entry:
                correlatos.append(entry)
    print(f"Building correlatos... {len(correlatos)} entries")

    # Build textos index
    textos = []
    if textos_data:
        for t in textos_data:
            textos.append({
                'name': t.get('name', ''),
                'ext': t.get('extension', ''),
                'size': t.get('size', 0)
            })
    print(f"Materia medica index: {len(textos)} files")

    # Write JS file
    print(f"\nWriting {OUTPUT}...")

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write("// Sr Homeopata - Database (auto-generated)\n")
        f.write("// Rubric format: [symptomPT, symptomEN, remedies, numRemedies, miasm]\n")
        f.write("// DO NOT EDIT - regenerate with build_data.py\n\n")

        f.write("window.SH_DATA = {};\n\n")

        # Write chapters one by one to manage memory
        f.write("// === REPERTORY CHAPTERS ===\n")
        f.write("window.SH_DATA.chapters = {};\n")

        for code in sorted(chapters.keys()):
            ch = chapters[code]
            ch_json = json.dumps(ch, ensure_ascii=False, separators=(',', ':'))
            f.write(f"window.SH_DATA.chapters['{code}']={ch_json};\n")

        # Write remedy index
        f.write("\n// === REMEDIES ===\n")
        remedies_json = json.dumps(remedies, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.remedies={remedies_json};\n")

        # Write chapter map for display
        chapter_map = rep_data.get('_chapter_map', {})
        f.write(f"\nwindow.SH_DATA.chapterMap={json.dumps(chapter_map, ensure_ascii=False, separators=(',', ':'))};\n")

        # Stats
        stats = {
            'totalRubrics': total_rubrics,
            'totalChapters': len(chapters),
            'totalRemedies': len(remedies),
            'totalMedications': len(medications),
            'totalDictionary': len(dictionary),
            'totalCorrelatos': len(correlatos),
            'totalPhyto': sum(len(v) for v in phyto.values()),
            'totalTextos': len(textos)
        }
        f.write(f"\nwindow.SH_DATA.stats={json.dumps(stats)};\n")

        # Write medications (large - write compact)
        f.write("\n// === MEDICATIONS (DEF) ===\n")
        med_json = json.dumps(medications, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.medications={med_json};\n")

        # Write dictionary (large - write compact)
        f.write("\n// === MEDICAL DICTIONARY ===\n")
        dic_json = json.dumps(dictionary, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.dictionary={dic_json};\n")

        # Write correlatos
        f.write("\n// === CORRELATOS ===\n")
        cor_json = json.dumps(correlatos, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.correlatos={cor_json};\n")

        # Write phytotherapy
        f.write("\n// === PHYTOTHERAPY ===\n")
        phyto_json = json.dumps(phyto, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.phytotherapy={phyto_json};\n")

        # Write textos index
        f.write("\n// === MATERIA MEDICA INDEX ===\n")
        tex_json = json.dumps(textos, ensure_ascii=False, separators=(',', ':'))
        f.write(f"window.SH_DATA.textos={tex_json};\n")

        # Signal that data is loaded
        f.write("\n// Signal data loaded\n")
        f.write("window.SH_DATA._loaded = true;\n")
        f.write("if (window.onSHDataLoaded) window.onSHDataLoaded();\n")

    size = os.path.getsize(OUTPUT)
    print(f"\nDone! Output: {size / 1024 / 1024:.1f} MB")
    print(f"File: {OUTPUT}")

if __name__ == '__main__':
    main()
