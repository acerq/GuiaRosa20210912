"use strict";

import DaoPaciente from "/scripts/dao_paciente.js";

var view;

export default class ViewPaciente {
  constructor() {
    this.daoPaciente = new DaoPaciente();

    this.arrayPacientes = [];
    this.operacao = "Navegar";
    this.posAtual = -1;
    this.cpfAtual = null;

    this.btSalvar = document.getElementById("btSalvar");
    this.btCancelar = document.getElementById("btCancelar");

    this.divNavegacao = document.getElementById("divNavegacao");
    this.btPrimeiro = document.getElementById("btPrimeiro");
    this.btAnterior = document.getElementById("btAnterior");
    this.btProximo = document.getElementById("btProximo");
    this.btUltimo = document.getElementById("btUltimo");

    this.btIncluir = document.getElementById("btIncluir");
    this.btAlterar = document.getElementById("btAlterar");
    this.btExcluir = document.getElementById("btExcluir");
    this.btSair = document.getElementById("btSair");

    this.divMensagem = document.getElementById("divMensagem");
    this.inputCpf = document.getElementById("tfCpf");
    this.inputNome = document.getElementById("tfNome");
    this.inputCelular = document.getElementById("tfCelular");
    this.inputEmail = document.getElementById("tfEmail");
    this.inputEndereco = document.getElementById("tfEndereco");

    this.btSalvar.onclick = this.salvar;
    this.btCancelar.onclick = this.cancelar;
    this.btPrimeiro.onclick = this.primeiro;
    this.btAnterior.onclick = this.anterior;
    this.btProximo.onclick = this.proximo;
    this.btUltimo.onclick = this.ultimo;
    this.btIncluir.onclick = this.incluir;
    this.btAlterar.onclick = this.alterar;
    this.btExcluir.onclick = this.excluir;
    this.btSair.onclick = this.sair;

    $(document).ready(function() {
      $("#tfCpf").mask("999.999.999-99");
      $("#tfCelular").mask("(99) 9999-9999?9");
    });
  }

  //-----------------------------------------------------------------------------------------//

  init() {
    this.daoPaciente.abrirDB(this.solicitarObjs);
  }

  //-----------------------------------------------------------------------------------------//

  solicitarObjs() {
    this.arrayPacientes = this.daoPaciente.obterPacientes(this.receberObjs);
  }

  //-----------------------------------------------------------------------------------------//

