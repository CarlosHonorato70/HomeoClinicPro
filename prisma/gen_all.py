import re

def esc(s):
    s = s.replace("'", "''").replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)
    return s.strip()

# === PLANTAS ===
path = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\HomeoclinicIA\FITOTERAPIA\PLANTAS.DB'
with open(path, 'rb') as f:
    raw = f.read()
text = raw.decode('latin-1', errors='replace')
parts = re.split(r'\x00{2,}', text)
parts = [p.strip() for p in parts if len(p.strip()) > 20]

out1 = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\SIHOREMAX7\HomeoClinicPro-Projeto\prisma\seed-phyto2.sql'
with open(out1, 'w', encoding='utf-8', newline='\n') as f:
    count = 0
    for i in range(1, len(parts)):
        p = parts[i]
        lines = p.split('\n')
        first = lines[0].strip()
        desc = ' '.join(l.strip() for l in lines[1:]).strip()

        m = re.match(r'^([A-Z][A-Z \-\']+)', first)
        if not m:
            continue
        name = m.group(1).strip().title()
        rest = first[m.end():].strip()

        sci_m = re.match(r'([A-Z][a-z]+\s+[a-z]+(?:\s+[A-Z][a-z]*\.?)*)', rest)
        sci = sci_m.group(1).strip() if sci_m else ""
        after = rest[len(sci):].strip(' ,.')

        if len(name) < 3 or len(name) > 50:
            continue

        # Columns: name, scientificName, commonNames, indications, contraindications, preparation, dosage, interactions, notes
        f.write(f"INSERT INTO \"PhytotherapyPlant\" (name, \"scientificName\", \"commonNames\", indications, preparation, notes) VALUES ('{esc(name)}', '{esc(sci)}', '', '{esc(after[:400])}', '{esc(desc[:500])}', 'SIHORE Fitoterapia');\n")
        count += 1
print(f"Plants: {count}")

# === DICIONARIO ===
path2 = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\HomeoclinicIA\FITOTERAPIA\TRATAMENTO.DB'
with open(path2, 'rb') as f:
    raw2 = f.read()
text2 = raw2.decode('latin-1', errors='replace')
tparts = re.split(r'\x00{2,}', text2)
tparts = [p.strip() for p in tparts if len(p.strip()) > 10]

