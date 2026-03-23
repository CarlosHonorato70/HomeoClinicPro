-- Casos Clinicos de Autismo (TEA) tratados com Homeopatia
-- Baseados em estudos publicados em journals peer-reviewed

INSERT INTO "ClinicalCase" (id, "clinicId", "createdById", title, summary, symptoms, rubrics, repertorization, "prescribedRemedy", potency, outcome, "outcomeRating", tags, "patientAge", "patientSex", "isAnonymized", "createdAt", "updatedAt") VALUES

-- 1. Carcinosinum em TEA — baseado em serie de casos do NHRIMH Kottayam
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA Grave com Atraso de Fala e Estereotipias — Carcinosinum',
'Menino de 4 anos diagnosticado com TEA nivel 2 (ISAA=151). Atraso importante na fala, estereotipias motoras (flapping), ausencia de contato visual. Historico familiar de cancer (avo materna). Desejo de chocolate. Sono inquieto. Baseado em serie de casos publicada no Indian Journal of Research in Homoeopathy.',
'Mentais: Crianca que nao responde ao proprio nome. Ausencia de contato visual. Nao aponta para objetos. Estereotipias motoras — bate as maos (flapping) quando excitado. Agitacao, hiperatividade. Birras intensas com auto-agressao (bate a cabeca na parede). Medo de escuro. Gerais: Historico familiar forte de cancer (avo materna faleceu de cancer de mama). Desejo intenso de chocolate e doces. Transpiracao na cabeca ao dormir. Sono inquieto com bruxismo. Aversao a leite. Tendencia a infeccoes respiratorias de repeticao. Particulares: Sem fala funcional aos 4 anos — apenas sons guturais. Constipacao cronica. Otite media de repeticao.',
'MIND; AUTISM. MIND; SPEECH, delayed development. MIND; STRIKING, himself. MIND; RESTLESSNESS, children. GENERALS; FAMILY HISTORY, cancer. GENERALS; FOOD, chocolate, desire. HEAD; PERSPIRATION, sleep, during. TEETH; GRINDING, sleep.',
'Carcinosinum: 32 pontos (cobertura 8/8). Tuberculinum: 24 pontos (6/8). Calcarea carb: 20 pontos (5/8). Stramonium: 18 pontos (5/8).',
'Carcinosinum', '200CH dose unica, escalando para 1M e 10M',
'ISAA inicial: 151 (autismo grave). Apos 3 meses (200CH): primeiras palavras isoladas, contato visual intermitente, flapping reduzido. Apos 6 meses (1M): frases de 2 palavras, brincadeira funcional com brinquedos. Apos 12 meses (10M): ISAA = 65 (fora do espectro autista). Fala com frases curtas, brinca com outras criancas, contato visual sustentado. Birras reduziram 80%. Constipacao resolvida.',
5, 'autismo,TEA,carcinosinum,atraso-fala,estereotipias,ISAA,pediatria,classico', 4, 'M', true, NOW(), NOW()),

