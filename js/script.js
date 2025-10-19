// ====== Conexão com Firebase ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBZB68JbSVn2coGzy-XG_RHsGlJdDFFQj8",
  authDomain: "claudio-style.firebaseapp.com",
  projectId: "claudio-style",
  storageBucket: "claudio-style.appspot.com",
  messagingSenderId: "713101598297",
  appId: "1:713101598297:web:9ef89f5c974e178c30db48"
};

// Inicializa Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====================================================
// 🔹 Funções Firebase
// ====================================================
async function salvarAgendamento(agendamento) {
  try {
    const docRef = await addDoc(collection(db, "agendamentos"), agendamento);
    console.log("✅ Agendamento salvo no Firestore!", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("❌ Erro ao salvar agendamento:", e);
  }
}

async function carregarAgendamentos() {
  try {
    const snapshot = await getDocs(collection(db, "agendamentos"));
    const lista = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => a.nome && a.data && a.servico);
    console.log("📦 Agendamentos carregados:", lista);
    return lista;
  } catch (e) {
    console.error("❌ Erro ao carregar agendamentos:", e);
    return [];
  }
}

async function confirmarAgendamentoFirestore(id) {
  await updateDoc(doc(db, "agendamentos", id), { confirmado: true });
}

async function excluirAgendamentoFirestore(id) {
  if (!id) return;
  try {
    await deleteDoc(doc(db, "agendamentos", id));
    console.log(`🗑️ Agendamento ${id} removido do Firestore`);
  } catch (e) {
    console.error("❌ Erro ao excluir do Firestore:", e);
  }
}

// ✅ Registro do Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("✅ Service Worker registrado com sucesso!", reg.scope))
      .catch((err) => console.error("❌ Erro ao registrar Service Worker:", err));
  });
}

