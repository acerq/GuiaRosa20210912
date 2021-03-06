"use strict";

import ViewSolicitacao from "./view_solicitacao.js";
import DaoPaciente from "./dao_paciente.js";

const download = new Function("blob,nomeArq", "download(blob,nomeArq,'application/pdf')");

export default class CtrlSolicitacao {
  constructor() {
    this.view = new ViewSolicitacao(this);

    this.view.colocarEspera();

    this.daoPaciente = new DaoPaciente();

    this.usrApp = null;
    this.arrayPacientes = [];
    this.arrayLocais = [];
    this.arrayExames = [];
    this.merchantOrderId = null;

    this.init();
  }

  //-----------------------------------------------------------------------------------------//

  async init() {

    await this.obterLocais();
    
    this.usrApp = await window.retornarUsrApp();
    if(this.view.usuarioLogado) {
      await this.daoPaciente.abrirDB();
      await this.obterPacientes();
    } 
    this.view.atualizarInterface(
      this.usrApp.ehMedico,
      this.arrayPacientes,
      this.arrayLocais
    );
    if(this.view.usuarioLogado && this.usrApp.agendamento != null) {
        this.view.tirarEspera();
        await this.completarPgtoDebito();
    }
    this.view.tirarEspera();
  }

  //-----------------------------------------------------------------------------------------//

