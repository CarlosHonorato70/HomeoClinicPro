-- Casos Clinicos Classicos da Historia da Homeopatia
-- Baseados em obras de Hahnemann, Kent, Vithoulkas, Hering e Nash

INSERT INTO "ClinicalCase" (id, "clinicId", "createdById", title, summary, symptoms, rubrics, repertorization, "prescribedRemedy", potency, outcome, "outcomeRating", tags, "patientAge", "patientSex", "isAnonymized", "createdAt", "updatedAt") VALUES
-- 1. Caso Classico de Natrum Muriaticum (Vithoulkas)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Depressao Cronica com Isolamento Social — Natrum Muriaticum',
'Mulher de 35 anos com depressao cronica apos perda afetiva. Tendencia ao isolamento, choro solitario, aversao a consolacao. Cefaleia em martelo, desejo de sal. Caso classico descrito por Vithoulkas na Essencia da Materia Medica.',
'Mentais: Tristeza profunda, chora sozinha, piora com consolacao. Fechada, reservada, guarda magoas antigas. Rancor silencioso. Gerais: Cefaleia pulsatil frontal, piora ao sol e calor. Desejo intenso de sal. Emagrecimento apesar de bom apetite. Pele oleosa. Herpes labial recorrente. Piora as 10h da manha. Particulares: Corrimento vaginal aquoso. Obstipacao com fezes ressecadas.',
'MIND; GRIEF, ailments from. MIND; CONSOLATION aggravates. MIND; WEEPING, alone, when. HEAD; PAIN, hammering. GENERALS; FOOD, salt, desire. GENERALS; SUN, aggravation. SKIN; HERPES, labialis.',
'Natrum muriaticum: 28 pontos (cobertura 7/7). Sepia: 18 pontos (5/7). Ignatia: 16 pontos (4/7). Phosphorus: 14 pontos (4/7).',
'Natrum Muriaticum', '200CH dose unica',
'Melhora progressiva em 6 semanas. Primeiro: sono melhorou. Depois: cefaleia reduziu em frequencia. Aos 3 meses: retomou vida social, herpes nao recorreu. Aos 6 meses: alta homeopatica. Seguiu Lei de Hering — cura de dentro para fora, de cima para baixo.',
5, 'depressao,luto,isolamento,cefaleia,herpes,natrum-muriaticum,vithoulkas,classico', 35, 'F', true, NOW(), NOW()),

-- 2. Caso Classico de Lycopodium (Kent)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Dispepsia Cronica com Inseguranca — Lycopodium',
'Homem de 45 anos, advogado, com dispepsia cronica e distensao abdominal. Aparencia confiante mas internamente inseguro. Piora das 16h as 20h. Desejo de doces. Caso tipico descrito por Kent nas Lectures on Materia Medica.',
'Mentais: Aparencia de autoconfianca que mascara profunda inseguranca. Medo de falar em publico apesar de ser advogado. Irritavel em casa, amavel com estranhos. Antecipacao ansiosa. Gerais: Distensao abdominal intensa apos comer pouco. Flatul encia abundante. Piora marcada entre 16h e 20h. Desejo de doces e alimentos quentes. Particulares: Calculo renal direito recorrente. Queda de cabelo precoce. Disfuncao eretil intermitente.',
'MIND; CONFIDENCE, want of self. MIND; FEAR, public speaking. ABDOMEN; DISTENSION, eating, after. ABDOMEN; FLATULENCE. GENERALS; AGGRAVATION, 16-20h. GENERALS; FOOD, sweets, desire. KIDNEY; CALCULI, right.',
'Lycopodium: 32 pontos (cobertura 7/7). Nux vomica: 20 pontos (5/7). China: 18 pontos (4/7). Carbo veg: 15 pontos (4/7).',
'Lycopodium Clavatum', '1M dose unica',
'Melhora digestiva em 2 semanas. Distensao abdominal reduziu 80%. Aos 2 meses: mais seguro profissionalmente, conseguiu fazer apresentacoes sem ansiedade excessiva. Aos 4 meses: calculo renal nao recorreu. Repetida 10M apos 6 meses com resultado excelente.',
5, 'dispepsia,inseguranca,flatulencia,calculo-renal,lycopodium,kent,classico', 45, 'M', true, NOW(), NOW()),

