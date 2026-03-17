export interface AnamnesisTemplate {
  id: string;
  name: string;
  description: string;
  specialty: string;
  sections: {
    key: string;
    label: string;
    icon: string;
    enabled: boolean;
    questions: string[];
  }[];
}

export const defaultTemplates: AnamnesisTemplate[] = [
  {
    id: "geral",
    name: "Geral (Padrao)",
    description: "Anamnese homeopatica completa com todas as 8 secoes",
    specialty: "Homeopatia Geral",
    sections: [
      {
        key: "mental", label: "Sintomas Mentais", icon: "\u{1F9E0}", enabled: true,
        questions: [
          "Como e o temperamento do paciente? (calmo, ansioso, irritavel, melancolico)",
          "Tem medos? Quais? (escuro, solidao, morte, doenca, futuro, multidoes)",
          "Como reage ao estresse? (chora, isola-se, fica agressivo, come mais)",
          "Ha tristeza, depressao ou apatia? Desde quando?",
          "Ha ansiedade? Em que situacoes piora?",
          "Como e a memoria e concentracao?",
          "Ha irritabilidade? O que a provoca?",
        ],
      },
      {
        key: "general", label: "Sintomas Gerais", icon: "\u{1F3E5}", enabled: true,
        questions: [
          "Qual a queixa principal e ha quanto tempo?",
          "O que piora os sintomas? (frio, calor, umidade, movimento, repouso)",
          "O que melhora os sintomas? (calor, frio, ar livre, repouso, movimento)",
          "Ha horario de piora? (manha, tarde, noite, madrugada)",
          "Ha lateralidade? (sintomas mais do lado direito ou esquerdo)",
          "Como e o nivel de energia?",
        ],
      },
      {
        key: "desires", label: "Desejos e Aversoes Alimentares", icon: "\u{1F37D}\u{FE0F}", enabled: true,
        questions: [
          "Quais alimentos deseja fortemente?",
          "Ha aversao a algum alimento?",
          "Como e a sede?",
          "Como e o apetite?",
        ],
      },
      {
        key: "sleep", label: "Sono e Sonhos", icon: "\u{1F319}", enabled: true,
        questions: [
          "Como e a qualidade do sono?",
          "Tem dificuldade para adormecer?",
          "Acorda durante a noite?",
          "Ha sonhos recorrentes?",
        ],
      },
      {
        key: "perspiration", label: "Transpiracao", icon: "\u{1F4A7}", enabled: true,
        questions: [
          "Sua com facilidade?",
          "Em quais partes do corpo sua mais?",
          "O suor tem odor?",
        ],
      },
      {
        key: "thermoregulation", label: "Termorregulacao", icon: "\u{1F321}\u{FE0F}", enabled: true,
        questions: [
          "O paciente e mais friorento ou calorento?",
          "Piora com mudanca de temperatura?",
          "Ha partes do corpo especialmente frias ou quentes?",
        ],
      },
      {
        key: "gyneco", label: "Ginecologico", icon: "\u2640\u{FE0F}", enabled: true,
        questions: [
          "Ciclo menstrual: regular ou irregular?",
          "Ha colica menstrual?",
          "Sindrome pre-menstrual: quais sintomas?",
        ],
      },
      {
        key: "particular", label: "Sintomas Particulares", icon: "\u{1F4CB}", enabled: true,
        questions: [
          "Cabeca: cefaleias? Tipo? Localizacao?",
          "Respiratorio: tosse, dispneia, asma?",
          "Digestivo: azia, refluxo, gases, diarreia, constipacao?",
          "Pele: erupcoes, coceira, ressecamento?",
        ],
      },
    ],
  },
  {
    id: "pediatria",
    name: "Pediatria Homeopatica",
    description: "Anamnese focada em criancas e adolescentes",
    specialty: "Pediatria",
    sections: [
      {
        key: "mental", label: "Comportamento e Emocional", icon: "\u{1F9E0}", enabled: true,
        questions: [
          "Como e o comportamento da crianca? (agitada, calma, timida, agressiva)",
          "Como reage a separacao dos pais?",
          "Tem medos? (escuro, animais, escola, pessoas estranhas)",
          "Como e na escola? (sociavel, isolada, dificuldade de aprendizado)",
          "Ha birras frequentes? Em que situacoes?",
          "Como e o humor geral? (alegre, chorosa, irritada)",
          "Ha dificuldade de concentracao ou hiperatividade?",
        ],
      },
      {
        key: "general", label: "Desenvolvimento e Crescimento", icon: "\u{1F3E5}", enabled: true,
        questions: [
          "Marcos do desenvolvimento: sentou, andou, falou com que idade?",
          "Peso e altura estao adequados para a idade?",
          "Ha doencas de infancia? Quais? (catapora, caxumba, sarampo)",
          "Vacinacao em dia?",
          "Ha infeccoes recorrentes? (otite, amigdalite, bronquite)",
          "Como foi a gestacao e o parto?",
          "Amamentacao: exclusiva ate quando? Dificuldades?",
        ],
      },
      {
        key: "desires", label: "Alimentacao Infantil", icon: "\u{1F37D}\u{FE0F}", enabled: true,
        questions: [
          "Como e o apetite? (voraz, seletivo, inapetente)",
          "Aceita frutas e verduras?",
          "Deseja doces, salgados, fast food?",
          "Ha alergia ou intolerancia alimentar?",
          "Bebe agua suficiente?",
          "Ha colicas ou vomitos frequentes?",
        ],
      },
      {
        key: "sleep", label: "Sono da Crianca", icon: "\u{1F319}", enabled: true,
        questions: [
          "Dorme bem? Quantas horas por noite?",
          "Ha dificuldade para adormecer? Precisa de companhia?",
          "Tem pesadelos ou terrores noturnos?",
          "Ha enurese noturna (xixi na cama)?",
          "Ronca ou respira pela boca?",
          "Em que posicao dorme?",
        ],
      },
      {
        key: "perspiration", label: "Transpiracao", icon: "\u{1F4A7}", enabled: true,
        questions: [
          "Sua muito? Em quais partes?",
          "Suor na cabeca ao dormir?",
          "O suor tem odor?",
        ],
      },
      {
        key: "thermoregulation", label: "Termorregulacao", icon: "\u{1F321}\u{FE0F}", enabled: true,
        questions: [
          "A crianca e mais friorenta ou calorenta?",
          "Piora com mudancas de tempo?",
          "Pes e maos frios ou quentes?",
        ],
      },
      { key: "gyneco", label: "Ginecologico", icon: "\u2640\u{FE0F}", enabled: false, questions: [] },
      {
        key: "particular", label: "Sintomas Particulares", icon: "\u{1F4CB}", enabled: true,
        questions: [
          "Pele: eczema, dermatite atopica, assaduras?",
          "Respiratorio: bronquite, asma, rinite alergica?",
          "Ouvidos: otites recorrentes?",
          "Digestivo: colicas, diarreia, constipacao, refluxo?",
          "Denticao: dificuldades, febre, diarreia?",
        ],
      },
    ],
  },
  {
    id: "dermatologia",
    name: "Dermatologia Homeopatica",
    description: "Anamnese focada em sintomas de pele e mucosas",
    specialty: "Dermatologia",
    sections: [
      {
        key: "mental", label: "Emocional e Pele", icon: "\u{1F9E0}", enabled: true,
        questions: [
          "Ha relacao entre estresse emocional e piora da pele?",
          "Como o paciente lida com a aparencia da lesao? (vergonha, ansiedade, irritacao)",
          "Ha eventos emocionais que precederam o aparecimento?",
          "Ha coceira que piora com estresse?",
        ],
      },
      {
        key: "general", label: "Caracteristicas da Lesao", icon: "\u{1F3E5}", enabled: true,
        questions: [
          "Tipo de lesao: erupcao, vesiculas, pustulas, descamacao, manchas, urticaria?",
          "Localizacao e extensao?",
          "Quando surgiu? O que precedeu? (medicamento, alimento, estresse, infeccao)",
          "Modalidades: piora com frio, calor, agua, suor, roupa, cocar?",
          "Melhora com: frio, calor, ar livre, repouso?",
          "Ha supuracao? Cor e odor da secrecao?",
          "Ha cicatrizacao lenta?",
          "Historico: eczema, psoriase, vitiligo, acne, dermatite na familia?",
        ],
      },
      {
        key: "desires", label: "Alimentacao e Pele", icon: "\u{1F37D}\u{FE0F}", enabled: true,
        questions: [
          "Algum alimento piora a pele? (laticeos, gluten, acucar, frutos do mar)",
          "Ha desejo alimentar intenso?",
          "Como e a hidratacao? Bebe agua suficiente?",
        ],
      },
      {
        key: "sleep", label: "Sono", icon: "\u{1F319}", enabled: true,
        questions: [
          "A coceira piora a noite?",
          "Cocar durante o sono?",
          "Posicao de dormir afeta a pele?",
        ],
      },
      {
        key: "perspiration", label: "Transpiracao e Pele", icon: "\u{1F4A7}", enabled: true,
        questions: [
          "O suor piora ou melhora os sintomas?",
          "Ha erupcoes nas areas de suor?",
          "O suor tem cor ou odor?",
        ],
      },
      {
        key: "thermoregulation", label: "Termorregulacao", icon: "\u{1F321}\u{FE0F}", enabled: true,
        questions: [
          "Calor ou frio piora a pele?",
          "Piora com banho quente ou frio?",
          "Como reage ao sol? (piora, melhora, manchas)",
        ],
      },
      { key: "gyneco", label: "Ginecologico", icon: "\u2640\u{FE0F}", enabled: false, questions: [] },
      {
        key: "particular", label: "Detalhes da Pele", icon: "\u{1F4CB}", enabled: true,
        questions: [
          "Unhas: quebradichas, fungos, deformacoes?",
          "Cabelos: queda, caspa, ressecamento, oleosidade?",
          "Mucosas: aftas, herpes, lesoes orais ou genitais?",
          "Cicatrizacao: queloides, cicatrizes hipertroficas?",
          "Ha relacao com o ciclo menstrual? (para mulheres)",
        ],
      },
    ],
  },
  {
    id: "ginecologia",
    name: "Ginecologia Homeopatica",
    description: "Anamnese focada em saude da mulher",
    specialty: "Ginecologia",
    sections: [
      {
        key: "mental", label: "Emocional e Hormonal", icon: "\u{1F9E0}", enabled: true,
        questions: [
          "Ha alteracoes de humor relacionadas ao ciclo menstrual?",
          "Ha irritabilidade, tristeza ou ansiedade pre-menstrual?",
          "Como e a libido?",
          "Ha historico de depressao pos-parto?",
          "Relacao com a feminilidade e maternidade?",
        ],
      },
      {
        key: "general", label: "Sintomas Gerais", icon: "\u{1F3E5}", enabled: true,
        questions: [
          "Queixa principal ginecologica?",
          "Ha dores pelvicas? Quando? (menstrual, ovulacao, constante)",
          "Ha inchaço? Quando piora?",
          "Nivel de energia ao longo do ciclo?",
        ],
      },
      {
        key: "desires", label: "Desejos Alimentares", icon: "\u{1F37D}\u{FE0F}", enabled: true,
        questions: [
          "Ha desejos alimentares pre-menstruais? (doce, salgado, chocolate)",
          "Ha nauseas? Relacionadas a ciclo ou gestacao?",
          "A alimentacao muda com o ciclo?",
        ],
      },
      {
        key: "sleep", label: "Sono", icon: "\u{1F319}", enabled: true,
        questions: [
          "O sono piora antes da menstruacao?",
          "Ha insonia na menopausa?",
          "Ha fogachos noturnos que acordam?",
        ],
      },
      { key: "perspiration", label: "Transpiracao", icon: "\u{1F4A7}", enabled: true,
        questions: [
          "Ha suor noturno? Relacionado a menopausa?",
          "Fogachos com sudorese?",
        ],
      },
      {
        key: "thermoregulation", label: "Termorregulacao", icon: "\u{1F321}\u{FE0F}", enabled: true,
        questions: [
          "Ha ondas de calor?",
          "Pioram de dia ou de noite?",
          "Pés frios e rosto quente?",
        ],
      },
      {
        key: "gyneco", label: "Ginecologico (Detalhado)", icon: "\u2640\u{FE0F}", enabled: true,
        questions: [
          "Menarca: com que idade?",
          "Ciclo menstrual: regular? Quantos dias? Intervalo?",
          "Fluxo: escasso, normal, abundante? Cor? Coagulos?",
          "Colica menstrual: intensidade (1-10)? O que alivia? O que piora?",
          "SPM: quais sintomas? Quantos dias antes?",
          "Corrimento: cor, odor, consistencia? Quando piora?",
          "Historico obstetrico: gestacoes, partos, cesareas, abortos?",
          "Uso de anticoncepcional? Qual? Ha quanto tempo?",
          "Menopausa: quando comecou? Sintomas? (fogachos, secura, humor)",
          "Ultimo papanicolau e mamografia?",
          "Ha miomas, cistos, endometriose, SOP?",
          "Ha dispareunia (dor na relacao)?",
        ],
      },
      {
        key: "particular", label: "Sintomas Associados", icon: "\u{1F4CB}", enabled: true,
        questions: [
          "Ha cefaleias hormonais?",
          "Ha acne hormonal?",
          "Ha queda de cabelo?",
          "Ha retencao de liquido?",
          "Ha sintomas urinarios? (cistite de repeticao, incontinencia)",
        ],
      },
    ],
  },
];
