"use strict";

import ViewSolicitacao from '/scripts/view_paciente.js';


export default class UCSolicitacao {
  constructor() {
    this.view = new ViewSolicitacao(this);
      
    this.daoPaciente = new DaoPaciente();

  

    this.codLocal = null;
    this.codExecutante = null;
var codExame = null;
var dtPeriodo = null;

var executante = null;
var solicitante = null;
var paciente = null;
var cpf = null;
var exame = null;
var data = null;
var faturar = null;
var senha = null;

  }
  
//-----------------------------------------------------------------------------------------//

  async init() {
      await this.daoPaciente.abrirDB();
    await this.obterPacientes();
    await this.obterLocais();

    view.init();

  }
  
//-----------------------------------------------------------------------------------------//

function doVerificarSenha(senha) {
  console.log("(app.js) Executando verificarSenha");
  return fetch("/verificarSenha/" + senha)
    .then(response => {
      console.log("(app.js) verificarSenha response");
      return response.json();
    })
    .catch(() => {
      console.log("(app.js) obterPeriodo catch");
      return;
    });
}

//-----------------------------------------------------------------------------------------//

function doSolicitacao() {
  executante = codExecutante;
  solicitante = funcaoObterUsuario();
  let dadosPaciente = cbPaciente.value.split(SEPARADOR);      
  paciente = dadosPaciente[0];
  cpf = dadosPaciente[1].replace(/\.|-/g,'');
  exame = codExame;
  data = dtExame.value;
  faturar = cbFaturar.value;

  var requisicao =
    "/solicitacao/" +
    executante +
    "/" +
    solicitante +
    "/" +
    paciente +
    "/" +
    cpf +
    "/" +
    exame +
    "/" +
    data +
    "/" +
    dtPeriodo +
    "/" +
    faturar;

  console.log("(app.js) Executando solicitacao");
  return fetch(requisicao)
    .then(response => {
      console.log("(app.js) solicitacao response");
      return response.json();
    })
    .catch(() => {
      console.log("(app.js) solicitacao catch");
      return null;
    });
}

//-----------------------------------------------------------------------------------------//

function renderSolicitacao(resposta) {
  fnTirarEspera();
  if (!resposta) {
    console.log("(app.js) renderSolicitacao sem conteúdo");
    alert("Erro na solicitação do exame.");
    return;
  } 
  console.log("(app.js) renderSolicitacao -> ", resposta);
  if(resposta.mensagem == "Ok")	{
	  alert("Exame agendado com sucesso");
  	window.history.go(-1);
  } else {
	  alert(resposta.mensagem);	  
  }
}

//-----------------------------------------------------------------------------------------//

function callbackSolicitacao() {
  executante = codExecutante;
  if (executante == null) {
    alert("O exame não foi escolhido.");
    return;
  }
  exame = codExame;
  if (exame == null) {
    alert("O exame não foi escolhido.");
    return;
  }
  solicitante = "XXXX";
  paciente = cbPaciente.value;
  if (paciente == null || paciente == "") {
    alert("O paciente não foi escolhido.");
    return;
  }
  data = dtExame.value;
  if (data == null) {
    alert("A data não foi escolhida.");
    return;
  }
  faturar = cbFaturar.value;
  if (faturar == null) {
    alert("Não foi indicado se o exame será faturado ou não.");
    return;
  }
  senha = funcaoMD5(pwSenha.value);
  if (senha == null) {
    alert("Informe sua senha para confirmação.");
    return;
  }

  fnColocarEspera();
  doVerificarSenha(senha).then(retorno => {
    console.log("(app.js) callBackSolicitacao retorno verificarSenha", retorno);
    if (!retorno) {
      fnTirarEspera();
      console.log("(app.js) renderVerificarSenha sem conteúdo");
      alert("Erro na conexão com o Servidor #03APP");
      return;
    }
    if (retorno.hasOwnProperty("erro")) {
      fnTirarEspera();
      alert(retorno.erro);
      return;
    }

    doSolicitacao().then(retorno => {
      console.log("(app.js) callBackSolicitacao retorno", retorno);
      renderSolicitacao(retorno);
    });
  });
}

//-----------------------------------------------------------------------------------------//

function callbackCadastrarPaciente() {
  window.location.href = "bdpaciente.html";
}

//-----------------------------------------------------------------------------------------//

function callbackSair() {
  history.go(-1);
}

//-----------------------------------------------------------------------------------------//

$(document).on("keypress", "input", function(e) {
  if (e.which == 13 && e.target == tfExame) {
    callbackConsultarExames();
  }
});

//-----------------------------------------------------------------------------------------//

pwSenha.addEventListener("keyup", function(event){if(event.keyCode === 13){callbackSolicitacao();}});

