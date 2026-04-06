const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

// ==========================================
// 1. INICIALIZANDO O FIREBASE ADMIN
// ==========================================
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json"); // Sua chave baixada do Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); // Conectando ao Banco de Dados (Firestore)

const app = express();
app.use(cors());
app.use(express.json());

// Hospeda a pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa a conexão com o ChatGPT
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==========================================
// ROTA 1: CAPTURA RÁPIDA DE LEADS (PÁGINA PROMO)
// ==========================================
app.post('/api/captura-lead', async (req, res) => {
    try {
        const { nome, whatsapp } = req.body;
        
        if (!nome || !whatsapp) {
            return res.status(400).json({ erro: "Nome e WhatsApp são obrigatórios." });
        }

        console.log(`Novo Lead da Promoção capturado: ${nome}`);

        // Salva no Firebase na coleção 'leads_promo'
        await db.collection('leads_promo').add({
            nome: nome,
            whatsapp: whatsapp,
            origem: 'Campanha de Lançamento (Viabilidade)',
            status: 'Aguardando envio do link',
            dataRegistro: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ sucesso: true, mensagem: "Lead salvo com sucesso!" });

    } catch (erro) {
        console.error("Erro ao salvar lead da promo:", erro);
        res.status(500).json({ erro: "Falha interna no servidor ao salvar lead." });
    }
});

// ==========================================
// ROTA 2: ANÁLISE DE VIABILIDADE COMPLETA COM IA
// ==========================================
app.post('/api/consultoria', async (req, res) => {
    try {
        const { prompt, dadosCliente } = req.body;
        if (!prompt) return res.status(400).json({ erro: "O prompt não foi enviado." });

        console.log(`Recebendo dados completos de: ${dadosCliente.nome}`);

        // SALVANDO TODOS OS DADOS NO FIREBASE (Antes da IA responder)
        try {
            await db.collection('leads_viabilidade').add({
                // Informações de Contato
                nome: dadosCliente.nome,
                whatsapp: dadosCliente.whatsapp,
                
                // Dados do Negócio (Qualitativos)
                projeto: dadosCliente.projeto,
                localizacao: dadosCliente.localizacao,
                dependenciaRenda: dadosCliente.dependenciaRenda,
                fonteInvestimento: dadosCliente.fonteInvestimento,
                
                // Financeiro (Capex - Investimento Inicial)
                capitalTotal: dadosCliente.capitalTotal,
                custoReforma: dadosCliente.custoReforma,
                custoEquipamentos: dadosCliente.custoEquipamentos,
                custoBurocracia: dadosCliente.custoBurocracia,
                estoqueInicial: dadosCliente.estoqueInicial,
                
                // Estrutura Mensal (Opex - Custos Fixos)
                custoAluguel: dadosCliente.custoAluguel,
                custoEquipe: dadosCliente.custoEquipe,
                despesasBasicas: dadosCliente.despesasBasicas,
                proLabore: dadosCliente.proLabore,
                
                // Produto e Mercado
                produtoPrincipal: dadosCliente.produtoPrincipal,
                precoVenda: dadosCliente.precoVenda,
                custoVariavel: dadosCliente.custoVariavel,
                vendasPorDia: dadosCliente.vendasPorDia,
                
                // Resultado gerado pela matemática do sistema
                resultadoSistema: dadosCliente.resultadoStatus,
                pontoEquilibrioDiario: dadosCliente.pontoEquilibrioDiario,
                
                // Timestamp oficial do servidor
                dataRegistro: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log("✅ Dados completos salvos no Firebase com sucesso!");
        } catch (dbError) {
            console.error("Erro ao salvar no Firebase:", dbError);
            // O sistema continua mesmo se o banco falhar, para não travar a experiência do usuário
        }

        // CHAMANDO A INTELIGÊNCIA ARTIFICIAL
        console.log("Chamando a IA do ChatGPT...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", 
            messages: [
                { 
                    role: "system", 
                    content: "Você é um Consultor Financeiro Sênior e Implacável do 'Adm de Bolso'. Responda formatando em HTML básico (use <b>, <br>, <ul>)." 
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.7 
        });

        const textoIA = response.choices[0].message.content;
        console.log("✅ ChatGPT respondeu com sucesso!");
        
        // Devolve o texto da IA para a tela do cliente
        res.json({ relatorio: textoIA });

    } catch (erro) {
        console.error("Erro no servidor:", erro);
        res.status(500).json({ erro: "Falha interna no servidor ao gerar a consultoria." });
    }
});

// ==========================================
// INICIALIZANDO O SERVIDOR NA PORTA 3000
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Adm de Bolso no ar! Acesse: http://localhost:${PORT}`);
});