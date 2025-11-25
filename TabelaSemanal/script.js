const diaAtual = document.getElementById("diaAtual");
const diaDaSemana = document.getElementById("dds");

let dia = new Date().getDate();
const mes = new Date().getMonth() + 1;
const ano = new Date().getFullYear();
const diaSemana = new Intl.DateTimeFormat("PT-BR", { weekday: "long" }).format(
  new Date()
);
let date = `${ano}-${mes}-${dia}`;

if (diaAtual) {
  diaAtual.textContent += `${dia}/${mes}/${ano}`;
}

if (diaDaSemana) {
  diaDaSemana.textContent += diaSemana;
}


// Data de referência: usa o dia atual
const dataReferencia = new Date();

// Array com os nomes dos dias da semana
const nomesDias = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Calcula o domingo da semana da data de referência
const domingo = new Date(dataReferencia);
domingo.setDate(dataReferencia.getDate() - dataReferencia.getDay());

// Cria o array com a semana completa
const semana = [];

for (let i = 0; i < 7; i++) {
  const dia = new Date(domingo);
  dia.setDate(domingo.getDate() + i);
  semana.push({
    data: dia.toLocaleDateString("pt-BR"),
    nomeDia: nomesDias[dia.getDay()],
    dataISO: `${dia.getFullYear()}-${dia.getMonth() + 1}-${dia.getDate()}`
  });
}
console.log(semana)
const select_diaSemana = document.getElementById("diaSemana");
console.log(select_diaSemana);
if(select_diaSemana){
select_diaSemana.innerHTML = semana.map((item) => { 
  return ` <option value="${item.dataISO}">${item.nomeDia}</option>`
})
}
 
// Busca tarefas de uma data específica
async function buscarTarefasDate(dateISO) {
  try {
    const response = await fetch(`http://localhost:3002/tarefas/${dateISO}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Erro ao buscar tarefas para ${dateISO}:`, error);
    return [];
  }
}