-- 2. Stramonium em TEA com Hiperatividade e Medo — baseado em estudo Spandan Institute
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Hiperatividade Severa e Medos Intensos — Stramonium',
'Menino de 5 anos com TEA nivel 3 e hiperatividade severa. Medos noturnos intensos (terrores noturnos), comportamento violento, morde e bate. CARS inicial = 35, ATEC = 109. Baseado em caso publicado no Homoeopathic Links (Thieme).',
'Mentais: Hiperatividade extrema — corre sem parar, escala moveis. Agressividade intensa — morde pais e colegas. Terrores noturnos com gritos e agitacao. Medo intenso de escuro, de agua, de cachorro. Desejo de morder tudo (objetos e pessoas). Nao tolera ficar sozinho. Pupilas dilatadas. Gerais: Sede intensa de agua gelada. Pele quente e seca durante crises. Transpiracao minima. Convulsoes febris no passado (1 episodio aos 2 anos). Particulares: Ausencia de fala funcional. Nao responde a comandos simples. Bruxismo intenso durante o sono. Salivacao excessiva.',
'MIND; VIOLENCE. MIND; BITING. MIND; FEAR, dark. MIND; FEAR, water. MIND; SHRIEKING, sleep, during. MIND; RESTLESSNESS, hyperactive. GENERALS; CONVULSIONS, febrile. MOUTH; SALIVATION.',
'Stramonium: 36 pontos (cobertura 8/8). Belladonna: 22 pontos (5/8). Hyoscyamus: 20 pontos (5/8). Tarentula: 18 pontos (4/8).',
'Stramonium', '1M dose unica',
'CARS inicial: 35, ATEC: 109, Hiperatividade: 36. Apos 1 mes: terrores noturnos cessaram. Apos 3 meses: agressividade reduziu 60%, parou de morder. Apos 7 meses: CARS = 32, ATEC = 80, Hiperatividade = 16. Primeiras palavras surgiram. Apos 12 meses: obedece comandos simples, brinca com brinquedos de forma funcional, tolera ambiente escolar.',
4, 'autismo,TEA,stramonium,hiperatividade,medo,agressividade,CARS,ATEC,pediatria,classico', 5, 'M', true, NOW(), NOW()),

-- 3. Natrum Muriaticum em TEA com Isolamento — baseado em estudo Spandan
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Isolamento Social Profundo e Regressao — Natrum Muriaticum',
'Menina de 6 anos que desenvolveu normalmente ate os 18 meses, quando regrediu apos nascimento do irmao. Parou de falar, isolamento completo, recusa contato fisico. Desejo de sal. Herpes labial recorrente. Baseado em serie de casos do Spandan Holistic Institute, Mumbai.',
'Mentais: Regressao do desenvolvimento apos nascimento do irmao (18 meses). Isolamento completo — fica no canto do quarto. Recusa contato fisico — rejeita abracos. Nao chora na frente dos outros, mas chora sozinha. Rancor silencioso. Evita olhar nos olhos. Gerais: Desejo intenso de sal — lambe sal puro. Emagrecimento progressivo. Herpes labial recorrente. Piora ao sol e calor. Cefaleia ao sol. Pele oleosa. Particulares: Fala que havia se desenvolvido normalmente regrediu completamente. Constipacao com fezes ressecadas. Enurese noturna.',
'MIND; AILMENTS FROM, grief, silent. MIND; AVERSION, company. MIND; WEEPING, alone. GENERALS; FOOD, salt, desire. SKIN; HERPES, labialis. MIND; AUTISM, regression. BLADDER; ENURESIS, nocturnal.',
'Natrum muriaticum: 30 pontos (cobertura 7/7). Ignatia: 22 pontos (5/7). Sepia: 18 pontos (4/7). Phosphorus: 16 pontos (4/7).',
'Natrum Muriaticum', '200CH dose unica, depois 1M',
'Apos 2 meses (200CH): comecou a aceitar contato fisico da mae. Herpes nao recorreu. Apos 4 meses: voltou a emitir sons com intencao comunicativa. Apos 6 meses (1M): primeiras palavras retornaram — "mama" e "agua". Contato visual presente em 50% do tempo. Apos 12 meses: frases de 3 palavras, brinca perto de outras criancas (brincadeira paralela). ATEC reduziu 45%. Enurese resolvida.',
4, 'autismo,TEA,regressao,isolamento,natrum-muriaticum,ATEC,pediatria,classico', 6, 'F', true, NOW(), NOW()),

