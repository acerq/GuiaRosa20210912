"use strict";

import DaoPaciente from "./dao_paciente.js";

const SEPARADOR = "##";
const funcaoMD5 = new Function("a", "return md5(a)");
const funcaoObterUsuario = new Function("b", "return usrApp.login");
const fnTirarEspera = new Function("tirarEspera()");
const fnColocarEspera = new Function("colocarEspera()");

export default class ViewSolicitacao {
  constructor(ctrlSolicitacao) {
    this.ctrl = ctrlSolicitacao;

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
    
    this.codLocalSelecionado = -1;
  }

  //-----------------------------------------------------------------------------------------//

  async init() {
    fnColocarEspera();
    this.atualizarInterface();
    fnTirarEspera();
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

  async atualizarInterface(arrayPacientes, arrayLocais) {
    
    //---- Formata a combobox de pacientes ----//
    await arrayPacientes.forEach(e => {
      var elem = document.createElement("option");
      elem.value = e.nome + SEPARADOR + e.cpf;
      elem.text = e.nome;
      this.cbPaciente.add(elem);
    });
    this.dtExame.value = this.dataParaInput();

  
    //---- Formata a combobox de locais ----//
    let optionsLocais = await new Promise((resolve, reject) => {
      //--- var retorno = "<option value='-1'>Selecione...</option>";
      var retorno = "";
      arrayLocais.forEach((value, index, array) => {
        var codigo = value.codigolocal;
        var descricao = value.nomelocal;
        retorno += "<option value='" + codigo + "'>" + descricao + "</option>";
        if (index === array.length - 1) 
          resolve(retorno);
      });
    });
    
    const divLocal = document.getElementById("divLocal");
    divLocal.innerHTML = "<select id='cbLocal'>" + optionsLocais + "</select></div></form>";
    $("#cbLocal")
      .select2({
      placeholder: "Selecione o local...",
      allowClear: false,
      templateResult: this.formatarLocal,
      templateSelection: this.formatarLocal
    }).on("select2:select", function(e) {
      this.codLocalSelecionado = e.params.data.id;
    });
    this.codLocalSelecionado = -1;
  }

//-----------------------------------------------------------------------------------------//

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
