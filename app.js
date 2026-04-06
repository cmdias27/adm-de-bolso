// --- IMPORTAÇÕES ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ======================================================
// ⚠️ COLE SUA CONFIGURAÇÃO ABAIXO (MUITO IMPORTANTE) ⚠️
// ======================================================
const firebaseConfig = {
    // COLE SUA CONFIGURAÇÃO AQUI (A mesma de antes)
  apiKey: "AIzaSyBmTsYieNFi3ks5Ja6pR86w0oSm3iW6XH0",
  authDomain: "consultor-de-bolso.firebaseapp.com",
  projectId: "consultor-de-bolso",
  storageBucket: "consultor-de-bolso.firebasestorage.app",
  messagingSenderId: "494089442386",
  appId: "1:494089442386:web:3513e050334605e88e7b8b"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let usuarioAtual = null;
let unsubscribeHistorico = null; // Para Produto 2
let unsubscribeCaixa = null;     // Para Produto 3

// ==========================================
// 1. NAVEGAÇÃO ENTRE PRODUTOS
// ==========================================
const menuFaxina = document.getElementById('menuFaxina');
const menuPreco = document.getElementById('menuPreco');
const menuCaixa = document.getElementById('menuCaixa');

const secaoFaxina = document.getElementById('secaoFaxina');
const secaoPreco = document.getElementById('secaoPreco');
const secaoCaixa = document.getElementById('secaoCaixa');

function resetMenu() {
    // Tira a cor de ativo de todos
    menuFaxina.className = 'list-group-item list-group-item-action cursor-pointer py-3';
    menuPreco.className = 'list-group-item list-group-item-action cursor-pointer py-3';
    menuCaixa.className = 'list-group-item list-group-item-action cursor-pointer py-3';
    
    // Esconde todas as seções
    secaoFaxina.classList.add('d-none');
    secaoPreco.classList.add('d-none');
    secaoCaixa.classList.add('d-none');
}

// Botão Faxina
menuFaxina.addEventListener('click', () => {
    resetMenu();
    menuFaxina.classList.add('active', 'bg-warning', 'text-dark', 'border-0');
    secaoFaxina.classList.remove('d-none');
});

// Botão Preço
menuPreco.addEventListener('click', () => {
    resetMenu();
    menuPreco.classList.add('active', 'bg-success', 'border-0');
    secaoPreco.classList.remove('d-none');
});

// Botão Caixa
menuCaixa.addEventListener('click', () => {
    resetMenu();
    menuCaixa.classList.add('active', 'bg-primary', 'border-0');
    secaoCaixa.classList.remove('d-none');
});


// ==========================================
// 2. PRODUTO 1: FAXINA FINANCEIRA (Lógica)
// ==========================================
document.getElementById('btnCalcularFaxina').addEventListener('click', () => {
    // 1. Pega o Pró-labore
    let total = parseFloat(document.getElementById('inputProlabore').value) || 0;

    // 2. Pega todos os inputs da classe 'custo-empresa' e soma
    const inputsCustos = document.querySelectorAll('.custo-empresa');
    inputsCustos.forEach(input => {
        total += parseFloat(input.value) || 0;
    });

    // 3. Mostra resultado formatado
    document.getElementById('valorExistencia').innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('resultadoFaxina').classList.remove('d-none');
});


// ==========================================
// 3. PRODUTO 2: PRECIFICAÇÃO (Lógica)
// ==========================================
document.getElementById('btnCalcular').addEventListener('click', () => {
    const custo = parseFloat(document.getElementById('custoProduto').value);
    const taxas = parseFloat(document.getElementById('taxas').value);
    const margem = parseFloat(document.getElementById('margemDesejada').value);

    if (isNaN(custo) || isNaN(taxas) || isNaN(margem)) { alert("Preencha todos os campos!"); return; }

    const divisor = 1 - ((taxas + margem) / 100);
    if (divisor <= 0) { alert("Margem muito alta (soma > 100%)."); return; }

    const precoVenda = custo / divisor;
    const lucro = precoVenda * (margem / 100);

    document.getElementById('precoFinal').innerText = precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('valorLucro').innerText = lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    document.getElementById('resultadoArea').classList.remove('d-none');
    document.getElementById('resultadoArea').classList.add('d-flex');
    if(usuarioAtual) document.getElementById('btnSalvar').classList.remove('d-none');
});

// Salvar Preço
document.getElementById('btnSalvar').addEventListener('click', async () => {
    if (!usuarioAtual) return;
    const btn = document.getElementById('btnSalvar');
    btn.innerText = "Salvando...";
    try {
        await addDoc(collection(db, "historico_precos"), {
            uid: usuarioAtual.uid,
            preco: document.getElementById('precoFinal').innerText,
            lucro: document.getElementById('valorLucro').innerText,
            data: new Date()
        });
        btn.innerText = "Salvo!";
        setTimeout(() => { btn.innerText = "Salvar"; }, 2000);
    } catch (e) { console.error(e); }
});

function carregarHistoricoPreco(user) {
    const lista = document.getElementById('listaHistorico');
    // Query simples sem orderBy para evitar erro de index no início
    const q = query(collection(db, "historico_precos"), where("uid", "==", user.uid));
    
    unsubscribeHistorico = onSnapshot(q, (snapshot) => {
        lista.innerHTML = "";
        if (snapshot.empty) { lista.innerHTML = '<li class="list-group-item text-center p-3 small text-muted">Nada salvo.</li>'; return; }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            lista.innerHTML += `<li class="list-group-item d-flex justify-content-between">
                <span class="fw-bold text-success">${data.preco}</span>
                <span class="small text-muted">Lucro: ${data.lucro}</span>
            </li>`;
        });
    });
}


