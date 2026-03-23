#!/usr/bin/env python3
"""Generate HomeoClinic Pro step-by-step usage guide PDF with proper Portuguese accents."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Arial fonts for proper accent support
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Italic', 'C:/Windows/Fonts/ariali.ttf'))
pdfmetrics.registerFont(TTFont('Arial-BoldItalic', 'C:/Windows/Fonts/arialbi.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-BoldItalic')

TEAL = HexColor("#0d9488")
GRAY = HexColor("#444444")
LGRAY = HexColor("#f0f0f0")
AMBER = HexColor("#d97706")
W = A4[0] - 5*cm  # usable width

def build():
    path = r"C:\Users\Carlos Honorato\OneDrive\Área de trabalho\SIHOREMAX7\HomeoClinicPro-Projeto\docs\guia-de-uso-homeoclinic-pro.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.5*cm, rightMargin=2.5*cm)
    S = getSampleStyleSheet()

    F = 'Arial'
    S.add(ParagraphStyle('CT', parent=S['Title'], fontName=F, fontSize=28, leading=34, textColor=TEAL, spaceAfter=6, alignment=TA_CENTER))
    S.add(ParagraphStyle('CS', parent=S['Normal'], fontName=F, fontSize=14, leading=18, textColor=GRAY, alignment=TA_CENTER, spaceAfter=4))
    S.add(ParagraphStyle('H1', parent=S['Heading1'], fontName='Arial-Bold', fontSize=20, leading=24, textColor=TEAL, spaceBefore=20, spaceAfter=10))
    S.add(ParagraphStyle('H2', parent=S['Heading2'], fontName='Arial-Bold', fontSize=14, leading=18, textColor=HexColor("#333"), spaceBefore=14, spaceAfter=6))
    S.add(ParagraphStyle('H3', parent=S['Heading3'], fontName='Arial-Bold', fontSize=11, leading=14, textColor=HexColor("#555"), spaceBefore=8, spaceAfter=4))
    S.add(ParagraphStyle('B', parent=S['Normal'], fontName=F, fontSize=10, leading=14, alignment=TA_JUSTIFY, spaceAfter=6, textColor=HexColor("#222")))
    S.add(ParagraphStyle('BL', parent=S['Normal'], fontName=F, fontSize=10, leading=14, leftIndent=20, bulletIndent=10, spaceAfter=3, textColor=HexColor("#222")))
    S.add(ParagraphStyle('Step', parent=S['Normal'], fontName=F, fontSize=10, leading=14, leftIndent=25, bulletIndent=5, spaceAfter=4, textColor=HexColor("#222")))
    S.add(ParagraphStyle('Tip', parent=S['Normal'], fontName=F, fontSize=9, leading=13, leftIndent=15, rightIndent=15, spaceBefore=6, spaceAfter=8, backColor=HexColor("#e6f7f5"), borderPadding=8, textColor=HexColor("#0d7c72")))
    S.add(ParagraphStyle('Warn', parent=S['Normal'], fontName=F, fontSize=9, leading=13, leftIndent=15, rightIndent=15, spaceBefore=6, spaceAfter=8, backColor=HexColor("#fef3c7"), borderPadding=8, textColor=HexColor("#92400e")))
    S.add(ParagraphStyle('Nav', parent=S['Normal'], fontName=F, fontSize=9, leading=12, leftIndent=15, spaceBefore=4, spaceAfter=6, textColor=TEAL))
    S.add(ParagraphStyle('Ft', parent=S['Normal'], fontName=F, fontSize=8, textColor=GRAY, alignment=TA_CENTER))
    S.add(ParagraphStyle('TOC', parent=S['Normal'], fontName=F, fontSize=11, leading=16, spaceAfter=2))

    story = []
    def b(t): return Paragraph(f"&bull; {t}", S['BL'])
    def step(n, t): return Paragraph(f"<b>{n}.</b> {t}", S['Step'])
    def nav(t): return Paragraph(f"<font color='#0d9488'><b>Caminho:</b></font> {t}", S['Nav'])
    def tip(t): return Paragraph(f"<b>Dica:</b> {t}", S['Tip'])
    def warn(t): return Paragraph(f"<b>Atenção:</b> {t}", S['Warn'])
    def hr(): return HRFlowable(width="100%", thickness=0.5, color=HexColor("#dddddd"), spaceBefore=8, spaceAfter=8)

    # ══════════════════════════════════
    # COVER
    # ══════════════════════════════════
    story.append(Spacer(1, 60))
    story.append(Paragraph("HomeoClinic Pro", S['CT']))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Guia de Uso", S['CS']))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Passo a Passo para Utilizar Todas as Funcionalidades", S['CS']))
    story.append(Spacer(1, 30))
    story.append(Paragraph("Versão 3.0 | Março 2026", S['CS']))
    story.append(Paragraph("homeoclinic-ia.com", S['CS']))
    story.append(PageBreak())

    # ══════════════════════════════════
    # TOC
    # ══════════════════════════════════
    story.append(Paragraph("Sumário", S['H1']))
    for item in [
        "1. Criar Conta e Configurar Clínica",
        "2. Cadastrar e Gerenciar Pacientes",
        "3. Realizar Anamnese Homeopática",
        "4. Gravar Consulta por Voz (Transcrição IA)",
        "5. Registrar Consulta no Prontuário",
        "6. Navegar no Repertório e Buscar Rubricas",
        "7. Pesquisar na Matéria Medica",
        "8. Executar Repertorização",
        "9. Usar o Assistente de IA",
        "10. Gerenciar a Agenda (Dia, Semana, Mês)",
        "11. Realizar Teleconsulta",
        "12. Registrar Casos Clínicos",
        "13. Emitir Documentos (Receita, Atestado, TCLE)",
        "14. Importar e Exportar Pacientes (CSV)",
        "15. Controle Financeiro",
        "16. Auditoria e Conformidade LGPD",
        "17. Configurações da Clínica e Equipe",
        "18. Fitoterapia e Dicionário Médico",
        "19. Dashboard Analítico",
        "20. App Mobile (PWA)",
        "21. WhatsApp e Lembretes Automaticos",
        "22. Portal do Paciente",
    ]:
        story.append(Paragraph(item, S['TOC']))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 1. CRIAR CONTA
    # ══════════════════════════════════
    story.append(Paragraph("1. Criar Conta e Configurar Clínica", S['H1']))
    story.append(nav("homeoclinic-ia.com > Comecar Gratis"))
    story.append(Paragraph("1.1 Criando sua conta", S['H2']))
    story.append(step(1, "Acesse <b>homeoclinic-ia.com</b> e clique em <b>\"Comecar Gratis\"</b>"))
    story.append(step(2, "Na tela de login, clique em <b>\"Primeiro acesso? Criar conta\"</b>"))
    story.append(step(3, "Preencha: <b>Nome da Clínica</b>, <b>Seu Nome</b>, <b>E-mail</b> e <b>Senha</b>"))
    story.append(tip("A senha deve ter no minimo 8 caracteres, com maiúscula, minúscula, número e caractere especial (ex: !@#$%)."))
    story.append(step(4, "Clique em <b>\"Criar Conta\"</b>"))
    story.append(step(5, "Você será redirecionado para a tela de <b>Onboarding</b>"))

    story.append(Paragraph("1.2 Configurando a clínica (Onboarding)", S['H2']))
    story.append(step(1, "Preencha os dados da clínica: <b>Nome</b>, <b>CNPJ</b>, <b>Telefone</b>, <b>E-mail</b>, <b>Endereço</b>"))
    story.append(step(2, "Informe o <b>CRM</b> do responsavel"))
    story.append(step(3, "Informe o <b>DPO</b> (Encarregado de Dados) -- nome e e-mail"))
    story.append(step(4, "Clique em <b>\"Salvar e Comecar\"</b>"))
    story.append(Paragraph("Pronto! Você será levado ao Dashboard.", S['B']))
    story.append(hr())

    # ══════════════════════════════════
    # 2. PACIENTES
    # ══════════════════════════════════
    story.append(Paragraph("2. Cadastrar e Gerenciar Pacientes", S['H1']))
    story.append(nav("Menu lateral > Pacientes"))

    story.append(Paragraph("2.1 Cadastrar novo paciente", S['H2']))
    story.append(step(1, "Na lista de pacientes, clique em <b>\"Novo Paciente\"</b> (botao verde no canto superior direito)"))
    story.append(step(2, "Preencha os <b>Dados Pessoais</b>: Nome Completo (obrigatório), CPF, RG, Data de Nascimento, Sexo"))
    story.append(step(3, "Preencha o <b>Contato</b>: Telefone, E-mail, Endereço"))
    story.append(step(4, "Preencha os <b>Dados Clínicos</b>: Profissão, Convênio, Observações"))
    story.append(step(5, "Marque o <b>Consentimento LGPD</b> -- o paciente deve autorizar o tratamento de seus dados"))
    story.append(warn("Sem o consentimento LGPD, não será possível registrar consultas para este paciente."))
    story.append(step(6, "Clique em <b>\"Cadastrar Paciente\"</b>"))

    story.append(Paragraph("2.2 Buscar e visualizar pacientes", S['H2']))
    story.append(step(1, "Use o campo <b>\"Buscar paciente por nome...\"</b> no topo da lista"))
    story.append(step(2, "Clique no <b>nome do paciente</b> para acessar sua ficha completa"))
    story.append(step(3, "Na ficha, navegue pelas abas: <b>Dados Pessoais</b>, <b>Consultas</b> e <b>Anamnese Homeopática</b>"))

    story.append(Paragraph("2.3 Editar ou excluir paciente", S['H2']))
    story.append(step(1, "Na ficha do paciente, clique em <b>\"Editar\"</b> para alterar dados"))
    story.append(step(2, "Para excluir, clique em <b>\"Excluir\"</b> e confirme"))
    story.append(tip("A exclusão e um soft delete -- os dados sao preservados por 20 anos conforme exigência do CFM."))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 3. ANAMNESE
    # ══════════════════════════════════
    story.append(Paragraph("3. Realizar Anamnese Homeopática", S['H1']))
    story.append(nav("Pacientes > [Paciente] > Aba \"Anamnese Homeopática\""))

    story.append(Paragraph("3.1 Escolher o template", S['H2']))
    story.append(step(1, "Na aba Anamnese, localize o seletor <b>\"Modelo:\"</b> no topo"))
    story.append(step(2, "Escolha o template adequado:"))
    story.append(b("<b>Homeopatia Clássica</b> -- formulario padrao com 8 seções completas"))
    story.append(b("<b>Pediatria Homeopática</b> -- adaptado para criancas"))
    story.append(b("<b>Dermatologia</b> -- foco em sintomas de pele"))
    story.append(b("<b>Ginecologia/Obstetrícia</b> -- ciclo menstrual, hormonal"))
    story.append(b("<b>Psiquiatria</b> -- humor, afeto, pensamento, percepcao, risco"))
    story.append(tip("Ao selecionar um template, as perguntas-guia de cada seção sao atualizadas. O conteúdo ja digitado nao e apagado."))

    story.append(Paragraph("3.2 Preencher as seções", S['H2']))
    story.append(Paragraph("Cada seção possui uma caixa de texto e perguntas-guia em cinza:", S['B']))
    story.append(b("<b>Sintomas Mentais</b> -- Temperamento, medos, ansiedade, humor, memória"))
    story.append(b("<b>Sintomas Gerais</b> -- Modalidades, energia, antecedentes"))
    story.append(b("<b>Desejos e Aversões</b> -- Alimentos, sede, apetite"))
    story.append(b("<b>Sono e Sonhos</b> -- Qualidade, posicao, sonhos recorrentes"))
    story.append(b("<b>Transpiração</b> -- Profusao, localização, odor"))
    story.append(b("<b>Termorregulação</b> -- Preferência térmica, tolerância"))
    story.append(b("<b>Ginecológico</b> -- Ciclo, fluxo, TPM, menopausa"))
    story.append(b("<b>Sintomas Particulares</b> -- Cabeça aos pés"))

    story.append(Paragraph("3.3 Gravar por voz (opcional)", S['H2']))
    story.append(step(1, "Clique no botao <b>microfone</b> ao lado do título da seção"))
    story.append(step(2, "Fale os sintomas do paciente -- o timer indica o tempo de gravação"))
    story.append(step(3, "Clique em <b>\"Parar\"</b> para encerrar"))
    story.append(step(4, "A IA transcreve o áudio e insere o texto automaticamente no campo"))

    story.append(Paragraph("3.4 Salvar e analisar", S['H2']))
    story.append(step(1, "Clique em <b>\"Salvar Anamnese\"</b> para gravar os dados"))
    story.append(step(2, "Clique em <b>\"Analisar com IA\"</b> para enviar ao Assistente de IA para sugestão de rubricas"))
    story.append(hr())

    # ══════════════════════════════════
    # 4. TRANSCRICAO POR VOZ
    # ══════════════════════════════════
    story.append(Paragraph("4. Gravar Consulta por Voz (Transcrição IA)", S['H1']))
    story.append(nav("Pacientes > [Paciente] > Nova Consulta > Botao microfone"))

    story.append(step(1, "Na tela de nova consulta, localize o botao <b>microfone</b> no card \"Anamnese &amp; Exame\""))
    story.append(step(2, "Clique no microfone -- o navegador solicitara permissao para acessar o microfone"))
    story.append(step(3, "Fale naturalmente durante a consulta -- o timer mostra o tempo decorrido"))
    story.append(step(4, "Clique em <b>\"Parar\"</b> quando terminar"))
    story.append(step(5, "Aguarde a transcrição (indicador de carregamento)"))
    story.append(step(6, "O texto transcrito será inserido automaticamente no campo <b>\"Anamnese Homeopática\"</b>"))
    story.append(tip("A transcrição usa a API Whisper da OpenAI. Para melhores resultados, fale pausadamente e em ambiente silencioso."))
    story.append(warn("O áudio e enviado para processamento na nuvem. Garanta que o paciente consentiu com a gravação (LGPD)."))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 5. CONSULTA
    # ══════════════════════════════════
    story.append(Paragraph("5. Registrar Consulta no Prontuário", S['H1']))
    story.append(nav("Pacientes > [Paciente] > Nova Consulta"))

    story.append(step(1, "Na ficha do paciente, clique em <b>\"Nova Consulta\"</b>"))
    story.append(step(2, "A <b>Data</b> e preenchida automaticamente com hoje"))
    story.append(step(3, "Preencha a <b>Queixa Principal</b> (obrigatório) -- motivo da consulta"))
    story.append(step(4, "Preencha a <b>Anamnese Homeopática</b> -- ou use a gravação por voz"))
    story.append(step(5, "Preencha o <b>Exame Fisico</b> e o <b>Diagnostico</b>"))
    story.append(step(6, "Em <b>Sintomas Repertoriais</b>, liste as rubricas selecionadas"))
    story.append(step(7, "Em <b>Prescrição (Rx)</b>, registre: medicamento, potência, posologia"))
    story.append(step(8, "Em <b>Evolução / Plano</b>, registre o acompanhamento"))
    story.append(step(9, "Clique em <b>\"Registrar Consulta\"</b>"))
    story.append(Paragraph("A consulta ficara disponivel no histórico da aba \"Consultas\" do paciente.", S['B']))
    story.append(hr())

    # ══════════════════════════════════
    # 6. REPERTORIO
    # ══════════════════════════════════
    story.append(Paragraph("6. Navegar no Repertório e Buscar Rubricas", S['H1']))
    story.append(nav("Menu lateral > Repertório"))

    story.append(Paragraph("6.1 Navegar por capítulos", S['H2']))
    story.append(step(1, "Na barra lateral esquerda, veja os <b>55 capítulos</b> com contagem de rubricas"))
    story.append(step(2, "Clique em um capitulo para ver suas rubricas"))
    story.append(step(3, "Use a <b>paginação</b> no rodape (50 rubricas por pagina)"))
    story.append(step(4, "Clique em uma <b>rubrica</b> para expandir e ver os remédios com graduação:"))
    story.append(b("<b>MAIUSCULAS</b> = grau 3 (alta importância)"))
    story.append(b("<b>Capitalizado</b> = grau 2 (media importância)"))
    story.append(b("<b>minúsculas</b> = grau 1 (baixa importância)"))

    story.append(Paragraph("6.2 Busca global", S['H2']))
    story.append(step(1, "No campo de busca no topo, digite o sintoma (ex: <i>cefaleia</i>, <i>febre</i>, <i>ansiedade</i>)"))
    story.append(step(2, "Os resultados aparecem instantaneamente enquanto voce digita"))
    story.append(step(3, "Os resultados incluem rubricas em <b>português e inglês</b>"))

    story.append(Paragraph("6.3 Selecionar rubricas para repertorização", S['H2']))
    story.append(step(1, "Marque a <b>caixa de seleção</b> ao lado de cada rubrica desejada"))
    story.append(step(2, "Um <b>badge flutuante</b> no canto inferior direito mostra quantas rubricas foram selecionadas"))
    story.append(step(3, "Clique no badge <b>\"Repertorizar\"</b> para ir a tela de repertorização"))
    story.append(hr())

    # ══════════════════════════════════
    # 7. MATERIA MEDICA
    # ══════════════════════════════════
    story.append(Paragraph("7. Pesquisar na Matéria Medica", S['H1']))
    story.append(nav("Menu lateral > Matéria Medica"))

    story.append(step(1, "No campo de busca, digite o <b>nome do remédio</b> ou um <b>termo do conteúdo</b>"))
    story.append(step(2, "Use o filtro <b>\"Todas as fontes\"</b> para selecionar uma fonte especifica"))
    story.append(step(3, "Os resultados mostram: nome do remédio, codigo, fonte e preview do texto"))
    story.append(step(4, "Clique no resultado para ver o texto completo da matéria medica"))
    story.append(tip("Sao 3.327 textos indexados. Voce tambem pode acessar a matéria medica a partir da pagina de um remédio."))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 8. REPERTORIZACAO
    # ══════════════════════════════════
    story.append(Paragraph("8. Executar Repertorização", S['H1']))
    story.append(nav("Repertório > Selecionar rubricas > Repertorizar"))

    story.append(Paragraph("8.1 Escolher o método", S['H2']))
    story.append(step(1, "Na tela de repertorização, escolha o método nas abas superiores:"))
    story.append(b("<b>Soma de Graus</b> -- soma simples dos graus"))
    story.append(b("<b>Cobertura</b> -- conta em quantas rubricas cada remédio aparece"))
    story.append(b("<b>Kent</b> -- péso por categoria (mental x5, geral x3, particular x1)"))
    story.append(b("<b>Boenninghausen</b> -- péso por tipo (localização, sensação, modalidade, concomitante)"))
    story.append(b("<b>Hahnemann</b> -- método classico"))
    story.append(b("<b>Algorítmico</b> -- combina Kent + Boenninghausen"))

    story.append(Paragraph("8.2 Ajustar pésos (Kent/Algorítmico)", S['H2']))
    story.append(step(1, "Para cada rubrica, selecione o <b>péso</b>: Mental, Geral ou Particular"))
    story.append(step(2, "Ajuste a <b>intensidade</b> (1 a 3 pontos) clicando nos circulos"))
    story.append(step(3, "Use <b>\"Elim.\"</b> para desativar temporariamente uma rubrica sem remove-la"))

    story.append(Paragraph("8.3 Executar e analisar resultados", S['H2']))
    story.append(step(1, "Clique em <b>\"Repertorizar\"</b>"))
    story.append(step(2, "Analise a <b>Matriz</b>: linhas = rubricas, colunas = top 20 remédios, celulas = grau"))
    story.append(step(3, "Analise o <b>Ranking</b>: barras visuais com pontuação e cobertura"))
    story.append(step(4, "Clique no <b>icone de link</b> ao lado do remédio para ver seu detalhe e matéria medica"))
    story.append(hr())

    # ══════════════════════════════════
    # 9. ASSISTENTE IA
    # ══════════════════════════════════
    story.append(Paragraph("9. Usar o Assistente de IA", S['H1']))
    story.append(nav("Menu lateral > Assistente IA"))

    story.append(Paragraph("<b>Etapa 1: Descrever Sintomas</b>", S['H2']))
    story.append(step(1, "Digite ou cole a descricao dos sintomas na caixa de texto"))
    story.append(step(2, "Clique em <b>\"Analisar Sintomas\"</b>"))
    story.append(tip("Inclua: sintomas mentais, gerais, particulares, modalidades (piora/melhora), desejos e aversoes."))

    story.append(Paragraph("<b>Etapa 2: Revisar Rubricas</b>", S['H2']))
    story.append(step(3, "A IA identifica sintomas e sugere rubricas do repertório"))
    story.append(step(4, "Marque/desmarque as rubricas que deseja incluir"))
    story.append(step(5, "Clique em <b>\"Repertorizar\"</b>"))

    story.append(Paragraph("<b>Etapa 3: Repertorização</b>", S['H2']))
    story.append(step(6, "Veja o ranking de remédios com barras de pontuação"))
    story.append(step(7, "Clique em <b>\"Gerar Prescrição com IA\"</b>"))

    story.append(Paragraph("<b>Etapa 4: Prescrição Assistida</b>", S['H2']))
    story.append(step(8, "A IA sugere: <b>Remedio</b>, <b>Potência</b>, <b>Posologia</b>, <b>Frequência</b>"))
    story.append(step(9, "Leia o <b>Raciocínio Clínico</b> (expansivel) para entender a logica"))
    story.append(step(10, "Use <b>\"Copiar\"</b> para colar na prescrição da consulta"))
    story.append(warn("O Assistente de IA e uma ferramenta auxiliar. A decisão final e sempre do profissional de saúde."))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 10. AGENDA
    # ══════════════════════════════════
    story.append(Paragraph("10. Gerenciar a Agenda (Dia, Semana, Mês)", S['H1']))
    story.append(nav("Menu lateral > Agenda"))

    story.append(Paragraph("10.1 Alternar entre vistas", S['H2']))
    story.append(step(1, "No topo da agenda, clique nas abas: <b>Dia</b>, <b>Semana</b> ou <b>Mês</b>"))
    story.append(step(2, "Use <b>\"Anterior\"</b> e <b>\"Próximo\"</b> para navegar"))
    story.append(step(3, "Clique em <b>\"Hoje\"</b> para voltar a data atual"))

    story.append(Paragraph("10.2 Vista Diária", S['H2']))
    story.append(b("Grade de horários das 07:00 as 20:30 (intervalos de 30 min)"))
    story.append(b("Slots livres mostram \"Horário livre\" -- clique para agendar"))
    story.append(b("Slots ocupados mostram paciente, tipo e status -- clique para editar"))

    story.append(Paragraph("10.3 Vista Semanal", S['H2']))
    story.append(b("Grade com 7 colunas (Segunda a Domingo) e linhas de hora"))
    story.append(b("Dia atual destacado em verde-azulado"))
    story.append(b("Clique em qualquer celula para agendar ou editar"))

    story.append(Paragraph("10.4 Vista Mensal", S['H2']))
    story.append(b("Calendario completo do mes com mini-cards de agendamentos"))
    story.append(b("Badges coloridos: verde (poucos), amarelo (moderado), vermelho (lotado)"))
    story.append(b("Clique em um dia para alternar para a <b>Vista Diária</b> desse dia"))

    story.append(Paragraph("10.5 Criar agendamento", S['H2']))
    story.append(step(1, "Clique em um slot livre (qualquer vista)"))
    story.append(step(2, "No diálogo, preencha: <b>Data</b>, <b>Paciente</b> (opcional), <b>Horário</b>, <b>Duração</b>"))
    story.append(step(3, "Selecione o <b>Tipo</b>: Consulta, Retorno, Primeira Consulta ou Teleconsulta"))
    story.append(step(4, "Adicione <b>Observações</b> se necessario"))
    story.append(step(5, "Clique em <b>\"Salvar\"</b>"))
    story.append(tip("Ao selecionar \"Teleconsulta\", um link Jitsi Meet sera gerado automaticamente."))
    story.append(hr())

    # ══════════════════════════════════
    # 11. TELEMEDICINA
    # ══════════════════════════════════
    story.append(Paragraph("11. Realizar Teleconsulta", S['H1']))
    story.append(nav("Menu lateral > Telemedicina"))

    story.append(step(1, "Na lista de teleconsultas, veja as <b>próximas</b> e <b>anteriores</b>"))
    story.append(step(2, "Clique em <b>\"Entrar\"</b> ao lado da teleconsulta para abrir a sala de video"))
    story.append(step(3, "A sala mostra o <b>video Jitsi Meet</b> com o <b>prontuário do paciente</b> lado a lado"))
    story.append(step(4, "Compartilhe o link com o paciente para que ele acesse"))
    story.append(tip("Para agendar uma teleconsulta, va em Agenda e crie um agendamento do tipo \"Teleconsulta\"."))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 12. CASOS CLINICOS
    # ══════════════════════════════════
    story.append(Paragraph("12. Registrar Casos Clínicos", S['H1']))
    story.append(nav("Menu lateral > Casos Clínicos"))

    story.append(step(1, "Clique em <b>\"Novo Caso\"</b>"))
    story.append(step(2, "Preencha: <b>Título</b>, <b>Resumo</b>, <b>Sintomas</b>"))
    story.append(step(3, "Informe as <b>Rubricas</b> e o resultado da <b>Repertorização</b>"))
    story.append(step(4, "Registre o <b>Remedio Prescrito</b> e a <b>Potência</b>"))
    story.append(step(5, "Informe o <b>Desfecho</b> e avalie com <b>estrelas</b> (1 a 5)"))
    story.append(step(6, "Adicione <b>Tags</b> para facilitar a busca (ex: <i>cefaleia, mulher, ansiedade</i>)"))
    story.append(step(7, "Informe <b>Idade</b> e <b>Sexo</b> do paciente (dados anônimos)"))
    story.append(step(8, "Clique em <b>\"Salvar\"</b>"))
    story.append(tip("A IA analisa padroes entre os casos registrados e sugere remédios baseado em casos similares."))
    story.append(hr())

    # ══════════════════════════════════
    # 13. DOCUMENTOS
    # ══════════════════════════════════
    story.append(Paragraph("13. Emitir Documentos (Receita, Atestado, TCLE)", S['H1']))
    story.append(nav("Pacientes > [Paciente] > Documentos"))

    story.append(step(1, "Na ficha do paciente, clique em <b>\"Documentos\"</b>"))
    story.append(step(2, "Clique em <b>\"Novo Documento\"</b>"))
    story.append(step(3, "Selecione o <b>Tipo de Documento</b>:"))

    story.append(Paragraph("<b>Receituário</b>", S['H3']))
    story.append(b("Adicione medicamentos: nome, dosagem, frequência, duração"))
    story.append(b("Clique em \"Adicionar medicamento\" para mais itens"))
    story.append(b("Adicione observações gerais"))

    story.append(Paragraph("<b>Atestado Médico</b>", S['H3']))
    story.append(b("Informe: dias de afastamento, data de inicio, CID, observações"))

    story.append(Paragraph("<b>TCLE (Termo de Consentimento)</b>", S['H3']))
    story.append(b("Descreva: procedimento, riscos, beneficios, alternativas"))

    story.append(Paragraph("<b>Relatório Clinico</b>", S['H3']))
    story.append(b("Informe: período e conteúdo detalhado do relatório"))

    story.append(step(4, "Clique em <b>\"Criar Documento\"</b>"))
    story.append(step(5, "O documento sera salvo e disponivel para <b>impressão</b>"))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 14. IMPORT/EXPORT CSV
    # ══════════════════════════════════
    story.append(Paragraph("14. Importar e Exportar Pacientes (CSV)", S['H1']))

    story.append(Paragraph("14.1 Exportar pacientes", S['H2']))
    story.append(nav("Pacientes > Exportar CSV"))
    story.append(step(1, "Na lista de pacientes, clique em <b>\"Exportar CSV\"</b>"))
    story.append(step(2, "Um arquivo CSV sera baixado com todos os pacientes da clínica"))

    story.append(Paragraph("14.2 Importar pacientes", S['H2']))
    story.append(nav("Pacientes > Importar CSV"))
    story.append(step(1, "Clique em <b>\"Importar CSV\"</b> na lista de pacientes"))
    story.append(step(2, "Clique em <b>\"Baixar Modelo CSV\"</b> para obter o formato correto"))
    story.append(step(3, "Preencha a planilha com os dados dos pacientes"))
    story.append(Paragraph("Colunas aceitas: <b>Nome</b> (obrigatório), CPF, RG, Data Nascimento (DD/MM/AAAA), Sexo (M/F), Telefone, Email, Endereço, Profissão, Convênio, Notas", S['B']))
    story.append(step(4, "Arraste o arquivo para a area de upload ou clique para selecionar"))
    story.append(step(5, "Confira o <b>preview</b> das primeiras linhas"))
    story.append(step(6, "Clique em <b>\"Importar Pacientes\"</b>"))
    story.append(step(7, "Veja o resultado: pacientes importados e eventuais erros"))
    story.append(tip("Os dados importados sao automaticamente criptografados com AES-256-GCM."))
    story.append(hr())

    # ══════════════════════════════════
    # 15. FINANCEIRO
    # ══════════════════════════════════
    story.append(Paragraph("15. Controle Financeiro", S['H1']))
    story.append(nav("Menu lateral > Financeiro"))

    story.append(step(1, "Navegue entre meses com <b>\"Anterior\"</b> e <b>\"Próximo\"</b>"))
    story.append(step(2, "Veja os cards de resumo: <b>Receitas</b> (verde), <b>Despésas</b> (vermelho), <b>Saldo</b>"))
    story.append(step(3, "Para registrar, clique em <b>\"Nova Transação\"</b>"))
    story.append(step(4, "Selecione o tipo: <b>Receita</b> ou <b>Despésa</b>"))
    story.append(step(5, "Preencha: <b>Descrição</b>, <b>Valor (R$)</b>, <b>Data</b>, <b>Categoria</b>, <b>Paciente</b> (opcional)"))
    story.append(step(6, "Clique em <b>\"Salvar\"</b>"))
    story.append(Paragraph("As categorias disponiveis sao: Consulta, Medicamento, Aluguel, Matérial, Outros.", S['B']))
    story.append(PageBreak())

    # ══════════════════════════════════
    # 16. AUDITORIA E LGPD
    # ══════════════════════════════════
    story.append(Paragraph("16. Auditoria e Conformidade LGPD", S['H1']))

    story.append(Paragraph("16.1 Trilha de Auditoria", S['H2']))
    story.append(nav("Menu lateral > Auditoria"))
    story.append(b("Veja todas as ações realizadas na plataforma: login, cadastros, edicoes, exclusoes"))
    story.append(b("Cada registro mostra: data/hora, ação, detalhes, usuário e IP"))
    story.append(b("Exporte para CSV clicando em <b>\"Exportar\"</b> (protegido contra formula injection)"))

    story.append(Paragraph("16.2 Gestão de Consentimentos LGPD", S['H2']))
    story.append(nav("Menu lateral > LGPD"))
    story.append(step(1, "Veja a lista de todos os pacientes com status de consentimento"))
    story.append(step(2, "Clique no paciente para gerenciar consentimentos granulares:"))
    story.append(b("<b>Tratamento Médico</b> -- autoriza processamento de dados de saúde"))
    story.append(b("<b>Armazenamento de Dados</b> -- autoriza armazenamento digital"))
    story.append(b("<b>Comunicações</b> -- autoriza contato por email/telefone"))
    story.append(step(3, "Use os botoes para <b>conceder</b> ou <b>revogar</b> cada tipo"))

    story.append(Paragraph("16.3 Exportação e Anonimização", S['H2']))
    story.append(b("<b>Exportar Dados</b>: exporte todos os dados de um paciente (portabilidade -- Art. 18 LGPD)"))
    story.append(b("<b>Anonimizar</b>: substitua dados péssoais por códigos anônimos (preserva utilidade estatística)"))
    story.append(hr())

    # ══════════════════════════════════
    # 17. CONFIGURACOES
    # ══════════════════════════════════
    story.append(Paragraph("17. Configurações da Clínica e Equipe", S['H1']))

    story.append(Paragraph("17.1 Dados da clínica", S['H2']))
    story.append(nav("Menu lateral > Configurações"))
    story.append(b("Edite: Nome, CNPJ, Telefone, E-mail, Endereço, CRM"))
    story.append(b("Configure o <b>DPO</b> (Encarregado de Dados): nome e e-mail"))

    story.append(Paragraph("17.2 Gerenciar equipe", S['H2']))
    story.append(nav("Menu lateral > Equipe"))
    story.append(step(1, "Veja os membros atuais com nome, e-mail, papel e status"))
    story.append(step(2, "Clique em <b>\"Convidar Membro\"</b>"))
    story.append(step(3, "Informe o <b>e-mail</b> e selecione o <b>papel</b> (Médico ou Administrador)"))
    story.append(step(4, "O convidado recebera um e-mail com link para criar sua senha"))

    story.append(Paragraph("17.3 Assinatura", S['H2']))
    story.append(nav("Menu lateral > Assinatura"))
    story.append(b("Veja seu plano atual e limites"))
    story.append(b("Faça upgrade/downgrade de plano"))
    story.append(b("Gerencie métodos de pagamento via Stripe"))

    # ══════════════════════════════════
    # 18. FITOTERAPIA E DICIONARIO
    # ══════════════════════════════════
    story.append(Paragraph("18. Fitoterapia e Dicionário Médico", S['H1']))

    story.append(Paragraph("18.1 Consultar plantas medicinais", S['H2']))
    story.append(nav("Menu lateral > Fitoterapia"))
    story.append(step(1, "Use o campo de busca para pésquisar por <b>nome</b> ou <b>indicação</b>"))
    story.append(step(2, "Veja os detalhes: nome cientifico, indicações, posologia"))
    story.append(Paragraph("Sao <b>310 plantas medicinais</b> do banco SIHORE, incluindo plantas do RENISUS/ANVISA.", S['B']))

    story.append(Paragraph("18.2 Consultar dicionário médico", S['H2']))
    story.append(nav("Menu lateral > Dicionário"))
    story.append(step(1, "Digite o <b>termo</b> que deseja buscar (minimo 2 caracteres)"))
    story.append(step(2, "Veja a definicao do termo"))
    story.append(Paragraph("Sao <b>243 termos</b>: 45 termos homeopaticos + 198 tratamentos fitoterapicos.", S['B']))
    story.append(hr())

    # ══════════════════════════════════
    # 19. DASHBOARD ANALITICO
    # ══════════════════════════════════
    story.append(Paragraph("19. Dashboard Analítico", S['H1']))
    story.append(nav("Menu lateral > Dashboard"))
    story.append(step(1, "Veja os <b>cards de resumo</b>: total de pacientes, consultas do mes, consultas de hoje, agendamentos de hoje"))
    story.append(step(2, "Analise os <b>graficos</b>: consultas/mes e novos pacientes/mes"))
    story.append(step(3, "Confira a <b>taxa de retorno</b> e <b>taxa de conclusao</b> das consultas"))
    story.append(step(4, "Veja os <b>próximos agendamentos</b> do dia"))
    story.append(tip("Os graficos mostram os ultimos 6 meses de atividade."))
    story.append(hr())

    # ══════════════════════════════════
    # 20. APP MOBILE (PWA)
    # ══════════════════════════════════
    story.append(Paragraph("20. App Mobile (PWA)", S['H1']))
    story.append(step(1, "Acesse <b>homeoclinic-ia.com</b> no navegador do celular"))
    story.append(step(2, "No Chrome: toque nos 3 pontos > <b>\"Instalar aplicativo\"</b>"))
    story.append(step(3, "No Safari (iPhone): toque em Compartilhar > <b>\"Adicionar a Tela Inicio\"</b>"))
    story.append(step(4, "O HomeoClinic Pro aparecera como um app no seu celular"))
    story.append(tip("O app funciona offline para dados ja carregados (repertório, pacientes do dia)."))

    # ══════════════════════════════════
    # 21. WHATSAPP
    # ══════════════════════════════════
    story.append(Paragraph("21. WhatsApp e Lembretes Automaticos", S['H1']))
    story.append(nav("Menu lateral > WhatsApp"))

    story.append(Paragraph("21.1 Conectar o WhatsApp", S['H2']))
    story.append(step(1, "Acesse <b>Configurações > WhatsApp</b> no menu lateral"))
    story.append(step(2, "Clique em <b>\"Conectar WhatsApp\"</b>"))
    story.append(step(3, "Escaneie o <b>QR Code</b> com o WhatsApp do celular da clínica"))
    story.append(step(4, "Aguarde a confirmação de conexao (status verde)"))
    story.append(tip("Use um número de WhatsApp exclusivo da clínica para nao misturar com mensagens péssoais."))

    story.append(Paragraph("21.2 Configurar lembretes", S['H2']))
    story.append(step(1, "Ative o <b>lembrete de consulta</b> (envia X horas antes)"))
    story.append(step(2, "Defina a <b>antecedencia</b>: 24h, 12h ou 2h antes"))
    story.append(step(3, "Personalize a <b>mensagem</b> do lembrete"))
    story.append(step(4, "Ative a <b>confirmação de agendamento</b> (paciente confirma/cancela)"))

    story.append(Paragraph("21.3 Tipos de mensagens enviadas", S['H2']))
    story.append(b("<b>Lembrete de consulta</b> -- enviado automaticamente antes da consulta"))
    story.append(b("<b>Confirmação</b> -- paciente confirma ou cancela pelo WhatsApp"))
    story.append(b("<b>Pos-consulta</b> -- orientações e follow-up"))
    story.append(warn("O paciente deve ter consentido com comunicações via WhatsApp (LGPD)."))
    story.append(hr())

    # ══════════════════════════════════
    # 22. PORTAL DO PACIENTE
    # ══════════════════════════════════
    story.append(Paragraph("22. Portal do Paciente", S['H1']))
    story.append(nav("homeoclinic-ia.com/portal"))

    story.append(Paragraph("22.1 Acesso do paciente", S['H2']))
    story.append(step(1, "O paciente acessa <b>homeoclinic-ia.com/portal</b>"))
    story.append(step(2, "Faz login com <b>e-mail</b> e <b>senha</b> cadastrados"))
    story.append(step(3, "Visualiza suas <b>consultas agendadas</b> e <b>documentos</b>"))

    story.append(Paragraph("22.2 Funcionalidades do portal", S['H2']))
    story.append(b("<b>Consultas</b> -- ve próximas consultas com data, horário e status"))
    story.append(b("<b>Documentos</b> -- acessa receitas, atestados, TCLE e relatórios"))
    story.append(b("<b>Dados péssoais</b> -- visualiza seus dados cadastrais"))

    story.append(Paragraph("22.3 Como cadastrar acesso para o paciente", S['H2']))
    story.append(step(1, "Na ficha do paciente, garanta que o <b>e-mail</b> esta preenchido"))
    story.append(step(2, "O paciente usa o e-mail cadastrado para criar sua senha no portal"))
    story.append(step(3, "O consentimento LGPD deve estar ativo para acesso"))
    story.append(tip("O portal e responsivo -- funciona bem no celular e no computador."))
    story.append(hr())

    # ══════════════════════════════════
    # FOOTER
    # ══════════════════════════════════
    story.append(Spacer(1, 30))
    # ══════════════════════════════════
    # SUPORTE
    # ══════════════════════════════════
    story.append(Paragraph("Central de Suporte", S['H1']))
    story.append(nav("Menu lateral > Suporte"))

    story.append(Paragraph("A HomeoClinic Pro oferece suporte integrado com assistente virtual disponível 24/7.", S['B']))

    story.append(Paragraph("Assistente Virtual Clara", S['H2']))
    story.append(step(1, "Clique no <b>ícone de fones</b> no canto inferior direito de qualquer página"))
    story.append(step(2, "O painel de chat abre com a <b>Clara</b>, assistente virtual da plataforma"))
    story.append(step(3, "Digite sua dúvida e envie — a Clara responde instantaneamente"))
    story.append(step(4, "Sugestões rápidas aparecem para perguntas comuns"))
    story.append(tip("A Clara conhece todas as funcionalidades da plataforma e pode guiá-lo passo a passo."))

    story.append(Paragraph("Página de Suporte Dedicada", S['H2']))
    story.append(step(1, "No menu lateral, clique em <b>\"Suporte\"</b> (seção Ajuda)"))
    story.append(step(2, "A página oferece: <b>Chat com a Clara</b>, <b>FAQ</b> e <b>Links Úteis</b>"))
    story.append(step(3, "No FAQ, clique na pergunta para expandir a resposta"))
    story.append(step(4, "Em Links Úteis, baixe o <b>Guia de Uso (PDF)</b> ou acesse o email de suporte"))

    story.append(Paragraph("Contato Humano", S['H2']))
    story.append(b("Email: <b>contato@homeoclinic-ia.com</b> — resposta em até 24h"))
    story.append(b("WhatsApp: disponível no painel da plataforma"))
    story.append(b("Horário: Segunda a Sexta, 9h às 18h (Brasília)"))
    story.append(b("DPO (proteção de dados): <b>dpo@homeoclinic-ia.com</b>"))
    story.append(warn("Se o problema envolver dados pessoais, mencione seu email de cadastro para identificação."))
    story.append(hr())

    # FOOTER
    story.append(Spacer(1, 30))
    story.append(Paragraph("HomeoClinic Pro v3.0 — Guia de Uso | Março 2026 | homeoclinic-ia.com", S['Ft']))

    def pg(c, d):
        c.setFont("Arial", 8)
        c.setFillColor(GRAY)
        c.drawCentredString(A4[0]/2, 1.2*cm, f"HomeoClinic Pro — Guia de Uso | Página {c.getPageNumber()}")

    doc.build(story, onFirstPage=pg, onLaterPages=pg)
    print(f"PDF generated: {path}")

if __name__ == "__main__":
    build()
