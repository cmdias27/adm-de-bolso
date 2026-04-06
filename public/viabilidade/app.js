document.getElementById('viabilidadeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // ==========================================
    // 1. CAPTURA DOS DADOS DO CLIENTE (FIREBASE)
    // ==========================================
    const nomeCliente = document.getElementById('nomeCliente').value;
    const whatsappCliente = document.getElementById('whatsappCliente').value;

    // ==========================================
    // 2. DADOS DO PROJETO E QUALITATIVOS
    // ==========================================
    const modeloNegocio = document.getElementById('modeloNegocio').value;
    const localizacao = document.getElementById('localizacao').value;
    const dependenciaRenda = document.getElementById('dependenciaRenda').value;
    const fonteInvestimento = document.getElementById('fonteInvestimento').value;
    const produtoPrincipal = document.getElementById('produtoPrincipal').value;

    // 3. Dados de Investimento (Capex)
    const capitalTotal = parseFloat(document.getElementById('capitalTotal').value);
    const custoReforma = parseFloat(document.getElementById('custoReforma').value);
    const custoEquipamentos = parseFloat(document.getElementById('custoEquipamentos').value);
    const custoBurocracia = parseFloat(document.getElementById('custoBurocracia').value);
    const estoqueInicial = parseFloat(document.getElementById('estoqueInicial').value);

    // 4. Custos Fixos (Opex)
    const custoAluguel = parseFloat(document.getElementById('custoAluguel').value);
    const custoEquipe = parseFloat(document.getElementById('custoEquipe').value);
    const despesasBasicas = parseFloat(document.getElementById('despesasBasicas').value);
    const proLabore = parseFloat(document.getElementById('proLabore').value);

    // 5. Receitas
    const precoVenda = parseFloat(document.getElementById('precoVenda').value);
    const custoVariavel = parseFloat(document.getElementById('custoVariavel').value);
    const vendasPorDia = parseInt(document.getElementById('vendasPorDia').value);

    // ==========================================
    // 6. A MATEMÁTICA PURA E LÓGICA DE DECISÃO
    // ==========================================
    const totalAbertura = custoReforma + custoEquipamentos + custoBurocracia + estoqueInicial;
    const capitalGiro = capitalTotal - totalAbertura;
    const custoFixoTotal = custoAluguel + custoEquipe + despesasBasicas + proLabore;
    const margemUnitaria = precoVenda - custoVariavel;
    
    const pontoEquilibrioMensal = custoFixoTotal / margemUnitaria;
    const pontoEquilibrioDiario = Math.ceil(pontoEquilibrioMensal / 30); // Arredonda sempre pra cima

    const vendasMensaisAposta = vendasPorDia * 30;
    const lucroOperacionalMes1 = (vendasMensaisAposta * margemUnitaria) - custoFixoTotal;

    // A JOGADA DE MESTRE: Decidimos a lógica AQUI no código, não na IA.
    const capitalGiroPositivo = capitalGiro >= 0;
    const bateuAMeta = vendasPorDia >= pontoEquilibrioDiario;

    // Tela de Carregamento
    const divResultado = document.getElementById('resultado');
    const textoResultado = document.getElementById('textoResultado');
    divResultado.style.display = 'block';
    textoResultado.innerHTML = "<p><i>Simulando fluxo de caixa e projetando sobrevivência...</i></p>";

    // ==========================================
    // 7. O PROMPT BLINDADO E HUMANIZADO
    // ==========================================
    const promptConsultoria = `
        Atue como um Consultor de Negócios experiente, direto e muito humano do 'Adm de Bolso'. O cliente quer abrir o seguinte negócio: "${modeloNegocio}".

        Eu já fiz a matemática e você NÃO PODE errar estes fatos. Aqui está a VERDADE ABSOLUTA:
        - Fôlego de Caixa: R$ ${capitalGiro.toFixed(2)} (Está ${capitalGiroPositivo ? 'positivo' : 'NEGATIVO'}).
        - Ponto de Equilíbrio: A empresa TEM QUE vender ${pontoEquilibrioDiario} itens por dia para empatar as contas (pagar Custo Fixo de R$ ${custoFixoTotal}).
        - Aposta do Cliente: Ele apostou que vai vender ${vendasPorDia} itens por dia.
        - Resultado da Simulação: ${bateuAMeta ? `ELE BATEU A META! A aposta dele gera um Lucro de R$ ${lucroOperacionalMes1.toFixed(2)} no mês.` : `PREJUÍZO! A aposta dele não alcança a meta e vai gerar um buraco de R$ ${lucroOperacionalMes1.toFixed(2)} no mês.`}
        - Depende dessa renda no mês 1? ${dependenciaRenda}.

        Sua missão: Escreva um 'Parecer de Viabilidade' em 3 a 4 parágrafos, como se estivesse conversando com o cliente na mesa. 
        REGRAS DO PARECER:
        1. Comece dando o veredito direto sobre o Capital de Giro. Se estiver negativo, diga que o projeto morre antes de abrir as portas.
        2. Fale sobre a meta de ${pontoEquilibrioDiario} vendas diárias vs a aposta dele de ${vendasPorDia}. 
        3. ${bateuAMeta ? `Como a simulação DEU LUCRO, parabenize-o pelos números. Mas traga-o para a realidade: pergunte se é realmente fácil vender ${vendasPorDia} itens logo no primeiro mês, sem ter marca conhecida.` : `Como a simulação DEU PREJUÍZO, dê o alerta vermelho. Se ele disse que 'precisa do dinheiro urgente' (${dependenciaRenda}), alerte que ele vai passar necessidade financeira se não cortar custos imediatamente.`}
        4. O tom deve ser conselheiro, sem jargões como "Opex" ou "Capex". Use "Despesas", "Custo para abrir", "Gordura financeira".
        5. Formate em HTML básico (use <p>, <b>). NÃO use formatação markdown de código.
    `;

// ==========================================
    // 8. O PAYLOAD COMPLETO (DADOS ENVIADOS AO SERVIDOR)
    // ==========================================
    const payload = {
        prompt: promptConsultoria,
        dadosCliente: {
            // Contato
            nome: nomeCliente,
            whatsapp: whatsappCliente,
            
            // Qualitativo
            projeto: modeloNegocio,
            localizacao: localizacao,
            dependenciaRenda: dependenciaRenda,
            fonteInvestimento: fonteInvestimento,
            
            // Financeiro
            capitalTotal: capitalTotal,
            custoReforma: custoReforma,
            custoEquipamentos: custoEquipamentos,
            custoBurocracia: custoBurocracia,
            estoqueInicial: estoqueInicial,
            custoAluguel: custoAluguel,
            custoEquipe: custoEquipe,
            despesasBasicas: despesasBasicas,
            proLabore: proLabore,
            
            // Mercado
            produtoPrincipal: produtoPrincipal,
            precoVenda: precoVenda,
            custoVariavel: custoVariavel,
            vendasPorDia: vendasPorDia,
            
            // Resultados Calculados
            resultadoStatus: bateuAMeta ? 'Viável' : 'Risco de Prejuízo',
            pontoEquilibrioDiario: pontoEquilibrioDiario
        }
    };

    // ==========================================
    // 9. COMUNICAÇÃO COM O BACKEND (NODE.JS)
    // ==========================================
    try {
        const resposta = await fetch('/api/consultoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            let htmlLimpo = dados.relatorio.replace(/```html/g, '').replace(/```/g, '');
            
            textoResultado.innerHTML = `
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
                    <strong>Seu Painel de Viabilidade:</strong><br>
                    <span style="color: ${capitalGiroPositivo ? 'green' : 'red'};">Capital de Giro (Sobra): R$ ${capitalGiro.toFixed(2)}</span><br>
                    Meta de Sobrevivência: Vender <b>${pontoEquilibrioDiario} itens</b> por dia.<br>
                    Sua Aposta: Vender <b>${vendasPorDia} itens</b> por dia.<br>
                    Status da Simulação: <strong style="color: ${bateuAMeta ? 'green' : 'red'};">${bateuAMeta ? 'VIÁVEL (NO PAPEL)' : 'ALTO RISCO DE PREJUÍZO'}</strong>
                </div>
                ${htmlLimpo}
                <button id="btnChamarConsultor">💬 Revisar números com o Consultor</button>
            `;
            document.getElementById('btnChamarConsultor').addEventListener('click', () => iniciarChat(htmlLimpo));
        } else {
            textoResultado.innerHTML = `<p style="color: red;">Erro no servidor.</p>`;
        }
    } catch (erro) {
        console.error(erro);
        textoResultado.innerHTML = `<p style="color: red;">Falha ao conectar com a IA.</p>`;
    }
});

