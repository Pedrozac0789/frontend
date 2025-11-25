// ====================================
// CONFIGURAÇÃO INICIAL DE DATA E ELEMENTOS
// ====================================
const diaAtual = document.getElementById("diaAtual");
const diaDaSemana = document.getElementById("dds");
const listaTarefas = document.querySelector("#listaTarefas");

// Data atual do sistema
let dia = new Date().getDate();
const mes = new Date().getMonth() + 1;
const ano = new Date().getFullYear();
const nomeDiaSemana = new Intl.DateTimeFormat("PT-BR", { weekday: "long" }).format(new Date());

// Data selecionada (inicialmente é hoje)
let dataSelecionada = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

// Atualiza elementos de data no HTML
if (diaAtual) {
    diaAtual.textContent = `${dia}/${mes}/${ano}`;
}
if (diaDaSemana) {
    diaDaSemana.textContent = nomeDiaSemana;
}

// ====================================
// GERAÇÃO DO CALENDÁRIO
// ====================================
const daysContainer = document.getElementById("daysContainer");
const monthYear = document.getElementById("monthYear");
const data = new Date();
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function gerarCalendario() {
    // Limpa o container
    daysContainer.innerHTML = "";
    
    // Define mês e ano no cabeçalho
    monthYear.textContent = `${monthNames[data.getMonth()]} ${data.getFullYear()}`;

    // Adiciona os dias da semana (cabeçalho)
    daysOfWeek.forEach((day) => {
        const dayElem = document.createElement("div");
        dayElem.className = "day day-header";
        dayElem.textContent = day;
        daysContainer.appendChild(dayElem);
    });

    // Primeiro dia do mês e total de dias
    const firstDay = new Date(data.getFullYear(), data.getMonth(), 1).getDay();
    const totalDays = new Date(data.getFullYear(), data.getMonth() + 1, 0).getDate();

    // Espaços vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "day empty";
        daysContainer.appendChild(empty);
    }

    // Cria os dias do mês
    for (let i = 1; i <= totalDays; i++) {
        const dayElem = document.createElement("div");
        dayElem.className = "day day-number";
        dayElem.textContent = i;
        
        // Marca o dia atual
        if (i === new Date().getDate() && 
            data.getMonth() === new Date().getMonth() && 
            data.getFullYear() === new Date().getFullYear()) {
            dayElem.classList.add("today");
        }

        // Adiciona evento de clique no dia
        dayElem.addEventListener("click", function() {
            selecionarDia(i, data.getMonth() + 1, data.getFullYear(), this);
        });

        daysContainer.appendChild(dayElem);
    }
}

// Gera o calendário ao carregar
gerarCalendario();

// ====================================
// FUNÇÃO PARA SELECIONAR DIA NO CALENDÁRIO
// ====================================
function selecionarDia(diaClicado, mesClicado, anoClicado, elemento) {
    // Remove seleção de todos os dias
    document.querySelectorAll('.day-number').forEach(d => {
        d.classList.remove('dia-selecionado');
    });
    
    // Adiciona classe ao dia clicado
    elemento.classList.add('dia-selecionado');
    
    // Formata a data no padrão YYYY-MM-DD
    const diaFormatado = String(diaClicado).padStart(2, '0');
    const mesFormatado = String(mesClicado).padStart(2, '0');
    dataSelecionada = `${anoClicado}-${mesFormatado}-${diaFormatado}`;
    
    // Atualiza o display da data
    if (diaAtual) {
        diaAtual.textContent = `${diaClicado}/${mesClicado}/${anoClicado}`;
    }
    
    // Atualiza o dia da semana
    if (diaDaSemana) {
        const dataObj = new Date(anoClicado, mesClicado - 1, diaClicado);
        const nomeDia = new Intl.DateTimeFormat("PT-BR", { weekday: "long" }).format(dataObj);
        diaDaSemana.textContent = nomeDia;
    }
    
    // Busca as tarefas do dia selecionado
    buscarDadosHoje(dataSelecionada);
}

