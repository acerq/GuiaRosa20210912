"use strict";

import DaoPaciente from "./dao_paciente.js";

const SEPARADOR = "##";
const funcaoMD5 = new Function("a", "return md5(a)");
const funcaoObterUsuario = new Function("b", "return usrApp.login");
const fnTirarEspera = new Function("tirarEspera()");
const fnColocarEspera = new Function("colocarEspera()");

export default class ViewSolicitacao {
  constructor() {
    this.daoPaciente = new DaoPaciente();
    this.arrayPacientes = [];

    this.usrApp = null;

    this.hdExecutante = document.getElementById("hdExecutante");
    this.hdSolicitante = document.getElementById("hdSolicitante");
    this.cbPaciente = document.getElementById("cbPaciente");
    this.cbExame = document.getElementById("cbExame");
    this.dtExame = document.getElementById("dtExame");
    this.cbFaturar = document.getElementById("cbFaturar");
    this.btPacientes = document.getElementById("btPacientes");
    this.btEnviar = document.getElementById("btEnviar");
    this.btSair = document.getElementById("btSair");
        
    this.tfExame = document.getElementById("tfExame");
    this.cbPaciente = document.getElementById("cbPaciente");
    this.hdExame = document.getElementById("hdExame");
    this.dtExame = document.getElementById("dtExame");
    this.cbFaturar = document.getElementById("cbFaturar");
    this.divResposta = document.getElementById("divResposta");
    this.pwSenha = document.getElementById("pwSenha");

    //this.btEnviar.onclick = this.enviar;
    this.btSair.onclick = this.sair;
  }

  //-----------------------------------------------------------------------------------------//

  async init() {
    await this.daoPaciente.abrirDB();
    this.solicitarObjs();
  }

  //-----------------------------------------------------------------------------------------//

  async solicitarObjs() {
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
        this.cbPaciente.style = "width:100%;-webkit-appearance:none;-moz-appearance:none;text-indent:1px;text-overflow: '';";
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

  enviar() {
    if (this.operacao == "Incluir") {
      this.daoPaciente.incluir(this.inputCpf.value, this.inputNome.value);
    } else if (this.operacao == "Alterar") {
      this.daoPaciente.alterar(
        this.cpfAtual,
        this.inputCpf.value,
        this.inputNome.value
      );
    } else if (this.operacao == "Excluir") {
      this.daoPaciente.exluir(this.cpfAtual);
    }
    this.solicitarObjs();
  }

  //-----------------------------------------------------------------------------------------//

  async atualizarInterface() {
    const SEPARADOR = "##"; // Usado também em app.js

    await this.arrayPacientes.forEach(e => {
      var elem = document.createElement("option");
      elem.value = e.nome + SEPARADOR + e.cpf;
      elem.text = e.nome;
      this.cbPaciente.add(elem);
    });
    this.dtExame.value = this.dataParaInput();
  }

  //-----------------------------------------------------------------------------------------//

  dataParaInput() {
    const agora = new Date();
    var d = agora.getDate();
    var m = agora.getMonth() + 1;
    var y = agora.getFullYear();
    if (d < 10) d = "0" + d;
    if (m < 10) m = "0" + m;
    return y + "-" + m + "-" + d;
  }
  
  
  //-----------------------------------------------------------------------------------------//

 tiraEspacos(item) {
  if (item == null) return "";
  var pos = item.length - 1;
  while (item[pos] == " " && pos > 0) pos--;
  return item.substr(0, pos + 1);
}

//-----------------------------------------------------------------------------------------//

 callbackPeriodo() {
  doObterPeriodo().then(retorno => {
    console.log("(app.js) callBackPeriodo retorno", retorno);
    renderObterPeriodo(retorno);
    fnTirarEspera();
  });
}

//-----------------------------------------------------------------------------------------//

 renderObterPeriodo(data) {
  if (!data) {
    console.log("(app.js) renderObterPeriodo sem conteúdo");
    return;
  }
  if (data.hasOwnProperty("erro")) {
    alert(data.erro);
    return;
  } else {
    console.log("(app.js) renderObterPeriodo -> ", data.Periodo);
    var dia = data.Periodo.substring(0, 2);
    var mes = data.Periodo.substring(3, 5);
    var ano = data.Periodo.substring(6, 10);
    dtPeriodo = ano + "-" + mes + "-" + dia;
  }
}

//-----------------------------------------------------------------------------------------//

 doObterPeriodo() {
  console.log("(app.js) Executando obterPeriodo");
  return fetch("/obterPeriodo/")
    .then(response => {
      console.log("(app.js) obterPeriodo " + response);
      return response.json();
    });
}


}