// ==========================================
// 10. LÓGICA DE HANDOFF (TRANSIÇÃO PARA CHAT)
// ==========================================
function iniciarChat(relatorioIA) {
    document.getElementById('areaFormulario').style.display = 'none';
    document.getElementById('chatInterface').style.display = 'block';
    
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `
        <div class="msg msg-system">
            <strong>🤖 Resumo da IA:</strong><br>
            Aviso de simulação enviado ao consultor.
        </div>
    `;

    setTimeout(() => {
        chatBox.innerHTML += `
            <div class="msg msg-consultant">
                <strong>👨‍💼 Consultor Adm de Bolso:</strong><br>
                Olá, futuro empreendedor. Vi o diagnóstico da sua simulação.<br><br>
                Papel aceita tudo, mas o mercado real é um pouco mais duro. A nossa máquina cruzou seus custos operacionais. Por onde você quer começar a mexer na sua estratégia para garantirmos que essa ideia dê certo logo no dia 1?
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 2000);
}

// Envio de mensagens no Chat
document.getElementById('btnEnviarMsg').addEventListener('click', enviarMensagemUsuario);
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') enviarMensagemUsuario();
});

function enviarMensagemUsuario() {
    const input = document.getElementById('userInput');
    const texto = input.value.trim();
    if (texto !== '') {
        const chatBox = document.getElementById('chatMessages');
        chatBox.innerHTML += `<div class="msg msg-user">${texto}</div>`;
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
        setTimeout(() => {
            chatBox.innerHTML += `<div class="msg msg-consultant"><em>(Consultor avaliando cenário...)</em></div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1500);
    }
}