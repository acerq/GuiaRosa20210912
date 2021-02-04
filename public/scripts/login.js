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
      this.viewEfetuarLogin.colocarInstrucao("<b>Tempo de Conexão Excedido<br/>com o Servidor. Tente mais tarde.</b>");
      return false;
    }

    if(respJson == null || login != this.usrApp.login || fnMD5(senha) != this.usrApp.senha) {
      this.viewEfetuarLogin.colocarInstrucao("<b>Login não autorizado</b>");
      return;
  }
  
  this.usrApp = respJson;
  this.daoUsuario.salvarUsr(this.usrApp.login, this.usrApp.senha, this.usrApp.nome, this.usrApp.email, 
                            thisusrApp.celular, this.usrApp.rua, this.usrApp.numero, null, null, null, true);

  //if(login.replace(/\.|-/g, "") == this.usrApp.login.replace(/\.|-/g, "") && 
  //fnMD5(tfSenha.value) == usrApp.senha) 

    
  return true;
}

// -----------------------------------------------------------------------------------------//

iniciar();