out2 = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\SIHOREMAX7\HomeoClinicPro-Projeto\prisma\seed-dict2.sql'
with open(out2, 'w', encoding='utf-8', newline='\n') as f:
    count = 0
    terms = [
        ("Similitude", "Principio fundamental da homeopatia: substancia que provoca sintomas em saudaveis pode curar sintomas semelhantes em doentes, em doses infinitesimais."),
        ("Dinamizacao", "Processo farmacotecnico: diluicao sucessiva com agitacao vigorosa (sucussao) para potencializar a acao medicamentosa."),
        ("Potencia", "Grau de dinamizacao de um medicamento homeopatico."),
        ("Tintura-mae", "Preparacao hidroalcoolica obtida por maceracao de substancias, ponto de partida para medicamentos homeopaticos."),
        ("Nosodio", "Medicamento preparado a partir de produtos patologicos, diluidos e dinamizados."),
        ("Miasma", "Predisposicao morbida subjacente as doencas cronicas. Classicos: psora, sicose e luetismo."),
        ("Psora", "Primeiro miasma: predisposicao a disturbios funcionais, manifestacoes cutaneas e periodicidade."),
        ("Sicose", "Segundo miasma: tendencia a hiperplasia, verrugas e condilomas."),
        ("Luetismo", "Terceiro miasma: tendencia a destruicao tecidual, ulceras e fistulas."),
        ("Simillimum", "Medicamento cuja patogenesia melhor corresponde a totalidade dos sintomas do paciente."),
        ("Patogenesia", "Sinais e sintomas observados na experimentacao de substancia em individuos saudaveis."),
        ("Repertorizacao", "Metodo de pesquisa do medicamento: buscar sintomas no repertorio para encontrar o simillimum."),
        ("Forca Vital", "Energia responsavel pelo equilibrio e funcionamento harmonico do organismo."),
        ("Sucussao", "Agitacoes vigorosas a cada etapa de diluicao do medicamento homeopatico."),
        ("Individualizacao", "Cada paciente deve ser tratado de forma unica, considerando sintomas fisicos, emocionais e mentais."),
        ("Totalidade Sintomatica", "Conjunto completo de sinais e sintomas para escolha do medicamento homeopatico."),
        ("Modalidade", "Circunstancia que agrava ou melhora um sintoma: horario, temperatura, posicao, clima."),
        ("Agravacao Homeopatica", "Intensificacao temporaria dos sintomas apos medicamento correto - sinal positivo de reacao curativa."),
        ("Organon", "Obra fundamental de Samuel Hahnemann com os principios da homeopatia."),
        ("Escala Centesimal (CH)", "Diluicao 1:100 a cada dinamizacao, seguida de sucussao."),
        ("Escala Decimal (DH)", "Diluicao 1:10 a cada dinamizacao, seguida de sucussao."),
        ("Escala LM", "Escala cinquenta-milesimal (1:50.000). Menor risco de agravacao."),
        ("Cefaleia", "Dor de cabeca de intensidade e localizacao variaveis."),
        ("Dispneia", "Dificuldade respiratoria ou sensacao de falta de ar."),
        ("Astenia", "Fraqueza generalizada, cansaco fisico e falta de energia."),
        ("Pirexia", "Elevacao da temperatura corporal (febre)."),
        ("Edema", "Acumulo de liquido nos tecidos causando inchaco."),
        ("Pirose", "Queimacao retroesternal (azia), associada a refluxo gastroesofagico."),
        ("Prurido", "Coceira cutanea de origem dermatologica, sistemica ou psicogenica."),
        ("Epistaxe", "Sangramento nasal."),
        ("Disuria", "Dor ao urinar, associada a infeccoes urinarias."),
        ("Artralgia", "Dor articular sem sinais inflamatorios."),
        ("Mialgia", "Dor muscular localizada ou difusa."),
        ("Lombalgia", "Dor na regiao lombar."),
        ("Vertigem", "Sensacao de movimento rotatorio, origem vestibular."),
        ("Parestesia", "Formigamento ou dormencia na pele."),
        ("Epigastrio", "Regiao central superior do abdome (estomago e pancreas)."),
        ("Hipocondrio", "Regioes laterais superiores do abdome (figado e baco)."),
        ("Anamnese", "Entrevista clinica para coleta de informacoes sobre doenca e antecedentes."),
        ("Anamnese Homeopatica", "Avaliacao integral: aspectos fisicos, emocionais, mentais e constitucionais."),
        ("Auscultacao", "Exame fisico com estetoscopio para ouvir sons dos orgaos."),
        ("Palpacao", "Exame fisico usando as maos para avaliar textura, forma e sensibilidade."),
        ("Percussao", "Exame fisico que produz sons para avaliar estruturas subjacentes."),
        ("Semiologia", "Estudo dos sinais e sintomas das doencas."),
        ("Materia Medica", "Obra com dados das patogenesias para prescricao homeopatica."),
    ]
    for term, defn in terms:
        f.write(f"INSERT INTO \"MedicalDictionary\" (term, definition) VALUES ('{esc(term)}', '{esc(defn)}');\n")
        count += 1

    for i in range(1, len(tparts)):
        p = tparts[i]
        m = re.match(r'^([A-Z][A-Z \-]+)', p)
        if not m:
            continue
        disease = m.group(1).strip().title()
        content = p.strip()
        if len(disease) < 3 or len(disease) > 60:
            continue
        f.write(f"INSERT INTO \"MedicalDictionary\" (term, definition) VALUES ('{esc(disease)}', '{esc(content[:490])}');\n")
        count += 1

print(f"Dictionary: {count}")