// ==========================================
// 4. PRODUTO 3: FLUXO DE CAIXA (Lógica Nova!)
// ==========================================

// Adicionar Lançamento (Entrada ou Saída)
document.getElementById('formCaixa').addEventListener('submit', async (e) => {
    e.preventDefault(); // Não deixa recarregar a página
    if (!usuarioAtual) { alert("Faça login primeiro!"); return; }

    const tipo = document.getElementById('caixaTipo').value;
    const desc = document.getElementById('caixaDescricao').value;
    const valor = parseFloat(document.getElementById('caixaValor').value);

    try {
        await addDoc(collection(db, "fluxo_caixa"), {
            uid: usuarioAtual.uid,
            tipo: tipo,
            descricao: desc,
            valor: valor,
            data: new Date() // Data de hoje
        });
        // Limpa o formulário
        document.getElementById('caixaDescricao').value = "";
        document.getElementById('caixaValor').value = "";
    } catch (error) {
        console.error("Erro ao lançar:", error);
        alert("Erro ao salvar lançamento.");
    }
});

// Função para Carregar Extrato e Calcular Saldo
function carregarFluxoCaixa(user) {
    const tabela = document.getElementById('tabelaCaixa');
    const q = query(collection(db, "fluxo_caixa"), where("uid", "==", user.uid));

    unsubscribeCaixa = onSnapshot(q, (snapshot) => {
        tabela.innerHTML = "";
        
        let totalEntrada = 0;
        let totalSaida = 0;

        if (snapshot.empty) {
            tabela.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum lançamento. Comece agora!</td></tr>';
        } else {
            // Convertemos para array para poder ordenar manualmente (evita erro de Index do Firebase)
            let lancamentos = [];
            snapshot.forEach(doc => lancamentos.push({ id: doc.id, ...doc.data() }));
            
            // Ordena por data (mais recente primeiro) via Javascript
            lancamentos.sort((a, b) => b.data - a.data);

            lancamentos.forEach((item) => {
                // Soma totais
                if (item.tipo === 'entrada') totalEntrada += item.valor;
                else totalSaida += item.valor;

                // Renderiza Linha
                const cor = item.tipo === 'entrada' ? 'text-success' : 'text-danger';
                const sinal = item.tipo === 'entrada' ? '+' : '-';
                const icone = item.tipo === 'entrada' ? 'bi-arrow-up-circle' : 'bi-arrow-down-circle';
                
                // Botão de Excluir usa o ID do documento
                const linha = `
                    <tr>
                        <td class="${cor}"><i class="bi ${icone}"></i> ${item.tipo.toUpperCase()}</td>
                        <td>${item.descricao}</td>
                        <td class="text-end fw-bold ${cor}">
                            ${sinal} ${item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td class="text-center">
                            <button onclick="window.deletarItem('${item.id}')" class="btn btn-sm btn-outline-danger border-0">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                tabela.innerHTML += linha;
            });
        }

        // Atualiza os Cards do Dashboard
        const saldo = totalEntrada - totalSaida;
        document.getElementById('dashEntrada').innerText = totalEntrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('dashSaida').innerText = totalSaida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const elSaldo = document.getElementById('dashSaldo');
        elSaldo.innerText = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Muda cor do saldo
        elSaldo.className = "fw-bold " + (saldo >= 0 ? "text-white" : "text-warning");
    });
}

// Função Global para Deletar (precisa ser window.deletar para o HTML enxergar)
window.deletarItem = async (id) => {
    if(confirm("Tem certeza que deseja apagar este lançamento?")) {
        try {
            await deleteDoc(doc(db, "fluxo_caixa", id));
        } catch (e) {
            alert("Erro ao apagar.");
        }
    }
}


// ==========================================
// 5. LOGIN E LOGOUT (Geral)
// ==========================================
const btnLogin = document.getElementById('btnLogin');
if(btnLogin) btnLogin.addEventListener('click', () => signInWithPopup(auth, provider));

const btnLogout = document.getElementById('btnLogout');
if(btnLogout) btnLogout.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    usuarioAtual = user;
    if (user) {
        // Logado
        document.getElementById('btnLogin').classList.add('d-none');
        document.getElementById('userInfo').classList.remove('d-none');
        document.getElementById('userName').innerText = user.displayName;
        
        // Remove avisos de login
        document.getElementById('avisoLoginPreco').classList.add('d-none');
        document.getElementById('avisoLoginCaixa').classList.add('d-none');

        // Carrega dados
        carregarHistoricoPreco(user);
        carregarFluxoCaixa(user);

    } else {
        // Deslogado
        document.getElementById('btnLogin').classList.remove('d-none');
        document.getElementById('userInfo').classList.add('d-none');
        
        // Mostra avisos
        document.getElementById('avisoLoginPreco').classList.remove('d-none');
        document.getElementById('avisoLoginCaixa').classList.remove('d-none');

        // Limpa dados da tela
        if(unsubscribeHistorico) unsubscribeHistorico();
        if(unsubscribeCaixa) unsubscribeCaixa();
        document.getElementById('tabelaCaixa').innerHTML = "";
    }
});