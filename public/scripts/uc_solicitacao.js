"use strict";

import ViewSolicitacao from '/scripts/view_paciente.js';


export default class UCSolicitacao {
  constructor() {
    this.view = new ViewSolicitacao(this);
      
    this.daoPaciente = new DaoPaciente();
  
    this.arrayPacientes = [];
    this.arrayLocais = [];
    this.arrayExames = [];

    this.codLocal = null;
    this.codExecutante = null;
    this.codExame = null;
    this.dtPeriodo = null;

    this.executante = null;
this.solicitante = null;
this.paciente = null;
this.cpf = null;
this.exame = null;
this.data = null;
this.faturar = null;
this.senha = null;

  }
  
//-----------------------------------------------------------------------------------------//

  async init() {
      await this.daoPaciente.abrirDB();
    await this.obterPacientes();
    await this.obterLocais();

    this.view.atualizarInterface();

  }
  
//-----------------------------------------------------------------------------------------//

  async obterPacientes() {
    this.arrayPacientes = await this.daoPaciente.obterPacientes();
    this.usrApp = window.retornarUsrApp();
    if (this.usrApp.ehMedico) {
      if (this.arrayPacientes.length > 0) {
        this.posAtual = 0;
      } else {
        this.posAtual = -1;
        this.cpfAtual = null;
      }
    } else {
      this.cbPaciente.remove(this.cbPaciente.selectedIndex);
      this.btPacientes.hidden = true;
      this.cbPaciente.style =
        "width:100%;-webkit-appearance:none;-moz-appearance:none;text-indent:1px;text-overflow: '';";
      this.arrayPacientes = [
        {
          cpf: this.usrApp.login,
          nome: this.usrApp.nome,
          celular: this.usrApp.celular,
          email: this.usrApp.email
        }
      ];
    }
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//
 
  async obterLocais() {
    let response = await fetch("/obterLocais/");
    this.arrayLocais = response.json();
    if (!this.arrayLocais) {
      console.log("obterLocais sem conteúdo");
      alert("Erro na conexão com o Servidor #02APP");
      this.arrayLocais = [];
      return;
    }
    if(this.arrayLocais.hasOwnProperty("erro")) {
      alert(this.arrayLocais.erro);
      this.arrayLocais = [];
      if(this.arrayLocais.erro == "Sessão Expirada") 
        window.location.href = "index.html";
      return;
    } 
    await this.arrayLocais.sort(function(a, b) {
      var keyA = a.codigolocal;
      var keyB = b.codigolocal;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
  }
  
 //-----------------------------------------------------------------------------------------//

  async obterPeriodo() {  
    let response = fetch("/obterPeriodo/");
    console.log("obterPeriodo retorno", retorno);
    if(!response) {
        console.log("(app.js) renderObterPeriodo sem conteúdo");
        return;
    }
    let objPeriodo = response.json();
    if(objPeriodo.hasOwnProperty("erro")) {
      alert(objPeriodo.erro);
      this.dtPeriodo = null;
      return;
    } else {
      console.log("obterPeriodo -> ", objPeriodo.Periodo);
      var dia = data.Periodo.substring(0, 2);
      var mes = data.Periodo.substring(3, 5);
      var ano = data.Periodo.substring(6, 10);
      this.dtPeriodo = ano + "-" + mes + "-" + dia;
    }
  }

//-----------------------------------------------------------------------------------------//

 async doObterExames(local, exame) {

  let response = await fetch("/obterExames/" + local + "/" + exame);
  if(!response) {
        console.log("(app.js) obterExames sem conteúdo");
        return;
    }
    let objExames = response.json();
    if(objExames.hasOwnProperty("erro")) {
      alert(objExames.erro);
      this.arrayExames = [];
      return;
    } else {
      this.arrayExames = JSON.parse(objExames);
    }
 }
  


   
   doVerificarSenha(senha) {
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

 doSolicitacao() {
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

 renderSolicitacao(resposta) {
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

 callbackSolicitacao() {
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

 callbackCadastrarPaciente() {
  window.location.href = "bdpaciente.html";
}

//-----------------------------------------------------------------------------------------//

 callbackSair() {
  history.go(-1);
}

//-----------------------------------------------------------------------------------------//