-- 4. Calcarea Carbonica em TEA com Atraso Global — baseado em estudo Mumbai
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Atraso Global do Desenvolvimento e Hipotonia — Calcarea Carbonica',
'Menino de 3 anos com TEA e atraso global do desenvolvimento. Gordinho, flacido, cabeca grande. Transpiracao na cabeca ao dormir. Dentificacao tardia. Desejo de ovo. Medo de insetos. ATEC inicial = 98. Baseado em serie de casos clinicos publicados.',
'Mentais: Crianca lenta, observadora, nao interage. Medo de insetos e animais pequenos. Teimosia quando contrariado — bate a cabeca no chao. Interesses restritos (alinha objetos por horas). Nao responde ao nome. Gerais: Gordinho, flacido, palido. Cabeca desproporcionalmente grande. Transpiracao profusa na cabeca ao dormir (travesseiro molhado). Pes frios e umidos. Dentificacao muito tardia — 6 dentes aos 3 anos. Desejo de ovo e massa. Aversao a carne. Infeccoes de repeticao (otite, amigdalite). Particulares: Sentou com 12 meses, andou com 24 meses (ambos tardios). Sem fala funcional aos 3 anos. Hipotonia generalizada. Obstipacao cronica.',
'MIND; AUTISM. GENERALS; DEVELOPMENT, arrested. HEAD; PERSPIRATION, sleep, during. HEAD; LARGE. TEETH; DENTITION, slow. GENERALS; FOOD, eggs, desire. GENERALS; OBESITY, children, flabby. MIND; FEAR, insects.',
'Calcarea carbonica: 34 pontos (cobertura 8/8). Baryta carb: 24 pontos (6/8). Silicea: 20 pontos (5/8). Carcinosinum: 18 pontos (5/8).',
'Calcarea Carbonica', '200CH dose unica, depois 1M',
'ATEC inicial: 98. Apos 1 mes: transpiracao reduziu, sono mais profundo. Apos 3 meses: novos dentes surgiram, comecou a responder ao nome. Apos 6 meses (1M): primeiros sons intencionais, aponta para objetos desejados. Tono muscular melhorou. Apos 12 meses: ATEC = 52 (reducao de 47%). Brinca de forma funcional, obedece comandos simples, emite 10 palavras funcionais.',
4, 'autismo,TEA,atraso-desenvolvimento,hipotonia,calcarea,ATEC,pediatria,classico', 3, 'M', true, NOW(), NOW()),

-- 5. Tarentula Hispanica em TEA com Hiperatividade Ritmica
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Hiperatividade Ritmica e Fascinio por Musica — Tarentula Hispanica',
'Menino de 7 anos com TEA e TDAH comorbido. Hiperatividade extrema com componente ritmico — balanca o corpo, bate palmas ritmicamente. Fascinio por musica e cores brilhantes. Destrutivo com brinquedos. Baseado em literatura homeopatica classica e casos do Spandan Institute.',
'Mentais: Hiperatividade extrema com qualidade ritmica — danca, balanca, bate palmas em ritmo. Fascinio intenso por musica — acalma com musica. Destrutivo — quebra brinquedos sistematicamente. Impaciencia — nao consegue esperar. Mudancas bruscas de humor — ri e chora sem motivo aparente. Manipulador — consegue o que quer com charme. Gerais: Energia inesgotavel — nao para de se mover. Sensibilidade a cores — atrai-se por cores vivas. Sede moderada. Apetite voraz mas seletivo. Particulares: Fala presente mas ecolalica — repete frases de desenhos. Coordenacao motora fina deficiente. Tiques motores nas maos.',
'MIND; RESTLESSNESS, hyperactive. MIND; DANCING. MIND; DESTRUCTIVENESS. MIND; MUSIC, ameliorates. MIND; IMPATIENCE. MIND; MOOD, changeable. EXTREMITIES; CHOREIC movements.',
'Tarentula hispanica: 30 pontos (cobertura 7/7). Stramonium: 22 pontos (5/7). Veratrum album: 18 pontos (4/7). Hyoscyamus: 16 pontos (4/7).',
'Tarentula Hispanica', '200CH dose unica, depois 1M',
'Apos 2 semanas: hiperatividade reduziu 30%, permanece sentado por 5 minutos. Apos 2 meses: destrutividade diminuiu, comeca a usar brinquedos funcionalmente. Apos 4 meses (1M): ecolalia reduziu, surgem frases espontaneas. Apos 8 meses: permanece em sala de aula por 30 minutos, segue rotina escolar. ATEC reduziu 38%. Coordenacao motora fina melhorou — segura lapis corretamente.',
4, 'autismo,TEA,TDAH,hiperatividade,musica,tarentula,ATEC,pediatria,classico', 7, 'M', true, NOW(), NOW()),