-- 3. Caso Classico de Sulphur (Hahnemann)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Eczema Cronico com Queimacao — Sulphur',
'Homem de 50 anos, filosofo amador, com eczema cronico pruriginoso. Piora com calor, banho e a noite. Pele seca e aspera. Pe quentes que coloca para fora da cama. Caso inspirado nos escritos de Hahnemann sobre o miasma psorico.',
'Mentais: Filosofo, teoriza sobre tudo. Egocentrico mas generoso com ideias. Preguica para atividades praticas. Coleciona objetos. Desleixado com aparencia. Gerais: Calor vital excessivo — sente muito calor. Pes queimam a noite, coloca para fora da cama. Fome intensa as 11h. Sede intensa. Aversao a banho. Pele seca, aspera, erupcoes pruriginosas. Particulares: Eczema em dobras, piora com calor e la. Diarreia matinal que o expulsa da cama as 5h. Hemorroidas.',
'SKIN; ERUPTIONS, eczema. SKIN; ITCHING, warmth of bed. EXTREMITIES; HEAT, feet, bed, in. STOMACH; HUNGER, 11h. MIND; THEORIZING. GENERALS; BATHING, aversion. RECTUM; DIARRHEA, morning, driving out of bed.',
'Sulphur: 35 pontos (cobertura 7/7). Psorinum: 22 pontos (5/7). Graphites: 18 pontos (4/7). Mezereum: 14 pontos (3/7).',
'Sulphur', '30CH 3 doses semanais',
'Agravacao homeopatica nos primeiros 5 dias — prurido intensificou. Apos 10 dias: eczema comecou a secar. Aos 2 meses: pele quase limpa. Repetida 200CH dose unica. Aos 4 meses: cura completa do eczema. Energia e disposicao melhoraram notavelmente.',
5, 'eczema,psorico,prurido,calor,pele,sulphur,hahnemann,classico', 50, 'M', true, NOW(), NOW()),

-- 4. Caso Classico de Pulsatilla (Nash)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Otite Media Recorrente em Crianca — Pulsatilla',
'Menina de 6 anos com otites medias de repeticao. Chora facilmente, busca colo e consolacao. Ausencia de sede mesmo com febre. Secrecoes amarelo-esverdeadas. Piora em ambiente fechado e quente. Caso classico descrito por Nash em Leaders in Homoeopathic Therapeutics.',
'Mentais: Crianca docil, meiga, chora com facilidade. Busca consolacao e melhora com ela. Ciumes do irmao mais novo. Medo de ficar sozinha, do escuro. Apegada a mae. Gerais: Ausencia de sede mesmo durante febre. Piora marcada em ambiente quente e fechado. Melhora ao ar livre e movimento lento. Desejo de manteiga e sorvete. Aversao a gordura. Particulares: Otite media com secrecao espessa amarelo-esverdeada. Coriza com secrecao semelhante. Conjuntivite recorrente.',
'EAR; INFLAMMATION, media. EAR; DISCHARGE, thick, yellow-green. MIND; WEEPING, consolation ameliorates. MIND; CLINGING, children. GENERALS; THIRSTLESS, fever, during. GENERALS; AIR, open, ameliorates. GENERALS; WARM room, aggravation.',
'Pulsatilla: 30 pontos (cobertura 7/7). Calcarea carbonica: 20 pontos (5/7). Chamomilla: 16 pontos (4/7). Silicea: 14 pontos (4/7).',
'Pulsatilla Nigricans', '200CH dose unica',
'Otite atual resolveu em 48 horas sem antibiotico. Secrecao reduziu no primeiro dia. Repetida 200CH apos 3 semanas. Em 6 meses de acompanhamento: nenhuma recorrencia de otite. Crianca mais independente e menos chorosa. Conjuntivite nao recorreu.',
5, 'otite,crianca,pediatria,choro,pulsatilla,nash,classico', 6, 'F', true, NOW(), NOW()),

