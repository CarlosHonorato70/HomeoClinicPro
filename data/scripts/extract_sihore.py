#!/usr/bin/env python3
"""
SIHORE MAX 7.0 - Database Extractor
Extracts all proprietary .DB files into structured JSON format.

DB Format (reverse engineered):
- Header: header_block_size (4 bytes LE) + field_count (4 bytes LE)
- Field names: null-terminated strings
- Records: record_data_size (4 bytes LE) + field values as null-terminated strings
- Negative record_data_size indicates deleted/inactive record
"""

import struct
import json
import os
import glob


BASE_DIR = "/sessions/jolly-practical-goldberg/mnt/SIHOREMAX7"
OUTPUT_DIR = "/sessions/jolly-practical-goldberg/sihore_data"


def read_null_terminated(data, offset):
    """Read a null-terminated string from binary data."""
    end = data.index(b'\x00', offset)
    return data[offset:end].decode('latin-1', errors='replace'), end + 1


def parse_db_file(filepath):
    """Parse a SIHORE proprietary .DB file."""
    with open(filepath, 'rb') as f:
        data = f.read()

    if len(data) < 8:
        return None, None

    # Read header
    header_size = struct.unpack_from('<I', data, 0)[0]
    field_count = struct.unpack_from('<I', data, 4)[0]

    # Sanity checks
    if field_count <= 0 or field_count > 50:
        return None, None

    # Read field names
    offset = 8
    field_names = []
    try:
        for i in range(field_count):
            name, offset = read_null_terminated(data, offset)
            field_names.append(name)
    except (ValueError, IndexError):
        return None, None

    # Read records
    records = []
    while offset < len(data) - 4:
        rec_size = struct.unpack_from('<i', data, offset)[0]
        offset += 4

        if rec_size == 0:
            break

        is_active = rec_size > 0
        abs_size = abs(rec_size)
        rec_start = offset

        if abs_size > len(data) - rec_start:
            break

        # Read field values
        record = {}
        try:
            for fname in field_names:
                if offset >= rec_start + abs_size:
                    record[fname] = ""
                else:
                    val, offset = read_null_terminated(data, offset)
                    record[fname] = val
        except (ValueError, IndexError):
            offset = rec_start + abs_size
            continue

        record['_active'] = is_active
        records.append(record)

        # Align to next record
        offset = rec_start + abs_size

    return field_names, records


def extract_repertory():
    """Extract all repertory chapter databases."""
    reper_dir = os.path.join(BASE_DIR, "REPER")
    chapters = {}

    # Parse CAPITULO.DB for chapter mapping
    cap_path = os.path.join(reper_dir, "CAPITULO.DB")
    fields, records = parse_db_file(cap_path)
    if records:
        chapter_map = {}
        for r in records:
            if r.get('_active', True):
                code = r.get('capitulo', '')
                name = r.get('nome', '')
                if code:
                    chapter_map[code] = name
        chapters['_chapter_map'] = chapter_map
        print(f"  CAPITULO.DB: {len(chapter_map)} chapters mapped")

    # Parse REMEDIOS.DB
    rem_path = os.path.join(reper_dir, "REMEDIOS.DB")
    fields, records = parse_db_file(rem_path)
    if records:
        remedies = [r for r in records if r.get('_active', True)]
        chapters['_remedios'] = {
            'fields': fields,
            'count': len(remedies),
            'data': remedies
        }
        print(f"  REMEDIOS.DB: {len(remedies)} remedies")

    # Parse each chapter DB
    total_rubrics = 0
    for db_file in sorted(glob.glob(os.path.join(reper_dir, "*.DB"))):
        basename = os.path.basename(db_file).upper()
        if basename in ('CAPITULO.DB', 'REMEDIOS.DB', 'REMEDIOSOLD.DB', 'REMEDIOSV.DB'):
            continue

        fields, records = parse_db_file(db_file)
        if records:
            active_records = [r for r in records if r.get('_active', True)]
            chapter_code = basename.replace('.DB', '')
            chapters[chapter_code] = {
                'fields': fields,
                'count': len(active_records),
                'data': active_records
            }
            total_rubrics += len(active_records)
            print(f"  {basename}: {len(active_records)} rubrics (of {len(records)} total)")

    print(f"  TOTAL RUBRICS: {total_rubrics}")
    return chapters


def extract_def():
    """Extract DEF.DB (allopathic drug dictionary)."""
    path = os.path.join(BASE_DIR, "DEF.DB")
    fields, records = parse_db_file(path)
    if records:
        active = [r for r in records if r.get('_active', True)]
        print(f"  DEF.DB: {len(active)} medications (of {len(records)} total)")
        return {'fields': fields, 'count': len(active), 'data': active}
    return None