-- 6. Nux Vomica em TEA Leve (Asperger) com Irritabilidade
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA Nivel 1 (Asperger) com Irritabilidade e Hipersensibilidade Sensorial — Nux Vomica',
'Menino de 10 anos com diagnostico de TEA nivel 1 (antigo Asperger). Inteligencia acima da media, interesses restritos em matematica. Irritabilidade extrema, hipersensibilidade sensorial (ruidos, texturas). Insonia. ISAA inicial = 73. Baseado em estudo publicado no Journal of Integrated Health Sciences.',
'Mentais: Inteligencia acima da media — excelente em matematica. Irritabilidade extrema com raiva explosiva. Intolerancia a frustracao. Competitivo ao extremo. Rigidez de pensamento — precisa de rotina fixa. Hipersensivel a criticas. Gerais: Hipersensibilidade sensorial marcante — intolerancia a ruidos altos, texturas de roupas, cheiros fortes. Frio — piora com correntes de ar. Insonia inicial com despertar as 3h da manha. Desejo de alimentos condimentados e picantes. Obstipacao com urgencia ineficaz. Particulares: Fala fluente mas monotona, sem prosódia. Dificuldade em entender sarcasmo e figuras de linguagem. Cefaleia tensional frequente. Bruxismo noturno.',
'MIND; IRRITABILITY, violent. MIND; SENSITIVE, noise, to. MIND; FASTIDIOUS. SLEEP; WAKING, 3h. GENERALS; COLD, aggravation. GENERALS; FOOD, spicy, desire. RECTUM; CONSTIPATION, ineffectual urging.',
'Nux vomica: 32 pontos (cobertura 7/7). Arsenicum: 22 pontos (5/7). Lycopodium: 20 pontos (5/7). Chamomilla: 16 pontos (4/7).',
'Nux Vomica', '1M dose unica',
'ISAA inicial: 73 (autismo leve). Apos 1 mes: sono melhorou, acorda descansado. Irritabilidade reduziu 40%. Apos 3 meses: tolera mudancas de rotina com menos estresse. Apos 6 meses: bruxismo cessou, cefaleia rara. Apos 10 meses: ISAA = 44 (abaixo do ponto de corte). Interacao social melhorou — fez 2 amigos na escola. Aceita texturas variadas de roupa.',
4, 'autismo,TEA,asperger,irritabilidade,sensorial,nux-vomica,ISAA,pediatria,classico', 10, 'M', true, NOW(), NOW()),

