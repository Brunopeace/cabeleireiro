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
  const btnVerGaleria = document.getElementById("verGaleria");

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

  // Alternar para painel do cliente
  btnCliente.addEventListener("click", () => {
    painelCliente.classList.add("ativo");
    painelBarbeiro.classList.remove("ativo");
    btnCliente.classList.add("ativo");
    btnBarbeiro.classList.remove("ativo");
  });

  // Alternar para painel do barbeiro com senha
  btnBarbeiro.addEventListener("click", () => {
    const acessoSalvo = localStorage.getItem(PREFIXO + "acessoBarbeiro");
    if (acessoSalvo === "true") {
      mostrarPainelBarbeiro();
    } else {
      const senha = prompt("Digite a senha do barbeiro:");
      if (senha === SENHA_BARBEIRO) {
        localStorage.setItem(PREFIXO + "acessoBarbeiro", "true");
        mostrarPainelBarbeiro();
      } else if (senha !== null) {
        alert("⚠️ Senha incorreta! Acesso negado.");
      }
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

  // ======== Verificar se a barbearia está aberta ========
  function barbeariaAberta() {
    const agora = new Date();
    const hora = agora.getHours();
    return hora >= 9 && hora < 17; // Aberta das 9h às 17h
  }

  function atualizarStatusBarbearia() {
    const statusEl = document.getElementById("statusBarbearia");
    if (!statusEl) return;

    if (barbeariaAberta()) {
      statusEl.textContent = "🟢 Estamos abertos agora - Agende seu horário!";
      statusEl.className = "status aberto";
    } else {
      statusEl.textContent = "🔴 Estamos fechados agora - Funcionamos das 09:00 às 17:00";
      statusEl.className = "status fechado";
    }
  }

  atualizarStatusBarbearia();
  setInterval(atualizarStatusBarbearia, 60000);

  // ======== Agendar ========
  form.addEventListener("submit", e => {
    e.preventDefault();
    const nome = document.getElementById("nomeCliente").value.trim();
    const data = document.getElementById("dataHorario").value;
    const servico = document.getElementById("servico").value;

    if (!nome || !data || !servico) return alert("Preencha todos os campos!");

    const dataSelecionada = new Date(data);
    const horaSelecionada = dataSelecionada.getHours();
    if (horaSelecionada < 9 || horaSelecionada >= 17) {
      alert("⚠️ Só é possível agendar para o outro dia das 09:00 às 17:00.");
      return;
    }

    const horarioOcupado = clientes.some(c => c.data === data);
    if (horarioOcupado) {
      alert("⚠️ Já existe um agendamento neste horário. Por favor, escolha outro.");
      return;
    }

    clientes.push({ nome, data, servico, confirmado: false });
    salvar("clientes", clientes);
    form.reset();
    alert("✅ Agendamento realizado com sucesso!");
    atualizarListas();
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
      alert("❌ Agendamento cancelado com sucesso.");
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
    btnVerGaleria.classList.remove("ativo");
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

  btnVerGaleria.addEventListener("click", () => {
    cardGaleria.classList.remove("oculto");
    cardAgendamentos.classList.add("oculto");
    cardLixeira.classList.add("oculto");
  });

  // ======== GALERIA ========
  const atualizarGaleria = () => {
    galeriaBarbeiro.innerHTML = "";
    galeriaCliente.innerHTML = "";
    fotosGaleria.forEach((foto, index) => {
      const imgBarbeiro = document.createElement("img");
      imgBarbeiro.src = foto;
      imgBarbeiro.title = "Clique para remover";
      imgBarbeiro.addEventListener("click", () => {
        if (confirm("Remover esta foto da galeria?")) {
          fotosGaleria.splice(index, 1);
          salvar("fotosGaleria", fotosGaleria);
          atualizarGaleria();
        }
      });
      galeriaBarbeiro.appendChild(imgBarbeiro);

      const imgCliente = document.createElement("img");
      imgCliente.src = foto;
      galeriaCliente.appendChild(imgCliente);
    });
  };

  atualizarGaleria();

  btnAdicionarFoto.addEventListener("click", () => {
    const arquivo = inputFoto.files[0];
    if (!arquivo) return alert("Selecione uma imagem!");
    const leitor = new FileReader();
    leitor.onload = (e) => {
      fotosGaleria.push(e.target.result);
      salvar("fotosGaleria", fotosGaleria);
      inputFoto.value = "";
      atualizarGaleria();
    };
    leitor.readAsDataURL(arquivo);
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