def extract_dicionario():
    """Extract DICIONARIO.DB (medical dictionary)."""
    path = os.path.join(BASE_DIR, "DICIONARIO.DB")
    fields, records = parse_db_file(path)
    if records:
        active = [r for r in records if r.get('_active', True)]
        print(f"  DICIONARIO.DB: {len(active)} entries (of {len(records)} total)")
        return {'fields': fields, 'count': len(active), 'data': active}
    return None


def extract_correlatos():
    """Extract CORRELATOS.DB."""
    path = os.path.join(BASE_DIR, "CORRELATOS.DB")
    fields, records = parse_db_file(path)
    if records:
        active = [r for r in records if r.get('_active', True)]
        print(f"  CORRELATOS.DB: {len(active)} entries (of {len(records)} total)")
        return {'fields': fields, 'count': len(active), 'data': active}
    return None


def extract_fitoterapia():
    """Extract FITOTERAPIA databases."""
    fito_dir = os.path.join(BASE_DIR, "FITOTERAPIA")
    result = {}
    for db_file in glob.glob(os.path.join(fito_dir, "*.DB")):
        basename = os.path.basename(db_file)
        if basename.lower() == 'thumbs.db':
            continue
        fields, records = parse_db_file(db_file)
        if records:
            active = [r for r in records if r.get('_active', True)]
            result[basename] = {
                'fields': fields,
                'count': len(active),
                'data': active
            }
            print(f"  FITOTERAPIA/{basename}: {len(active)} entries")
    return result


def extract_textos_content():
    """Extract content from materia medica text files."""
    textos_dir = os.path.join(BASE_DIR, "TEXTOS")
    materias = []
    count = 0
    if os.path.exists(textos_dir):
        for f in sorted(os.listdir(textos_dir)):
            fpath = os.path.join(textos_dir, f)
            if not os.path.isfile(fpath):
                continue
            ext = os.path.splitext(f)[1].lower()
            name = os.path.splitext(f)[0]
            size = os.path.getsize(fpath)

            content = ""
            if ext in ('.txt', '.htm', '.html'):
                try:
                    content = open(fpath, 'r', encoding='latin-1', errors='replace').read()
                    # Strip HTML tags for .htm files
                    if ext in ('.htm', '.html'):
                        import re
                        content = re.sub(r'<[^>]+>', ' ', content)
                        content = re.sub(r'\s+', ' ', content).strip()
                except:
                    pass

            materias.append({
                'filename': f,
                'name': name,
                'extension': ext,
                'size': size,
                'content_preview': content[:500] if content else ""
            })
            count += 1

        print(f"  TEXTOS: {count} materia medica files processed")
    return materias


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("SIHORE MAX 7.0 - Database Extraction")
    print("=" * 60)

    # 1. Repertory
    print("\n[1/6] Extracting Repertory...")
    repertory = extract_repertory()
    with open(os.path.join(OUTPUT_DIR, "repertory.json"), 'w', encoding='utf-8') as f:
        json.dump(repertory, f, ensure_ascii=False, indent=2)

    # 2. DEF
    print("\n[2/6] Extracting DEF (medications)...")
    def_data = extract_def()
    if def_data:
        with open(os.path.join(OUTPUT_DIR, "def_medications.json"), 'w', encoding='utf-8') as f:
            json.dump(def_data, f, ensure_ascii=False, indent=2)

    # 3. Dicionario
    print("\n[3/6] Extracting Dicionário...")
    dic_data = extract_dicionario()
    if dic_data:
        with open(os.path.join(OUTPUT_DIR, "dicionario.json"), 'w', encoding='utf-8') as f:
            json.dump(dic_data, f, ensure_ascii=False, indent=2)

    # 4. Correlatos
    print("\n[4/6] Extracting Correlatos...")
    cor_data = extract_correlatos()
    if cor_data:
        with open(os.path.join(OUTPUT_DIR, "correlatos.json"), 'w', encoding='utf-8') as f:
            json.dump(cor_data, f, ensure_ascii=False, indent=2)

    # 5. Fitoterapia
    print("\n[5/6] Extracting Fitoterapia...")
    fito_data = extract_fitoterapia()
    if fito_data:
        with open(os.path.join(OUTPUT_DIR, "fitoterapia.json"), 'w', encoding='utf-8') as f:
            json.dump(fito_data, f, ensure_ascii=False, indent=2)

    # 6. Textos
    print("\n[6/6] Indexing Matéria Médica texts...")
    textos = extract_textos_content()
    with open(os.path.join(OUTPUT_DIR, "textos_index.json"), 'w', encoding='utf-8') as f:
        json.dump(textos, f, ensure_ascii=False, indent=2)

    # Summary
    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE")
    print("=" * 60)
    total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f))
                     for f in os.listdir(OUTPUT_DIR) if f.endswith('.json'))
    print(f"Output: {total_size / 1024 / 1024:.1f} MB total in {OUTPUT_DIR}")


if __name__ == '__main__':
    main()