-- 7. Tuberculinum em TEA com Inquietacao e Desejo de Viagem
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Inquietacao Cronica e Tendencia a Infeccoes — Tuberculinum',
'Menina de 5 anos com TEA e historico de infeccoes respiratorias de repeticao. Inquietacao constante — nao para em nenhum lugar. Emagrecimento apesar de bom apetite. Desejo de carne defumada. Historico familiar de tuberculose (bisavo). ATEC = 88.',
'Mentais: Inquietacao profunda — desejo constante de mudar de lugar, de atividade. Birras violentas com destruicao de objetos quando contrariada. Medo de cachorro. Bate nos animais de estimacao. Precisa de estimulacao constante — entedia-se rapidamente. Gerais: Magra apesar de comer bem. Infeccoes respiratorias de repeticao (bronquite, pneumonia). Transpiracao noturna. Desejo de carne defumada e alimentos frios. Historico familiar de tuberculose. Glanglios cervicais palpaveis. Particulares: Fala limitada a 5 palavras. Ecolalia presente. Dificuldade em segurar lapis. Rinite alergica cronica.',
'MIND; RESTLESSNESS, desire to travel. MIND; DESTRUCTIVENESS. GENERALS; EMACIATION, eating well, while. GENERALS; FAMILY HISTORY, tuberculosis. CHEST; BRONCHITIS, recurrent. GENERALS; PERSPIRATION, night. GENERALS; FOOD, smoked meat, desire.',
'Tuberculinum: 30 pontos (cobertura 7/7). Phosphorus: 22 pontos (5/7). Calcarea phos: 20 pontos (5/7). Arsenicum iod: 16 pontos (4/7).',
'Tuberculinum Bovinum', '1M dose unica a cada 2 meses',
'ATEC inicial: 88. Apos 1 mes: inquietacao reduziu, permanece em atividades por 10 minutos. Apos 3 meses: infeccoes respiratorias nao recorreram. Ganho de peso de 1.5 kg. Apos 6 meses: vocabulario ampliou para 25 palavras. Ecolalia diminuiu. Apos 12 meses: ATEC = 48 (reducao de 45%). Frequenta escola especial com bom desempenho. Coordenacao motora fina melhorou.',
4, 'autismo,TEA,tuberculinum,infeccoes,inquietacao,ATEC,pediatria,classico', 5, 'F', true, NOW(), NOW()),

-- 8. Opium em TEA com Apatia Profunda e Ausencia de Dor
(gen_random_uuid()::text, 'cmn0s6mtw000801s95mcj825v', 'cmn0s6mu2000901s9uw8abol2',
'TEA com Apatia Profunda e Insensibilidade a Dor — Opium',
'Menino de 4 anos com TEA nivel 3 e apatia profunda. Nao chora quando se machuca, nao reage a estimulos dolorosos. Olhar distante e vazio. Constipacao severa sem vontade. Historico de parto dificil com uso de anestesia. CARS = 42.',
'Mentais: Apatia profunda — indiferenca a tudo ao redor. Olhar vazio, distante, como se estivesse em outro mundo. Nao chora quando se machuca — insensibilidade aparente a dor. Nao demonstra medo de nada. Reacao lentificada a estimulos. Sono excessivo. Gerais: Historico de parto traumatico com uso de anestesia/medicacao forte. Face corada, quente. Transpiracao quente. Constipacao severa — sem vontade de evacuar por dias. Fezes duras em bolotas. Particulares: Sem fala. Sem gesto de apontar. Pupila contraida (miose). Retencao urinaria frequente. Sonolencia diurna excessiva.',
'MIND; INDIFFERENCE, apathy. MIND; INSENSIBILITY, pain, to. MIND; AILMENTS FROM, anesthesia. MIND; STUPOR. RECTUM; CONSTIPATION, no desire. SLEEP; SOMNOLENCE. EYE; PUPIL, contracted.',
'Opium: 32 pontos (cobertura 7/7). Helleborus: 22 pontos (5/7). Carbo veg: 16 pontos (3/7). Nux moschata: 14 pontos (3/7).',
'Opium', '200CH dose unica',
'CARS inicial: 42 (autismo severo). Apos 2 semanas: crianca comecou a chorar quando cai — recuperacao da sensibilidade. Apos 1 mes: olhar mais presente, acompanha objetos. Constipacao melhorou. Apos 3 meses (1M): primeiras reacoes emocionais — sorri para mae. Apos 6 meses: emite sons com intencionalidade. Aponta para objetos. CARS = 34. Apos 12 meses: CARS = 28 (abaixo do ponto de corte para autismo severo). 5 palavras funcionais.',
4, 'autismo,TEA,apatia,insensibilidade-dor,parto-traumatico,opium,CARS,pediatria,classico', 4, 'M', true, NOW(), NOW());