// ====================================
// FUNÇÕES DE TAREFAS - API
// ====================================

// Busca tarefas de uma data específica
async function buscarDadosHoje(data) {
    try {
        const response = await fetch(`http://localhost:3002/tarefasHoje/${data}`);
        const dados = await response.json();
        console.log('Tarefas do dia:', dados);
        
        listaTarefas.innerHTML = "";
        
        // Se não houver tarefas
        if (dados.length === 0) {
            listaTarefas.innerHTML = "<li style='text-align: center; color: #cd9bffff; padding: 20px;'>Nenhuma tarefa para este dia</li>";
            return;
        }
        
        // Renderiza as tarefas
        dados.forEach((item) => {
            listaTarefas.innerHTML += `
                <li data-id="${item.idtarefas}">
                    <div class="tarefa-desc">${item.descricao}</div>
                    <div class="tarefa-horario">${item.start_time}-${item.end_time}</div>
                    <div class="tarefa-actions">
                        <button class="btns editar-btn" title="Editar" aria-label="Editar" onclick="editarTarefa(${item.idtarefas})">
                            <i class='bx bx-edit'></i>
                        </button>
                        <button class="btns excluir-btn" title="Excluir" aria-label="Excluir" onclick="excluirTarefa(${item.idtarefas})">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                </li>
                <hr>`;
        });
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        listaTarefas.innerHTML = "<li style='text-align: center; color: #f44336; padding: 20px;'>Erro ao carregar tarefas</li>";
    }
}

// Busca dados de uma tarefa específica
async function buscarDadosTarefa(id) {
    try {
        const response = await fetch(`http://localhost:3002/tarefa/${id}`);
        const dados = await response.json();
        console.log('Dados da tarefa:', dados);
        return dados;
    } catch (error) {
        console.error('Erro ao buscar tarefa:', error);
        return null;
    }
}

// Abre modal de edição
async function editarTarefa(id) {
    document.getElementById("modalEditar").style.display = "flex";
    
    const tarefa = await buscarDadosTarefa(id);
    if (!tarefa || tarefa.length === 0) {
        alert('Erro ao carregar dados da tarefa!');
        return;
    }
    
    // Preenche o formulário
    document.getElementById("descricao").value = tarefa[0].descricao;
    document.getElementById("tempI").value = tarefa[0].start_time;
    document.getElementById("tempF").value = tarefa[0].end_time;
    
    // Guarda o ID para o submit
    window.currentEditId = id;
}

// Fecha modal de edição
document.getElementById("btnCancelar")?.addEventListener("click", () => {
    document.getElementById("modalEditar").style.display = "none";
    window.currentEditId = null;
});

// Submit do formulário de edição
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

        try {
            const res = await fetch(`http://localhost:3002/editarTarefas/${editId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ descricao, start_time, end_time }),
            });
            
            const data = await res.json();
            console.log('Resposta da edição:', data);

            if (res.status === 200) {
                alert("Tarefa editada com sucesso!");
                document.getElementById("modalEditar").style.display = "none";
                window.currentEditId = null;
                buscarDadosHoje(dataSelecionada);
            } else {
                alert("Erro ao editar tarefa!");
            }
        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
            alert("Erro ao editar tarefa!");
        }
    });
}

// Excluir tarefa
async function excluirTarefa(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3002/deletarTarefa/${id}`, {
            method: "DELETE",
        });
        
        const dados = await response.json();
        console.log('Resposta da exclusão:', dados);
        
        if (response.status === 200) {
            alert("Tarefa excluída com sucesso!");
            buscarDadosHoje(dataSelecionada);
        } else {
            alert("Erro ao excluir tarefa!");
        }
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        alert("Erro ao excluir tarefa!");
    }
}

// ====================================
// INICIALIZAÇÃO
// ====================================
// Carrega tarefas do dia atual
buscarDadosHoje(dataSelecionada);