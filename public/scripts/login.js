"use strict";

// -----------------------------------------------------------------------------------------//

const novoDaoUsuario = new Function("", "return new DaoUsuario()");
const novaViewEfetuarLogin = new Function("", "return new ViewEfetuarLogin()");
const fnMD5 = new Function("a", "return md5(a)");

// -----------------------------------------------------------------------------------------//

function UcEfetuarLogin() {
  this.viewEfetuarLogin = novaViewEfetuarLogin(this);
  this.usrApp = null;
  this.daoUsuario = novoDaoUsuario();
  this.iniciar();
}

// -----------------------------------------------------------------------------------------//

UcEfetuarLogin.prototype.iniciar = async function() {
  await this.daoUsuario.abrirDb();
  this.usrApp = await this.daoUsuario.obterUsr();
  this.viewEfetuarLogin.iniciar(this.usrApp);
}

// -----------------------------------------------------------------------------------------//

function renderEfetuarLogin(resposta) {
  if (resposta == null) {
    alert("Problemas de Conexão com o Servidor");
    return;
  }
  
  if (resposta.hasOwnProperty("erro")) {
    alert(resposta.erro);

    if (resposta.erro.includes("TIMEOUT")) {
      divInstrucao.innerHTML =
        "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";
      return;
    }

    if(usrApp == null || tfLogin.value != usrApp.login || fnMD5(tfSenha.value) != usrApp.senha) {
      divInstrucao.innerHTML = "<b>Login não autorizado</b>";
      return;
    }
  }

  if (tfLogin.value.replace(/\.|-/g, "") == usrApp.login.replace(/\.|-/g, "") && fnMD5(tfSenha.value) == usrApp.senha) {
    daoUsuario.salvarUsr(usrApp.login, usrApp.senha, usrApp.nome, usrApp.email, usrApp.celular,
      usrApp.rua, usrApp.numero, null, null, null, true);

    window.location.href = "inicio.html";
    //doGuardarUsuarioCorrente().then(retorno => {
    //  return;
    //});
  }
}

// -----------------------------------------------------------------------------------------//

function doGuardarUsuarioCorrente() {
  return fetch(
    "/guardarUsuarioCorrente/" +
      usrApp.login +
      "/" +
      usrApp.senha +
      "/" +
      usrApp.nome +
      "/" +
      usrApp.email +
      "/" +
      usrApp.celular +
      "/" +
      usrApp.rua +
      "/" +
      usrApp.numero +
      "/" +
      usrApp.complemento +
      "/" +
      usrApp.bairro +
      "/" +
      usrApp.cep,
    {
      credentials: "include"
    }
  )
    .then(response => {
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

// -----------------------------------------------------------------------------------------//

UcEfetuarLogin.prototype.verificarLogin = async function(login, senha) {
  if (this.usrApp != null && this.usrApp.login == login) {
    if (this.usrApp.senha == fnMD5(senha)) {
      return this.usrApp;
    }
  }
  let response = await fetch("/login/" + login + "/" + senha, { credentials : "include" } );
  let respJson = await response.json();
  
  if(respJson == null) {
    this.viewEfetuarLogin.notificar("Problemas de Conexão com o Servidor");
    return false;
  }
  if(respJson.hasOwnProperty("erro")) {
    this.viewEfetuarLogin.notificar(respJson.erro);

    if(respJson.erro.includes("TIMEOUT")) {
      self.divInstrucao.innerHTML = "<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>";
      return;
    }

    // if(resposta == null || this.tfLogin.value != usrApp.login || fnMD5(tfSenha.value) != usrApp.senha) {
      self.divInstrucao.innerHTML = "<b>Login não autorizado</b>";
      return;
  }
  
  if(login.replace(/\.|-/g, "") == usrApp.login.replace(/\.|-/g, "") && fnMD5(tfSenha.value) == usrApp.senha) {
    daoUsuario.salvarUsr(usrApp.login, usrApp.senha, usrApp.nome, usrApp.email, usrApp.celular,
      usrApp.rua, usrApp.numero, null, null, null, true);

    window.location.href = "inicio.html";

      
  this.usrApp = respJson;
  return respJson;
}

// -----------------------------------------------------------------------------------------//

iniciar();