// ====================================================
// 🔹 Lógica do Aplicativo
// ====================================================
document.addEventListener("DOMContentLoaded", async () => {
  const PREFIXO = "barbearia_";
  
  // Gera um ID único fixo por dispositivo (para o cliente)
if (!localStorage.getItem("barbearia_clienteId")) {
  const id = "cli_" + Math.random().toString(36).substring(2, 12);
  localStorage.setItem("barbearia_clienteId", id);
}
const clienteId = localStorage.getItem("barbearia_clienteId");

  // ===== Elementos principais =====
  const form = document.getElementById("formCliente");
  const lista = document.getElementById("listaClientes");
  const lixeiraLista = document.getElementById("lixeiraClientes");
  const painelCliente = document.getElementById("painelCliente");
  const painelBarbeiro = document.getElementById("painelBarbeiro");
  const btnCliente = document.getElementById("btnCliente");
  const btnBarbeiro = document.getElementById("btnBarbeiro");
  const btnVerAgendamentosCliente = document.getElementById("btnVerAgendamentosCliente");
  const listaAgendamentosCliente = document.getElementById("listaAgendamentosCliente");
  const btnInstalar = document.getElementById("btnInstalar");

  const areaAgendamentos = document.getElementById("areaAgendamentos");
  const areaLixeira = document.getElementById("areaLixeira");
  const btnVerAgendamentos = document.getElementById("verAgendamentos");
  const btnVerLixeira = document.getElementById("verLixeira");
  
  const abrirModal = document.getElementById("abrirModalAgendamento");
const modalAgendamento = document.getElementById("modalAgendamento");
const fecharModalAgendamento = modalAgendamento?.querySelector(".fechar-modal");
const modalAgendamentos = document.getElementById("modalAgendamentos");
const fecharModalCliente = modalAgendamentos?.querySelector(".fechar-modal");

  // ===== Variáveis globais =====
  let clientes = [];
  let lixeira = [];

  // ===== Funções de armazenamento local =====
  function salvar(chave, valor) {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  }

  function carregar(chave) {
    return JSON.parse(localStorage.getItem(PREFIXO + chave)) || [];
  }

  const SENHA_BARBEIRO = "0000";
  const CHAVE_ACESSO_BARBEIRO = PREFIXO + "acessoBarbeiro";

  // ====================================================
  // 🔹 Sincronização inicial com Firebase
  // ====================================================
  try {
    clientes = await carregarAgendamentos();
    salvar("clientes", clientes);
    atualizarListas();
  } catch (error) {
    console.error("⚠️ Falha ao carregar agendamentos do Firebase:", error);
    clientes = carregar("clientes");
    atualizarListas();
  }

  // ====================================================
  // 🔹 Alternar Painel
  // ====================================================
  btnCliente.addEventListener("click", () => {
    painelCliente.classList.add("ativo");
    painelBarbeiro.classList.remove("ativo");
    btnCliente.classList.add("ativo");
    btnBarbeiro.classList.remove("ativo");
  });

  btnBarbeiro.addEventListener("click", () => {
    const acessoSalvo = JSON.parse(localStorage.getItem(CHAVE_ACESSO_BARBEIRO));
    if (acessoSalvo && acessoSalvo.acesso && acessoSalvo.senha === SENHA_BARBEIRO) {
      mostrarPainelBarbeiro();
      return;
    }

    const senha = prompt("Digite a senha do barbeiro:");
    if (senha === SENHA_BARBEIRO) {
      localStorage.setItem(CHAVE_ACESSO_BARBEIRO, JSON.stringify({ acesso: true, senha }));
      mostrarPainelBarbeiro();
    } else if (senha !== null) {
      alert("⚠️ Senha incorreta! Acesso negado.");
    }
  });

  function mostrarPainelBarbeiro() {
    painelBarbeiro.classList.add("ativo");
    painelCliente.classList.remove("ativo");
    btnBarbeiro.classList.add("ativo");
    btnCliente.classList.remove("ativo");
  }

  // ====================================================
  // 🔹 Atualizar Listas
  // ====================================================
  function atualizarListas() {
    lista.innerHTML = "";
    lixeiraLista.innerHTML = "";

    // Lista de agendamentos (barbeiro)
    clientes.forEach((c, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${c.nome}</strong><br>
          ${new Date(c.data).toLocaleString()}<br>
          <strong>${c.servico}</strong><br>
          <small>${c.confirmado ? "✅ Confirmado" : "⏳ Aguardando confirmação"}</small>
        </div>
        <div>
          ${!c.confirmado ? `<button class="btnConfirmar" onclick="confirmarAgendamentoLocal(${i})">Confirmar</button>` : ""}
          <button class="btnExcluir" onclick="moverParaLixeira(${i})">Excluir</button>
        </div>
      `;
      lista.appendChild(li);
    });

    // Lixeira
    lixeira.forEach((c, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${c.nome}</strong><br>
          ${new Date(c.data).toLocaleString()} - ${c.servico}
        </div>
        <div>
          <button onclick="restaurarCliente(${i})" class="btnRestaurar">Restaurar</button>
          <button onclick="excluirDefinitivo(${i})" class="btnExcluir">Excluir</button>
        </div>
      `;
      lixeiraLista.appendChild(li);
    });

    // Lista do cliente
if (listaAgendamentosCliente) {
  listaAgendamentosCliente.innerHTML = "";
  clientes.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong class="nome-cliente">${c.nome}</strong><br>
        ${new Date(c.data).toLocaleString()}<br>
        <strong class="servicos-cliente">${c.servico}</strong><br>
        <small>${c.confirmado ? "✅ Confirmado pelo barbeiro" : "⏳ Aguardando confirmação"}</small>
      </div>
      <button class="btnExcluir" onclick="cancelarAgendamento(${i})">Cancelar</button>
    `;
    listaAgendamentosCliente.appendChild(li);
  });
}
  }

  // ====================================================
  // 🔹 Funções principais
  // ====================================================
  window.confirmarAgendamentoLocal = async (i) => {
    clientes[i].confirmado = true;
    salvar("clientes", clientes);
    await confirmarAgendamentoFirestore(clientes[i].id);
    alert(`✅ Agendamento de ${clientes[i].nome} confirmado!`);
    atualizarListas();
  };

  window.moverParaLixeira = async (i) => {
  const removido = clientes[i];
  if (!removido) return;

  try {
    // 🔹 Primeiro envia o agendamento para a lixeira local
    lixeira.push(removido);

    // 🔹 Remove da lista principal
    clientes.splice(i, 1);

    // 🔹 Atualiza localStorage
    salvar("clientes", clientes);
    salvar("lixeira", lixeira);

    // 🔥 Remove do Firestore (após salvar localmente)
    if (removido.id) {
      await excluirAgendamentoFirestore(removido.id);
      console.log(`🗑️ Agendamento de ${removido.nome} movido para a lixeira e removido do Firestore.`);
    }

    atualizarListas();
  } catch (e) {
    console.error("❌ Erro ao mover para a lixeira:", e);
    alert("Erro ao mover o agendamento para a lixeira. Tente novamente.");
  }
};

  window.restaurarCliente = async (i) => {
    const restaurado = lixeira.splice(i, 1)[0];
    if (!restaurado) return;

    try {
      const novoDoc = await addDoc(collection(db, "agendamentos"), {
        nome: restaurado.nome,
        data: restaurado.data,
        servico: restaurado.servico,
        confirmado: restaurado.confirmado || false
      });

      restaurado.id = novoDoc.id;
      clientes.push(restaurado);
      salvar("clientes", clientes);
      salvar("lixeira", lixeira);
      atualizarListas();

      console.log(`✅ Cliente restaurado no Firestore (ID: ${novoDoc.id})`);
    } catch (e) {
      console.error("❌ Erro ao restaurar agendamento:", e);
      alert("Erro ao restaurar o agendamento.");
    }
  };

  window.excluirDefinitivo = (i) => {
    if (confirm("Excluir definitivamente este cliente?")) {
      lixeira.splice(i, 1);
      salvar("lixeira", lixeira);
      atualizarListas();
    }
  };

  window.cancelarAgendamento = async (i) => {
    if (confirm("Deseja cancelar este agendamento?")) {
      const cancelado = clientes.splice(i, 1)[0];
      if (cancelado.id) await excluirAgendamentoFirestore(cancelado.id);
      salvar("clientes", clientes);
      alert("🚫 Agendamento cancelado com sucesso.");
      atualizarListas();
    }
  };

  // ====================================================
  // 🔹 Alternância entre Agendamentos e Lixeira
  // ====================================================
  if (btnVerAgendamentos && btnVerLixeira) {
    let mostrandoLixeira = false;
    btnVerLixeira.addEventListener("click", () => {
      mostrandoLixeira = !mostrandoLixeira;
      areaAgendamentos.classList.toggle("oculto", mostrandoLixeira);
      areaLixeira.classList.toggle("oculto", !mostrandoLixeira);
      btnVerLixeira.textContent = mostrandoLixeira ? "Fechar Lixeira" : "Abrir Lixeira";
    });
  }

// ====================================================
// 🔹 Status da Barbearia
// ====================================================
function barbeariaAberta() {
  const hora = new Date().getHours();
  return hora >= 9 && hora < 17;
}

function gerarMensagemStatus() {
  const hora = new Date().getHours();
  const dia = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const saudacao =
  hora < 12 ? "<span class='saudacao cor-manha'>☀️ Bom dia!</span>" :
  hora < 18 ? "<span class='saudacao cor-tarde'>🌤️ Boa tarde!</span>" :
  "<span class='saudacao cor-noite'>🌙 Boa noite!</span>";

  if (barbeariaAberta()) {
    return `
      <div class="msg-aberto">
        ${saudacao}<br>
        💈 <strong>Estamos aberto, ${dia} é dia de ficar no estilo!</strong><br>
        <small>Atendimento das <b>09:00</b> às <b>17:00</b>. Venha garantir seu visual!</small>
      </div>
    `;
  } else if (hora < 9) {
    return `
      <div class="msg-fechado">
        ${saudacao}<br>
         <strong>Ainda estamos nos preparando!</strong><br>
        <small>Voltamos com tudo às <b>09:00</b>. Reserve seu horário agora e seja o primeiro do dia!</small>
      </div>
    `;
  } else {
    return `
      <div class="msg-fechado">
        ${saudacao}<br>
        🌙 <strong>Fechamos por hoje, mas o estilo não descansa!</strong><br>
        <small>Funcionamos das <b>09:00</b> às <b>17:00</b>. Agende e garanta seu corte amanhã.</small>
      </div>
    `;
  }
}

function atualizarStatusBarbearia() {
  const statusEl = document.getElementById("statusBarbearia");
  if (!statusEl) return;

  statusEl.innerHTML = gerarMensagemStatus();
  statusEl.className = barbeariaAberta() ? "status aberto" : "status fechado";
}

// 🔁 Atualiza ao carregar e a cada 1 minuto
atualizarStatusBarbearia();
setInterval(atualizarStatusBarbearia, 60000);

  // ====================================================
  // 🔹 Agendar
  // ====================================================
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeCliente").value.trim();
  const data = document.getElementById("dataAgendamento").value;
  const hora = document.getElementById("horaAgendamento").value;
  const servico = document.getElementById("servico").value;
  const dataHora = `${data}T${hora}`;

  // 🚫 Validação
  if (!nome || !data || !hora || !servico) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  const horaSelecionada = new Date(dataHora).getHours();
  if (horaSelecionada < 9 || horaSelecionada >= 17) {
    alert("Os agendamentos só podem ser feitos entre 09:00 e 17:00.");
    return;
  }

  const ocupado = clientes.some(c => c.data === dataHora);
  if (ocupado) {
    alert("⚠️ Já existe um agendamento nesse horário.");
    return;
  }

  try {
    const novoAgendamento = {
  nome,
  data: dataHora,
  servico,
  confirmado: false,
  clienteId: clienteId // 🔥 Identifica de qual cliente/dispositivo veio o agendamento
};

    // 🔥 Salva no Firestore e obtém o ID
    const id = await salvarAgendamento(novoAgendamento);
    novoAgendamento.id = id;

    // 🔹 Atualiza localmente
clientes.push(novoAgendamento);
salvar("clientes", clientes);

// 🔹 Salva o nome do cliente para futuras consultas
localStorage.setItem("barbearia_nomeCliente", nome);

atualizarListas();
form.reset();

    // 🔹 Fecha o modal automaticamente após o envio
    const modalAgendamento = document.getElementById("modalAgendamento");
    if (modalAgendamento) {
      modalAgendamento.style.opacity = "1";
      modalAgendamento.style.transition = "opacity 0.4s ease";
      modalAgendamento.style.opacity = "0";
      setTimeout(() => {
        modalAgendamento.style.display = "none";
        modalAgendamento.style.opacity = "1"; // reseta para o próximo uso
      }, 400);
    }

    // 🎉 Mostra o popup de confirmação
    const popup = document.getElementById("confirmacaoAgendamento");
    const nomeEl = document.getElementById("nomeConfirmado");
    nomeEl.textContent = nome;
    popup.classList.remove("oculto");
    popup.style.display = "block";

    setTimeout(() => {
      popup.classList.add("oculto");
      popup.style.display = "none";
    }, 7000);

  } catch (error) {
    console.error("❌ Erro ao salvar agendamento:", error);
    alert("Erro ao salvar o agendamento. Tente novamente.");
  }
});

// 🔹 Abrir modal de novo agendamento
abrirModal?.addEventListener("click", () => modalAgendamento.style.display = "flex");

// 🔹 Fechar modal de agendamento
fecharModalAgendamento?.addEventListener("click", () => modalAgendamento.style.display = "none");

// 🔹 Quando o cliente clicar em "Ver Meus Agendamentos"
btnVerAgendamentosCliente?.addEventListener("click", async () => {
  const clienteId = localStorage.getItem("barbearia_clienteId");

  if (!clienteId) {
    alert("⚠️ Não foi possível identificar seu usuário. Tente refazer seu primeiro agendamento.");
    return;
  }

  try {
    const todosAgendamentos = await carregarAgendamentos();

    // 🔍 Filtra todos os agendamentos criados neste mesmo dispositivo
    const meusAgendamentos = todosAgendamentos.filter(
      (a) => a.clienteId === clienteId
    );

    listaAgendamentosCliente.innerHTML = "";

    if (meusAgendamentos.length === 0) {
      listaAgendamentosCliente.innerHTML = `
        <p class="sem-agendamento">📅 Você ainda não tem nenhum agendamento.</p>
        <p class="sem-agendamento2">Agende agora e garanta seu horário!</p>
      `;
    } else {
      // 🗓️ Ordena do mais recente para o mais antigo
      meusAgendamentos.sort((a, b) => new Date(b.data) - new Date(a.data));

      // 🧾 Monta a lista dos agendamentos do cliente
      meusAgendamentos.forEach((a) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <strong class="nome-cliente">${a.nome}</strong><br>
            <span class="data-agendamento">${new Date(a.data).toLocaleString()}</span><br>
            <strong class="servicos-cliente">${a.servico}</strong><br>
            <small class="status-agendamento ${a.confirmado ? "confirmado" : "pendente"}">
              ${a.confirmado ? "✅ Confirmado pelo barbeiro" : "⏳ Aguardando confirmação"}
            </small>
          </div>
          <button class="btnExcluir" onclick="cancelarAgendamentoCliente('${a.id}')">Cancelar</button>
        `;
        listaAgendamentosCliente.appendChild(li);
      });
    }

    // 🔹 Exibe o modal com a lista pronta
    modalAgendamentos.style.display = "flex";
  } catch (error) {
    console.error("❌ Erro ao carregar agendamentos:", error);
    alert("Erro ao carregar seus agendamentos. Tente novamente.");
  }
});

