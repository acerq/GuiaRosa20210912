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

    this.btSair.onclick = this.sair;
    this.btSair.onclick = this.enviarSolicitacao;

    this.codLocalSelecionado = -1;

    $(document).on("keypress", "input", function(e) {
      if (e.which == 13 && e.target == this.tfExame) {
        if (this.codLocalSelecionado == null) {
          alert("Não foi indicado o local para realização do exame.");
        }
        this.ctrl.callbackConsultarExames();
      }
    });
    this.pwSenha.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        this.ctrl.callbackSolicitacao();
      }
    });
  }

  //-----------------------------------------------------------------------------------------//

  async init() {
    fnColocarEspera();
    this.atualizarInterface();
    fnTirarEspera();
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
        if (index === array.length - 1) resolve(retorno);
      });
    });

    const divLocal = document.getElementById("divLocal");
    divLocal.innerHTML =
      "<select id='cbLocal'>" + optionsLocais + "</select></div></form>";
    $("#cbLocal")
      .select2({
        placeholder: "Selecione o local...",
        allowClear: false,
        templateResult: this.formatarLocal,
        templateSelection: this.formatarLocal
      })
      .on("select2:select", function(e) {
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

  async obterExames() {
    fnColocarEspera();
    this.tfExame.value = this.tfExame.value.toUpperCase();
    var strExame = this.tfExame.value;
    // chama doObterExames e atualiza a tela
    doObterExames(codLocal, strExame).then(retorno => {
      console.log("(app.js) callBackConsultarExames retorno", retorno);
      renderObterExames(retorno);
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
        this.tiraEspacos(selectionText[0]) +
        "</b><br/>" +
        this.tiraEspacos(selectionText[1]) +
        "<br/>R$ " +
        this.tiraEspacos(selectionText[3]) +
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
        this.tiraEspacos(selectionText[0]) +
        "</b><br/>" +
        this.tiraEspacos(selectionText[1]) +
        "<br/>" +
        this.tiraEspacos(selectionText[2]) +
        "<br/>R$ " +
        this.tiraEspacos(selectionText[3]) +
        "</span>";
    }
    var novoSpan = document.createElement("span");
    novoSpan.innerHTML = returnString;
    return novoSpan;
  }

  //-----------------------------------------------------------------------------------------//

  atualizarExames(arrayExames) {
    if (arrayExames == null || arrayExames.length == 0) {
      alert(
        "Nenhum exame encontrado\ncom os parâmetros informados.\nTente novamente."
      );
      return;
    }
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
          this.tiraEspacos(value.exame) +
          SEPARADOR +
          this.tiraEspacos(value.nome_executante) +
          SEPARADOR +
          this.tiraEspacos(value.endereco) +
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
          templateResult: this.formatarItens,
          templateSelection: this.formatarSelecao
        })
        .on("select2:select", function(e) {
          var selectionText = e.params.data.id.split(SEPARADOR);
          this.codExecutante = selectionText[0];
          this.codExame = selectionText[1];
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
  
  enviarSolicitacao() {
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
      console.log(
        "(app.js) callBackSolicitacao retorno verificarSenha",
        retorno
      );
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
  sair() {
    history.go(-1);
  }
}

//-----------------------------------------------------------------------------------------//