-- 5. Caso Classico de Nux Vomica (Hering)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Gastrite Cronica por Estresse — Nux Vomica',
'Executivo de 40 anos, workaholic, com gastrite cronica, insonia e irritabilidade extrema. Abusa de cafe, alcool e medicamentos. Piora matinal. Caso inspirado nas descricoes de Hering no Guiding Symptoms.',
'Mentais: Extremamente irritavel, impaciente, competitivo. Ambicioso ao excesso. Briga por qualquer motivo. Hipersensivel a ruidos, luzes, odores. Critica tudo e todos. Gerais: Piora pela manha ao acordar. Frio intenso — calafrios ao menor movimento. Espasmos e caimbras frequentes. Abuso de estimulantes (cafe, alcool). Sedentarismo. Particulares: Gastrite com nausea matinal. Sensacao de peso no estomago 2h apos comer. Obstipacao com vontade ineficaz (vai ao banheiro mas nao evacua completamente). Insonia as 3h da manha, acorda com a mente cheia de preocupacoes do trabalho.',
'MIND; IRRITABILITY. MIND; QUARRELSOME. STOMACH; NAUSEA, morning. STOMACH; PAIN, eating, after. RECTUM; CONSTIPATION, ineffectual urging. SLEEP; WAKING, 3h. GENERALS; COLD, aggravation. GENERALS; STIMULANTS, abuse of.',
'Nux vomica: 36 pontos (cobertura 8/8). Bryonia: 20 pontos (5/8). Chamomilla: 18 pontos (4/8). Sulphur: 16 pontos (4/8).',
'Nux Vomica', '200CH dose unica a noite',
'Sono melhorou na primeira noite. Irritabilidade reduziu significativamente em 1 semana. Gastrite melhorou em 2 semanas. Aos 2 meses: reduziu consumo de cafe voluntariamente. Evacuacao normalizada. Repetida 1M apos 3 meses. Aos 6 meses: paciente mais calmo, delegando tarefas.',
5, 'gastrite,estresse,insonia,irritabilidade,nux-vomica,hering,classico', 40, 'M', true, NOW(), NOW()),

-- 6. Caso de Phosphorus (Vithoulkas)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Pneumonia Recorrente com Ansiedade — Phosphorus',
'Jovem de 22 anos, alto, magro, com pneumonias de repeticao e ansiedade por saude. Extremamente simpatico e aberto. Desejo de bebidas geladas. Medo de tempestade. Baseado nas descricoes de Vithoulkas na Essencia da Materia Medica.',
'Mentais: Muito aberto, simpatico, expressivo. Empatia excessiva — absorve o sofrimento dos outros. Medo de tempestades, do escuro, de doencas. Ansiedade por saude. Impressionavel — afetado por noticias negativas. Gerais: Alto, magro, peito estreito. Sede intensa de bebidas geladas (que depois vomita). Fome intensa, acorda a noite para comer. Hemorragias faceis (epistaxe). Particulares: Tosse seca que piora ao falar e ao ar frio. Rouquidao vespertina. Pneumonias no lobo inferior direito. Equimoses espontaneas.',
'CHEST; PNEUMONIA, right, lower lobe. MIND; SYMPATHETIC. MIND; FEAR, thunderstorms. MIND; ANXIETY, health, about. GENERALS; FOOD, cold drinks, desire. NOSE; EPISTAXIS. CHEST; COUGH, talking, from. GENERALS; HEMORRHAGE, tendency.',
'Phosphorus: 38 pontos (cobertura 8/8). Tuberculinum: 22 pontos (5/8). Calcarea phos: 18 pontos (4/8). Lycopodium: 14 pontos (3/8).',
'Phosphorus', '1M dose unica',
'Tosse resolveu em 5 dias. Nenhuma pneumonia nos 12 meses seguintes. Epistaxes cessaram. Ansiedade por saude diminuiu drasticamente. Manteve a personalidade aberta e simpatica mas sem a vulnerabilidade excessiva. Caso de Nivel 1 segundo teoria de Vithoulkas.',
5, 'pneumonia,ansiedade,hemorragia,empatia,phosphorus,vithoulkas,classico', 22, 'M', true, NOW(), NOW()),

