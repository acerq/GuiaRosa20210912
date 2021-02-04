"use strict";

// -----------------------------------------------------------------------------------------//
var self;

function ViewEfetuarLogin(ctrl) {
  self = this;
  this.ctrlEfetuarLogin = ctrl;
  this.estadoBtNovo = "Login";
  this.divConteudo = document.getElementById("divConteudo");
  this.divInstrucao = document.getElementById("divInstrucao");
  this.tfLogin = document.getElementById("tfLogin");
  this.tfSenha = document.getElementById("tfSenha");
  this.btOk = document.getElementById("btOk");
  this.btNovo = document.getElementById("btNovo");
  this.labelLogin = document.getElementById("lbLogin");
  
  this.btOk.addEventListener("click", this.callbackOk);
  this.btNovo.addEventListener("click", this.callbackCriar);
  this.tfSenha.addEventListener("keyup", function(event) {
    if(event.keyCode === 13) {
      self.callbackOk();
    }
  });
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.iniciar = async function(usrApp) {
  if(usrApp != null) {
    this.tfLogin.value = usrApp.login;
    this.tfLogin.disabled = true;
    this.btNovo.textContent = "Novo Login";
    this.estadoBtNovo = "Login";

    if (usrApp.ehMedico == true) {
      this.labelLogin.innerHTML = "Login (Médico):";
    } else {
      this.labelLogin.innerHTML = "CPF:";
    }  
  }
  else {
    this.tfLogin.disabled = false;
    this.btNovo.textContent = "Nova Conta";
    this.estadoBtNovo = "Conta";
    this.instalacaoApp();
  }
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.instalacaoApp = function() {
  this.divInstrucao.innerHTML =
    "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.callbackOk = async function() {
  self.colocarEspera();
  let resposta = self.ctrl.verificarLogin(self.tfLogin.value, self.tfSenha.value);
  if (resposta == null) {
    alert("Problemas de Conexão com o Servidor");
    return;
  }
  if(resposta.hasOwnProperty("erro")) {
    alert(resposta.erro);

    if(resposta.erro.includes("TIMEOUT")) {
      self.divInstrucao.innerHTML = "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";
      return;
    }

    // if(resposta == null || this.tfLogin.value != usrApp.login || fnMD5(tfSenha.value) != usrApp.senha) {
      self.divInstrucao.innerHTML = "<b>Login não autorizado</b>";
      return;
  }

  if (tfLogin.value.replace(/\.|-/g, "") == usrApp.login.replace(/\.|-/g, "") && fnMD5(tfSenha.value) == usrApp.senha) {
    daoUsuario.salvarUsr(usrApp.login, usrApp.senha, usrApp.nome, usrApp.email, usrApp.celular,
      usrApp.rua, usrApp.numero, null, null, null, true);

    window.location.href = "inicio.html";
    //doGuardarUsuarioCorrente().then(retorno => {
    //  return;
    //});
  }

  
  this.retirarEspera();

  // chama efetuarLogin e atualiza a tela
  let retorno = await doEfetuarLogin(login, senha);
  renderEfetuarLogin(retorno);
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.colocarEspera = function() {
  $("div.circle").addClass("wait");
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.retirarEspera = function() {
  $("div.circle").removeClass("wait");
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.notificar = function(msg) {
  alert(msg);
}

// -----------------------------------------------------------------------------------------//

ViewEfetuarLogin.prototype.apresentarInstrucao = function(msg) {
    self.divInstrucao.innerHTML = "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";

}

// -----------------------------------------------------------------------------------------//

  ViewEfetuarLogin.prototype.callbackCriar = function () {
  if (this.estadoBtNovo == "Conta") 
    window.location.href = "cadusuario.html";
  else {
    // estadoBtNovo == "Login";
    this.labelLogin.innerHTML = "Login:";
    tfLogin.value = "";
    tfLogin.disabled = false;
    btNovo.textContent = "Nova Conta";
    estadoBtNovo = "Conta";
    divInstrucao.innerHTML =
      "<center><b>Efetue seu Login ou Crie sua Conta</b></center>";
  }
}

// -----------------------------------------------------------------------------------------//


// -----------------------------------------------------------------------------------------//

