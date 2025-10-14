document.addEventListener("DOMContentLoaded", () => {
  const PREFIXO = "barbearia_"; // 🔹 Prefixo exclusivo deste app

  const form = document.getElementById("formCliente");
  const lista = document.getElementById("listaClientes");
  const lixeiraLista = document.getElementById("lixeiraClientes");
  const btnInstalar = document.getElementById("btnInstalar");
  const painelCliente = document.getElementById("painelCliente");
  const painelBarbeiro = document.getElementById("painelBarbeiro");
  const btnCliente = document.getElementById("btnCliente");
  const btnBarbeiro = document.getElementById("btnBarbeiro");

  const cardAgendamentos = document.getElementById("areaAgendamentos");
  const cardLixeira = document.getElementById("areaLixeira");
  const cardGaleria = document.getElementById("areaGaleria");
  const btnVerAgendamentos = document.getElementById("verAgendamentos");
  const btnVerLixeira = document.getElementById("verLixeira");
  const inputFoto = document.getElementById("inputFoto");
  const btnAdicionarFoto = document.getElementById("btnAdicionarFoto");
  const galeriaBarbeiro = document.getElementById("galeriaBarbeiro");
  const galeriaCliente = document.getElementById("galeriaCliente");

  const btnVerAgendamentosCliente = document.getElementById("btnVerAgendamentosCliente");
  const areaAgendamentosCliente = document.getElementById("areaAgendamentosCliente");
  const listaAgendamentosCliente = document.getElementById("listaAgendamentosCliente");
  const btnVoltarAgendar = document.getElementById("btnVoltarAgendar");
  

  // 🔹 Funções utilitárias para o localStorage com prefixo
  function salvar(chave, valor) {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  }

  function carregar(chave) {
    return JSON.parse(localStorage.getItem(PREFIXO + chave)) || [];
  }

  let clientes = carregar("clientes");
let lixeira = carregar("lixeira");
let fotosGaleria = carregar("fotosGaleria");

const SENHA_BARBEIRO = "0000";
const CHAVE_ACESSO_BARBEIRO = PREFIXO + "acessoBarbeiro";

// Alternar para painel do cliente
btnCliente.addEventListener("click", () => {
  painelCliente.classList.add("ativo");
  painelBarbeiro.classList.remove("ativo");
  btnCliente.classList.add("ativo");
  btnBarbeiro.classList.remove("ativo");
});

// Alternar para painel do barbeiro com verificação da senha
btnBarbeiro.addEventListener("click", () => {
  // 🔹 Recupera o acesso salvo (objeto com { acesso: true, senha })
  const acessoSalvo = JSON.parse(localStorage.getItem(CHAVE_ACESSO_BARBEIRO));

  // 🔹 Se o acesso é válido e a senha atual coincide, entra direto
  if (acessoSalvo && acessoSalvo.acesso === true && acessoSalvo.senha === SENHA_BARBEIRO) {
    mostrarPainelBarbeiro();
    return;
  }

  // 🔹 Caso contrário, pede a senha novamente
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

  // ======== Atualizar listas ========
  const atualizarListas = () => {
    lista.innerHTML = "";
    lixeiraLista.innerHTML = "";

    // 🔹 Agendamentos do barbeiro
    clientes.forEach((c, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${c.nome}</strong><br>
          ${new Date(c.data).toLocaleString()}<br>
   <strong class="servicos">${c.servico}</strong><br>
<small>Status: ${c.confirmado ? "✅ Confirmado" : "⏳ Aguardando confirmação"}</small>
        </div>
        <div>
          ${!c.confirmado ? `<button class="btnConfirmar" onclick="confirmarAgendamento(${i})">✅ Confirmar</button>` : ""}
          <button class="btnExcluir" onclick="moverParaLixeira(${i})">Excluir</button>
        </div>
      `;
      lista.appendChild(li);
    });

    // 🔹 Lixeira
    lixeira.forEach((c, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <strong>${c.nome}</strong><br>
          ${new Date(c.data).toLocaleString()} - ${c.servico}
        </div>
        <div class="acoesLixeira">
          <button onclick="restaurarCliente(${i})" class="btnRestaurar">Restaurar</button>
          <button onclick="excluirDefinitivo(${i})" class="btnExcluir">Excluir</button>
        </div>
      `;
      lixeiraLista.appendChild(li);
    });

    // 🔹 Atualiza lista do cliente
    if (listaAgendamentosCliente) {
      listaAgendamentosCliente.innerHTML = "";
      clientes.forEach((c, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <strong>${c.nome}</strong><br>
            ${new Date(c.data).toLocaleString()}<br>
            <strong class="servicos">${c.servico}</strong><br>
            <small>Status: ${c.confirmado ? "✅ Confirmado pelo barbeiro" : "⏳ Aguardando confirmação"}</small>
          </div>
          <button class="btnExcluir" onclick="cancelarAgendamento(${i})">Cancelar</button>
        `;
        listaAgendamentosCliente.appendChild(li);
      });
    }
  };

  // ===== Verificar se a barbearia está aberta =====
  function barbeariaAberta() {
    const agora = new Date();
    const hora = agora.getHours();
    return hora >= 9 && hora < 17; // Aberta das 9h às 17h
  }

  function atualizarStatusBarbearia() {
  const statusEl = document.getElementById("statusBarbearia");
  if (!statusEl) return;

  const agora = new Date();
  const hora = agora.getHours();

  if (barbeariaAberta()) {
    statusEl.innerHTML = `
      <span class="emoji">💈</span> 
      <strong>Estamos aberto agora!</strong><br>
      <small>Atendendo com estilo até as <b>17:00</b> — garanta já o seu horário ✂️</small>
    `;
    statusEl.className = "status aberto";
  } else if (hora < 9) {
    statusEl.innerHTML = `
      <span class="emoji">☀️</span> 
      <strong>Ainda não abrimos</strong><br>
      <small>Voltamos às <b>09:00</b> — aproveite e agende antecipadamente 😉</small>
    `;
    statusEl.className = "status fechado";
  } else {
    statusEl.innerHTML = `
      <span class="emoji">🌙</span> 
      <strong Class="titulomsgfechado">Encerramos por hoje</strong><br>
      <small>Funcionamos das <b class="hora-fechado">09:00 às 17:00</b>. Reserve seu horário para amanhã 💇‍♂️</small>
    `;
    statusEl.className = "status fechado";
  }
}

  atualizarStatusBarbearia();
  setInterval(atualizarStatusBarbearia, 60000);

  // ======== Agendar ========
form.addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nomeCliente").value.trim();
  const data = document.getElementById("dataAgendamento").value;
  const hora = document.getElementById("horaAgendamento").value;
  const dataHora = `${data}T${hora}`;
  const servico = document.getElementById("servico").value;

  if (!nome || !data || !hora || !servico) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  const dataSelecionada = new Date(dataHora);
  const horaSelecionada = dataSelecionada.getHours();
  const agora = new Date();

  // 🕒 Verifica se o horário está dentro do expediente
  if (horaSelecionada < 9 || horaSelecionada >= 17) {
    alert("💈 Os agendamentos são realizados apenas entre 09:00 e 17:00. Mas não se preocupe — você pode reservar um horário para amanhã nesse período! 😉");
    return;
  }

  // 🔹 Se for o mesmo dia, verifica se a barbearia ainda está aberta
  const mesmoDia = dataSelecionada.toDateString() === agora.toDateString();
  if (mesmoDia && (agora.getHours() < 9 || agora.getHours() >= 17)) {
    alert("O estabelecimento está fechado agora. Você pode agendar para outro dia dentro do horário de funcionamento. 💈");
    return;
  }

  // 🛑 Evita agendamentos duplicados no mesmo horário
  const horarioOcupado = clientes.some(c => c.data === dataHora);
  if (horarioOcupado) {
    alert("⚠️ Já existe um agendamento neste horário. Por favor, escolha outro horário disponível.");
    return;
  }

  // ✅ Caso esteja tudo certo, salva o agendamento
  clientes.push({ nome, data: dataHora, servico, confirmado: false });
  salvar("clientes", clientes);
  form.reset();
  atualizarListas();

  // 🎉 Mostra popup de confirmação
  const popup = document.getElementById("confirmacaoAgendamento");
  const nomeEl = document.getElementById("nomeConfirmado");
  nomeEl.textContent = nome;

  popup.classList.remove("oculto");
  popup.style.display = "block";

  // Fecha automaticamente depois de alguns segundos
  setTimeout(() => {
    popup.classList.add("oculto");
    popup.style.display = "none";
  }, 6000);
});

  // ======== Funções principais ========
  window.confirmarAgendamento = (i) => {
    clientes[i].confirmado = true;
    salvar("clientes", clientes);
    alert(`✅ Agendamento de ${clientes[i].nome} confirmado com sucesso!`);
    atualizarListas();
  };

  window.moverParaLixeira = (i) => {
    const removido = clientes.splice(i, 1)[0];
    lixeira.push(removido);
    salvar("clientes", clientes);
    salvar("lixeira", lixeira);
    atualizarListas();
  };

  window.restaurarCliente = (i) => {
    const restaurado = lixeira.splice(i, 1)[0];
    clientes.push(restaurado);
    salvar("clientes", clientes);
    salvar("lixeira", lixeira);
    atualizarListas();
  };

  window.excluirDefinitivo = (i) => {
    if (confirm("Excluir definitivamente este cliente?")) {
      lixeira.splice(i, 1);
      salvar("lixeira", lixeira);
      atualizarListas();
    }
  };

  window.cancelarAgendamento = (i) => {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
      clientes.splice(i, 1);
      salvar("clientes", clientes);
      alert("Agendamento cancelado com sucesso.");
      atualizarListas();
    }
  };

  atualizarListas();

  // ======== Alternar entre Agendamentos / Lixeira / Galeria ========
  let mostrandoLixeira = false;

  btnVerAgendamentos.addEventListener("click", () => {
    cardAgendamentos.classList.remove("oculto");
    cardLixeira.classList.add("oculto");
    cardGaleria.classList.add("oculto");
    mostrandoLixeira = false;
    btnVerAgendamentos.classList.add("ativo");
    btnVerLixeira.classList.remove("ativo");
    btnVerLixeira.textContent = "Abrir Lixeira";
  });

  btnVerLixeira.addEventListener("click", () => {
    mostrandoLixeira = !mostrandoLixeira;
    if (mostrandoLixeira) {
      cardLixeira.classList.remove("oculto");
      cardAgendamentos.classList.add("oculto");
      btnVerLixeira.textContent = "Fechar Lixeira";
    } else {
      cardLixeira.classList.add("oculto");
      cardAgendamentos.classList.remove("oculto");
      btnVerLixeira.textContent = "Abrir Lixeira";
    }
  });

  // ======== CLIENTE: Ver agendamentos ========
  const modalAgendamentos = document.getElementById("modalAgendamentos");
  const fecharModal = modalAgendamentos?.querySelector(".fechar-modal");

  if (btnVerAgendamentosCliente) {
    btnVerAgendamentosCliente.addEventListener("click", () => {
      atualizarListas();
      modalAgendamentos.style.display = "flex";
    });
  }

  if (fecharModal) {
    fecharModal.addEventListener("click", () => {
      modalAgendamentos.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modalAgendamentos) {
      modalAgendamentos.style.display = "none";
    }
  });

  // ======== Instalação PWA ========
  let promptEvento;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    promptEvento = e;
    btnInstalar.style.display = "block";
  });

  btnInstalar.addEventListener("click", async () => {
    btnInstalar.style.display = "none";
    if (promptEvento) {
      promptEvento.prompt();
      const resultado = await promptEvento.userChoice;
      if (resultado.outcome === "accepted") console.log("App instalado!");
      promptEvento = null;
    }
  });
});

// ===== Modal de Agendamento =====
const abrirModal = document.getElementById("abrirModalAgendamento");
const modal = document.getElementById("modalAgendamento");
const fecharModal = document.querySelector(".fechar-modal");

abrirModal.addEventListener("click", () => {
  modal.style.display = "flex";
});

fecharModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fecha o modal ao clicar fora dele
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});