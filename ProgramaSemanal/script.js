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


// ADICIONAR TAREFAS NO BANCO DE DADOS

async function adicionarTarefa() {
  const diaAtual = document.getElementById("diaSemana").value;
  const descricao = document.getElementById("descricao").value;
  const start_time = document.getElementById("tempI").value;
  const end_time = document.getElementById("tempF").value;
  // console.log(date, descricao, start_time, end_time);

  if (!descricao && !start_time && !end_time) {
    alert("Digite seu compromisso e o horario");
    return;
  }
  console.log(diaAtual, descricao, start_time, end_time);
  const response = await fetch("http://localhost:3002/adicionar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      diaAtual: diaAtual,
      descricao: descricao,
      start_time: start_time,
      end_time: end_time,
    }),
  });
  if (response.ok) {
    alert("Compromisso adicionada com sucesso");

    document.getElementById("descricao").value = "";
    document.getElementById("tempI").value = "";
    document.getElementById("tempF").value = "";

    buscarDadosHoje();
  } else {
    alert("Erro ao salvar o seu compromisso");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formWeek = document.getElementById("formWeek");
  if (formWeek) {
    formWeek.addEventListener("submit", (e) => {
      e.preventDefault();
      adicionarTarefa();
    });
  }
});

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
 