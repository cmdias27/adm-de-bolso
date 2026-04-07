document.getElementById('viabilidadeForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 1. Contato
    const nomeCliente = document.getElementById('nomeCliente').value;
    const whatsappCliente = document.getElementById('whatsappCliente').value;

    // 2. Projeto e Localização
    const modeloNegocio = document.getElementById('modeloNegocio').value;
    const ramoAtuacao = document.getElementById('ramoAtuacao').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;
    const bairro = document.getElementById('bairro').value;
    const localizacao = document.getElementById('localizacao').value;
    const dependenciaRenda = document.getElementById('dependenciaRenda').value;

    // 3. Capex (Abertura)
    const capitalTotal = parseFloat(document.getElementById('capitalTotal').value);
    const custoReforma = parseFloat(document.getElementById('custoReforma').value);
    const custoEquipamentos = parseFloat(document.getElementById('custoEquipamentos').value);
    const estoqueInicial = parseFloat(document.getElementById('estoqueInicial').value);
    const custoBurocracia = parseFloat(document.getElementById('custoBurocracia').value);

    // 4. Opex (Custo Fixo)
    const custoAluguel = parseFloat(document.getElementById('custoAluguel').value);
    const custoEquipe = parseFloat(document.getElementById('custoEquipe').value);
    const despesasBasicas = parseFloat(document.getElementById('despesasBasicas').value);
    const proLabore = parseFloat(document.getElementById('proLabore').value);

    // 5. Receitas
    const produtoPrincipal = document.getElementById('produtoPrincipal').value;
    const precoVenda = parseFloat(document.getElementById('precoVenda').value);
    const custoVariavel = parseFloat(document.getElementById('custoVariavel').value);
    const vendasPorDia = parseInt(document.getElementById('vendasPorDia').value);

    // 6. Matemática
    const totalAbertura = custoReforma + custoEquipamentos + custoBurocracia + estoqueInicial;
    const capitalGiro = capitalTotal - totalAbertura;
    const custoFixoTotal = custoAluguel + custoEquipe + despesasBasicas + proLabore;
    const margemUnitaria = precoVenda - custoVariavel;
    
    const pontoEquilibrioMensal = custoFixoTotal / margemUnitaria;
    const pontoEquilibrioDiario = Math.ceil(pontoEquilibrioMensal / 30);

    const vendasMensaisAposta = vendasPorDia * 30;
    const lucroOperacionalMes1 = (vendasMensaisAposta * margemUnitaria) - custoFixoTotal;

    const capitalGiroPositivo = capitalGiro >= 0;
    const bateuAMeta = vendasPorDia >= pontoEquilibrioDiario;

    const divResultado = document.getElementById('resultado');
    const textoResultado = document.getElementById('textoResultado');
    const btnAnalisar = document.getElementById('btnAnalisar');

    divResultado.style.display = 'block';
    textoResultado.innerHTML = "<p><i>Simulando fluxo de caixa e projetando sobrevivência...</i></p>";
    btnAnalisar.disabled = true;
    btnAnalisar.innerText = "Processando Dados...";

    // 7. Prompt
    const promptConsultoria = `
        Atue como Consultor Estratégico do 'Adm de Bolso'. O cliente quer abrir o negócio: "${modeloNegocio}" (Ramo: ${ramoAtuacao}) na cidade de ${cidade}-${estado}, bairro ${bairro}.

        Fatos matemáticos cruciais:
        - Fôlego de Caixa (Capital de Giro): R$ ${capitalGiro.toFixed(2)} (${capitalGiroPositivo ? 'Positivo' : 'NEGATIVO'}).
        - Ponto de Equilíbrio: Precisa de ${pontoEquilibrioDiario} vendas/atendimentos por dia para pagar os custos de R$ ${custoFixoTotal}.
        - Aposta: Ele projetou ${vendasPorDia} por dia.
        - Lucro Projetado: R$ ${lucroOperacionalMes1.toFixed(2)} (${bateuAMeta ? 'Lucro' : 'PREJUÍZO'}).

        Sua missão em 3 parágrafos:
        1. Avalie rapidamente o Capital de Giro e se ele será suficiente para a abertura.
        2. Analise a meta diária (${pontoEquilibrioDiario}) vs a projeção dele (${vendasPorDia}). Diga se é realista para um negócio novo.
        3. Encerre dizendo que a análise matemática foi feita e que o próximo passo é montar um 'Plano de Negócios Validado' com o consultor humano, mapeando concorrentes e estratégias para a região de ${cidade}.
        Seja encorajador, mas muito realista com os riscos. Use formatação HTML básica (<p>, <b>).
    `;

    const payload = {
        prompt: promptConsultoria,
        dadosCliente: {
            nome: nomeCliente, whatsapp: whatsappCliente,
            projeto: modeloNegocio, ramo: ramoAtuacao,
            cidade: cidade, estado: estado, bairro: bairro,
            localizacao: localizacao, dependenciaRenda: dependenciaRenda,
            capitalTotal: capitalTotal, custoReforma: custoReforma,
            custoEquipamentos: custoEquipamentos, custoBurocracia: custoBurocracia, estoqueInicial: estoqueInicial,
            custoAluguel: custoAluguel, custoEquipe: custoEquipe, despesasBasicas: despesasBasicas, proLabore: proLabore,
            produtoPrincipal: produtoPrincipal, precoVenda: precoVenda, custoVariavel: custoVariavel, vendasPorDia: vendasPorDia,
            resultadoStatus: bateuAMeta ? 'Viável' : 'Risco', pontoEquilibrioDiario: pontoEquilibrioDiario
        }
    };

    try {
        const resposta = await fetch('/api/consultoria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            let htmlLimpo = dados.relatorio.replace(/```html/g, '').replace(/```/g, '');
            
            // LINK DO WHATSAPP AQUI: Altere o número abaixo para o seu!
            const numeroWhatsAppConsultor = "5561991392337"; 
            const mensagemPronta = `Olá! Meu nome é ${nomeCliente}. Acabei de rodar o Simulador do Adm de Bolso para o meu projeto de ${modeloNegocio} e o sistema me recomendou falar com o consultor para montar o Plano de Negócios.`;
            const linkWhatsApp = `https://wa.me/${numeroWhatsAppConsultor}?text=${encodeURIComponent(mensagemPronta)}`;

            textoResultado.innerHTML = `
                <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
                    <strong>Raio-X Inicial:</strong><br>
                    <span style="color: ${capitalGiroPositivo ? 'green' : 'red'};">Capital de Giro: R$ ${capitalGiro.toFixed(2)}</span><br>
                    Meta Mínima: <b>${pontoEquilibrioDiario} vendas/dia</b>.<br>
                    Status Prévio: <strong style="color: ${bateuAMeta ? 'green' : 'red'};">${bateuAMeta ? 'VIÁVEL (No Papel)' : 'ALTO RISCO DE PREJUÍZO'}</strong>
                </div>
                ${htmlLimpo}
                
                <a href="${linkWhatsApp}" target="_blank" style="display: block; text-align: center; text-decoration: none; width: 100%; padding: 18px; background-color: #25D366; color: white; border-radius: 6px; font-size: 1.1em; font-weight: bold; margin-top: 20px; transition: 0.3s; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);">
                    <i class="bi bi-whatsapp"></i> Falar com o Consultor no WhatsApp
                </a>
            `;
        } else {
            textoResultado.innerHTML = `<p style="color: red;">Erro no servidor. Tente novamente mais tarde.</p>`;
        }
    } catch (erro) {
        textoResultado.innerHTML = `<p style="color: red;">Falha de conexão com a Inteligência Artificial.</p>`;
    } finally {
        btnAnalisar.disabled = false;
        btnAnalisar.innerText = "Gerar Simulação e Solicitar Plano";
    }
});