"use strict";

import ViewSolicitacao from "./view_solicitacao.js";
import DaoPaciente from "./dao_paciente.js";

export default class CtrlSolicitacao {
  constructor() {
    this.view = new ViewSolicitacao(this);

    this.daoPaciente = new DaoPaciente();

    this.usrApp = null;

    this.arrayPacientes = [];
    this.dtPeriodo = null;
    this.arrayLocais = [];
    this.arrayExames = [];

    this.init();
  }

  //-----------------------------------------------------------------------------------------//

  async init() {
    this.view.colocarEspera();

    await this.daoPaciente.abrirDB();
    await this.obterPacientes();
    await this.obterPeriodo();
    await this.obterLocais();

    this.view.atualizarInterface(
      this.usrApp.ehMedico,
      this.arrayPacientes,
      this.arrayLocais
    );

    this.view.tirarEspera();
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
      this.arrayPacientes = [
        {
          cpf: this.usrApp.login,
          nome: this.usrApp.nome,
          celular: this.usrApp.celular,
          email: this.usrApp.email
        }
      ];
    }
  }

  //-----------------------------------------------------------------------------------------//

  async obterLocais() {
    let response = await fetch("/obterLocais/");
    this.arrayLocais = await response.json();
    if (!this.arrayLocais) {
      console.log("obterLocais sem conteúdo");
      alert("Erro na conexão com o Servidor #02APP");
      this.arrayLocais = [];
      return;
    }
    if (this.arrayLocais.hasOwnProperty("erro")) {
      alert(this.arrayLocais.erro);
      this.arrayLocais = [];
      if (this.arrayLocais.erro == "Sessão Expirada")
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
    let response = await fetch("/obterPeriodo/");
    console.log("obterPeriodo retorno", response);
    if (!response) {
      console.log("(app.js) renderObterPeriodo sem conteúdo");
      return;
    }
    let objPeriodo = await response.json();
    if (objPeriodo.hasOwnProperty("erro")) {
      alert(objPeriodo.erro);
      this.dtPeriodo = null;
      return;
    } else {
      console.log("obterPeriodo -> ", objPeriodo.Periodo);
      var dia = objPeriodo.Periodo.substring(0, 2);
      var mes = objPeriodo.Periodo.substring(3, 5);
      var ano = objPeriodo.Periodo.substring(6, 10);
      this.dtPeriodo = ano + "-" + mes + "-" + dia;
    }
  }

  //-----------------------------------------------------------------------------------------//

  async obterExames(local, exame) {
    if(exame == null || exame == "")
      exame = "*";
    let response = await fetch("/obterExames/" + local + "/" + exame);
    if (!response) {
      console.log("(app.js) obterExames sem conteúdo");
      return;
    }
    let objExames = await response.json();
    if (objExames.hasOwnProperty("erro")) {
      alert(objExames.erro);
      this.arrayExames = [];
      return;
    } else {
      this.arrayExames = JSON.parse(objExames);
      this.view.atualizarExames(this.arrayExames);
    }
  }

  //-----------------------------------------------------------------------------------------//

  async verificarSenha(senha) {
    let response = await fetch("/verificarSenha/" + senha);
    if (!response) {
      return false;
    }
    if (response.hasOwnProperty("erro")) {
      alert(response.erro);
      return false;
    }
    return true;
  }

  //-----------------------------------------------------------------------------------------//

  async enviarSolicitacao(
    codExecutante,
    nomePaciente,
    cpf,
    exame,
    data,
    faturar
  ) {
    var requisicao =
      "/solicitacao/" +
      codExecutante +
      "/" +
      this.usrApp.login +
      "/" +
      nomePaciente +
      "/" +
      cpf +
      "/" +
      exame +
      "/" +
      data +
      "/" +
      this.dtPeriodo +
      "/" +
      "S";
    //faturar;

    console.log("(app.js) Executando solicitacao");
    let response = await fetch(requisicao);
    let resposta = await response.json();

    if (!resposta) {
      console.log("(app.js) renderSolicitacao sem conteúdo");
      alert("Erro na solicitação do exame.");
      return;
    }
    console.log("(app.js) renderSolicitacao -> ", response);
    if (resposta.mensagem == "Ok") {
    //app.get("/pgtocc/:nome/:cpf/:email/:numeroCartao/:nomeCartao/:bandeira/:validade/:cvv/:valor", doPgtoCC);

    let requisicao =        
        "/pgtocc" +
        "/" +
        "José da Silva" +
        "/" +
        "11111111111" + 
        "/" +
        "jose@fake.com" +
        "/" +
        "4235647728025684" +
        "/" +
        "JOSE DA SILVA" +
        "/" +
        "VISA" +
        "/" +
        "11-2027" +
        "/" +
        "123" +
        "/" +
        "32000";
    let response = await fetch(requisicao);
    let resposta = await response.json();
    alert("Exame agendado com sucesso\n" + JSON.stringify(resposta));
    window.history.go(-1);
    } else {
    let requisicao =        
      //alert("Erro no agendamento");
        "/pgtocc" +
        "/" +
        "José da Silva" +
        "/" +
        "11111111111" + 
        "/" +
        "jose@fake.com" +
        "/" +
        "4235647728025684" +
        "/" +
        "JOSE DA SILVA" +
        "/" +
        "VISA" +
        "/" +
        "11-2027" +
        "/" +
        "123" +
        "/" +
        "32000";
    let response = await fetch(requisicao);
    let resposta = await response.json();
    alert("Exame agendado com sucesso\n" + JSON.stringify(resposta));
    }
  }

  //-----------------------------------------------------------------------------------------//

  chamarCadastrarPacientes() {
    window.location.href = "bdpaciente.html";
  }

  //-----------------------------------------------------------------------------------------//

  callbackSair() {
    history.go(-1);
  }

  //-----------------------------------------------------------------------------------------//
}

var ucSolicitacao = new CtrlSolicitacao();
