#!/usr/bin/env python3
"""Translate MateriaMedica content from English to Brazilian Portuguese using OpenAI."""

import os
import sys
import json
import time
import psycopg2
from openai import OpenAI

# Config
DB_URL = "postgresql://postgres:admin@143.244.171.61:5433/homeoclinic"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
BATCH_SIZE = 3  # records per API call
MAX_CONTENT_LEN = 3000  # truncate very long texts to save tokens

client = OpenAI(api_key=OPENAI_KEY)

def translate_batch(texts):
    """Translate a batch of texts from EN to PT-BR using GPT-4o-mini."""
    numbered = "\n\n".join(f"===TEXT {i+1}===\n{t[:MAX_CONTENT_LEN]}" for i, t in enumerate(texts))

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "Voce e um tradutor especializado em homeopatia. Traduza os textos de materia medica homeopatica do ingles para portugues do Brasil. Mantenha os nomes latinos dos remedios e termos tecnicos. Mantenha a formatacao original (paragrafos, quebras de linha). Responda APENAS com as traducoes, separadas por ===TEXT N=== exatamente como recebeu."
        }, {
            "role": "user",
            "content": f"Traduza estes {len(texts)} textos para portugues do Brasil:\n\n{numbered}"
        }],
        temperature=0.3,
        max_tokens=4096
    )

    result = resp.choices[0].message.content
    # Parse results
    parts = result.split("===TEXT ")
    translations = []
    for part in parts:
        if part.strip():
            # Remove the "N===" header
            lines = part.strip().split("===", 1)
            if len(lines) > 1:
                translations.append(lines[1].strip())
            else:
                translations.append(part.strip())

    # If parsing failed, return originals
    if len(translations) != len(texts):
        # Try simpler split
        translations = []
        for i in range(len(texts)):
            marker = f"===TEXT {i+1}==="
            next_marker = f"===TEXT {i+2}==="
            start = result.find(marker)
            if start == -1:
                translations.append(texts[i])  # keep original
                continue
            start = start + len(marker)
            end = result.find(next_marker) if i < len(texts) - 1 else len(result)
            translations.append(result[start:end].strip())

    return translations[:len(texts)]


def main():
    sources = sys.argv[1:] if len(sys.argv) > 1 else ['BOERICKE', 'ALLEN_KEYNOTES', 'KENT']

    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for source in sources:
        cur.execute(
            'SELECT id, content FROM "MateriaMedica" WHERE source = %s ORDER BY id',
            (source,)
        )
        rows = cur.fetchall()
        total = len(rows)
        print(f"\n=== Traduzindo {source}: {total} registros ===")

        translated = 0
        errors = 0

        for i in range(0, total, BATCH_SIZE):
            batch = rows[i:i+BATCH_SIZE]
            ids = [r[0] for r in batch]
            texts = [r[1] for r in batch]

            try:
                translations = translate_batch(texts)

                for j, (rec_id, translation) in enumerate(zip(ids, translations)):
                    if translation and len(translation) > 20:
                        cur.execute(
                            'UPDATE "MateriaMedica" SET content = %s WHERE id = %s',
                            (translation, rec_id)
                        )
                        translated += 1
                    else:
                        errors += 1

                conn.commit()

                pct = min(100, int((i + len(batch)) / total * 100))
                print(f"  [{pct:3d}%] {i+len(batch)}/{total} — traduzidos: {translated}, erros: {errors}")

                # Rate limiting
                time.sleep(0.5)

            except Exception as e:
                errors += len(batch)
                print(f"  ERRO no lote {i}: {e}")
                conn.rollback()
                time.sleep(2)

        print(f"  CONCLUIDO {source}: {translated} traduzidos, {errors} erros")

    cur.close()
    conn.close()
    print("\n=== Traducao completa! ===")


if __name__ == "__main__":
    main()
