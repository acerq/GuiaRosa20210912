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
    fnColocarEspera();
    await this.daoPaciente.abrirDB();
    await this.obterLocais();
    this.atualizarInterface();
    fnTirarEspera();
  }

  //-----------------------------------------------------------------------------------------//

  async obterLocais() {
     let response = await fetch("/obterLocais/");
      if (!response.json()) {
      console.log("(app.js) renderObterLocais sem conteúdo");
      alert("Erro na conexão com o Servidor #02APP");
      return;
    }
    if (data.hasOwnProperty("erro")) {
      alert(data.erro);
      if (data.erro == "Sessão Expirada") window.location.href = "index.html";
      return;
    } else console.log("(app.js) renderObterLocais -> ", data);

    var arrayLocais = data;

    arrayLocais.sort(function(a, b) {
      var keyA = a.codigolocal;
      var keyB = b.codigolocal;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });

    new Promise((res, rej) => {
      //--- var retorno = "<option value='-1'>Selecione...</option>";
      var retorno = "";
      arrayLocais.forEach((value, index, array) => {
        var codigo = value.codigolocal;
        var descricao = value.nomelocal;
        retorno += "<option value='" + codigo + "'>" + descricao + "</option>";
        if (index === array.length - 1) res(retorno);
      });
    }).then(retorno => {
      const divLocal = document.getElementById("divLocal");
      divLocal.innerHTML =
        "<select id='cbLocal'>" + retorno + "</select></div></form>";
      $("#cbLocal")
        .select2({
          placeholder: "Selecione o local...",
          allowClear: false,
          templateResult: formatarLocal,
          templateSelection: formatarLocal
        })
        .on("select2:select", function(e) {
          codLocal = e.params.data.id;
        });
      codLocal = 0;
    });

  })
      .catch(() => {
        console.log("(app.js) obterLocais catch");
        return;
      });
    
    doObterLocais().then(retorno => {
      console.log("(app.js) callBackObterLocais retorno", retorno);
      renderObterLocais(retorno);
      callbackPeriodo();
    });
    
    
    
     formatarLocal(item) {
    var returnString =
      "<span style='font-size: 12px; padding: 0px'>" +
      this.tiraEspacos(item.text) +
      "</span>";
    var novoSpan = document.createElement("span");
    novoSpan.innerHTML = returnString;
    return novoSpan;
  }

  //-----------------------------------------------------------------------------------------//

  renderObterLocais(data) {
  }

  //-----------------------------------------------------------------------------------------//

    
  }

  //-----------------------------------------------------------------------------------------//

  doObterLocais() {
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
    await this.obterPacientes();
    await this.arrayPacientes.forEach(e => {
      var elem = document.createElement("option");
      elem.value = e.nome + SEPARADOR + e.cpf;
      elem.text = e.nome;
      this.cbPaciente.add(elem);
    });
    this.dtExame.value = this.dataParaInput();
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
    return fetch("/obterPeriodo/").then(response => {
      console.log("(app.js) obterPeriodo " + response);
      return response.json();
    });
  }

  //-----------------------------------------------------------------------------------------//

 
  callbackConsultarExames() {
    if (codLocal == null) {
      alert("Não foi indicado o local para realização do exame.");
      return;
    }
    fnColocarEspera();
    tfExame.value = tfExame.value.toUpperCase();
    var strExame = tfExame.value;
    // chama doObterExames e atualiza a tela
    doObterExames(codLocal, strExame).then(retorno => {
      console.log("(app.js) callBackConsultarExames retorno", retorno);
      renderObterExames(retorno);
    });
  }

  //-----------------------------------------------------------------------------------------//

  doObterExames(local, exame) {
    console.log("(app.js) Executando ObterExames");
    return fetch("/obterExames/" + local + "/" + exame)
      .then(response => {
        console.log("(app.js) ObterExames response");
        return response.json();
      })
      .catch(() => {
        console.log("(app.js) ObterExames catch");
        return null;
      });
  }

  //-----------------------------------------------------------------------------------------//

  formatarSelecao(item) {
    var returnString;
    if (item.text == "Selecione...")
      returnString =
        "<span style='font-size: 14px;'><br/><b>Selecione...</b></span>";
    else {
      var selectionText = item.text.split(SEPARADOR);
      returnString =
        "<span style='font-size: 12px;'><b>" +
        tiraEspacos(selectionText[0]) +
        "</b><br/>" +
        tiraEspacos(selectionText[1]) +
        "<br/>R$ " +
        tiraEspacos(selectionText[3]) +
        "</span>";
    }
    var novoSpan = document.createElement("span");
    novoSpan.innerHTML = returnString;
    return novoSpan;
  }

  formatarItens(item) {
    var returnString;
    if (item.text == "Selecione...")
      returnString =
        "<span style='font-size: 14px;'><b>Selecione...</b></span>";
    else {
      var selectionText = item.text.split(SEPARADOR);
      returnString =
        "<span style='font-size: 12px;'><b>" +
        tiraEspacos(selectionText[0]) +
        "</b><br/>" +
        tiraEspacos(selectionText[1]) +
        "<br/>" +
        tiraEspacos(selectionText[2]) +
        "<br/>R$ " +
        tiraEspacos(selectionText[3]) +
        "</span>";
    }
    var novoSpan = document.createElement("span");
    novoSpan.innerHTML = returnString;
    return novoSpan;
  }

  renderObterExames(data) {
    if (!data) {
      console.log("(app.js) renderObterExames sem conteúdo");
      alert("Erro na conexão com o Servidor #03APP");
      fnTirarEspera();
      return;
    }
    if (data.hasOwnProperty("erro")) {
      alert(data.erro);
      fnTirarEspera();
      return;
    } else console.log("(app.js) renderObterExames -> ", data);

    var arrayExames = data;
    var arrayExames = JSON.parse(data);
    if (arrayExames == null || arrayExames.length == 0) {
      fnTirarEspera();
      alert(
        "Nenhum exame encontrado\ncom os parâmetros informados.\nTente novamente."
      );
      return;
    }

    new Promise((res, rej) => {
      arrayExames.sort(function(a, b) {
        var keyA = a.exame;
        var keyB = b.exame;
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });

      //var retorno = "<option value='-1'>Selecione...</option>";

      var retorno = "";
      arrayExames.forEach((value, index, array) => {
        let codExecutante = value.id_executante;
        let codExame = value.cd_exame;
        var descricao =
          tiraEspacos(value.exame) +
          SEPARADOR +
          tiraEspacos(value.nome_executante) +
          SEPARADOR +
          tiraEspacos(value.endereco) +
          SEPARADOR +
          value.valor;
        retorno +=
          "<option value='" +
          codExecutante +
          SEPARADOR +
          codExame +
          "'>" +
          descricao +
          "</option>";
        if (index === array.length - 1) res(retorno);
      });
    }).then(retorno => {
      const divExame = document.getElementById("divExame");

      divExame.style = "height:66px";

      divExame.innerHTML = "<select id='cbExame'>" + retorno + "</select>";
      $("#cbExame")
        .select2({
          placeholder: "Selecione os exames...",
          allowClear: false,
          templateResult: formatarItens,
          templateSelection: formatarSelecao
        })
        .on("select2:select", function(e) {
          var selectionText = e.params.data.id.split(SEPARADOR);
          codExecutante = selectionText[0];
          codExame = selectionText[1];
        });

      var element = document.querySelector(
        '[aria-labelledby="select2-cbExame-container"]'
      );
      element.style = "height:56px;";

      element = document.getElementById("select2-cbExame-container");
      element.style = "line-height:16px;";
      fnTirarEspera();
    });
  }
}
