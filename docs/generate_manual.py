#!/usr/bin/env python3
"""Generate HomeoClinic Pro User Manual PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
import os

# Colors
PRIMARY = HexColor("#1a5632")
PRIMARY_LIGHT = HexColor("#e8f5e9")
ACCENT = HexColor("#2e7d32")
DANGER = HexColor("#c62828")
DARK = HexColor("#1a1a2e")
GRAY = HexColor("#666666")
LIGHT_GRAY = HexColor("#f5f5f5")
BORDER_GRAY = HexColor("#cccccc")
BLUE = HexColor("#1565c0")
ORANGE = HexColor("#e65100")

WIDTH, HEIGHT = A4
MARGIN = 2 * cm

def get_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        'CoverTitle', parent=styles['Title'],
        fontSize=32, leading=38, textColor=white,
        alignment=TA_CENTER, spaceAfter=12,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'],
        fontSize=16, leading=22, textColor=HexColor("#b8e6c8"),
        alignment=TA_CENTER, spaceAfter=6,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'CoverVersion', parent=styles['Normal'],
        fontSize=12, leading=16, textColor=HexColor("#90cfa0"),
        alignment=TA_CENTER, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'H1', parent=styles['Heading1'],
        fontSize=22, leading=28, textColor=PRIMARY,
        spaceBefore=24, spaceAfter=12,
        fontName='Helvetica-Bold',
        borderWidth=0, borderPadding=0,
        borderColor=PRIMARY,
    ))
    styles.add(ParagraphStyle(
        'H2', parent=styles['Heading2'],
        fontSize=16, leading=22, textColor=ACCENT,
        spaceBefore=18, spaceAfter=8,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'H3', parent=styles['Heading3'],
        fontSize=13, leading=18, textColor=DARK,
        spaceBefore=12, spaceAfter=6,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DARK,
        alignment=TA_JUSTIFY, spaceAfter=6,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'BodyBold', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DARK,
        alignment=TA_LEFT, spaceAfter=6,
        fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'BulletCustom', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DARK,
        leftIndent=20, bulletIndent=8,
        spaceAfter=3, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'SubBullet', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=GRAY,
        leftIndent=36, bulletIndent=24,
        spaceAfter=2, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'NumberedStep', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DARK,
        leftIndent=20, spaceAfter=3,
        fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'Tip', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=ACCENT,
        leftIndent=12, spaceAfter=6,
        fontName='Helvetica-BoldOblique',
        borderWidth=0, borderPadding=6,
        backColor=PRIMARY_LIGHT,
    ))
    styles.add(ParagraphStyle(
        'Warning', parent=styles['Normal'],
        fontSize=10, leading=14, textColor=DANGER,
        leftIndent=12, spaceAfter=6,
        fontName='Helvetica-BoldOblique',
    ))
    styles.add(ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=white,
        alignment=TA_CENTER, fontName='Helvetica-Bold'
    ))
    styles.add(ParagraphStyle(
        'TableCell', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=DARK,
        alignment=TA_LEFT, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'TableCellCenter', parent=styles['Normal'],
        fontSize=9, leading=12, textColor=DARK,
        alignment=TA_CENTER, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, leading=10, textColor=GRAY,
        alignment=TA_CENTER, fontName='Helvetica'
    ))
    return styles


def make_table(headers, rows, col_widths=None, styles_obj=None):
    """Create a styled table."""
    s = styles_obj
    header_cells = [Paragraph(h, s['TableHeader']) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), s['TableCell']) for c in row])

    if col_widths is None:
        col_widths = [(WIDTH - 2 * MARGIN) / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


def make_centered_table(headers, rows, col_widths=None, styles_obj=None):
    """Create a table with centered cells."""
    s = styles_obj
    header_cells = [Paragraph(h, s['TableHeader']) for h in headers]
    data = [header_cells]
    for row in rows:
        data.append([Paragraph(str(c), s['TableCellCenter']) for c in row])

    if col_widths is None:
        col_widths = [(WIDTH - 2 * MARGIN) / len(headers)] * len(headers)

    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t


def add_cover(story, s):
    """Add cover page."""
    story.append(Spacer(1, 3 * cm))

    # Cover box
    cover_data = [[
        Paragraph("HomeoClinic Pro", s['CoverTitle']),
    ]]
    cover_table = Table(cover_data, colWidths=[WIDTH - 2 * MARGIN])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 40),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
    ]))
    story.append(cover_table)

    subtitle_data = [[
        Paragraph("Manual do Usuario", s['CoverSubtitle']),
    ]]
    subtitle_table = Table(subtitle_data, colWidths=[WIDTH - 2 * MARGIN])
    subtitle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(subtitle_table)

    guide_data = [[
        Paragraph("Guia Completo da Plataforma para Clinicas Homeopaticas", s['CoverSubtitle']),
    ]]
    guide_table = Table(guide_data, colWidths=[WIDTH - 2 * MARGIN])
    guide_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
    ]))
    story.append(guide_table)

    version_data = [[
        Paragraph("Versao 2.0  |  Marco 2026", s['CoverVersion']),
    ]]
    version_table = Table(version_data, colWidths=[WIDTH - 2 * MARGIN])
    version_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 30),
        ('LEFTPADDING', (0, 0), (-1, -1), 20),
        ('RIGHTPADDING', (0, 0), (-1, -1), 20),
        ('ROUNDEDCORNERS', [0, 0, 8, 8]),
    ]))
    story.append(version_table)

    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph("homeoclinic-ia.com", ParagraphStyle(
        'URL', fontSize=12, textColor=ACCENT, alignment=TA_CENTER,
        fontName='Helvetica'
    )))
    story.append(PageBreak())


def add_toc(story, s):
    """Add table of contents page."""
    story.append(Paragraph("Sumario", s['H1']))
    story.append(Spacer(1, 0.5 * cm))

    toc_items = [
        ("1.", "Introducao", ""),
        ("2.", "Primeiros Passos", ""),
        ("3.", "Funcionalidades do Doutor (Medico)", ""),
        ("4.", "Funcionalidades do Administrador da Clinica", ""),
        ("5.", "Funcionalidades do Superadministrador", ""),
        ("6.", "Tabela de Permissoes por Nivel", ""),
        ("7.", "Planos e Limites", ""),
        ("8.", "Conformidade Legal", ""),
        ("9.", "Perguntas Frequentes", ""),
    ]

    for num, title, _ in toc_items:
        story.append(Paragraph(
            f"<b>{num}</b>  {title}",
            ParagraphStyle('TOCItem', parent=s['Body'], fontSize=12, leading=20,
                         spaceAfter=4, leftIndent=10)
        ))

    story.append(PageBreak())


def add_section_header(story, s, title):
    """Add a section header with green bar."""
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=4))
    story.append(Paragraph(title, s['H1']))


def bullet(story, s, text, indent=0):
    style = s['SubBullet'] if indent > 0 else s['BulletCustom']
    story.append(Paragraph(f"\u2022  {text}", style))


def numbered(story, s, num, text):
    story.append(Paragraph(f"<b>{num}.</b>  {text}", s['NumberedStep']))


def add_intro(story, s):
    add_section_header(story, s, "1. Introducao")

    story.append(Paragraph("1.1 O que e o HomeoClinic Pro", s['H2']))
    story.append(Paragraph(
        "HomeoClinic Pro e uma plataforma SaaS profissional para clinicas homeopaticas, "
        "oferecendo prontuario eletronico, repertorio homeopatico com 188.669 rubricas em "
        "portugues, motor de repertorizacao com 6 metodos classicos, assistente de IA para "
        "analise de sintomas e prescricao, transcricao por voz (Whisper), telemedicina "
        "integrada (Jitsi Meet), 5 templates de anamnese (homeopatia, pediatria, dermatologia, "
        "ginecologia, psiquiatria), banco de casos clinicos com analise por IA, fitoterapia "
        "com 310 plantas medicinais, dicionario medico com 243 termos, dashboard analitico, "
        "importacao/exportacao CSV, e app mobile (PWA) \u2014 tudo em conformidade com a "
        "LGPD e regulamentacoes do CFM.",
        s['Body']
    ))

    story.append(Paragraph("1.2 Requisitos do Sistema", s['H2']))
    bullet(story, s, "Navegador moderno (Chrome, Firefox, Edge, Safari \u2014 versoes recentes)")
    bullet(story, s, "Conexao com internet")
    bullet(story, s, "Resolucao minima recomendada: 1280x720")

    story.append(Paragraph("1.3 Niveis de Acesso", s['H2']))
    story.append(Paragraph(
        "A plataforma possui tres niveis de acesso:",
        s['Body']
    ))

    tw = WIDTH - 2 * MARGIN
    t = make_table(
        ["Nivel", "Escopo", "Descricao"],
        [
            ["Doutor (Medico)", "Clinica",
             "Acesso as funcoes clinicas: pacientes, consultas, repertorio, agenda e documentos"],
            ["Administrador da Clinica", "Clinica",
             "Tudo do Doutor + financeiro, auditoria, LGPD, configuracoes, equipe e faturamento"],
            ["Superadministrador", "Plataforma",
             "Gestao global: todas as clinicas, planos, trials, usuarios e exclusoes"],
        ],
        col_widths=[tw * 0.2, tw * 0.12, tw * 0.68],
        styles_obj=s
    )
    story.append(t)
    story.append(PageBreak())


def add_getting_started(story, s):
    add_section_header(story, s, "2. Primeiros Passos")

    story.append(Paragraph("2.1 Criando sua Clinica", s['H2']))
    numbered(story, s, 1, 'Acesse <b>homeoclinic-ia.com</b> e clique em "Criar Conta"')
    numbered(story, s, 2, "Preencha: nome, e-mail, senha")
    numbered(story, s, 3, "A clinica sera criada automaticamente com o plano Gratuito (trial de 14 dias)")
    numbered(story, s, 4, "Voce sera redirecionado para o onboarding")

    story.append(Paragraph("2.2 Onboarding (Primeira Configuracao)", s['H2']))
    story.append(Paragraph("No primeiro acesso, preencha os dados da clinica:", s['Body']))
    bullet(story, s, "Nome da clinica")
    bullet(story, s, "CNPJ")
    bullet(story, s, "Telefone")
    bullet(story, s, "E-mail")
    bullet(story, s, "Endereco")
    bullet(story, s, "CRM do responsavel")

    story.append(Paragraph("2.3 Convidando Membros da Equipe (Administrador)", s['H2']))
    numbered(story, s, 1, "Acesse Configuracoes \u2192 Equipe")
    numbered(story, s, 2, 'Clique em "Convidar Membro"')
    numbered(story, s, 3, "Informe o e-mail e o papel (Medico ou Administrador)")
    numbered(story, s, 4, "O convidado recebera um e-mail com link de aceitacao")

    story.append(Paragraph("2.4 Aceitando um Convite (Doutor)", s['H2']))
    numbered(story, s, 1, "Abra o e-mail de convite")
    numbered(story, s, 2, "Clique no link de aceitacao")
    numbered(story, s, 3, "Crie sua senha")
    numbered(story, s, 4, "Voce tera acesso imediato a clinica")
    story.append(PageBreak())


def add_doctor_features(story, s):
    add_section_header(story, s, "3. Funcionalidades do Doutor (Medico)")
    story.append(Paragraph(
        "O Doutor tem acesso as funcionalidades clinicas essenciais da plataforma.",
        s['Body']
    ))

    # 3.1 Dashboard
    story.append(Paragraph("3.1 Dashboard", s['H2']))
    story.append(Paragraph("Tela inicial com visao geral:", s['Body']))
    bullet(story, s, "Total de pacientes cadastrados")
    bullet(story, s, "Total de consultas realizadas")
    bullet(story, s, "Atividades recentes (timeline)")
    bullet(story, s, "Cards de estatisticas rapidas")

    # 3.2 Pacientes
    story.append(Paragraph("3.2 Pacientes", s['H2']))

    story.append(Paragraph("Listar Pacientes", s['H3']))
    bullet(story, s, "Busca por nome")
    bullet(story, s, "Exibe: CPF, idade, telefone, convenio, total de consultas, status do consentimento LGPD")
    bullet(story, s, "Clique no paciente para acessar o prontuario")

    story.append(Paragraph("Cadastrar Novo Paciente", s['H3']))
    story.append(Paragraph("Campos disponiveis:", s['Body']))
    bullet(story, s, "<b>Dados pessoais:</b> nome completo, CPF, RG, data de nascimento, sexo, profissao")
    bullet(story, s, "<b>Contato:</b> telefone, e-mail, endereco completo")
    bullet(story, s, "<b>Convenio/Plano de saude</b>")
    bullet(story, s, "<b>Consentimento LGPD (obrigatorio):</b> o paciente deve concordar com o tratamento de seus dados")

    story.append(Paragraph("Editar e Excluir Paciente", s['H3']))
    bullet(story, s, "<b>Editar:</b> atualizar qualquer campo do cadastro")
    bullet(story, s, "<b>Excluir:</b> remocao permanente (requer confirmacao)")

    # 3.3 Anamnese
    story.append(Paragraph("3.3 Anamnese Homeopatica", s['H2']))
    story.append(Paragraph("Formulario guiado com 8 secoes especificas para homeopatia:", s['Body']))
    numbered(story, s, 1, "<b>Sintomas Mentais</b> \u2014 Temperamento, medos, reacoes emocionais, humor, ansiedade, memoria, irritabilidade, relacionamentos, obsessoes")
    numbered(story, s, 2, "<b>Sintomas Gerais</b> \u2014 Modalidades, energia, infeccoes recorrentes, antecedentes familiares")
    numbered(story, s, 3, "<b>Desejos e Aversoes Alimentares</b> \u2014 Alimentos especificos, sede, apetite, nauseas")
    numbered(story, s, 4, "<b>Sono e Sonhos</b> \u2014 Qualidade, inicio, despertares, posicao, sonhos, descanso, parassonias")
    numbered(story, s, 5, "<b>Transpiracao</b> \u2014 Profusao, localizacao, odor, manchas, gatilhos, efeitos")
    numbered(story, s, 6, "<b>Termorregulacao</b> \u2014 Preferencia termica, tolerancia, gatilhos")
    numbered(story, s, 7, "<b>Ginecologico</b> \u2014 Ciclo menstrual, fluxo, colicas, TPM, corrimento, historia obstetrica, menopausa, libido")
    numbered(story, s, 8, "<b>Sintomas Particulares</b> \u2014 Cabeca, olhos, ouvidos, nariz, garganta, respiratorio, digestivo, urinario, pele, musculoesqueletico")
    story.append(Spacer(1, 4))
    story.append(Paragraph("Cada secao inclui perguntas-guia para orientar o preenchimento.", s['Body']))
    story.append(Paragraph(
        '<b>Dica:</b> Use o botao "Analisar com IA" para enviar a anamnese completa ao Assistente de IA para sugestao de rubricas.',
        s['Tip']
    ))

    # 3.4 Consultas
    story.append(Paragraph("3.4 Consultas (Prontuario Eletronico)", s['H2']))
    story.append(Paragraph("Cada consulta registra:", s['Body']))
    bullet(story, s, "<b>Queixa Principal</b> \u2014 Motivo da consulta")
    bullet(story, s, "<b>Anamnese</b> \u2014 Historico detalhado")
    bullet(story, s, "<b>Exame Fisico</b> \u2014 Achados do exame")
    bullet(story, s, "<b>Diagnostico</b> \u2014 Conclusao clinica")
    bullet(story, s, "<b>Sintomas Repertoriais</b> \u2014 Sintomas selecionados para repertorizacao")
    bullet(story, s, "<b>Prescricao</b> \u2014 Medicamento, potencia, dosagem")
    bullet(story, s, "<b>Evolucao</b> \u2014 Plano de acompanhamento")
    story.append(Paragraph("O historico completo de consultas e acessivel na ficha do paciente.", s['Body']))

    story.append(PageBreak())

    # 3.5 Repertorio
    story.append(Paragraph("3.5 Repertorio Homeopatico", s['H2']))
    story.append(Paragraph(
        "O maior repertorio homeopatico em portugues do Brasil:",
        s['Body']
    ))
    bullet(story, s, "<b>188.669 rubricas</b> organizadas em <b>55 capitulos</b>")
    bullet(story, s, "<b>3.943 remedios</b> catalogados")

    story.append(Paragraph("Navegacao por Capitulos", s['H3']))
    bullet(story, s, "Barra lateral com os 55 capitulos e contagem de rubricas")
    bullet(story, s, "Paginacao de 50 rubricas por pagina")
    bullet(story, s, "Clique na rubrica para expandir e ver a lista de remedios")

    story.append(Paragraph("Sistema de Graduacao dos Remedios", s['H3']))
    tw = WIDTH - 2 * MARGIN
    t = make_table(
        ["Formato", "Grau", "Significado"],
        [
            ["MAIUSCULAS (ex: SULPH)", "3", "Remedio de alta importancia para o sintoma"],
            ["Capitalizado (ex: Sulph)", "2", "Remedio de media importancia"],
            ["minusculas (ex: sulph)", "1", "Remedio de baixa importancia"],
        ],
        col_widths=[tw * 0.25, tw * 0.1, tw * 0.65],
        styles_obj=s
    )
    story.append(t)

    story.append(Paragraph("Busca Global", s['H3']))
    bullet(story, s, "Pesquise em todas as 188.669 rubricas simultaneamente")
    bullet(story, s, "Busca com debounce (resposta instantanea enquanto digita)")
    bullet(story, s, "Resultados em portugues e ingles")

    story.append(Paragraph("Selecao para Repertorizacao", s['H3']))
    bullet(story, s, "Marque a caixa de selecao ao lado de cada rubrica desejada")
    bullet(story, s, "Badge flutuante mostra quantas rubricas foram selecionadas")
    bullet(story, s, "Navegue para a tela de Repertorizacao com as rubricas selecionadas")

    # 3.6 Remedios
    story.append(Paragraph("3.6 Remedios", s['H2']))
    bullet(story, s, "Catalogo completo com 3.943 remedios homeopaticos")
    bullet(story, s, "Busca por nome ou sinonimo")
    bullet(story, s, "Visualizacao em grade com codigo e nome")
    bullet(story, s, "Pagina de detalhe: informacoes do remedio, texto da Materia Medica, e rubricas onde o remedio aparece")

    # 3.7 Repertorizacao
    story.append(Paragraph("3.7 Repertorizacao", s['H2']))
    story.append(Paragraph("Motor de repertorizacao com 6 metodos classicos:", s['Body']))

    t = make_table(
        ["Metodo", "Descricao"],
        [
            ["Soma de Graus", "Soma simples dos graus de cada remedio nas rubricas selecionadas"],
            ["Cobertura", "Conta em quantas rubricas cada remedio aparece"],
            ["Kent", "Peso por categoria: sintomas mentais x5, gerais x3, particulares x1"],
            ["Boenninghausen", "Peso por tipo: localizacao, sensacao, modalidade, concomitante"],
            ["Hahnemann", "Metodo classico hahnemanniano"],
            ["Algoritmico", "Combina pesos Kent + categorias Boenninghausen"],
        ],
        col_widths=[tw * 0.22, tw * 0.78],
        styles_obj=s
    )
    story.append(t)

    story.append(Paragraph("Controles por Metodo", s['H3']))
    bullet(story, s, "<b>Kent e Algoritmico:</b> seletor de peso (mental, geral, particular) por rubrica")
    bullet(story, s, "<b>Boenninghausen e Algoritmico:</b> seletor de categoria (localizacao, sensacao, modalidade, concomitante)")
    bullet(story, s, "<b>Todos os metodos:</b> intensidade (1 a 3 pontos) por rubrica")

    story.append(Paragraph("Visualizacao de Resultados", s['H3']))
    bullet(story, s, "<b>Matriz:</b> top 20 remedios x rubricas selecionadas, com grau em cada celula")
    bullet(story, s, "<b>Ranking em barras:</b> classificacao visual dos remedios por pontuacao")
    bullet(story, s, "Eliminacao de rubricas (toggle para excluir sem remover)")
    bullet(story, s, "Limpar todas as rubricas selecionadas")

    story.append(PageBreak())

    # 3.8 Agenda
    story.append(Paragraph("3.8 Agenda (Dia, Semana, Mes)", s['H2']))
    story.append(Paragraph("Tres modos de visualizacao:", s['Body']))
    bullet(story, s, "<b>Vista Diaria:</b> Grade de slots de 30 min (07:00 as 20:30)")
    bullet(story, s, "<b>Vista Semanal:</b> Grid de 7 colunas (segunda a domingo) com horarios")
    bullet(story, s, "<b>Vista Mensal:</b> Calendario com mini-cards de agendamentos por dia")
    bullet(story, s, "Navegacao: anterior/proximo + botao 'Hoje'")
    bullet(story, s, "Tipos: Consulta, Retorno, Primeira Consulta, Teleconsulta")
    bullet(story, s, "Status: Agendado, Confirmado, Concluido, Cancelado")
    bullet(story, s, "Teleconsulta: gera link Jitsi Meet automaticamente")

    # 3.9 Telemedicina
    story.append(Paragraph("3.9 Telemedicina Integrada", s['H2']))
    story.append(Paragraph("Videochamada embutida na plataforma (CFM Resolucao 2.314/2022):", s['Body']))
    bullet(story, s, "Lista de teleconsultas proximas e anteriores")
    bullet(story, s, "Botao 'Entrar' abre sala Jitsi Meet com prontuario lado a lado")
    bullet(story, s, "Compartilhe o link com o paciente para acesso")

    # 3.10 Transcricao por IA
    story.append(Paragraph("3.10 Transcricao por Voz (IA)", s['H2']))
    story.append(Paragraph("Grave a consulta e a IA transcreve automaticamente:", s['Body']))
    bullet(story, s, "Disponivel na consulta e em cada secao da anamnese")
    bullet(story, s, "Clique no microfone, fale e pare a gravacao")
    bullet(story, s, "A IA (Whisper/OpenAI) transcreve o audio para texto")
    bullet(story, s, "O texto e inserido automaticamente no campo correspondente")

    # 3.11 Casos Clinicos
    story.append(Paragraph("3.11 Banco de Casos Clinicos", s['H2']))
    story.append(Paragraph("Registre e consulte casos clinicos anonimos:", s['Body']))
    bullet(story, s, "Titulo, resumo, sintomas, rubricas, repertorizacao")
    bullet(story, s, "Remedio prescrito, potencia e desfecho")
    bullet(story, s, "Avaliacao por estrelas (1-5) e tags para busca")
    bullet(story, s, "A IA analisa padroes entre os casos registrados")

    # 3.12 Fitoterapia e Dicionario
    story.append(Paragraph("3.12 Fitoterapia e Dicionario Medico", s['H2']))
    bullet(story, s, "<b>310 plantas medicinais</b> com nome cientifico, indicacoes, posologia")
    bullet(story, s, "<b>243 termos</b> no dicionario medico (termos homeopaticos + tratamentos)")
    bullet(story, s, "Busca por nome ou indicacao")

    # 3.13 Templates de Anamnese
    story.append(Paragraph("3.13 Templates de Anamnese", s['H2']))
    story.append(Paragraph("5 modelos especializados com perguntas-guia:", s['Body']))
    bullet(story, s, "<b>Homeopatia Classica</b> \u2014 8 secoes completas")
    bullet(story, s, "<b>Pediatria Homeopatica</b> \u2014 adaptado para criancas")
    bullet(story, s, "<b>Dermatologia</b> \u2014 foco em sintomas de pele")
    bullet(story, s, "<b>Ginecologia/Obstetricia</b> \u2014 ciclo menstrual, hormonal")
    bullet(story, s, "<b>Psiquiatria</b> \u2014 humor, afeto, pensamento, percepcao")

    # 3.14 Documentos
    story.append(Paragraph("3.14 Documentos", s['H2']))
    story.append(Paragraph("Geracao de documentos clinicos vinculados ao paciente:", s['Body']))
    bullet(story, s, "<b>TCLE</b> \u2014 Termo de Consentimento Livre e Esclarecido")
    bullet(story, s, "<b>Prescricao</b> \u2014 Receituario homeopatico formatado")
    bullet(story, s, "<b>Atestado</b> \u2014 Atestado medico")
    bullet(story, s, "<b>Relatorio Clinico</b> \u2014 Relatorio medico detalhado")

    # 3.15 Assistente IA
    story.append(Paragraph("3.15 Assistente de IA", s['H2']))
    story.append(Paragraph("Processo guiado em 4 etapas:", s['Body']))
    numbered(story, s, 1, "<b>Descrever Sintomas</b> \u2014 Cole ou digite a descricao dos sintomas (preenchimento automatico a partir da anamnese)")
    numbered(story, s, 2, "<b>Revisar Sintomas</b> \u2014 A IA identifica sintomas e sugere rubricas do repertorio para selecao")
    numbered(story, s, 3, "<b>Repertorizar</b> \u2014 Escolha o metodo e execute a analise")
    numbered(story, s, 4, "<b>Prescricao Assistida</b> \u2014 A IA gera sugestao com: nome do remedio, potencia (dinamizacao), posologia, frequencia e raciocinio clinico")

    story.append(Paragraph(
        '<b>Importante:</b> O Assistente de IA e uma ferramenta auxiliar. A decisao final e sempre do profissional de saude.',
        s['Warning']
    ))

    story.append(PageBreak())


def add_admin_features(story, s):
    add_section_header(story, s, "4. Funcionalidades do Administrador da Clinica")
    story.append(Paragraph(
        "O Administrador possui <b>todas as funcionalidades do Doutor</b>, mais as funcoes de gestao abaixo.",
        s['Body']
    ))

    # 4.1 Financeiro
    story.append(Paragraph("4.1 Financeiro", s['H2']))
    bullet(story, s, "Navegacao por mes/ano")
    bullet(story, s, "Cards de resumo: receitas totais, despesas totais, saldo")
    bullet(story, s, "Tabela de transacoes: data, tipo (receita/despesa), descricao, paciente, categoria, valor")
    bullet(story, s, "Adicionar nova receita ou despesa")

    # 4.2 Auditoria
    story.append(Paragraph("4.2 Auditoria", s['H2']))
    story.append(Paragraph("Registro completo e imutavel de todas as acoes na plataforma:", s['Body']))
    bullet(story, s, "Acoes registradas: LOGIN, LOGOUT, PATIENT_NEW, PATIENT_EDIT, PATIENT_DELETE, CONSULTATION_NEW, CONSULTATION_EDIT, ANAMNESIS_SAVE, LGPD_CONSENT, entre outras")
    bullet(story, s, "Exibe: data/hora, acao, detalhes, nome do usuario")
    bullet(story, s, "Paginacao (50 registros por pagina)")
    bullet(story, s, "Contagem total de registros")
    bullet(story, s, "Exportavel para auditoria externa")

    # 4.3 LGPD
    story.append(Paragraph("4.3 LGPD (Lei Geral de Protecao de Dados)", s['H2']))
    story.append(Paragraph("Hub de conformidade com a LGPD:", s['Body']))

    story.append(Paragraph("Gestao de Consentimentos", s['H3']))
    bullet(story, s, "Lista todos os pacientes da clinica")
    bullet(story, s, "Consentimentos granulares por paciente:")
    bullet(story, s, "Tratamento Medico", indent=1)
    bullet(story, s, "Armazenamento de Dados", indent=1)
    bullet(story, s, "Comunicacoes", indent=1)
    bullet(story, s, "Botoes para conceder/revogar cada tipo de consentimento")
    bullet(story, s, "Rastreamento de datas de consentimento")

    story.append(Paragraph("Exportacao de Dados (Portabilidade \u2014 Art. 18 LGPD)", s['H3']))
    bullet(story, s, "Exportar dados do paciente em formato portavel")
    bullet(story, s, "Atende ao direito de portabilidade da LGPD")

    story.append(Paragraph("Anonimizacao", s['H3']))
    bullet(story, s, "Anonimizar/pseudonimizar dados para pesquisa ou estatisticas")
    bullet(story, s, "Preserva utilidade dos dados sem identificar o paciente")

    # 4.4 Configuracoes
    story.append(Paragraph("4.4 Configuracoes", s['H2']))
    story.append(Paragraph("Dados da Clinica", s['H3']))
    bullet(story, s, "Nome, CNPJ, telefone, e-mail, endereco, CRM")

    story.append(Paragraph("DPO (Encarregado de Dados \u2014 Art. 41 LGPD)", s['H3']))
    bullet(story, s, "Nome e e-mail do DPO")
    bullet(story, s, "Obrigatorio conforme Art. 41 da LGPD")

    # 4.5 Assinatura
    story.append(Paragraph("4.5 Assinatura e Faturamento", s['H2']))
    bullet(story, s, "Gerenciar plano atual")
    bullet(story, s, "Metodos de pagamento (via Stripe)")
    bullet(story, s, "Historico de faturas")
    bullet(story, s, "Upgrade/downgrade de plano")

    # 4.6 Equipe
    story.append(Paragraph("4.6 Gestao de Equipe", s['H2']))
    bullet(story, s, "Visualizar membros da equipe")
    bullet(story, s, "Convidar novos membros (e-mail + papel)")
    bullet(story, s, "Gerenciar papeis (Medico/Administrador)")

    # 4.7 Importacao/Exportacao
    story.append(Paragraph("4.7 Importacao e Exportacao de Dados", s['H2']))
    bullet(story, s, "<b>Importar CSV:</b> Arraste ou selecione arquivo CSV com dados de pacientes")
    bullet(story, s, "Modelo CSV disponivel para download")
    bullet(story, s, "Colunas: Nome (obrigatorio), CPF, RG, Data Nascimento, Sexo, Telefone, Email, Endereco")
    bullet(story, s, "Preview dos dados antes da importacao")
    bullet(story, s, "Dados importados sao automaticamente criptografados (AES-256-GCM)")
    bullet(story, s, "<b>Exportar CSV:</b> Exporte todos os pacientes em formato CSV")
    bullet(story, s, "<b>Exportar Auditoria:</b> Exporte o log de auditoria completo")

    # 4.8 Dashboard Analitico
    story.append(Paragraph("4.8 Dashboard Analitico", s['H2']))
    bullet(story, s, "Graficos de consultas por mes e novos pacientes por mes")
    bullet(story, s, "Cards: total de pacientes, consultas do mes, consultas de hoje, agendamentos de hoje")
    bullet(story, s, "Taxa de retorno e taxa de conclusao")
    bullet(story, s, "Lista de proximos agendamentos do dia")

    # 4.9 App Mobile (PWA)
    story.append(Paragraph("4.9 App Mobile (PWA)", s['H2']))
    bullet(story, s, "Instale no celular ou tablet como aplicativo nativo")
    bullet(story, s, "Acesso rapido ao repertorio, agenda e pacientes")
    bullet(story, s, "Funciona offline para dados ja carregados")
    bullet(story, s, "Notificacoes de agendamentos proximos")

    story.append(PageBreak())


def add_superadmin_features(story, s):
    add_section_header(story, s, "5. Funcionalidades do Superadministrador")
    story.append(Paragraph(
        "O Superadministrador tem acesso global a plataforma para gerenciar todas as clinicas.",
        s['Body']
    ))
    story.append(Paragraph(
        'Acesso: menu <b>"PLATAFORMA" \u2192 "Admin"</b> na barra lateral.',
        s['Body']
    ))

    # 5.1 Dashboard Admin
    story.append(Paragraph("5.1 Painel de Administracao (Dashboard)", s['H2']))

    story.append(Paragraph("Metricas Globais", s['H3']))
    bullet(story, s, "Total de clinicas na plataforma")
    bullet(story, s, "Total de usuarios")
    bullet(story, s, "Total de pacientes")
    bullet(story, s, "Assinaturas ativas, em trial e canceladas")

    story.append(Paragraph("Sistema de Alertas Automaticos", s['H3']))
    story.append(Paragraph("A plataforma detecta automaticamente:", s['Body']))
    bullet(story, s, "Clinicas com trial expirado (ainda marcadas como trial)")
    bullet(story, s, "Clinicas com numero de usuarios excedendo o limite do plano")
    bullet(story, s, "Clinicas com uso elevado (8+ usuarios)")
    story.append(Paragraph("Cada alerta e clicavel e leva a pagina de detalhes da clinica.", s['Body']))

    story.append(Paragraph("Tabela de Clinicas", s['H3']))
    story.append(Paragraph("Lista todas as clinicas com:", s['Body']))
    bullet(story, s, "Nome e e-mail")
    bullet(story, s, "Plano (Gratuito, Profissional, Enterprise)")
    bullet(story, s, "Status (Trial, Ativo, Cancelado, Inadimplente)")
    bullet(story, s, "Usuarios e pacientes (destacado em vermelho se exceder limite)")
    bullet(story, s, "Data de expiracao do trial e data de criacao")
    bullet(story, s, "Link para pagina de gestao")

    # 5.2 Gestao Individual
    story.append(Paragraph("5.2 Gestao de Clinica Individual", s['H2']))

    story.append(Paragraph("Informacoes da Clinica", s['H3']))
    story.append(Paragraph(
        "Visualizacao completa: ID, e-mail, CNPJ, telefone, plano, data de criacao, trial, "
        "periodo atual, total de pacientes, total de registros de auditoria.",
        s['Body']
    ))

    story.append(Paragraph("Ajustar Limites", s['H3']))
    bullet(story, s, "<b>Maximo de Pacientes:</b> alterar o limite independente do plano")
    bullet(story, s, "<b>Maximo de Usuarios:</b> alterar o limite independente do plano")
    bullet(story, s, "<b>Status da Assinatura:</b> alterar diretamente (Trial, Ativo, Cancelado, Inadimplente)")

    story.append(Paragraph(
        '<b>Dica:</b> Use esta funcionalidade para conceder "descontos" \u2014 por exemplo, dar limites do plano Profissional mantendo o plano Gratuito.',
        s['Tip']
    ))

    story.append(Paragraph("Gerenciar Trial e Assinatura", s['H3']))
    story.append(Paragraph("<b>Data de Expiracao do Trial:</b>", s['BodyBold']))
    bullet(story, s, "Campo de data editavel")
    bullet(story, s, "Botoes rapidos: +7 dias, +14 dias, +30 dias, Limpar")
    bullet(story, s, "Permite prorrogar ou reduzir o periodo de avaliacao")

    story.append(Paragraph("<b>Data de Fim do Periodo Atual:</b>", s['BodyBold']))
    bullet(story, s, "Campo de data editavel")
    bullet(story, s, "Botoes rapidos: +30 dias, +90 dias, +1 ano, Limpar")
    bullet(story, s, "Controla o periodo de faturamento")

    story.append(Paragraph("<b>Mudanca de Plano:</b>", s['BodyBold']))
    bullet(story, s, "Seletor: Gratuito (10 pac/1 usr), Profissional (500 pac/3 usr), Enterprise (ilimitado/12 usr)")
    bullet(story, s, 'Opcao "Aplicar limites padrao do plano": ao marcar, os limites sao automaticamente ajustados para os valores do novo plano')

    story.append(Paragraph("Gerenciar Usuarios da Clinica", s['H3']))
    story.append(Paragraph("Tabela com todos os usuarios: nome, e-mail, papel (Admin/Medico), status (Ativo/Inativo), data de criacao.", s['Body']))
    story.append(Paragraph("<b>Acoes disponiveis:</b>", s['BodyBold']))
    bullet(story, s, "<b>Ativar/Desativar:</b> clique no icone de energia para alternar o status (usuario desativado nao consegue fazer login)")
    bullet(story, s, "<b>Excluir Usuario:</b> clique no icone de lixeira (requer confirmacao)")
    bullet(story, s, "Protecao: nao e possivel excluir o ultimo administrador da clinica", indent=1)
    bullet(story, s, "Protecao: nao e possivel excluir usuario com consultas registradas (use desativacao)", indent=1)

    story.append(Paragraph("Zona de Perigo \u2014 Excluir Clinica", s['H3']))
    story.append(Paragraph(
        "Area com borda vermelha no final da pagina para acao irreversivel:",
        s['Body']
    ))
    numbered(story, s, 1, "Digite o nome exato da clinica no campo de confirmacao")
    numbered(story, s, 2, 'O botao "Excluir Clinica" so e habilitado quando o nome confere')
    numbered(story, s, 3, "Um dialogo de confirmacao mostra: nome da clinica, quantidade de pacientes, usuarios e registros de auditoria que serao removidos")
    numbered(story, s, 4, "Ao confirmar, TODOS os dados sao permanentemente removidos")

    story.append(Paragraph(
        "ATENCAO: Esta acao e IRREVERSIVEL. Todos os dados clinicos serao permanentemente perdidos.",
        s['Warning']
    ))

    story.append(PageBreak())


def add_permissions_table(story, s):
    add_section_header(story, s, "6. Tabela de Permissoes por Nivel")

    tw = WIDTH - 2 * MARGIN
    rows = [
        ["Dashboard", "Sim", "Sim", "\u2014"],
        ["Pacientes (ver/cadastrar/editar)", "Sim", "Sim", "\u2014"],
        ["Anamnese Homeopatica", "Sim", "Sim", "\u2014"],
        ["Consultas (prontuario)", "Sim", "Sim", "\u2014"],
        ["Repertorio Homeopatico", "Sim", "Sim", "\u2014"],
        ["Remedios", "Sim", "Sim", "\u2014"],
        ["Repertorizacao", "Sim", "Sim", "\u2014"],
        ["Agenda", "Sim", "Sim", "\u2014"],
        ["Documentos", "Sim", "Sim", "\u2014"],
        ["Assistente de IA", "Sim", "Sim", "\u2014"],
        ["Financeiro", "Nao", "Sim", "\u2014"],
        ["Auditoria", "Nao", "Sim", "\u2014"],
        ["LGPD (consentimentos/export)", "Nao", "Sim", "\u2014"],
        ["Configuracoes da Clinica", "Nao", "Sim", "\u2014"],
        ["Assinatura/Faturamento", "Nao", "Sim", "\u2014"],
        ["Gestao de Equipe", "Nao", "Sim", "\u2014"],
        ["Painel Admin (Plataforma)", "Nao", "Nao", "Sim"],
        ["Gerenciar Clinicas", "Nao", "Nao", "Sim"],
        ["Alterar Planos/Trials", "Nao", "Nao", "Sim"],
        ["Desativar/Excluir Usuarios", "Nao", "Nao", "Sim"],
        ["Excluir Clinicas", "Nao", "Nao", "Sim"],
    ]

    t = make_centered_table(
        ["Funcionalidade", "Doutor", "Administrador", "Superadmin"],
        rows,
        col_widths=[tw * 0.40, tw * 0.15, tw * 0.22, tw * 0.23],
        styles_obj=s
    )
    story.append(t)
    story.append(PageBreak())


def add_plans(story, s):
    add_section_header(story, s, "7. Planos e Limites")

    tw = WIDTH - 2 * MARGIN
    rows = [
        ["Pacientes", "10", "500", "Ilimitado"],
        ["Usuarios", "1", "3", "12"],
        ["Consultas/mes", "20", "Ilimitado", "Ilimitado"],
        ["Repertorio completo", "Sim", "Sim", "Sim"],
        ["Repertorizacao", "Sim", "Sim", "Sim"],
        ["Assistente de IA", "Sim", "Sim", "Sim"],
        ["LGPD completo", "Sim", "Sim", "Sim"],
    ]

    t = make_centered_table(
        ["Caracteristica", "Gratuito", "Profissional", "Enterprise"],
        rows,
        col_widths=[tw * 0.35, tw * 0.20, tw * 0.22, tw * 0.23],
        styles_obj=s
    )
    story.append(t)
    story.append(PageBreak())


def add_legal(story, s):
    add_section_header(story, s, "8. Conformidade Legal")

    story.append(Paragraph("LGPD \u2014 Lei no 13.709/2018", s['H2']))
    bullet(story, s, "<b>Art. 11, II, \"f\":</b> Processamento de dados de saude por profissionais de saude")
    bullet(story, s, "<b>Art. 18:</b> Direitos do titular (acesso, correcao, exclusao, portabilidade)")
    bullet(story, s, "<b>Art. 41:</b> Designacao do DPO (Encarregado de Dados)")
    bullet(story, s, "<b>Art. 46:</b> Medidas de seguranca (criptografia, controle de acesso, auditoria)")
    bullet(story, s, "<b>Art. 48:</b> Notificacao de incidentes em 72 horas")

    story.append(Paragraph("CFM \u2014 Conselho Federal de Medicina", s['H2']))
    bullet(story, s, "<b>Resolucao 1.821/2007:</b> Requisitos para prontuario eletronico")
    bullet(story, s, "<b>Resolucao 1.638/2002:</b> Padroes de conteudo do prontuario")
    bullet(story, s, "<b>Lei 13.787/2018:</b> Digitalizacao de prontuarios com mesma validade legal")

    story.append(Paragraph("Seguranca", s['H2']))
    bullet(story, s, "Criptografia AES-256-GCM para dados sensiveis")
    bullet(story, s, "Derivacao de chaves com PBKDF2 (100.000 iteracoes)")
    bullet(story, s, "Isolamento de dados por clinica (multi-tenancy)")
    bullet(story, s, "Retencao minima de 20 anos para prontuarios medicos (CFM)")
    bullet(story, s, "Trilha de auditoria imutavel")

    story.append(PageBreak())


def add_faq(story, s):
    add_section_header(story, s, "9. Perguntas Frequentes")

    faqs = [
        ("Posso acessar de qualquer dispositivo?",
         "Sim, a plataforma e acessivel por qualquer navegador moderno, incluindo tablets e smartphones."),
        ("Meus dados estao seguros?",
         "Sim. Utilizamos criptografia AES-256-GCM, isolamento de dados por clinica, e conformidade total com a LGPD."),
        ("Posso exportar os dados dos meus pacientes?",
         "Sim. O modulo LGPD permite exportacao de dados em formato portavel, atendendo ao Art. 18 da LGPD."),
        ("O que acontece quando o trial expira?",
         "Voce sera redirecionado para a tela de trial expirado. O acesso a faturamento permanece disponivel para upgrade do plano."),
        ("Posso ter mais de um administrador na clinica?",
         "Sim. Voce pode convidar multiplos administradores, respeitando o limite de usuarios do seu plano."),
        ("Os dados do repertorio sao confiaveis?",
         "O repertorio contem 188.669 rubricas extraidas e validadas, representando o maior acervo homeopatico em portugues do Brasil."),
        ("A prescricao do Assistente de IA substitui o julgamento medico?",
         "Nao. O Assistente de IA e uma ferramenta auxiliar. A decisao final e sempre do profissional de saude."),
    ]

    for q, a in faqs:
        story.append(Paragraph(f"<b>P: {q}</b>", s['BodyBold']))
        story.append(Paragraph(f"R: {a}", s['Body']))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 2 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_GRAY, spaceAfter=12))
    story.append(Paragraph("HomeoClinic Pro v2.0 \u2014 Marco 2026", s['Footer']))
    story.append(Paragraph("homeoclinic-ia.com", s['Footer']))


def add_page_number(canvas_obj, doc):
    """Add page number and footer to each page."""
    page_num = canvas_obj.getPageNumber()
    if page_num > 1:  # Skip cover
        canvas_obj.saveState()
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(GRAY)
        canvas_obj.drawCentredString(
            WIDTH / 2, 1.2 * cm,
            f"HomeoClinic Pro \u2014 Manual do Usuario  |  Pagina {page_num}"
        )
        # Top green line
        canvas_obj.setStrokeColor(PRIMARY)
        canvas_obj.setLineWidth(1)
        canvas_obj.line(MARGIN, HEIGHT - MARGIN + 8, WIDTH - MARGIN, HEIGHT - MARGIN + 8)
        canvas_obj.restoreState()


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "manual-homeoclinic-pro.pdf")

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title="HomeoClinic Pro - Manual do Usuario",
        author="HomeoClinic Pro",
        subject="Manual do Usuario da Plataforma",
    )

    s = get_styles()
    story = []

    # Build document
    add_cover(story, s)
    add_toc(story, s)
    add_intro(story, s)
    add_getting_started(story, s)
    add_doctor_features(story, s)
    add_admin_features(story, s)
    add_superadmin_features(story, s)
    add_permissions_table(story, s)
    add_plans(story, s)
    add_legal(story, s)
    add_faq(story, s)

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generated: {output_path}")


if __name__ == "__main__":
    main()