-- 7. Caso de Arsenicum Album (Kent)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Asma Noturna com Ansiedade de Morte — Arsenicum Album',
'Mulher de 55 anos com asma noturna grave, piora entre 1h e 3h da manha. Medo intenso de morrer. Inquietacao extrema apesar da fraqueza. Sede de pequenos goles. Caso classico descrito por Kent nas Lectures on Materia Medica.',
'Mentais: Medo intenso da morte, especialmente a noite. Inquietacao extrema — muda de posicao constantemente. Desespero de cura. Meticulosa, perfeccionista. Avareza. Gerais: Piora marcada entre 1h e 3h da manha. Frio intenso com desejo de calor. Fraqueza desproporcional. Sede de pequenos goles frequentes de agua fria. Secrecoes ardentes e excoriantes. Particulares: Asma com dispneia intensa a noite. Coriza aquosa ardente. Diarreia ardente apos comer frutas. Pele seca, descamativa.',
'RESPIRATION; ASTHMATIC, night, 1-3h. MIND; FEAR, death. MIND; RESTLESSNESS, anxious. GENERALS; AGGRAVATION, 1-3h. GENERALS; THIRST, small quantities, often. GENERALS; COLD, aggravation. STOMACH; DIARRHEA, fruit, after.',
'Arsenicum album: 34 pontos (cobertura 7/7). Phosphorus: 20 pontos (5/7). Carbo veg: 18 pontos (4/7). Ipecacuanha: 14 pontos (3/7).',
'Arsenicum Album', '200CH dose unica',
'Crise asmatica noturna nao recorreu apos primeira dose. Sono melhorou imediatamente. Ansiedade de morte reduziu em 1 semana. Repetida 1M apos 2 meses. Em 6 meses: asma controlada sem broncodilatador. Paciente mais tranquila e menos controladora.',
5, 'asma,ansiedade,medo-morte,noturno,arsenicum,kent,classico', 55, 'F', true, NOW(), NOW()),

-- 8. Caso de Calcarea Carbonica (Hering)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Atraso no Desenvolvimento Infantil — Calcarea Carbonica',
'Crianca de 2 anos com atraso no desenvolvimento motor e dentario. Cabeca grande, fontanela aberta. Transpiracao na cabeca durante o sono. Desejo de ovo. Caso classico do tipo constitucional Calcarea descrito por Hering.',
'Mentais: Crianca tranquila, observadora. Medo de insetos e animais. Teimosia quando contrariada. Lentidao para aprender. Gerais: Gordinha, flacida, palida. Cabeca grande com fontanela anterior ainda aberta aos 2 anos. Transpiracao profusa na cabeca ao dormir, molhando o travesseiro. Pes frios e umidos. Desejo de ovo, leite, massa. Aversao a carne. Particulares: Dentificacao tardia — apenas 4 dentes aos 2 anos. Diarreia acida com odor azedo. Otite media recorrente. Hipertrofia de amigdalas.',
'GENERALS; DEVELOPMENT, arrested. HEAD; FONTANELLES, open. HEAD; PERSPIRATION, sleep, during. GENERALS; FOOD, eggs, desire. TEETH; DENTITION, slow. ABDOMEN; DIARRHEA, sour. GENERALS; OBESITY, children.',
'Calcarea carbonica: 32 pontos (cobertura 7/7). Silicea: 22 pontos (5/7). Baryta carb: 20 pontos (5/7). Phosphorus: 16 pontos (4/7).',
'Calcarea Carbonica', '200CH dose unica',
'Fontanela fechou em 3 meses. Novos dentes surgiram em 6 semanas apos a dose. Transpiracao noturna reduziu 70%. Motor: comecou a andar com firmeza em 1 mes. Repetida 1M apos 4 meses. Aos 6 meses: desenvolvimento normalizado para idade.',
5, 'pediatria,desenvolvimento,fontanela,dentificacao,calcarea,hering,classico', 2, 'F', true, NOW(), NOW()),