  receberObjs(array) {
    this.arrayPacientes = array;
    if (this.arrayPacientes.length > 0) {
      this.posAtual = 0;
    } else {
      this.posAtual = -1;
      this.cpfAtual = null;
    }
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  incluir() {
    if (this.operacao == "Navegar") {
      this.inabilitarBotoes();
      this.inputCpf.value = "";
      this.inputNome.value = "";
      this.inputCelular.value = "";
      this.inputEmail.value = "";
      this.inputEndereco.value = "";
      this.divMensagem.innerHTML = "<center>Incluindo...</center><hr/>";
      this.operacao = "Incluir";
    }
  }

  //-----------------------------------------------------------------------------------------//

  alterar() {
    if (this.operacao == "Navegar") {
      this.inabilitarBotoes();
      this.divMensagem.innerHTML = "<center>Alterando...</center><hr/>";
      this.operacao = "Alterar";
    }
  }

  //-----------------------------------------------------------------------------------------//

  excluir() {
    if (this.operacao == "Navegar") {
      this.inabilitarBotoes();
      this.divMensagem.innerHTML = "<center>Confirmar Exclusão?</center><hr/>";
      this.operacao = "Excluir";
      this.btSalvar.textContent = "Excluir";
    }
  }

  //-----------------------------------------------------------------------------------------//

  salvar() {
    let commit = false;
    if (this.operacao == "Incluir") {
      commit = this.daoPaciente.incluir(
        this.inputCpf.value,
        this.inputNome.value,
        this.inputCelular.value,
        this.inputEmail.value,
        this.inputEndereco.value
      );
    } else if (this.operacao == "Alterar") {
      commit = this.daoPaciente.alterar(
        this.cpfAtual,
        this.inputCpf.value,
        this.inputNome.value,
        this.inputCelular.value,
        this.inputEmail.value,
        this.inputEndereco.value
      );
    } else if (this.operacao == "Excluir") {
      commit = this.daoPaciente.excluir(this.cpfAtual);
    }
    if(commit)
      this.solicitarObjs();
  }

  //-----------------------------------------------------------------------------------------//

  primeiro() {
    this.posAtual = 0;
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  anterior() {
    this.posAtual--;
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  proximo() {
    this.posAtual++;
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  ultimo() {
    this.posAtual = this.arrayPacientes.length - 1;
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  cancelar() {
    this.atualizarInterface();
  }

  //-----------------------------------------------------------------------------------------//

  sair() {
    history.back();
  }

  //-----------------------------------------------------------------------------------------//

  restaurarFuncoes() {
    this.divNavegacao.hidden = false;

    this.btIncluir.disabled = false;
    this.btAlterar.disabled = false;
    this.btExcluir.disabled = false;
    this.inputCpf.disabled = true;
    this.inputNome.disabled = true;
    this.inputCelular.disabled = true;
    this.inputEmail.disabled = true;
    this.inputEndereco.disabled = true;

    this.btAlterar.hidden = false;
    this.btIncluir.hidden = false;
    this.btExcluir.hidden = false;
    this.btPrimeiro.hidden = false;
    this.btAnterior.hidden = false;
    this.btProximo.hidden = false;
    this.btUltimo.hidden = false;

    this.btCancelar.hidden = true;
    this.btSalvar.hidden = true;
    this.operacao = "Navegar";
  }

  //-----------------------------------------------------------------------------------------//

  inabilitarBotoes() {
    this.divNavegacao.hidden = true;

    this.btAlterar.disabled = true;
    this.btIncluir.disabled = true;
    this.btExcluir.disabled = true;
    this.btPrimeiro.disabled = true;
    this.btAnterior.disabled = true;
    this.btProximo.disabled = true;
    this.btUltimo.disabled = true;

    this.btAlterar.hidden = true;
    this.btIncluir.hidden = true;
    this.btExcluir.hidden = true;

    this.btPrimeiro.hidden = true;
    this.btAnterior.hidden = true;
    this.btProximo.hidden = true;
    this.btUltimo.hidden = true;

    this.btCancelar.hidden = false;
    this.btSalvar.hidden = false;
    this.inputCpf.disabled = false;
    this.inputNome.disabled = false;
    this.inputCelular.disabled = false;
    this.inputEmail.disabled = false;
    this.inputEndereco.disabled = false;
  }

  //-----------------------------------------------------------------------------------------//
  atualizarInterface() {
    var mostrarDivNavegacao = false;

    this.restaurarFuncoes();
    if (this.posAtual > 0) {
      this.btPrimeiro.disabled = false;
      this.btAnterior.disabled = false;
      mostrarDivNavegacao = true;
    } else {
      this.btPrimeiro.disabled = true;
      this.btAnterior.disabled = true;
    }
    if (this.posAtual < this.arrayPacientes.length - 1) {
      this.btProximo.disabled = false;
      this.btUltimo.disabled = false;
      mostrarDivNavegacao = true;
    } else {
      this.btProximo.disabled = true;
      this.btUltimo.disabled = true;
    }

    if (this.posAtual > -1) {
      this.cpfAtual = this.arrayPacientes[this.posAtual].cpf;
      this.inputCpf.value = this.arrayPacientes[this.posAtual].cpf;
      this.inputNome.value = this.arrayPacientes[this.posAtual].nome;
      this.inputCelular.value = this.arrayPacientes[this.posAtual].celular;
      this.inputEmail.value = this.arrayPacientes[this.posAtual].email;
      this.inputEndereco.value = this.arrayPacientes[this.posAtual].endereco;
      this.btAlterar.disabled = false;
      this.btExcluir.disabled = false;
    } else {
      this.inputCpf.value = "";
      this.inputNome.value = "";
      this.inputCelular.value = "";
      this.inputEmail.value = "";
      this.inputEndereco.value = "";
      this.btAlterar.disabled = true;
      this.btExcluir.disabled = true;
    }
    this.divMensagem.innerHTML = "<p><center>Cadastro de Pacientes</center></p><hr/>";
    if (!mostrarDivNavegacao) 
    	this.divNavegacao.hidden = true;
    this.btSalvar.textContent = "Salvar";
  }

  //-----------------------------------------------------------------------------------------//
}

view = new ViewPaciente();
this.init();