// 🔹 Fecha o modal de “Meus Agendamentos”
fecharModalCliente?.addEventListener("click", () => {
  modalAgendamentos.style.display = "none";
});

// 🔹 Cancela o agendamento do cliente (e remove do Firestore)
window.cancelarAgendamentoCliente = async (id) => {
  if (confirm("Deseja cancelar este agendamento?")) {
    try {
      await excluirAgendamentoFirestore(id); // 🔥 Remove do Firebase
      clientes = clientes.filter(a => a.id !== id); // Remove localmente
      salvar("clientes", clientes);
      atualizarListas();
      alert("🚫 Agendamento cancelado com sucesso!");
      modalAgendamentos.style.display = "none";
    } catch (e) {
      console.error("❌ Erro ao cancelar agendamento:", e);
      alert("Erro ao cancelar o agendamento. Tente novamente.");
    }
  }
};

// 🔹 Fecha modais ao clicar fora
window.addEventListener("click", (e) => {
  if (e.target === modalAgendamento) modalAgendamento.style.display = "none";
  if (e.target === modalAgendamentos) modalAgendamentos.style.display = "none";
});


// ===============================
 // 📱 Instalação do Aplicativo PWA
// ===============================

let eventoInstalacao = null;

// Quando o evento 'beforeinstallprompt' for disparado
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // Impede o prompt automático
  eventoInstalacao = e;
  console.log("📲 Evento de instalação detectado!");
  btnInstalar.style.display = "inline-flex"; // Mostra o botão
});

// Quando o usuário clicar no botão de instalar
btnInstalar.addEventListener("click", async () => {
  if (!eventoInstalacao) {
    alert("⚠️ Instalação não disponível neste momento.");
    return;
  }

  btnInstalar.textContent = "Instalando...";
  eventoInstalacao.prompt(); // Mostra o prompt oficial
  const escolha = await eventoInstalacao.userChoice;

  if (escolha.outcome === "accepted") {
    console.log("✅ Usuário aceitou instalar o app");
    btnInstalar.textContent = "Aplicativo Instalado!";
  } else {
    console.log("❌ Usuário cancelou a instalação");
    btnInstalar.textContent = "Instalar Aplicativo";
  }

  eventoInstalacao = null;
  setTimeout(() => (btnInstalar.style.display = "none"), 2000);
});

// Ocultar botão após instalação concluída
window.addEventListener("appinstalled", () => {
  console.log("🎉 Aplicativo PWA instalado!");
  btnInstalar.style.display = "none";
    });
});