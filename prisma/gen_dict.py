import re

path2 = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\HomeoclinicIA\FITOTERAPIA\TRATAMENTO.DB'
with open(path2, 'rb') as f:
    raw = f.read()
text = raw.decode('latin-1', errors='replace')
tparts = re.split(r'\x00{2,}', text)
tparts = [p.strip() for p in tparts if len(p.strip()) > 10]

def esc(s):
    s = s.replace("'", "''").replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)
    return s.strip()

output = r'C:\Users\Carlos Honorato\OneDrive\Área de trabalho\SIHOREMAX7\HomeoClinicPro-Projeto\prisma\seed-dictionary.sql'
with open(output, 'w', encoding='utf-8', newline='\n') as f:
    terms = [
        ("Similitude", "Principio fundamental da homeopatia: uma substancia capaz de provocar sintomas em individuos saudaveis pode curar sintomas semelhantes em individuos doentes, em doses infinitesimais."),
        ("Dinamizacao", "Processo farmacotecnico homeopatico: diluicao sucessiva acompanhada de agitacao vigorosa (sucussao) para potencializar a acao medicamentosa."),
        ("Potencia", "Grau de dinamizacao de um medicamento homeopatico, indicando quantas vezes a substancia foi diluida e sucussionada."),
        ("Tintura-mae", "Preparacao hidroalcoolica obtida por maceracao de substancias vegetais, animais ou minerais, ponto de partida para medicamentos homeopaticos."),
        ("Nosodio", "Medicamento homeopatico preparado a partir de produtos patologicos, como secrecoes morbidas ou culturas microbianas, diluidos e dinamizados."),
        ("Miasma", "Predisposicao morbida subjacente as doencas cronicas. Os tres miasmas classicos sao a psora, a sicose e o luetismo."),
        ("Psora", "Primeiro miasma homeopatico: predisposicao a disturbios funcionais sem lesao estrutural, com manifestacoes cutaneas e periodicidade."),
        ("Sicose", "Segundo miasma homeopatico: tendencia a hiperplasia e hipertrofia tecidual, com formacao de verrugas e condilomas."),
        ("Luetismo", "Terceiro miasma homeopatico: tendencia a destruicao tecidual com formacao de ulceras e fistulas."),
        ("Simillimum", "O medicamento homeopatico cuja patogenesia melhor corresponde a totalidade dos sintomas do paciente."),
        ("Patogenesia", "Conjunto de sinais e sintomas observados durante a experimentacao de uma substancia em individuos saudaveis."),
        ("Repertorizacao", "Metodo de pesquisa do medicamento homeopatico: buscar no repertorio os sintomas do paciente para encontrar o simillimum."),
        ("Forca Vital", "Energia sutil responsavel por manter o equilibrio e o funcionamento harmonico do organismo."),
        ("Sucussao", "Serie de agitacoes vigorosas realizadas a cada etapa de diluicao do medicamento homeopatico."),
        ("Individualizacao", "Principio segundo o qual cada paciente deve ser tratado de forma unica, considerando sintomas fisicos, emocionais e mentais."),
        ("Totalidade Sintomatica", "Conjunto completo de sinais e sintomas que deve ser considerado na escolha do medicamento homeopatico."),
        ("Modalidade", "Circunstancia que agrava ou melhora um sintoma: horario, temperatura, posicao, movimento, alimentacao ou clima."),
        ("Agravacao Homeopatica", "Intensificacao temporaria dos sintomas apos administracao do medicamento correto, sinal positivo de reacao curativa."),
        ("Organon", "Obra fundamental da homeopatia escrita por Samuel Hahnemann que estabelece os principios da pratica homeopatica."),
        ("Escala Centesimal (CH)", "Escala de diluicao na proporcao de 1:100 a cada dinamizacao, seguida de sucussao."),
        ("Escala Decimal (DH)", "Escala de diluicao na proporcao de 1:10 a cada dinamizacao, seguida de sucussao."),
        ("Escala LM", "Escala cinquenta-milesimal com proporcao de 1:50.000 a cada dinamizacao. Menor risco de agravacao."),
        ("Dose Unica", "Forma de prescricao na qual o medicamento e administrado uma unica vez, aguardando-se a resposta do organismo."),
        ("Cefaleia", "Dor de cabeca de intensidade e localizacao variaveis, classificada como primaria (enxaqueca, tensional) ou secundaria."),
        ("Dispneia", "Dificuldade respiratoria ou sensacao subjetiva de falta de ar."),
        ("Astenia", "Estado de fraqueza generalizada, cansaco fisico e falta de energia."),
        ("Pirexia", "Elevacao da temperatura corporal acima dos valores normais (febre)."),
        ("Edema", "Acumulo anormal de liquido nos tecidos intersticiais, resultando em inchaco."),
        ("Pirose", "Sensacao de queimacao retroesternal (azia), geralmente associada ao refluxo gastroesofagico."),
        ("Prurido", "Sensacao cutanea de coceira, de origem dermatologica, sistemica ou psicogenica."),
        ("Epistaxe", "Sangramento nasal, geralmente originado na regiao anterior do septo nasal."),
        ("Disuria", "Dificuldade ou dor ao urinar, associada a infeccoes do trato urinario."),
        ("Taquicardia", "Aumento da frequencia cardiaca acima de 100 bpm em adultos."),
        ("Bradicardia", "Diminuicao da frequencia cardiaca abaixo de 60 bpm em adultos."),
        ("Artralgia", "Dor articular sem sinais inflamatorios evidentes."),
        ("Mialgia", "Dor muscular de intensidade variavel, localizada ou difusa."),
        ("Lombalgia", "Dor na regiao lombar (parte inferior das costas)."),
        ("Vertigem", "Sensacao ilusoria de movimento rotatorio, geralmente de origem vestibular."),
        ("Parestesia", "Sensacao anormal de formigamento ou dormencia na pele."),
        ("Epigastrio", "Regiao central e superior do abdome, sobre a qual se projetam o estomago e parte do pancreas."),
        ("Hipocondrio", "Regioes laterais superiores do abdome, abaixo das ultimas costelas (figado e baco)."),
        ("Vertex", "Ponto mais elevado do cranio, no topo da cabeca."),
        ("Anamnese", "Entrevista clinica detalhada para coleta de informacoes sobre a historia da doenca, antecedentes e habitos."),
        ("Anamnese Homeopatica", "Avaliacao integral do paciente investigando aspectos fisicos, emocionais, mentais e constitucionais."),
        ("Auscultacao", "Tecnica de exame fisico usando estetoscopio para ouvir sons dos orgaos internos."),
        ("Palpacao", "Tecnica de exame fisico usando as maos para avaliar temperatura, textura, forma e sensibilidade."),
        ("Percussao", "Tecnica de exame fisico que produz sons para avaliar estruturas subjacentes."),
        ("Semiologia", "Area da medicina dedicada ao estudo dos sinais e sintomas das doencas."),
        ("Constitucional", "Medicamento homeopatico selecionado com base no conjunto total de caracteristicas do paciente."),
        ("Materia Medica", "Obra que reune dados das patogenesias, instrumento fundamental para prescricao homeopatica."),
    ]

    count = 0
    for term, defn in terms:
        f.write(f"INSERT INTO \"MedicalDictionary\" (id, term, definition) VALUES (gen_random_uuid()::text, '{esc(term)}', '{esc(defn)}');\n")
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
        f.write(f"INSERT INTO \"MedicalDictionary\" (id, term, definition) VALUES (gen_random_uuid()::text, '{esc(disease)}', '{esc(content[:490])}');\n")
        count += 1

print(f"Total dictionary entries: {count}")
