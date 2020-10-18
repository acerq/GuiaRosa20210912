"use strict";

import ViewSolicitacao from "./view_solicitacao.js";
import DaoPaciente from "./dao_paciente.js";

export default class CtrlSolicitacao {
  constructor() {
    this.view = new ViewSolicitacao(this);

    this.daoPaciente = new DaoPaciente();

    this.usrApp = null;

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

    this.init();
  }

  //-----------------------------------------------------------------------------------------//

  async init() {
    this.view.colocarEspera();

    await this.daoPaciente.abrirDB();
    await this.obterPacientes();
    await this.obterLocais();

    this.view.atualizarInterface(this.arrayPacientes, this.arrayLocais);

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
    let response = fetch("/obterPeriodo/");
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
    let response = await fetch(
      "/obterExames/" + local + "/" + exame.toUpperCase()
    );
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
    paciente,
    cpf,
    exame,
    data,
    dtPeriodo,
    faturar
  ) {
    var requisicao =
      "/solicitacao/" +
      codExecutante +
      "/" +
      this.usrApp.login +
      "/" +
      paciente +
      "/" +
      cpf +
      "/" +
      exame +
      "/" +
      data +
      "/" +
      this.dtPeriodo +
      "/" +
      faturar;

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
      alert("Exame agendado com sucesso");
      window.history.go(-1);
    } else {
      alert(resposta.mensagem);
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