  async obterPacientes() {
    if (this.usrApp.ehMedico) {
      this.arrayPacientes = await this.daoPaciente.obterPacientes();
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
    let response = await fetch("/obterLocais/", { credentials : "include" });
    this.arrayLocais = await response.json();
    if (!this.arrayLocais) {
      console.log("obterLocais sem conte??do");
      alert("Erro na conex??o com o Servidor #02APP");
      this.arrayLocais = [];
      return;
    }
    if (this.arrayLocais.hasOwnProperty("erro")) {
      alert(this.arrayLocais.erro);
      this.arrayLocais = [];
      if (this.arrayLocais.erro == "Sess??o Expirada")
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

  async obterExames(local, exame) {
    if (exame == null || exame == "") exame = "*";
    let response = await fetch("/obterExames/" + local + "/" + exame, { credentials : "include" });
    if (!response) {
      console.log("(app.js) obterExames sem conte??do");
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
    let response = await fetch("/verificarSenha/" + senha, { credentials : "include" });
    if (!response) {
      return false;
    }
    let msg = await response.json();
    if (msg.hasOwnProperty("erro")) {
      return false;
    }
    return true;
  }

  //-----------------------------------------------------------------------------------------//

  obterFingerPrint() {
    let agora = new Date();
    let timeMillis = agora.getTime().toString();
    this.merchantOrderId = timeMillis;
    return "f0073a5b-a2e8-4cb8-af4f-cb4c95bf003b" + timeMillis;
  }

  //-----------------------------------------------------------------------------------------//

  async enviarAgendamentoPgtoCC(
    codExecutante,
    cpfPaciente,
    nomePaciente,
    emailPaciente,
    codExame,
    numCartao,
    nomeCartao,
    bandeira,
    mesValidade,
    anoValidade,
    cvv,
    nomeExame,
    nomeExecutante,
    endereco,
    valor,
    merchantIdExecutor,
    perccomis
  ) {
    this.view.colocarEspera();

    let proofOfSale = "";
    let paymentId = "";
      
    let obterIp = await fetch('/obterIp');
    let ip = await obterIp.text();

      
    // Processando o pagamento
    let requisicao =
      "/pgtocc" +
      "/" +
      cpfPaciente+
      "/" +
      nomePaciente +
      "/" +
      emailPaciente +
      "/" +
      this.merchantOrderId +
      "/" +
      ip +
      "/" +
      numCartao.replace(/ /g, "") +
      "/" +
      nomeCartao +
      "/" +
      bandeira +
      "/" +
      mesValidade +
      "/" +
      anoValidade +
      "/" +
      cvv +
      "/" +
      valor.replace(/\.|\,/g, "") +
      "/" +
      merchantIdExecutor +
      "/" +
      perccomis;
      
    let response = await fetch(requisicao, { credentials : "include" });
    let resposta = await response.json();
    if (!resposta || !resposta.Payment) {
      console.log("Erro no pagamento");
      this.view.tirarEspera();
      let mensagem = "Erro - pagamento n??o processado";
      if(resposta.Code)
        mensagem += ": #" + resposta.Code;
      return;
    }
    if (resposta.Payment.ReturnCode == 4 || resposta.Payment.ReturnCode == 6) {
      let merchantOrderId = resposta.MerchantOrderId;
      proofOfSale = resposta.Payment.ProofOfSale;
      paymentId = resposta.Payment.PaymentId;
    } else {
      this.view.tirarEspera();
      switch (resposta.Payment.ReturnCode) {
        case 5:
          alert("Pagamento Recusado: N??o Autorizado");
          return;
        case 70:
          alert("Pagamento Recusado: Problemas com o Cart??o de Cr??dito");
          return;
        case 77:
          alert("Pagamento Recusado: Cart??o Cancelado");
          return;
        case 78:
          alert("Pagamento Recusado: Cart??o de Cr??dito Bloqueado");
          return;
        case 57:
          alert("Pagamento Recusado: Cart??o Expirado");
          return;
        case 99:
          alert("Pagamento n??o realizado: Tempo Expirado");
          return;
        default:
          alert("Pagamento Recusado");
          return;
      }
    }
    //
    // Status: representa o status atual da transa????o.
    // ReasonCode: representa o status da requisi????o.
    // ProviderReturnCode: representa o c??digo de resposta da transa????o da adquirente.
    // Por exemplo, uma requisi????o de autoriza????o poder?? ter o retorno com ReasonCode=0 (Sucessfull),
    // ou seja, a requisi????o finalizou com sucesso, por??m, o Status poder?? ser 0-Denied, por ter a
    // transa????o n??o autorizada pela adquirente, por exemplo, ProviderReturnCode 57 (um dos c??digos de negada da Cielo)
    //
    //

    //###
    endereco = "sem endere??o";
    // Agendamento
    requisicao =   
      "/agendamento" +   
      "/" +
      this.merchantOrderId +
      "/" +
      codExecutante +
      "/" +
      this.usrApp.login +
      "/" +
      nomePaciente +
      "/" +
      cpfPaciente.replace(/\.|-/g, "") +
      "/" +
      codExame +
      "/" +
      nomeExame +
      "/" +
      nomeExecutante +
      "/" +
      endereco +
      "/" +
      "C";
    console.log("(app.js) Executando agendamento");
    response = await fetch(requisicao, { credentials : "include" });
    resposta = await response.json();

    if (!resposta) {
      console.log(" erro no agendamento");
      this.view.tirarEspera();
      alert("Erro no agendamento do exame.");
      return;
    }
    console.log("(app.js) renderAgendamento -> ", response);
    if (resposta.mensagem == "Ok") {
      this.view.tirarEspera();
      alert("Exame agendado com sucesso!\nAguarde download de confirma????o.");
      this.view.colocarEspera();
      cpfPaciente = cpfPaciente.substring(0, 3) + "." + cpfPaciente.substring(3, 6) + "." + cpfPaciente.substring(6, 9) + "-" + cpfPaciente.substring(cpfPaciente.length-2);
      valor = valor.substring(0, valor.length - 2) + "," + valor.substring(valor.length - 2);
      requisicao =
        "/gerarConfirmacao" +
        "/" +
        cpfPaciente +
        "/" +
        nomePaciente + 
        "/" +
        numCartao +
        "/" +
        nomeCartao +
        "/" +
        bandeira +
        "/" +
        nomeExame +
        "/" +
        nomeExecutante +
        "/" +
        endereco +
        "/" +
        valor +
        "/" +
        "Cart??o de Cr??dito" +
        "/" +
        this.merchantOrderId +
        "/" +
        proofOfSale +
        "/" +
        paymentId +
        "/" +
        "null";

      let response = await fetch(requisicao, { credentials : "include" });
      let blob = await response.blob();
      
      let nomeArq = this.merchantOrderId + ".pdf";
      await download(blob, nomeArq);
      this.view.tirarEspera();
      alert("Documento de confirma????o '" + nomeArq + "'\nsalvo na pasta de downloads");
      
      var file = window.URL.createObjectURL(blob);
      
      this.view.exibirConfirmacao(cpfPaciente, nomePaciente, nomeExame, nomeExecutante, endereco, 
                                  valor, "Cart??o de Cr??dito", this.merchantOrderId, null);      
    } else {
      alert("Erro no agendamento\n" + JSON.stringify(resposta));
    }
  }

  //-----------------------------------------------------------------------------------------//

  async enviarAgendamentoPgtoDebito( 
    codExecutante,
    cpfPaciente,
    nomePaciente,
    emailPaciente,
    codExame,
    numCartao,
    nomeCartao,
    bandeira,
    mesValidade,
    anoValidade,
    nomeExame,
    nomeExecutante,
    endereco,
    valor,
    merchantIdExecutor,
    perccomis
  ) {
    this.view.colocarEspera();
    let proofOfSale = "";
    let paymentId = "";
    let authenticationUrl = "";

    // Processando o pagamento
    let requisicao =
      "/pgtodebito" +
      "/" +
      cpfPaciente +
      "/" +
      nomePaciente +
      "/" +
      emailPaciente +
      "/" +
      this.merchantOrderId +
      "/" + 
      numCartao.replace(/ /g, "") +
      "/" +
      nomeCartao +
      "/" +
      bandeira +
      "/" +
      mesValidade +
      "/" +
      anoValidade +
      "/" +
      valor.replace(/\.|\,/g, "") +
      "/" +
      merchantIdExecutor +
      "/" +
      perccomis;
      
    let response = await fetch(requisicao, { credentials : "include" });
    let resposta = await response.json();
    if (!resposta) {
      console.log("Erro no pagamento");
      this.view.tirarEspera();
      alert("Erro - pagamento n??o processado");
      return;
    }
    this.view.tirarEspera();
    switch (resposta.Payment.ReasonCode) {
      case 0:
      case 9:
        let merchantOrderId = resposta.MerchantOrderId;
        proofOfSale = resposta.Payment.ProofOfSale;
        paymentId = resposta.Payment.PaymentId;
        authenticationUrl = resposta.Payment.AuthenticationUrl;
        break;
      case 7:
        alert("Pagamento Recusado: N??o Autorizado");
        return;
      case 12:
        alert("Pagamento Recusado: Problemas com o Cart??o de D??bito");
        return;
      case 13:
        alert("Pagamento Recusado: Cart??o Cancelado");
        return;
      case 14:
        alert("Pagamento Recusado: Cart??o de D??bito Bloqueado");
        return;
      case 15:
        alert("Pagamento Recusado: Cart??o Expirado");
        return;
      case 4:
      case 22:
        alert("Pagamento n??o realizado: Tempo Expirado");
        return;
      default:
        alert("Pagamento Recusado");
        return;
    }
    // Agendamento
    requisicao =
      "/agendamento" +
      "/" +
      this.merchantOrderId +
      "/" +
      codExecutante +
      "/" +
      this.usrApp.login +
      "/" +
      nomePaciente +
      "/" +
      cpfPaciente.replace(/\.|-/g, "") +
      "/" +
      codExame +
      "/" +
      nomeExame +
      "/" +
      nomeExecutante +
      "/" +
      endereco +
      "/" +
      "D";
    console.log("(app.js) Executando agendamento");
    response = await fetch(requisicao, { credentials : "include" });
    resposta = await response.json();

    if (!resposta) {
      console.log(" erro no agendamento");
      this.view.tirarEspera();
      alert("Erro no agendamento do exame.");
      return;
    }
    console.log("(app.js) renderAgendamento -> ", response);

    alert("Voc?? ser?? redirecionado ao seu banco para completar o pagamento por Cart??o de D??bito");
    window.location.href = authenticationUrl;
  }

  //-----------------------------------------------------------------------------------------//

  async completarPgtoDebito() {
      
  let response = await fetch("/verificarPgto", { credentials : "include" });
  let ses = await response.json();
    if (!ses) {
      console.log("Erro no pagamento");
      this.view.tirarEspera();
      alert("Erro - pagamento n??o processado");
      return;
  }
  
  switch (ses.pgto.status) {
    case 0:
      alert("Pagamento n??o finalizado");
      break;
    case 1:
      alert("Pagamento por boleto autorizado");
      break;
    case 2:
      alert("Pagamento confirmado e finalizado");
      break;
    case 3:
      alert("Pagamento negado por autorizador");
      return;
    case 10:
      alert("Pagamento Cancelado");
      return;
    case 11:
      alert("Pagamento Cancelado/Estornado");
      return;
    case 12:
      alert("Esperando retorno da institui????o financeira");
      return;
    case 13:
      alert("Pagamento cancelado por falha no processamento");
      return;
    case 20:
      alert("Pagamento por cr??dito com recorr??ncia agendada");
      return;
    default:
      alert("indefinido");
      return;
    } 
          
    let cpfPaciente = ses.agendamento.cpf.substring(0, 3) + "." + ses.agendamento.cpf.substring(3, 6) + "." + 
                      ses.agendamento.cpf.substring(6, 9) + "-" + ses.agendamento.cpf.substring(ses.agendamento.cpf.length-2);
    let valor = ses.pgto.valor.substring(0, ses.pgto.valor.length - 2) + "," + ses.pgto.valor.substring(ses.pgto.valor.length - 2);
    alert("Exame agendado com sucesso!\nAguarde download de confirma????o.");

    let requisicao =
        "/gerarConfirmacao" +
        "/" +
        cpfPaciente +
        "/" +
        ses.agendamento.nome +
        "/" +
        ses.pgto.numeroCartao +
        "/" +
        ses.pgto.nomeCartao +
        "/" +
        ses.pgto.bandeira +
        "/" +
        ses.agendamento.nomeExame + //TODO
        "/" +
        ses.agendamento.nomeExecutante +
        "/" +
        ses.agendamento.enderecoExecutante +
        "/" +
        valor +
        "/" +
        "Cart??o de D??bito" +
        "/" +
        ses.pgto.merchantOrderId +
        "/" +
        ses.pgto.proofOfSale +
        "/" +
        ses.pgto.paymentId +
        "/" +
        "null"; // URL 

      response = await fetch(requisicao, { credentials : "include" });
      let blob = await response.blob();
      let nomeArq = ses.pgto.merchantOrderId + ".pdf";
      await download(blob, nomeArq);
      this.view.tirarEspera();
      alert("Documento de confirma????o " + nomeArq + " salvo na pasta de downloads");
      // alert("Redirecionando para autentica????o");
            
      this.view.exibirConfirmacao(cpfPaciente, ses.agendamento.nome, "nomeExame", "nomeExecutante", "endereco", 
                                  valor, "Cart??o de D??bito", ses.pgto.merchantOrderId, null);      

      // window.history.go(-1);
  }

  //-----------------------------------------------------------------------------------------//

async enviarAgendamentoPgtoBoleto(
    codExecutante,
    cpfPaciente,
    nomePaciente,
    emailPaciente,
    codExame,
    nomeExame,
    nomeExecutante,
    endereco,
    valor,
    merchantIdExecutor,
    perccomis
  ) {
    this.view.colocarEspera();
    let proofOfSale = "";
    let paymentId = "";
    let url = ""; 
      
    let agora = new Date();
    let timeMillis = agora.getTime().toString();
    // let merchantOrderId =   this.usrApp.login + "-" + timeMillis;
    let merchantOrderId = timeMillis;

    // Processando o pagamento
    let requisicao =
      "/pgtoboleto" +
      "/" +
      cpfPaciente +
      "/" +
      nomePaciente +
      "/" +
      emailPaciente +
      "/" +
      merchantOrderId +
      "/" +
      valor.replace(/\.|\,/g, "") +
      "/" +
      merchantIdExecutor +
      "/" +
      perccomis.replace(/\.|\,/g, "") +
      "/" +
      nomeExame;
      
    let response = await fetch(requisicao, { credentials : "include" });
    let resposta = await response.json();
    if (!resposta) {
      console.log("Erro no pagamento");
      this.view.tirarEspera();
      alert("Erro - pagamento n??o processado");
      return;
    }
    if (resposta.Payment.ReasonCode == 0) {
      merchantOrderId = resposta.MerchantOrderId;
      proofOfSale = resposta.Payment.ProofOfSale;
      paymentId = resposta.Payment.PaymentId;
      url = resposta.Payment.Url;
    } else {
      this.view.tirarEspera();
      switch (resposta.Payment.ReasonCode) {
        case 7:
          alert("Pagamento Recusado: N??o Autorizado");
          return;
        case 9:
          alert("Aguardando o processamento do cart??o de d??bito.");
          merchantOrderId = resposta.MerchantOrderId;
          proofOfSale = resposta.Payment.ProofOfSale;
          paymentId = resposta.Payment.PaymentId;
          return;
        case 12:
          alert("Pagamento Recusado: Problemas com o Cart??o de D??bito");
          return;
        case 13:
          alert("Pagamento Recusado: Cart??o Cancelado");
          return;
        case 14:
          alert("Pagamento Recusado: Cart??o de D??bito Bloqueado");
          return;
        case 15:
          alert("Pagamento Recusado: Cart??o Expirado");
          return;
        case 4:
        case 22:
          alert("Pagamento n??o realizado: Tempo Expirado");
          return;
        default:
          alert("Pagamento Recusado");
          return;
      }
    }
    //
    // Status: representa o status atual da transa????o.
    // ReasonCode: representa o status da requisi????o.
    // ProviderReturnCode: representa o c??digo de resposta da transa????o da adquirente.
    // Por exemplo, uma requisi????o de autoriza????o poder?? ter o retorno com ReasonCode=0 (Sucessfull),
    // ou seja, a requisi????o finalizou com sucesso, por??m, o Status poder?? ser 0-Denied, por ter a
    // transa????o n??o autorizada pela adquirente, por exemplo, ProviderReturnCode 57 (um dos c??digos de negada da Cielo)
    //
    //

    // Agendamento
    requisicao =
      "/agendamento" +
      "/" +
      merchantOrderId +
      "/" +
      codExecutante +
      "/" +
      this.usrApp.login +
      "/" +
      nomePaciente +
      "/" +
      cpfPaciente.replace(/\.|-/g, "") +
      "/" +
      codExame +
      "/" +
      nomeExame +
      "/" +
      nomeExecutante +
      "/" +
      endereco +
      "/" +
      "B";
    console.log("(app.js) Executando agendamento");
    response = await fetch(requisicao, { credentials : "include" });
    resposta = await response.json();

    if (!resposta) {
      console.log(" erro no agendamento");
      this.view.tirarEspera();
      alert("Erro no agendamento do exame.");
      return;
    }
    console.log("(app.js) renderAgendamento -> ", response);
    if (resposta.mensagem == "Ok") {
      this.view.tirarEspera();
      alert("Exame agendado com sucesso!\nAguarde download de confirma????o.");
      this.view.colocarEspera();
      //TODO cpfPaciente = cpfPaciente.substring(0, 3) + "." + cpfPaciente.substring(3, 6) + "." + cpfPaciente.substring(6, 9) + "-" + cpfPaciente.substring(cpfPaciente.length-2);
      valor = valor.substring(0, valor.length - 2) + "," + valor.substring(valor.length - 2);

      requisicao =
        "/gerarConfirmacao" +
        "/" +
        cpfPaciente +
        "/" +
        nomePaciente +
        "/" +
        "BOLETO" +
        "/" +
        "BOLETO" +
        "/" +
        "BOLETO" +
        "/" +
        nomeExame +
        "/" +
        nomeExecutante +
        "/" +
        endereco +
        "/" +
        valor +
        "/" +
        "Boleto" +
        "/" +
        merchantOrderId +
        "/" +
        proofOfSale +
        "/" +
        paymentId +
        "/" +
        url.replace(/\//g, "%2F");

      let response = await fetch(requisicao, { credentials : "include" });
      let blob = await response.blob();
      let nomeArq = merchantOrderId + ".pdf";
      await download(blob, nomeArq);
      this.view.tirarEspera();
      alert("Documento de confirma????o '" + nomeArq + "'\nsalvo na pasta de downloads");
      
      this.view.exibirConfirmacao(cpfPaciente, nomePaciente, nomeExame, nomeExecutante, 
                                  endereco, valor, "Boleto", merchantOrderId, url);

      //window.history.go(-1);
    } else {
      alert("Erro no agendamento\n" + JSON.stringify(resposta));
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