-- 9. Caso de Lachesis (Vithoulkas)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Menopausa com Ciume Patologico — Lachesis',
'Mulher de 52 anos na menopausa com ondas de calor, ciume patologico e loquacidade excessiva. Intolerancia a roupas apertadas no pescoco. Piora pelo sono. Baseado na experiencia clinica de Vithoulkas.',
'Mentais: Loquaz — fala sem parar, pula de assunto em assunto. Ciume intenso e patologico do marido. Desconfiada, sente-se perseguida. Piora ao acordar — manha e o pior momento. Tendencia ao sarcasmo. Gerais: Ondas de calor intensas na menopausa. Intolerancia a qualquer coisa apertada no pescoco ou cintura. Lateralidade esquerda marcante. Piora pelo sono — acorda pior. Melhora com o fluxo menstrual (quando ainda tinha). Particulares: Cefaleia esquerda pulsatil ao acordar. Garganta dolorida a esquerda. Hemorroidas com sangramento escuro.',
'MIND; LOQUACITY. MIND; JEALOUSY. MIND; SUSPICIOUS. GENERALS; SLEEP, after, aggravation. THROAT; CONSTRICTION, clothing. GENERALS; LEFT SIDE. FEMALE; CLIMACTERIC, hot flushes. HEAD; PAIN, left, waking, on.',
'Lachesis: 36 pontos (cobertura 8/8). Sepia: 22 pontos (5/8). Natrum mur: 18 pontos (4/8). Platina: 16 pontos (4/8).',
'Lachesis Mutus', '200CH dose unica',
'Ondas de calor reduziram 60% em 2 semanas. Ciume diminuiu progressivamente. Sono melhorou — acorda mais disposta. Repetida 1M apos 2 meses. Aos 4 meses: menopausa assintomatica. Relacionamento conjugal melhorou significativamente.',
5, 'menopausa,ciume,loquacidade,calor,esquerdo,lachesis,vithoulkas,classico', 52, 'F', true, NOW(), NOW()),

-- 10. Caso de Aconitum (Hahnemann)
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'Febre Subita apos Exposicao ao Vento Frio — Aconitum',
'Homem de 30 anos com febre alta de inicio subito apos exposicao a vento frio seco. Panico, agitacao extrema, medo de morrer. Sede intensa. Caso classico de Hahnemann no Organon e Materia Medica Pura.',
'Mentais: Panico absoluto — acredita que vai morrer. Agitacao extrema. Angustia insuportavel. Prediz a hora da morte. Medo de multidoes. Gerais: Febre alta de inicio subito apos exposicao a vento frio e seco. Pele quente e seca, sem suor. Sede intensa de grandes quantidades de agua fria. Pulso cheio, duro e rapido. Rosto vermelho ao deitar, palido ao levantar. Particulares: Tosse seca e cruposa. Dor de ouvido aguda. Conjuntivite por vento frio.',
'FEVER; SUDDEN onset, cold wind, after. MIND; FEAR, death, predicts time. MIND; RESTLESSNESS, tossing. GENERALS; THIRST, large quantities. SKIN; DRY, hot, burning. CHEST; COUGH, dry, croupy.',
'Aconitum: 30 pontos (cobertura 6/6). Belladonna: 20 pontos (4/6). Bryonia: 16 pontos (3/6). Chamomilla: 12 pontos (2/6).',
'Aconitum Napellus', '30CH a cada 2 horas (3 doses)',
'Febre cedeu em 6 horas apos primeira dose. Suor profuso seguido de sono reparador. No dia seguinte: completamente assintomatico. Caso de resolucao rapida tipica do Aconitum em quadros agudos. Nao necessitou repetir.',
5, 'febre,agudo,panico,medo-morte,frio,aconitum,hahnemann,classico', 30, 'M', true, NOW(), NOW());