// Converte hora em minutos para ordenação
function horaParaMinutos(hora) {
  if (!hora) return Number.POSITIVE_INFINITY;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// Formata hora para exibição
function formatHora(hora) {
  if (!hora) return "";
  const [h, m] = hora.split(":");
  return `${h}:${m}`;
}

// Carrega tarefas da semana e renderiza a tabela
async function carregarSemana() {
  const semanaComTarefas = await Promise.all(
    semana.map(async (dia) => {
      const tarefas = await buscarTarefasDate(dia.dataISO);
      const tarefasOrdenadas = [...tarefas].sort((a, b) => {
        const diffInicio =
          horaParaMinutos(a.start_time) - horaParaMinutos(b.start_time);
        if (diffInicio !== 0) return diffInicio;
        return horaParaMinutos(a.end_time) - horaParaMinutos(b.end_time);
      });
      return { ...dia, tarefas: tarefasOrdenadas };
    })
  );
  renderTabelaSemana(semanaComTarefas);
}

function renderTabelaSemana(semanaComTarefas) {
  const tbody = document.getElementById("tableBodySemana");
  if (!tbody) return;
  const table = tbody.closest("table");
  if (!table) return;

  // remove thead existente (se houver) e cria novo thead com os nomes dos dias
  const oldThead = table.querySelector("thead");
  if (oldThead) oldThead.remove();

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  semanaComTarefas.forEach((dia) => {
    const th = document.createElement("th");
    th.textContent =
      dia.nomeDia ;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.insertBefore(thead, tbody);

  // limpa tbody e monta linhas de tarefas (cada linha representa o índice da tarefa)
  tbody.innerHTML = "";

  const maxLen = Math.max(
    ...semanaComTarefas.map((d) => (d.tarefas ? d.tarefas.length : 0)),
    0
  );

  if (maxLen === 0) {
    const emptyRow = document.createElement("tr");
    semanaComTarefas.forEach(() => {
      const td = document.createElement("td");
      td.textContent = "—";
      emptyRow.appendChild(td);
    });
    tbody.appendChild(emptyRow);
    return;
  }

  for (let i = 0; i < maxLen; i++) {
    const tr = document.createElement("tr");

    semanaComTarefas.forEach((dia) => {
      const td = document.createElement("td");

      // wrapper interno (pode ser usado se quiser scroll interno também)
      const wrapper = document.createElement("div");
      wrapper.className = "tarefa-cell-wrapper";

      const tarefa = dia.tarefas && dia.tarefas[i];
      if (tarefa) {
        const inicio = formatHora(tarefa.start_time);
        const fim = formatHora(tarefa.end_time);
        const horarios =
          inicio && fim ? ` (${inicio}–${fim})` : inicio || fim || "";

        const desc = document.createElement("div");
        desc.className = "tarefa-desc";
        desc.textContent = tarefa.descricao;
        wrapper.appendChild(desc);

        if (horarios) {
          const hrElem = document.createElement("div");
          hrElem.className = "tarefa-horario";
          hrElem.textContent = horarios;
          wrapper.appendChild(hrElem);
        }

        const actions = document.createElement("div");
        actions.className = "tarefa-actions";
        actions.innerHTML = `
          <button class="btns" title="Editar" aria-label="Editar" onclick="editarTarefa(${tarefa.idtarefas})"><i class='bx bx-edit'></i></button>
          <button class="btns" title="Excluir" aria-label="Excluir" onclick="excluirItem(${tarefa.idtarefas})"><i class='bx bx-trash'></i></button>
        `;
        wrapper.appendChild(actions);
      } else {
        wrapper.textContent = "—";
        wrapper.style.textAlign = "center";
      }

      td.appendChild(wrapper);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }
}

// Inicia a renderização ao carregar a página
document.addEventListener("DOMContentLoaded", carregarSemana);








// função de excluir 

function excluirItem(id) {
  fetch(`http://localhost:3002/deletarTarefa/${id}`, {
    method: 'DELETE',
  })
  .then(response => {
    if (response.ok) {
      console.log('Item excluído com sucesso');
      carregarSemana(); // atualiza a lista
    } else {
      console.error('Erro ao excluir');
    }
  });
}

// função editir

async function buscarDadosTarefa(id) {
    try {
        response = await fetch(`http://localhost:3002/tarefa/${id}`);
        dados = await response.json();
        console.log(dados);
        return dados;
    } catch (error) {
        console.log(error);
    }
}

async function editarTarefa(id) {
    document.getElementById("modalEditar").style.display = "flex";
    console.log(id)
    const tarefa = await buscarDadosTarefa(id);
    console.log(tarefa);
    const start_time = tarefa[0].start_time
    console.log(start_time);
    const end_time = tarefa[0].end_time
    console.log(end_time);
    document.getElementById("descricao").value = tarefa[0].descricao;
    document.getElementById("tempI").value = start_time;
    document.getElementById("tempF").value = end_time;
    // guarda o id atual para o submit único
    window.currentEditId = id;
}

// listener único de submit do formulário de edição
const formEditarEl = document.getElementById('formEditar');
if (formEditarEl) {
    formEditarEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = window.currentEditId;
        if (!editId) {
            console.warn('Nenhum ID de edição definido.');
            return;
        }

        const formData = new FormData(e.target);
        const descricao = formData.get("descricao");
        const start_time = String(formData.get("tempI")).slice(0, 5);
        const end_time = String(formData.get("tempF")).slice(0, 5);
        console.log('Editando:', editId, descricao, start_time, end_time);

        try {
            const res = await fetch(`http://localhost:3002/editarTarefas/${editId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    descricao,
                    start_time,
                    end_time,
                }),
            });
            const data = await res.json();
            console.log(data);

            if (res.status === 200) {
                alert("Tarefa editada com sucesso!");
                document.getElementById("modalEditar").style.display = "none";
                window.currentEditId = null;
                carregarSemana();
            } else {
                alert("Erro ao editar tarefa!");
            }
        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
            alert("Erro ao editar tarefa!");
        }
        buscarTarefasDate(date);
    });
}


// function para cancelar a edição
document.getElementById("btnCancelar").addEventListener("click", () => {
    document.getElementById("modalEditar").style.display = "none";
    window.currentEditId = null;
});


